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
    cube.addBomb(2,2,2);
	cube.addBomb(0,0,0);
	cube.addBomb(2,1,1);

    const env = new Environment("#canvas");

    await env.addObject(new Element("Axes", "./resources/models/axes.obj"));

	for (let x = 0; x < cube.size; x++) {
		for (let y = 0; y < cube.size; y++) {
			for (let z = 0; z < cube.size; z++) {
				// Generate a renderable object only if the cell is on the border
				if (x == 0 || x == cube.size-1 || y == 0 || y == cube.size-1 || z == 0 || z == cube.size-1) {
					await env.addObject(addCube(x, y, z, cube.size, cube.getCellValue(x, y, z)));
				}
			}
		}
		}

    function render(time) {
        time *= 0.001; // convert to seconds

        env.renderEnvironment(time);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function addCube(x, y, z, size, value) {
    let offset = Math.trunc(size / 2);
    let cubeDistance = 1.2;
    return new Element("cube", "./resources/models/cube.obj", {
        center: {
            x: (x - offset) * cubeDistance,
            y: (y - offset) * cubeDistance,
            z: (z - offset) * cubeDistance
        },
        detectClick: true,
        value: value,
		showCompleted: true
    });
}

main();
