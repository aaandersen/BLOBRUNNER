class Boundary {
    constructor(top, right, bottom, left) {
        this.top = top
        this.right = right
        this.bottom = bottom
        this.left = left
        // this.dimension angiver tykkelse
        this.dimension = 10
    }
    show() {
        // Rect(x-koordinatet til rektanglet, y-koordinatet til rektanglet, width/bredden, height/højden)

        fill(0)
        // Top
        rect(this.left, this.top, Math.abs(this.left) + this.right, this.dimension)
        // Right
        rect(this.right, this.top, -this.dimension, Math.abs(this.top) + this.bottom)
        // Bottom
        rect(this.left, this.bottom, Math.abs(this.left) + this.right, -this.dimension)
        // Left
        rect(this.left, this.top, this.dimension, Math.abs(this.top) + this.bottom)
    }
}
