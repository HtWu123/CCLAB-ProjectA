class Disk {
    constructor(x, y, radius) {
      this.x = x; 
      this.y = y;
      this.radius = radius;
      this.rotation = 0;
    }
  
    // 绘制唱片盘（底盘 + 轨道 + 旋转元素 + 指针）
    draw(elements, currentRotation) {
      push();
      // 移动到唱片中心
      translate(this.x, this.y);
      this.rotation = currentRotation;
  
      // —— 绘制底盘 ——
      fill('#FA812F');            // 底色
      stroke('#DFD0B8');          // 边框色
      strokeWeight(3);             // 边框粗细
      ellipse(0, 0, this.radius * 2, this.radius * 2);
  
      // —— 绘制三条同心轨道 ——
      this.drawTracks();
  
      // —— 旋转并绘制各音符元素 ——
      push();
      rotate(this.rotation);            // 整盘旋转
      noStroke();
      fill('#948979');                         // 字的颜色
      textAlign(CENTER, CENTER);  
      textSize(this.radius * 0.1);           // 字体大小为半径的 10%  
      text("Echo Archive", 0, 0); 
      for (let e of elements) {
        push();
        rotate(e.angle);           // 每个元素相对于盘的角度
        // 如果正好经过指针区，高亮提示
        if (e.highlighted) {
          noStroke();
          fill(noteColors[e.imageIndex], 150);
          ellipse(e.radius, 0, 50, 50);
        }
        drawNoteIcon(e.imageIndex, e.radius, 0, 40);
        pop();
      }
      pop();
  
      // —— 绘制指针 ——
      this.drawNeedle();
  
      pop();
    }
  
    // 绘制三条同心轨道
    drawTracks() {
      for (let i = 0; i < 3; i++) {
        let inner = this.radius * (i * 0.3);
        let outer = this.radius * ((i + 1) * 0.3);
  
        // 轨道填充
        fill('#FFB22C');
        noStroke();
        ellipse(0, 0, outer * 2, outer * 2);
  
        // 中心"空洞"
        if (inner > 0) {
          fill('#222831');
          ellipse(0, 0, inner * 2, inner * 2);
        }
  
        // 轨道边界
        noFill();
        stroke(150, 150, 200, 100);
        strokeWeight(1);
        ellipse(0, 0, outer * 2, outer * 2);
      }
  
      // 中心小孔
      fill('#FEF3E2');
      stroke(0);
      strokeWeight(3);
      circle(0, 0, this.radius * 0.2);
    }
  
    // 绘制固定指针
    drawNeedle() {
      stroke('#BB3E00');
      strokeWeight(8);
      line(0, 0, this.radius + 20, 0);
  
      fill('#7C4585');
      noStroke();
      ellipse(this.radius + 20, 0, 12, 12);
  
      fill(200, 200, 255);
      ellipse(0, 0, 10, 10);
    }
  
    // 检查每个元素是否经过指针区，若进入则播放音符并短暂高亮
    checkElements(elements, currentRotation) {
      const startAngle = 355, endAngle = 5;
      for (let e of elements) {
        let ga = (e.angle + currentRotation) % 360;
        let inZone = (ga >= startAngle || ga <= endAngle);
        if (inZone && !e.inNeedleZone) {
          this.playNote(e.note, e.instrument);
          e.highlighted = true;
          setTimeout(() => { e.highlighted = false; }, 300);
        }
        e.inNeedleZone = inZone;
      }
    }
  
    // 小工具：根据鼠标到盘心距离判断所在轨道
    getTrackFromDistance(d) {
      if (d < this.radius * 0.3) return 0;
      if (d < this.radius * 0.6) return 1;
      return 2;
    }
  
    // 小工具：根据轨道索引返回摆放半径和声音合成器类型
    getTrackInfo(idx) {
      if (idx === 0) return { radius: this.radius * 0.15, instrument: 'sine' };
      if (idx === 1) return { radius: this.radius * 0.45, instrument: 'triangle' };
      return { radius: this.radius * 0.75, instrument: 'square' };
    }
  
    // 播放指定音符
    playNote(note, instrument) {
      const freqs = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88 };
      let osc = new p5.Oscillator(instrument);
      osc.freq(freqs[note] || 440);
      osc.amp(instrument === 'sine' ? 0.4 : instrument === 'triangle' ? 0.3 : 0.25);
      osc.start();
      setTimeout(() => {
        osc.amp(0, 0.1);
        setTimeout(() => osc.stop(), 100);
      }, 300);
    }
  }