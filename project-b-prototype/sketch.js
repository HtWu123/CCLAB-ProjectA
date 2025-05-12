let notes = ['C4','D4','E4','F4','F_4','G4','A4','B4'];
let noteColors = [
  [247, 90, 90],   // 红 (#F75A5A)
  [249, 168, 37],  // 橙 (#F9A825)
  [244, 224, 77],  // 黄 (#F4E04D)
  [129, 199, 132], // 绿 (#81C784)
  [80, 200, 120], // 浅绿 (#4FC3F7)
  [79, 195, 247],  // 蓝 (#4FC3F7)
  [149, 117, 205], // 靛 (#9575CD)
  [186, 104, 200]  // 紫 (#BA68C8)
];


let elementImages = [], allElements = [], paletteItems = [];
let isDragging = false, draggedElement = null;
let rotation = 0, isPlaying = true, rotationSpeed = 1.0;
let diskX,diskY,diskRadius;
let clearButtonX,clearButtonY,clearButtonW,clearButtonH;
let speedSliderX,speedSliderY,speedSliderW,speedSliderH;
let paletteX,paletteY,paletteW,paletteH;
let disk;

let bgImg;
let pixelSize = 5;
let bgLayer;

function preload() {
  bgImg = loadImage('bg.png'); 
}

function drawNoteIcon(idx, x, y, s) {
  // for 透明
  let c = color(...noteColors[idx]);
  c.setAlpha(220);
  fill(c);

  // 深色描边
  let strokeC = color(
    noteColors[idx][0] * 0.6,
    noteColors[idx][1] * 0.6,
    noteColors[idx][2] * 0.6
  );
  stroke(strokeC);
  strokeWeight(2);

  circle(x, y, s);

  // 白色文字
  fill(255);
  noStroke();
  textSize(s * 0.4);
  textAlign(CENTER, CENTER);
  if (idx != 4 ){
      text(notes[idx], x, y);
  } else {
      text('F4#', x, y);
  }
}


function setup() {
  let canvas = createCanvas(windowWidth * 2 / 3, windowHeight);
  canvas.parent("p5-canvas-container");
  angleMode(DEGREES);
  noSmooth(); 
  imageMode(CORNER);

  // 创建背景图层
  bgLayer = createGraphics(width, height);
  let w = width / pixelSize;
  let h = height / pixelSize;

  //pixel
  bgImg.resize(w, h);
  bgLayer.noStroke();
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let c = bgImg.get(x, y);
      bgLayer.fill(c);
      bgLayer.rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
 

  diskX = width/2+60; diskY = height/2; diskRadius = 300;
  clearButtonX=20; clearButtonY=20; clearButtonW=160; clearButtonH=40;
  speedSliderX=20; speedSliderY=80; speedSliderW=160; speedSliderH=20;
  paletteX = 20; 
  paletteY = 120;
  paletteW = 160;
  paletteH = 450;

  disk = new Disk(diskX, diskY, diskRadius);

  //左上调色板
  for (let i = 0; i < notes.length; i++) {
    paletteItems.push({
      note: notes[i],
      imageIndex: i,
      x: paletteX + paletteW/2,
      y: paletteY + 50 + i*50
    });
  }
}

function draw() {
  image(bgLayer, 0, 0); 
  if (isPlaying) {
    rotation = (rotation + rotationSpeed) % 360;
  }
  disk.draw(allElements, rotation);
  drawInterface();
  if (isDragging) {
    drawDraggedElement();
  }
  disk.checkElements(allElements, rotation);
}


function mousePressed() {
  // clear all elements
  if (mouseX>clearButtonX && mouseX<clearButtonX+clearButtonW &&
      mouseY>clearButtonY && mouseY<clearButtonY+clearButtonH) {
    allElements = [];
    return;
  }
  // rotation speed
  if (mouseY>speedSliderY-10 && mouseY<speedSliderY+speedSliderH+10 &&
      mouseX>speedSliderX-10 && mouseX<speedSliderX+speedSliderW+10) {
    rotationSpeed = map(constrain(mouseX, speedSliderX, speedSliderX+speedSliderW), speedSliderX, speedSliderX+speedSliderW, 0.1, 2.0);

    return;
  }
  // drag
  for (let item of paletteItems) {
    if (dist(mouseX,mouseY,item.x,item.y)<20) {
      isDragging = true;
      draggedElement = { note:item.note, imageIndex:item.imageIndex };
      return;
    }
  }
  // drag2
  for (let i = allElements.length-1; i>=0; i--) {
    let e = allElements[i];
    let ang = e.angle + rotation;
    let gx = diskX + cos(ang)*e.radius;
    let gy = diskY + sin(ang)*e.radius;
    if (dist(mouseX,mouseY,gx,gy)<20) {
      isDragging = true;
      draggedElement = {...e}; //复制一份 e 的属性，创建新对象
      allElements.splice(i,1);
      return;
    }
  }
}

// mouse release for re put
function mouseReleased() {
  if (!isDragging || !draggedElement) return;
  let dx = mouseX - diskX, dy = mouseY - diskY;
  let d = sqrt(dx*dx + dy*dy);
  if (d <= diskRadius) {
    let ang = atan2(dy,dx);
    if (ang<0) ang+=360;
    ang = (ang - rotation + 360) % 360;
    let ti = disk.getTrackFromDistance(d);
    let info = disk.getTrackInfo(ti);
    allElements.push({
      note: draggedElement.note,
      imageIndex: draggedElement.imageIndex,
      angle: ang,
      radius: info.radius,
      instrument: info.instrument,
      highlighted: false,
      inNeedleZone: false
    });
    disk.playNote(draggedElement.note, info.instrument);
  }
  isDragging = false;
}

// speed
function mouseDragged() {
  if (mouseY>speedSliderY-10 && mouseY<speedSliderY+speedSliderH+10 &&
      mouseX>speedSliderX-10 && mouseX<speedSliderX+speedSliderW+10) {
    rotationSpeed = map(constrain(mouseX, speedSliderX, speedSliderX+speedSliderW),
                        speedSliderX, speedSliderX+speedSliderW, 0.1, 2.0);
  }
}

// 空格键
function keyPressed() {
  if (key === ' ') isPlaying = !isPlaying;
}