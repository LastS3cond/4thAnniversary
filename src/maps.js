/**
 * Undertale 4th Anniversary - Rooms, Overworld Maps, Triggers & Transitions
 *
 * Rendering model (Undertale style):
 *  - Every room background is painted ONCE at native art resolution (320 x 240) into an
 *    offscreen canvas, then blitted at exactly 2x. One art pixel = one 2x2 screen block.
 *  - Colliders, interactables and spawn points stay in 640 x 480 screen coordinates.
 *  - Props the player can walk behind are depth-sorted with the characters by their base y.
 *  - Small animated layers (drifting leaves, lantern, LED, oven glow) are drawn
 *    every frame on the same 2x pixel grid.
 */

// Shared palette
const PAL = {
  void: '#000000',
  wallTop: '#6b5a4e',
  wallTopHi: '#84705f',
  wallTopEdge: '#3f332c',
  cap: '#241c18',
  wall: '#eae3d2',
  wallSide: '#ddd4c0',
  wallShade: '#d4c9b2',
  base: '#5a3d28',
  baseHi: '#7a5538',
  oak: '#caa478',
  oakSeam: '#b8936a',
  kitchen: '#cfc0a0',
  kitchenSpeck: '#c4b493',
  kitchenDot: '#bba987',
  foyer: '#d9d1c1',
  foyerEdge: '#c2b8a5',
  carpet: '#c8b294',
  carpetShade: '#a8927a',
  carpetLight: '#dccab2',
  wood: '#7d4f2e',
  woodDark: '#4f2f1a',
  woodMid: '#6e4426',
  brass: '#d9a93c',
  brassHi: '#f5d77a',
  led: '#39ff7a'
};

class MapManager {
  constructor() {
    this.currentRoom = 'exterior';
    this.rooms = {};
    this.bgCache = {};
    this.initRooms();
  }

  // ----------------------------------------------------
  // Art-pixel helpers
  // ----------------------------------------------------
  helpers(ctx) {
    return {
      R: (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); },
      P: (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); },
      img: (im, x, y) => ctx.drawImage(im, x, y)
    };
  }

  // Deterministic pseudo random generator (stable scatter of leaves / specks)
  rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Tile a pattern canvas over a rectangle (clipped)
  tile(ctx, tileCanvas, x, y, w, h, offX = 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const tw = tileCanvas.width;
    const th = tileCanvas.height;
    for (let ty = y; ty < y + h; ty += th) {
      for (let tx = x - ((offX % tw) + tw) % tw; tx < x + w; tx += tw) {
        ctx.drawImage(tileCanvas, tx, ty);
      }
    }
    ctx.restore();
  }

  // Interior wall mass seen from above: dark top, optional cream side bands, cream south face.
  wallBlock(H, x, y, w, h, opts = {}) {
    const face = opts.face === undefined ? 16 : opts.face;
    const band = opts.band || 6;
    H.R(x, y, w, h - face, PAL.wallTop);
    H.R(x, y, w, 1, PAL.wallTopEdge);
    H.R(x, y + 1, w, 1, PAL.wallTopHi);
    if (opts.east) { H.R(x + w - band, y + 1, band, h - face - 1, PAL.wallSide); H.R(x + w - band, y + 1, 1, h - face - 1, PAL.wallTopEdge); }
    if (opts.west) { H.R(x, y + 1, band, h - face - 1, PAL.wallSide); H.R(x + band - 1, y + 1, 1, h - face - 1, PAL.wallTopEdge); }
    if (face > 0) {
      H.R(x, y + h - face, w, face, PAL.wall);
      H.R(x, y + h - face, w, 1, PAL.wallShade);
      H.R(x, y + h - 3, w, 3, PAL.base);
      H.R(x, y + h - 3, w, 1, PAL.baseHi);
    }
  }

  // Wooden door drawn on a side band (fits a w x h slot)
  sideDoor(H, x, y, w, h, knobSide) {
    H.R(x, y, w, h, PAL.woodDark);              // thin dark frame, no light casing
    H.R(x + 1, y + 1, w - 2, h - 2, PAL.wood);
    H.R(x + 1, y + 1, w - 2, 1, '#9a6a43');
    H.R(x + 2, y + 3, w - 4, Math.floor(h / 2) - 4, PAL.woodMid);
    H.R(x + 2, y + Math.floor(h / 2) + 1, w - 4, Math.floor(h / 2) - 4, PAL.woodMid);
    const kx = knobSide === 'right' ? x + w - 2 : x + 1;
    H.R(kx, y + Math.floor(h / 2), 1, 2, PAL.brass);
    H.P(kx, y + Math.floor(h / 2), PAL.brassHi);
  }

  getBackground(room) {
    if (!this.bgCache[room.name]) {
      const S = window.spriteManager;
      const { canvas, ctx } = S.createCanvas(320, 240);
      room.buildBackground(ctx, S, this.helpers(ctx));
      this.bgCache[room.name] = canvas;
    }
    return this.bgCache[room.name];
  }

  // Draw the whole room: background, under-layer, depth-sorted actors & props, over-layer.
  drawRoom(ctx, actors) {
    const room = this.getCurrentRoom();
    if (!room) return;
    const t = performance.now() / 1000;
    ctx.drawImage(this.getBackground(room), 0, 0, 640, 480);
    if (room.drawUnder) room.drawUnder(ctx, t);

    const list = actors.slice();
    const S = window.spriteManager;
    (room.props || []).forEach((p) => {
      const img = S.env[p.sprite];
      if (img) list.push({ img, x: p.x * 2, y: p.y * 2, w: img.width * 2, h: img.height * 2, baseY: p.baseY });
    });
    list.sort((a, b) => a.baseY - b.baseY);
    list.forEach((a) => {
      if (a.draw) { a.draw(ctx); return; }
      ctx.drawImage(a.img, Math.round(a.x / 2) * 2, Math.round(a.y / 2) * 2, a.w || a.img.width, a.h || a.img.height);
    });

    if (room.drawOver) room.drawOver(ctx, t);
  }

  initRooms() {
    const M = this;
    // Screen-space art-pixel rect (x, y, w, h in art px)
    const A = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * 2, Math.round(y) * 2, w * 2, h * 2); };

    // ----------------------------------------------------
    // ROOM 1: TOWNHOUSE 316 EXTERIOR (FALL, THIN ALLEY x: 160..480)
    // Recessed brick facade with white siding strictly above the door, a small
    // shingled awning, brass 316 plaque + lantern, and the 100% brick stairwell
    // bay protruding on the right (matching the real house).
    // ----------------------------------------------------
    this.rooms['exterior'] = {
      name: 'exterior',
      bgm: 'snowy',
      width: 640,
      height: 480,
      spawn: { x: 302, y: 306, dir: 'up' },
      colliders: [
        { x: 0, y: 0, w: 160, h: 480 },     // left void
        { x: 480, y: 0, w: 160, h: 480 },   // right void
        { x: 160, y: 0, w: 140, h: 232 },   // facade left of the door
        { x: 344, y: 0, w: 48, h: 232 },    // facade right of the door
        { x: 300, y: 0, w: 44, h: 214 },    // behind the door
        { x: 392, y: 0, w: 88, h: 248 },    // protruding brick stairwell bay
        { x: 160, y: 440, w: 320, h: 40 }   // bottom edge of the screen
      ],
      interactables: [
        {
          // Front door: step over the threshold into the foyer
          x: 302, y: 214, w: 40, h: 26,
          isDoor: true,
          onEnter: () => {
            if (window.audioManager) window.audioManager.playDoor();
            window.game.transitionToRoom('first_floor', 159, 356, 'up');
          }
        },
        {
          x: 256, y: 176, w: 44, h: 64,
          text: ["* A polished brass plaque reads: 316."]
        },
        {
          x: 164, y: 244, w: 132, h: 100,
          text: ["* Crisp autumn breeze rustles through the fallen leaves."]
        },
        {
          x: 348, y: 252, w: 128, h: 92,
          text: ["* Crisp autumn breeze rustles through the fallen leaves."]
        }
      ],
      buildBackground: (ctx, S, H) => {
        const rand = M.rng(316);
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
        M.tile(ctx, S.env.brick, 80, 30, 116, 86);
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

        // --- Front door, fully framed in brick ---
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
        // stoop
        H.R(145, 116, 32, 3, '#a8a49b');
        H.R(145, 116, 32, 1, '#c4c0b6');
        H.R(145, 119, 32, 1, '#6f6c66');

        // --- Brass 316 plaque on the brick beside the door ---
        H.R(131, 93, 16, 9, '#000000');
        H.R(132, 94, 14, 7, PAL.brass);
        H.R(132, 94, 14, 1, PAL.brassHi);
        H.R(132, 100, 14, 1, '#a07a26');
        S.drawText(ctx, '316', 134, 95, '#3b2a10');

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
        M.tile(ctx, S.env.brick, 196, 26, 44, 98, 3);
        H.R(196, 26, 4, 98, 'rgba(0,0,0,0.38)');     // shadowed side face
        H.R(194, 22, 46, 4, '#2a211c');
        H.R(194, 22, 46, 1, '#45382f');
        H.R(196, 120, 44, 4, '#8f8a80');
        H.R(196, 120, 44, 1, '#a7a297');
        H.R(190, 30, 6, 82, 'rgba(0,0,0,0.12)');      // soft shadow on the recessed wall

        // --- Autumn lawn ---
        H.R(80, 116, 160, 56, '#6b7a32');
        H.R(200, 116, 40, 8, '#000000');               // (covered by the bay)
        M.tile(ctx, S.env.brick, 200, 116, 40, 4, 3);
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
        const glow = M.getGlow(20, 255, 200, 110);
        ctx.globalAlpha = Math.min(1, f * 1.6);
        ctx.drawImage(glow, (181 - 20) * 2, (93 - 20) * 2, glow.width * 2, glow.height * 2);
        ctx.globalAlpha = 1;
      },
      drawOver: (ctx, t) => {
        // A few autumn leaves tumbling down on the breeze around Mallika
        M.drawLeaves(ctx, t, {
          count: 14, x0: 80, x1: 240, y0: -6, y1: 238,
          speed: [12, 22], drift: [2, 7], sway: 6, seed: 1716,
          clip: [[80, 0, 160, 240]]
        });
      }
    };

    // ----------------------------------------------------
    // ROOM 2: FIRST FLOOR
    // Living room spans the full width of the house along the north (x: 40..600,
    // y: 60..200) with the couch + TV centered; kitchen sits below it on the right
    // (x: 320..600, y: 195..440); bathroom / hallway / center box on the left.
    // ----------------------------------------------------
    this.rooms['first_floor'] = {
      name: 'first_floor',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 159, y: 356, dir: 'up' },
      colliders: [
        // Perimeter
        { x: 0, y: 0, w: 640, h: 60 },
        { x: 0, y: 440, w: 640, h: 40 },
        { x: 0, y: 0, w: 40, h: 480 },
        { x: 600, y: 0, w: 40, h: 480 },
        // Exposed brick strip on the west living room wall
        { x: 40, y: 60, w: 20, h: 140 },
        // Center box, extended east toward the kitchen (TV wall)
        { x: 215, y: 200, w: 227, h: 165 },
        // Kitchen north wall: west of the doorway, and above the fridge
        { x: 442, y: 200, w: 38, h: 20 },
        { x: 544, y: 200, w: 56, h: 20 },
        // Bathroom block
        { x: 40, y: 200, w: 95, h: 165 },
        // Coat closet (bottom-left corner)
        { x: 40, y: 365, w: 55, h: 75 },
        // Shoe rack in the pocket left of the front door
        { x: 115, y: 390, w: 26, h: 40 },
        // Kitchen south wall: pantry, cabinets, sink, dishwasher, cabinets
        { x: 270, y: 390, w: 35, h: 50 },
        { x: 305, y: 395, w: 240, h: 45 },
        // Kitchen east wall: fridge, prep counter, stove, corner counter + microwave
        { x: 544, y: 220, w: 56, h: 220 },
        // Living room furniture
        { x: 77, y: 65, w: 48, h: 70 },    // punching bag station
        { x: 232, y: 62, w: 176, h: 68 },  // L-couch against the north wall (coffee table inside the L)
        { x: 244, y: 170, w: 152, h: 28 }, // TV stand against the TV wall (corridor y: 130..170)
        { x: 536, y: 62, w: 48, h: 136 }   // folding puzzle table, spans the room's height
      ],
      // Depth-sorted props (sprites carry a 1px outline margin, hence the -1 offsets)
      props: [
        { sprite: 'tvStand', x: 121, y: 76, baseY: 198 },
        { sprite: 'shoeRack', x: 56, y: 192, baseY: 430 }
      ],
      interactables: [
        { x: 40, y: 365, w: 55, h: 75, text: ["* What is this closet even for?"] },
        { x: 115, y: 390, w: 26, h: 40, text: ["* A familiar row of New Balances resting in the foyer pocket."] },
        {
          // Front door: back outside
          x: 155, y: 434, w: 45, h: 12,
          isDoor: true,
          onEnter: () => {
            if (window.audioManager) window.audioManager.playDoor();
            window.game.transitionToRoom('exterior', 302, 200, 'down');
          }
        },
        { x: 130, y: 250, w: 15, h: 45, text: ["* You don't have to use the bathroom right now."] },
        { x: 215, y: 235, w: 15, h: 45, text: ["* You hear grumbling from the water heater inside."] },
        {
          // Stairs entrance: narrate, then head into the switchback staircase
          x: 215, y: 405, w: 50, h: 35,
          isDoor: true,
          onEnter: () => {
            window.dialogueManager.start(["* You head into the stairs..."], () => {
              window.game.transitionToRoom('staircase', 255, 90, 'down');
            });
          }
        },
        { x: 270, y: 390, w: 35, h: 50, text: ["* You don't really want anything from the pantry right now."] },
        { x: 305, y: 395, w: 69, h: 45, text: ["* Dark wood cabinetry filled with plates and mugs."] },
        { x: 374, y: 400, w: 40, h: 35, triggerSink: true },
        { x: 414, y: 395, w: 32, h: 45, text: ["* Never figured out how this dishwasher worked."] },
        { x: 446, y: 395, w: 98, h: 45, text: ["* More dark wood cabinets with bowls and spices."] },
        { x: 544, y: 220, w: 56, h: 54, text: ["* You don't really want anything from the fridge right now."] },
        { x: 544, y: 274, w: 56, h: 41, text: ["* A kitchen counter with spices and cutting boards."] },
        { x: 544, y: 315, w: 56, h: 70, text: ["* The oven is warm. A rich aroma of brown sugar and dates fills the kitchen."] },
        { x: 77, y: 65, w: 48, h: 70, triggerPunchingBag: true },
        {
          // Sliding screen door: the broken blind (YES / NO choice)
          x: 438, y: 40, w: 64, h: 30,
          choice: {
            prompt: "* It's chilly outside. A broken blind hangs at your feet. Do you want to put it back up?",
            yes: ["* You try, but you are too short."],
            no: ["* You leave it there."]
          }
        },
        // Coffee table is listed before the couch so it wins when both are in reach
        { x: 312, y: 96, w: 76, h: 30, text: ["* Papers just strewn about."] },
        { x: 232, y: 62, w: 176, h: 68, text: ["* The red sectional couch in the center of the room. Warm and inviting."] },
        { x: 244, y: 170, w: 152, h: 28, text: ["* The TV is quiet. A cozy reflection fills the screen."] },
        { x: 536, y: 62, w: 48, h: 136, text: ["* A cute puzzle of ducklings and flowers."] }
      ],
      buildBackground: (ctx, S, H) => {
        const rand = M.rng(325);
        H.R(0, 0, 320, 240, PAL.void);

        // ---------- FLOORS ----------
        // Living room + hallway hardwood (planks run east-west)
        const oak = (x, y, w, h) => {
          H.R(x, y, w, h, PAL.oak);
          for (let py = y + 5; py < y + h; py += 6) H.R(x, py, w, 1, PAL.oakSeam);
          for (let py = y; py < y + h; py += 6) {
            const row = Math.floor((py - 30) / 6);
            for (let px = x + ((row * 17) % 29); px < x + w; px += 29) H.R(px, py, 1, Math.min(5, y + h - py), PAL.oakSeam);
          }
        };
        oak(20, 30, 280, 70);
        oak(67, 100, 40, 82);
        // Kitchen floor (warm vinyl, faint lattice, no tile grid): the galley east of
        // the TV wall, the doorway from the living room, and the strip by the stairs
        const inKitchen = (x, y) => (x >= 221 && y >= 110) || (y >= 182 && x >= 107) || (x >= 240 && x < 272 && y >= 100);
        H.R(221, 110, 79, 110, PAL.kitchen);
        H.R(107, 182, 114, 38, PAL.kitchen);
        H.R(240, 100, 32, 10, PAL.kitchen);
        for (let y = 101; y < 220; y += 8) {
          for (let x = 108 + ((y >> 3) % 2) * 6; x < 300; x += 12) {
            if (inKitchen(x, y)) H.P(x, y, PAL.kitchenDot);
          }
        }
        for (let i = 0; i < 30; i++) {
          const x = 108 + Math.floor(rand() * 190);
          const y = 100 + Math.floor(rand() * 119);
          if (inKitchen(x, y)) H.P(x, y, PAL.kitchenSpeck);
        }
        H.R(240, 100, 32, 1, '#a8865e');
        // Foyer landing
        H.R(20, 182, 87, 38, PAL.foyer);
        H.R(20, 182, 87, 1, PAL.foyerEdge);
        // Hallway runner
        H.R(73, 96, 28, 92, '#9b5f3e');
        H.R(73, 96, 28, 1, '#7a4a2f'); H.R(73, 187, 28, 1, '#7a4a2f');
        H.R(73, 96, 1, 92, '#7a4a2f'); H.R(100, 96, 1, 92, '#7a4a2f');
        H.R(75, 98, 24, 1, '#c48a5e'); H.R(75, 185, 24, 1, '#c48a5e');
        H.R(75, 98, 1, 88, '#c48a5e'); H.R(98, 98, 1, 88, '#c48a5e');

        // ---------- NORTH WALL (living room + kitchen) ----------
        H.R(18, 0, 284, 2, PAL.cap);
        H.R(20, 2, 280, 26, PAL.wall);
        H.R(20, 2, 280, 1, PAL.wallShade);
        H.R(20, 27, 280, 3, PAL.base);
        H.R(20, 27, 280, 1, PAL.baseHi);
        // Emerald LED strip along the living room ceiling (full width) + soft bloom
        H.R(20, 2, 280, 1, PAL.led);
        H.R(20, 3, 280, 2, 'rgba(57,255,122,0.20)');
        H.R(20, 5, 280, 4, 'rgba(57,255,122,0.08)');
        // Sliding glass door (east of the couch, next to the puzzle table)
        H.img(S.env.slidingDoor, 219, 4);
        // "HAPPY ANNIVERSARY" banner hung on the wall above the couch
        H.img(S.env.banner, 160 - Math.floor(S.env.banner.width / 2), 8);

        // ---------- WEST BRICK STRIP ----------
        M.tile(ctx, S.env.brick, 20, 2, 10, 98, 5);
        H.R(29, 2, 1, 98, 'rgba(0,0,0,0.25)');
        H.R(20, 2, 10, 1, 'rgba(0,0,0,0.3)');
        H.R(18, 0, 2, 222, PAL.cap);

        // ---------- EAST + SOUTH PERIMETER CAPS ----------
        H.R(300, 0, 2, 222, PAL.cap);
        H.R(18, 220, 284, 2, PAL.cap);

        // ---------- BATHROOM BLOCK + COAT CLOSET ----------
        M.wallBlock(H, 20, 100, 47, 82, { east: true });
        M.sideDoor(H, 60, 124, 7, 24, 'right');
        // Coat closet (bottom-left corner), door facing the foyer pocket
        H.R(20, 166, 27, 54, PAL.wallTop);
        H.R(20, 166, 27, 1, PAL.wallTopEdge);
        H.R(41, 166, 6, 54, PAL.wallSide);
        H.R(41, 166, 1, 54, PAL.wallTopEdge);
        M.sideDoor(H, 40, 187, 7, 28, 'right');

        // ---------- CENTER BOX (extended east: the TV sits against its north side) ----------
        M.wallBlock(H, 107, 100, 114, 82, { west: true, east: true });
        M.sideDoor(H, 107, 117, 7, 24, 'left');

        // ---------- KITCHEN NORTH WALL with a doorway from the living room (x: 240..272) ----------
        const thinWall = (x, w) => {
          H.R(x, 100, w, 3, PAL.wallTop);
          H.R(x, 100, w, 1, PAL.wallTopEdge);
          H.R(x, 103, w, 7, PAL.wall);
          H.R(x, 103, w, 1, PAL.wallShade);
          H.R(x, 107, w, 3, PAL.base);
          H.R(x, 107, w, 1, PAL.baseHi);
        };
        thinWall(221, 19);
        thinWall(272, 28);

        // ---------- FOYER: FRONT DOOR + WELCOME MAT ----------
        H.R(77, 214, 25, 6, '#f1ebdf');
        H.R(78, 215, 23, 5, '#4a2c1c');
        H.R(79, 216, 21, 4, '#5c3826');
        H.R(97, 217, 1, 2, PAL.brass);
        H.R(80, 205, 19, 8, '#a8834f');
        H.R(80, 205, 19, 1, '#7d5e34'); H.R(80, 212, 19, 1, '#7d5e34');
        H.R(80, 205, 1, 8, '#7d5e34'); H.R(98, 205, 1, 8, '#7d5e34');
        for (let x = 82; x < 97; x += 2) H.P(x, 208, '#93703f');

        // ---------- STAIRS ENTRANCE (opening in the south wall) ----------
        H.R(107, 200, 25, 22, '#000000');
        const treads = ['#c8b294', '#b9a387', '#a5907a', '#8b7864'];
        treads.forEach((c, i) => {
          const y = 201 + i * 5;
          H.R(108, y, 23, 5, c);
          H.R(108, y, 23, 1, i === 0 ? PAL.carpetLight : '#cbb79c');
          H.R(108, y + 4, 23, 1, 'rgba(0,0,0,0.25)');
        });
        H.R(108, 200, 1, 22, PAL.woodMid);
        H.R(130, 200, 1, 22, '#2a201a');

        // ---------- KITCHEN SOUTH RUN ----------
        // Pantry (tall wood door)
        H.R(135, 195, 17, 25, PAL.woodDark);
        H.R(136, 196, 15, 24, PAL.wood);
        H.R(138, 198, 11, 9, PAL.woodMid); H.R(138, 209, 11, 9, PAL.woodMid);
        H.R(138, 198, 11, 1, '#9a6a43'); H.R(138, 209, 11, 1, '#9a6a43');
        H.R(137, 207, 1, 2, PAL.brass); H.P(137, 207, PAL.brassHi);
        // Cabinets | sink | dishwasher | cabinets
        H.img(S.makeSouthCabinets(35), 152, 197);
        H.img(S.env.sink, 187, 197);
        H.img(S.env.dishwasher, 207, 197);
        H.img(S.makeSouthCabinets(49), 223, 197);
        H.R(152, 196, 120, 1, '#2b1d14');

        // ---------- KITCHEN EAST RUN (fronts face west into the room) ----------
        H.img(S.env.fridge, 272, 110);
        H.img(S.env.prepCounter, 272, 137);
        H.img(S.env.stove, 272, 157);
        H.img(S.env.cornerCounter, 272, 192);   // counter space + microwave facing the sink
        H.R(271, 110, 1, 87, '#2b1d14');

        // ---------- LIVING ROOM FURNITURE (sprites carry a 1px outline margin) ----------
        H.img(S.env.punchBag, 37, 31);
        H.img(S.env.couch, 115, 30);          // centered L-couch, back against the north wall
        H.img(S.env.coffeeTable, 155, 47);    // inside the L
        H.img(S.env.puzzleTable, 267, 30);    // spans the living room's height, by the sliding door
      },
      drawUnder: (ctx, t) => {
        // A few leaves drifting past outside the sliding glass door
        M.drawLeaves(ctx, t, {
          count: 3, small: true, x0: 217, x1: 241, y0: 2, y1: 34,
          speed: [5, 9], drift: [1, 4], sway: 3, seed: 316,
          clip: [[221, 6, 13, 24], [236, 6, 2, 24]]
        });
        // Gentle breathing of the emerald LED bloom
        const a = 0.05 + (Math.sin(t * 1.4) + 1) * 0.025;
        A(ctx, 20, 3, 280, 3, `rgba(57,255,122,${a.toFixed(3)})`);
        // Warm oven glow spilling out of the oven door onto the kitchen floor
        const f = 0.85 + Math.sin(t * 5.1) * 0.08 + Math.sin(t * 1.7) * 0.06;
        const glow = M.getGlow(16, 255, 150, 60);
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, 271 * 2, 480);
        ctx.clip();
        ctx.globalAlpha = f;
        ctx.drawImage(glow, (271 - 16) * 2, (175 - 16) * 2, glow.width * 2, glow.height * 2);
        ctx.restore();
      }
    };

    // ----------------------------------------------------
    // ROOM 3: U-SHAPED SWITCHBACK STAIRCASE
    // Flight 1 (left) down to the landing, 180 deg turn, Flight 2 (right) up.
    // ----------------------------------------------------
    this.rooms['staircase'] = {
      name: 'staircase',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 255, y: 90, dir: 'down' },
      colliders: [
        { x: 0, y: 0, w: 235, h: 480 },    // left of the shaft
        { x: 375, y: 0, w: 265, h: 480 },  // right of the shaft
        { x: 0, y: 0, w: 640, h: 50 },     // top (doorway triggers sit just below)
        { x: 0, y: 390, w: 640, h: 90 },   // below the landing wall
        { x: 235, y: 350, w: 140, h: 40 }, // landing window wall
        { x: 295, y: 40, w: 20, h: 250 }   // central wall between the flights
      ],
      interactables: [
        {
          x: 270, y: 345, w: 70, h: 45,
          text: [
            "* You pause at the intermediate landing.",
            "* Outside the window, leaves drift through the quiet fall night."
          ]
        },
        {
          x: 235, y: 40, w: 60, h: 25,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('first_floor', 220, 340, 'up'); }
        },
        {
          x: 315, y: 40, w: 60, h: 25,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('second_floor', 300, 372, 'up'); }
        }
      ],
      buildBackground: (ctx, S, H) => {
        H.R(0, 0, 320, 240, PAL.void);
        // side wall faces of the narrow shaft
        H.R(110, 2, 2, 196, PAL.cap); H.R(188 + 6, 2, 2, 196, PAL.cap);
        H.R(112, 4, 6, 192, PAL.wallSide); H.R(188, 4, 6, 192, PAL.wallSide);
        H.R(117, 4, 1, 192, PAL.base); H.R(188, 4, 1, 192, PAL.base);
        // north wall header with two doorways
        H.R(110, 2, 86, 2, PAL.cap);
        H.R(112, 4, 82, 28, PAL.wall);
        H.R(112, 4, 82, 1, PAL.wallShade);
        H.R(119, 10, 28, 22, '#f2ede2'); H.R(159, 10, 28, 22, '#f2ede2');
        H.R(120, 11, 26, 21, '#000000'); H.R(160, 11, 26, 21, '#000000');
        // doorway glows hinting where each flight leads
        H.R(120, 26, 26, 6, '#1a1410'); H.R(160, 26, 26, 6, '#1a1410');

        // Beige carpet treads: each flight gets gently deeper toward the landing,
        // so Flight 1 reads as going down and Flight 2 as climbing back up.
        const tone = ['#d2bd9f', '#cdb89a', '#c8b394', '#c3ae8f', '#bea98a', '#b9a485', '#b49f80'];
        // Flight 1 (descending toward the landing)
        for (let i = 0; i < 7; i++) {
          const y = 32 + i * 16;
          H.R(118, y, 30, 16, tone[i]);
          H.R(118, y + 13, 30, 1, PAL.carpetLight);
          H.R(118, y + 14, 30, 2, '#9c8670');
        }
        // Flight 2 (ascending north, risers face the viewer)
        for (let i = 0; i < 7; i++) {
          const y = 32 + i * 16;
          H.R(158, y, 30, 16, tone[i]);
          H.R(158, y + 10, 30, 1, PAL.carpetLight);
          H.R(158, y + 11, 30, 5, PAL.carpetShade);
          H.R(158, y + 15, 30, 1, '#8e7963');
        }
        // wall-side shadows + wooden handrails on the outer walls
        H.R(118, 32, 2, 113, 'rgba(0,0,0,0.10)'); H.R(186, 32, 2, 113, 'rgba(0,0,0,0.10)');
        H.R(118, 32, 1, 113, '#6e4426'); H.R(187, 32, 1, 113, '#6e4426');
        for (let y = 36; y < 145; y += 16) { H.P(118, y, '#4f2f1a'); H.P(187, y, '#4f2f1a'); }

        // Landing (lowest point of the switchback)
        H.R(118, 145, 70, 30, '#b49f80');
        H.R(118, 145, 70, 1, '#a08b6e');
        H.R(118, 145, 2, 30, 'rgba(0,0,0,0.10)'); H.R(186, 145, 2, 30, 'rgba(0,0,0,0.10)');

        // Central wall / handrail between the flights
        H.R(148, 4, 10, 129, PAL.wallTop);
        H.R(148, 4, 10, 1, PAL.wallTopHi);
        H.R(149, 4, 8, 129, '#6e4426');
        H.R(149, 4, 1, 129, '#8e5d38');
        H.R(148, 133, 10, 12, PAL.wall);
        H.R(148, 142, 10, 3, PAL.base);
        H.R(147, 130, 12, 3, '#5a3622');
        H.R(147, 130, 12, 1, '#8e5d38');

        // South landing wall with the double-hung window
        H.R(118, 175, 70, 20, PAL.wall);
        H.R(118, 175, 70, 2, PAL.base);
        H.R(118, 177, 70, 1, PAL.wallShade);
        H.R(110, 195, 86, 2, PAL.cap);
        // This wall is drawn folded down (its floor edge is at the top), so the sill sits up top
        H.R(134, 178, 38, 2, '#ddd8cc');
        H.R(134, 180, 38, 15, '#000000');
        H.R(135, 180, 36, 14, '#f4f1ea');
        H.R(137, 181, 32, 5, '#18213d');
        H.R(137, 188, 32, 5, '#18213d');
        H.R(135, 186, 36, 2, '#f4f1ea');
        H.R(152, 181, 2, 12, '#f4f1ea');
      },
      drawUnder: (ctx, t) => {
        // Faint cool moonlight from the landing window
        A(ctx, 136, 165, 34, 10, 'rgba(170,190,255,0.07)');
        A(ctx, 140, 158, 26, 7, 'rgba(170,190,255,0.05)');
        // A few fall leaves drifting past outside the window panes
        M.drawLeaves(ctx, t, {
          count: 5, small: true, up: true, x0: 132, x1: 174, y0: 176, y1: 198,
          speed: [5, 8], drift: [2, 5], sway: 3, seed: 2021,
          clip: [[137, 181, 15, 5], [154, 181, 15, 5], [137, 188, 15, 5], [154, 188, 15, 5]]
        });
      }
    };

    // ----------------------------------------------------
    // ROOM 4: SECOND FLOOR HALLWAY (NARROW CORRIDOR x: 280..360)
    // South -> North: Bathroom | Alex, Storage | wall, Kevin | Jaydon
    // ----------------------------------------------------
    const doorSlots = [
      { side: 'L', y: 40, label: 'KEVIN' },
      { side: 'R', y: 40, label: 'JAYDON', gold: true },
      { side: 'L', y: 90, label: 'STORAGE' },
      { side: 'L', y: 140, label: 'BATH' },
      { side: 'R', y: 140, label: 'ALEX' }
    ];
    this.rooms['second_floor'] = {
      name: 'second_floor',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 300, y: 372, dir: 'up' },
      colliders: [
        { x: 0, y: 0, w: 280, h: 480 },
        { x: 360, y: 0, w: 280, h: 480 },
        { x: 280, y: 0, w: 80, h: 65 },
        { x: 0, y: 455, w: 640, h: 25 }
      ],
      interactables: [
        { x: 255, y: 280, w: 30, h: 48, text: ["* You don't have to use the bathroom right now."] },
        { x: 355, y: 280, w: 30, h: 48, text: ["* You hear yelling and furious typing. Must be playing a game."] },
        { x: 255, y: 180, w: 30, h: 48, text: ["* There are some suitcases in here."] },
        { x: 255, y: 80, w: 30, h: 48, text: ["* You hear him speaking very formally, must be interviewing."] },
        { x: 355, y: 80, w: 30, h: 48, triggerBoss: true },
        {
          x: 285, y: 435, w: 70, h: 25,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('staircase', 325, 88, 'down'); }
        }
      ],
      buildBackground: (ctx, S, H) => {
        H.R(0, 0, 320, 240, PAL.void);
        // side wall faces + caps
        H.R(102, 2, 2, 212, PAL.cap); H.R(216, 2, 2, 212, PAL.cap);
        H.R(104, 4, 36, 208, PAL.wallSide); H.R(180, 4, 36, 208, PAL.wallSide);
        H.R(104, 4, 36, 1, PAL.wallShade); H.R(180, 4, 36, 1, PAL.wallShade);
        H.R(137, 4, 3, 208, PAL.base); H.R(137, 4, 1, 208, PAL.baseHi);
        H.R(180, 4, 3, 208, PAL.base); H.R(182, 4, 1, 208, PAL.baseHi);
        H.R(102, 2, 116, 2, PAL.cap);
        // end-of-hallway north wall
        H.R(140, 4, 40, 28, PAL.wall);
        H.R(140, 4, 40, 1, PAL.wallShade);
        H.R(140, 29, 40, 3, PAL.base);
        H.R(140, 29, 40, 1, PAL.baseHi);

        // carpet + runner with a rich brown border
        H.R(140, 32, 40, 180, PAL.carpet);
        H.R(146, 32, 28, 180, '#a3846a');
        H.R(146, 32, 1, 180, '#6b4630'); H.R(173, 32, 1, 180, '#6b4630');
        H.R(148, 32, 1, 180, '#c4a888'); H.R(171, 32, 1, 180, '#c4a888');

        // doors (no labels; Jaydon's has the gold trim)
        doorSlots.forEach((d) => {
          const dx = d.side === 'L' ? 122 : 183;
          const dy = d.y - 5;
          const trim = d.gold ? '#e6c04a' : '#f4efe4';
          H.R(dx - 1, dy - 1, 17, 31, '#000000');
          H.R(dx, dy, 15, 30, trim);
          if (d.gold) { H.R(dx, dy, 15, 1, '#fff0a0'); H.R(dx, dy, 1, 30, '#fff0a0'); }
          H.R(dx + 1, dy + 1, 13, 29, PAL.wood);
          H.R(dx + 1, dy + 1, 13, 1, '#9a6a43');
          H.R(dx + 3, dy + 4, 9, 10, PAL.woodMid);
          H.R(dx + 3, dy + 17, 9, 10, PAL.woodMid);
          H.R(dx + 3, dy + 4, 9, 1, '#9a6a43');
          H.R(dx + 3, dy + 17, 9, 1, '#9a6a43');
          const kx = d.side === 'L' ? dx + 12 : dx + 2;
          H.R(kx, dy + 15, 1, 2, PAL.brass); H.P(kx, dy + 15, PAL.brassHi);
        });

        // stairs opening at the south end of the hallway
        H.R(140, 212, 40, 28, '#000000');
        const treads = ['#c8b294', '#b9a387', '#a5907a', '#8b7864', '#6f604f'];
        treads.forEach((c, i) => {
          const y = 212 + i * 5;
          H.R(142, y, 36, 5, c);
          H.R(142, y, 36, 1, i === 0 ? PAL.carpetLight : '#cbb79c');
          H.R(142, y + 4, 36, 1, 'rgba(0,0,0,0.25)');
        });
        H.R(141, 212, 1, 28, PAL.woodMid); H.R(178, 212, 1, 28, PAL.woodMid);
        H.R(102, 212, 38, 2, PAL.cap); H.R(180, 212, 38, 2, PAL.cap);
      },
      drawUnder: (ctx) => {
        // Jaydon's door swings open once he steps out
        if (window.game && window.game.isJaydonInHallway) {
          A(ctx, 184, 36, 13, 29, '#120c09');
          A(ctx, 184, 36, 13, 1, '#2a1d15');
          A(ctx, 184, 56, 13, 9, 'rgba(255,214,140,0.16)');
          A(ctx, 184, 36, 2, 29, '#3b2216');
        }
      }
    };
  }

  // Tiny tumbling autumn-leaf sprites (4 colors x 4 tumble frames), cached
  getLeafFrames(small) {
    const key = small ? 'leaf_small' : 'leaf';
    if (this.bgCache[key]) return this.bgCache[key];
    const S = window.spriteManager;
    const palettes = [
      { h: '#efa04a', b: '#d97724', d: '#a8501c' },  // orange
      { h: '#dc7a3c', b: '#c05822', d: '#8a3a16' },  // rust
      { h: '#f4c565', b: '#e2a238', d: '#b07a20' },  // gold
      { h: '#d4603a', b: '#b8401e', d: '#7e2a12' }   // red
    ];
    const shapes = small
      ? [['hb.', '.bd'], ['.h', 'bd'], ['hbd'], ['.hb', 'bd.']]
      : [['.hb.', 'hbbd', '.bd.'], ['..hb', '.hbd', 'bd..'], ['hbbd'], ['hb..', 'bbd.', '..bd']];
    const frames = palettes.map((pal) => shapes.map((shape) => S.fromPattern(shape, pal)));
    this.bgCache[key] = frames;
    return frames;
  }

  // Draws a few leaves drifting down through a region (art px), optionally clipped
  // to window panes. Deterministic per seed, so every frame lines up smoothly.
  drawLeaves(ctx, t, o) {
    const frames = this.getLeafFrames(o.small);
    const rand = this.rng(o.seed);
    const spanX = o.x1 - o.x0;
    const spanY = o.y1 - o.y0;
    ctx.save();
    if (o.clip) {
      ctx.beginPath();
      o.clip.forEach(([x, y, w, h]) => ctx.rect(x * 2, y * 2, w * 2, h * 2));
      ctx.clip();
    }
    for (let i = 0; i < o.count; i++) {
      const p1 = rand();
      const p2 = rand();
      const p3 = rand();
      const p4 = rand();
      const p5 = rand();
      const speed = o.speed[0] + p3 * (o.speed[1] - o.speed[0]);
      const drift = o.drift[0] + p4 * (o.drift[1] - o.drift[0]);
      const sway = Math.sin(t * (0.8 + p5 * 1.2) + p1 * 6.283) * o.sway;
      const travel = o.up ? -t * speed : t * speed;
      const y = o.y0 + ((((p1 * spanY + travel) % spanY) + spanY) % spanY);
      const x = o.x0 + ((((p2 * spanX + t * drift + sway) % spanX) + spanX) % spanX);
      const tumble = frames[i % frames.length];
      const fr = tumble[Math.floor(t * (2 + p5 * 3) + p2 * 4) % 4];
      ctx.drawImage(fr, Math.round(x) * 2, Math.round(y) * 2, fr.width * 2, fr.height * 2);
    }
    ctx.restore();
  }

  // Cached stepped radial glow (pixel-art friendly light pool)
  getGlow(r, cr, cg, cb) {
    const key = `glow_${r}_${cr}_${cg}_${cb}`;
    if (this.bgCache[key]) return this.bgCache[key];
    const S = window.spriteManager;
    const size = r * 2 + 1;
    const { canvas, ctx } = S.createCanvas(size, size);
    const rings = [[1.0, 0.07], [0.72, 0.08], [0.45, 0.09]];
    rings.forEach(([f, a]) => {
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
      const rr = r * f;
      for (let y = -r; y <= r; y++) {
        for (let x = -r; x <= r; x++) {
          if (x * x + y * y * 1.25 <= rr * rr) ctx.fillRect(x + r, y + r, 1, 1);
        }
      }
    });
    this.bgCache[key] = canvas;
    return canvas;
  }

  getCurrentRoom() {
    return this.rooms[this.currentRoom];
  }
}

window.mapManager = new MapManager();
