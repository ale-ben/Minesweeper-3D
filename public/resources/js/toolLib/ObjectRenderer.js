export class ObjectRenderer {
	constructor(name, sourceMesh, center = { x: 0, y: 0, z: 0 }) {
		this.name = name;
		this.center = center;
		this.renderProperties = {
			mesh: { sourceMesh: sourceMesh },
			positions: [],
			normals: [],
			texcoords: [],
			numVertices: 0,
			ambient: [], //Ka,
			diffuse: [], //Kd,
			specular: [], //Ks,
			emissive: [], //Ke,
			shininess: [], //Ns,
			opacity: [], //Ni,
			oldCenter: null,
		};
		this.properties = {
			visible: true,
			rotating: true
		}
		console.log("ObjectRepresentation " + this.name + " created");
		console.log(this);
	}

	loadMesh(gl) {
		console.log("Loading mesh for " + this.name);
		LoadMesh(gl, this);
		this.compute_position();
		console.log(this)
		console.log("Mesh loaded for " + this.name);
	}

	// Needed to move the object 
	// The function re generates all the vertex positions
	compute_position() {
		console.log("Re evaluating positions for " + this.name + ".\n New center: " + this.center.x + ", " + this.center.y + ", " + this.center.z);
		for (let i = 0; i < this.renderProperties.positions.length; i += 3) {
			this.renderProperties.positions[i] += parseFloat(this.center.z);
			this.renderProperties.positions[i + 1] += parseFloat(this.center.x);
			this.renderProperties.positions[i + 2] += parseFloat(this.center.y);
		}
	}

	render(time, gl, program) {
		let positionLocation = gl.getAttribLocation(program, "a_position");
		let normalLocation = gl.getAttribLocation(program, "a_normal");
		let texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

		this.positionBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(this.renderProperties.positions),
			gl.STATIC_DRAW
		);

		this.normalsBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(this.renderProperties.normals),
			gl.STATIC_DRAW
		);

		this.texcoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(this.renderProperties.texcoords),
			gl.STATIC_DRAW
		);

		var ambientLight = [0.2, 0.2, 0.2]; //TODO: Parametric?
		var colorLight = [1.0, 1.0, 1.0]; //TODO: Parametric?

		gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), this.renderProperties.diffuse);
		gl.uniform3fv(gl.getUniformLocation(program, "ambient"), this.renderProperties.ambient);
		gl.uniform3fv(gl.getUniformLocation(program, "specular"), this.renderProperties.specular);
		gl.uniform3fv(gl.getUniformLocation(program, "emissive"), this.renderProperties.emissive);
		gl.uniform3fv(gl.getUniformLocation(program, "u_ambientLight"), ambientLight);
		gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight"), colorLight);

		gl.uniform1f(gl.getUniformLocation(program, "shininess"), this.renderProperties.shininess);
		gl.uniform1f(gl.getUniformLocation(program, "opacity"), this.renderProperties.opacity);

		gl.enableVertexAttribArray(positionLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		const size = 3; // 3 components per iteration
		const type = gl.FLOAT; // the data is 32bit floats
		const normalize = false; // don't normalize the data
		const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
		const offset = 0; // start at the beginning of the buffer
		gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

		gl.enableVertexAttribArray(normalLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

		gl.enableVertexAttribArray(texcoordLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		gl.vertexAttribPointer(texcoordLocation, size - 1, type, normalize, stride, offset);

		//TODO: Parametrize camera (Create class?)
		function degToRad(d) {
			return d * Math.PI / 180;
		}
		var fieldOfViewRadians = degToRad(30);

		// Compute the projection matrix
		var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		//  zmin=0.125;
		var zmin = 0.1;
		var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, 200);

		var cameraPosition = [4.5, 4.5, 2];
		var up = [0, 0, 1];
		var target = [0, 0, 0];

		// Compute the camera's matrix using look at.
		var cameraMatrix = m4.lookAt(cameraPosition, target, up);

		// Make a view matrix from the camera matrix.
		var viewMatrix = m4.inverse(cameraMatrix);


		let matrixLocation = gl.getUniformLocation(program, "u_world");
		let textureLocation = gl.getUniformLocation(program, "diffuseMap");
		let viewMatrixLocation = gl.getUniformLocation(program, "u_view");
		let projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
		let lightWorldDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
		let viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");

		gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
		gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

		// set the light position
		gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5]));

		// set the camera/view position
		gl.uniform3fv(viewWorldPositionLocation, cameraPosition);

		// Tell the shader to use texture unit 0 for diffuseMap
		gl.uniform1i(textureLocation, 0);

		// Tell WebGL how to convert from clip space to pixels
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		//gl.enable(gl.CULL_FACE);
		gl.enable(gl.DEPTH_TEST);

		var matrix = m4.identity();

		// Set the matrix.
		gl.uniformMatrix4fv(matrixLocation, false, matrix);

		// Draw the geometry.
		gl.drawArrays(gl.TRIANGLES, 0, this.renderProperties.numVertices);
	}
}
