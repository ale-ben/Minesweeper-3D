
import { MeshLoader } from "./MeshLoader.js";

import { Camera, setCameraControls, getUpdateCamera } from "./Camera.js";

// WebGL context
let glMainScreen;

// Camera
let cameraMainScreen;

// List of objects to render
let meshlist = [];

let program = [];

export class Core {

	/**
	 * Constructor of the class. 
	 * It initializes the canvas, the WebGL context and all the components for the rendering.
	 * 
	 * @param {String} idMainCanvas Identifier of the canvas element (Main screen).
	 */
	constructor(idMainCanvas) {
		console.log("Core.js - Start WebGL Core initialization");

		// Canvas and WebGL context initialization
		this.mainCanvas = document.getElementById(idMainCanvas);
		this.glMainScreen = this.mainCanvas.getContext("webgl");
		// Global variables initialization
		glMainScreen = this.glMainScreen;

		if (!this.glMainScreen) return;

		// MeshLoader initialization
		this.meshlist = [];
		this.meshLoader = new MeshLoader(this.meshlist);
		// Global variables initialization
		meshlist = this.meshlist;

		setCameraControls(this.mainCanvas, false);
		// Global variables initialization

		console.log("Core.js - End WebGL Core initialization");
	}

	/**
	 * Function setup all the components for the rendering.
	 * 
	 * @param {List} sceneComposition List of objects that will be rendered in the scene.
	 */
	setupScene(sceneComposition) {
		console.log("Core.js - Start scene setup");

		// Load all the meshes in the scene
		for (const obj of sceneComposition.sceneObj) {
			// Load the mesh
			this.meshLoader.addMesh(
				this.glMainScreen,
				obj.alias,
				obj.pathOBJ,
				obj.coords
			);
		}
		console.log("Core.js - End scene setup");
	}

	/**
	 * Function that generates the camera for the rendering.
	 * 
	 */
	generateCamera() {
		console.log("Core.js - Start camera setup");

		cameraMainScreen = new Camera(
			[0, 0, 0],
			[0, 0, 1],
			[0, 0, 1],
			70
		);

		console.log("Core.js - End camera setup");
	}

}

export function initProgramRender() {
	// setup GLSL program
	let mainProgram = webglUtils.createProgramFromScripts(glMainScreen, [
		"3d-vertex-shader",
		"3d-fragment-shader",
	]);

	glMainScreen.useProgram(mainProgram);

	// List of list of programs
	program = [mainProgram, glMainScreen];

}

/**
 * Rendering functions for the main screen.
 * 
 * @param {*} time 
 */
export function render(time = 0) {


	if (getUpdateCamera()) cameraMainScreen.moveCamera();

	// Convert to seconds
	time *= 0.002;

	meshlist.forEach((elem) => {
		elem.render(
			time,
			program[1],
			{ ambientLight: [0.2, 0.2, 0.2], colorLight: [1.0, 1.0, 1.0] },
			program[0],
			cameraMainScreen
		);
	});


	requestAnimationFrame(render);
}
