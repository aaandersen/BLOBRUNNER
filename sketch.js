const NUMBER_OF_EATABLES = 100
const NUMBER_OF_POISONOUS = 150
const NUMBER_OF_DEADLY = 0
const SPAWN_DEADLY_BLOBS_EATABLE_LENGTH = 50
const DEADLY_SPAWNCOUNT = 5
const PLAYER_INITIAL_RADIUS = 40
const BLOB_RADIUS = 15
const BLOB_DIAMETER = BLOB_RADIUS * 2

let blobs = []
let player
let boundary
let zoom = 1
//implemntere tid til spillet.
let time = 0;
let interval = setInterval(() => time++, 1000);
// beskriver player størrelse
let score = 7;
//beskriver hvor mange grønne man har spist
let scoregreen = 0;
//soundtrack
let music;
//lyd der spiller når man dør
let GameOver
//lyd til skade
let Hit
//lyd til point
let Point
//lyd til win 
let Win

let resetButton

let gameState = null

let col = color(25, 23, 200, 50);
function preload() {
    // load either beatbox.mp3, or .ogg, depending on browser
    music = loadSound("assets/Soundtrack.mp3");
    GameOver = loadSound("assets/gameover.wav");
    Hit = loadSound("assets/Hit Sound.wav");
    Point = loadSound("assets/Point.wav");
    Win = loadSound("assets/Win.wav");
}

function setup() {
    colorMode(HSB, 100)
    createCanvas(windowWidth, windowHeight)

    resetButton = createButton('RESET?')
    resetButton.position(windowWidth*0.5, windowHeight*0.6);
    resetButton.mousePressed(initialize)
    resetButton.style('font-size', '50px');

    // boundary
    boundary = new Boundary(-windowHeight, windowWidth, windowHeight, -windowWidth)

    initialize()
}

function initialize() {

    player = new BlobPlayer(0, 0, PLAYER_INITIAL_RADIUS)
    blobs = []
    zoom = 1
    time = 0;
    score = 7;
    scoregreen = 0;

    GameOver.stop();
    Win.stop();
    music.stop();
    music.play();

    resetButton.hide()

    // BlobEatable
    for (var i = 0; i < NUMBER_OF_EATABLES; i++) {
        const x = random(-windowWidth + BLOB_DIAMETER, windowWidth - BLOB_DIAMETER)
        const y = random(-windowHeight + BLOB_DIAMETER, windowHeight - BLOB_DIAMETER)
        blobs.push(new BlobEatable(x, y, BLOB_RADIUS))
    }

    // BlobPoisonous
    for (var i = 0; i < NUMBER_OF_POISONOUS; i++) {
        const x = random(-windowWidth + BLOB_DIAMETER, windowWidth - BLOB_DIAMETER)
        const y = random(-windowHeight + BLOB_DIAMETER, windowHeight - BLOB_DIAMETER)
        blobs.push(new BlobPoisonous(x, y, BLOB_RADIUS))
    }

    // BlobDeadly
    for (var i = 0; i < NUMBER_OF_DEADLY; i++) {
        const x = random(-windowWidth + BLOB_DIAMETER, windowWidth - BLOB_DIAMETER)
        const y = random(-windowHeight + BLOB_DIAMETER, windowHeight - BLOB_DIAMETER)
        blobs.push(new BlobDeadly(x, y, BLOB_RADIUS))
    }

    //Sætter gameState til playing
    gameState = 'playing'
  

    loop()
}


function draw() {
    // B A C K G R O U N D
    background('grey');

    push()
    // L O G I C
    const newzoom = 64 / player.radius
    zoom = lerp(zoom, newzoom, 0.1)
    translate(windowWidth * 0.5, windowHeight * 0.5)
    scale(zoom)
    translate(-player.pos.x, -player.pos.y)
    //scale(.45) // @DEBUG
    

    //undersøg hvad en arrow funktion og hvad en filter funktion i javascript er, få styr på det.
    const currentBlobEastablesLength = blobs.filter(blob => blob.constructor.name === 'BlobEatable').length
    const currentBlobPoisonousLength = blobs.filter(blob => blob.constructor.name === 'BlobPoisonous').length
    const currentBlobDeadlyLength = blobs.filter(blob => blob.constructor.name === 'BlobDeadly').length

    //spawn Deadly
    //console.log(currentBlobEastablesLength, SPAWN_DEADLY_BLOBS_EATABLE_LENGTH)
    if (currentBlobEastablesLength < SPAWN_DEADLY_BLOBS_EATABLE_LENGTH && currentBlobDeadlyLength === 0) {
        for (let index = 0; index < DEADLY_SPAWNCOUNT; index++) {
            spawnBlob(BlobDeadly)
        }
    }

    
    blobs.forEach((blob, idx) => {
        blob.update()
        blob.show()
        if (player.eats(blob)) {
            blobs.splice(idx, 1)
            spawnBlob(BlobPoisonous)
        }
    })

    player.update(boundary)
    player.show()

    boundary.show()
    
    pop()

    ///kører hele vores UI i draw
    UI()

}

function spawnBlob(constructor,
    x = random(-windowWidth + BLOB_DIAMETER, windowWidth - BLOB_DIAMETER),
    y = random(-windowHeight + BLOB_DIAMETER, windowHeight - BLOB_DIAMETER),
    radius = BLOB_DIAMETER) {

    blobs.push(new constructor(x, y, BLOB_RADIUS))
}

function UI() {
    if (gameState === 'playing') {
        if (score <= 1) {
            gameState = 'gameover'
        } else if (scoregreen == NUMBER_OF_EATABLES) {
            gameState = 'win'
        }
    }

    if (gameState === 'playing') {
        UIPlaying()
    } else if (gameState === 'gameover') {
        UIGameOver()
        music.stop();
        GameOver.play();
        resetButton.show()
        noLoop()
    } else if (gameState === 'win') {
        UIWin()
        music.stop();
        Win.play();
        resetButton.position(windowWidth*0.25, windowHeight*0.7);
        resetButton.show()
        noLoop()
    } 

}

function UIPlaying() {
    //push() pop() anvendes til at inkapsle kode som textfonts, fill osv til et bestemt område.
    push()
            //printer tiden gået i sekunder
        textFont("monospace", 60);
        fill('black')
        text(time, windowWidth / 2, 10, 100, 100);
        pop()

        push()
        // Printer Players størrelse nummerisk
        textFont("monospace", 30);
        fill('black')
        text(score, 10, 10, 80, 80);
        pop()

        push()
        //printer vores samlede antal spiste grønne blobs i grøn
        fill('green')
        noStroke();
        textFont("monospace", 30);
        text(scoregreen, 60, 10, 80, 80);
    pop()
}

function UIGameOver() {
    push()
        textFont("monospace", 150);
        background('red');
        
        // Konstanter der ganges på windowWidth og windowHeight passer med, at teskt rykkes til midten.
        text('GAME OVER', windowWidth * 0.25, windowHeight * 0.4, windowWidth, windowHeight);
        textSize(50);
        fill('green');
        noStroke();
        // Samme som overstående tekst, gælder på følgende.
        text('Du fik ' + scoregreen + ' points', windowWidth * 0.25, windowHeight * 0.6, windowWidth, windowHeight);
        // Rykker blobplayers position væk fra boundary
        player.x = windowWidth * 3;
        // Følger overstående, bare hvor der tjekkes om alle grønne blobs er spist. og vinder skærm istedet.
    pop()

}

function UIWin() {
    push()
        textFont("monospace", 150);
        background('yellow');

        // Konstanter der ganges på windowWidth og windowHeight passer med, at teskt rykkes til midten.
        text('Winner', windowWidth * 0.25, windowHeight * 0.4, windowWidth, windowHeight);
        textFont("monospace", 60);
        // Konstanter der ganges på windowWidth og windowHeight passer med, at teskt rykkes til midten.
        text('Du vandt på ' + time + ' sekunder', windowWidth * 0.25, windowHeight * 0.6, windowWidth, windowHeight);

        clearInterval(interval)
        // Rykker blobplayers position væk fra boundary
        player.x = windowWidth * 3;
    pop()
}