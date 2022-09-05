 function GLInstance(canvasID) {
	var canvas = document.getElementById(canvasID);
	var gl = canvas.getContext('webgl2');

	if(!gl) {
		console.error("WebGL 2.0 isn't available");
		return null;
	}

	// WebGL setup

	// Specify which color to use when calling clear()
	gl.clearColor(1.0, 1.0, 1.0, 1.0);

	gl.fClear = function(){
		this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); //TODO: Comment
		return this
	}

	// Set the size of the canvas element and the rendering ViewPort
	gl.fSetSize = function(w,h) {
		// Some browsers need all 3 set in order to work properly
		this.canvas.style.width = w + "px";
		this.canvas.style.height = h + "px";
		this.canvas.width = w;
		this.canvas.height = h;
		this.viewport(0, 0, w, h);
		return this;
	}

	return gl;
 }