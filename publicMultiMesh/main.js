import { ObjectRenderer } from "./ObjectRenderer.js";
import { Environment } from "./Environment.js";

async function main() {
	
	const env = new Environment("#canvas");

	await env.addObject(new ObjectRenderer("Chair", './chair.obj'));
	await env.addObject(new ObjectRenderer("Boeing", './boeing.obj'));
	await env.addObject(new ObjectRenderer("Axes", './axes.obj'));

	function render(time) {
		time *= 0.001;  // convert to seconds

		env.render(time);

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

main();