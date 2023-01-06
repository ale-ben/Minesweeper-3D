import {
    Element
} from "./Element.js";

export class CubeElement extends Element {
	constructor(filePath, options = {}) {
		options.detectClick = true;
		super("Cube", filePath, options);
	}

	onClick() {
		if (this.value || this.value == 0)
            this.mtlPath = "./resources/models/cube" + this.value + ".mtl";

	}
}