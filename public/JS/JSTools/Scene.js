
// Note:	In Javascript, the "export" keyword permits to export the class to other files.
//			When we export the class, we can use all the methods and properties of the class in other 
//			files.
export class Scene {

	/**
	 * Costuctor of the class.
	 * 
	 * @param {string} name - The name of the scene.
	 * @param {object} sceneObj - An array of objects that will be rendered in the scene.
	 */
	constructor(name = "defaultSceneComposition", sceneObj = []) {
		this.sceneName;
		this.sceneObj = sceneObj;
	}

	/**
	 * Add an object to the scene.
	 * 
	 * @param {String} alias A string that will be used to identify the object
	 * @param {String} pathOBJ The path to the .obj file
	 * @param {object} coords An object that contains the coordinates of the object inside the scene
	 * 
	 * @returns {boolean} True if the object has been added, false otherwise
	 */
	addOBJToList(alias, pathOBJ, isVisible, coords) {
		var newObj = {
			alias: alias,
			pathOBJ: pathOBJ,
			isVisible: isVisible,
			coords: coords,
		};
		if (this.sceneObj.push(newObj)) {
			console.log("Scene.js - Added new object to the scene");
			return true;
		} else {
			console.log("Scene.js - Error while adding new object to the scene");
			console.debug(newObj);
			return false;
		}
	}

	/**
	 * Remove an object from the scene.
	 * 
	 * @param {string} alias - The alias of the object that will be removed
	 * 
	 * @returns {boolean} - True if the object has been removed, false otherwise
	 * 
	 */
	removeOBJFromList(alias) {
		for (var i = 0; i < this.sceneObj.length; i++) {
			if (this.sceneObj[i].alias === alias) {
				this.sceneObj.splice(i, 1);
				return true;
			}
		}
		return false;
	}

}
