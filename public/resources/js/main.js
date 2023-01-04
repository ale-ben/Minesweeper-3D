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
    cube.addBomb(2,1,1);

    const env = new Environment("#canvas");

    await env.addObject(new Element("Axes", "./resources/models/axes.obj"));

	// Draw top and bottom faces (z = 0, z = size-1)
    for (let x = 0; x < cube.size; x++) {
        for (let y = 0; y < cube.size; y++) {
            await env.addObject(addCube(x, y, 0, cube.size, cube.getCellValue(x, y, 0)));
            await env.addObject(addCube(x, y, cube.size-1, cube.size, cube.getCellValue(x, y, cube.size-1)));
        }
    }

	for (let z = 1; z < cube.size-1; z++) {
		// Draw left and right faces (x = 0, x = size-1)
		for (let y = 0; y < cube.size; y++) {
			await env.addObject(addCube(0, y, z, cube.size, cube.getCellValue(0, y, z)));
			await env.addObject(addCube(cube.size-1, y, z, cube.size, cube.getCellValue(cube.size-1, y, z)));
		}

		// Draw front and back faces (y = 0, y = size-1)
		for (let x = 1; x < cube.size-1; x++) {
			await env.addObject(addCube(x, 0, z, cube.size, cube.getCellValue(x, 0, z)));
			await env.addObject(addCube(x, cube.size-1, z, cube.size, cube.getCellValue(x, cube.size-1, z)));
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
    let cubeDistance = 1.2;
    return new Element("cube", "./resources/models/cube.obj", {
        center: {
            x: (x - offset) * cubeDistance,
            y: (y - offset) * cubeDistance,
            z: (z - offset) * cubeDistance
        },
        detectClick: true,
        value: value,
		mtlPath: "./resources/models/cube" + value + ".mtl"
    });
}

main();
