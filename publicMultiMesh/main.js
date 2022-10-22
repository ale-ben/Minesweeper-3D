// https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html

function parseOBJ(text) {
	// Parse the OBJ file removing comments and empty lines

	// because indices are base 1 let's just fill in the 0th data
	const objPositions = [[0, 0, 0]];
	const objTexcoords = [[0, 0]];
	const objNormals = [[0, 0, 0]];

	// Object representation
	// same order as `f` indices
	const objVertexData = [
		objPositions,
		objTexcoords,
		objNormals,
	];

	// WebGL representation of the object
	// same order as `f` indices
	let webglVertexData = [
		[],   // positions
		[],   // texcoords
		[],   // normals
	];

	function addVertex(vert) { //TODO: WTF???
		const ptn = vert.split('/');
		ptn.forEach((objIndexStr, i) => {
			if (!objIndexStr) {
				return;
			}
			const objIndex = parseInt(objIndexStr);
			const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
			webglVertexData[i].push(...objVertexData[i][index]);
		});
	}

	// Keywords:
	// v: vertex position
	// vt: texture coordinate
	// vn: vertex normal
	// f: face (each element is an index in the above arrays)
	// The indices are 1 based if positive or relative to the number of vertices parsed so far if negative.
	// The order of the indices are position/texcoord/normal and that all except the position are optional
	const keywords = {
		v(parts) {
			objPositions.push(parts.map(parseFloat)); // Convert the string to a float and add it to the positions array
		},
		vn(parts) {
			objNormals.push(parts.map(parseFloat)); // Convert the string to a float and add it to the normals array
		},
		vt(parts) {
			objTexcoords.push(parts.map(parseFloat)); // Convert the string to a float and add it to the texture coordinates array
		},
		f(parts) { // WebGL only works with triangles, we have to convert the faces to triangles
			const numTriangles = parts.length - 2;
			for (let tri = 0; tri < numTriangles; ++tri) {
				addVertex(parts[0]);
				addVertex(parts[tri + 1]);
				addVertex(parts[tri + 2]);
			}
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

	return {
		position: webglVertexData[0],
		texcoord: webglVertexData[1],
		normal: webglVertexData[2],
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
	 
	uniform mat4 u_projection;
	uniform mat4 u_view;
	uniform mat4 u_world;
	 
	varying vec3 v_normal;
	 
	void main() {
	  gl_Position = u_projection * u_view * u_world * a_position;
	  v_normal = mat3(u_world) * a_normal;
	}
	`;

	const fs = `
	precision mediump float;
	 
	varying vec3 v_normal;
	 
	uniform vec4 u_diffuse;
	uniform vec3 u_lightDirection;
	 
	void main () {
	  vec3 normal = normalize(v_normal);
	  float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
	  gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
	}
	`;

	// compiles and links the shaders, looks up attribute and uniform locations
	const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

	const response = await fetch('./cube.obj');  /* webglfundamentals: url */
	const text = await response.text();
	const obj = parseOBJ(text);
	console.log(obj);

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

	// create a buffer for each array by calling
	// gl.createBuffer, gl.bindBuffer, gl.bufferData
	const bufferInfo = webglUtils.createBufferInfoFromArrays(gl, obj);

	const cameraTarget = [0, 0, 0];
	const cameraPosition = [0, 0, 4];
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

		// calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
		webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo);

		// calls gl.uniform
		webglUtils.setUniforms(meshProgramInfo, {
			u_world: m4.yRotation(time),
			u_diffuse: [1, 0.7, 0.5, 1],
		});

		// calls gl.drawArrays or gl.drawElements
		webglUtils.drawBufferInfo(gl, bufferInfo);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}


main();