export class Camera {
	constructor(canvas) {
		this.target = [0, 0, 0];
		this.position = [15, 15, 15];
		this.up = [0, 1, 0];
		this.fovRad = 45;
		this.near = 0.1;
		this.far = 1000;
		this.radius = 24;
		this.aspect = canvas.clientWidth / canvas.clientHeight;
	}

	setAspect(canvas) {
		this.aspect = canvas.clientWidth / canvas.clientHeight;
	}

	setFov(fovDeg) {
		this.fovRad = fovDeg * Math.PI / 180;
	}

	getFov() {
		return this.fovRad * 180 / Math.PI;
	}

	getSharedUniforms = () => {

		// Compute the camera's matrix using look at.
		const camera = m4.lookAt(this.position, this.target, this.up);
		// Make a view matrix from the camera matrix.
		const view = m4.inverse(camera);
		const projection = m4.perspective(this.fovRad, this.aspect, this.near, this.far);

		return {
			u_lightDirection: m4.normalize([-1, 3, 5]), //TODO
			u_view: view,
			u_projection: projection,
			u_viewWorldPosition: this.position,
		}
	};

	moveCamera() {
		if (this.movement) {
			this.position[0] = this.radius * Math.cos(this.movement.angleY) * Math.cos(this.movement.angleX);
			this.position[1] = this.radius * Math.cos(this.movement.angleY) * Math.sin(this.movement.angleX);
			this.position[2] = this.radius * Math.sin(this.movement.angleY);
		}
	}

	static setCameraControls(canvas, camera) {
		// Mouse camera controls.
	
		canvas.addEventListener("mousedown", function (event) {
			console.log("mousedown");
			camera.movement = {
				oldX: event.pageX,
				oldY: event.pageY,
				angleX: 0,
				angleY: 0,
			};
			return false;
		});
	
		canvas.addEventListener("mouseup", function (event) {
			console.log("mouseup");
			camera.moveCamera();
			camera.movement = null;
		});
	
		canvas.addEventListener("mousemove", function (event) {
			if (!camera.movement) return false;
			console.log("mousemove", camera.movement);
			let movement = camera.movement;
			let deltaY = (-(event.pageY - movement.oldY) * 2 * Math.PI) / canvas.height;
			let deltaX = (-(event.pageX - movement.oldX) * 2 * Math.PI) / canvas.width;
			movement.angleX += deltaX;
			movement.angleY -= deltaY;
			movement.oldX = event.pageX;
			movement.oldY = event.pageY;
		});
	}
}