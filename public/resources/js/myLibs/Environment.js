import {
    Camera
} from "./Camera.js";
import {
    RenderEngine
} from "./WebGL_helper_functions/RenderEngine.js";
import {
    MeshLoader
} from "./WebGL_helper_functions/MeshLoader.js";

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

        this.camera = new Camera(this.gl.canvas);
        Camera.setCameraControls(this.gl.canvas, this.camera);

        this.renderEngine = new RenderEngine(this.gl, {enablePicker: true, enableTransparency: true});

		this.gl.canvas.addEventListener("mouseup", e => {
			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const objID = this.renderEngine.detectObject(mouseX, mouseY);
			console.log("Click at " + mouseX + ", " + mouseY + (objID != 0 ? ". Object id detected: " + objID : ". No object detected"));
			if (objID != 0) 
				this.handleObjectClick(objID);
		});
    }

    async addObject(obj) {
        this.objList.push(obj);
        await MeshLoader.LoadOBJAndMesh(this.gl, obj);
    }

    removeObject(objName) {
        this.objList = this.objList.filter(obj => obj.name != objName);
    }

    async reloadMeshes() {
        for (let obj of this.objList) {
            await MeshLoader.LoadOBJAndMesh(this.gl, obj);
        }
    }

    renderEnvironment(time) {
        // Re evaluate camera position
        this.camera.moveCamera();

        this.objList.forEach(obj => obj.updateObject(time));

        this.renderEngine.render(this.camera.getSharedUniforms(), this.programInfo, this.objList, this.pickerProgramInfo);
    }

	handleObjectClick(objID) {
		for (let obj of this.objList) {
			if (obj.id == objID) {
				obj.onClick();
				MeshLoader.LoadOBJAndMesh(this.gl, obj);
				break;
			}
		}
	}
}