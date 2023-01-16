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
	
	setTransparency(status) {
		this.parts.forEach(part => {
			if (part.material.name == "CubeTransparent") {
				// When enabled can not set transparency to 0 or picker won't work.
				part.material.opacity = (status ? 0.002 : 1);
				return;
			}
		});
	}

    onClick() {
        this.startHandler();
    }
}
