// Blob "superklasse"
class Blob {
    constructor(x = windowWidth * 0.5, y = windowHeight * 0.5, radius = 20) {
        // Deklarere pos som en p5. vektor
        this.pos = createVector(x, y)
        // Deklarere vel som en vektor
        this.vel = createVector(0, 0)
        // Deklarere radius
        this.radius = radius
        // Deklarere variabler til HSB farveskema
        this.hue = random(0, 100)
        this.saturation = 100
        this.lightness = 100

    }
    update() {}

    show() {
        // Tegner kant på cirkel
        stroke(this.hue, this.saturation, this.lightness * 0.5)
        // Bestemmer farve på cirkel
        fill(this.hue, this.saturation, this.lightness)
        // Tegner cirklen
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2)
    }
}

// Klassen for BlobEatable som er en subklasse til Blob
class BlobEatable extends Blob {
    constructor(x, y, radius) {
        super(x, y, radius) // kalder forældrens constructor
        this.hue = random(35, 45)
    }
}
// Klassen for BlobPoisonous der er en subklasse til Blob    
class BlobPoisonous extends Blob {
    constructor(x, y, radius) {
        super(x, y, radius)
        this.hue = random(0, 10)
        // Gemmer radius i ny variabel udfra startværdien
        this.radiusInitial = radius
        // Radiusoffset
        this.radiusOffset = random(TWO_PI)
    }
    update() {
        // BlobPoisonous animation herunder gør det så radius på cirklen oscillerer, der det giver en sjov effekt
        this.radius = sin(frameCount * 0.1 + this.radiusOffset) + this.radiusInitial
    }
}

// Klassen for BlobDeadly der er en subklasse til Blob
 class BlobDeadly extends Blob {
     constructor(x, y, radius) {
         super(x, y, radius)
         this.speed = 4
         this.hue = 80
         // Giver BlobDeadly en tilfældig hastighed og retning i intervallet imellem -4 og 4 
         this.vel = createVector(random(-this.speed, this.speed), random(-this.speed, this.speed))
     }
     update() {
        // Tilføjer this.vel til this.pos
        this.pos.add(this.vel);
        // Determinerer om Blobdeadly har ramt boundary
        if (this.pos.y < boundary.top + this.radius) {
            // Ganger vel med -1, så hastigheden bliver modsat. Herunder at BlobDeadly bliver sat i modsat retning
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
        // Bestemmer hastighed
        this.speed = 2
    }
    
    update(boundary) {
        // Opretter en vektor mellem mus og blobposition, så vi kan styre BlobPlayer retning
        let newvel = createVector(mouseX - windowWidth / 2, mouseY - windowHeight / 2)
        // Bestemmer længden af vektoren og dermed hastigheden for blob player
        newvel.setMag(this.speed)
        // Forkortelse for lineær interpolation, og bruges til at lave en blød overgang melllem gammel og ny vektor
        this.vel.lerp(newvel, 0.2)
        // Tilføjer vel til pos
        this.pos.add(this.vel)
        
        
        // Sikrer at man ikke kan komme udenfor boundary
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
        // "d" beregner om man spiser nogle af den andre blobs, ved brug af kollistionslogik
        var d = p5.Vector.dist(this.pos, other.pos)
        if (d < this.radius + other.radius) 
        {
            
            if (type === 'BlobEatable') {
                // Beregner den nye størrelse udfra arealet af blob player + den andes areal.
                var sum = PI * this.radius * this.radius + PI * other.radius * other.radius
                // Bestemmer blobPlayers nye radius udfra overflade areal
                this.radius = sqrt(sum / PI)
                // Forøger hastigheden med en konstant
                this.speed *= 1.1
                // Holder øje med din samlet score
                score++;
                // Tæller antallet af BlobEatable du har spist
                scoregreen++;
                // Afspiller lyd
                Point.play();
            } else if (type === 'BlobPoisonous') {
                // Beregner den nye størrelse udfra arealet af blob player - den andes areal.
                var sum = PI * this.radius * this.radius - PI * other.radius * other.radius
                // Finder radius udfra overflade areal
                this.radius = sqrt(sum / PI)
                // Gør hastigheden mindre med en konstant
                this.speed *= 0.9
                // Sænker samlet score 
                score--;
                // Afspiller hit lyd. 
                Hit.play();
            
            } else if (type === 'BlobDeadly'){
                // Rammer du BlobDeadly, dør du med det samme. Derfor bliver score 0. 
                score = 0
            }
            return true
        } 
        else 
        {
            return false
        }
    }
}
