import {
    Element
} from "./Element.js";

export class GameOver extends Element {
    constructor(cubeSize) {
        super("GameOver", "./resources/models/gameOver.obj", {
			center : {
				x: 0,
				y: 0,
				z: cubeSize
			},
            hidden: true
        });
    }

    updateObject() {
        this.rotation.onSelf.z += 0.01;
    }
}
