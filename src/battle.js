/**
 * Undertale 4th Anniversary - Battle System Engine
 * Faithful replica of Undertale battle interface, menu logic, and text sequences.
 */

class BattleManager {
  constructor() {
    this.isActive = false;

    // Combatant Stats
    this.mallikaHp = 20;
    this.mallikaMaxHp = 20;
    this.jaydonHp = 20;
    this.jaydonMaxHp = 20;
    this.jaydonAtk = 1;
    this.jaydonDef = 999;
    this.jaydonSparedEligible = false;
    this.actsCompletedCount = 0;

    // Main Buttons: 0: FIGHT, 1: ACT, 2: ITEM, 3: MERCY
    this.selectedButton = 0;
    this.buttonNames = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];

    // State machine within battle:
    // 'SELECT_BUTTON', 'SUBMENU_ACT', 'SUBMENU_ITEM', 'SUBMENU_MERCY',
    // 'FIGHT_METER', 'FIGHT_SLASH', 'MESSAGE', 'JAYDON_TALK'
    this.battleState = 'SELECT_BUTTON';

    // Submenu cursor indices
    this.actIndex = 0;
    this.itemIndex = 0;
    this.mercyIndex = 0;

    // Fight meter animation state
    this.fightMeterX = 0;
    this.fightMeterSpeed = 350;
    this.fightMeterDirection = 1;
    this.isFighting = false;
    this.slashTimer = 0;

    // Items inventory
    this.items = [
      { name: 'Sticky Toffee Pudding', used: false },
      { name: 'dress', used: false }
    ];

    // Current battle text display
    this.currentText = "* (Why is he in pajama pants?)";
    this.textCharIndex = 0;
    this.textTimer = 0;
    this.textSpeed = 25;
    this.messageQueue = [];
    this.onMessageDoneCallback = null;

    // Jaydon Dialogue Bubble
    this.jaydonBubbleText = "";
    this.jaydonBubbleTimer = 0;
    this.jaydonPortrait = 'neutral';
  }

  startBattle() {
    this.isActive = true;
    this.mallikaHp = 20;
    this.mallikaMaxHp = 20;
    this.jaydonHp = 20;
    this.jaydonMaxHp = 20;
    this.jaydonAtk = 1;
    this.jaydonDef = 999;
    this.jaydonSparedEligible = false;
    this.actsCompletedCount = 0;
    this.selectedButton = 0;
    this.battleState = 'SELECT_BUTTON';
    this.jaydonPortrait = 'neutral';

    this.items = [
      { name: 'Sticky Toffee Pudding', used: false },
      { name: 'dress', used: false }
    ];

    this.setBattleText("* (Why is he in pajama pants?)");

    if (window.audioManager) {
      window.audioManager.playBgm('battle');
    }
  }

  wrapText(text, maxChars = 34) {
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

  setBattleText(text, onDone = null) {
    this.currentText = this.wrapText(text, 34);
    this.textCharIndex = 0;
    this.textTimer = 0;
    this.onMessageDoneCallback = onDone;
  }

  setMultipleMessages(messages, onDone = null) {
    this.messageQueue = [...messages];
    this.battleState = 'MESSAGE';
    this.advanceMessageQueue(onDone);
  }

  advanceMessageQueue(finalCallback = null) {
    if (this.messageQueue.length > 0) {
      const nextMsg = this.messageQueue.shift();
      this.setBattleText(nextMsg, () => {
        this.advanceMessageQueue(finalCallback);
      });
    } else {
      if (finalCallback) {
        finalCallback();
      } else {
        this.battleState = 'SELECT_BUTTON';
        this.setBattleText("* (Why is he in pajama pants?)");
      }
    }
  }

  update(dt, input) {
    if (!this.isActive) return;

    // Typewriter text animation
    if (this.textCharIndex < this.currentText.length) {
      const speed = (input.isDown('KeyX') || input.isDown('ShiftLeft')) ? 5 : this.textSpeed;
      this.textTimer += dt;
      if (this.textTimer >= speed) {
        this.textTimer = 0;
        this.textCharIndex++;
        const char = this.currentText[this.textCharIndex - 1];
        if (char !== ' ' && char !== '\n' && window.audioManager) {
          window.audioManager.playTextBlip();
        }
      }
    }

    // Handle states
    switch (this.battleState) {
      case 'SELECT_BUTTON':
        this.handleButtonSelect(input);
        break;

      case 'SUBMENU_ACT':
        this.handleActSubmenu(input);
        break;

      case 'SUBMENU_ITEM':
        this.handleItemSubmenu(input);
        break;

      case 'SUBMENU_MERCY':
        this.handleMercySubmenu(input);
        break;

      case 'FIGHT_METER':
        this.handleFightMeter(dt, input);
        break;

      case 'FIGHT_SLASH':
        this.slashTimer += dt;
        if (this.slashTimer >= 500) {
          this.slashTimer = 0;
          this.jaydonHp = Math.max(1, this.jaydonHp - 1);
          this.jaydonPortrait = 'laugh';
          const punchMsg = (window.game && window.game.hasPunchedBag)
            ? "* Jaydon laughs and dramatically pretends to take 1 extra damage from that punching bag workout!"
            : "* Jaydon laughs and dramatically pretends to take 1 damage anyway.";
          const reactionMsg = (window.game && window.game.hasPunchedBag)
            ? "Haha! Ow, ow! Those strong core muscles are really paying off!"
            : "Haha! Ow, ow, critical hit!";
          this.setMultipleMessages([
            "* You try to attack, but you can't bring yourself to do it.",
            punchMsg
          ], () => {
            this.jaydonTurnReaction(reactionMsg);
          });
        }
        break;

      case 'MESSAGE':
        if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
          if (this.textCharIndex < this.currentText.length) {
            this.textCharIndex = this.currentText.length;
          } else if (this.onMessageDoneCallback) {
            const cb = this.onMessageDoneCallback;
            this.onMessageDoneCallback = null;
            cb();
          }
        }
        break;

      case 'JAYDON_TALK':
        if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
          if (this.textCharIndex < this.currentText.length) {
            this.textCharIndex = this.currentText.length;
          } else {
            // Return to player's turn
            this.battleState = 'SELECT_BUTTON';
            this.setBattleText("* (Why is he in pajama pants?)");
          }
        }
        break;
    }
  }

  // --- BUTTON NAVIGATION ---
  handleButtonSelect(input) {
    if (input.wasPressed('ArrowLeft') || input.wasPressed('KeyA')) {
      this.selectedButton = (this.selectedButton + 3) % 4;
      if (window.audioManager) window.audioManager.playMenuMove();
    }
    if (input.wasPressed('ArrowRight') || input.wasPressed('KeyD')) {
      this.selectedButton = (this.selectedButton + 1) % 4;
      if (window.audioManager) window.audioManager.playMenuMove();
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();
      if (this.selectedButton === 0) {
        // FIGHT
        this.battleState = 'FIGHT_METER';
        this.fightMeterX = 50;
        this.fightMeterDirection = 1;
      } else if (this.selectedButton === 1) {
        // ACT
        this.battleState = 'SUBMENU_ACT';
        this.actIndex = 0;
      } else if (this.selectedButton === 2) {
        // ITEM
        this.battleState = 'SUBMENU_ITEM';
        this.itemIndex = 0;
      } else if (this.selectedButton === 3) {
        // MERCY
        this.battleState = 'SUBMENU_MERCY';
        this.mercyIndex = 0;
      }
    }
  }

  // --- FIGHT METER ---
  handleFightMeter(dt, input) {
    this.fightMeterX += this.fightMeterSpeed * (dt / 1000) * this.fightMeterDirection;
    if (this.fightMeterX > 550) {
      this.fightMeterX = 550;
      this.fightMeterDirection = -1;
    } else if (this.fightMeterX < 50) {
      this.fightMeterX = 50;
      this.fightMeterDirection = 1;
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) {
        window.audioManager.playSlash();
        setTimeout(() => window.audioManager.playHit(), 200);
      }
      this.battleState = 'FIGHT_SLASH';
      this.slashTimer = 0;
    }
  }

  // --- ACT SUBMENU ---
  handleActSubmenu(input) {
    const actOptions = ['Check', 'Flirt', 'Smoke', 'Hold Hands'];

    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW')) {
      this.actIndex = (this.actIndex + actOptions.length - 1) % actOptions.length;
      if (window.audioManager) window.audioManager.playMenuMove();
    }
    if (input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      this.actIndex = (this.actIndex + 1) % actOptions.length;
      if (window.audioManager) window.audioManager.playMenuMove();
    }

    if (input.wasPressed('KeyX') || input.wasPressed('ShiftLeft')) {
      this.battleState = 'SELECT_BUTTON';
      if (window.audioManager) window.audioManager.playMenuCancel();
      return;
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();
      this.actsCompletedCount++;
      if (this.actsCompletedCount >= 2) {
        this.jaydonSparedEligible = true;
      }

      if (this.actIndex === 0) {
        // Check
        this.jaydonPortrait = 'neutral';
        this.setMultipleMessages([
          "* JAYDON - ATK 1 DEF 999",
          "* Currently trying his best to give you the sweetest anniversary possible."
        ], () => {
          this.jaydonTurnReaction("I mean, I really am trying my best here!");
        });
      } else if (this.actIndex === 1) {
        // Flirt
        this.jaydonPortrait = 'blush';
        this.jaydonDef = 0;
        this.setMultipleMessages([
          "* You give Jaydon that familiar look.",
          "* Jaydon blushes bright red! His defense dropped to 0."
        ], () => {
          this.jaydonTurnReaction("Whoa... hey there... is it warm in here, or is it just you?");
        });
      } else if (this.actIndex === 2) {
        // Smoke
        this.jaydonPortrait = 'cough';
        this.mallikaHp = Math.max(1, this.mallikaHp - 5);
        this.jaydonHp = Math.max(1, this.jaydonHp - 5);
        this.jaydonDef = Math.max(0, this.jaydonDef - 50);
        if (window.audioManager) window.audioManager.playHit();
        this.setMultipleMessages([
          "* You both share a joint.",
          "* *Cough cough*",
          "* (Deals 5 damage to both of you! Defense lowered!)"
        ], () => {
          this.jaydonTurnReaction("*cough cough* Totally worth it though.");
        });
      } else if (this.actIndex === 3) {
        // Hold Hands
        this.jaydonPortrait = 'neutral';
        this.jaydonSparedEligible = true;
        this.setMultipleMessages([
          "* You take Jaydon's hand.",
          "* It feels warm and steady.",
          "* Jaydon's name turns YELLOW on the Mercy menu!"
        ], () => {
          this.jaydonTurnReaction("You have no idea how much I love holding your hand.");
        });
      }
    }
  }

  // --- ITEM SUBMENU ---
  handleItemSubmenu(input) {
    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW') || input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      this.itemIndex = (this.itemIndex + 1) % this.items.length;
      if (window.audioManager) window.audioManager.playMenuMove();
    }

    if (input.wasPressed('KeyX') || input.wasPressed('ShiftLeft')) {
      this.battleState = 'SELECT_BUTTON';
      if (window.audioManager) window.audioManager.playMenuCancel();
      return;
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();
      const item = this.items[this.itemIndex];

      if (item.name === 'Sticky Toffee Pudding') {
        this.mallikaHp = this.mallikaMaxHp;
        if (window.audioManager) window.audioManager.playHeal();
        this.setMultipleMessages([
          "* You shared the freshly baked Sticky Toffee Pudding!",
          "* It was made with love. Fully restores HP!"
        ], () => {
          this.jaydonPortrait = 'laugh';
          this.jaydonTurnReaction("Mmm, dates and brown sugar... best pudding ever!");
        });
      } else if (item.name === 'dress') {
        this.jaydonPortrait = 'blush';
        this.setMultipleMessages([
          "* You inspect the package...",
          "* It's a new pretty dress! Mallika's style increased by 100!"
        ], () => {
          this.jaydonTurnReaction("You're going to look absolutely stunning in it.");
        });
      }
    }
  }

  // --- MERCY SUBMENU ---
  handleMercySubmenu(input) {
    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW') || input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      this.mercyIndex = (this.mercyIndex + 1) % 2;
      if (window.audioManager) window.audioManager.playMenuMove();
    }

    if (input.wasPressed('KeyX') || input.wasPressed('ShiftLeft')) {
      this.battleState = 'SELECT_BUTTON';
      if (window.audioManager) window.audioManager.playMenuCancel();
      return;
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();

      if (this.mercyIndex === 0) {
        // SPARE
        if (this.jaydonSparedEligible) {
          this.jaydonPortrait = 'laugh';
          this.setMultipleMessages([
            "* You chose to SPARE Jaydon.",
            "* YOU WON! You earned 0 EXP and lots of LOVE.",
            "* But you gained something infinitely more precious."
          ], () => {
            this.triggerVictoryFinale();
          });
        } else {
          this.setMultipleMessages([
            "* Jaydon isn't ready to be spared yet.",
            "* Try taking his hand or showing some love first!"
          ]);
        }
      } else if (this.mercyIndex === 1) {
        // DATE (Always available, instant victory!)
        this.jaydonPortrait = 'laugh';
        this.setMultipleMessages([
          "* You chose to DATE Jaydon!",
          "* An absolute critical hit of pure joy straight to his heart!",
          "* Jaydon says: 'YES! A thousand times yes!'"
        ], () => {
          this.triggerVictoryFinale();
        });
      }
    }
  }

  // --- JAYDON'S REACTION TURN ---
  jaydonTurnReaction(text) {
    this.battleState = 'JAYDON_TALK';
    this.setBattleText(`* Jaydon: "${text}"`);
  }

  // --- VICTORY & FINALE TRIGGER ---
  triggerVictoryFinale() {
    this.isActive = false;
    if (window.game) {
      window.game.startFinale();
    }
  }

  // --- RENDER BATTLE SCREEN ---
  draw(ctx, canvasWidth, canvasHeight) {
    if (!this.isActive) return;

    // Pitch Black Void Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 1. Draw Jaydon's Large Battle Sprite (Centered top)
    if (window.spriteManager && window.spriteManager.jaydonBattle) {
      const bob = Math.sin(Date.now() * 0.003) * 3;
      const jx = canvasWidth / 2 - 72;
      const jy = 30 + bob;
      ctx.drawImage(window.spriteManager.jaydonBattle, jx, jy);

      // Render attack slash animation if fighting
      if (this.battleState === 'FIGHT_SLASH') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(jx + 20, jy + 20);
        ctx.lineTo(jx + 120, jy + 120);
        ctx.stroke();
      }
    }

    // 2. Main Central Box (Action/Message/Fight Box)
    const boxX = 40;
    const boxY = 220;
    const boxW = 560;
    const boxH = 140;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);

    // --- CENTRAL BOX CONTENT DEPENDING ON STATE ---
    if (this.battleState === 'FIGHT_METER') {
      // Fight target oval
      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 3;
      ctx.strokeRect(boxX + 20, boxY + 20, boxW - 40, boxH - 40);

      // Target center line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(boxX + boxW / 2 - 2, boxY + 10, 4, boxH - 20);

      // Moving reticle bar
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.fightMeterX, boxY + 10, 10, boxH - 20);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(this.fightMeterX + 3, boxY + 10, 4, boxH - 20);

    } else if (this.battleState === 'SUBMENU_ACT') {
      const acts = ['* Check', '* Flirt', '* Smoke', '* Hold Hands'];
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px "Press Start 2P", monospace';
      acts.forEach((act, idx) => {
        const ax = boxX + 60 + (idx % 2) * 260;
        const ay = boxY + 45 + Math.floor(idx / 2) * 45;
        if (this.actIndex === idx) {
          ctx.drawImage(window.spriteManager.ui.soul, ax - 30, ay - 14, 16, 16);
        }
        ctx.fillText(act, ax, ay);
      });

    } else if (this.battleState === 'SUBMENU_ITEM') {
      ctx.font = '16px "Press Start 2P", monospace';
      this.items.forEach((item, idx) => {
        const ix = boxX + 60;
        const iy = boxY + 45 + idx * 45;
        ctx.fillStyle = '#ffffff';
        if (this.itemIndex === idx) {
          ctx.drawImage(window.spriteManager.ui.soul, ix - 30, iy - 14, 16, 16);
        }
        ctx.fillText(`* ${item.name}`, ix, iy);
      });

    } else if (this.battleState === 'SUBMENU_MERCY') {
      ctx.font = '16px "Press Start 2P", monospace';
      // Spare option (yellow if eligible)
      const spareColor = this.jaydonSparedEligible ? '#ffff00' : '#ffffff';
      ctx.fillStyle = spareColor;
      if (this.mercyIndex === 0) {
        ctx.drawImage(window.spriteManager.ui.soul, boxX + 30, boxY + 45 - 14, 16, 16);
      }
      ctx.fillText("* Spare", boxX + 60, boxY + 45);

      // Date option (always bright yellow/orange!)
      ctx.fillStyle = '#ffaa00';
      if (this.mercyIndex === 1) {
        ctx.drawImage(window.spriteManager.ui.soul, boxX + 30, boxY + 95 - 14, 16, 16);
      }
      ctx.fillText("* Date (Instant Victory)", boxX + 60, boxY + 95);

    } else {
      // Typewriter Battle Flavour Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.textBaseline = 'top';

      let textStartX = boxX + 25;
      let textStartY = boxY + 30;

      // Draw portrait if in Jaydon talk
      if (this.battleState === 'JAYDON_TALK' && window.spriteManager.portraits[this.jaydonPortrait]) {
        ctx.drawImage(window.spriteManager.portraits[this.jaydonPortrait], boxX + 20, boxY + 25, 75, 75);
        textStartX += 90;
      }

      const visible = this.currentText.substring(0, this.textCharIndex);
      const lines = visible.split('\n');
      lines.forEach((l, idx) => {
        ctx.fillText(l, textStartX, textStartY + idx * 26);
      });
    }

    // 3. Status Bar: MALLIKA LV 1 HP 20/20 | JAYDON HP 20/20
    const statusY = 380;
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';

    // Player Status
    ctx.fillText("MALLIKA   LV 1", 45, statusY);
    ctx.fillText("HP", 260, statusY);

    // HP Bar: Red background, Yellow filled
    const hpBarW = 100;
    const hpBarH = 14;
    ctx.fillStyle = '#c72228';
    ctx.fillRect(295, statusY - 12, hpBarW, hpBarH);
    ctx.fillStyle = '#ffff00';
    const filledW = (this.mallikaHp / this.mallikaMaxHp) * hpBarW;
    ctx.fillRect(295, statusY - 12, filledW, hpBarH);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.mallikaHp} / ${this.mallikaMaxHp}`, 410, statusY);

    // Opponent Status
    ctx.fillText("JAYDON HP", 45, statusY + 20);
    ctx.fillStyle = '#c72228';
    ctx.fillRect(160, statusY + 8, 80, 10);
    ctx.fillStyle = '#00ff66';
    const jHpW = (this.jaydonHp / this.jaydonMaxHp) * 80;
    ctx.fillRect(160, statusY + 8, jHpW, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${this.jaydonHp}/20`, 255, statusY + 18);

    // 4. Four Main Undertale Action Buttons
    const btnW = 125;
    const btnH = 42;
    const btnY = 420;
    const startX = 40;
    const gap = 20;

    for (let i = 0; i < 4; i++) {
      const bx = startX + i * (btnW + gap);
      const isSelected = (this.battleState === 'SELECT_BUTTON' && this.selectedButton === i);

      // Button Border
      ctx.fillStyle = isSelected ? '#ff8800' : '#c7621c';
      ctx.fillRect(bx, btnY, btnW, btnH);
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx + 3, btnY + 3, btnW - 6, btnH - 6);

      // Red Heart cursor placed inside selected button
      if (isSelected) {
        ctx.drawImage(window.spriteManager.ui.soul, bx + 10, btnY + 13, 16, 16);
      }

      // Button Label
      ctx.fillStyle = isSelected ? '#ffaa00' : '#e66518';
      ctx.font = '14px "Press Start 2P", monospace';
      const labelX = isSelected ? bx + 32 : bx + 22;
      ctx.fillText(this.buttonNames[i], labelX, btnY + 26);
    }
  }
}

window.battleManager = new BattleManager();
