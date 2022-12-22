import {
    Element
} from "./myLibs/Element.js";
import {
    Environment
} from "./myLibs/Environment.js";

async function main() {
    const env = new Environment("#canvas");

    await env.addObject(new Element("Cube", "./resources/models/cube.obj", {
        x: 0,
        y: 0,
        z: 0
    }, {
        x: 0,
        y: 0,
        z: 0.5
    }, "./resources/models/cubeTextured.mtl"));
    await env.addObject(new Element("Cube", "./resources/models/cube.obj", {
        x: 0,
        y: 0,
        z: 2
    }));
    //await env.addObject(new Element("Boeing", './resources/models/untitled.obj'));
    //await env.addObject(new Element("Chair", './resources/models/chair.obj', {x: -5, y: -5, z: 0}));
    await env.addObject(new Element("Axes", "./resources/models/axes.obj"));

    function render(time) {
        time *= 0.001; // convert to seconds

        env.renderEnvironment(time);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();
