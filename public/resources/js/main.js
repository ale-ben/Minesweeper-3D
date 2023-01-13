import {
    Element
} from "./myLibs/elements/Element.js";
import {
    StartButton
} from "./myLibs/elements/StartButton.js";
import {
    GameOver
} from "./myLibs/elements/GameOver.js";
import {
    CubeElement
} from "./myLibs/elements/CubeElement.js";
import {
    Environment
} from "./myLibs/Environment.js";
import {
    CubeRepresentation
} from "./myLibs/gameLogic/CubeRepresentation.js";

async function main() {

	const env = new Environment("#canvas");

	async function startHandler() {
		console.log("Start button clicked");
		console.log("Debug mode: " + debug);
		console.log("Axes enabled: " + document.getElementById("enableAxesToggle").checked);
		console.log("Sync lights: " + syncLight)

		
		let cubeSizeRange = document.getElementById("cubeSizeRange");
		let numBombsRange = document.getElementById("numBombsRange");

		cubeSizeRange.disabled = true;
		numBombsRange.disabled = true;

		console.log("Cube size: " + cubeSizeRange.value);
		console.log("Number of bombs: " + numBombsRange.value);

		let cube = new CubeRepresentation(cubeSizeRange.value);
		env.cube = cube;
		
		cube.addBombs(numBombsRange.value);

		// Only clickable element is the start button
		env.removeObjectByName("Start");

		// Add the cube
		for (let x = 0; x < cube.size; x++) {
			for (let y = 0; y < cube.size; y++) {
				for (let z = 0; z < cube.size; z++) {
					// Generate a renderable object only if the cell is on the border
					if (x == 0 || x == cube.size - 1 || y == 0 || y == cube.size - 1 || z == 0 || z == cube.size - 1) {
						env.addObject(addCube(x, y, z, cube.size, cube.getCellValue(x, y, z)));
					}
				}
			}
		}
	}

	env.addObject(new Element("Axes", "./resources/models/axes.obj", {
        hidden: true
    }));

	env.addObject(new GameOver());

	env.addObject(new StartButton(startHandler));

    document.getElementById("enableAxesToggle").addEventListener("change", event => {
        console.log("Axes enabled: " + event.target.checked);
        for (let elem of env.objList) {
            if (elem.name == "Axes") {
                elem.hidden = !event.target.checked;
                break;
            }
        }
    });

	document.getElementById("enableTransparencyToggle").addEventListener("change", event => {
        console.log("Transparency enabled: " + event.target.checked);
        env.renderEngine.setTransparency(event.target.checked);
    });

    function render(time) {
        time *= 0.001; // convert to seconds

        env.renderEnvironment(time);

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function addCube(x, y, z, size, value) {
	const cubeDistance = 1.2;
    const offset = Math.trunc(size / 2);
    return new CubeElement("./resources/models/cube.obj", offset, cubeDistance, {
        center: {
            x: x,
            y: y,
            z: z,
        },
        value: value,
        //showCompleted: true
    });
}

main();
