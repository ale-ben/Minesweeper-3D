export class Element {
    static next_id = 1;
    constructor(name, filePath, center = null, rotation = null, detectClick = false, mtlPath = null) {
        if (debug && debug == true)
            console.log("Generated object renderer for " + name + " from " + filePath);
        this.name = name;
        this.filePath = filePath;

		if (center)
			this.center = center;
		else 
			this.center = {x: 0, y: 0, z: 0};

		if (rotation)
		    this.rotation = rotation;
		else
			this.rotation = {x: 0, y: 0, z: 0};

		if (mtlPath)
            this.mtlPath = mtlPath;

		this.uniforms = {
			u_world: m4.identity(),
		};

		if (detectClick) {
            this.setID(Element.next_id++);
        } else {
            this.setID(0);
        }
    }

	setID(id) {
		this.id = id;
		this.uniforms.u_id = [
			((this.id >> 0) & 0xff) / 0xff,
			((this.id >> 8) & 0xff) / 0xff,
			((this.id >> 16) & 0xff) / 0xff,
			((this.id >> 24) & 0xff) / 0xff
		];
	}

    updateObject(time) {}
}
