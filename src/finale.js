/**
 * Undertale 4th Anniversary - Emotional Climax & Save Star Finale
 * Pulsing yellow Save Star, Determination monologue, peaceful resting scene.
 */

class FinaleManager {
  constructor() {
    this.isActive = false;
    this.fadeAlpha = 1.0;
    this.starScale = 1.0;
    this.starAngle = 0;
    this.particles = [];

    // Monologue pages with word wrap
    this.rawMonologue = [
      "* (Knowing how much love, laughter, and adventures you share...)",
      "* (...it fills you with DETERMINATION.)",
      "* Happy Anniversary, Mallika. I love you."
    ];
    this.monologue = this.rawMonologue.map(p => this.wrapText(p, 28));
    this.pageIndex = 0;
    this.charIndex = 0;
    this.charTimer = 0;
    this.textSpeed = 35;
    this.isDone = false;
  }

  wrapText(text, maxChars = 28) {
    const rawLines = text.split('\n');
    const result = [];
    for (let line of rawLines) {
      if (line.length <= maxChars) {
        result.push(line);
      } else {
        const words = line.split(' ');
        let cur = '';
        for (let w of words) {
          if (!cur) {
            cur = w;
          } else if ((cur + ' ' + w).length <= maxChars) {
            cur += ' ' + w;
          } else {
            result.push(cur);
            cur = w;
          }
        }
        if (cur) result.push(cur);
      }
    }
    return result.join('\n');
  }

  startFinale() {
    this.isActive = true;
    this.fadeAlpha = 1.0;
    this.pageIndex = 0;
    this.charIndex = 0;
    this.charTimer = 0;
    this.isDone = false;
    this.particles = [];

    // Switch music to Determination theme
    if (window.audioManager) {
      window.audioManager.playBgm('determination');
      window.audioManager.playSaveDing();
    }

    // Initialize sparkles that slowly orbit the Save Star
    for (let i = 0; i < 18; i++) {
      this.particles.push({
        angle: (i / 18) * Math.PI * 2,
        radius: 46 + (i % 3) * 18 + Math.random() * 8,
        speed: 0.35 + (i % 4) * 0.08,
        phase: Math.random() * Math.PI * 2,
        size: i % 3 === 0 ? 4 : 2
      });
    }
  }

  update(dt, input) {
    if (!this.isActive) return;

    // Smooth fade in from black
    if (this.fadeAlpha > 0) {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - dt * 0.001);
    }

    // Save Star pulsing animation (drives the halo + twinkle)
    const time = Date.now() * 0.0025;
    this.starScale = 1.0 + Math.sin(time) * 0.2;

    // Rotate the sparkle ring around the star
    this.particles.forEach(p => {
      p.angle += p.speed * dt * 0.001;
    });

    // Advance monologue text
    if (!this.isDone) {
      const currentText = this.monologue[this.pageIndex];
      const isFinishedTyping = this.charIndex >= currentText.length;

      if (!isFinishedTyping) {
        const speed = (input.isDown('KeyX') || input.isDown('ShiftLeft')) ? 5 : this.textSpeed;
        this.charTimer += dt;
        if (this.charTimer >= speed) {
          this.charTimer = 0;
          this.charIndex++;
          const char = currentText[this.charIndex - 1];
          if (char !== ' ' && char !== '\n' && window.audioManager) {
            window.audioManager.playTextBlip();
          }
        }
      }

      // Advance with Z / Enter
      if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
        if (!isFinishedTyping) {
          this.charIndex = currentText.length;
        } else {
          this.pageIndex++;
          if (this.pageIndex >= this.monologue.length) {
            this.isDone = true;
          } else {
            this.charIndex = 0;
            this.charTimer = 0;
          }
        }
      }
    } else {
      // Resting screen: Press Z to revisit Townhouse
      if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
        // Can optionally restart overworld if player wishes
      }
    }
  }

  draw(ctx, canvasWidth, canvasHeight) {
    if (!this.isActive) return;

    // Pitch black backdrop
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Golden halo glow around Save Star (pulses with the star)
    const halo = 90 + (this.starScale - 1) * 60;
    const glowGradient = ctx.createRadialGradient(320, 180, 5, 320, 180, halo);
    glowGradient.addColorStop(0, 'rgba(255, 255, 100, 0.42)');
    glowGradient.addColorStop(0.5, 'rgba(255, 220, 50, 0.15)');
    glowGradient.addColorStop(1, 'rgba(255, 220, 50, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(320, 180, halo, 0, Math.PI * 2);
    ctx.fill();

    // Golden sparkles orbiting the star (snapped to the 2x pixel grid)
    const now = Date.now() * 0.004;
    this.particles.forEach(p => {
      const px = Math.round((320 + Math.cos(p.angle) * p.radius) / 2) * 2;
      const py = Math.round((180 + Math.sin(p.angle) * p.radius * 0.8) / 2) * 2;
      const alpha = 0.35 + (Math.sin(now + p.phase) + 1) * 0.3;
      ctx.fillStyle = `rgba(255, 250, 190, ${alpha.toFixed(2)})`;
      ctx.fillRect(px, py, p.size, p.size);
      if (p.size > 2) {
        ctx.fillRect(px - 2, py + 1, 2, 2);
        ctx.fillRect(px + 4, py + 1, 2, 2);
        ctx.fillRect(px + 1, py - 2, 2, 2);
        ctx.fillRect(px + 1, py + 4, 2, 2);
      }
    });

    // Crisp pulsing Yellow Save Star (integer scale keeps the pixels clean)
    if (window.spriteManager && window.spriteManager.ui.saveStar) {
      const star = window.spriteManager.ui.saveStar;
      const scale = this.starScale > 1.12 ? 5 : 4;
      const size = 16 * scale;
      ctx.drawImage(star, 320 - size / 2, 180 - size / 2, size, size);
    }

    // Monologue Dialogue Box
    const boxX = 40;
    const boxY = 280;
    const boxW = 560;
    const boxH = 140;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);

    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    const textToShow = this.isDone
      ? this.monologue[this.monologue.length - 1]
      : this.monologue[this.pageIndex].substring(0, this.charIndex);

    // Special golden highlight for final line
    if (this.isDone || this.pageIndex === 2) {
      ctx.fillStyle = '#ffff55';
    }

    const lines = textToShow.split('\n');
    lines.forEach((l, idx) => {
      ctx.fillText(l, boxX + 30, boxY + 35 + idx * 26);
    });

    // Resting prompt
    if (this.isDone) {
      const restAlpha = 0.5 + Math.sin(Date.now() * 0.003) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${restAlpha})`;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText("♥ Always & Forever ♥", boxX + boxW / 2, boxY + boxH - 25);
      ctx.textAlign = 'left';
    }

    // Screen Fade Overlay
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }
}

window.finaleManager = new FinaleManager();
