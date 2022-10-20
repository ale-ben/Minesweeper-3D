let updateCamera = true;
// Parametri globali utilizzati all'interno di Camera.js.
//
let drag;
let THETA = degToRad(170),
	PHI = degToRad(40);
let old_x, old_y;
let dX, dY;

//
let radius = 24;
let maxRadius = 24,
	minRadius = 3;

// Definizione della classe "Camera".
// A suo interno vi è la completa gestione delle caratteristiche relative
// alla camera.
export class Camera {
	// Costruttore della classe "Camera".
	// position, posizione spaziale (x, y, z) della camera.
	// up, ...
	// target, soggetto della scena.
	// fieldOfView, ...
	constructor(position, up, target, fieldOfView) {
		this.position = position;
		this.up = up;
		this.target = target;
		this.fieldOfView = fieldOfView;
	}

	radiusModify(radius) {
		return radius * Math.cos(PHI);
	}

	moveCamera() {
		console.log("Camera update");
		this.position[0] = Math.cos(THETA) * this.radiusModify(radius);
		this.position[1] = Math.sin(THETA) * this.radiusModify(radius);
		this.position[2] = Math.sin(PHI) * radius;
		updateCamera = false;
	}

	// Compute the camera's matrix using look at.
	cameraMatrix() {
		return m4.lookAt(this.position, this.target, this.up);
	}

	// Make a view matrix from the camera matrix.
	viewMatrix() {
		return m4.inverse(this.cameraMatrix());
	}

	// Compute the projection matrix
	projectionMatrix(gl) {
		let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		return m4.perspective(this.fieldOfView, aspect, 1, 2000);
	}
}

export function getUpdateCamera() {
	return updateCamera;
}

export function setCameraControls(canvas, isActive) {
	window.addEventListener("keydown", onKeyDown, true);

	canvas.onmousedown = function (e) {
		drag = true;
		old_x = e.pageX;
		old_y = e.pageY;
		e.preventDefault();
		return false;
	};

	canvas.onmouseup = function (e) {
		drag = false;
	};

	canvas.onmousemove = function (e) {
		if (!drag) return false;
		updateCamera = true;
		dX = (-(e.pageX - old_x) * 2 * Math.PI) / canvas.width;
		dY = (-(e.pageY - old_y) * 2 * Math.PI) / canvas.height;
		THETA += dX;
		PHI -= dY;
		if (PHI > degToRad(75)) PHI = degToRad(75);
		if (PHI < degToRad(35)) PHI = degToRad(35);
		old_x = e.pageX;
		old_y = e.pageY;
		e.preventDefault();
	};

	// Lista codici - tastiera
	// 87 >> " W "
	// 83 >> " S "
	function onKeyDown(e) {
		if (isActive) {
			// console.log("Rilevato un movimento del raggio della camera.");
			if (e.keyCode === 87 && radius > minRadius) radius -= 1;
			else if (e.keyCode === 83 && radius < maxRadius) radius += 1;
			// console.log(radius, maxRadius, minRadius);
			updateCamera = true;
		}
	}
}

function degToRad(d) {
	return (d * Math.PI) / 180;
}
