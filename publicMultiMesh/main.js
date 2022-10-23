// https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html

function parseOBJ(text) {
	// Parse the OBJ file removing comments and empty lines

	// because indices are base 1 let's just fill in the 0th data
	const objPositions = [[0, 0, 0]];
	const objTexcoords = [[0, 0]];
	const objNormals = [[0, 0, 0]];
	const objColors = [[0, 0, 0]]; // There can be non standard obj formats that have v <x> <y> <z> <red> <green> <blue>

	// Object representation
	// same order as `f` indices
	const objVertexData = [
		objPositions,
		objTexcoords,
		objNormals,
		objColors,
	];

	// WebGL representation of the object
	// same order as `f` indices
	let webglVertexData = [
		[],   // positions
		[],   // texcoords
		[],   // normals
		[],   // colors
	];

	// Neede to parse mtl
	// Since each geometry must be parsed independently in order to apply right mtl, we split the object in an array of geometries
	const materialLibs = [];
	const geometries = [];
	let geometry;
	let groups = ['default']; // g keyword
	let material = 'default';
	let object = 'default'; // o keyword

	const noop = () => {}; // Used to ignore keywords

	function newGeometry() {
		// If there is an existing geometry and it's
		// not empty then start a new one.
		if (geometry && geometry.data.position.length) {
			geometry = undefined;
		}
	}

	function setGeometry() {
		if (!geometry) {
			const position = [];
			const texcoord = [];
			const normal = [];
			const color = [];
			webglVertexData = [
				position,
				texcoord,
				normal,
				color,
			];
			geometry = {
				object,
				groups,
				material,
				data: {
					position,
					texcoord,
					normal,
					color,
				},
			};
			geometries.push(geometry);
		}
	}
	// End Neede to parse mtl

	function addVertex(vert) { //TODO: WTF???
		const ptn = vert.split('/');
		ptn.forEach((objIndexStr, i) => {
			if (!objIndexStr) {
				return;
			}
			const objIndex = parseInt(objIndexStr);
			const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
			webglVertexData[i].push(...objVertexData[i][index]);
			// Handle non standard obj format with colors
			// if this is the position index (index 0) and we parsed
			// vertex colors then copy the vertex colors to the webgl vertex color data
			if (i === 0 && objColors.length > 1) {
				geometry.data.color.push(...objColors[index]);
			}
		});
	}

	// Keywords:
	// v: vertex position
	// vt: texture coordinate
	// vn: vertex normal
	// f: face (each element is an index in the above arrays)
	// The indices are 1 based if positive or relative to the number of vertices parsed so far if negative.
	// The order of the indices are position/texcoord/normal and that all except the position are optional
	// usemtl: material name
	// mtllib: material library (file containing the materials *.mtl)
	// o: object name
	// s: smooth shading (0 or 1)
	const keywords = {
		v(parts) {// Convert the string to a float and add it to the positions array
			// if there are more than 3 values here they are vertex colors
			if (parts.length > 3) {
				objPositions.push(parts.slice(0, 3).map(parseFloat));
				objColors.push(parts.slice(3).map(parseFloat));
			} else {
				objPositions.push(parts.map(parseFloat));
			}
		},
		vn(parts) {
			objNormals.push(parts.map(parseFloat)); // Convert the string to a float and add it to the normals array
		},
		vt(parts) {
			objTexcoords.push(parts.map(parseFloat)); // Convert the string to a float and add it to the texture coordinates array
		},
		f(parts) { // WebGL only works with triangles, we have to convert the faces to triangles
			setGeometry(); // Since usemtl is optional, we create a new geometry if we can't find one
			const numTriangles = parts.length - 2;
			for (let tri = 0; tri < numTriangles; ++tri) {
				addVertex(parts[0]);
				addVertex(parts[tri + 1]);
				addVertex(parts[tri + 2]);
			}
		},
		s: noop, // Ignore shading TODO: Sicuro di poterlo ignorare?
		mtllib(parts, unparsedArgs) {
			// the spec says there can be multiple filenames here
			// but many exist with spaces in a single filename
			materialLibs.push(unparsedArgs);
		},
		usemtl(parts, unparsedArgs) {
			material = unparsedArgs;
			newGeometry();
		},
		g(parts) {
			groups = parts;
			newGeometry();
		}, // TODO: In verità non me ne faccio niente quindi potrebbe essere una noop?
		o(parts, unparsedArgs) {
			object = unparsedArgs;
			newGeometry();
		},
	};

	const keywordRE = /(\w*)(?: )*(.*)/; // Match a keyword at the start of a line followed by a list of arguments regexr.com/70n6l
	const lines = text.split('\n'); // Split the text into lines using \n

	for (let lineNo = 0; lineNo < lines.length; ++lineNo) { // Loop through all the lines

		const line = lines[lineNo].trim(); // Trim the line removing whitespaces at the beginning and end
		if (line === '' || line.startsWith('#')) { // Ignore empty lines and comments
			continue;
		}

		const m = keywordRE.exec(line); // Split the line into keyword and arguments using keywordRE
		if (!m) { // If the split failed, ignore the line
			continue;
		}

		const [, keyword, unparsedArgs] = m;
		const parts = line.split(/\s+/).slice(1); // Split the line using whitespaces and ignore the first element (the keyword) FIXME: Non ho capito perchè visto che ottiene lo stesso di keywordRE.exec(line)
		const handler = keywords[keyword]; // Look up the keyword in the keywords object and call the corresponding function

		if (!handler) { // If the keyword does not match any function, log a warning and continue
			console.warn('unhandled keyword:', keyword, 'at line', lineNo + 1);
			continue;
		}

		handler(parts, unparsedArgs); // Call the function with the arguments
	}

	// remove any arrays that have no entries.
	for (const geometry of geometries) {
		geometry.data = Object.fromEntries(
			Object.entries(geometry.data).filter(([, array]) => array.length > 0));
	}

	return {
		geometries,
		materialLibs,
	};
}

async function main() {
	// Get A WebGL context
	/** @type {HTMLCanvasElement} */
	const canvas = document.querySelector("#canvas");
	const gl = canvas.getContext("webgl");
	if (!gl) {
		return;
	}

	const vs = `
	attribute vec4 a_position;
	attribute vec3 a_normal;
	attribute vec4 a_color;
	 
	uniform mat4 u_projection;
	uniform mat4 u_view;
	uniform mat4 u_world;
	 
	varying vec3 v_normal;
	varying vec4 v_color;
	 
	void main() {
	  gl_Position = u_projection * u_view * u_world * a_position;
	  v_normal = mat3(u_world) * a_normal;
	  v_color = a_color;
	}
	`;

	const fs = `
	precision mediump float;
	 
	varying vec3 v_normal;
	varying vec4 v_color;
	 
	uniform vec4 u_diffuse;
	uniform vec3 u_lightDirection;
	 
	void main () {
	  vec3 normal = normalize(v_normal);
	  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
	  vec4 diffuse = u_diffuse * v_color;
	  gl_FragColor = vec4(diffuse.rgb * fakeLight, diffuse.a);
	}
	`;

	// compiles and links the shaders, looks up attribute and uniform locations
	const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

	const response = await fetch('./chair.obj');  /* webglfundamentals: url */
	const text = await response.text();
	const obj = parseOBJ(text);
	console.log(obj);

	const parts = obj.geometries.map(({ data }) => { // Since each geometry has it's own buffer, we have to load them separately
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

		// create a buffer for each array by calling
		// gl.createBuffer, gl.bindBuffer, gl.bufferData
		const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);
		return {
			material: {
				u_diffuse: [1, 1, 1, 1],
			},
			bufferInfo,
		};
	});


	const cameraTarget = [0, 0, 0];
	const cameraPosition = [0, 15, 10];
	const zNear = 0.1;
	const zFar = 50;

	function degToRad(deg) {
		return deg * Math.PI / 180;
	}

	function render(time) {
		time *= 0.001;  // convert to seconds

		webglUtils.resizeCanvasToDisplaySize(gl.canvas);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);

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
		};

		gl.useProgram(meshProgramInfo.program);

		// calls gl.uniform
		webglUtils.setUniforms(meshProgramInfo, sharedUniforms);

		// compute the world matrix once since all parts
		// are at the same space.
		const u_world = m4.yRotation(time);

		for (const { bufferInfo, material } of parts) {

			// calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
			webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);

			// calls gl.uniform
			webglUtils.setUniforms(meshProgramInfo, {
				u_world,
				u_diffuse: material.u_diffuse,
			});

			// calls gl.drawArrays or gl.drawElements
			webglUtils.drawBufferInfo(gl, bufferInfo);
		}

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}


main();