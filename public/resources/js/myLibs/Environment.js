import {
    Camera
} from "./Camera.js";
import {
    RenderEngine
} from "./WebGL_helper_functions/RenderEngine.js";
import {
    MeshLoader
} from "./WebGL_helper_functions/MeshLoader.js";
import {
    CubeElement
} from "./elements/CubeElement.js";
import {
    TextElement
} from "./elements/TextElement.js";

export class Environment {
    constructor(canvasName) {
        const canvas = document.querySelector(canvasName);
        if (!canvas) {
            console.error("Unable to find canvas " + canvasName);
            return;
        }
        this.gl = canvas.getContext("webgl2");
        if (!this.gl) {
            console.error("Unable to initialize WebGL2 on canvas " + canvasName);
            return;
        }

        // compiles and links the shaders, looks up attribute and uniform locations
        this.programInfo = webglUtils.createProgramInfo(this.gl, [RenderEngine.defaultShaders.vs, RenderEngine.defaultShaders.fs]);
        this.pickerProgramInfo = webglUtils.createProgramInfo(this.gl, [RenderEngine.pickerShaders.vs, RenderEngine.pickerShaders.fs]);

        this.objList = [];
        this.pickableMap = new Map();

        this.camera = new Camera(this.gl.canvas);
        Camera.setCameraControls(this.gl.canvas, this.camera);

        this.renderEngine = new RenderEngine(this.gl, {
            enablePicker: true,
            enableTransparency: true
        });

        this.gl.canvas.addEventListener("mousedown", event => {
            // Button 0 is the left mouse button
            // Button 1 is the middle mouse button
            // Button 2 is the right mouse button
            if (event.button == 0 || event.button == 2) {
                event.preventDefault();
                if (this.camera.movement.dragging == false && this.camera.movement.forceDrag == false) {
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = event.clientX - rect.left;
                    const mouseY = event.clientY - rect.top;
                    this.handleObjectClick(mouseX, mouseY, event.button == 0);
                }
            }
        });

        this.gl.canvas.addEventListener("contextmenu", function(e) {
            e.preventDefault();
        });
    }

    async addObject(obj) {
        this.objList.push(obj);
        if (obj.id != 0)
            this.pickableMap.set(obj.id, obj);

        await MeshLoader.LoadOBJAndMesh(this.gl, obj);
    }

    removeObjectByID(objID) {
        this.objList = this.objList.filter(obj => obj.id != objID);
        this.pickableMap.delete(objID);
    }

    removeObjectByName(objName) {
        let obj = this.objList.find(obj => obj.name == objName);
        if (obj) {
            this.objList = this.objList.filter(obj => obj.name != objName);
            if (obj.id != 0)
                this.pickableMap.delete(obj.id);
        }
    }

    removeObject(obj) {
        this.objList = this.objList.filter(o => o != obj);
        if (obj.id != 0)
            this.pickableMap.delete(obj.id);
    }

    findByCenter(center) {
        console.debug("Finding object with center: " + center.x + ", " + center.y + ", " + center.z);
        return this.objList.find(obj => obj.center.x == center.x && obj.center.y == center.y && obj.center.z == center.z);
    }

    async reloadMeshes() {
        for (let obj of this.objList) {
            await MeshLoader.LoadOBJAndMesh(this.gl, obj);
        }
    }

    checkWinCondition() {
        for (let [id, obj] of this.pickableMap) {
            if (obj instanceof CubeElement && obj.value != 9) {
                return false;
            }
        }
        this.objList.filter(obj => obj instanceof TextElement && obj.name == "Victory")[0].hidden = false;
        return true;
    }

    setGameOver() {
        this.objList.filter(obj => obj instanceof TextElement && obj.name == "GameOver")[0].hidden = false;
    }

    renderEnvironment(time) {
        // Re evaluate camera position
        this.camera.moveCamera();

        this.objList.forEach(obj => obj.updateObject(time));

        this.renderEngine.render(this.camera.getSharedUniforms(), this.programInfo, this.objList, this.pickerProgramInfo);
    }

    handleObjectClick(mouseX, mouseY, isLeftClick) {
        const objID = this.renderEngine.detectObject(mouseX, mouseY);
        console.log("Click at " + mouseX + ", " + mouseY + (
            objID != 0 ?
            ". Object id detected: " + objID :
            ". No object detected"));
        if (objID != 0) {
            let obj = this.pickableMap.get(objID);
            if (obj) {
                obj.onClick({
                    gl: this.gl,
                    env: this,
                    isLeftClick: isLeftClick
                });
            }
        }
    }
}
