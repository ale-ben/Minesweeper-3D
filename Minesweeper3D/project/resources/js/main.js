import {
    Element
} from "./myLibs/elements/Element.js";
import {
    StartButton
} from "./myLibs/elements/StartButton.js";
import {
    TextElement
} from "./myLibs/elements/TextElement.js";
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
        console.log("Sync lights: " + syncLight);

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

        env.addObject(new TextElement("GameOver", {
            x: 0,
            y: 0,
            z: cubeSizeRange.value
        }, "./resources/models/gameOver.obj", true));

        env.addObject(new TextElement("Victory", {
            x: 0,
            y: 0,
            z: cubeSizeRange.value
        }, "./resources/models/victory.obj", true));

        // Add the cube
        // Since WebGL renders in the order of the objects added, we need to add the cubes with transparency last, so that they are rendered on top of the opaque cubes.
        // Save the transparent cubes here and render them later.
        let lateRender = [];
        for (let x = 0; x < cube.size; x++) {
            for (let y = 0; y < cube.size; y++) {
                for (let z = 0; z < cube.size; z++) {
                    // Generate a renderable object only if the cell is on the border
                    if (x == 0 || x == cube.size - 1 || y == 0 || y == cube.size - 1 || z == 0 || z == cube.size - 1) {
                        const val = cube.getCellValue(x, y, z);
                        if (val != 0)
                            env.addObject(addCube(x, y, z, cube.size, val));
                        else
                            lateRender.push(addCube(x, y, z, cube.size, val));
                    }
                }
            }
        }

        // Render the transparent cubes.
        lateRender.forEach(elem => env.addObject(elem));

        env.dashboard.bombsLeft.outputSpan.innerHTML = numBombsRange.value;
        env.dashboard.bombsLeft.value = numBombsRange.value;
        env.dashboard.timer.run = true;
    }

    env.addObject(new Element("Axes", "./resources/models/axes.obj", {
        hidden: true
    }));

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
		env.setTransparency(event.target.checked);
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
            z: z
        },
        value: value,
        //showCompleted: true
    });
}

main();
