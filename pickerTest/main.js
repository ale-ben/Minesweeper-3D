"use strict";

function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // creates buffers with position, normal, texcoord, and vertex color
    // data for primitives by calling gl.createBuffer, gl.bindBuffer,
    // and gl.bufferData
    const cubeBufferInfo = primitives.createCubeWithVertexColorsBufferInfo(gl, 20);

    // setup GLSL programs
    const programInfo = webglUtils.createProgramInfo(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
    const pickingProgramInfo = webglUtils.createProgramInfo(gl, ["pick-vertex-shader", "pick-fragment-shader"]);

    function degToRad(d) {
        return (d * Math.PI) / 180;
    }

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    const fieldOfViewRadians = degToRad(60);
    const near = 1;
    const far = 2000;

    const objectsToDraw = [];
    const objects = [];
    const viewProjectionMatrix = m4.identity();

    // Make infos for each object for each object.
    const numObjects = 5;
    for (let ii = 0; ii < numObjects; ++ii) {
        const id = ii + 1;
        const object = {
            uniforms: {
                u_colorMult: [
                    0.5, 0.5, 1, 1
                ],
                u_world: m4.identity(),
                u_viewProjection: viewProjectionMatrix,
                u_id: [
                    ((id >> 0) & 0xff) / 0xff,
                    ((id >> 8) & 0xff) / 0xff,
                    ((id >> 16) & 0xff) / 0xff,
                    ((id >> 24) & 0xff) / 0xff
                ]
            },
            translation: [
                rand(-100, 100),
                rand(-100, 100),
                rand(-150, -50)
            ],
            xRotationSpeed: rand(0.8, 1.2),
            yRotationSpeed: rand(0.8, 1.2)
        };
        objects.push(object);
        objectsToDraw.push({
            programInfo: programInfo,
            bufferInfo: cubeBufferInfo,
            uniforms: object.uniforms
        });
    }

    // Create a texture to render to
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    function setFramebufferAttachmentSizes(width, height) {
        gl.bindTexture(gl.TEXTURE_2D, targetTexture);
        // define size and format of level 0
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const format = gl.RGBA;
        const type = gl.UNSIGNED_BYTE;
        const data = null;
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, format, type, data);

        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }
    setFramebufferAttachmentSizes(1, 1);

    // Create and bind the framebuffer
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

    // make a depth buffer and the same size as the targetTexture
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    function computeMatrix(translation, xRotation, yRotation) {
        let matrix = m4.translation(translation[0], translation[1], translation[2]);
        matrix = m4.xRotate(matrix, xRotation);
        return m4.yRotate(matrix, yRotation);
    }

    requestAnimationFrame(drawScene);

    function drawObjects(objectsToDraw, overrideProgramInfo) {
        objectsToDraw.forEach(function(object) {
            const programInfo = overrideProgramInfo || object.programInfo;
            const bufferInfo = object.bufferInfo;

            gl.useProgram(programInfo.program);

            // Setup all the needed attributes.
            webglUtils.setBuffersAndAttributes(gl, programInfo, bufferInfo);

            // Set the uniforms.
            webglUtils.setUniforms(programInfo, object.uniforms);

            // Draw
            gl.drawArrays(gl.TRIANGLES, 0, bufferInfo.numElements);
        });
    }

    let mouseX = -1;
    let mouseY = -1;
    let oldPickNdx = -1;
    let oldPickColor;

    // Draw the scene.
    function drawScene(time) {
        time *= 0.0005;

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);

        // Compute the camera's matrix using look at.
        const cameraPosition = [0, 0, 100];
        const target = [0, 0, 0];
        const up = [0, 1, 0];
        const cameraMatrix = m4.lookAt(cameraPosition, target, up);

        // Make a view matrix from the camera matrix.
        const viewMatrix = m4.inverse(cameraMatrix);

        // Compute the matrices for each object.
        objects.forEach(function(object) {
            object.uniforms.u_world = computeMatrix(object.translation, object.xRotationSpeed * time, object.yRotationSpeed * time);
        });

        // ------ Draw the objects to the texture --------

        // Figure out what pixel is under the mouse and setup
        // a frustum to render just that pixel

        {
            // compute the rectangle the near plane of our frustum covers
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const top = Math.tan(fieldOfViewRadians * 0.5) * near;
            const bottom = -top;
            const left = aspect * bottom;
            const right = aspect * top;
            const width = Math.abs(right - left);
            const height = Math.abs(top - bottom);

            // compute the portion of the near plane covers the 1 pixel
            // under the mouse.
            const pixelX = (mouseX * gl.canvas.width) / gl.canvas.clientWidth;
            const pixelY = gl.canvas.height - (mouseY * gl.canvas.height) / gl.canvas.clientHeight - 1;

            const subLeft = left + (pixelX * width) / gl.canvas.width;
            const subBottom = bottom + (pixelY * height) / gl.canvas.height;
            const subWidth = width / gl.canvas.width;
            const subHeight = height / gl.canvas.height;

            // make a frustum for that 1 pixel
            const projectionMatrix = m4.frustum(subLeft, subLeft + subWidth, subBottom, subBottom + subHeight, near, far);
            m4.multiply(projectionMatrix, viewMatrix, viewProjectionMatrix);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, 1, 1);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        drawObjects(objectsToDraw, pickingProgramInfo);

        // read the 1 pixel
        const data = new Uint8Array(4);
        gl.readPixels(0, // x
            0, // y
            1, // width
            1, // height
            gl.RGBA, // format
            gl.UNSIGNED_BYTE, // type
            data); // typed array to hold result
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

        // highlight object under mouse
        if (id > 0) {
			console.log("Hovering object with id: " + id);
        }

        // ------ Draw the objects to the canvas

        {
            // Compute the projection matrix
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, near, far);

            m4.multiply(projectionMatrix, viewMatrix, viewProjectionMatrix);
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        drawObjects(objectsToDraw);

        requestAnimationFrame(drawScene);
    }

    gl.canvas.addEventListener("mousemove", e => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
}

main();
