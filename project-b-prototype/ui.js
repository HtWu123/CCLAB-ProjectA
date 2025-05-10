// 绘制控制面板
function drawInterface() {
    // 调色板区域
    fill(30,30,40,200);
    stroke(100,100,120);
    rect(paletteX, paletteY, paletteW, paletteH, 10);
    for (let item of paletteItems) {
        drawNoteIcon(item.imageIndex, item.x, item.y, 40);
    }
  
    // 速度滑块
    fill(30,30,40,200);
    stroke(100,100,120);
    rect(speedSliderX, speedSliderY, speedSliderW, speedSliderH, 10);
    let pos = map(rotationSpeed, 0.1, 2.0, speedSliderX, speedSliderX + speedSliderW);
    let ci = int(map(rotationSpeed, 0.1, 2.0, 0, noteColors.length-1));
    fill('#FA812F');
    noStroke();
    circle(pos, speedSliderY + speedSliderH/2, 25);
  
    fill(200);
    noStroke();
    textSize(14);
    text(`Rotation: ${rotationSpeed.toFixed(1)}x`,
         speedSliderX + speedSliderW/2, speedSliderY - 10);
  
    // 清除按钮
    fill(80,30,30,200);
    stroke(150,80,80);
    rect(clearButtonX, clearButtonY, clearButtonW, clearButtonH, 10);
    fill(220);
    noStroke();
    textSize(16);
    text("Clear All Notes",
         clearButtonX + clearButtonW/2,
         clearButtonY + clearButtonH/2);
  
    // 调试信息
    fill(255);
    noStroke();
    textAlign(LEFT, TOP);
    text(`Elements: ${allElements.length}`, width - 150, 20);
    text(`Rotation: ${rotation.toFixed(1)}°`, width - 150, 40);
    textAlign(CENTER, CENTER);
  }
  
  function drawDraggedElement() {
    let idx = draggedElement.imageIndex;
    // 跟随鼠标绘制图标
    drawNoteIcon(idx, mouseX, mouseY, 40);
  }