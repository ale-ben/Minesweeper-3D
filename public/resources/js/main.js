import {
    Element
} from "./myLibs/Element.js";
import {
    Environment
} from "./myLibs/Environment.js";
import {
    CubeRepresentation
} from "./myLibs/gameLogic/CubeRepresentation.js";

async function main() {
	const cube = new CubeRepresentation(3);
	cube.addBombs(2);

    const env = new Environment("#canvas");

    //await env.addObject(new Element("Axes", "./resources/models/axes.obj"));

	
	for (let i = 0; i < cube.size; i++) {
		for (let j = 0; j < cube.size; j++) {
			await env.addObject(addCube(i, 1, j, cube.size, cube.getCellValue(i, j)));
		}
	}

	/*
	await env.addObject(new Element("Cube", "./resources/models/cube.obj", {
        detectClick: true
    }));
    await env.addObject(new Element("Cube", "./resources/models/cube.obj", {
        center: {
            x: 0,
            y: 0,
            z: 2
        }
    }));
	*/


    function render(time) {
        time *= 0.001; // convert to seconds

        env.renderEnvironment(time);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function addCube(x, y, z, size, value) {
	let offset = Math.trunc(size / 2);
	return new Element("cube", "./resources/models/cube.obj", {
        center: {
            x: x-offset,
            y: y-offset,
            z: z-offset
        },
		detectClick: true,
		mtlPath: ("./resources/models/cube"+value+".mtl")
    });
}

main();
