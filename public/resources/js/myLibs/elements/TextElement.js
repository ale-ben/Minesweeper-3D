import {
    Element
} from "./Element.js";

export class TextElement extends Element {
    constructor(name, center, mtlPath, hidden = false) {
        super(name, mtlPath, {
            center: center,
            hidden: hidden
        });
    }

    updateObject() {
        this.rotation.onSelf.z += 0.01;
    }
}
