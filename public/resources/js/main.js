import { ObjectRenderer } from "./myLibs/ObjectRenderer.js";
import { Environment } from "./myLibs/Environment.js";

async function main() {
	
	const env = new Environment("#canvas");

	await env.addObject(new ObjectRenderer("Cube", './resources/models/cube.obj', {x: 0, y: 0, z: 0}, './resources/models/cubeTextured.mtl'));
	await env.addObject(new ObjectRenderer("Cube", './resources/models/cube.obj', {x: 0, y: 0, z: 2}));
	//await env.addObject(new ObjectRenderer("Boeing", './resources/models/boeing.obj'));
	//await env.addObject(new ObjectRenderer("Chair", './resources/models/chair.obj', {x: -5, y: -5, z: 0}));
	await env.addObject(new ObjectRenderer("Axes", './resources/models/axes.obj'));

	function render(time) {
		time *= 0.001;  // convert to seconds

		env.render(time);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

main();