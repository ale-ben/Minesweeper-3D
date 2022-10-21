import { ObjectRenderer } from "./toolLib/ObjectRenderer.js";

let program = [];
let objList = [];

console.log("Core.js - Start WebGL Core initialization");

// Canvas and WebGL context initialization
let mainCanvas = document.getElementById("screenCanvas");
let glMainScreen = mainCanvas.getContext("webgl2");

if (!glMainScreen) console.error("Unable to load canvas");

console.log("Core.js - End WebGL Core initialization");

console.log("Core.js - Start scene setup");

objList.push(new ObjectRenderer("cube", "../../resources/obj/cube.obj"));
objList.push(new ObjectRenderer("axes", "../../resources/obj/axes.obj"));

objList.forEach(element => element.loadMesh(glMainScreen));

console.log("Core.js - End scene setup");

// setup GLSL program
let mainProgram = webglUtils.createProgramFromScripts(glMainScreen, [
	"3d-vertex-shader",
	"3d-fragment-shader",
]);

glMainScreen.useProgram(mainProgram);

// List of list of programs
program = [mainProgram, glMainScreen];

function render(time = 0) {
	// Convert to seconds
	time *= 0.002;

	objList.forEach(element => element.render(program[1], program[0]));

	requestAnimationFrame(render);
}

requestAnimationFrame(render);
