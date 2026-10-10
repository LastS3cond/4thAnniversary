/**
 * Undertale 4th Anniversary - Main Game Loop, Input Engine & State Controller
 */

class InputManager {
  constructor() {
    this.keysDown = {};
    this.keysPressed = {};

    window.addEventListener('keydown', (e) => {
      // Initialize/resume AudioContext on first user interaction
      if (window.audioManager) {
        window.audioManager.ensureAudio();
      }

      // Prevent default page scroll for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      const code = InputManager.ALIASES[e.code] || e.code;
      if (!this.keysDown[code]) {
        this.keysPressed[code] = true;
      }
      this.keysDown[code] = true;
    });

    const triggerAudio = () => {
      if (window.audioManager) {
        window.audioManager.ensureAudio();
      }
      if (window.game && window.game.state === 'TITLE') {
        window.game.startGameFromTitle();
      }
    };
    window.addEventListener('pointerdown', triggerAudio, { passive: true });
    window.addEventListener('click', triggerAudio, { passive: true });
    window.addEventListener('touchstart', triggerAudio, { passive: true });

    window.addEventListener('keyup', (e) => {
      const code = InputManager.ALIASES[e.code] || e.code;
      this.keysDown[code] = false;
    });
  }

  update() {
    this.keysPressed = {};
  }

  isDown(code) {
    return !!this.keysDown[code];
  }

  wasPressed(code) {
    return !!this.keysPressed[code];
  }
}

// Right-hand modifiers / keypad enter behave exactly like their left-hand counterparts
InputManager.ALIASES = {
  ShiftRight: 'ShiftLeft',
  ControlRight: 'ControlLeft',
  NumpadEnter: 'Enter'
};

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.input = new InputManager();

    // Game States: 'TITLE', 'OVERWORLD', 'CUTSCENE', 'ENCOUNTER_FLASH', 'BATTLE', 'FINALE'
    this.state = 'TITLE';

    // Player (Mallika)
    this.player = {
      x: 300,
      y: 380,
      w: 40,
      h: 60,
      speed: 140, // pixels per second
      dir: 'up',  // 'down', 'up', 'left', 'right'
      isMoving: false,
      walkFrame: 0,
      animTimer: 0
    };

    // Encounter Transition State
    this.flashCount = 0;
    this.flashTimer = 0;
    this.flashVisible = false;

    // Room transition state
    this.isTransitioning = false;
    this.transitionAlpha = 0;
    this.targetRoom = null;
    this.targetSpawn = null;

    // Jaydon stepping into hallway (short scripted cutscene before the battle)
    this.isJaydonInHallway = false;
    this.jaydon = null;
    this.cutscene = null;

    // Overworld C-Menu
    this.isMenuOpen = false;
    this.menuIndex = 0;

    // Doorway transition protection cooldown & state flags
    this.doorCooldown = 0;
    this.hasPunchedBag = false;

    this.lastTime = performance.now();
  }

  init() {
    // Generate all procedural sprites
    window.spriteManager.init();

    // Spawn player in exterior room
    const currentRoom = window.mapManager.getCurrentRoom();
    this.player.x = currentRoom.spawn.x;
    this.player.y = currentRoom.spawn.y;
    this.player.dir = currentRoom.spawn.dir;

    // Start game loop (audio begins on first interaction / PLAY? press)
    requestAnimationFrame((t) => this.loop(t));
  }

  startGameFromTitle() {
    if (this.state !== 'TITLE') return;
    if (window.audioManager) {
      window.audioManager.ensureAudio();
      window.audioManager.playMenuSelect();
      window.audioManager.playBgm('snowy');
    }
    this.state = 'OVERWORLD';
  }

  loop(currentTime) {
    const dt = Math.min(100, currentTime - this.lastTime);
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    this.input.update();
    requestAnimationFrame((t) => this.loop(t));
  }

  // ==========================================
  // UPDATE LOGIC
  // ==========================================
  update(dt) {
    // 0. Title Screen
    if (this.state === 'TITLE') {
      if (
        this.input.wasPressed('KeyZ') ||
        this.input.wasPressed('Enter') ||
        this.input.wasPressed('Space')
      ) {
        this.startGameFromTitle();
      }
      return;
    }

    // 1. Encounter 3-flash transition sequence
    if (this.state === 'ENCOUNTER_FLASH') {
      this.flashTimer += dt;
      if (this.flashTimer >= 100) {
        this.flashTimer = 0;
        this.flashVisible = !this.flashVisible;
        this.flashCount++;
        if (this.flashCount >= 6) { // 3 flashes (on/off x 3)
          this.state = 'BATTLE';
          window.battleManager.startBattle();
        }
      }
      return;
    }

    // 1b. Jaydon steps out of his room while Mallika steps aside
    if (this.state === 'CUTSCENE') {
      this.updateCutscene(dt);
      return;
    }

    // 2. Battle State
    if (this.state === 'BATTLE') {
      window.battleManager.update(dt, this.input);
      return;
    }

    // 3. Finale State
    if (this.state === 'FINALE') {
      window.finaleManager.update(dt, this.input);
      return;
    }

    // 4. Room Fade Transition
    if (this.isTransitioning) {
      this.transitionAlpha += dt * 0.003;
      if (this.transitionAlpha >= 1) {
        // Switch room
        window.mapManager.currentRoom = this.targetRoom;
        const newRoom = window.mapManager.getCurrentRoom();
        this.player.x = this.targetSpawn.x;
        this.player.y = this.targetSpawn.y;
        this.player.dir = this.targetSpawn.dir;

        // Switch BGM if needed
        if (newRoom.bgm) {
          window.audioManager.playBgm(newRoom.bgm);
        }

        this.isTransitioning = false;
        this.doorCooldown = 800; // Protection window upon entering any room!
        this.targetRoom = null;
      }
      return;
    } else if (this.transitionAlpha > 0) {
      this.transitionAlpha = Math.max(0, this.transitionAlpha - dt * 0.003);
    }

    // Decrement door cooldown timer
    if (this.doorCooldown > 0) {
      this.doorCooldown -= dt;
    }

    // 5. Dialogue Box Active
    if (window.dialogueManager.isActive) {
      window.dialogueManager.update(dt, this.input);
      return;
    }

    // Overworld C-Menu toggle & navigation
    if (this.input.wasPressed('KeyC') || this.input.wasPressed('ControlLeft')) {
      this.isMenuOpen = !this.isMenuOpen;
      this.menuIndex = 0;
      if (window.audioManager) window.audioManager.playMenuSelect();
      return;
    }

    if (this.isMenuOpen) {
      if (this.input.wasPressed('ArrowUp') || this.input.wasPressed('KeyW')) {
        this.menuIndex = (this.menuIndex + 2) % 3;
        if (window.audioManager) window.audioManager.playMenuMove();
      }
      if (this.input.wasPressed('ArrowDown') || this.input.wasPressed('KeyS')) {
        this.menuIndex = (this.menuIndex + 1) % 3;
        if (window.audioManager) window.audioManager.playMenuMove();
      }
      if (this.input.wasPressed('KeyX') || this.input.wasPressed('ShiftLeft')) {
        this.isMenuOpen = false;
        if (window.audioManager) window.audioManager.playMenuCancel();
        return;
      }
      if (this.input.wasPressed('KeyZ') || this.input.wasPressed('Enter')) {
        if (window.audioManager) window.audioManager.playMenuSelect();
        this.isMenuOpen = false;
        if (this.menuIndex === 0) {
          // ITEM
          window.dialogueManager.start([
            "* ITEM:\n* Sticky Toffee Pudding\n* Pretty Dress",
            "* Sticky Toffee Pudding:\n* Warm & baked with love.",
            "* Pretty Dress:\n* A lovely Dress waiting to\n  be worn on a date!"
          ]);
        } else if (this.menuIndex === 1) {
          // STAT
          const atkDesc = this.hasPunchedBag ? "* ATK 11 (Bag bonus +1)" : "* ATK 10";
          window.dialogueManager.start([
            "* MALLIKA   LV 1",
            `* HP 20 / 20\n${atkDesc}\n* DEF 10`,
            "* WEAPON: Strong core muscles\n* ARMOR: Denim overalls",
            "* LOVE: lots"
          ]);
        } else if (this.menuIndex === 2) {
          // CELL
          window.dialogueManager.start([
            "* You dialed Jaydon's cell...\n* (ring... ring...)",
            "* A muffled ringtone plays\n  from his bedroom upstairs!"
          ]);
        }
        return;
      }
      return;
    }

    // 6. Overworld Player Movement & Collisions
    this.updatePlayerMovement(dt);

    // 7. Check for Interactions on Z / Enter
    if (this.input.wasPressed('KeyZ') || this.input.wasPressed('Enter')) {
      this.checkPlayerInteractions();
    }
  }

  updatePlayerMovement(dt) {
    let dx = 0;
    let dy = 0;

    if (this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) {
      dx -= 1;
      this.player.dir = 'left';
    }
    if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) {
      dx += 1;
      this.player.dir = 'right';
    }
    if (this.input.isDown('ArrowUp') || this.input.isDown('KeyW')) {
      dy -= 1;
      this.player.dir = 'up';
    }
    if (this.input.isDown('ArrowDown') || this.input.isDown('KeyS')) {
      dy += 1;
      this.player.dir = 'down';
    }

    // Normalize diagonal velocity
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    this.player.isMoving = (dx !== 0 || dy !== 0);

    if (this.player.isMoving) {
      // Running speed boost if holding X or Shift
      const speed = (this.input.isDown('KeyX') || this.input.isDown('ShiftLeft')) ? this.player.speed * 1.5 : this.player.speed;
      const moveX = dx * speed * (dt / 1000);
      const moveY = dy * speed * (dt / 1000);

      // Axis-by-axis collision check for smooth sliding along walls
      if (!this.checkCollision(this.player.x + moveX, this.player.y)) {
        this.player.x += moveX;
      }
      if (!this.checkCollision(this.player.x, this.player.y + moveY)) {
        this.player.y += moveY;
      }

      // Walk cycle animation
      this.player.animTimer += dt;
      if (this.player.animTimer >= 180) {
        this.player.animTimer = 0;
        this.player.walkFrame = (this.player.walkFrame === 1) ? 2 : 1;
      }

      // Check automatic door transitions when moving
      this.checkDoorTriggers();
    } else {
      this.player.walkFrame = 0; // Idle stand frame
    }
  }

  // Automatic Door & Stairway Trigger Zone Check
  checkDoorTriggers() {
    if (this.doorCooldown > 0 || this.isTransitioning || window.dialogueManager.isActive) return;
    const feetBox = {
      x: this.player.x + 8,
      y: this.player.y + 42,
      w: 24,
      h: 16
    };
    const room = window.mapManager.getCurrentRoom();
    if (!room || !room.interactables) return;
    for (let item of room.interactables) {
      if (item.isDoor && item.onEnter) {
        if (
          feetBox.x < item.x + item.w &&
          feetBox.x + feetBox.w > item.x &&
          feetBox.y < item.y + item.h &&
          feetBox.y + feetBox.h > item.y
        ) {
          item.onEnter();
          return;
        }
      }
    }
  }

  // Player collision box check (centered at feet)
  checkCollision(newX, newY) {
    const feetBox = {
      x: newX + 8,
      y: newY + 42,
      w: 24,
      h: 16
    };

    const room = window.mapManager.getCurrentRoom();
    for (let c of room.colliders) {
      if (
        feetBox.x < c.x + c.w &&
        feetBox.x + feetBox.w > c.x &&
        feetBox.y < c.y + c.h &&
        feetBox.y + feetBox.h > c.y
      ) {
        return true;
      }
    }
    return false;
  }

  // Check interactables in front of Mallika
  checkPlayerInteractions() {
    // Project interaction probe box in front of player
    let probeX = this.player.x + 8;
    let probeY = this.player.y + 35;
    let probeW = 24;
    let probeH = 25;

    if (this.player.dir === 'up') probeY -= 25;
    else if (this.player.dir === 'down') probeY += 25;
    else if (this.player.dir === 'left') probeX -= 25;
    else if (this.player.dir === 'right') probeX += 25;

    const room = window.mapManager.getCurrentRoom();
    for (let item of room.interactables) {
      if (
        probeX < item.x + item.w &&
        probeX + probeW > item.x &&
        probeY < item.y + item.h &&
        probeY + probeH > item.y
      ) {
        // Special Boss Encounter Door Check
        if (item.triggerBoss) {
          this.triggerJaydonDoorInteraction();
          return;
        }

        // Punching Bag Interaction (Choice to punch)
        if (item.triggerPunchingBag) {
          this.triggerPunchingBagInteraction();
          return;
        }

        // Dirty Dishes Sink Interaction (Choice to clean)
        if (item.triggerSink) {
          this.triggerSinkInteraction();
          return;
        }

        // Generic [ YES / NO ] prompt defined on the interactable
        if (item.choice) {
          window.dialogueManager.startChoice(item.choice.prompt, (choice) => {
            window.dialogueManager.start(choice === 'YES' ? item.choice.yes : item.choice.no);
          });
          return;
        }

        // Doors / stairs can also be used by facing them and pressing Z
        if (item.isDoor && item.onEnter && !item.text) {
          if (this.doorCooldown <= 0 && !this.isTransitioning) item.onEnter();
          return;
        }

        // Standard Dialogue Text
        if (item.text) {
          window.dialogueManager.start(item.text, item.onComplete || null);
          return;
        }
      }
    }
  }

  // Kitchen Sink Dirty Dishes Interaction Sequence
  triggerSinkInteraction() {
    window.dialogueManager.startChoice(
      "* There are dirty dishes piled in the sink.\n* Clean them?",
      (choice) => {
        if (choice === 'YES') {
          window.dialogueManager.start(["* There are too many."]);
        } else {
          window.dialogueManager.start(["* You decide to leave them for later."]);
        }
      }
    );
  }

  // Punching Bag Interaction Sequence
  triggerPunchingBagInteraction() {
    const promptText = this.hasPunchedBag
      ? "* A heavy punching bag on a metal stand, weighed down with sandbags.\n* Punch it again?"
      : "* A heavy punching bag on its own contraption, weighed down with sandbags.\n* Give it a punch?";

    window.dialogueManager.startChoice(promptText, (choice) => {
      if (choice === 'YES') {
        if (window.audioManager) {
          window.audioManager.playHit();
        }
        if (!this.hasPunchedBag) {
          this.hasPunchedBag = true;
          window.dialogueManager.start([
            "* WHAM!",
            "* You give the punching bag a solid punch!\n* Attack power +1."
          ]);
        } else {
          window.dialogueManager.start([
            "* WHAM! A satisfying hit.",
            "* Your knuckles are warm and ready."
          ]);
        }
      } else {
        window.dialogueManager.start([
          "* You leave the punching bag hanging peacefully."
        ]);
      }
    });
  }

  // Jaydon's Door Encounter Sequence
  triggerJaydonDoorInteraction() {
    window.dialogueManager.startChoice("* Knock on Jaydon's door?", (choice) => {
      if (choice === 'NO') {
        window.dialogueManager.start(["* You decide to wait a moment."]);
      } else if (choice === 'YES') {
        // Open door sound
        if (window.audioManager) {
          window.audioManager.playDoor();
        }

        // Jaydon steps out into the hallway, to the SIDE of Mallika (never behind her)
        this.startJaydonEntrance();
      }
    });
  }

  startJaydonEntrance() {
    const p = this.player;
    this.isJaydonInHallway = true;
    // Mallika keeps the left half of the 80px corridor; Jaydon takes the right half.
    const mallikaX = Math.min(p.x, 276);
    const jaydonX = Math.max(316, Math.min(322, mallikaX + 44));
    this.jaydon = { x: 352, y: p.y - 2, dir: 'left' };
    this.cutscene = {
      t: 0,
      duration: 520,
      fromX: p.x,
      toX: mallikaX,
      jFromX: 352,
      jToX: jaydonX
    };
    p.dir = 'right';
    this.state = 'CUTSCENE';
  }

  updateCutscene(dt) {
    const c = this.cutscene;
    const p = this.player;
    c.t = Math.min(c.duration, c.t + dt);
    const k = c.t / c.duration;
    const ease = k * (2 - k);
    p.x = c.fromX + (c.toX - c.fromX) * ease;
    this.jaydon.x = c.jFromX + (c.jToX - c.jFromX) * ease;

    // Little walk cycle while Mallika steps aside
    if (Math.abs(c.toX - c.fromX) > 1 && k < 1) {
      p.animTimer += dt;
      if (p.animTimer >= 140) {
        p.animTimer = 0;
        p.walkFrame = (p.walkFrame === 1) ? 2 : 1;
      }
    } else {
      p.walkFrame = 0;
    }

    if (k >= 1) {
      p.walkFrame = 0;
      this.cutscene = null;
      this.state = 'OVERWORLD';
      window.dialogueManager.start([
        "* The door opens with a gentle click.",
        "* Jaydon steps into the hallway wearing glasses, a long-sleeve shirt, and red plaid pajama pants."
      ], () => {
        // Launch the Undertale encounter flash!
        this.triggerBattleEncounter();
      });
    }
  }

  triggerBattleEncounter() {
    this.state = 'ENCOUNTER_FLASH';
    this.flashCount = 0;
    this.flashTimer = 0;
    this.flashVisible = true;

    // Play iconic 3-staccato buzz encounter SFX!
    if (window.audioManager) {
      window.audioManager.stopBgm();
      window.audioManager.playEncounter();
    }
  }

  transitionToRoom(roomName, spawnX, spawnY, dir) {
    this.isTransitioning = true;
    this.transitionAlpha = 0;
    this.targetRoom = roomName;
    this.targetSpawn = { x: spawnX, y: spawnY, dir: dir };
  }

  startFinale() {
    this.state = 'FINALE';
    window.finaleManager.startFinale();
  }

  // ==========================================
  // DRAW & RENDER PIPELINE
  // ==========================================
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.state === 'TITLE') {
      this.drawTitleScreen();
      return;
    }

    if (this.state === 'BATTLE') {
      window.battleManager.draw(this.ctx, this.canvas.width, this.canvas.height);
      return;
    }

    if (this.state === 'FINALE') {
      window.finaleManager.draw(this.ctx, this.canvas.width, this.canvas.height);
      return;
    }

    // 1 + 2. Room environment with Mallika (and Jaydon) depth-sorted among the props
    window.mapManager.drawRoom(this.ctx, this.collectActors());

    // 3. Draw Overworld C-Menu (if open)
    if (this.isMenuOpen) {
      this.drawOverworldMenu();
    }

    // 4. Draw Dialogue Box (if active)
    if (window.dialogueManager.isActive) {
      window.dialogueManager.draw(this.ctx, this.canvas.width, this.canvas.height);
    }

    // 5. Encounter Flash Effect (Flashing black/white)
    if (this.state === 'ENCOUNTER_FLASH') {
      this.ctx.fillStyle = this.flashVisible ? '#ffffff' : '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 6. Room Transition Fade
    if (this.transitionAlpha > 0) {
      this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // 7. Audio Autoplay suspended hint
    if (window.audioManager && window.audioManager.ctx && window.audioManager.ctx.state === 'suspended') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(110, 8, 420, 26);
      this.ctx.strokeStyle = '#ffff55';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(110, 8, 420, 26);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '8px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('[ Click anywhere or press any key for audio ♫ ]', 320, 24);
      this.ctx.textAlign = 'left';
    }
  }

  drawTitleScreen() {
    // Pitch Black Void Background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Title: UNDERTALE
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '28px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("UNDERTALE", this.canvas.width / 2, 160);

    // Subtitle: 4th Anniversary
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText("-- 4th Anniversary --", this.canvas.width / 2, 205);

    // Prompt Box: [ ♥ PLAY? ]
    const boxW = 200;
    const boxH = 46;
    const boxX = (this.canvas.width - boxW) / 2;
    const boxY = 270;

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Pulsing Red Soul Cursor
    const pulse = Math.sin(Date.now() * 0.005) * 2;
    if (window.spriteManager && window.spriteManager.ui.soul) {
      this.ctx.drawImage(window.spriteManager.ui.soul, boxX + 24, boxY + 14 + pulse, 18, 18);
    }

    this.ctx.fillStyle = '#ffff55';
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText("PLAY?", boxX + 58, boxY + 30);

    // Click / Key hint
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '10px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("Press [Z] or Click to Start", this.canvas.width / 2, 360);

    // Reset textAlign for rest of game
    this.ctx.textAlign = 'left';
  }

  drawOverworldMenu() {
    const menuX = 40;
    const menuY = 60;
    const menuW = 150;
    const menuH = 140;

    // Classic Undertale White Border, Black Fill
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(menuX, menuY, menuW, menuH);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(menuX + 4, menuY + 4, menuW - 8, menuH - 8);

    const items = ['ITEM', 'STAT', 'CELL'];
    this.ctx.font = '14px "Press Start 2P", monospace';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'left';

    items.forEach((item, idx) => {
      const iy = menuY + 25 + idx * 38;
      if (this.menuIndex === idx) {
        this.ctx.drawImage(window.spriteManager.ui.soul, menuX + 16, iy - 1, 14, 14);
      }
      this.ctx.fillText(item, menuX + 42, iy);
    });
  }

  // Characters handed to the map renderer, sorted by where their feet touch the floor
  collectActors() {
    const actors = [];
    const dirSprites = window.spriteManager.mallika[this.player.dir];
    if (dirSprites) {
      const sprite = dirSprites[this.player.walkFrame] || dirSprites[0];
      actors.push({ img: sprite, x: this.player.x, y: this.player.y, baseY: this.player.y + 58 });
    }
    if (this.isJaydonInHallway && this.jaydon && window.mapManager.currentRoom === 'second_floor') {
      const j = window.spriteManager.jaydonOW;
      const img = j[this.jaydon.dir] || j.down;
      actors.push({ img, x: this.jaydon.x, y: this.jaydon.y, baseY: this.jaydon.y + 60 });
    }
    return actors;
  }
}

window.Game = Game;

// Instantiate and start on window load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  window.game.init();
});
