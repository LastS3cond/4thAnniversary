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

      if (!this.keysDown[e.code]) {
        this.keysPressed[e.code] = true;
      }
      this.keysDown[e.code] = true;
    });

    const triggerAudio = () => {
      if (window.audioManager) {
        window.audioManager.ensureAudio();
      }
    };
    window.addEventListener('pointerdown', triggerAudio, { passive: true });
    window.addEventListener('click', triggerAudio, { passive: true });
    window.addEventListener('touchstart', triggerAudio, { passive: true });

    window.addEventListener('keyup', (e) => {
      this.keysDown[e.code] = false;
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

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.input = new InputManager();

    // Game States: 'OVERWORLD', 'DIALOGUE', 'ENCOUNTER_FLASH', 'BATTLE', 'FINALE'
    this.state = 'OVERWORLD';

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

    // Jaydon stepping into hallway
    this.isJaydonInHallway = false;

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

    // Start exterior snow BGM
    window.audioManager.playBgm('snowy');

    // Start game loop
    requestAnimationFrame((t) => this.loop(t));
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
            "* ITEM:\n* Sticky Toffee Pudding\n* pretty dress",
            "* Sticky Toffee Pudding:\n* Warm & baked with love.",
            "* pretty dress:\n* A lovely dress waiting to\n  be worn on a date!"
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

        // Standard Dialogue Text
        if (item.text) {
          window.dialogueManager.start(item.text, item.onComplete || null);
          return;
        }
      }
    }
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

        // Jaydon steps out into hallway!
        this.isJaydonInHallway = true;

        window.dialogueManager.start([
          "* The door opens with a gentle click.",
          "* Jaydon steps into the hallway wearing glasses, a long-sleeve shirt, and red plaid pajama pants."
        ], () => {
          // Launch the Undertale encounter flash!
          this.triggerBattleEncounter();
        });
      }
    });
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

    if (this.state === 'BATTLE') {
      window.battleManager.draw(this.ctx, this.canvas.width, this.canvas.height);
      return;
    }

    if (this.state === 'FINALE') {
      window.finaleManager.draw(this.ctx, this.canvas.width, this.canvas.height);
      return;
    }

    // 1. Draw Current Room Environment
    const room = window.mapManager.getCurrentRoom();
    if (room && room.draw) {
      room.draw(this.ctx);
    }

    // 2. Draw Player Sprite (Mallika)
    this.drawPlayer();

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

    items.forEach((item, idx) => {
      const iy = menuY + 25 + idx * 38;
      if (this.menuIndex === idx) {
        this.ctx.drawImage(window.spriteManager.ui.soul, menuX + 16, iy - 1, 14, 14);
      }
      this.ctx.fillText(item, menuX + 42, iy);
    });
  }

  drawPlayer() {
    const dirSprites = window.spriteManager.mallika[this.player.dir];
    if (!dirSprites) return;

    const sprite = dirSprites[this.player.walkFrame] || dirSprites[0];
    this.ctx.drawImage(sprite, this.player.x, this.player.y);
  }
}

window.Game = Game;

// Instantiate and start on window load
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
  window.game.init();
});
