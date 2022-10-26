import { MeshLoader } from "./MeshLoader.js";

export class ObjectRenderer {

	constructor(name, filePath, center = { x: 0, y: 0, z: 0 }, mtlPath = null) {
		console.log("Generated object renderer for " + name + " from " + filePath);
		this.name = name;
		this.filePath = filePath;
		this.center = center;
		if (mtlPath) this.mtlPath = mtlPath;
	}

	async loadMesh(gl) {
		console.log("Loading mesh " + this.name + " from " + this.filePath + (this.mtlPath ? " with MTL file " + this.mtlPath : ""));
		// Load OBJ file
		const objResponse = await fetch(this.filePath);
		const objText = await objResponse.text();
		const obj = MeshLoader.parseOBJ(objText);

		// Load MTL file
		const baseHref = new URL(this.filePath, window.location.href);
		let materials;
		if (!this.mtlPath) {
			const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
				const matHref = new URL(filename, baseHref).href;
				const response = await fetch(matHref);
				return await response.text();
			}));
			materials = MeshLoader.parseMTL(matTexts.join('\n'));
		} else {
			console.log("Loading manually defined MTL file " + this.mtlPath);
			const mtlResponse = await fetch(this.mtlPath);
			const mtlText = await mtlResponse.text();
			materials = MeshLoader.parseMTL(mtlText);
		}


		const textures = {
			defaultWhite: MeshLoader.create1PixelTexture(gl, [255, 255, 255, 255]),
			defaultNormal: MeshLoader.create1PixelTexture(gl, [127, 127, 255, 0]),
		};

		const defaultMaterial = {
			diffuse: [1, 1, 1],
			diffuseMap: textures.defaultWhite,
			normalMap: textures.defaultNormal,
			ambient: [0, 0, 0],
			specular: [1, 1, 1],
			specularMap: textures.defaultWhite,
			shininess: 400,
			opacity: 1,
		};

		// load texture for materials
		for (const material of Object.values(materials)) {
			Object.entries(material)
				.filter(([key]) => key.endsWith('Map'))
				.forEach(([key, filename]) => {
					let texture = textures[filename];
					if (!texture) {
						const textureHref = new URL(filename, baseHref).href;
						texture = MeshLoader.createTexture(gl, textureHref);
						textures[filename] = texture;
					}
					material[key] = texture;
				});
		}

		this.parts = obj.geometries.map(({ material, data }) => { // Since each geometry has it's own buffer, we have to load them separately
			// Because data is just named arrays like this
			//
			// {
			//   position: [...],
			//   texcoord: [...],
			//   normal: [...],
			// }
			//
			// and because those names match the attributes in our vertex
			// shader we can pass it directly into `createBufferInfoFromArrays`
			// from the article "less code more fun".

			if (data.color) {
				if (data.position.length === data.color.length) {
					// it's 3. The our helper library assumes 4 so we need
					// to tell it there are only 3.
					data.color = { numComponents: 3, data: data.color };
				}
			} else {
				// there are no vertex colors so just use constant white
				data.color = { value: [1, 1, 1, 1] };
			}

			// generate tangents if we have the data to do so.
			if (data.texcoord && data.normal) {
				data.tangent = MeshLoader.generateTangents(data.position, data.texcoord);
			} else {
				// There are no tangents
				data.tangent = { value: [1, 0, 0] };
			}

			if (!data.texcoord) {
				data.texcoord = { value: [0, 0] };
			}

			if (!data.normal) {
				// we probably want to generate normals if there are none
				data.normal = { value: [0, 0, 1] };
			}

			// create a buffer for each array by calling
			// gl.createBuffer, gl.bindBuffer, gl.bufferData
			const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
			return {
				material: {
					...defaultMaterial,
					...materials[material],
				},
				bufferInfo,
			};
		});

		console.log("Loaded mesh for " + this.name + ". ", this);
	}

	render(gl, meshProgramInfo, time) {
		const cameraTarget = [0, 0, 0];
		const cameraPosition = [15, 15, 15];
		const zNear = 0.1;
		const zFar = 50;

		function degToRad(deg) {
			return deg * Math.PI / 180;
		}

		const fieldOfViewRadians = degToRad(60);
		const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

		const up = [0, 1, 0];
		// Compute the camera's matrix using look at.
		const camera = m4.lookAt(cameraPosition, cameraTarget, up);

		// Make a view matrix from the camera matrix.
		const view = m4.inverse(camera);

		const sharedUniforms = {
			u_lightDirection: m4.normalize([-1, 3, 5]),
			u_view: view,
			u_projection: projection,
			u_viewWorldPosition: cameraPosition,
		};

		gl.useProgram(meshProgramInfo.program);

		// calls gl.uniform
		webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

		// compute the world matrix once since all parts
		// are at the same space.
		let u_world = m4.identity();

		// Handle object rotation
		//u_world = m4.xRotate(u_world, time);
		//u_world = m4.yRotate(u_world, time);
		//u_world = m4.zRotate(u_world, time);

		// Handle object translation
		if (this.center.x != 0 || this.center.y != 0 || this.center.z != 0) {
			u_world = m4.translate(u_world, this.center.x, this.center.y, this.center.z);
		}

		for (const { bufferInfo, material } of this.parts) {

			// calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
			webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);

			// calls gl.uniform
			webglUtils.setUniforms(meshProgramInfo, {
				u_world,
			}, material);

			// calls gl.drawArrays or gl.drawElements
			webglUtils.drawBufferInfo(gl, bufferInfo);
		}

	}
}