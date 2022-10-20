
import { GeneralObject } from "./Objects/GeneralObject.js";

export class MeshLoader {

	/**
	 * Constructor of the class. 
	 * It initializes the list of all objects in the scene.
	 * 
	 * @param {List} objData List of all objects in the scene.
	 */
	constructor(objData) {
		this.objData = objData;
	}

	/**
	 * Load the mesh from the .obj file and add it to the list of objects specialized.
	 * 
	 * @param {Object} glMainScreen WebGL context of the main screen.
	 * @param {String} alias A string that will be used to identify the object.
	 * @param {String} pathOBJ The path to the .obj file.
	 * @param {boolean} isPlayer A boolean that indicates if the object is the player.
	 * @param {boolean} isEnemy A boolean that indicates if the object is an enemy.
	 * @param {boolean} idleAnimation A boolean that indicates if the object has an idle animation.
	 * @param {Object} coords An object that contains the coordinates of the object inside the scene.
	 */
	addMesh(glMainScreen, alias, pathOBJ, coords) {

		console.log("MeshLoader.js - Loading mesh: " + alias);

		// Create the mesh object
		let mesh = [];
		mesh.sourceMesh = pathOBJ;

		// Load the mesh from the .obj file
		LoadMesh(glMainScreen, mesh);

		// Add the mesh to the list of objects
		this.objData.push(new GeneralObject(alias, mesh, coords));
		console.debug("MeshLoader.js - OBJ loaded: " + this.objData[this.objData.length - 1].position.x + ", " + this.objData[this.objData.length - 1].position.y + ", " + this.objData[this.objData.length - 1].position.z);

		console.log("MeshLoader.js - End loading mesh: " + alias);
	}

}
