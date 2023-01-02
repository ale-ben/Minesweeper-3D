import {
    Element
} from "./myLibs/Element.js";
import {
    Environment
} from "./myLibs/Environment.js";

async function main() {
    const env = new Environment("#canvas");

    await env.addObject(new Element("Axes", "./resources/models/axes.obj"));

    await env.addObject(new Element("Cube", "./resources/models/cube.obj", {
        detectClick: true,
        mtlPath: "./resources/models/cubeTextured.mtl"
    }));
    await env.addObject(new Element("Cube", "./resources/models/cube.obj", {
        center: {
            x: 0,
            y: 0,
            z: 2
        }
    }));
    }));

    function render(time) {
        time *= 0.001; // convert to seconds

        env.renderEnvironment(time);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();
