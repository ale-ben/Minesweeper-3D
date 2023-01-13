export class Camera {
    constructor(canvas) {
        this.target = [0, 0, 0];
        this.position = [0, 0, 0]; // This will be overwritten by moveCamera() after a drag movement, to set start position use angle xy and xz
        this.up = [0, 0, 1]; // Z axis will be up
        this.fovRad = 70;
        this.near = 1;
        this.far = 2000;
        this.radius = 15;
        this.lightPosition = [2, 2, 2];
        this.aspect = canvas.clientWidth / canvas.clientHeight;
        (this.defaultAngle = {
            xy: degToRad(0),
            xz: degToRad(0)
        }),
        (this.movement = {
            delta: {
                x: 0,
                y: 0
            },
            angle: {
                xy: this.defaultAngle.xy,
                xz: this.defaultAngle.xz
            },
            step: {
                xy: degToRad(10),
                xz: degToRad(2),
                zoom: 1
            },
            dragging: false,
            forceDrag: false,
            updateCamera: true
        });
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
            u_lightDirection: m4.normalize(this.lightPosition),
            u_view: view,
            u_projection: projection,
            u_viewWorldPosition: this.position
        };
    };

    /**
     * Update the camera position after a drag movement
     */
    moveCamera() {
        if (this.movement.updateCamera) {
            this.position[0] = this.radius * Math.cos(this.movement.angle.xz) * Math.cos(this.movement.angle.xy);
            this.position[1] = this.radius * Math.cos(this.movement.angle.xz) * Math.sin(this.movement.angle.xy);
            this.position[2] = this.radius * Math.sin(this.movement.angle.xz);
            if (syncLight == true) {
                this.lightPosition[0] = this.position[0];
                this.lightPosition[1] = this.position[1];
                this.lightPosition[2] = this.position[2];
            }
            this.movement.updateCamera = false;
        }
    }

    resetCamera() {
        if (debug == true)
            console.log("Reset camera");
        this.movement.dragging = false;
        this.movement.forceDrag = false;
        this.movement.angle.xy = this.defaultAngle.xy;
        this.movement.angle.xz = this.defaultAngle.xz;
        this.movement.updateCamera = true;
        this.moveCamera();
    }

    zoomIn() {
        if (this.radius > 5) {
            this.radius -= this.movement.step.zoom;
            this.movement.updateCamera = true;
            this.moveCamera();
        }
    }

    zoomOut() {
        if (this.radius < 30) {
            this.radius += this.movement.step.zoom;
            this.movement.updateCamera = true;
            this.moveCamera();
        }
    }

    moveLeft() {
        this.movement.angle.xy = minimizeAngle(this.movement.angle.xy - this.movement.step.xy);
        this.movement.updateCamera = true;
        this.moveCamera();
    }

    moveRight() {
        this.movement.angle.xy = minimizeAngle(this.movement.angle.xy + this.movement.step.xy);
        this.movement.updateCamera = true;
        this.moveCamera();
    }

    moveUp() {
        this.movement.angle.xz = lockAngle(this.movement.angle.xz + this.movement.step.xz, Math.PI / 2 - 0.001);
        this.movement.updateCamera = true;
        this.moveCamera();
    }

    moveDown() {
        this.movement.angle.xz = lockAngle(this.movement.angle.xz - this.movement.step.xz, Math.PI / 2 - 0.001);
        this.movement.updateCamera = true;
        this.moveCamera();
    }

    /**
     * Set camera drag movement event listeners
     * @param {*} canvas
     * @param {*} camera
     */
    static setCameraControls(canvas, camera) {
        /**
         * On mouse down, set dragging to true and save starting position
         */
        canvas.addEventListener("mousedown", function(event) {
            if (event.button == 1) {
                if (debug == true)
                    console.log("mousedown");
                event.preventDefault();
                camera.movement.old = null;
                camera.movement.dragging = true;
            }
        });

        canvas.addEventListener("touchstart", function(event) {
            // TODO: mode selector, camera / click
            if (debug == true)
                console.log("touchstart");
            event.preventDefault();
            camera.movement.old = null;
            camera.movement.dragging = true;
        });

        /**
         * On mouse up, set dragging to false and update camera position
         */
        canvas.addEventListener("mouseup", function(event) {
            if (event.button == 1) {
                event.preventDefault();
                if (debug == true)
                    console.log("mouseup");
                camera.moveCamera();
                camera.movement.dragging = false;
            }
        });

        canvas.addEventListener("touchend", function(event) {
            // TODO: mode selector, camera / click
            event.preventDefault();
            if (debug == true)
                console.log("touchend");
            camera.moveCamera();
            camera.movement.dragging = false;
        });

        /**
         * On mouse move, update camera position angle if dragging
         */
        canvas.addEventListener("mousemove", function(event) {
            event.preventDefault();
            if (!camera.movement.dragging && !camera.movement.forceDrag)
                return;

            if (debug == true)
                console.log("mousemove", camera.movement);

            if (camera.movement.old) {
                // Compute drag delta
                let deltaY = (-(event.pageY - camera.movement.old.y) * 2 * Math.PI) / canvas.height;
                let deltaX = (-(event.pageX - camera.movement.old.x) * 2 * Math.PI) / canvas.width;

                // Update camera angle
                camera.movement.angle.xy = minimizeAngle(camera.movement.angle.xy + deltaX);
                camera.movement.angle.xz = lockAngle(camera.movement.angle.xz - deltaY, Math.PI / 2 - 0.001);
            }

            // Save current mouse position
            camera.movement.old = {
                x: event.pageX,
                y: event.pageY
            };

            camera.movement.updateCamera = true;
        });

        canvas.addEventListener("touchmove", function(event) {
            event.preventDefault();

            if (!camera.movement.dragging && !camera.movement.forceDrag)
                return;

            if (debug == true)
                console.log("touchmove", camera.movement);

			let touch = event.touches[0];

            if (camera.movement.old) {
                // Compute drag delta
                let deltaY = (-(touch.pageY - camera.movement.old.y) * 2 * Math.PI) / canvas.height;
                let deltaX = (-(touch.pageX - camera.movement.old.x) * 2 * Math.PI) / canvas.width;

                // Update camera angle
                camera.movement.angle.xy = minimizeAngle(camera.movement.angle.xy + deltaX);
                camera.movement.angle.xz = lockAngle(camera.movement.angle.xz - deltaY, Math.PI / 2 - 0.001);
            }

            // Save current mouse position
            camera.movement.old = {
                x: touch.pageX,
                y: touch.pageY
            };

            camera.movement.updateCamera = true;
        });

        canvas.addEventListener("touchcancel", function(event) {});

        window.addEventListener("keydown", function(event) {
            event.preventDefault();
            switch (event.key) {
                case "r":
                    camera.resetCamera();
                    break;
                case "e":
                    camera.zoomIn();
                    break;
                case "q":
                    camera.zoomOut();
                    break;
                case "w":
                    camera.moveUp();
                    break;
                case "s":
                    camera.moveDown();
                    break;
                case "a":
                    camera.moveLeft();
                    break;
                case "d":
                    camera.moveRight();
                    break;
                case "Shift":
                    camera.movement.forceDrag = true;
                    camera.movement.old = null;
                    break;
            }
        });

        window.addEventListener("keyup", function(event) {
            event.preventDefault();
            switch (event.key) {
                case "Shift":
                    camera.movement.forceDrag = false;
            }
        });

        window.addEventListener("wheel", event => {
            const delta = Math.sign(event.deltaY);
            if (delta > 0)
                camera.zoomIn();
            else
                camera.zoomOut();
        });
    }
}

function degToRad(d) {
    return (d * Math.PI) / 180;
}

function radToDeg(r) {
    return (r * 180) / Math.PI;
}

/**
 * Make sure that the angle is between -PI and PI. If outside map it to the equivalent angle inside the range.
 * @param {*} angle
 * @returns
 */
function minimizeAngle(angle) {
    if (angle > Math.PI)
        return (angle % Math.PI) - Math.PI;
    if (angle < -Math.PI)
        return (angle % Math.PI) + Math.PI;
    return angle;
}

/**
 * Force an angle to be in an interval between -maxRad and maxRad
 * @param {*} angle
 * @param {*} maxRad
 * @returns
 */
function lockAngle(angle, maxRad) {
    if (angle > maxRad)
        return maxRad;
    if (angle < -maxRad)
        return -maxRad;
    return angle;
}
