/**
 * Undertale 4th Anniversary - Dialogue Box & Text Engine
 * Typewriter text effect, portrait display, YES/NO prompts, Undertale borders.
 */

class DialogueManager {
  constructor() {
    this.isActive = false;
    this.pages = [];
    this.currentPageIndex = 0;
    this.charIndex = 0;
    this.charTimer = 0;
    this.textSpeed = 30; // ms per char
    this.onCompleteCallback = null;
    this.currentPortrait = null;

    // Choice prompt (e.g. YES / NO)
    this.isChoiceActive = false;
    this.choiceIndex = 0; // 0 = YES, 1 = NO
    this.onChoiceCallback = null;
  }

  wrapAndPaginate(text, maxChars = 36, maxLines = 4) {
    const rawLines = text.split('\n');
    const wrappedLines = [];
    for (let line of rawLines) {
      if (line.length <= maxChars) {
        wrappedLines.push(line);
      } else {
        const words = line.split(' ');
        let cur = '';
        for (let w of words) {
          if (!cur) {
            cur = w;
          } else if ((cur + ' ' + w).length <= maxChars) {
            cur += ' ' + w;
          } else {
            wrappedLines.push(cur);
            cur = w;
          }
        }
        if (cur) wrappedLines.push(cur);
      }
    }

    // Chunk into pages of at most maxLines
    const pages = [];
    for (let i = 0; i < wrappedLines.length; i += maxLines) {
      pages.push(wrappedLines.slice(i, i + maxLines).join('\n'));
    }
    return pages.length > 0 ? pages : [''];
  }

  wrapText(text, maxChars = 36) {
    return this.wrapAndPaginate(text, maxChars, 4).join('\n');
  }

  start(pages, onComplete = null, portrait = null) {
    if (typeof pages === 'string') {
      pages = [pages];
    }
    const maxChars = portrait ? 24 : 36;
    const allPages = [];
    for (let p of pages) {
      allPages.push(...this.wrapAndPaginate(p, maxChars, 4));
    }
    this.pages = allPages;
    this.currentPageIndex = 0;
    this.charIndex = 0;
    this.charTimer = 0;
    this.isActive = true;
    this.isChoiceActive = false;
    this.onCompleteCallback = onComplete;
    this.currentPortrait = portrait;
  }

  // Shows the prompt text, then a [ YES / NO ] choice on the final page.
  // Long prompts are paginated so the question itself is never cut off: everything
  // before the last line-break is shown as normal pages, the question gets the choice.
  startChoice(text, onChoice, portrait = null) {
    const maxChars = portrait ? 24 : 36;
    const segments = text.split('\n');
    const allLines = this.wrapAndPaginate(text, maxChars, 99)[0].split('\n');
    let pages;
    if (allLines.length <= 3) {
      pages = [allLines.join('\n')];
    } else {
      const question = segments.pop();
      const lead = segments.join('\n');
      pages = this.wrapAndPaginate(lead, maxChars, 4);
      pages.push(this.wrapAndPaginate(question, maxChars, 2)[0]);
    }
    this.pages = pages;
    this.currentPageIndex = 0;
    this.charIndex = 0;
    this.charTimer = 0;
    this.isActive = true;
    this.isChoiceActive = true;
    this.choiceIndex = 0; // default YES
    this.onChoiceCallback = onChoice;
    this.onCompleteCallback = null;
    this.currentPortrait = portrait;
  }

  isOnChoicePage() {
    return this.isChoiceActive && this.currentPageIndex === this.pages.length - 1;
  }

  update(dt, input) {
    if (!this.isActive) return;

    const currentPage = this.pages[this.currentPageIndex];
    const isFinishedTyping = this.charIndex >= currentPage.length;

    // Typewriter advancement
    if (!isFinishedTyping) {
      // Speed up text if holding X or Shift
      const speed = (input.isDown('KeyX') || input.isDown('ShiftLeft') || input.isDown('ShiftRight')) ? 5 : this.textSpeed;
      this.charTimer += dt;
      if (this.charTimer >= speed) {
        this.charTimer = 0;
        this.charIndex++;
        const char = currentPage[this.charIndex - 1];
        if (char !== ' ' && char !== '\n' && window.audioManager) {
          window.audioManager.playTextBlip();
        }
      }
    }

    // Choice navigation (Left / Right)
    if (this.isOnChoicePage() && isFinishedTyping) {
      if (input.wasPressed('ArrowLeft') || input.wasPressed('KeyA')) {
        if (this.choiceIndex !== 0) {
          this.choiceIndex = 0;
          if (window.audioManager) window.audioManager.playMenuMove();
        }
      }
      if (input.wasPressed('ArrowRight') || input.wasPressed('KeyD')) {
        if (this.choiceIndex !== 1) {
          this.choiceIndex = 1;
          if (window.audioManager) window.audioManager.playMenuMove();
        }
      }

      // Confirm choice
      if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
        const choice = this.choiceIndex === 0 ? 'YES' : 'NO';
        this.isActive = false;
        this.isChoiceActive = false;
        if (window.audioManager) window.audioManager.playMenuSelect();
        if (this.onChoiceCallback) {
          this.onChoiceCallback(choice);
        }
        return;
      }
    }

    // Advance dialogue (choice prompts advance through their lead-in pages first)
    if (!this.isOnChoicePage()) {
      if (input.wasPressed('KeyZ') || input.wasPressed('Enter')) {
        if (!isFinishedTyping) {
          // Instantly reveal rest of text on press
          this.charIndex = currentPage.length;
        } else {
          // Next page or close
          this.currentPageIndex++;
          if (this.currentPageIndex >= this.pages.length) {
            this.isActive = false;
            if (this.onCompleteCallback) {
              this.onCompleteCallback();
            }
          } else {
            this.charIndex = 0;
            this.charTimer = 0;
          }
        }
      }
    }
  }

  draw(ctx, canvasWidth, canvasHeight) {
    if (!this.isActive) return;

    // Classic Undertale Dialogue Box: bottom of the screen, or the top when
    // Mallika is standing in the lower half (so the box never covers her).
    const boxX = 32;
    const boxW = canvasWidth - 64;
    const boxH = 120;
    const player = window.game && window.game.player;
    const atTop = player && window.game.state !== 'BATTLE' && (player.y + 30) > canvasHeight / 2 + 20;
    const boxY = atTop ? 20 : canvasHeight - 140;

    // Outer white border, black interior
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX + 4, boxY + 4, boxW - 8, boxH - 8);

    let textStartX = boxX + 24;
    const textStartY = boxY + 20;
    let maxTextWidth = boxW - 48;

    // Draw Portrait if present
    if (this.currentPortrait && window.spriteManager && window.spriteManager.portraits[this.currentPortrait]) {
      const portrait = window.spriteManager.portraits[this.currentPortrait];
      ctx.drawImage(portrait, boxX + 16, boxY + 20, 80, 80);
      textStartX += 90;
      maxTextWidth -= 90;
    }

    // Render Typewriter Text
    const fullText = this.pages[this.currentPageIndex];
    const visibleText = fullText.substring(0, this.charIndex);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    const lines = visibleText.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(line, textStartX, textStartY + idx * 24);
    });

    // Render Choice buttons if active & finished typing
    if (this.isOnChoicePage() && this.charIndex >= fullText.length) {
      const choiceY = boxY + boxH - 32;
      const yesX = boxX + boxW / 2 - 80;
      const noX = boxX + boxW / 2 + 50;

      // Draw red heart next to selected choice
      const soul = window.spriteManager.ui.soul;
      if (this.choiceIndex === 0) {
        ctx.drawImage(soul, yesX - 22, choiceY - 1, 14, 14);
      } else {
        ctx.drawImage(soul, noX - 22, choiceY - 1, 14, 14);
      }

      ctx.fillStyle = this.choiceIndex === 0 ? '#ffff00' : '#ffffff';
      ctx.fillText("YES", yesX, choiceY);

      ctx.fillStyle = this.choiceIndex === 1 ? '#ffff00' : '#ffffff';
      ctx.fillText("NO", noX, choiceY);
    }
  }
}

window.dialogueManager = new DialogueManager();
