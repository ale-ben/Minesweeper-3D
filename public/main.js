import { ObjectRepresentation } from "./resources/js/tools/ObjectRepresentation.js";

function main() {
	// Get A WebGL context
	/** @type {HTMLCanvasElement} */
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl2");
	if (!gl) {
		return;
	}

	// setup GLSL program
	var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
	// Tell it to use our program (pair of shaders)
	gl.useProgram(program);

	let cube = new ObjectRepresentation("cube", "resources/models/axes.obj");
	//cube.loadMesh(gl);
	//cube.render(gl, program);

	let cube2 = new ObjectRepresentation("cube", "resources/models/cube.obj");
	cube2.loadMesh(gl);
	cube2.render(gl, program);
}

main();