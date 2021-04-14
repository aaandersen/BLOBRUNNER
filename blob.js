class Blob {
    constructor(x = windowWidth * 0.5, y = windowHeight * 0.5, radius = 20) {
        this.pos = createVector(x, y)
        this.vel = createVector(0, 0)
        this.acc = createVector(0, 0)
        this.radius = radius
        this.hue = random(0, 100)
        this.saturation = 100
        this.lightness = 100

    }
    update() {}
    show() {
        stroke(this.hue, this.saturation, this.lightness * 0.5)
        fill(this.hue, this.saturation, this.lightness)
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2)
    }
}

class BlobEatable extends Blob {
    constructor(x, y, radius) {
        super(x, y, radius)
        this.hue = random(35, 45)
    }
}

class BlobPoisonous extends Blob {
    constructor(x, y, radius) {
        super(x, y, radius)
        this.hue = random(0, 10)
        this.radiusInitial = radius
        this.radiusOffset = random(TWO_PI)
    }
    update() {
        this.radius = sin(frameCount * 0.1 + this.radiusOffset) + this.radiusInitial
    }
}


 class BlobDeadly extends Blob {
     constructor(x, y, radius) {
         super(x, y, radius)
         this.speed = 4
         this.hue = 80
         this.vel = createVector(random(-this.speed, this.speed), random(-this.speed, this.speed))
     }
     update() {
        this.pos.add(this.vel);
        if (this.pos.y < boundary.top + this.radius) {
            this.vel.mult(1, -1)
        }
        if (this.pos.x > boundary.right - this.radius) {
            this.vel.mult(-1, 1)
        }
        if (this.pos.y > boundary.bottom - this.radius) {
            this.vel.mult(1, -1)
        }
        if (this.pos.x < boundary.left + this.radius) {
            this.vel.mult(-1, 1)
        }
        
     }
 }


class BlobPlayer extends Blob {
    constructor(x, y, radius) {
        super(x, y, radius)
        this.lightness = 0
        this.speed = 2
    }
    
    update(boundary) {
        let newvel = createVector(mouseX - windowWidth / 2, mouseY - windowHeight / 2)
        newvel.setMag(this.speed)
        this.vel.lerp(newvel, 0.2)
        this.pos.add(this.vel)

        if (this.pos.y < boundary.top + this.radius) {
            this.pos.y = boundary.top + this.radius
        }
        if (this.pos.x > boundary.right - this.radius) {
            this.pos.x = boundary.right - this.radius
        }
        if (this.pos.y > boundary.bottom - this.radius) {
            this.pos.y = boundary.bottom - this.radius
        }
        if (this.pos.x < boundary.left + this.radius) {
            this.pos.x = boundary.left + this.radius
        }
    }
    eats(other) {
        const type = other.constructor.name
        var d = p5.Vector.dist(this.pos, other.pos)
        if (d < this.radius + other.radius) {
            
            if (type === 'BlobEatable') {
                var sum = PI * this.radius * this.radius + PI * other.radius * other.radius
                this.radius = sqrt(sum / PI)
                this.speed *= 1.1
                score++;
                scoregreen++;
                Point.play();
            } else if (type === 'BlobPoisonous') {
                var sum = PI * this.radius * this.radius - PI * other.radius * other.radius
                this.radius = sqrt(sum / PI)
                this.speed *= 0.9
                score--;
                Hit.play();
            } else if (type === 'BlobDeadly'){
                score = 0
            }
            return true
        } else {
            return false
        }
    }
}