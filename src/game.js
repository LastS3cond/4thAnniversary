/**
 * Undertale 4th Anniversary - Main Game Loop & State Controller
 *
 * States: 'TITLE' -> 'OVERWORLD' (plus 'CUTSCENE' and 'ENCOUNTER_FLASH') -> 'BATTLE' -> 'FINALE'.
 * Rooms, their objects and what happens when Mallika inspects them live in src/world and
 * src/rooms; this file moves Mallika around and hands control between the screens.
 */

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

    // Other characters standing in rooms: { room, x, y, dir, sprites, footOffset }
    this.npcs = [];
    // Scripted sequence running in the 'CUTSCENE' state (an object with update(dt))
    this.cutscene = null;

    // Overworld C-Menu
    this.menu = new OverworldMenu(this);

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

    // 1b. Scripted cutscene (e.g. Jaydon stepping out of his room)
    if (this.state === 'CUTSCENE') {
      this.cutscene.update(dt);
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
    if (this.menu.update(this.input)) return;

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

  // Mallika's feet (screen px): the part of her that bumps into walls and steps onto doors.
  // Her head and torso can overlap furniture tops.
  feetBox(x, y) {
    return { x: x + 8, y: y + 42, w: 24, h: 16 };
  }

  // What Mallika can reach with Z: a box just in front of her feet, 25px in her facing direction
  probeBox() {
    const p = this.player;
    const box = { x: p.x + 8, y: p.y + 35, w: 24, h: 25 };
    if (p.dir === 'up') box.y -= 25;
    else if (p.dir === 'down') box.y += 25;
    else if (p.dir === 'left') box.x -= 25;
    else if (p.dir === 'right') box.x += 25;
    return box;
  }

  // Automatic Door & Stairway Trigger Zone Check
  checkDoorTriggers() {
    if (this.doorCooldown > 0 || this.isTransitioning || window.dialogueManager.isActive) return;
    const door = window.mapManager.doorAt(this.feetBox(this.player.x, this.player.y));
    if (door) door.onEnter();
  }

  // Would Mallika's feet hit a wall or solid object at (newX, newY)?
  checkCollision(newX, newY) {
    return window.mapManager.isBlocked(this.feetBox(newX, newY));
  }

  // Z / Enter: use the first object within reach
  checkPlayerInteractions() {
    const item = window.mapManager.interactableAt(this.probeBox());
    if (item) item.interact();
  }

  // Runs a scripted sequence (an object with update(dt)) until it calls endCutscene()
  playCutscene(scene) {
    this.cutscene = scene;
    this.state = 'CUTSCENE';
  }

  endCutscene() {
    this.cutscene = null;
    this.state = 'OVERWORLD';
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
      TitleScreen.draw(this.ctx, this.canvas);
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
    if (this.menu.isOpen) {
      this.menu.draw(this.ctx);
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

  // Characters handed to the map renderer, sorted by where their feet touch the floor
  collectActors() {
    const actors = [];
    const dirSprites = window.spriteManager.mallika[this.player.dir];
    if (dirSprites) {
      const sprite = dirSprites[this.player.walkFrame] || dirSprites[0];
      actors.push({ img: sprite, x: this.player.x, y: this.player.y, baseY: this.player.y + 58 });
    }
    for (const npc of this.npcs) {
      if (npc.room !== window.mapManager.currentRoom) continue;
      const img = npc.sprites[npc.dir] || npc.sprites.down;
      actors.push({ img, x: npc.x, y: npc.y, baseY: npc.y + npc.footOffset });
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
