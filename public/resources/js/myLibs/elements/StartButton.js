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

	onClick() {
		this.startHandler();
	}
}