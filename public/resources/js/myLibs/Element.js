export class Element {
    static next_id = 1;
    constructor(name, filePath, options = {}) {
        if (debug && debug == true)
            console.log("Generated object renderer for " + name + " from " + filePath);
        this.name = name;
        this.filePath = filePath;

        if (options.hidden)
            this.hidden = true;

        if (options.center)
            this.center = options.center;
        else
            this.center = {
                x: 0,
                y: 0,
                z: 0
            };

        if (options.rotation)
            this.rotation = options.rotation;
        else
            this.rotation = {
                x: 0,
                y: 0,
                z: 0
            };

        if (options.mtlPath)
            this.mtlPath = options.mtlPath;

        this.uniforms = {
            u_world: m4.identity()
        };

        if (options.detectClick) {
            this.setID(Element.next_id++);
        } else {
            this.setID(0);
        }

        if (options.value || options.value == 0) {
            this.value = options.value;
            if (options.showCompleted)
                this.mtlPath = "./resources/models/cube" + this.value + ".mtl";
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

    onClick() {
        console.log("Clicked on " + this.name + " with value " + this.value);
        if (this.value || this.value == 0)
            this.mtlPath = "./resources/models/cube" + this.value + ".mtl";
		this.clicked = true;
    }
}
