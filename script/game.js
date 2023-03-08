/************************
***** DECLARATIONS: *****
************************/
let cvs         //  canvas
let ctx         //  context'2d'
let description //  game description
let theme1      //  original theme
let logo        //  logo witch replace bird
let bgImage     //  background image
let trunk       //  Image for the trunk 
let trunk2
let medails
let words        //  words display on the top
let bg          //  background
let bird        //  bird: yellow
let pipes       //  top and bottom pipes
let ground      //  ground floor
let getReady    //  get ready screen
let gameOver    //  game over screen
let map         //  map of number images
let score       //  score counter
let gameState   //  state of game
let frame       //  ms/frame = 17; dx/frame = 2; fps = 59;
let degree      //  bird rotation degree
const SFX_SCORE = new Audio()         //  sound for scoring
const SFX_FLAP = new Audio()          //  sound for flying bird
const SFX_COLLISION = new Audio()     //  sound for collision
const SFX_FALL = new Audio()          //  sound for falling to the ground
const SFX_SWOOSH = new Audio()        //  sound for changing game state

let printScoring = document.getElementById('printScoring')
//confetti
let maxParticleCount = 220; //set max confetti count
let particleSpeed = 2; //set the particle animation speed
let startConfetti; //call to start confetti animation
let stopConfetti; //call to stop adding confetti
let toggleConfetti; //call to start or stop the confetti animation depending on whether it's already running
let removeConfetti; //call to stop the confetti animation and remove all confetti immediately


//game
cvs = document.getElementById('game')
ctx = cvs.getContext('2d')
description = document.getElementById('description')
theme1 = new Image()
theme1.src = 'img/og-theme.png'
medails = new Image()
medails.src = 'img/medailles.png'
bgImage = new Image()
bgImage.src = 'img/bg.png'
trunk = new Image()
trunk.src = 'img/trunk.png'
trunk2 = new Image()
trunk2.src = 'img/trunkdown.png'
frame = 0;
logo = new Image()
logo.src = 'img/LOGO.png'
words = new Image()
words.src = 'img/words.png'
frame = 0;
degree = Math.PI / 180
SFX_SCORE.src = 'audio/sfx_point.wav'
SFX_FLAP.src = 'audio/sfx_wing.wav'
SFX_COLLISION.src = 'audio/sfx_hit.wav'
SFX_FALL.src = 'audio/sfx_die.wav'
SFX_SWOOSH.src = 'audio/sfx_swooshing.wav';

let speed = 1.5;
let winNumber = 3;


//confetti

(function () {
    startConfetti = startConfettiInner;
    stopConfetti = stopConfettiInner;
    toggleConfetti = toggleConfettiInner;
    removeConfetti = removeConfettiInner;
    let colors = ["DodgerBlue", "OliveDrab", "Gold", "Pink", "SlateBlue", "LightBlue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"]
    let streamingConfetti = false;
    let animationTimer = null;
    let particles = [];
    let waveAngle = 0;

    function resetParticle(particle, width, height) {
        particle.color = colors[(Math.random() * colors.length) | 0];
        particle.x = Math.random() * width;
        particle.y = Math.random() * height - height;
        particle.diameter = Math.random() * 10 + 5;
        particle.tilt = Math.random() * 10 - 10;
        particle.tiltAngleIncrement = Math.random() * 0.07 + 0.05;
        particle.tiltAngle = 0;
        return particle;
    }

    function startConfettiInner() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    return window.setTimeout(callback, 16.6666667);
                };
        })();
        let canvas = document.getElementById("game");
        let context = canvas.getContext("2d");
        while (particles.length < maxParticleCount)
            particles.push(resetParticle({}, width, height));
        streamingConfetti = true;
        if (animationTimer === null) {
            (function runAnimation() {
                context.clearRect(0, 0, window.innerWidth, window.innerHeight);
                if (particles.length === 0)
                    animationTimer = null;
                else {
                    updateParticles();
                    drawParticles(context);
                    animationTimer = requestAnimFrame(runAnimation);
                }
            })();
        }
    }

    function stopConfettiInner() {
        streamingConfetti = false;
    }

    function removeConfettiInner() {
        stopConfetti();
        particles = [];
    }

    function toggleConfettiInner() {
        if (streamingConfetti)
            stopConfettiInner();
        else
            startConfettiInner();
    }

    function drawParticles(context) {
        let particle;
        let x;
        for (let i = 0; i < particles.length; i++) {
            particle = particles[i];
            context.beginPath();
            context.lineWidth = particle.diameter;
            context.strokeStyle = particle.color;
            x = particle.x + particle.tilt;
            context.moveTo(x + particle.diameter / 2, particle.y);
            context.lineTo(x, particle.y + particle.tilt + particle.diameter / 2);
            context.stroke();
        }
    }

    function updateParticles() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let particle;
        waveAngle += 0.01;
        for (let i = 0; i < particles.length; i++) {
            particle = particles[i];
            if (!streamingConfetti && particle.y < -15)
                particle.y = height + 100;
            else {
                particle.tiltAngle += particle.tiltAngleIncrement;
                particle.x += Math.sin(waveAngle);
                particle.y += (Math.cos(waveAngle) + particle.diameter + particleSpeed) * 0.5;
                particle.tilt = Math.sin(particle.tiltAngle) * 15;
            }
            if (particle.x > width + 20 || particle.x < -20 || particle.y > height) {
                if (streamingConfetti && particles.length <= maxParticleCount)
                    resetParticle(particle, width, height);
                else {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
    }
})();





gameState = {
    //loads game on ready screen, tick to change state of game
    current: 0,
    getReady: 0,
    //on play game state: bird flaps and flies
    play: 1,
    //game over screen: button||click takes player to ready screen
    gameOver: 2,
    won: 3
}
//background
bg = {
    //object's key-value properties pinpointing its location
    imgX: 0,
    imgY: 0,
    width: 707,
    height: 207,
    //x,y coordinates of where image should be drawn on canvas
    x: 0,
    //https://stackoverflow.com/questions/7043509/this-inside-object
    //reason why 'y' cannot be defined as this.height or bg.height
    y: 0,
    w: 707,
    h: 414,
    dx: .8*speed,
    //object's render function that utilizes all above values to draw image onto canvas
    render: function () {
        ctx.drawImage(bgImage, this.imgX, this.imgY, this.width, this.height, this.x, this.y, this.w, this.h)

        //image repeat and tile to fit canvas
        ctx.drawImage(bgImage, this.imgX, this.imgY, this.width, this.height, this.x + this.width, this.y, this.w, this.h)

        //image repeat again for continuous animation
        ctx.drawImage(bgImage, this.imgX, this.imgY, this.width, this.height, this.x + this.width * 2, this.y, this.w, this.h)
    },

    position: function () {
        //still img on get ready frame
        if (gameState.current == gameState.getReady) {
            this.x = 0
        }
        //ANIMATION: slowly move background on play game state by decrementing x
        if (gameState.current == gameState.play) {
            this.x = ((this.x - this.dx) % (this.w))
        }
    }
}
//top and bottom pipes
pipes = {
    //object's key-value properties pinpointing its location
    //top pipe image x,y coordinate
    top: {
        imgX: 201,
        imgY: 254,
    },
    //bot pipe image x,y coordinate
    bot: {
        imgX: 260,
        imgY: 100,
    },
    width: 409,
    height: 1536,
    //pipes' values for drawing on canvas
    w: 55,
    h: 300,
    gap: 85,
    dx: 2 * speed,
    //acceptable y values must be -260 <= y <= -40
    minY: -260,
    maxY: -40,

    pipeGenerator: [],

    reset: function () {
        this.pipeGenerator = []
    },
    //object's render function that utilizes all above values to draw image onto canvas
    render: function () {
        //draw whatever is in the pipeGenerator
        for (let i = 0; i < this.pipeGenerator.length; i++) {
            let pipe = this.pipeGenerator[i]
            let topPipe = pipe.y
            let bottomPipe = pipe.y + this.gap + this.h

            ctx.drawImage(trunk2, this.top.imgX, this.top.imgY, this.width, this.height, pipe.x, topPipe, this.w, this.h)
            ctx.drawImage(trunk, this.bot.imgX, this.bot.imgY, this.width, this.height, pipe.x, bottomPipe, this.w, this.h)
        }
    },
    position: function () {
        //if game is not in session, do nothing
        if (gameState.current !== gameState.play) {
            return
        }
        //if game is in session, generate set of pipes forever
        if (gameState.current == gameState.play) {

            //when pipes reach this frame, generate another set
            if (frame % 100 == 0) {
                this.pipeGenerator.push(
                    {
                        //spawn off canvas
                        //pipes' x value needs to be width of canvas to render outside
                        x: cvs.width,
                        //random y-coordinates
                        //pipes' y value needs to vary randomly within acceptable parameters
                        y: Math.floor((Math.random() * (this.maxY - this.minY + 1)) + this.minY)
                    }
                )
            }
            //iterate for all pipes generated (animation, collision, deletion)
            for (let i = 0; i < this.pipeGenerator.length; i++) {

                //decleration for bird and pipes' parameters (COLLISION)
                let pg = this.pipeGenerator[i]
                let b = {
                    left: bird.x - bird.r,
                    right: bird.x + bird.r,
                    top: bird.y - bird.r,
                    bottom: bird.y + bird.r,
                }
                let p = {
                    top: {
                        top: pg.y,
                        bottom: pg.y + this.h
                    },
                    bot: {
                        top: pg.y + this.h + this.gap,
                        bottom: pg.y + this.h * 2 + this.gap
                    },
                    left: pg.x,
                    right: pg.x + this.w
                }

                //ANIMATION: set of pipes scroll from the right of canvas by decrementing x
                pg.x -= this.dx

                //delete pipes as they scroll off the canvas (memory management)
                if (pg.x < -this.w) {
                    this.pipeGenerator.shift()
                    //score up
                    score.current++
                    SFX_SCORE.play()
                }

                //PIPE COLLISION
                //collision with top pipe
                if (b.left < p.right &&
                    b.right > p.left &&
                    b.top < p.top.bottom &&
                    b.bottom > p.top.top) {
                    gameState.current = gameState.gameOver
                    SFX_COLLISION.play()
                }
                //collision with bottom pipe
                if (b.left < p.right &&
                    b.right > p.left &&
                    b.top < p.bot.bottom &&
                    b.bottom > p.bot.top) {
                    gameState.current = gameState.gameOver
                    SFX_COLLISION.play()
                }
            }
        }
    }
}
//ground floor
ground = {
    //object's key-value properties pinpointing its location
    imgX: 276,
    imgY: 0,
    width: 224,
    height: 112,
    //values for drawing on canvas
    x: 0,
    y: cvs.height - 112,
    w: 224,
    h: 112,
    dx: 2 * speed,
    render: function () {
        ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x, this.y, this.w, this.h)
        //image repeat and tile to fit canvas
        ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x + this.width, this.y, this.w, this.h)
    },
    //ANIMATION:  ground scrolls to the left in a continuous loop when game state is at play
    //needs to be at the same rate of pipes' scroll speed
    position: function () {
        if (gameState.current == gameState.getReady) {
            this.x = 0
        }
        if (gameState.current == gameState.play) {
            //modulus keeps this.x value infinitely cycling back to zero
            this.x = (this.x - this.dx) % (this.w / 2)
        }
    }
}


//current score, top score, tracker
score = {
    //map of number images

    map: [
        RASSEMBLER = {
            imgY: 0,
            imgX: 205
        },
        écoute = {
            imgY: 75,
            imgX: 205
        },
        accompagner = {
            imgY: 148,
            imgX: 205
        },
        integration = {
            imgY: 227,
            imgX: 205
        },
        esprit_critique = {
            imgY: 295,
            imgX: 205
        },
        médiateur = {
            imgY: 368,
            imgX: 205
        },
        adaptabilité = {
            imgY: 444,
            imgX: 205
        },
        transparence = {
            imgY: 520,
            imgX: 205
        },
        réunir = {
            imgY: 592,
            imgX: 205
        },
        opportunités = {
            imgY: 670,
            imgX: 205
        },
        permanences = {
            imgY: 750,
            imgX: 205
        },



        PROFESSIONNALISER = {
            imgY: 965,
            imgX: 205
        },
        continuité = {
            imgY: 1040,
            imgX: 205
        },
        formations = {
            imgY: 1120,
            imgX: 205
        },
        visibilité = {
            imgY: 1190,
            imgX: 205
        },
        LinkedIn = {
            imgY: 1273,
            imgX: 205
        },
        sponsors = {
            imgY: 1345,
            imgX: 205
        },
        autonomie = {
            imgY: 1420,
            imgX: 205
        },
        financement = {
            imgY: 1495,
            imgX: 205
        },
        motiver = {
            imgY: 1570,
            imgX: 205
        },
        Tips = {
            imgY: 1645,
            imgX: 205
        },
        entrainement = {
            imgY: 1718,
            imgX: 205
        },



        RESPONSABILISER = {
            imgY: 0,
            imgX: 1050
        },
        engagement = {
            imgY: 75,
            imgX: 1050
        },
        Sensibiliser = {
            imgY: 145,
            imgX: 1050
        },
        RSE = {
            imgY: 220,
            imgX: 1050
        },
        Responsables = {
            imgY: 300,
            imgX: 1050
        },
        écologiques = {
            imgY: 375,
            imgX: 1050
        },
        humanitaires = {
            imgY: 444,
            imgX: 1050
        },
        templates = {
            imgY: 525,
            imgX: 1050
        },
        sécuriser = {
            imgY: 592,
            imgX: 1050
        },
        neutralit_carbone = {
            imgY: 670,
            imgX: 1050
        },
        ouverture = {
            imgY: 750,
            imgX: 1050
        },



        ECOSYSTEME = {
            imgY: 973,
            imgX: 1050
        },
        Entraide = {
            imgY: 1045,
            imgX: 1050
        },
        WEF = {
            imgY: 1124,
            imgX: 1050
        },
        communication = {
            imgY: 1194,
            imgX: 1050
        },
        équipe = {
            imgY: 1273,
            imgX: 1050
        },
        collaborations = {
            imgY: 1345,
            imgX: 1050
        },
        objectifs = {
            imgY: 1420,
            imgX: 1050
        },
        vision = {
            imgY: 1490,
            imgX: 1050
        },
        partage = {
            imgY: 1570,
            imgX: 1050
        },
        KPI = {
            imgY: 1645,
            imgX: 1050
        },
        evolution = {
            imgY: 1710,
            imgX: 1050
        }
    ],
    current: 0,
    best: null, // DO THIS STRETCH GOAL
    //values for drawing mapped numbers on canvas
    x: cvs.width / 2,
    y: 20,
    w: 290,
    h: 30,

    imgX: 205,
    // imgY: 0,
    width: 636,
    height: 70,

    reset: function () {
        this.current = 0
    },
    //display the score
    render: function () {
        if (gameState.current == gameState.play ||
            gameState.current == gameState.gameOver) {
            //if current score has thousands place value: the game is over
            if (this.current > winNumber) {
                gameState.current = gameState.won
            } else { ctx.drawImage(words, this.map[this.current % 43].imgX, this.map[this.current % 43].imgY, this.width, this.height, (this.x - this.w / 2), this.y, this.w, this.h) }
        }
    }
}
//bird : YELLOW BIRD
bird = {
    animation: [
        { imgX: 0, imgY: 0 },  //  position 0
    ],
    fr: 0,
    //object's key-value properties pinpointing its location
    width: 205,
    height: 205,
    //values for drawing on canvas
    x: 50,
    y: 160,
    w: 34,
    h: 34,
    boolUpDown: 0,
    //bird's radius
    r: 12,
    //how much the bird flies per flap()
    fly: 4.25,
    //gravity increments the velocity per frame
    gravity: .32,
    //velocity = pixels the bird will drop in a frame
    velocity: 0,
    //object's render function that utilizes all above values to draw image onto canvas
    render: function () {
        let bird = this.animation[0]
        //save all previous setting
        ctx.save()
        //target center of bird
        ctx.translate(this.x, this.y)
        //rotate bird by degree
        ctx.rotate(this.rotation)
        ctx.drawImage(logo, bird.imgX, bird.imgY, this.width, this.height, -this.w / 2, -this.h / 2, this.w, this.h)
        ctx.restore()
        //bird is centered on x,y position
        // ctx.drawImage(theme1, bird.imgX,bird.imgY,this.width,this.height, this.x-this.w/2,this.y-this.h/2,this.w,this.h)
    },
    //bird flies
    flap: function () {
        this.velocity = - this.fly
    },
    //function checks gameState and updates bird's position
    position: function () {
        if (gameState.current == gameState.getReady) {
            this.rotation = 0 * degree
            this.y = 160

        } else {
            //bird falls to gravity
            this.velocity += this.gravity
            this.y += this.velocity

            //bird rotation
            if (this.velocity <= this.fly) {
                this.rotation = -15 * degree
            } else if (this.velocity >= this.fly + 2) {
                this.rotation = 70 * degree
                this.fr = 1
            } else {
                this.rotation = 0
            }

            //check collision with ground
            if (this.y + this.h / 2 >= cvs.height - ground.h) {
                this.y = cvs.height - ground.h - this.h / 2
                //stop flapping when it hits the ground
                if (frame % 1 == 0) {
                    this.fr = 2
                    this.rotation = 70 * degree
                }
                //then the game is over
                if (gameState.current == gameState.play) {
                    gameState.current = gameState.gameOver
                    SFX_FALL.play()
                }
            }

            //bird cannot fly above canvas
            if (this.y - this.h / 2 <= 0) {
                gameState.current = gameState.gameOver
            }

        }
    }
}

//get ready screen
getReady = {
    //object's key-value properties pinpointing its location
    imgX: 0,
    imgY: 228,
    width: 174,
    height: 192,
    //values for drawing on canvas
    x: cvs.width / 2 - 174 / 2,
    y: cvs.height / 2 - 120,
    w: 174,
    h: 160,
    //object's render function that utilizes all above values to draw image onto canvas
    render: function () {
        //only draw this if the game state is on get ready
        if (gameState.current == gameState.getReady) {
            ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x, this.y, this.w, this.h)
        }
    }
}
//game over screen
gameOver = {
    //object's key-value properties pinpointing its location
    imgX: 174,
    imgY: 228,
    width: 226,
    height: 158,
    //values for drawing on canvas
    x: cvs.width / 2 - 226 / 2,
    y: cvs.height / 2 - 160,
    w: 226,
    h: 160,

    xmedails: (cvs.width / 2) - 50,
    //object's render function that utilizes all above values to draw image onto canvas
    render: function () {
        //only draw this if the game state is on game over
        if (gameState.current == gameState.gameOver) {
            ctx.drawImage(theme1, this.imgX, this.imgY, this.width, this.height, this.x, this.y, this.w, this.h)
            description.style.visibility = "visible"
            console.log(score.current)
            if (score.current <= 11) {
                ctx.drawImage(medails, 0, 0, 2034, 2034, this.xmedails, this.xmedails + 50, 100, 100)
                return;
            }
            if (score.current > 40) {
                ctx.drawImage(medails, 2069, 2069, 2034, 2034, this.xmedails, this.xmedails + 50, 100, 100)
                return;
            }
            if (score.current > 25) {
                ctx.drawImage(medails, 0, 2069, 2034, 2034, this.xmedails, this.xmedails + 50, 100, 100)
                return;
            }
            if (score.current > 11) {
                ctx.drawImage(medails, 2069, 0, 2034, 2034, this.xmedails, this.xmedails + 50, 100, 100)
                return;
            }
        }
    }
}

win = {
    imgX: 0,
    imgY: 110,
    width: 275,
    height: 110,
    //values for drawing on canvas
    x: cvs.width / 2 - 226 / 2,
    y: cvs.height / 2 - 100,
    w: 250,
    h: 100,
    render: function () {
        if (gameState.current == gameState.won) {
            description.style.visibility = "visible"
            startConfetti();
        }
    }
}
/************************
***** FUNCTIONS: ********
************************/
//anything to be drawn on canvas goes in here
let draw = () => {
    //this clears canvas to default bg color
    ctx.fillStyle = '#606BA0'
    ctx.fillRect(0, 0, cvs.width, cvs.height)
    //Scoring
    printScoring.innerHTML = "Score : " + "43/43"
    printScoring.style.zIndex = 2000;
    //things to draw
    bg.render()
    pipes.render()
    ground.render()
    score.render()
    bird.render()
    getReady.render()
    gameOver.render()
    win.render()
}
//updates on animation and position goes in here
let update = () => {
    //things to update
    switch (score.current) {
        case 10:
            speed = 1.5
            break;
        case 20:
            speed = 2
            break;
        case 30:
            speed = 3
            break;
        case 45:
            speed = 3
            break;
        case 50:
            speed = 4
            break;
        case 60:
            speed = 5
            break;
        case 70:
            speed = 7
            break;
        case 80:
            speed = 8
            break;
        case 90:
            speed = 9
            break;
    }

    bird.position()
    bg.position()
    pipes.position()
    ground.position()
}
//game looper
let loop = () => {
    draw()
    update()
    frame++
    //average of requestAnimationFrame is 50-60fps
    // requestAnimationFrame(loop)
}
loop()
setInterval(loop, 17)

/*************************
***** EVENT HANDLERS ***** 
*************************/
//on mouse click // tap screen
cvs.addEventListener('click', () => {
    //if ready screen >> go to play state
    if (gameState.current == gameState.getReady) {
        gameState.current = gameState.play
    }
    //if play state >> bird keeps flying
    if (gameState.current == gameState.play) {
        bird.flap()
        SFX_FLAP.play()
        description.style.visibility = "hidden"
    }
    //if game over screen >> go to ready screen
    if (gameState.current == gameState.gameOver) {

        pipes.reset()
        score.reset()
        gameState.current = gameState.getReady
        SFX_SWOOSH.play()
    }
    if (gameState.current == gameState.won) {
        stopConfetti()
        winNumber = 999;
        gameState.current = gameState.getReady
        SFX_SWOOSH.play()
        pipes.reset()
        score.reset()
        score.current = 44
    }
})
//on spacebar
document.body.addEventListener('keydown', (e) => {
    //if ready screen >> go to play state
    if (e.code == 'Space') {
        if (gameState.current == gameState.getReady) {
            gameState.current = gameState.play
        }
        //if play state >> bird keeps flying
        if (gameState.current == gameState.play) {
            bird.flap()
            SFX_FLAP.play()
            description.style.visibility = "hidden"
        }
        //if game over screen >> go to ready screen
        if (gameState.current == gameState.gameOver) {

            pipes.reset()
            score.reset()
            SFX_SWOOSH.play()
            gameState.current = gameState.getReady

        }
        if (gameState.current == gameState.won) {
            stopConfetti()
            winNumber = 999;
            SFX_SWOOSH.play()
            gameState.current = gameState.getReady
            pipes.reset()
            score.reset()
            score.current = 44
        }
    }
})