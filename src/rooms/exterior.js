/**
 * Room: Townhouse 316 exterior (fall, thin alley x: 160..480)
 *
 * Recessed brick facade with white siding strictly above the door, a small shingled awning,
 * brass 316 plaque + lantern, and the 100% brick stairwell bay protruding on the right
 * (matching the real house).
 */
(() => {
  const { rng, tile, screenRect: A, drawLeaves, getGlow } = WorldArt;

  window.mapManager.addRoom({
    name: 'exterior',
    bgm: 'snowy',
    spawn: { x: 302, y: 306, dir: 'up' },
    walls: [
      { x: 0, y: 0, w: 160, h: 480 },     // left void
      { x: 480, y: 0, w: 160, h: 480 },   // right void
      { x: 160, y: 0, w: 140, h: 232 },   // facade left of the door
      { x: 344, y: 0, w: 48, h: 232 },    // facade right of the door
      { x: 300, y: 0, w: 44, h: 214 },    // behind the door
      { x: 392, y: 0, w: 88, h: 248 },    // protruding brick stairwell bay
      { x: 160, y: 440, w: 320, h: 40 }   // bottom edge of the screen
    ],
    objects: [
      {
        name: 'Front door',               // step over the threshold into the foyer
        at: { x: 302, y: 214, w: 40, h: 26 },
        door: { to: 'first_floor', x: 159, y: 356, dir: 'up', sound: true },
        art: (ctx, S, H) => {             // fully framed in brick
          H.R(148, 86, 26, 2, '#6a261a');
          H.R(149, 88, 24, 28, '#120b08');
          H.R(150, 88, 22, 3, '#2e1d14');
          H.R(151, 89, 20, 1, '#f2c46b');              // warm transom glow
          H.R(150, 91, 22, 25, '#3b2216');
          H.R(152, 93, 8, 9, '#2c180f'); H.R(162, 93, 8, 9, '#2c180f');
          H.R(152, 104, 8, 10, '#2c180f'); H.R(162, 104, 8, 10, '#2c180f');
          H.R(152, 93, 8, 1, '#4d2e1e'); H.R(162, 93, 8, 1, '#4d2e1e');
          H.R(152, 104, 8, 1, '#4d2e1e'); H.R(162, 104, 8, 1, '#4d2e1e');
          H.R(169, 102, 1, 2, PAL.brass); H.P(169, 102, PAL.brassHi);
        }
      },
      {
        name: 'Brass 316 plaque',         // on the brick beside the door
        at: { x: 256, y: 176, w: 44, h: 64 },
        text: ["* A polished brass plaque reads: 316."],
        art: (ctx, S, H) => {
          H.R(131, 93, 16, 9, '#000000');
          H.R(132, 94, 14, 7, PAL.brass);
          H.R(132, 94, 14, 1, PAL.brassHi);
          H.R(132, 100, 14, 1, '#a07a26');
          S.drawText(ctx, '316', 134, 95, '#3b2a10');
        }
      },
      {
        name: 'Lawn (left)',
        at: { x: 164, y: 244, w: 132, h: 100 },
        text: ["* Crisp autumn breeze rustles through the fallen leaves."]
      },
      {
        name: 'Lawn (right)',
        at: { x: 348, y: 252, w: 128, h: 92 },
        text: ["* Crisp autumn breeze rustles through the fallen leaves."]
      }
    ],
    buildBackground: (ctx, S, H) => {
      const rand = rng(316);
      H.R(0, 0, 320, 240, PAL.void);

      // --- Autumn night sky ---
      H.R(80, 0, 160, 30, '#141a30');
      H.R(80, 12, 160, 18, '#18203a');
      H.R(80, 22, 160, 8, '#1d2644');
      [[88, 4], [117, 3], [133, 11], [171, 8], [188, 3], [221, 6], [96, 17], [160, 15], [236, 19], [203, 13]]
        .forEach(([x, y], i) => H.P(x, y, i % 3 === 0 ? '#8a90a8' : '#e9e4c8'));
      // crescent moon
      S.disc(ctx, 104, 10, 4, '#f3ecd0');
      S.disc(ctx, 106, 9, 4, '#141a30');

      // --- Main facade brick (x: 80..196) ---
      tile(ctx, S.env.brick, 80, 30, 116, 86);
      // roofline / gutter
      H.R(80, 26, 116, 4, '#2a211c');
      H.R(80, 26, 116, 1, '#45382f');
      H.R(80, 29, 116, 1, '#1a1411');

      // --- White vinyl siding strictly above the door (3 door widths: x 127..196) ---
      H.R(127, 30, 69, 48, '#dedede');
      for (let y = 33; y < 78; y += 4) {
        H.R(127, y, 69, 1, '#cccccc');
        H.R(127, y + 1, 69, 1, '#e9e9e9');
      }
      H.R(127, 30, 1, 48, '#f4f4f4');
      H.R(126, 30, 1, 48, '#5a2418');
      // upstairs window in the siding
      H.R(151, 37, 20, 23, '#000000');
      H.R(152, 38, 18, 21, '#f3f3f0');
      H.R(154, 40, 14, 17, '#e3b25e');
      H.R(154, 40, 14, 1, '#f6d58e');
      H.R(154, 40, 1, 17, '#f0c77a');
      H.R(160, 40, 2, 17, '#f3f3f0');
      H.R(154, 48, 14, 1, '#f3f3f0');
      H.R(151, 59, 20, 2, '#cfcfca');

      // --- Shingled awning over the door ---
      H.R(124, 78, 74, 7, '#5b4331');
      for (let row = 0; row < 3; row++) {
        const y = 79 + row * 2;
        H.R(124, y, 74, 1, '#4a3526');
        for (let x = 124 + (row % 2) * 3; x < 198; x += 6) H.P(x, y - 1, '#3f2d20');
      }
      H.R(124, 78, 74, 1, '#6e543f');
      H.R(124, 85, 74, 1, '#2e2118');
      H.R(126, 86, 70, 1, 'rgba(0,0,0,0.35)');

      // stoop below the front door
      H.R(145, 116, 32, 3, '#a8a49b');
      H.R(145, 116, 32, 1, '#c4c0b6');
      H.R(145, 119, 32, 1, '#6f6c66');

      // --- Lantern (glow is animated) ---
      H.R(181, 87, 1, 2, '#141414');
      H.R(179, 89, 5, 1, '#141414');
      H.R(179, 90, 5, 6, '#141414');
      H.R(180, 90, 3, 5, '#ffd27a');
      H.P(180, 90, '#fff2c4');
      H.R(179, 96, 5, 1, '#141414');
      H.P(181, 97, '#141414');

      // foundation
      H.R(80, 112, 65, 4, '#8f8a80'); H.R(177, 112, 19, 4, '#8f8a80');
      H.R(80, 112, 65, 1, '#a7a297'); H.R(177, 112, 19, 1, '#a7a297');

      // --- Protruding 100% brick stairwell bay (x: 196..240) ---
      tile(ctx, S.env.brick, 196, 26, 44, 98, 3);
      H.R(196, 26, 4, 98, 'rgba(0,0,0,0.38)');     // shadowed side face
      H.R(194, 22, 46, 4, '#2a211c');
      H.R(194, 22, 46, 1, '#45382f');
      H.R(196, 120, 44, 4, '#8f8a80');
      H.R(196, 120, 44, 1, '#a7a297');
      H.R(190, 30, 6, 82, 'rgba(0,0,0,0.12)');      // soft shadow on the recessed wall

      // --- Autumn lawn ---
      H.R(80, 116, 160, 56, '#6b7a32');
      H.R(200, 116, 40, 8, '#000000');               // (covered by the bay)
      tile(ctx, S.env.brick, 200, 116, 40, 4, 3);
      H.R(196, 120, 44, 4, '#8f8a80');
      H.R(196, 120, 44, 1, '#a7a297');
      H.R(196, 116, 4, 8, 'rgba(0,0,0,0.38)');
      for (let i = 0; i < 70; i++) {
        const x = 80 + Math.floor(rand() * 158);
        const y = 117 + Math.floor(rand() * 54);
        if (x >= 148 && x <= 174) continue;
        if (x >= 196 && y < 124) continue;
        H.P(x, y, '#5a6828');
        H.P(x + 1, y - 1, '#5a6828');
      }
      for (let i = 0; i < 26; i++) {
        const x = 80 + Math.floor(rand() * 156);
        const y = 118 + Math.floor(rand() * 52);
        if (x >= 147 && x <= 175) continue;
        if (x >= 196 && y < 125) continue;
        const c = ['#c05822', '#d97724', '#e29b38'][i % 3];
        H.R(x, y, 2, 1, c);
        if (i % 2) H.P(x, y + 1, c);
      }

      // --- Concrete walkway to the door ---
      H.R(150, 119, 22, 53, '#b5b0a5');
      H.R(150, 119, 1, 53, '#c9c4b9');
      H.R(171, 119, 1, 53, '#96918a');
      for (let y = 131; y < 172; y += 12) H.R(150, y, 22, 1, '#9c978c');
      [[155, 126, '#d97724'], [166, 140, '#c05822'], [158, 152, '#e29b38'], [153, 163, '#d97724']]
        .forEach(([x, y, c]) => H.R(x, y, 2, 1, c));

      // --- Sidewalk, curb, and a row of empty parking spaces ---
      H.R(80, 172, 160, 12, '#a9a49a');
      H.R(80, 172, 160, 1, '#bdb8ad');
      for (let x = 98; x < 240; x += 22) H.R(x, 173, 1, 11, '#928d83');
      H.R(80, 184, 160, 2, '#77736b');
      H.R(80, 186, 160, 54, '#3a3a3e');
      H.R(80, 186, 160, 1, '#2a2a2e');
      for (let x = 82; x <= 240; x += 26) H.R(x, 188, 1, 34, '#d6d3c8');      // stall lines
      for (let x = 82; x + 26 <= 242; x += 26) {                              // wheel stops
        H.R(x + 7, 190, 12, 2, '#9c978d');
        H.R(x + 7, 190, 12, 1, '#b8b3a8');
      }
      [[92, 205, '#d97724'], [141, 214, '#c05822'], [170, 199, '#e29b38'], [219, 210, '#d97724'], [118, 230, '#c05822']]
        .forEach(([x, y, c]) => H.R(x, y, 2, 1, c));
    },
    drawUnder: (ctx, t) => {
      // Twinkling stars
      [[101, 9], [150, 5], [212, 18], [234, 12]].forEach(([x, y], i) => {
        if (Math.sin(t * 2 + i * 1.7) > 0.2) A(ctx, x, y, 1, 1, '#fff6d8');
      });
      // Warm lantern glow on the brick (stepped, gently flickering)
      const f = 0.85 + Math.sin(t * 7.3) * 0.05 + Math.sin(t * 2.1) * 0.05;
      const glow = getGlow(20, 255, 200, 110);
      ctx.globalAlpha = Math.min(1, f * 1.6);
      ctx.drawImage(glow, (181 - 20) * 2, (93 - 20) * 2, glow.width * 2, glow.height * 2);
      ctx.globalAlpha = 1;
    },
    drawOver: (ctx, t) => {
      // A few autumn leaves tumbling down on the breeze around Mallika
      drawLeaves(ctx, t, {
        count: 14, x0: 80, x1: 240, y0: -6, y1: 238,
        speed: [12, 22], drift: [2, 7], sway: 6, seed: 1716,
        clip: [[80, 0, 160, 240]]
      });
    }
  });
})();
