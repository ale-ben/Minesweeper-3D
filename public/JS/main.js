
import { Scene } from "./JSTools/Scene.js";
import { Core, initProgramRender, render } from "./JSTools/Core.js";


console.log("main.js - Start loading scene elements");

// Array of objects that will be rendered in the scene 
let sceneComposition = new Scene();

sceneComposition.addOBJToList(
	"cube1",
	"../../resources/obj/cube.obj",
	{ x: 0, y: 0, z: 0 },
);

console.debug(sceneComposition);

console.log("main.js - End loading scene elements");



console.log("main.js - Start loading core");

let core = new Core("screenCanvas");

core.setupScene(sceneComposition);

core.generateCamera();

console.log("Core del programma dopo il caricamento della scena");
console.debug(core);

console.log("main.js - End loading core");



console.log("main.js - Loop rendering");	

initProgramRender();
render();
