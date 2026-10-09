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

    // Monologue pages
    this.monologue = [
      "* (Knowing how much love, laughter, and adventures you share...)",
      "* (...it fills you with DETERMINATION.)",
      "* Happy Anniversary, Mallika. I love you."
    ];
    this.pageIndex = 0;
    this.charIndex = 0;
    this.charTimer = 0;
    this.textSpeed = 35;
    this.isDone = false;
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

    // Initialize gentle star sparkle motes
    for (let i = 0; i < 25; i++) {
      this.particles.push({
        x: 320 + (Math.random() - 0.5) * 60,
        y: 180 + (Math.random() - 0.5) * 60,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: Math.random() * 2000,
        maxLife: 2000 + Math.random() * 2000,
        size: Math.random() * 3 + 1
      });
    }
  }

  update(dt, input) {
    if (!this.isActive) return;

    // Smooth fade in from black
    if (this.fadeAlpha > 0) {
      this.fadeAlpha = Math.max(0, this.fadeAlpha - dt * 0.001);
    }

    // Save Star pulsing animation
    const time = Date.now() * 0.0025;
    this.starScale = 1.0 + Math.sin(time) * 0.2;
    this.starAngle += dt * 0.0008;

    // Update sparkle particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life += dt;
      if (p.life > p.maxLife) {
        p.x = 320 + (Math.random() - 0.5) * 40;
        p.y = 180 + (Math.random() - 0.5) * 40;
        p.vx = (Math.random() - 0.5) * 0.8;
        p.vy = (Math.random() - 0.5) * 0.8;
        p.life = 0;
      }
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

    // Golden halo glow around Save Star
    const glowGradient = ctx.createRadialGradient(320, 180, 5, 320, 180, 100);
    glowGradient.addColorStop(0, 'rgba(255, 255, 100, 0.4)');
    glowGradient.addColorStop(0.5, 'rgba(255, 220, 50, 0.15)');
    glowGradient.addColorStop(1, 'rgba(255, 220, 50, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(320, 180, 100, 0, Math.PI * 2);
    ctx.fill();

    // Golden sparkle particles
    this.particles.forEach(p => {
      const alpha = 1.0 - (p.life / p.maxLife);
      ctx.fillStyle = `rgba(255, 255, 180, ${alpha})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    // Pulsing, rotating Yellow Save Star
    if (window.spriteManager && window.spriteManager.ui.saveStar) {
      ctx.save();
      ctx.translate(320, 180);
      ctx.scale(this.starScale * 2.5, this.starScale * 2.5);
      // Subtle gentle rotation
      ctx.rotate(this.starAngle);
      ctx.drawImage(window.spriteManager.ui.saveStar, -8, -8);
      ctx.restore();
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

    ctx.font = '15px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';

    const textToShow = this.isDone
      ? this.monologue[this.monologue.length - 1]
      : this.monologue[this.pageIndex].substring(0, this.charIndex);

    // Special golden highlight for final line
    if (this.isDone || this.pageIndex === 2) {
      ctx.fillStyle = '#ffff55';
    }

    const lines = textToShow.split('\n');
    lines.forEach((l, idx) => {
      ctx.fillText(l, boxX + 30, boxY + 45 + idx * 30);
    });

    // Resting prompt
    if (this.isDone) {
      const restAlpha = 0.5 + Math.sin(Date.now() * 0.003) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${restAlpha})`;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText("♥ Always & Forever ♥", boxX + boxW / 2 - 95, boxY + boxH - 25);
    }

    // Screen Fade Overlay
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  }
}

window.finaleManager = new FinaleManager();
