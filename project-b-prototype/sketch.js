let disk;
let buttonX = 20, buttonY = 20, buttonW = 160, buttonH = 40;

function setup() {
  createCanvas(800, 600);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  textSize(12);
  disk = new Disk(width / 2, height / 2, 300);
}

function draw() {
  background(255);
  disk.update();   
  disk.display();  

  //button
  fill(50, 150, 250);
  noStroke();
  rect(buttonX, buttonY, buttonW, buttonH, 10); 
  fill(255);
  textSize(16);
  text('Add Element', buttonX + buttonW / 2, buttonY + buttonH / 2);
}

function mousePressed() {
  if (
    mouseX >= buttonX &&
    mouseX <= buttonX + buttonW &&
    mouseY >= buttonY &&
    mouseY <= buttonY + buttonH
  ) {
    disk.addRandomElement();
  }
}

function keyPressed() {
  //space control rotation
  if (key === ' ') {
    disk.toggleRotation();
  }
}

class Disk {
  constructor(cx, cy, r) {
    this.cx = cx;         // center x
    this.cy = cy;         // center y
    this.r = r;           // r
    this.elements = [];   // stored elements
    this.rotation = 0;    // current rotation angle
    this.playing = true;  // flag for rotation
    this.needleAngle = 0; // needle angle
  }

  update() {
    // if playing, rotate the disk
    if (this.playing) {
      this.rotation += 0.5;
      this.rotation %= 360;
    }

    // traverse elements to check if the needle is close enough then play sound
    for (let e of this.elements) {
      let globalAngle = degrees(e.angle) + this.rotation;
      globalAngle %= 360;

      let delta = abs((this.needleAngle - globalAngle + 360) % 360);

      if (delta < 2 && !e.played) {
        e.played = true;
        let osc = new p5.Oscillator(e.oscType);
        osc.freq(e.freq);
        osc.amp(0.4);
        osc.start();
        osc.stop(0.2); // short 
      }

      if (delta >= 2) e.played = false;
    }
  }

  display() {
    push();
    translate(this.cx, this.cy);
    rotate(this.rotation);

    // main disk
    fill(255, 180, 50);
    ellipse(0, 0, this.r, this.r);

    // elements
    for (let e of this.elements) {
      push();
      rotate(degrees(e.angle));
      fill(e.color);
      ellipse(this.r / 2 - 30, 0, 40, 40);
      pop();
    }

    // inner circle
    fill(255);
    ellipse(0, 0, 60, 60);
    pop();

    //needle）
    push();
    stroke(0);
    strokeWeight(4);
    translate(this.cx, this.cy);
    let needleLen = this.r / 2 + 20;
    let nx = cos(this.needleAngle) * needleLen;
    let ny = sin(this.needleAngle) * needleLen;
    line(0, 0, nx, ny);
    pop();
  }

  // random
  addRandomElement() {
    let type = 'emoji'; // 目前只使用 emoji 类型

    let angle = random(0, 360);
    let col = color(random(100, 255), random(100, 255), random(100, 255));
    let freq = map(angle, 0, 360, 200, 800);
    let oscType = 'sine';

    this.elements.push({
      angle: radians(angle), // convert to radians
      color: col,
      freq: freq,
      type: type,
      oscType: oscType,
      played: false
    });
  }

  toggleRotation() {
    this.playing = !this.playing;
  }
}
