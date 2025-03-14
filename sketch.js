let circleCount = 1;

function setup() {
  let canvas = createCanvas(500, 500);
  canvas.id("p5-canvas");
  canvas.parent("p5-canvas-container");
  noFill();
  strokeWeight(10);
  colorMode(HSB);
}

function draw() {
  background(0);

  for (let i = 0; i < circleCount; i++) {
    let r = 50 + i * 30; // 基础半径
    let offset = noise(frameCount * 0.05 + i) * 40 - 20; // 使用 noise 生成动态偏移量
    let R = r + offset; // 动态半径

    // 设置颜色
    stroke((frameCount + i * 30) % 360, 80, 100);

    // 开始绘制形状
    beginShape();
    for (let j = 0; j < 360; j += 10) {
      let angle = radians(j); // 将角度转换为弧度
      let noiseOffset = map(j, 0, 360, 0, 6); // 动态偏移
      let dynamicR = R + 20 * noise(frameCount * 0.05 + noiseOffset); 
      let x = width / 2 + dynamicR * cos(angle);
      let y = height / 2 + dynamicR * sin(angle);
      curveVertex(x, y); 
    }
    endShape(CLOSE); 
  }
}

function mousePressed() {
  if (circleCount < 10) {
    circleCount++;
  }
}