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
let rotation = 0, isPlaying = true, rotationSpeed = 1.0, lastFrameTime = 0;
let diskX,diskY,diskRadius;
let clearButtonX,clearButtonY,clearButtonW,clearButtonH;
let speedSliderX,speedSliderY,speedSliderW,speedSliderH;
let paletteX,paletteY,paletteW,paletteH;
let disk;


function drawNoteIcon(idx, x, y, s) {
  // 带透明度的填充色（alpha = 150）
  let c = color(...noteColors[idx]);
  c.setAlpha(220);
  fill(c);

  // 深色描边（颜色稍微暗一些）
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


// 初始化画布及布局
function setup() {
  let canvas = createCanvas(900, 800);
  canvas.parent("p5-canvas-container");
  angleMode(DEGREES);
  imageMode(CENTER);

  diskX = width/2+60; diskY = height/2; diskRadius = 300;
  clearButtonX=20; clearButtonY=20; clearButtonW=160; clearButtonH=40;
  speedSliderX=20; speedSliderY=80; speedSliderW=160; speedSliderH=20;
  // paletteX=20; paletteY=120; paletteW=160; paletteH=400;
  paletteX = 20; // 原来是20，现在整体向左移，不会挡住中间的 disk
  paletteY = 120;
  paletteW = 160;
  paletteH = 450;


  // 初始化disk实例
  disk = new Disk(diskX, diskY, diskRadius);

  // 调色板项目
  for (let i = 0; i < notes.length; i++) {
    paletteItems.push({
      note: notes[i],
      imageIndex: i,
      x: paletteX + paletteW/2,
      y: paletteY + 50 + i*50
    });
  }
  lastFrameTime = millis();//set lastFrameTime to current time
}

// 主循环：更新旋转并绘制
function draw() {
  background('#393E46');
  let now = millis();
  let dt = (now - lastFrameTime) / 1000;
  lastFrameTime = now;
  if (isPlaying) rotation = (rotation + rotationSpeed*60*dt) % 360;

  disk.draw(allElements, rotation);
  drawInterface();
  if (isDragging) drawDraggedElement();
  disk.checkElements(allElements, rotation);
}

// 鼠标按下：处理按钮、滑块和拖拽起始
function mousePressed() {
  // 清屏按钮
  if (mouseX>clearButtonX && mouseX<clearButtonX+clearButtonW &&
      mouseY>clearButtonY && mouseY<clearButtonY+clearButtonH) {
    allElements = [];
    return;
  }
  // 速度滑块
  if (mouseY>speedSliderY-10 && mouseY<speedSliderY+speedSliderH+10 &&
      mouseX>speedSliderX-10 && mouseX<speedSliderX+speedSliderW+10) {
    rotationSpeed = map(constrain(mouseX, speedSliderX, speedSliderX+speedSliderW),
                        speedSliderX, speedSliderX+speedSliderW, 0.1, 2.0);
    return;
  }
  // 从调色板开始拖拽
  for (let item of paletteItems) {
    if (dist(mouseX,mouseY,item.x,item.y)<20) {
      isDragging = true;
      draggedElement = { note:item.note, imageIndex:item.imageIndex };
      return;
    }
  }
  // 从盘上元素开始拖拽
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

// 鼠标松开：若拖拽元素释放在盘内则添加
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

// 鼠标拖动：实时调整速度滑块
function mouseDragged() {
  if (mouseY>speedSliderY-10 && mouseY<speedSliderY+speedSliderH+10 &&
      mouseX>speedSliderX-10 && mouseX<speedSliderX+speedSliderW+10) {
    rotationSpeed = map(constrain(mouseX, speedSliderX, speedSliderX+speedSliderW),
                        speedSliderX, speedSliderX+speedSliderW, 0.1, 2.0);
  }
}

// 空格键：切换播放/暂停
function keyPressed() {
  if (key === ' ') isPlaying = !isPlaying;
}