import {
    Element
} from "./Element.js";
import {
    MeshLoader
} from "../WebGL_helper_functions/MeshLoader.js";
import {
    GameOver
} from "./GameOver.js";

export class CubeElement extends Element {
    constructor(filePath, offset, cubeDistance, options = {}) {
        options.detectClick = true;
        (options.center = getCubeCenter(options.center, offset, cubeDistance)),
        super("Cube", filePath, options);

        this.offset = offset;
        this.cubeDistance = cubeDistance;
        this.hasFlag = false;

        if (options.value || options.value == 0) {
            this.value = options.value;
            if (options.showCompleted)
                this.mtlPath = "./resources/models/cube" + this.value + ".mtl";
        }
    }

    onClick(params) {
        if (!this.clicked && (this.value || this.value == 0)) {
            this.clicked = true;
            console.log("Clicked on cube with id " + this.id + " and value " + this.value);
            if (params && params.isLeftClick) {
                this.mtlPath = "./resources/models/cube" + this.value + ".mtl";
				params.env.pickableMap.delete(this.id);
				this.detectClick = false;
                if (params && params.gl)
                    MeshLoader.LoadOBJAndMesh(params.gl, this);
                else
                    console.warn("No gl context provided to CubeElement onClick function.");
                if (this.value == 0 && params && params.env) {
                    let offset = Math.trunc(params.env.cube.size / 2);
                    let cellCenter = getCellCoords(this.center, this.offset, this.cubeDistance);
                    let neighbours = params.env.cube.getNeighbours(cellCenter.x, cellCenter.y, cellCenter.z);
                    let neighbours0 = neighbours.filter(n => n.value == 0);
                    for (let n of neighbours0) {
                        let cubeCenter = getCubeCenter(n.cell, offset, this.cubeDistance);
                        let cube = params.env.findByCenter(cubeCenter);
                        if (cube) {
                            cube.onClick(params);
                        }
                    }
                } else if (this.value == 9 && params && params.env) {
                    console.log("You lost!");
                    for (let [id, obj] of params.env.pickableMap) {
                        if (obj instanceof CubeElement) {
                            obj.clicked = true;
                            obj.mtlPath = "./resources/models/cube" + obj.value + ".mtl";
                        } else if (obj instanceof GameOver) {
                            obj.hidden = false;
                        }
                    }
                    params.env.reloadMeshes();
                }
            } else if (params) {
                this.mtlPath = "./resources/models/cubeFlag.mtl";
                this.hasFlag = true;
                if (params && params.gl)
                    MeshLoader.LoadOBJAndMesh(params.gl, this);
                else
                    console.warn("No gl context provided to CubeElement onClick function.");
            }
        } else if (this.clicked && this.hasFlag && params && !params.isLeftClick) {
            console.log("Ajeje");
            this.mtlPath = "./resources/models/cubeBase.mtl";
            this.hasFlag = false;
            this.clicked = false;
            if (params && params.gl)
                MeshLoader.LoadOBJAndMesh(params.gl, this);
            else
                console.warn("No gl context provided to CubeElement onClick function.");
        }
		if (params && params.env) {
			console.log("Won? " + params.env.checkWinCondition());
		}
    }
}

function getCellCoords(cubeCenter, offset, cubeDistance) {
    return {
        x: Math.round(cubeCenter.x / cubeDistance) + offset,
        y: Math.round(cubeCenter.y / cubeDistance) + offset,
        z: Math.round(cubeCenter.z / cubeDistance) + offset
    };
}

function getCubeCenter(cellCoords, offset, cubeDistance) {
    return {
        x: (cellCoords.x - offset) * cubeDistance,
        y: (cellCoords.y - offset) * cubeDistance,
        z: (cellCoords.z - offset) * cubeDistance
    };
}
