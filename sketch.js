let baseRadius = 50; // 基础半径
let targetRadius = baseRadius; // 目标半径
let radiusIncrement = 20; // 每次点击食物增加的半径
let lerpSpeed = 0.05; // 插值速度
let isExploded = false; // 是否爆炸
let smallSlimes = []; // 存储小史莱姆的数组
let foods = []; // 存储食物的数组
let foodCount = 5; // 食物的数量
let shrinkSpeed = 3; // 半径随时间减小的速度

function setup() {
  let canvas = createCanvas(500, 500);
  canvas.id("p5-canvas");
  canvas.parent("p5-canvas-container");
  noFill();
  strokeWeight(10);
  colorMode(HSB);

  // 初始化食物
  initializeFoods();
}

function draw() {
  background(0);

  if (!isExploded) {
    // 使用 lerp 平滑过渡半径
    baseRadius = lerp(baseRadius, targetRadius, lerpSpeed);

    // 随时间减小半径
    if (frameCount % 60 === 0) { // 每 60 帧减小一次半径
      targetRadius = max(targetRadius - shrinkSpeed, 20); // 最小半径为 20
    }

    // 绘制主史莱姆
    drawMainSlime();

    // 绘制眼睛
    drawEyes();

    // 绘制食物
    drawFoods();
  } else {
    // 绘制爆炸后的小史莱姆
    for (let i = 0; i < smallSlimes.length; i++) {
      updateSmallSlime(smallSlimes[i]);
      drawSmallSlime(smallSlimes[i]);
    }
  }
}

function drawMainSlime() {
  // 设置史莱姆的颜色
  stroke(frameCount % 360, 80, 100); // 史莱姆的颜色（动态变化）

  // 开始绘制史莱姆形状
  beginShape();
  for (let j = 0; j < 360; j += 10) {
    let angle = radians(j); // 将角度转换为弧度
    let noiseOffset = map(j, 0, 360, 0, 6); // 动态偏移
    let finalRadius = baseRadius + 20 * noise(frameCount * 0.05 + noiseOffset); 
    let x = width / 2 + finalRadius * cos(angle);
    let y = height / 2 + finalRadius * sin(angle);
    curveVertex(x, y); 
  }
  endShape(CLOSE); 
}

function drawEyes() {
  // 计算眼睛的大小
  let eyeSize = map(baseRadius, 20, 200, 20, 40); // 眼睛大小随半径变化
  let pupilSize = eyeSize / 2 + 3; // 瞳孔大小是眼睛大小的一半

  // 左眼
  let leftEyeX = width / 2 - baseRadius * 0.4;
  let leftEyeY = height / 2 - baseRadius * 0.3;
  drawEye(leftEyeX, leftEyeY, eyeSize, pupilSize);

  // 右眼
  let rightEyeX = width / 2 + baseRadius * 0.4;
  let rightEyeY = height / 2 - baseRadius * 0.3;
  drawEye(rightEyeX, rightEyeY, eyeSize, pupilSize);
}

function drawEye(eyeX, eyeY, eyeSize, pupilSize) {
  // 绘制眼睛的白色部分
  fill(255);
  noStroke();
  ellipse(eyeX, eyeY, eyeSize, eyeSize);

  // 计算瞳孔的偏移
  let pupilOffsetX = map(mouseX, 0, width, -6, 6); // 水平偏移
  let pupilOffsetY = map(mouseY, 0, height, -6, 6); // 垂直偏移

  // 绘制瞳孔
  fill(0);
  ellipse(eyeX + pupilOffsetX, eyeY + pupilOffsetY, pupilSize, pupilSize);
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
    fill(20*i, 100, 100); // 绿色食物
    noStroke();
    ellipse(foods[i].x, foods[i].y, 20, 20); // 食物的大小
  }
  pop();
}

function mousePressed() {
  if (!isExploded) {
    // 检查是否点击了食物
    for (let i = foods.length - 1; i >= 0; i--) {
      let d = dist(mouseX, mouseY, foods[i].x, foods[i].y);
      if (d < 10) { // 如果点击了食物
        targetRadius += radiusIncrement; // 增加史莱姆的半径
        foods.splice(i, 1); // 移除被点击的食物

        // 如果史莱姆变得太大，爆炸成小史莱姆
        if (targetRadius > 200) {
          explode();
        }
        break;
      }
    }

    // 如果食物被吃完了，重新生成食物
    if (foods.length === 0) {
      initializeFoods();
    }
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

function keyPressed() {
  // 按下任意键恢复原始状态
  reset();
}

function reset() {
  isExploded = false;
  baseRadius = 50;
  targetRadius = baseRadius;
  smallSlimes = [];
  foods = [];
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
  strokeWeight(5);
  ellipse(slime.x, slime.y, slime.radius * 2);

  // 绘制小史莱姆的眼睛
  drawSmallEye(slime.x - slime.radius * 0.3, slime.y - slime.radius * 0.2);
  drawSmallEye(slime.x + slime.radius * 0.3, slime.y - slime.radius * 0.2);
}

// 绘制小史莱姆的眼睛
function drawSmallEye(eyeX, eyeY) {
  fill(255);
  noStroke();
  ellipse(eyeX, eyeY, 10, 10); // 眼白
  fill(0);
  ellipse(eyeX, eyeY, 5, 5); // 瞳孔
}