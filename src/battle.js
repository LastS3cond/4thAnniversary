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
    this.smokeCount = 0;
    this.flirtCount = 0;

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
      { name: 'Dress', used: false }
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

    // FIGHT impact feedback (shake, surprised 'o' mouth, damage number)
    this.hitFx = null;
    this.pendingDamage = 0;
    this.buttonIcons = null;
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
    this.smokeCount = 0;
    this.flirtCount = 0;
    this.selectedButton = 0;
    this.battleState = 'SELECT_BUTTON';
    this.jaydonPortrait = 'neutral';

    this.items = [
      { name: 'Sticky Toffee Pudding', used: false },
      { name: 'Dress', used: false }
    ];

    this.hitFx = null;
    this.setBattleText("* (Why is he in pajama pants?)");

    if (window.audioManager) {
      window.audioManager.playBgm('battle');
    }
  }

  // Splits a message into pages of at most 4 wrapped lines so text never spills out of the box.
  paginate(text, maxChars) {
    const lines = this.wrapText(text, maxChars).split('\n');
    const pages = [];
    for (let i = 0; i < lines.length; i += 4) pages.push(lines.slice(i, i + 4).join('\n'));
    return pages.length ? pages : [''];
  }

  wrapText(text, maxChars = 26) {
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

  setBattleText(text, onDone = null, maxChars = null) {
    const limit = maxChars || (this.battleState === 'JAYDON_TALK' ? 22 : 26);
    this.currentText = this.wrapText(text, limit);
    this.textCharIndex = 0;
    this.textTimer = 0;
    this.onMessageDoneCallback = onDone;
  }

  setMultipleMessages(messages, onDone = null) {
    this.messageQueue = [];
    messages.forEach((m) => this.messageQueue.push(...this.paginate(m, 26)));
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

    if (this.hitFx) {
      this.hitFx.t += dt;
      if (this.hitFx.t > 1500) this.hitFx = null;
    }

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
          const dmg = this.pendingDamage;
          if (dmg <= 0) {
            this.jaydonPortrait = 'neutral';
            this.setMultipleMessages([
              "* You try to attack, but you can't bring yourself to do it.",
              "* Jaydon has pretended enough."
            ], () => {
              this.jaydonTurnReaction("Hey, take it easy!");
            });
          } else {
            this.jaydonHp = Math.max(1, this.jaydonHp - dmg);
            this.jaydonPortrait = 'surprised';
            const punchMsg = (window.game && window.game.hasPunchedBag)
              ? "* Jaydon gasps and dramatically pretends to take 1 extra damage from that punching bag workout!"
              : `* Jaydon gasps and dramatically pretends to take ${dmg} damage anyway.`;
            const reactionMsg = (window.game && window.game.hasPunchedBag)
              ? "Whoa! Ow, ow! Those strong core muscles are really paying off!"
              : "Whoa! Ow, ow, critical hit!";
            this.setMultipleMessages([
              "* You try to attack, but you can't bring yourself to do it.",
              punchMsg
            ], () => {
              this.jaydonTurnReaction(reactionMsg);
            });
          }
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
          } else if (this.onMessageDoneCallback) {
            const cb = this.onMessageDoneCallback;
            this.onMessageDoneCallback = null;
            cb();
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
      // Timing-based damage (2-6, +1 from the punching bag workout).
      // Jaydon can be worn down to 1 HP but never lower: at 1 HP he has "pretended enough".
      const center = 320;
      const accuracy = Math.max(0, 1 - Math.abs(this.fightMeterX + 6 - center) / 270);
      let dmg = 2 + Math.round(accuracy * 4);
      if (window.game && window.game.hasPunchedBag) dmg += 1;
      this.pendingDamage = Math.max(0, Math.min(dmg, this.jaydonHp - 1));
      this.hitFx = { t: 0, dmg: this.pendingDamage };
      this.battleState = 'FIGHT_SLASH';
      this.slashTimer = 0;
    }
  }

  // --- ACT SUBMENU ---
  handleActSubmenu(input) {
    // 2x2 grid navigation:
    // [0: Check]   [1: Flirt]
    // [2: Smoke]   [3: Hug]
    if (input.wasPressed('ArrowLeft') || input.wasPressed('KeyA') || input.wasPressed('ArrowRight') || input.wasPressed('KeyD')) {
      this.actIndex = this.actIndex ^ 1;
      if (window.audioManager) window.audioManager.playMenuMove();
    }
    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW') || input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      this.actIndex = this.actIndex ^ 2;
      if (window.audioManager) window.audioManager.playMenuMove();
    }

    if (input.wasPressed('KeyX') || input.wasPressed('ShiftLeft')) {
      this.battleState = 'SELECT_BUTTON';
      if (window.audioManager) window.audioManager.playMenuCancel();
      return;
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();

      if (this.actIndex === 0) {
        // Check
        this.jaydonPortrait = 'neutral';
        this.setMultipleMessages([
          "* JAYDON - ATK 1 DEF 999",
          "* Currently trying his best to give you the sweetest anniversary possible."
        ], () => {
          this.jaydonTurnReaction("Do you like it so far?");
        });
      } else if (this.actIndex === 1) {
        // Flirt (Rotating responses)
        this.flirtCount++;
        this.jaydonPortrait = 'blush';
        this.jaydonDef = 0;
        const flirtResponses = [
          "Whoa...",
          "Focus, Focus, FOCUS",
          "That's not allowed",
          "HEY, what are you trying to do here?"
        ];
        const reactionText = flirtResponses[Math.min(this.flirtCount - 1, 3)];
        this.setMultipleMessages([
          "* You give Jaydon that familiar look.",
          "* Jaydon blushes bright red! His defense dropped to 0.",
          "* Jaydon looks back into his bedroom before refocusing on you."
        ], () => {
          this.jaydonTurnReaction(reactionText);
        });
      } else if (this.actIndex === 2) {
        // Smoke (Max 2 uses, then out of joints; no damage to Jaydon so max damage is 1)
        if (this.smokeCount >= 2) {
          this.setMultipleMessages([
            "* (We are out of joints!)"
          ], () => {
            this.battleState = 'SELECT_BUTTON';
            this.setBattleText("* (Why is he in pajama pants?)");
          });
          return;
        }
        this.smokeCount++;
        this.jaydonPortrait = 'cough';
        this.mallikaHp = Math.max(1, this.mallikaHp - 5);
        this.jaydonDef = Math.max(0, this.jaydonDef - 50);
        if (window.audioManager) window.audioManager.playHit();
        this.setMultipleMessages([
          "* You both share a joint.",
          "* *Cough cough*",
          "* (Deals 5 damage to Mallika! Defense lowered!)"
        ], () => {
          this.jaydonTurnReaction("*cough cough* Do you want some water?");
        });
      } else if (this.actIndex === 3) {
        // Hug (Only this makes Jaydon spare eligible!)
        this.jaydonPortrait = 'neutral';
        this.jaydonSparedEligible = true;
        this.setMultipleMessages([
          "* You wrap your arms around Jaydon in a warm hug.",
          "* His embrace feels warm and steady.",
          "* Jaydon's name turns YELLOW on the Mercy menu!"
        ], () => {
          this.jaydonTurnReaction("You give the best hugs in the world.");
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
          "* You shared the freshly baked Sticky Toffee Pudding! (HP Maxed)"
        ], () => {
          this.jaydonPortrait = 'neutral';
          this.jaydonTurnReaction("Is it as good as the one you made?", () => {
            this.setMultipleMessages([
              "* You let him down easy."
            ], () => {
              this.battleState = 'SELECT_BUTTON';
              this.setBattleText("* (Why is he in pajama pants?)");
            });
          });
        });
      } else if (item.name === 'Dress') {
        this.jaydonPortrait = 'blush';
        this.setMultipleMessages([
          "* You inspect the package...",
          "* It's a new pretty Dress! Mallika's style increased by 100!"
        ], () => {
          this.jaydonTurnReaction("You're going to look absolutely stunning in it.");
        });
      }
    }
  }

  // --- MERCY SUBMENU ---
  handleMercySubmenu(input) {
    if (input.wasPressed('KeyX') || input.wasPressed('ShiftLeft')) {
      this.battleState = 'SELECT_BUTTON';
      if (window.audioManager) window.audioManager.playMenuCancel();
      return;
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();

      // SPARE (Only yellow and eligible after giving Jaydon a Hug)
      if (this.jaydonSparedEligible) {
        this.jaydonPortrait = 'laugh';
        this.setMultipleMessages([
          "* You chose to SPARE Jaydon.",
          "* YOU WON! You earned 0 EXP and lots of LOVE.",
          "* But you gained something more precious."
        ], () => {
          this.triggerVictoryFinale();
        });
      } else {
        this.setMultipleMessages([
          "* Jaydon isn't ready to be spared yet.",
          "* Try giving him a hug first!"
        ]);
      }
    }
  }

  // --- JAYDON'S REACTION TURN ---
  jaydonTurnReaction(text, onDone = null) {
    this.battleState = 'JAYDON_TALK';
    const pages = this.paginate(`* Jaydon: "${text}"`, 22);
    const showPage = (i) => {
      const last = i === pages.length - 1;
      this.setBattleText(pages[i], last ? onDone : () => showPage(i + 1), 22);
    };
    showPage(0);
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
    const S = window.spriteManager;

    // Pitch Black Void Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.textAlign = 'left';

    // 1. Jaydon's battle sprite (centered top). Gentle bob on the 2x pixel grid.
    if (S && S.jaydonBattle) {
      const fx = this.hitFx;
      const tookHit = fx && fx.dmg > 0 && fx.t < 1400;
      const sprite = tookHit ? S.jaydonBattleHit : S.jaydonBattle;
      let shake = 0;
      if (fx && fx.t > 200 && fx.t < 750) shake = Math.round(Math.sin(fx.t * 0.09) * 4 * (1 - (fx.t - 200) / 550)) * 2;
      const bob = Math.round(Math.sin(Date.now() * 0.003) * 1.5) * 2;
      const jx = canvasWidth / 2 - sprite.width / 2 + shake;
      const jy = 28 + (tookHit ? 0 : bob);
      ctx.drawImage(sprite, jx, jy);

      // Slash animation
      if (this.battleState === 'FIGHT_SLASH') {
        const k = Math.min(1, this.slashTimer / 220);
        ctx.strokeStyle = '#ff2b2b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(jx + 30, jy + 30);
        ctx.lineTo(jx + 30 + 84 * k, jy + 30 + 84 * k);
        ctx.stroke();
      }

      // Damage number / MISS
      if (fx && fx.t > 220 && fx.t < 1300) {
        const rise = Math.min(1, (fx.t - 220) / 250);
        const ny = jy + 10 - Math.round(rise * 14);
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        const label = fx.dmg > 0 ? String(fx.dmg) : 'MISS';
        ctx.fillText(label, canvasWidth / 2 + 2, ny + 2);
        ctx.fillStyle = fx.dmg > 0 ? '#ff2020' : '#c0c0c0';
        ctx.fillText(label, canvasWidth / 2, ny);
        ctx.textAlign = 'left';
      }
    }

    // 2. Main central box (action / message / fight box)
    const boxX = 32;
    const boxY = 224;
    const boxW = 576;
    const boxH = 140;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX + 5, boxY + 5, boxW - 10, boxH - 10);

    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';

    if (this.battleState === 'FIGHT_METER' || this.battleState === 'FIGHT_SLASH') {
      // Undertale-style eye-shaped target
      const cx = boxX + boxW / 2;
      const cy = boxY + boxH / 2;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, boxW / 2 - 30, boxH / 2 - 22, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#5a5a5a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, boxW / 2 - 110, boxH / 2 - 36, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 70, boxH / 2 - 46, 0, 0, Math.PI * 2);
      ctx.stroke();
      // center line
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx - 2, boxY + 14, 4, boxH - 28);
      // moving bar (flashes once the attack is locked in)
      const bx = Math.round(this.fightMeterX);
      const flash = this.battleState === 'FIGHT_SLASH' && Math.floor(this.slashTimer / 60) % 2 === 0;
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx - 2, boxY + 10, 16, boxH - 20);
      ctx.fillStyle = flash ? '#ffff00' : '#ffffff';
      ctx.fillRect(bx, boxY + 12, 12, boxH - 24);
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx + 4, boxY + 16, 4, boxH - 32);

    } else if (this.battleState === 'SUBMENU_ACT') {
      const acts = ['* Check', '* Flirt', '* Smoke', '* Hug'];
      ctx.fillStyle = '#ffffff';
      acts.forEach((act, idx) => {
        const ax = boxX + 70 + (idx % 2) * 260;
        const ay = boxY + 34 + Math.floor(idx / 2) * 46;
        if (this.actIndex === idx) {
          ctx.drawImage(S.ui.soul, ax - 34, ay, 16, 16);
        }
        ctx.fillText(act, ax, ay);
      });

    } else if (this.battleState === 'SUBMENU_ITEM') {
      this.items.forEach((item, idx) => {
        const ix = boxX + 70;
        const iy = boxY + 34 + idx * 46;
        ctx.fillStyle = '#ffffff';
        if (this.itemIndex === idx) {
          ctx.drawImage(S.ui.soul, ix - 34, iy, 16, 16);
        }
        ctx.fillText(`* ${item.name}`, ix, iy);
      });

    } else if (this.battleState === 'SUBMENU_MERCY') {
      // Spare turns yellow only once Jaydon has been hugged
      ctx.fillStyle = this.jaydonSparedEligible ? '#ffff00' : '#ffffff';
      ctx.drawImage(S.ui.soul, boxX + 36, boxY + 34, 16, 16);
      ctx.fillText("* Spare", boxX + 70, boxY + 34);

    } else {
      // Typewriter battle flavour text
      ctx.fillStyle = '#ffffff';
      let textStartX = boxX + 28;
      const textStartY = boxY + 26;

      // Portrait while Jaydon talks (exact 2x: 80 x 80)
      if (this.battleState === 'JAYDON_TALK' && S.portraits[this.jaydonPortrait]) {
        ctx.drawImage(S.portraits[this.jaydonPortrait], boxX + 18, boxY + 30, 80, 80);
        textStartX += 88;
      }

      const visible = this.currentText.substring(0, this.textCharIndex);
      visible.split('\n').forEach((l, idx) => {
        ctx.fillText(l, textStartX, textStartY + idx * 26);
      });
    }

    // 3. Status rows: MALLIKA HP 20/20 | JAYDON HP 20/20 (clean, aligned, no LV)
    ctx.font = '13px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';
    const hpBarW = 90;
    const hpBarH = 14;
    const row = (label, labelColor, hp, max, fill, y) => {
      ctx.fillStyle = labelColor;
      ctx.fillText(label, 40, y);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('HP', 178, y);
      ctx.fillStyle = '#c72228';
      ctx.fillRect(214, y - hpBarH / 2, hpBarW, hpBarH);
      ctx.fillStyle = fill;
      ctx.fillRect(214, y - hpBarH / 2, Math.round((hp / max) * hpBarW), hpBarH);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${hp} / ${max}`, 320, y);
    };
    row('MALLIKA', '#ffffff', this.mallikaHp, this.mallikaMaxHp, '#ffff00', 384);
    row('JAYDON', this.jaydonSparedEligible ? '#ffff00' : '#ffffff', this.jaydonHp, this.jaydonMaxHp, '#00ff66', 406);

    // 4. Four main Undertale action buttons
    const icons = this.getButtonIcons();
    const btnW = 132;
    const btnH = 44;
    const btnY = 426;
    const gap = 16;
    const startX = 32;
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 4; i++) {
      const bx = startX + i * (btnW + gap);
      const isSelected = (this.battleState === 'SELECT_BUTTON' && this.selectedButton === i);
      const color = isSelected ? '#ffff00' : '#ff7f27';

      ctx.fillStyle = color;
      ctx.fillRect(bx, btnY, btnW, btnH);
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx + 3, btnY + 3, btnW - 6, btnH - 6);

      // The SOUL replaces the icon on the highlighted button
      if (isSelected) {
        ctx.drawImage(S.ui.soul, bx + 12, btnY + 14, 16, 16);
      } else if (icons[i]) {
        ctx.drawImage(icons[i], bx + 12, btnY + 14, 16, 16);
      }
      ctx.fillStyle = color;
      ctx.fillText(this.buttonNames[i], bx + 36, btnY + btnH / 2 + 1);
    }
    ctx.textBaseline = 'top';
  }

  // Tiny 8x8 Undertale-style button icons (sword, speech, bag, X), drawn at 2x
  getButtonIcons() {
    if (this.buttonIcons) return this.buttonIcons;
    const S = window.spriteManager;
    const pats = [
      ['......OO', '.....OOO', '....OOO.', '.O.OOO..', '..OOO...', '..OO....', '.O..O...', 'O.......'],
      ['.OOOOOO.', 'O......O', 'O.O.O..O', 'O......O', '.OOOOOO.', '..O.....', '.O......', '........'],
      ['..OOOO..', '.O....O.', 'OOOOOOOO', 'O......O', 'O..OO..O', 'O......O', 'OOOOOOOO', '........'],
      ['O......O', '.O....O.', '..O..O..', '...OO...', '...OO...', '..O..O..', '.O....O.', 'O......O']
    ];
    this.buttonIcons = pats.map((p) => S.scaleCanvas(S.fromPattern(p, { O: '#ff7f27' }), 2));
    return this.buttonIcons;
  }
}

window.battleManager = new BattleManager();
