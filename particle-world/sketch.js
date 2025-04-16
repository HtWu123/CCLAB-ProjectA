let NUM_OF_PARTICLES = 10;
let MAX_OF_PARTICLES = 100;

let particles = [];

function setup() {
  let canvas = createCanvas(800, 500);
  canvas.parent("p5-canvas-container");

  for (let i = 0; i < NUM_OF_PARTICLES; i++) {
    particles[i] = new Firefly(random(width), random(height));
  }

  background(10, 20, 30);
}

function draw() {

  fill(10, 20, 30);
  rect(0, 0, width, height);

  //randomly add fireflies (with probability of 0.1)
  if (random(0,10) < 1 && particles.length < MAX_OF_PARTICLES * 0.7) {
    particles.push(new Firefly(random(width), random(height)));
  }

  // update and display all fireflies
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.update();
    p.display();
  }

  if (particles.length > MAX_OF_PARTICLES) {
    particles.splice(0, 1);
  }
}

function mousePressed() {
  if (particles.length < MAX_OF_PARTICLES) {
    particles.push(new Firefly(mouseX, mouseY));
  }
  else {
    particles.splice(0, 1);
    particles.push(new Firefly(mouseX, mouseY));
  }
}

class Firefly {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.size = random(8, 15);
    this.speedX = random(-1, 1);
    this.speedY = random(-1, 1);
    this.angle = 0;
    this.brightness = random(120, 200);
    this.color = color(random(150, 255), random(200, 255), random(100, 150));
    this.rcolor = color(255, 255, 255, 100);
    this.wingOffset = random(-1, 1);
    this.wingSpeed = 0.1; 
  }

  checkBound() {
    if (this.x < 0 || this.x > width) {
      this.speedX *= -1; 
    }
    if (this.y < 0 || this.y > height) {
      this.speedY *= -1; 
    }
  }

  update() {
    if (this.speedX < -2) this.speedX = -2;
    if (this.speedX > 2) this.speedX = 2;
    if (this.speedY < -2) this.speedY = -2;
    if (this.speedY > 2) this.speedY = 2;

    this.x += this.speedX;
    this.y += this.speedY;

    this.checkBound();

    this.angle += random(-0.05, 0.05);

    this.brightness = 180 + sin(frameCount * 0.05) * random(100, 150);
    this.wingPhase += this.wingSpeed;
  }


  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    noStroke();

    
    // wing
    fill(255, 70);
    ellipse(
      -this.size * 0.5,
      -this.size * 0.2 + this.wingOffset * 2, 
      this.size,
      this.size * 0.4
    );
    ellipse(
      this.size * 0.5,
      -this.size * 0.2 - this.wingOffset * 2, 
      this.size,
      this.size * 0.4
    );


    // body
    fill(50, 80, 100, 200);
    ellipse(0, 0, this.size * 0.8, this.size * 1.2);
    //color of the body
    if (random(1,10) < 8){
      fill(this.color, this.brightness);
    }
    else {
      fill(this.rcolor, this.brightness);
    }
    ellipse(0, this.size * 0.4, this.size * 0.7, this.size * 0.7);
    pop();
    // glow
  }


}