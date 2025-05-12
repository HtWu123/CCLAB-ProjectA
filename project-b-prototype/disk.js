class Disk {
    constructor(x, y, radius) {
      this.x = x; 
      this.y = y;
      this.radius = radius;
      this.rotation = 0;
    }
  
    // 绘制唱片盘
    draw(elements, currentRotation) {
      push();
      translate(this.x, this.y);
      this.rotation = currentRotation;
  
      fill('#FA812F');            // 底色
      circle(0, 0, this.radius * 2);
  
      // 绘制三条轨道
      this.drawTracks();
      // 旋转并绘制各音符元素
      push();
      rotate(this.rotation); // total rotate
      noStroke();
      fill('#948979');
      textAlign(CENTER, CENTER);  
      textSize(this.radius * 0.1); 
      textStyle(BOLD); 
      text("Echo Archive", 0, 0); 

      for (let e of elements) {
        push();
        rotate(e.angle);     // 每个元素相对于盘的角度
        // 如果pass through the needle，highlight
        if (e.highlighted) {
          noStroke();
          fill(noteColors[e.imageIndex], 150);
          circle(e.radius, 0, 50);
        }
        drawNoteIcon(e.imageIndex, e.radius, 0, 40);
        pop();
      }
      pop();
      //needle
      this.drawNeedle();
      pop();
    }
  
    //轨道
    drawTracks() {
      for (let i = 0; i < 3; i++) {
        let inner = this.radius * (i * 0.3);
        let outer = this.radius * ((i + 1) * 0.3);
  
        fill('#FFB22C');
        noStroke();
        circle(0, 0, outer * 2);
  
        // 中间的圈
        if (inner > 0) {
          fill('#222831');
          circle(0, 0, inner * 2);
        }
      }
  
      // 中心小孔
      fill('#FEF3E2');
      stroke(0);
      strokeWeight(3);
      circle(0, 0, this.radius * 0.15);
    }
  
    drawNeedle() {
      stroke('#BB3E00');
      strokeWeight(8);
      line(0, 0, this.radius + 20, 0);
  
      fill('#7C4585');
      noStroke();
      circle(this.radius + 20, 0, 12);
  
      fill(200, 200, 255);
      circle(0, 0, 10, 10);
    }
  
    // check 是否经过指针位置，如果是则播放
    checkElements(elements, currentRotation) {
      const startAngle = 355, endAngle = 5; //在这个角度内的话就播放
      for (let e of elements) {
        let ga = (e.angle + currentRotation) % 360; //element angle
        let inZone = (ga >= startAngle || ga <= endAngle);
        if (inZone && !e.inNeedleZone) {
          this.playNote(e.note, e.instrument);
          e.highlighted = true;
          setTimeout(() => { e.highlighted = false; }, 300);
        }
        e.inNeedleZone = inZone;
      }
    }
  
    // calculate which tone
    getTrackFromDistance(d) {
      if (d < this.radius * 0.3) return 0;
      if (d < this.radius * 0.6) return 1;
      return 2;
    }
  
    // instrument
    getTrackInfo(idx) {
      if (idx === 0) return { radius: this.radius * 0.15, instrument: 'sawtooth' };
      if (idx === 1) return { radius: this.radius * 0.45, instrument: 'triangle' };
      return { radius: this.radius * 0.75, instrument: 'square' };
    }

    playNote(note, instrument) {
      const freqs = {
        C4: 261.63, D4: 293.66, E4: 329.63,
        F4: 349.23, F_4: 370.00, G4: 392.00, A4: 440.00, B4: 493.88
      };
      
    
      let osc = new p5.Oscillator(instrument);
      osc.freq(freqs[note]);
      osc.start();
    
      let env = new p5.Envelope();
      env.setADSR(0.01, 0.15, 0.07, 0.4); 
      env.setRange(0.5, 0);
    
      env.play(osc);
    
      setTimeout(() => osc.stop(), 600);
    }
    
    
  }