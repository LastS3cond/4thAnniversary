/**
 * Undertale 4th Anniversary - Title screen: UNDERTALE, the subtitle and the [ ♥ PLAY? ] prompt.
 * (Starting the game on Z / Enter / click is handled by Game and InputManager.)
 */
const TitleScreen = {
  draw(ctx, canvas) {
    // Pitch Black Void Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title: UNDERTALE
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("UNDERTALE", canvas.width / 2, 160);

    // Subtitle: 4th Anniversary
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText("-- 4th Anniversary --", canvas.width / 2, 205);

    // Prompt Box: [ ♥ PLAY? ]
    const boxW = 200;
    const boxH = 46;
    const boxX = (canvas.width - boxW) / 2;
    const boxY = 270;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Pulsing Red Soul Cursor
    const pulse = Math.sin(Date.now() * 0.005) * 2;
    if (window.spriteManager && window.spriteManager.ui.soul) {
      ctx.drawImage(window.spriteManager.ui.soul, boxX + 24, boxY + 14 + pulse, 18, 18);
    }

    ctx.fillStyle = '#ffff55';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText("PLAY?", boxX + 58, boxY + 30);

    // Click / Key hint
    ctx.fillStyle = '#888888';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText("Press [Z] or Click to Start", canvas.width / 2, 360);

    // Reset textAlign for rest of game
    ctx.textAlign = 'left';
  }
};
