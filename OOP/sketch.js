/*
  Check our the GOAL and the RULES of this exercise at the bottom of this file.
  
  After that, follow these steps before you start coding:

  1. rename the dancer class to reflect your name (line 35).
  2. adjust line 20 to reflect your dancer's name, too.
  3. run the code and see if a square (your dancer) appears on the canvas.
  4. start coding your dancer inside the class that has been prepared for you.
  5. have fun.
*/

let dancer;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("p5-canvas-container");
  dancer = new Flowey(width / 2, height / 2);
}

function draw() {
  background(0);
  drawFloor();
  dancer.update();
  dancer.display();
}

class Flowey {
  constructor(startX, startY) {
    this.x = startX;
    this.y = startY;
    this.angle = 0;
    this.petalAngle = 0;
    this.smilePhase = 0;
    this.showText = true;
    this.stemAngle = 0;
    this.stemWobble = 0;
    this.baseX = startX; // initial x
    this.baseY = startY; // initial y
  }


  drawSpeechBubble() {
    fill(255);
    rect(-40, -160, 115, 45, 10);

    fill(0);
    noStroke();
    textSize(10);
    textAlign(LEFT, CENTER);
    
    if (this.isEvil) {
      text("You IDIOT.", -35, -150);
      text("DIE!!!", -35, -130);
    } else {
      text("Howdy! I'm Flowey.", -35, -150);
      text("FLOWEY the FLOWER!", -35, -130);
    }
  }

  update() {
    this.angle += 0.04;
    this.petalAngle += 0.05;
    this.smilePhase += 0.1;
    
    // stem movement
    this.stemAngle = sin(this.angle * 2) * 0.3;
    this.stemWobble = sin(this.angle * 3) * 8;
    
    // state change
    this.isEvil = (frameCount % 360) >= 250;
    
    this.x = this.baseX + sin(this.angle * 1.8) * 15; // horizontal movement
    this.y = this.baseY + sin(this.angle * 1.2) * 20; // vertical movement

    
  }

  display() {
    push();
    translate(this.x, this.y);

    // stem
    push();
    rotate(this.stemAngle);
    noFill();
    stroke(0,200,0);
    if (this.isEvil) {
      stroke(255,0,0);
    }
    strokeWeight(10);
    
    beginShape();
    let stemBase = 50;
    let stemTop = -50;
    let wobble = this.stemWobble;
    
    for (let y = stemBase; y >= stemTop; y -= 5) {
      let xOffset = sin(y * 0.1 + this.angle * 2) * wobble * (1 - (y - stemTop)/(stemBase - stemTop));
      curveVertex(xOffset, y);
    }
    endShape();
    pop();
    
    // pedel
    push();
    translate(0, -50);
    
    // 绘制pedel
    for (let i = 0; i < 6; i++) {
      let petalX = cos(this.petalAngle + i * PI/3) * 40;
      let petalY = sin(this.petalAngle + i * PI/3) * 40;
      
      if (this.isEvil) {
        fill(0);
        stroke(255);
        strokeWeight(2);
      } else {
        fill(255, 200, 0);
        noStroke();
      }
      circle(petalX, petalY, 35);
    }

    // face
    fill(255);
    circle(0, 0, 65);
    
    // eyes
    fill(0);
    if (this.isEvil) {
      stroke(0);
      strokeWeight(2);
      fill(255);
      triangle(-10, -10, -15, -20, -5, -20);
      triangle(10, -10, 15, -20, 5, -20);
    } else {
      noStroke();
      ellipse(-7, -5, 6, 10);
      ellipse(7, -5, 6, 10);
    }
    
    // mouth
    noFill();
    stroke(0);
    strokeWeight(2);
    if (this.isEvil) {
      beginShape();
      for (let x = -15; x <= 15; x += 3) {
        let y = 5 + sin(x * 0.5 + this.angle * 5) * 3;
        vertex(x, y);
      }
      endShape();
    } else {
      let smileHeight = sin(this.smilePhase) * 5 + 10;
      arc(0, 5, 30, smileHeight, 0, PI);
    }
    pop();
    
    // saying
    this.drawSpeechBubble();
    // this.drawReferenceShapes()
    
    pop();
  }

  

  drawReferenceShapes() {
    noFill();
    stroke(255, 0, 0);
    line(-5, 0, 5, 0);
    line(0, -5, 0, 5);
    stroke(255);
    rect(-100, -100, 200, 200);
    fill(255);
    stroke(0);
  }
}

function drawFloor() {
  noStroke();
  fill(50);
  rect(0, height/2, width, height/2);
}



/*
GOAL:
The goal is for you to write a class that produces a dancing being/creature/object/thing. In the next class, your dancer along with your peers' dancers will all dance in the same sketch that your instructor will put together. 

RULES:
For this to work you need to follow one rule: 
  - Only put relevant code into your dancer class; your dancer cannot depend on code outside of itself (like global variables or functions defined outside)
  - Your dancer must perform by means of the two essential methods: update and display. Don't add more methods that require to be called from outside (e.g. in the draw loop).
  - Your dancer will always be initialized receiving two arguments: 
    - startX (currently the horizontal center of the canvas)
    - startY (currently the vertical center of the canvas)
  beside these, please don't add more parameters into the constructor function 
  - lastly, to make sure our dancers will harmonize once on the same canvas, please don't make your dancer bigger than 200x200 pixels. 
*/