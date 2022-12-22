import { MeshLoader } from "./WebGL_helper_functions/MeshLoader.js";

export class Element {

	constructor(name, filePath, center = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }, mtlPath = null) {
		if (debug && debug == true) console.log("Generated object renderer for " + name + " from " + filePath);
		this.name = name;
		this.filePath = filePath;
		this.center = center;
		this.rotation = rotation;
		if (mtlPath) this.mtlPath = mtlPath;
	}

	updateObject(time) {
		
	}
}