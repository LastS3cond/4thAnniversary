/**
 * Undertale 4th Anniversary - Battle engine
 *
 * The Undertale battle screen: FIGHT / ACT / ITEM / MERCY buttons, the typewriter text box,
 * the fight meter, damage numbers and the HP rows. Who you fight and what every action does
 * comes from an encounter (src/encounters/*.js), registered with Encounters.define(name, {...})
 * and started with game.triggerBattleEncounter(name).
 *
 * An encounter definition:
 *   player:   { name, hp }                       status-row label and starting HP
 *   enemy:    { name, speaker, hp, minHp, character }
 *             status-row label, the name in '* Jaydon: "..."' lines, HP, the lowest HP that
 *             FIGHT can bring it to, and the character (src/characters/) whose `battle` poses
 *             and `portraits` are shown
 *   bgm:      music key (default 'battle')
 *   idleText: the line shown while choosing a button
 *   setup(battle)                                 reset per-fight counters in battle.vars
 *   acts:     [{ name, run(battle) }]             ACT menu, laid out in two columns
 *   items:    [{ name, use(battle) }]             ITEM menu (the box fits two)
 *   fight:    { damage(accuracy, battle), onHit(battle, damage), onMiss(battle) }
 *             accuracy is 0..1 from the meter; damage defaults to 2-6
 *   spare(battle)                                 MERCY > Spare (check battle.spareable)
 *   onVictory(game)                               runs after battle.win()
 *
 * Inside those handlers `battle` offers narrate(messages, then), reply(text, then), win(),
 * knockDown(), plus player.hp / player.maxHp, enemy.hp, portrait (the enemy's expression),
 * spareable (turns MERCY yellow) and vars (scratch space for the encounter).
 */
const Encounters = {
  list: {},

  define(name, def) {
    Encounters.list[name] = def;
  },

  get(name) {
    const def = Encounters.list[name];
    if (!def) throw new Error(`Unknown encounter "${name}"`);
    return def;
  }
};

class BattleManager {
  constructor() {
    this.isActive = false;
    this.encounter = null;

    // Combatants (set up by start())
    this.player = null;   // { name, hp, maxHp }
    this.enemy = null;    // { name, speaker, hp, maxHp, minHp, sprites, portraits, down }
    this.spareable = false;
    this.portrait = 'neutral';
    this.vars = {};

    // Main Buttons: 0: FIGHT, 1: ACT, 2: ITEM, 3: MERCY
    this.selectedButton = 0;
    this.buttonNames = ['FIGHT', 'ACT', 'ITEM', 'MERCY'];

    // State machine within battle:
    // 'SELECT_BUTTON', 'SUBMENU_ACT', 'SUBMENU_ITEM', 'SUBMENU_MERCY',
    // 'FIGHT_METER', 'FIGHT_SLASH', 'MESSAGE', 'ENEMY_TALK'
    this.battleState = 'SELECT_BUTTON';

    // Submenu cursor indices
    this.actIndex = 0;
    this.itemIndex = 0;
    this.mercyIndex = 0;

    // Fight meter animation state
    this.fightMeterX = 0;
    this.fightMeterSpeed = 350;
    this.fightMeterDirection = 1;
    this.slashTimer = 0;

    // Current battle text display
    this.currentText = '';
    this.textCharIndex = 0;
    this.textTimer = 0;
    this.textSpeed = 25;
    this.messageQueue = [];
    this.onMessageDoneCallback = null;

    // FIGHT impact feedback (shake, hit pose, damage number)
    this.hitFx = null;
    this.pendingDamage = 0;
    this.buttonIcons = null;
  }

  start(encounter) {
    const look = window.spriteManager.characters[encounter.enemy.character];
    this.encounter = encounter;
    this.isActive = true;
    this.player = { name: encounter.player.name, hp: encounter.player.hp, maxHp: encounter.player.hp };
    this.enemy = {
      name: encounter.enemy.name,
      speaker: encounter.enemy.speaker,
      hp: encounter.enemy.hp,
      maxHp: encounter.enemy.hp,
      minHp: encounter.enemy.minHp || 0,
      sprites: look.battle,
      portraits: look.portraits || {},
      down: false            // knocked flat on the floor after taking a hit
    };
    this.spareable = false;
    this.vars = {};
    if (encounter.setup) encounter.setup(this);
    this.selectedButton = 0;
    this.battleState = 'SELECT_BUTTON';
    this.portrait = 'neutral';
    this.hitFx = null;
    this.setBattleText(encounter.idleText);

    if (window.audioManager) {
      window.audioManager.playBgm(encounter.bgm || 'battle');
    }
  }

  setBattleText(text, onDone = null, maxChars = null) {
    const limit = maxChars || (this.battleState === 'ENEMY_TALK' ? 22 : 26);
    this.currentText = TextLayout.wrap(text, limit);
    this.textCharIndex = 0;
    this.textTimer = 0;
    this.onMessageDoneCallback = onDone;
  }

  // ==========================================
  // ENCOUNTER API (used by src/encounters/*.js)
  // ==========================================

  // Shows narration boxes (split into pages of at most 4 wrapped lines so text never spills
  // out of the box), then calls `then`, or returns to the buttons if there is none.
  narrate(messages, then = null) {
    this.messageQueue = [];
    messages.forEach((m) => this.messageQueue.push(...TextLayout.paginate(m, 26, 4)));
    this.battleState = 'MESSAGE';
    this.advanceMessageQueue(then);
  }

  // The enemy speaks, with their current portrait: * Jaydon: "..."
  reply(text, then = null) {
    this.battleState = 'ENEMY_TALK';
    const pages = TextLayout.paginate(`* ${this.enemy.speaker}: "${text}"`, 22, 4);
    const showPage = (i) => {
      const last = i === pages.length - 1;
      this.setBattleText(pages[i], last ? then : () => showPage(i + 1), 22);
    };
    showPage(0);
  }

  // The enemy lies flat on the floor until the player's next turn
  knockDown() {
    this.enemy.down = true;
  }

  // Ends the battle; the encounter's onVictory decides what happens next
  win() {
    this.isActive = false;
    if (this.encounter.onVictory) this.encounter.onVictory(window.game);
  }

  // Back to choosing a button
  endTurn() {
    this.battleState = 'SELECT_BUTTON';
    this.setBattleText(this.encounter.idleText);
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
        this.endTurn();
      }
    }
  }

  update(dt, input) {
    if (!this.isActive) return;

    if (this.hitFx) {
      this.hitFx.t += dt;
      if (this.hitFx.t > 1500) this.hitFx = null;
    }
    // The enemy gets back up once it's the player's turn again
    if (this.battleState === 'SELECT_BUTTON') this.enemy.down = false;

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
            this.encounter.fight.onMiss(this);
          } else {
            this.enemy.hp = Math.max(this.enemy.minHp, this.enemy.hp - dmg);
            this.encounter.fight.onHit(this, dmg);
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

      case 'ENEMY_TALK':
        if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
          if (this.textCharIndex < this.currentText.length) {
            this.textCharIndex = this.currentText.length;
          } else if (this.onMessageDoneCallback) {
            const cb = this.onMessageDoneCallback;
            this.onMessageDoneCallback = null;
            cb();
          } else {
            // Return to player's turn
            this.endTurn();
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
      // Timing-based damage, never taking the enemy below its minimum HP
      const center = 320;
      const accuracy = Math.max(0, 1 - Math.abs(this.fightMeterX + 6 - center) / 270);
      const fight = this.encounter.fight;
      const dmg = fight.damage ? fight.damage(accuracy, this) : 2 + Math.round(accuracy * 4);
      this.pendingDamage = Math.max(0, Math.min(dmg, this.enemy.hp - this.enemy.minHp));
      this.hitFx = { t: 0, dmg: this.pendingDamage };
      this.battleState = 'FIGHT_SLASH';
      this.slashTimer = 0;
    }
  }

  // --- ACT SUBMENU ---
  // Two columns, filled row by row: [0] [1] / [2] [3] / ...
  handleActSubmenu(input) {
    const count = this.encounter.acts.length;
    if (input.wasPressed('ArrowLeft') || input.wasPressed('KeyA') || input.wasPressed('ArrowRight') || input.wasPressed('KeyD')) {
      const target = this.actIndex ^ 1;
      if (target < count) {
        this.actIndex = target;
        if (window.audioManager) window.audioManager.playMenuMove();
      }
    }
    const up = input.wasPressed('ArrowUp') || input.wasPressed('KeyW');
    const down = input.wasPressed('ArrowDown') || input.wasPressed('KeyS');
    if (up || down) {
      const rows = Math.ceil(count / 2);
      const row = Math.floor(this.actIndex / 2);
      const nextRow = (row + (down ? 1 : rows - 1)) % rows;
      const target = Math.min(count - 1, nextRow * 2 + (this.actIndex % 2));
      if (rows > 1) {
        this.actIndex = target;
        if (window.audioManager) window.audioManager.playMenuMove();
      }
    }

    if (input.wasPressed('KeyX') || input.wasPressed('ShiftLeft')) {
      this.battleState = 'SELECT_BUTTON';
      if (window.audioManager) window.audioManager.playMenuCancel();
      return;
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();
      this.encounter.acts[this.actIndex].run(this);
    }
  }

  // --- ITEM SUBMENU ---
  handleItemSubmenu(input) {
    const items = this.encounter.items;
    const up = input.wasPressed('ArrowUp') || input.wasPressed('KeyW');
    const down = input.wasPressed('ArrowDown') || input.wasPressed('KeyS');
    if (up || down) {
      this.itemIndex = (this.itemIndex + (down ? 1 : items.length - 1)) % items.length;
      if (window.audioManager) window.audioManager.playMenuMove();
    }

    if (input.wasPressed('KeyX') || input.wasPressed('ShiftLeft')) {
      this.battleState = 'SELECT_BUTTON';
      if (window.audioManager) window.audioManager.playMenuCancel();
      return;
    }

    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();
      items[this.itemIndex].use(this);
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
      this.encounter.spare(this);
    }
  }

  // --- RENDER BATTLE SCREEN ---
  draw(ctx, canvasWidth, canvasHeight) {
    if (!this.isActive) return;
    const S = window.spriteManager;
    const look = this.enemy.sprites;

    // Pitch Black Void Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.textAlign = 'left';

    // 1a. Knocked down: lying on the floor of the battle area, just above the box
    if (this.enemy.down && look.fallen) {
      const fallen = look.fallen;
      ctx.drawImage(fallen, canvasWidth / 2 - fallen.width / 2, 232 - fallen.height);
    } else if (look.idle) {
      // 1b. The enemy's battle sprite (centered top). Gentle bob on the 2x pixel grid.
      const fx = this.hitFx;
      const tookHit = fx && fx.dmg > 0 && fx.t < 1400;
      const sprite = tookHit && look.hit ? look.hit : look.idle;
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
      ctx.fillStyle = '#ffffff';
      this.encounter.acts.forEach((act, idx) => {
        const ax = boxX + 70 + (idx % 2) * 260;
        const ay = boxY + 34 + Math.floor(idx / 2) * 46;
        if (this.actIndex === idx) {
          ctx.drawImage(S.ui.soul, ax - 34, ay, 16, 16);
        }
        ctx.fillText(`* ${act.name}`, ax, ay);
      });

    } else if (this.battleState === 'SUBMENU_ITEM') {
      this.encounter.items.forEach((item, idx) => {
        const ix = boxX + 70;
        const iy = boxY + 34 + idx * 46;
        ctx.fillStyle = '#ffffff';
        if (this.itemIndex === idx) {
          ctx.drawImage(S.ui.soul, ix - 34, iy, 16, 16);
        }
        ctx.fillText(`* ${item.name}`, ix, iy);
      });

    } else if (this.battleState === 'SUBMENU_MERCY') {
      // Spare turns yellow once the enemy can be spared
      ctx.fillStyle = this.spareable ? '#ffff00' : '#ffffff';
      ctx.drawImage(S.ui.soul, boxX + 36, boxY + 34, 16, 16);
      ctx.fillText("* Spare", boxX + 70, boxY + 34);

    } else {
      // Typewriter battle flavour text
      ctx.fillStyle = '#ffffff';
      let textStartX = boxX + 28;
      const textStartY = boxY + 26;

      // Portrait while the enemy talks (exact 2x: 80 x 80)
      const face = this.enemy.portraits[this.portrait];
      if (this.battleState === 'ENEMY_TALK' && face) {
        ctx.drawImage(face, boxX + 18, boxY + 30, 80, 80);
        textStartX += 88;
      }

      const visible = this.currentText.substring(0, this.textCharIndex);
      visible.split('\n').forEach((l, idx) => {
        ctx.fillText(l, textStartX, textStartY + idx * 26);
      });
    }

    // 3. Status rows: PLAYER HP 20/20 | ENEMY HP 20/20 (clean, aligned, no LV)
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
    row(this.player.name, '#ffffff', this.player.hp, this.player.maxHp, '#ffff00', 384);
    row(this.enemy.name, this.spareable ? '#ffff00' : '#ffffff', this.enemy.hp, this.enemy.maxHp, '#00ff66', 406);

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
