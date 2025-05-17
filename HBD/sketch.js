let music;
let mic; 
let vol = 0;
let boxOpened = false;
let fireworks = [];
let candleBlownOut = false; 
let customCursor;

function preload() {
  customCursor = loadImage('cursor.png'); 
  music = loadSound('birthday.mp3');      
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  music.setVolume(0.4);
  userStartAudio(); // 获取音频权限
  music.loop();
  noCursor(); // 隐藏原鼠标


  mic = new p5.AudioIn(); // 🔥 初始化麦克风
  mic.start();

  textAlign(CENTER, CENTER);
  textSize(24);
}

function draw() {
  background(135, 206, 235); // 天空蓝背景

  if (!boxOpened) {
    drawGiftBox();
  } else {
    drawCake();

    for (let f of fireworks) {
      f.update();
      f.show();
    }

    // 🔥 检测麦克风音量
    vol = mic.getLevel();
    if (!candleBlownOut && vol > 0.2) {
      candleBlownOut = true;
    }
  }
  imageMode(CENTER);
  image(customCursor, mouseX, mouseY, 40, 40);

}

function drawGiftBox() {
  push();
  translate(width / 2, height / 2);
  rectMode(CENTER);
  fill('#ff69b4');
  stroke(200);
  rect(0, 20, 150, 150, 20);
  fill('#ff1493');
  rect(0, -65, 160, 30, 10);
  strokeWeight(8);
  stroke('#fff');
  line(-40, -60, -40, 80);
  line(40, -60, 40, 80);
  pop();

  noStroke();
  fill(255);
  text("点击打开 🎁", width / 2, height / 2 + 110);
}

function drawCake() {
  push();
  translate(width / 2, height / 2);

  // 蛋糕三层
  fill("#ffb6c1");
  stroke(200);
  rectMode(CENTER);
  rect(0, 80, 180, 80, 20);

  fill("#fff0f5");
  rect(0, 30, 140, 60, 15);

  fill("#ffe4e1");
  rect(0, -10, 100, 50, 10);

  // 🔥 一根蜡烛
  fill("white");
  rect(0, -40, 10, 30);

  if (!candleBlownOut) {
    drawFlame(0, -55);
  }

  fill("#d00070");
  textSize(36);
  text("22", 0, 90);
  pop();
}

// 🔥 火焰动画
function drawFlame(x, y) {
  push();
  translate(x, y);
  noStroke();
  for (let i = 0; i < 5; i++) {
    let flicker = sin(frameCount * 0.3 + i) * 2;
    fill(255, 140, 0, 150 - i * 25);
    ellipse(0, flicker - i * 5, 20 - i * 3, 20 - i * 3);
  }
  pop();
}

// 烟花类
class Firework {
  constructor(x, y) {
    this.particles = [];
    for (let i = 0; i < 80; i++) {
      this.particles.push(new Particle(x, y));
    }
  }

  update() {
    for (let p of this.particles) p.update();
  }

  show() {
    for (let p of this.particles) p.show();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-4, 4);
    this.vy = random(-4, 4);
    this.alpha = 255;
    this.color = color(random(255), random(255), random(255));
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5;
  }

  show() {
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
    ellipse(this.x, this.y, 5);
  }
}

function mousePressed() {
  if (!boxOpened && mouseX > width / 2 - 75 && mouseX < width / 2 + 75 && mouseY > height / 2 - 75 && mouseY < height / 2 + 75) {
    boxOpened = true;
    document.getElementById('message').style.display = 'block';
  }

  // 点击放烟花
  fireworks.push(new Firework(mouseX, mouseY));
}
