/**
 * Undertale 4th Anniversary - Keyboard / pointer input
 *
 * keysDown: held right now. keysPressed: went down since the last frame (cleared by update()).
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
