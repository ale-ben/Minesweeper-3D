import {
    Element
} from "./Element.js";

export class GameOver extends Element {
    constructor() {
        super("GameOver", "./resources/models/gameOver.obj", {
            hidden: true
        });
    }

    updateObject() {
        this.rotation.onSelf.z += 0.01;
    }
}
