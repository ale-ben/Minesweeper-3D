export class Camera {
	constructor(canvas) {
		this.target = [0, 0, 0];
		this.position = [15, 15, 15];
		this.up = [0, 1, 0];
		this.fovRad = 45;
		this.near = 0.1;
		this.far = 1000;
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
}