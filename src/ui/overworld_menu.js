/**
 * Undertale 4th Anniversary - Overworld C-menu
 *
 * C / Ctrl toggles it, Up / Down moves, Z / Enter opens an entry's dialogue, X / Shift closes.
 * The entries come from the story (src/story.js): { label, pages(game) }. The box fits three.
 */
class OverworldMenu {
  constructor(game, entries) {
    this.game = game;
    this.isOpen = false;
    this.index = 0;
    this.entries = entries;
  }

  // Handles the toggle key and, while open, menu input. Returns true when the menu used this
  // frame (so the overworld should not move the player or check interactions).
  update(input) {
    if (input.wasPressed('KeyC') || input.wasPressed('ControlLeft')) {
      this.isOpen = !this.isOpen;
      this.index = 0;
      if (window.audioManager) window.audioManager.playMenuSelect();
      return true;
    }
    if (!this.isOpen) return false;

    const count = this.entries.length;
    if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW')) {
      this.index = (this.index + count - 1) % count;
      if (window.audioManager) window.audioManager.playMenuMove();
    }
    if (input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
      this.index = (this.index + 1) % count;
      if (window.audioManager) window.audioManager.playMenuMove();
    }
    if (input.wasPressed('KeyX') || input.wasPressed('ShiftLeft')) {
      this.isOpen = false;
      if (window.audioManager) window.audioManager.playMenuCancel();
      return true;
    }
    if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
      if (window.audioManager) window.audioManager.playMenuSelect();
      this.isOpen = false;
      window.dialogueManager.start(this.entries[this.index].pages(this.game));
    }
    return true;
  }

  draw(ctx) {
    const menuX = 40;
    const menuY = 60;
    const menuW = 150;
    const menuH = 140;

    // Classic Undertale White Border, Black Fill
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(menuX, menuY, menuW, menuH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(menuX + 4, menuY + 4, menuW - 8, menuH - 8);

    ctx.font = '14px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    this.entries.forEach((entry, idx) => {
      const iy = menuY + 25 + idx * 38;
      if (this.index === idx) {
        ctx.drawImage(window.spriteManager.ui.soul, menuX + 16, iy - 1, 14, 14);
      }
      ctx.fillText(entry.label, menuX + 42, iy);
    });
  }
}
