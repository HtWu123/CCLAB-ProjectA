let baseRadius = 50; // 基础半径
let targetRadius = baseRadius; // 目标半径
let radiusIncrement = 20; // 每次点击食物增加的半径
let lerpSpeed = 0.05; // 插值速度
let isExploded = false; // 是否爆炸
let smallSlimes = []; // 存储小史莱姆的数组
let foods = []; // 存储食物的数组
let foodCount = 5; // 食物的数量
let shrinkSpeed = 3; // 半径随时间减小的速度
let mode = 'feed'; // 当前模式，'feed' 或 'drag'
let isDragging = false; // 是否正在拖拽
let dragOffsetX = 0; // 拖拽时的水平偏移
let dragOffsetY = 0; // 拖拽时的垂直偏移
let stretchX = 1; // 水平拉伸比例
let stretchY = 1; // 垂直拉伸比例
let stretchSpeed = 0.1; // 拉伸恢复速度


let iconSize = 50; // 图标大小（从 30 调整为 50）
let iconPadding = 15; // 图标间距（从 10 调整为 15）
let iconX = 10; // 图标起始 x 位置
let iconY = 10; // 图标起始 y 位置

function setup() {
  let canvas = createCanvas(600, 600);
  canvas.id("p5-canvas");
  canvas.parent("p5-canvas-container");
  noFill();
  strokeWeight(10);
  colorMode(HSB);
  initializeFoods();
}

function draw() {
  drawGrassBackground(); // 绘制草地背景
  drawIcons();   // 绘制图标
  drawSizeBar();   // 绘制史莱姆大小的条形图

  if (!isExploded) {
    // 使用 lerp 平滑过渡半径
    baseRadius = lerp(baseRadius, targetRadius, lerpSpeed);
    // 随时间减小半径
    if (frameCount % 60 === 0 && mode === 'feed') { // 每 60 帧减小一次半径
      targetRadius = max(targetRadius - shrinkSpeed, 20); // 最小半径为 20
    }
    // 绘制主史莱姆
    drawMainSlime();
    drawEyes();
    drawFoods();     // 绘制食物

    // 如果不在拖拽状态，逐渐恢复形状
    if (!isDragging) {
      stretchX = lerp(stretchX, 1, stretchSpeed);
      stretchY = lerp(stretchY, 1, stretchSpeed);
    }
  } else {
    // 绘制爆炸后的小史莱姆
    for (let i = 0; i < smallSlimes.length; i++) {
      updateSmallSlime(smallSlimes[i]);
      drawSmallSlime(smallSlimes[i]);
    }
  }
}

function drawGrassBackground() {
  push();
  colorMode(RGB);
  for (let i = 0; i < height; i++) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(174, 209, 133), color(50, 152, 69), inter);
    stroke(c);
    line(0, i, width, i);
  }
  pop();
}

function drawIcons() {
  // 绘制 Drag 图标
  drawIcon('drag', mode === 'drag');
  // 绘制 Feed 图标
  drawIcon('feed', mode === 'feed');
  // 绘制 Reset 图标
  drawIcon('reset', false);
}

function drawIcon(type, isActive) {
  push();
  colorMode(RGB);
  // 设置图标颜色
  if (isActive) {
    // 高亮颜色red
    fill(144, 37, 37);
  } else {
    fill(246, 198, 60);
  }
  noStroke();

  // 根据类型绘制图标
  if (type === 'drag') {
    rect(iconX, iconY, iconSize, iconSize); // 使用 iconX 和 iconY
    // 字体 "DRAG" 橙色
    fill(255);
    textSize(14); // 字体大小从 9 调整为 14
    textAlign(CENTER, CENTER);
    text("DRAG", iconX + iconSize / 2, iconY + iconSize / 2); // 居中显示
  } else if (type === 'feed') {
    rect(iconX + iconSize + iconPadding, iconY, iconSize, iconSize); // 第二个图标
    // 字体 "FEED"
    fill(255);
    textSize(14); // 字体大小
    textAlign(CENTER, CENTER);
    text("FEED", iconX + iconSize + iconPadding + iconSize / 2, iconY + iconSize / 2); // 居中显示
  } else if (type === 'reset') {
    rect(iconX + 2 * (iconSize + iconPadding), iconY, iconSize, iconSize);
    // 字体 "RESET"
    fill(255);
    textSize(14); // 字体大小
    textAlign(CENTER, CENTER);
    text("RESET", iconX + 2 * (iconSize + iconPadding) + iconSize / 2, iconY + iconSize / 2); // 居中显示
  }
  pop();
}

function drawSizeBar() {
  let barWidth = 200; // 条形图的宽度
  let barHeight = 30; // 条形图的高度
  let barX = width - barWidth - 20; // 条形图的 x 位置（右上角）
  let barY = 20; // 条形图的 y 位置

  // 绘制条形图的背景
  noStroke();
  fill(50, 50, 50, 100); // 半透明灰色
  rect(barX, barY, barWidth, barHeight, 5); // 圆角矩形

  // 计算当前史莱姆大小的比例
  let sizeRatio = baseRadius / 200; // 假设最大半径为 200
  let fillWidth = barWidth * sizeRatio; // 填充的宽度

  // 绘制填充部分
  fill(frameCount % 360, 80, 100); // 使用史莱姆的颜色
  rect(barX, barY, fillWidth, barHeight, 5); // 圆角矩形

  // 绘制文字 "Size"
  fill(255); // 白色文字
  textSize(20);
  textAlign(LEFT, CENTER);
  text("SIZE", barX - 50, barY + barHeight / 2);
}

function drawMainSlime() {
  // 设置史莱姆的颜色
  stroke(frameCount % 360, 80, 100); // 史莱姆的颜色（动态变化）
  fill(frameCount % 360 - 10, 70, 100 - 10, 50); // 史莱姆的填充颜色（半透明）

  // 开始绘制史莱姆形状
  beginShape();
  for (let j = 0; j < 360; j += 10) {
    let angle = radians(j); // 将角度转换为弧度
    let noiseOffset = map(j, 0, 360, 0, 6); // 动态偏移
    let finalRadius = baseRadius + 20 * noise(frameCount * 0.05 + noiseOffset);
    let x = width / 2 + finalRadius * cos(angle) * stretchX; // 水平拉伸
    let y = height / 2 + finalRadius * sin(angle) * stretchY; // 垂直拉伸
    curveVertex(x, y);
  }
  endShape(CLOSE);
  drawMouth();
}

function drawEyes() {
  // 计算眼睛的大小
  let eyeSize = map(baseRadius, 20, 200, 20, 40); // 眼睛大小随半径变化
  let pupilSize = eyeSize / 2; // 瞳孔大小是眼睛大小的一半

  // 左眼
  let leftEyeX = width / 2 - baseRadius * 0.4 * stretchX;
  let leftEyeY = height / 2 - baseRadius * 0.3 * stretchY;
  drawEye(leftEyeX, leftEyeY, eyeSize, pupilSize);

  // 右眼
  let rightEyeX = width / 2 + baseRadius * 0.4 * stretchX;
  let rightEyeY = height / 2 - baseRadius * 0.3 * stretchY;
  drawEye(rightEyeX, rightEyeY, eyeSize, pupilSize);
}

function drawEye(eyeX, eyeY, eyeSize, pupilSize) {
  // 绘制眼睛的白色部分 边缘的stroke是黑色的
  fill(0);
  noStroke();
  ellipse(eyeX, eyeY, eyeSize, eyeSize);
  fill(255);
  noStroke();
  ellipse(eyeX, eyeY, eyeSize - 6, eyeSize - 6);

  // 计算瞳孔的偏移
  let pupilOffsetX = map(mouseX, 0, width, -5, 5); // 水平偏移
  let pupilOffsetY = map(mouseY, 0, height, -5, 5); // 垂直偏移

  // 绘制瞳孔
  fill(0);
  circle(eyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, pupilSize);
}

function initializeFoods() {
  // 初始化食物
  for (let i = 0; i < foodCount; i++) {
    let x = random(50, width - 50); // 随机 x 位置
    let y = random(50, height - 50); // 随机 y 位置
    foods.push({ x, y });
  }
}

function drawFoods() {
  // 绘制食物
  push();
  for (let i = 0; i < foods.length; i++) {
    let x = foods[i].x;
    let y = foods[i].y;
    // 绘制苹果的主体
    fill(0, 100, 100); // 红色
    noStroke();
    circle(x, y, 20, 20); // 苹果的主体
    // 绘制苹果的叶子
    fill(80, 100, 50); // 绿色
    triangle(x - 8, y - 10, x - 12, y - 15, x - 4, y - 15); // 叶子
    // 绘制苹果的茎
    stroke(30, 100, 30); // 棕色
    strokeWeight(2);
    line(x - 5, y - 10, x - 5, y - 15); // 茎
  }
  pop();
}

function mousePressed() {
  // 检查是否点击了图标
  if (mouseX > iconX && mouseX < iconX + 3 * (iconSize + iconPadding) &&
    mouseY > iconY && mouseY < iconY + iconSize) {
    // 计算点击了哪个图标
    if (mouseX < iconX + iconSize) {
      mode = 'drag'; // 切换到拖拽模式
    } else if (mouseX < iconX + 2 * (iconSize + iconPadding)) {
      mode = 'feed'; // 切换到喂养模式
    } else {
      reset(); // 重置
    }
  }

  if (!isExploded) {
    if (mode === 'feed') {
      // 检查是否点击了食物
      for (let i = foods.length - 1; i >= 0; i--) {
        let d = dist(mouseX, mouseY, foods[i].x, foods[i].y);
        if (d < 10) { // 如果点击了食物
          targetRadius += radiusIncrement; // 增加史莱姆的半径
          foods.splice(i, 1); // 移除被点击的食物
          if (targetRadius > 200) {   // 如果史莱姆变得太大，爆炸成小史莱姆
            explode();
          }
          break;
        }
      }

      // 如果食物被吃完了，重新生成食物
      if (foods.length === 0) {
        initializeFoods();
      }
    } else if (mode === 'drag') {
      // 检查是否点击了史莱姆的边缘
      let d = dist(mouseX, mouseY, width / 2, height / 2);
      if (d > baseRadius - 20 && d < baseRadius + 20) {
        isDragging = true;
        dragOffsetX = mouseX - width / 2;
        dragOffsetY = mouseY - height / 2;
      }
    }
  }
}

function mouseDragged() {
  if (mode === 'drag' && isDragging) {
    // 计算鼠标移动的方向
    let dx = mouseX - (width / 2 + dragOffsetX);
    let dy = mouseY - (height / 2 + dragOffsetY);
    // 根据鼠标移动方向拉伸史莱姆
    stretchX = map(abs(dx), 0, baseRadius, 1, 2); // 水平拉伸
    stretchY = map(abs(dy), 0, baseRadius, 1, 2); // 垂直拉伸
  }
}

function mouseReleased() {
  if (mode === 'drag') {
    isDragging = false;
  }
}

function explode() {
  isExploded = true;
  let numSmallSlimes = 3; // 小史莱姆的数量
  for (let i = 0; i < numSmallSlimes; i++) {
    let x = width / 2;
    let y = height / 2;
    let speedX = random(-3, 3); // 随机水平速度
    let speedY = random(-3, 3); // 随机垂直速度
    let radius = 20; // 小史莱姆的半径
    smallSlimes.push({ x, y, speedX, speedY, radius });
  }
}

function reset() {
  isExploded = false;
  baseRadius = 50;
  targetRadius = baseRadius;
  smallSlimes = [];
  foods = [];
  stretchX = 1;
  stretchY = 1;
  initializeFoods(); // 重新生成食物
}

// 更新小史莱姆的位置
function updateSmallSlime(slime) {
  slime.x += slime.speedX;
  slime.y += slime.speedY;

  // 边界碰撞检测
  if (slime.x - slime.radius < 0 || slime.x + slime.radius > width) {
    slime.speedX *= -1; // 水平反弹
  }
  if (slime.y - slime.radius < 0 || slime.y + slime.radius > height) {
    slime.speedY *= -1; // 垂直反弹
  }
}

// 绘制小史莱姆
function drawSmallSlime(slime) {
  noFill();
  stroke((frameCount + slime.x) % 360, 80, 100); // 小史莱姆的颜色
  strokeWeight(8);
  circle(slime.x, slime.y, slime.radius * 3);

  // 绘制小史莱姆的眼睛
  drawSmallEye(slime.x - slime.radius * 0.5, slime.y - slime.radius * 0.4);
  drawSmallEye(slime.x + slime.radius * 0.5, slime.y - slime.radius * 0.4);
}

// 绘制小史莱姆的眼睛
function drawSmallEye(eyeX, eyeY) {
  fill(255);
  noStroke();
  ellipse(eyeX, eyeY, 10, 10); // 眼白
  fill(0);
  ellipse(eyeX, eyeY, 5, 5); // 瞳孔
}

function drawMouth() {
  // 计算嘴巴的大小和位置
  let mouthWidth = map(baseRadius, 20, 200, 10, 100); // 增大嘴巴宽度
  let mouthHeight = map(baseRadius, 20, 200, 10, 25); // 增大嘴巴高度
  let mouthX = width / 2; // 嘴巴的 x 位置
  let mouthY = height / 2 + baseRadius * 0.4 * stretchY; // 嘴巴的 y 位置
  push();
  colorMode(RGB);
  noStroke();

  // 外圈深红色
  fill(150, 20, 30);
  rect(mouthX - mouthWidth * stretchX, mouthY - mouthHeight * stretchY, mouthWidth * 2 * stretchX, mouthHeight * 2 * stretchY, 20);
  //内圈上下两个嘴唇 纯红色 比上面的窄一点 
  fill(255, 0, 0);
  rect(mouthX - mouthWidth * stretchX * 0.8, mouthY - mouthHeight * stretchY * 0.8, mouthWidth * 2 * stretchX * 0.8, mouthHeight * 2 * stretchY * 0.8, 20);
  fill(150, 20, 30);
  //用深红色的矩形遮住上下两个嘴唇的连接处 在纯红色矩形中间画一条很细的深红色线
  rect(mouthX - mouthWidth * stretchX * 0.8, mouthY , mouthWidth * 2 * stretchX * 0.8, 4);
  pop();
}
