import {
    Element
} from "./Element.js";

export class StartButton extends Element {
	constructor(startHandler) {
		super("Start", "./resources/models/start.obj", {
			detectClick: true
		});
		this.startHandler = startHandler;
	}

	updateObject(time) {
		this.rotation.onSelf.z += 0.01;
    }

	onClick() {
		this.startHandler();
	}
}