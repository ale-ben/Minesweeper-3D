export class Camera {
	constructor(canvas) {
		this.target = [0, 0, 0];
		this.position = [0, 0, 0];
		this.up = [0, 0, 1];
		this.fovRad = 70;
		this.near = 1;
		this.far = 2000;
		this.radius = 24;
		this.aspect = canvas.clientWidth / canvas.clientHeight;
		this.movement = {
			delta: {
				x: 0,
				y: 0
			},
			angle: {
				xy: degToRad(45),
				xz: degToRad(45)
			},
			dragging: false,
			updateCamera: true
		};
	}

	setAspect(canvas) {
		this.aspect = canvas.clientWidth / canvas.clientHeight;
	}

	setFov(fovDeg) {
		this.fovRad = degToRad(fovDeg);
	}

	getFov() {
		return radToDeg(this.fovRad);
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
		if (this.movement.updateCamera) {
			this.position[0] = this.radius * Math.cos(this.movement.angle.xz) * Math.cos(this.movement.angle.xy);
			this.position[1] = this.radius * Math.cos(this.movement.angle.xz) * Math.sin(this.movement.angle.xy);
			this.position[2] = this.radius * Math.sin(this.movement.angle.xz);
			this.movement.updateCamera = false;
		}
	}

	static setCameraControls(canvas, camera) {
		// Mouse camera controls.
	
		canvas.addEventListener("mousedown", function (event) {
			console.log("mousedown");
			camera.movement.old = {
				x: event.pageX,
				y: event.pageY
			};
			camera.movement.dragging = true;
		});
	
		canvas.addEventListener("mouseup", function (event) {
			console.log("mouseup");
			camera.moveCamera();
			camera.movement.dragging = false;
		});
	
		canvas.addEventListener("mousemove", function (event) {
			if (!camera.movement.dragging) return;

			function minimizeAngle(angle) {
				const piRad = degToRad(180);
				if (angle > piRad) return (angle%piRad)-piRad;
				if (angle < -piRad) return (angle%piRad)+piRad;
				return angle;
			}

			function lockAngle(angle, maxDeg) {
				const maxRad = degToRad(maxDeg);
				if (angle > maxRad) return maxRad;
				if (angle < -maxRad) return -maxRad;
				return angle;
			}

			console.log("mousemove", radToDeg(camera.movement.angle.xy), radToDeg(camera.movement.angle.xz));
			let movement = camera.movement;

			let deltaY = (-(event.pageY - movement.old.y) * 2 * Math.PI) / canvas.height;
			let deltaX = (-(event.pageX - movement.old.x) * 2 * Math.PI) / canvas.width;

			movement.angle.xy = minimizeAngle(movement.angle.xy + deltaX);

			movement.angle.xz = lockAngle(movement.angle.xz + deltaY, 89);
			
			movement.old.x = event.pageX;
			movement.old.y = event.pageY;

			movement.updateCamera = true;
		});
	}
}

function degToRad(d) {
	return d * Math.PI / 180;
}

function radToDeg(r) {
	return r * 180 / Math.PI;
}