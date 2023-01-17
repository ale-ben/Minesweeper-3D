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
import {
    StartButton
} from "./elements/StartButton.js";

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

        this.dashboard = {
            timer: {
                startTime: 0,
                outputSpan: document.getElementById("timeElapsed")
            },
            bombsLeft: {
                value: 0,
                outputSpan: document.getElementById("minesRemaining")
            }
        };

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

        this.gl.canvas.addEventListener("touchstart", event => {
            if (event.touches.length == 1) {
                this.touch = {
                    startX: event.touches[0].clientX,
                    startY: event.touches[0].clientY,
                    startTime: new Date().getTime()
                };
            }
        });

        this.gl.canvas.addEventListener("touchend", event => {
            if (event.changedTouches.length == 1) {
                event.preventDefault();
                const rect = canvas.getBoundingClientRect();
                const touch = event.changedTouches[0];
                const distanceThreshold = 5;
                const timeThreshold = 500;
                if (Math.abs(this.touch.startX - touch.clientX) > distanceThreshold || Math.abs(this.touch.startY - touch.clientY) > distanceThreshold)
                    return;
                const mouseX = touch.clientX - rect.left;
                const mouseY = touch.clientY - rect.top;
                this.handleObjectClick(mouseX, mouseY, new Date().getTime() - this.touch.startTime < timeThreshold);
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
        this.dashboard.timer.run = false;
        return true;
    }

    setGameOver() {
        this.objList.filter(obj => obj instanceof TextElement && obj.name == "GameOver")[0].hidden = false;
        this.dashboard.timer.run = false;
    }

    updateTimer() {
        if (this.dashboard.timer.run) {
            if (this.dashboard.timer.startTime == 0) {
                this.dashboard.timer.startTime = new Date().getTime();
            }
            let timeElapsed = new Date().getTime() - this.dashboard.timer.startTime;
            let seconds = Math.floor(timeElapsed / 1000);
            let minutes = Math.floor(seconds / 60);
            seconds = seconds % 60;
            let timeString = (
                minutes < 10 ?
                "0" :
                "") + minutes + ":" + (
                seconds < 10 ?
                "0" :
                "") + seconds;
            this.dashboard.timer.outputSpan.innerHTML = timeString;
        }
    }

    bombFlagged() {
        this.dashboard.bombsLeft.value--;
        this.dashboard.bombsLeft.outputSpan.innerHTML = this.dashboard.bombsLeft.value;
    }

    bombUnflagged() {
        this.dashboard.bombsLeft.value++;
        this.dashboard.bombsLeft.outputSpan.innerHTML = this.dashboard.bombsLeft.value;
    }

    setTransparency(status) {
        console.log("Setting transparency to " + status);
        this.objList.forEach(obj => {
            if (obj instanceof CubeElement || obj instanceof StartButton)
                obj.setTransparency(status);
        });
    }

    renderEnvironment(time) {
        // Re evaluate camera position
        this.camera.moveCamera();

        this.updateTimer();

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
