// Spil parametre
const NUMBER_OF_EATABLES = 100
const NUMBER_OF_POISONOUS = 150
const NUMBER_OF_DEADLY = 0
const SPAWN_DEADLY_BLOBS_EATABLE_LENGTH = 50
const DEADLY_SPAWNCOUNT = 5
const PLAYER_INITIAL_RADIUS = 40
const BLOB_RADIUS = 15
const BLOB_DIAMETER = BLOB_RADIUS * 2

// Allokerer arrayet til blobsne
let blobs = []
let player
let boundary
let zoom = 1

// Implemntere tid til spillet.
let time = 0;
let interval = setInterval(() => time++, 1000);

// Beskriver player størrelse
let score = 7;

// Varialbe der tjekker antal BlobEatable spist
let scoregreen = 0;

// Soundtrack og lydeffekter
let music;
let Point
let Hit 
let Win
let GameOver

// Knap
let resetButton

// Sætter gameState = null 
let gameState = null

// Preload() loader musikken ind, inden setup kører 
function preload() {
    // load either beatbox.mp3, or .ogg, depending on browser
    music = loadSound("assets/Soundtrack.mp3");
    GameOver = loadSound("assets/gameover.wav");
    Hit = loadSound("assets/Hit Sound.wav");
    Point = loadSound("assets/Point.wav");
    Win = loadSound("assets/Win.wav");
}

function setup() {
    // HSB farvespectrum, Hvilket erstatter RGB. 
    colorMode(HSB, 100)
    createCanvas(windowWidth, windowHeight)

    // Knap logik
    resetButton = createButton('RESET?')
    resetButton.position(windowWidth*0.5, windowHeight*0.6);
    resetButton.mousePressed(initialize)
    resetButton.style('font-size', '50px');

    // Boundary
    boundary = new Boundary(-windowHeight, windowWidth, windowHeight, -windowWidth)

    // Kalder initialize()
    initialize()
}


function initialize() {
    // Opstart parametre
    player = new BlobPlayer(0, 0, PLAYER_INITIAL_RADIUS)
    blobs = []
    zoom = 1
    time = 0;
    score = 7;
    scoregreen = 0;

    GameOver.stop();
    Win.stop();
    music.stop();
    // Starter Spillets soundtrack
    music.play();

    // Gemmer reset button, så den ikke på skærmen under gameState = 'playing'
    resetButton.hide()

    // BlobEatable spawn
    for (var i = 0; i < NUMBER_OF_EATABLES; i++) {
        spawnBlob(BlobEatable)
    }

    // BlobPoisonous spawn
    for (var i = 0; i < NUMBER_OF_POISONOUS; i++) {
        spawnBlob(BlobPoisonous)
    }

    // BlobDeadly spawn
    for (var i = 0; i < NUMBER_OF_DEADLY; i++) {
        spawnBlob(BlobDeadly)
    }

    // Sætter gameState til playing
    gameState = 'playing'
  
    // sætter initialize() til at loope
    loop()
}


function draw() {
    // B A C K G R O U N D
    background(255);

    push()
    // L O G I C
    // player.radius angiver spillets zoom, jo størrere radius, jo mindre zoom.
    const newzoom = 64 / player.radius
    // Lerp anvendes til, at give en glidende overgang fra zoom til newzoom
    zoom = lerp(zoom, newzoom, 0.1)
    // Her translates canvasset, så blobplayer er i midten
    translate(windowWidth * 0.5, windowHeight * 0.5)
    // Scale anvendes til at bevare blobplayers  størrelses på skærmen, så blobplayer bliver samme størrelse samt med, at verden omkring bliver mindre
    // scale(.45) // @DEBUG
    scale(zoom)
    // Her translates canvasset mod blobplayers retningsvektor,så blobplayers forbliver er i midten, under bevægelse
    translate(-player.pos.x, -player.pos.y)
    
    

    
    // Deklarerer længden af blobsne, som en const.
    const currentBlobEastablesLength = blobs.filter(blob => blob.constructor.name === 'BlobEatable').length
    const currentBlobPoisonousLength = blobs.filter(blob => blob.constructor.name === 'BlobPoisonous').length
    const currentBlobDeadlyLength = blobs.filter(blob => blob.constructor.name === 'BlobDeadly').length

    
    //console.log(currentBlobEastablesLength, SPAWN_DEADLY_BLOBS_EATABLE_LENGTH)
    // Spawn BlobDeadly, ved et given antal BlobEastable spist logik
    if (currentBlobEastablesLength < SPAWN_DEADLY_BLOBS_EATABLE_LENGTH && currentBlobDeadlyLength === 0) {
        for (let index = 0; index < DEADLY_SPAWNCOUNT; index++) {
            spawnBlob(BlobDeadly)
        }
    }

    // Tjekkes blandt alle blobs om de er spist, hvis de er spist, fjernes de fra arrayet og der spawnes en BlobPoisonous
    blobs.forEach((blob, idx) => {
        blob.update()
        blob.show()
        if (player.eats(blob)) {
            blobs.splice(idx, 1)
            spawnBlob(BlobPoisonous)
        }
    })

    // Tjekker om der er kontakt mellem Blobplayer og Boundary 
    player.update(boundary)
    player.show()

    
    boundary.show()
    
    pop()

    // Kører hele vores UI i draw
    UI()

}

// Funktionen der anvendes til at skabe vores blobs
function spawnBlob(constructor,
    x = random(-windowWidth + BLOB_DIAMETER, windowWidth - BLOB_DIAMETER),
    y = random(-windowHeight + BLOB_DIAMETER, windowHeight - BLOB_DIAMETER),
    radius = BLOB_DIAMETER) {
    
    // Tilføjer vores nye blob til enden af arrayet med de eksisterende blobs
    blobs.push(new constructor(x, y, BLOB_RADIUS))
}

// Logikken bare vores UI
function UI() {
    // Tjekker hvilket gamestate player har opnået
    if (gameState === 'playing') {
        if (score <= 1) {
            gameState = 'gameover'
        } else if (scoregreen == NUMBER_OF_EATABLES) {
            gameState = 'win'
        }
    }

    // Udfører 
    if (gameState === 'playing') {
        UIPlaying()
    } else if (gameState === 'gameover') {
        UIGameOver()
        music.stop();
        GameOver.play();
        // Lader os se, "reset" buttion
        resetButton.show()
        // Forhindre draw loope koden, når gameState = 'gameover'
        noLoop()
    } else if (gameState === 'win') {
        UIWin()
        music.stop();
        Win.play();
        // Rykker "reset" buttion, så den paser ind på 'win' skærmen
        resetButton.position(windowWidth*0.25, windowHeight*0.7);
        resetButton.show()
        noLoop()
    } 

}

function UIPlaying() {
        // push() pop() anvendes til at inkapsle kode som textfonts, fill osv til et bestemt område.
    push()
        // Sætter tekstfonten til en mere interrasant "monospace" font
        textFont("monospace", 60);
        fill('black')
        // Printer tiden gået i sekunder
        text(time, windowWidth / 2, 10, 100, 100);
        pop()

        push()
        textFont("monospace", 30);
        fill('black')
         // Printer Players størrelse nummerisk
        text(score, 10, 10, 80, 80);
        pop()

        push()
        // Printer vores samlede antal spiste grønne blobs i grøn
        fill('green')
        noStroke();
        textFont("monospace", 30);
        text(scoregreen, 60, 10, 80, 80);
    pop()
}

function UIGameOver() {
    push()

        textFont("monospace", 150);
        // Sætter baggrounden til rød
        background('red');
        // Konstanter der ganges på windowWidth og windowHeight passer med, at teskt rykkes til midten.
        text('GAME OVER', windowWidth * 0.25, windowHeight * 0.4, windowWidth, windowHeight);
        textSize(50);
        fill('green');
        noStroke();
        text('Du fik ' + scoregreen + ' points', windowWidth * 0.25, windowHeight * 0.6, windowWidth, windowHeight);
        // Rykker blobplayers position væk fra boundary
        player.x = windowWidth * 3;
        
    pop()

}

function UIWin() {
    push()
        textFont("monospace", 150);
        // Sætter baggrounden til gul
        background('yellow');

        text('Winner', windowWidth * 0.25, windowHeight * 0.4, windowWidth, windowHeight);
        textFont("monospace", 60);

        text('Du vandt på ' + time + ' sekunder', windowWidth * 0.25, windowHeight * 0.6, windowWidth, windowHeight);

        // Stopper spillets timner
        clearInterval(interval)
       
        player.x = windowWidth * 3;
    pop()
}
