import {
    Element
} from "./Element.js";
import {
    MeshLoader
} from "../WebGL_helper_functions/MeshLoader.js";

export class CubeElement extends Element {
    constructor(filePath, options = {}) {
        options.detectClick = true;
        super("Cube", filePath, options);

        if (options.value || options.value == 0) {
            this.value = options.value;
            if (options.showCompleted)
                this.mtlPath = "./resources/models/cube" + this.value + ".mtl";
        }
    }

    onClick(gl) {
        if (this.value || this.value == 0) {
			console.log("Clicked on cube with id " + this.id + " and value " + this.value);
            this.mtlPath = "./resources/models/cube" + this.value + ".mtl";
            MeshLoader.LoadOBJAndMesh(gl, this);
        }
    }
}
