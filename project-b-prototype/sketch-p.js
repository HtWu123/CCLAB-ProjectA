// 全局变量
let notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']; 
let noteColors = [
  [255, 82, 82], [255, 152, 0], [255, 235, 59], 
  [76, 175, 80], [33, 150, 243], [103, 58, 183], [233, 30, 99]
];
let elementImages = []; // 音符图像
let allElements = [];   // 所有元素的单一数组
let paletteItems = [];  // 调色板项目
let isDragging = false;
let draggedElement = null;
let rotation = 0;
let isPlaying = true;
let rotationSpeed = 0.5;
let lastFrameTime = 0;
let needleAngle = 0; // 固定在0度

// 界面参数
let diskX, diskY, diskRadius;
let clearButtonX, clearButtonY, clearButtonW, clearButtonH;
let speedSliderX, speedSliderY, speedSliderW, speedSliderH;
let paletteX, paletteY, paletteW, paletteH;

// 预加载函数 - 创建音符图像
function preload() {
  for (let i = 0; i < notes.length; i++) {
    let img = createGraphics(40, 40);
    img.noStroke();
    img.fill(noteColors[i][0], noteColors[i][1], noteColors[i][2]);
    img.ellipse(20, 20, 40, 40);
    img.fill(255);
    img.textSize(16);
    img.textAlign(CENTER, CENTER);
    img.text(notes[i][0], 20, 20);
    elementImages.push(img);
  }
}

// 初始化函数
function setup() {
  createCanvas(800, 600);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
  imageMode(CENTER);
  
  // 设置磁盘位置和大小
  diskX = width / 2;
  diskY = height / 2;
  diskRadius = 300;
  
  // 设置界面元素位置
  clearButtonX = 20;
  clearButtonY = 20;
  clearButtonW = 160;
  clearButtonH = 40;
  
  speedSliderX = 20;
  speedSliderY = 80;
  speedSliderW = 160;
  speedSliderH = 20;
  
  paletteX = 20;
  paletteY = 120;
  paletteW = 160;
  paletteH = 400;
  
  // 初始化调色板
  for (let i = 0; i < notes.length; i++) {
    paletteItems.push({
      note: notes[i],
      imageIndex: i,
      x: paletteX + paletteW / 2,
      y: paletteY + 50 + i * 50
    });
  }
  
  lastFrameTime = millis();
}

// 绘制每一帧
function draw() {
  background(20);
  
  // 计算时间差，确保旋转速度一致
  let currentTime = millis();
  let deltaTime = (currentTime - lastFrameTime) / 1000; // 秒
  lastFrameTime = currentTime;
  
  // 更新旋转
  if (isPlaying) {
    rotation = (rotation + rotationSpeed * 60 * deltaTime) % 360;
  }
  
  // 绘制磁盘
  drawDisk();
  
  // 绘制界面
  drawInterface();
  
  // 拖拽中的元素
  if (isDragging && draggedElement) {
    drawDraggedElement();
  }
  
  // 检查是否有元素经过指针
  checkElements();
}

// 绘制磁盘
function drawDisk() {
  push();
  translate(diskX, diskY);
  
  // 底盘
  fill(20, 20, 30);
  stroke(60, 60, 80);
  strokeWeight(3);
  ellipse(0, 0, diskRadius * 2, diskRadius * 2);
  
  // 绘制三个轨道
  drawTracks();
  
  // 旋转部分
  push();
  rotate(rotation);
  
  // 绘制元素
  for (let i = 0; i < allElements.length; i++) {
    let e = allElements[i];
    
    push();
    rotate(e.angle);
    
    // 高亮效果
    if (e.highlighted) {
      noStroke();
      fill(noteColors[e.imageIndex][0], noteColors[e.imageIndex][1], noteColors[e.imageIndex][2], 150);
      ellipse(e.radius, 0, 50, 50);
    }
    
    // 绘制元素
    image(elementImages[e.imageIndex], e.radius, 0, 40, 40);
    
    pop();
  }
  
  pop();
  
  // 指针 (固定位置)
  drawNeedle();
  
  pop();
}

// 绘制轨道
function drawTracks() {
  let trackColors = [
    color(255, 230, 180, 100), // 内轨
    color(255, 200, 130, 100), // 中轨
    color(255, 180, 50, 100)   // 外轨
  ];
  
  for (let i = 0; i < 3; i++) {
    let innerRadius, outerRadius;
    
    if (i === 0) {
      innerRadius = 0;
      outerRadius = diskRadius * 0.3;
    } else if (i === 1) {
      innerRadius = diskRadius * 0.3;
      outerRadius = diskRadius * 0.6;
    } else {
      innerRadius = diskRadius * 0.6;
      outerRadius = diskRadius;
    }
    
    // 轨道填充
    fill(trackColors[i]);
    noStroke();
    ellipse(0, 0, outerRadius * 2, outerRadius * 2);
    
    if (innerRadius > 0) {
      fill(20, 20, 30);
      ellipse(0, 0, innerRadius * 2, innerRadius * 2);
    }
    
    // 轨道边界
    noFill();
    stroke(150, 150, 200, 100);
    strokeWeight(1);
    ellipse(0, 0, outerRadius * 2, outerRadius * 2);
  }
  
  // 中心孔
  fill(10, 10, 15);
  stroke(100, 100, 150);
  strokeWeight(2);
  ellipse(0, 0, diskRadius * 0.1, diskRadius * 0.1);
}

// 绘制指针
function drawNeedle() {
  stroke(200, 200, 255);
  strokeWeight(3);
  line(0, 0, diskRadius + 20, 0);
  
  fill(255, 50, 50);
  noStroke();
  ellipse(diskRadius + 20, 0, 12, 12);
  
  fill(200, 200, 255);
  ellipse(0, 0, 10, 10);
  
  // 指针区域指示
  noFill();
  stroke(255, 50, 50, 50);
  strokeWeight(1);
  arc(0, 0, diskRadius * 2.1, diskRadius * 2.1, -5, 5);
  arc(0, 0, diskRadius * 2.1, diskRadius * 2.1, 355, 360);
}

// 绘制界面
function drawInterface() {
  // 调色板背景
  fill(30, 30, 40, 200);
  stroke(100, 100, 120);
  rect(paletteX, paletteY, paletteW, paletteH, 10);
  
  // 调色板元素
  for (let i = 0; i < paletteItems.length; i++) {
    let item = paletteItems[i];
    image(elementImages[item.imageIndex], item.x, item.y, 40, 40);
  }
  
  // 速度滑块
  fill(30, 30, 40, 200);
  stroke(100, 100, 120);
  rect(speedSliderX, speedSliderY, speedSliderW, speedSliderH, 10);
  
  let sliderPos = map(rotationSpeed, 0.1, 2.0, speedSliderX, speedSliderX + speedSliderW);
  let colorIndex = int(map(rotationSpeed, 0.1, 2.0, 0, noteColors.length - 1));
  fill(noteColors[colorIndex][0], noteColors[colorIndex][1], noteColors[colorIndex][2]);
  noStroke();
  ellipse(sliderPos, speedSliderY + speedSliderH/2, 25, 25);
  
  fill(200);
  textSize(14);
  text(`Rotation: ${rotationSpeed.toFixed(1)}x`, speedSliderX + speedSliderW / 2, speedSliderY - 10);
  
  // 清除按钮
  fill(80, 30, 30, 200);
  stroke(150, 80, 80);
  rect(clearButtonX, clearButtonY, clearButtonW, clearButtonH, 10);
  
  fill(220);
  noStroke();
  textSize(16);
  text("Clear All Notes", clearButtonX + clearButtonW / 2, clearButtonY + clearButtonH / 2);
  
  // 调试信息
  fill(255);
  noStroke();
  textAlign(LEFT, TOP);
  text(`Elements: ${allElements.length}`, width - 150, 20);
  text(`Rotation: ${rotation.toFixed(1)}°`, width - 150, 40);
  textAlign(CENTER, CENTER);
}

// 绘制拖拽中的元素
function drawDraggedElement() {
  let imgIndex = draggedElement.imageIndex;
  
  // 计算与磁盘中心的距离
  let dx = mouseX - diskX;
  let dy = mouseY - diskY;
  let distance = sqrt(dx*dx + dy*dy);
  
  // 如果在磁盘范围内，添加视觉提示
  if (distance <= diskRadius) {
    let trackIndex = getTrackFromDistance(distance);
    let trackColor;
    
    if (trackIndex === 0) trackColor = color(255, 230, 180, 150);
    else if (trackIndex === 1) trackColor = color(255, 200, 130, 150);
    else trackColor = color(255, 180, 50, 150);
    
    push();
    noFill();
    stroke(trackColor);
    strokeWeight(2);
    ellipse(mouseX, mouseY, 50, 50);
    pop();
  }
  
  // 绘制拖拽的元素
  image(elementImages[imgIndex], mouseX, mouseY, 40, 40);
}

// 检查元素是否经过指针
function checkElements() {
  // 定义指针区域 (355°-5°)
  const needleStart = 355;
  const needleEnd = 5;
  
  for (let i = 0; i < allElements.length; i++) {
    let e = allElements[i];
    
    // 计算元素的全局角度
    let globalAngle = (e.angle + rotation) % 360;
    
    // 检查是否在指针区域
    let inNeedleZone = (globalAngle >= needleStart || globalAngle <= needleEnd);
    
    // 如果元素刚刚进入指针区域
    if (inNeedleZone && !e.inNeedleZone) {
      // 播放音符
      playNote(e.note, e.instrument);
      
      // 高亮显示
      e.highlighted = true;
      
      // 创建闭包以保存当前元素的引用
      const elementRef = e;
      
      // 一段时间后取消高亮
      setTimeout(() => {
        // 只有在元素仍然存在于数组中时才取消高亮
        if (allElements.includes(elementRef)) {
          elementRef.highlighted = false;
        }
      }, 300);
    }
    
    // 更新状态
    e.inNeedleZone = inNeedleZone;
  }
}

// 根据距离确定轨道
function getTrackFromDistance(distance) {
  if (distance < diskRadius * 0.3) return 0;
  else if (distance < diskRadius * 0.6) return 1;
  else return 2;
}

// 根据轨道获取半径和乐器
function getTrackInfo(trackIndex) {
  let radius, instrument;
  
  if (trackIndex === 0) {
    radius = diskRadius * 0.15;
    instrument = 'sine';
  } else if (trackIndex === 1) {
    radius = diskRadius * 0.45;
    instrument = 'triangle';
  } else {
    radius = diskRadius * 0.75;
    instrument = 'square';
  }
  
  return { radius, instrument };
}

// 播放音符
function playNote(note, instrument) {
  try {
    let osc = new p5.Oscillator(instrument || 'sine');
    let noteFreq;
    
    switch(note) {
      case 'C4': noteFreq = 261.63; break;
      case 'D4': noteFreq = 293.66; break;
      case 'E4': noteFreq = 329.63; break;
      case 'F4': noteFreq = 349.23; break;
      case 'G4': noteFreq = 392.00; break;
      case 'A4': noteFreq = 440.00; break;
      case 'B4': noteFreq = 493.88; break;
      default: noteFreq = 440;
    }
    
    osc.freq(noteFreq);
    
    // 根据音色设置音量
    if (instrument === 'sine') osc.amp(0.4);
    else if (instrument === 'triangle') osc.amp(0.3);
    else osc.amp(0.25);
    
    osc.start();
    
    // 定时停止
    setTimeout(() => {
      osc.amp(0, 0.1);
      setTimeout(() => osc.stop(), 100);
    }, 300);
    
  } catch (error) {
    console.log("音频播放错误:", error);
  }
}

// 鼠标按下事件
function mousePressed() {
  console.log("Mouse pressed at:", mouseX, mouseY);
  
  //检查是否点击清除按钮
  if (mouseX >= clearButtonX && mouseX <= clearButtonX + clearButtonW &&
      mouseY >= clearButtonY && mouseY <= clearButtonY + clearButtonH) {
    // 清除所有元素
    allElements = [];
    console.log("Cleared all elements");
    return;
  }
  
  // 检查是否点击速度滑块
  if (mouseY >= speedSliderY - 10 && mouseY <= speedSliderY + speedSliderH + 10 &&
      mouseX >= speedSliderX - 10 && mouseX <= speedSliderX + speedSliderW + 10) {
    rotationSpeed = map(constrain(mouseX, speedSliderX, speedSliderX + speedSliderW),
                      speedSliderX, speedSliderX + speedSliderW,
                      0.1, 2.0);
    console.log("Speed updated:", rotationSpeed);
    return;
  }
  
  // 检查是否点击调色板元素
  for (let i = 0; i < paletteItems.length; i++) {
    let item = paletteItems[i];
    let d = dist(mouseX, mouseY, item.x, item.y);
    if (d < 20) {
      isDragging = true;
      draggedElement = {
        note: item.note,
        imageIndex: item.imageIndex,
        fromPalette: true
      };
      console.log("Started dragging palette item:", item.note);
      return;
    }
  }
  
  // 检查是否点击磁盘上的元素
  let clickedElementIndex = -1;
  
  for (let i = allElements.length - 1; i >= 0; i--) {
    let e = allElements[i];
    
    // 计算元素的全局位置
    let angle = e.angle + rotation;
    let globalX = diskX + cos(angle) * e.radius;
    let globalY = diskY + sin(angle) * e.radius;
    let d = dist(mouseX, mouseY, globalX, globalY);
    
    if (d < 20) {
      clickedElementIndex = i;
      break;
    }
  }
  
  if (clickedElementIndex >= 0) {
    let e = allElements[clickedElementIndex];
    
    isDragging = true;
    draggedElement = {
      note: e.note,
      imageIndex: e.imageIndex,
      angle: e.angle,
      instrument: e.instrument,
      fromDisk: true,
      originalIndex: clickedElementIndex
    };
    
    // 从磁盘上移除元素
    allElements.splice(clickedElementIndex, 1);
    console.log("Started dragging disk element:", e.note);
  }
}

// 鼠标释放事件
function mouseReleased() {
  if (isDragging && draggedElement) {
    // 计算与磁盘中心的距离
    let dx = mouseX - diskX;
    let dy = mouseY - diskY;
    let distance = sqrt(dx*dx + dy*dy);
    
    // 如果在磁盘范围内，添加元素
    if (distance <= diskRadius) {
      // 计算角度和轨道
      let angle = atan2(dy, dx);
      if (angle < 0) angle += 360;
      
      // 调整角度，考虑当前旋转
      angle = (angle - rotation + 360) % 360;
      
      let trackIndex = getTrackFromDistance(distance);
      let trackInfo = getTrackInfo(trackIndex);
      
      // 创建新元素
      let newElement = {
        note: draggedElement.note,
        imageIndex: draggedElement.imageIndex,
        angle: angle,
        radius: trackInfo.radius,
        instrument: trackInfo.instrument,
        highlighted: false,
        inNeedleZone: false
      };
      
      // 添加到元素数组
      allElements.push(newElement);
      console.log("Added element:", newElement.note, "to track", trackIndex);
      
      // 播放音符提供反馈
      playNote(newElement.note, newElement.instrument);
    }
    
    // 重置拖拽状态
    isDragging = false;
    draggedElement = null;
  }
}

// 鼠标拖动事件
function mouseDragged() {
  // 检查是否拖动速度滑块
  if (mouseY >= speedSliderY - 10 && mouseY <= speedSliderY + speedSliderH + 10 &&
      mouseX >= speedSliderX - 10 && mouseX <= speedSliderX + speedSliderW + 10) {
    rotationSpeed = map(constrain(mouseX, speedSliderX, speedSliderX + speedSliderW),
                      speedSliderX, speedSliderX + speedSliderW,
                      0.1, 2.0);
    return;
  }
}

// 键盘事件
function keyPressed() {
  if (key === ' ') {
    isPlaying = !isPlaying;
    console.log("Playback:", isPlaying ? "started" : "paused");
  }
}