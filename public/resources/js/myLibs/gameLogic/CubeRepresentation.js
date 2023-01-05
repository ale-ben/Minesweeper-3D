export class CubeRepresentation {
    constructor(size = 5) {
        this.cube = [];
        this.size = size;

        this.cube = new Array(size * size * size).fill(0);
    }

    setCellValue(x, y, z, value) {
        if (this.getCellValue(x, y, z) != 9)
            this.cube[x * this.size * this.size + y * this.size + z] = value;
    }

    getCellValue(x, y, z) {
        return this.cube[x * this.size * this.size + y * this.size + z];
    }

    addBomb(x, y, z) {
        this.setCellValue(x, y, z, 9);

        // ------ Update the surrounding cells

        let borders = 0;

        if (x == 0 || x == this.size - 1)
            borders++;
        if (y == 0 || y == this.size - 1)
            borders++;
        if (z == 0 || z == this.size - 1)
            borders++;

        if (borders == 3) {
            // The cell is in a corner

			if (x == this.size-1) {
				this.setCellValue(x-1, y, z, this.getCellValue(x-1, y, z) + 1);

				if (y == this.size -1) {
					this.setCellValue(x, y-1, z, this.getCellValue(x, y-1, z) + 1);
					this.setCellValue(x-1, y-1, z, this.getCellValue(x-1, y-1, z) + 1);

					if (z == this.size -1) {
						this.setCellValue(x, y-1, z-1, this.getCellValue(x, y-1, z-1) + 1);
						this.setCellValue(x, y, z-1, this.getCellValue(x, y, z-1) + 1);
						this.setCellValue(x-1, y, z-1, this.getCellValue(x-1, y, z-1) + 1);
					} else if (z == 0) {
						this.setCellValue(x, y-1, z+1, this.getCellValue(x, y-1, z+1) + 1);
						this.setCellValue(x, y, z+1, this.getCellValue(x, y, z+1) + 1);
						this.setCellValue(x-1, y, z+1, this.getCellValue(x-1, y, z+1) + 1);
					}
				} else if (y == 0) {
					this.setCellValue(x, y+1, z, this.getCellValue(x, y+1, z) + 1);
					this.setCellValue(x-1, y+1, z, this.getCellValue(x-1, y+1, z) + 1);

					if (z == this.size -1) {
						this.setCellValue(x, y+1, z-1, this.getCellValue(x, y+1, z-1) + 1);
						this.setCellValue(x, y, z-1, this.getCellValue(x, y, z-1) + 1);
						this.setCellValue(x-1, y, z-1, this.getCellValue(x-1, y, z-1) + 1);
					} else if (z == 0) {
						this.setCellValue(x, y+1, z+1, this.getCellValue(x, y+1, z+1) + 1);
						this.setCellValue(x, y, z+1, this.getCellValue(x, y, z+1) + 1);
						this.setCellValue(x-1, y, z+1, this.getCellValue(x-1, y, z+1) + 1);
					}
				}
			} else if (x == 0) {
				this.setCellValue(x+1, y, z, this.getCellValue(x+1, y, z) + 1);

				if (y == this.size -1) {
					this.setCellValue(x, y-1, z, this.getCellValue(x, y-1, z) + 1);
					this.setCellValue(x+1, y-1, z, this.getCellValue(x+1, y-1, z) + 1);

					if (z == this.size -1) {
						this.setCellValue(x, y-1, z-1, this.getCellValue(x, y-1, z-1) + 1);
						this.setCellValue(x, y, z-1, this.getCellValue(x, y, z-1) + 1);
						this.setCellValue(x+1, y, z-1, this.getCellValue(x+1, y, z-1) + 1);
					} else if (z == 0) {
						this.setCellValue(x, y-1, z+1, this.getCellValue(x, y-1, z+1) + 1);
						this.setCellValue(x, y, z+1, this.getCellValue(x, y, z+1) + 1);
						this.setCellValue(x+1, y, z+1, this.getCellValue(x+1, y, z+1) + 1);
					}
				} else if (y == 0) {
					this.setCellValue(x, y+1, z, this.getCellValue(x, y+1, z) + 1);
					this.setCellValue(x+1, y+1, z, this.getCellValue(x+1, y+1, z) + 1);

					if (z == this.size -1) {
						this.setCellValue(x, y+1, z-1, this.getCellValue(x, y+1, z-1) + 1);
						this.setCellValue(x, y, z-1, this.getCellValue(x, y, z-1) + 1);
						this.setCellValue(x+1, y, z-1, this.getCellValue(x+1, y, z-1) + 1);
					} else if (z == 0) {
						this.setCellValue(x, y+1, z+1, this.getCellValue(x, y+1, z+1) + 1);
						this.setCellValue(x, y, z+1, this.getCellValue(x, y, z+1) + 1);
						this.setCellValue(x+1, y, z+1, this.getCellValue(x+1, y, z+1) + 1);
					}
				}
			}

        } else if (borders == 2) {
            // The cell is in a border

            if (x == this.size - 1) {
                this.setCellValue(x - 1, y, z, this.getCellValue(x - 1, y, z) + 1);

                if (z == this.size - 1) {
                    this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);

                    this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);
                    this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);

                    this.setCellValue(x, y + 1, z - 1, this.getCellValue(x, y + 1, z - 1) + 1);
                    this.setCellValue(x, y - 1, z - 1, this.getCellValue(x, y - 1, z - 1) + 1);

                    this.setCellValue(x - 1, y + 1, z, this.getCellValue(x - 1, y + 1, z) + 1);
                    this.setCellValue(x - 1, y - 1, z, this.getCellValue(x - 1, y - 1, z) + 1);
                } else if (z == 0) {
                    this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);

                    this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);
                    this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);

                    this.setCellValue(x, y + 1, z + 1, this.getCellValue(x, y + 1, z + 1) + 1);
                    this.setCellValue(x, y - 1, z + 1, this.getCellValue(x, y - 1, z + 1) + 1);

                    this.setCellValue(x - 1, y + 1, z, this.getCellValue(x - 1, y + 1, z) + 1);
                    this.setCellValue(x - 1, y - 1, z, this.getCellValue(x - 1, y - 1, z) + 1);
                }

                if (y == this.size - 1) {
                    this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);

                    this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);
                    this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);

                    this.setCellValue(x, y - 1, z + 1, this.getCellValue(x, y - 1, z + 1) + 1);
                    this.setCellValue(x, y - 1, z - 1, this.getCellValue(x, y - 1, z - 1) + 1);

                    this.setCellValue(x - 1, y, z + 1, this.getCellValue(x - 1, y, z + 1) + 1);
                    this.setCellValue(x - 1, y, z - 1, this.getCellValue(x - 1, y, z - 1) + 1);
                } else if (y == 0) {
                    this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);

                    this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);
                    this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);

                    this.setCellValue(x, y + 1, z + 1, this.getCellValue(x, y + 1, z + 1) + 1);
                    this.setCellValue(x, y + 1, z - 1, this.getCellValue(x, y + 1, z - 1) + 1);

                    this.setCellValue(x - 1, y, z + 1, this.getCellValue(x - 1, y, z + 1) + 1);
                    this.setCellValue(x - 1, y, z - 1, this.getCellValue(x - 1, y, z - 1) + 1);
                }
            } else if (x == 0) {
                this.setCellValue(x + 1, y, z, this.getCellValue(x + 1, y, z) + 1);

                if (z == this.size - 1) {
                    this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);

                    this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);
                    this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);

                    this.setCellValue(x, y + 1, z - 1, this.getCellValue(x, y + 1, z - 1) + 1);
                    this.setCellValue(x, y - 1, z - 1, this.getCellValue(x, y - 1, z - 1) + 1);

                    this.setCellValue(x + 1, y + 1, z, this.getCellValue(x + 1, y + 1, z) + 1);
                    this.setCellValue(x + 1, y - 1, z, this.getCellValue(x + 1, y - 1, z) + 1);
                } else if (z == 0) {
                    this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);

                    this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);
                    this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);

                    this.setCellValue(x, y + 1, z + 1, this.getCellValue(x, y + 1, z + 1) + 1);
                    this.setCellValue(x, y - 1, z + 1, this.getCellValue(x, y - 1, z + 1) + 1);

                    this.setCellValue(x + 1, y + 1, z, this.getCellValue(x + 1, y + 1, z) + 1);
                    this.setCellValue(x + 1, y - 1, z, this.getCellValue(x + 1, y - 1, z) + 1);
                }

                if (y == this.size - 1) {
                    this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);

                    this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);
                    this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);

                    this.setCellValue(x, y - 1, z + 1, this.getCellValue(x, y - 1, z + 1) + 1);
                    this.setCellValue(x, y - 1, z - 1, this.getCellValue(x, y - 1, z - 1) + 1);

                    this.setCellValue(x + 1, y, z + 1, this.getCellValue(x + 1, y, z + 1) + 1);
                    this.setCellValue(x + 1, y, z - 1, this.getCellValue(x + 1, y, z - 1) + 1);
                } else if (y == 0) {
                    this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);

                    this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);
                    this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);

                    this.setCellValue(x, y + 1, z + 1, this.getCellValue(x, y + 1, z + 1) + 1);
                    this.setCellValue(x, y + 1, z - 1, this.getCellValue(x, y + 1, z - 1) + 1);

                    this.setCellValue(x + 1, y, z + 1, this.getCellValue(x + 1, y, z + 1) + 1);
                    this.setCellValue(x + 1, y, z - 1, this.getCellValue(x + 1, y, z - 1) + 1);
                }
            } else if (z == this.size - 1) {
                this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);

                this.setCellValue(x - 1, y, z, this.getCellValue(x - 1, y, z) + 1);
                this.setCellValue(x + 1, y, z, this.getCellValue(x + 1, y, z) + 1);

                this.setCellValue(x - 1, y, z - 1, this.getCellValue(x - 1, y, z - 1) + 1);
                this.setCellValue(x + 1, y, z - 1, this.getCellValue(x + 1, y, z - 1) + 1);

                if (y == this.size - 1) {
                    this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);

                    this.setCellValue(x + 1, y - 1, z, this.getCellValue(x + 1, y - 1, z) + 1);
                    this.setCellValue(x - 1, y - 1, z, this.getCellValue(x - 1, y - 1, z) + 1);
                } else if (y == 0) {
                    this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);

                    this.setCellValue(x + 1, y + 1, z, this.getCellValue(x + 1, y + 1, z) + 1);
                    this.setCellValue(x - 1, y + 1, z, this.getCellValue(x - 1, y + 1, z) + 1);
                }
            } else if (z == 0) {
                this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);

                this.setCellValue(x - 1, y, z, this.getCellValue(x - 1, y, z) + 1);
                this.setCellValue(x + 1, y, z, this.getCellValue(x + 1, y, z) + 1);

                this.setCellValue(x - 1, y, z + 1, this.getCellValue(x - 1, y, z + 1) + 1);
                this.setCellValue(x + 1, y, z + 1, this.getCellValue(x + 1, y, z + 1) + 1);

                if (y == this.size - 1) {
                    this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);

                    this.setCellValue(x + 1, y - 1, z, this.getCellValue(x + 1, y - 1, z) + 1);
                    this.setCellValue(x - 1, y - 1, z, this.getCellValue(x - 1, y - 1, z) + 1);
                } else if (y == 0) {
                    this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);

                    this.setCellValue(x + 1, y + 1, z, this.getCellValue(x + 1, y + 1, z) + 1);
                    this.setCellValue(x - 1, y + 1, z, this.getCellValue(x - 1, y + 1, z) + 1);
                }
            }
        } else {
            // The cell is in the middle

            if (x == 0 || x == this.size - 1) {
                this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);
                this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);
                this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);
                this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);
                this.setCellValue(x, y + 1, z + 1, this.getCellValue(x, y + 1, z + 1) + 1);
                this.setCellValue(x, y - 1, z - 1, this.getCellValue(x, y - 1, z - 1) + 1);
                this.setCellValue(x, y - 1, z + 1, this.getCellValue(x, y - 1, z + 1) + 1);
                this.setCellValue(x, y + 1, z - 1, this.getCellValue(x, y + 1, z - 1) + 1);
            } else if (y == 0 || y == this.size - 1) {
                this.setCellValue(x + 1, y, z, this.getCellValue(x + 1, y, z) + 1);
                this.setCellValue(x - 1, y, z, this.getCellValue(x - 1, y, z) + 1);
                this.setCellValue(x, y, z + 1, this.getCellValue(x, y, z + 1) + 1);
                this.setCellValue(x, y, z - 1, this.getCellValue(x, y, z - 1) + 1);
                this.setCellValue(x + 1, y, z + 1, this.getCellValue(x + 1, y, z + 1) + 1);
                this.setCellValue(x - 1, y, z - 1, this.getCellValue(x - 1, y, z - 1) + 1);
                this.setCellValue(x - 1, y, z + 1, this.getCellValue(x - 1, y, z + 1) + 1);
                this.setCellValue(x + 1, y, z - 1, this.getCellValue(x + 1, y, z - 1) + 1);
            } else if (z == 0 || z == this.size - 1) {
                this.setCellValue(x + 1, y, z, this.getCellValue(x + 1, y, z) + 1);
                this.setCellValue(x - 1, y, z, this.getCellValue(x - 1, y, z) + 1);
                this.setCellValue(x, y + 1, z, this.getCellValue(x, y + 1, z) + 1);
                this.setCellValue(x, y - 1, z, this.getCellValue(x, y - 1, z) + 1);
                this.setCellValue(x + 1, y + 1, z, this.getCellValue(x + 1, y + 1, z) + 1);
                this.setCellValue(x - 1, y - 1, z, this.getCellValue(x - 1, y - 1, z) + 1);
                this.setCellValue(x - 1, y + 1, z, this.getCellValue(x - 1, y + 1, z) + 1);
                this.setCellValue(x + 1, y - 1, z, this.getCellValue(x + 1, y - 1, z) + 1);
            }
        }
    }

    addBombs(amount) {
        let bombs = 0;
        while (bombs < amount) {
            let coords = this.getRandomCell();
            if (this.getCellValue(coords[0], coords[1], coords[2]) != 9) {
                this.addBomb(coords[0], coords[1], coords[2]);
                bombs++;
            }
        }
    }

    getRandomCell() {
        /*
		 I need to generate 2 random coordinates between 0 and this.size and 1 random coordinate that can be either 0 or this.size - 1.
		 To do this i will populate an array with 3 random numbers, 2 of them between 0 and this.size and 1 that can be either 0 or this.size - 1 and then i will randomly pick from this array to assign coordinates.
		*/
        let coordValues = [];
        coordValues.push(Math.floor(Math.random() * this.size));
        coordValues.push(Math.floor(Math.random() * this.size));
        // Random int between 0 and 1
        let tmp = Math.floor(Math.random() * 2);
        if (tmp == 0)
            coordValues.push(0);
        else
            coordValues.push(this.size - 1);

        // Random selection of coordinates
        let coords = [];

        var i = Math.floor(Math.random() * coordValues.length);
        coords.push(coordValues[i]);
        coordValues.splice(i, 1);

        i = Math.floor(Math.random() * coordValues.length);
        coords.push(coordValues[i]);
        coordValues.splice(i, 1);

        coords.push(coordValues[0]);

        return coords;
    }

    toString() {
        let str = "";
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                for (let k = 0; k < this.size; k++) {
                    str += this.getCellValue(i, j, k) + ", ";
                }
                str += "\n";
            }
            str += "----\n";
        }
        return str;
    }
}
