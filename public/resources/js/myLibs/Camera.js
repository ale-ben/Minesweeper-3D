export class Camera {
    constructor(canvas) {
        this.target = [0, 0, 0];
        this.position = [0, 0, 0]; // This will be overwritten by moveCamera() after a drag movement, to set start position use angle xy and xz
        this.up = [0, 0, 1]; // Z axis will be up
        this.fovRad = 70;
        this.near = 1;
        this.far = 2000;
        this.radius = 15;
        this.aspect = canvas.clientWidth / canvas.clientHeight;
        (this.defaultAngle = {
            xy: degToRad(10),
            xz: degToRad(30)
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
            u_lightDirection: m4.normalize([-1, 3, 5]), //TODO
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
            this.movement.updateCamera = false;
        }
    }

    resetCamera() {
        if (debug == true)
            console.log("Reset camera");
        this.movement.dragging = false;
        this.movement.angle.xy = this.defaultAngle.xy;
        this.movement.angle.xz = this.defaultAngle.xz;
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
            if (debug == true)
                console.log("mousedown");
            camera.movement.old = {
                x: event.pageX,
                y: event.pageY
            };
            camera.movement.dragging = true;
        });

        /**
         * On mouse up, set dragging to false and update camera position
         */
        canvas.addEventListener("mouseup", function(event) {
            if (debug == true)
                console.log("mouseup");
            camera.moveCamera();
            camera.movement.dragging = false;
        });

        /**
         * On mouse move, update camera position angle if dragging
         */
        canvas.addEventListener("mousemove", function(event) {
            if (!camera.movement.dragging)
                return;

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

            if (debug == true)
                console.log("mousemove", camera.movement);

            // Compute drag delta
            let deltaY = (-(event.pageY - camera.movement.old.y) * 2 * Math.PI) / canvas.height;
            let deltaX = (-(event.pageX - camera.movement.old.x) * 2 * Math.PI) / canvas.width;

            // Update camera angle
            camera.movement.angle.xy = minimizeAngle(camera.movement.angle.xy + deltaX);
            camera.movement.angle.xz = lockAngle(camera.movement.angle.xz - deltaY, Math.PI / 2 - 0.001);

            // Save current mouse position
            camera.movement.old.x = event.pageX;
            camera.movement.old.y = event.pageY;

            camera.movement.updateCamera = true;
        });

        window.addEventListener("keydown", function(event) {
            switch (event.key) {
                case "r":
                    camera.resetCamera();
                    break;
				case "e":
					camera.radius -= camera.movement.step.zoom;
					break;
				case "q":
					camera.radius += camera.movement.step.zoom;
					break;
				case "w":
					camera.movement.angle.xz += camera.movement.step.xz;
					break;
				case "s":
					camera.movement.angle.xz -= camera.movement.step.xz;
					break;
				case "a":
					camera.movement.angle.xy -= camera.movement.step.xy;
					break;
				case "d":
					camera.movement.angle.xy += camera.movement.step.xy;
					break;
            }

			camera.movement.updateCamera = true;
        });

		
    }
}

function degToRad(d) {
    return (d * Math.PI) / 180;
}

function radToDeg(r) {
    return (r * 180) / Math.PI;
}
