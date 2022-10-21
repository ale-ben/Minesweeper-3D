

export class ObjectRepresentation {
	constructor(name, sourceMesh) {
		this.name = name;
		this.mesh = {sourceMesh: sourceMesh };
		this.positions = [];
		this.normals = [];
		this.texcoords = [];
		this.numVertices;
		this.ambient;   //Ka
		this.diffuse;   //Kd
		this.specular;  //Ks
		this.emissive;  //Ke
		this.shininess; //Ns
		this.opacity;   //Ni
	}

	loadMesh(gl) {
		LoadMesh(gl, this);
	}
}
