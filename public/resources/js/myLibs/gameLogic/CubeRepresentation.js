export class CubeRepresentation {
    constructor(size = 5) {
        this.cube = [];
        this.size = size;

        this.cube = new Array(size*size).fill(0);
    }

    setCellValue(x, y, value) {
        if (this.getCellValue(x, y) != 9)
            this.cube[x * this.size + y] = value;
    }

    getCellValue(x, y) {
        return this.cube[x * this.size + y];
    }

    addBomb(x, y) {
        this.setCellValue(x, y, 9);

        // ------ Update the surrounding cells

        if (x > 0) {
            this.setCellValue(x - 1, y, this.getCellValue(x - 1, y) + 1);
            if (y > 0)
                this.setCellValue(x - 1, y - 1, this.getCellValue(x - 1, y - 1) + 1);
            if (y < this.size - 1)
                this.setCellValue(x - 1, y + 1, this.getCellValue(x - 1, y + 1) + 1);
        }

        if (x < this.size - 1) {
            this.setCellValue(x + 1, y, this.getCellValue(x + 1, y) + 1);
            if (y > 0)
                this.setCellValue(x + 1, y - 1, this.getCellValue(x + 1, y - 1) + 1);
            if (y < this.size - 1)
                this.setCellValue(x + 1, y + 1, this.getCellValue(x + 1, y + 1) + 1);
        }

		if (y > 0)
			this.setCellValue(x, y - 1, this.getCellValue(x, y - 1) + 1);
		if (y < this.size - 1)
			this.setCellValue(x, y + 1, this.getCellValue(x, y + 1) + 1);
    }

	addBombs(amount) {
		let bombs = 0;
		while (bombs < amount) {
			let x = Math.floor(Math.random() * this.size);
			let y = Math.floor(Math.random() * this.size);
			if (this.getCellValue(x, y) != 9) {
				this.addBomb(x, y);
				bombs++;
			}
		}
	}

	toString() {
		let str = "";
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				str += this.getCellValue(i, j) + ", ";
			}
			str += "\n";
		}
		return str;
	}
}