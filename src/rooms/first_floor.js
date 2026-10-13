/**
 * Room: First floor
 *
 * Living room spans the full width of the house along the north (x: 40..600, y: 60..200)
 * with the couch + TV centered; kitchen sits below it on the right (x: 320..600, y: 195..440);
 * bathroom / hallway / center box on the left.
 */
(() => {
  const { rng, tile, wallBlock, sideDoor, screenRect: A, drawLeaves, getGlow } = WorldArt;
  const { say, ask } = Interact;

  // Punching bag: only punches on YES; the first punch grants the +1 ATK used in the battle
  const punchingBag = (game) => {
    const prompt = game.flags.punchedBag
      ? "* A heavy punching bag on a metal stand, weighed down with sandbags.\n* Punch it again?"
      : "* A heavy punching bag on its own contraption, weighed down with sandbags.\n* Give it a punch?";
    ask(prompt, () => {
      if (window.audioManager) window.audioManager.playHit();
      if (!game.flags.punchedBag) {
        game.flags.punchedBag = true;
        say([
          "* WHAM!",
          "* You give the punching bag a solid punch!\n* Attack power +1."
        ]);
      } else {
        say([
          "* WHAM! A satisfying hit.",
          "* Your knuckles are warm and ready."
        ]);
      }
    }, [
      "* You leave the punching bag hanging peacefully."
    ]);
  };

  window.mapManager.addRoom({
    name: 'first_floor',
    bgm: 'home',
    spawn: { x: 159, y: 356, dir: 'up' },
    walls: [
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
      // Kitchen south wall: cabinets, sink, dishwasher, cabinets
      { x: 305, y: 395, w: 240, h: 45 },
      // Kitchen east wall: fridge, prep counter, stove, corner counter + microwave
      { x: 544, y: 220, w: 56, h: 220 }
    ],
    objects: [
      // ---------- Foyer & hallway ----------
      {
        name: 'Coat closet',              // bottom-left corner, door facing the foyer pocket
        at: { x: 40, y: 365, w: 55, h: 75 },
        solid: true,
        text: ["* What is this closet even for?"],
        art: (ctx, S, H) => {
          H.R(20, 166, 27, 54, PAL.wallTop);
          H.R(20, 166, 27, 1, PAL.wallTopEdge);
          H.R(41, 166, 6, 54, PAL.wallSide);
          H.R(41, 166, 1, 54, PAL.wallTopEdge);
          sideDoor(H, 40, 187, 7, 28, 'right');
        }
      },
      {
        name: 'Shoe rack',                // in the pocket left of the front door
        at: { x: 115, y: 390, w: 26, h: 40 },
        solid: true,
        text: ["* A familiar row of New Balances resting in the foyer pocket."],
        prop: { sprite: 'shoeRack', x: 56, y: 192 }
      },
      {
        name: 'Front door',               // back outside
        at: { x: 155, y: 434, w: 45, h: 12 },
        door: { to: 'exterior', x: 302, y: 200, dir: 'down', sound: true },
        art: (ctx, S, H) => {             // threshold + welcome mat
          H.R(77, 214, 25, 6, '#f1ebdf');
          H.R(78, 215, 23, 5, '#4a2c1c');
          H.R(79, 216, 21, 4, '#5c3826');
          H.R(97, 217, 1, 2, PAL.brass);
          H.R(80, 205, 19, 8, '#a8834f');
          H.R(80, 205, 19, 1, '#7d5e34'); H.R(80, 212, 19, 1, '#7d5e34');
          H.R(80, 205, 1, 8, '#7d5e34'); H.R(98, 205, 1, 8, '#7d5e34');
          for (let x = 82; x < 97; x += 2) H.P(x, 208, '#93703f');
        }
      },
      {
        name: 'Bathroom door',
        at: { x: 130, y: 250, w: 15, h: 45 },
        text: ["* You don't have to use the bathroom right now."],
        art: (ctx, S, H) => sideDoor(H, 60, 124, 7, 24, 'right')
      },
      {
        name: 'Water heater closet',
        at: { x: 215, y: 235, w: 15, h: 45 },
        text: ["* You hear grumbling from the water heater inside."],
        art: (ctx, S, H) => sideDoor(H, 107, 117, 7, 24, 'left')
      },
      {
        name: 'Stairs',                   // narrate, then head into the switchback staircase
        at: { x: 215, y: 405, w: 50, h: 35 },
        door: { to: 'staircase', x: 255, y: 90, dir: 'down', say: ["* You head into the stairs..."] },
        art: (ctx, S, H) => {             // opening in the south wall
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
        }
      },

      // ---------- Kitchen south run ----------
      {
        name: 'Pantry',                   // tall wood door
        at: { x: 270, y: 390, w: 35, h: 50 },
        solid: true,
        text: ["* You don't really want anything from the pantry right now."],
        art: (ctx, S, H) => {
          H.R(135, 195, 17, 25, PAL.woodDark);
          H.R(136, 196, 15, 24, PAL.wood);
          H.R(138, 198, 11, 9, PAL.woodMid); H.R(138, 209, 11, 9, PAL.woodMid);
          H.R(138, 198, 11, 1, '#9a6a43'); H.R(138, 209, 11, 1, '#9a6a43');
          H.R(137, 207, 1, 2, PAL.brass); H.P(137, 207, PAL.brassHi);
        }
      },
      {
        name: 'Cabinets (west)',
        at: { x: 305, y: 395, w: 69, h: 45 },
        text: ["* Dark wood cabinetry filled with plates and mugs."],
        art: { sprite: 'cabinetsWest', x: 152, y: 197 }
      },
      {
        name: 'Sink',                     // dirty dishes
        at: { x: 374, y: 400, w: 40, h: 35 },
        choice: {
          prompt: "* There are dirty dishes piled in the sink.\n* Clean them?",
          yes: ["* There are too many."],
          no: ["* You decide to leave them for later."]
        },
        art: { sprite: 'sink', x: 187, y: 197 }
      },
      {
        name: 'Dishwasher',
        at: { x: 414, y: 395, w: 32, h: 45 },
        text: ["* Never figured out how this dishwasher worked."],
        art: { sprite: 'dishwasher', x: 207, y: 197 }
      },
      {
        name: 'Cabinets (east)',
        at: { x: 446, y: 395, w: 98, h: 45 },
        text: ["* More dark wood cabinets with bowls and spices."],
        art: { sprite: 'cabinetsEast', x: 223, y: 197 }
      },

      // ---------- Kitchen east run (fronts face west into the room) ----------
      {
        name: 'Fridge',
        at: { x: 544, y: 220, w: 56, h: 54 },
        text: ["* You don't really want anything from the fridge right now."],
        art: { sprite: 'fridge', x: 272, y: 110 }
      },
      {
        name: 'Prep counter',
        at: { x: 544, y: 274, w: 56, h: 41 },
        text: ["* A kitchen counter with spices and cutting boards."],
        art: { sprite: 'prepCounter', x: 272, y: 137 }
      },
      {
        name: 'Oven',
        at: { x: 544, y: 315, w: 56, h: 70 },
        text: ["* The oven is warm. A rich aroma of brown sugar and dates fills the kitchen."],
        art: { sprite: 'stove', x: 272, y: 157 }
      },
      {
        name: 'Corner counter + microwave',   // facing the sink; nothing to inspect
        art: { sprite: 'cornerCounter', x: 272, y: 192 }
      },

      // ---------- Living room (sprites carry a 1px outline margin) ----------
      {
        name: 'Punching bag',             // station in the west brick corner
        at: { x: 77, y: 65, w: 48, h: 70 },
        solid: true,
        onInteract: punchingBag,
        art: { sprite: 'punchBag', x: 37, y: 31 }
      },
      {
        name: 'Sliding screen door',      // east of the couch, next to the puzzle table: the broken blind
        at: { x: 438, y: 40, w: 64, h: 30 },
        choice: {
          prompt: "* It's chilly outside. A broken blind hangs at your feet. Do you want to put it back up?",
          yes: ["* You try, but you are too short."],
          no: ["* You leave it there."]
        },
        art: { sprite: 'slidingDoor', x: 219, y: 4 }
      },
      {
        // Listed before the couch so it wins when both are in reach; painted on top of the couch
        name: 'Coffee table',             // inside the L
        at: { x: 312, y: 96, w: 76, h: 30 },
        text: ["* Papers just strewn about."],
        art: { sprite: 'coffeeTable', x: 155, y: 47, layer: 1 }
      },
      {
        name: 'Couch',                    // centered L-couch, back against the north wall
        at: { x: 232, y: 62, w: 176, h: 68 },
        solid: true,
        text: ["* The red sectional couch in the center of the room. Warm and inviting."],
        art: { sprite: 'couch', x: 115, y: 30 }
      },
      {
        name: 'TV stand',                 // against the TV wall (corridor y: 130..170); Mallika can walk behind it
        at: { x: 244, y: 170, w: 152, h: 28 },
        solid: true,
        text: ["* The TV is quiet. A cozy reflection fills the screen."],
        prop: { sprite: 'tvStand', x: 121, y: 76 }
      },
      {
        name: 'Puzzle table',             // folding table by the sliding door, spans the room's height
        at: { x: 536, y: 62, w: 48, h: 136 },
        solid: true,
        text: ["* A cute puzzle of ducklings and flowers."],
        art: { sprite: 'puzzleTable', x: 267, y: 30 }
      },
      {
        name: '"Happy Anniversary" banner',   // hung on the wall above the couch
        art: (ctx, S, H) => H.img(S.env.banner, 160 - Math.floor(S.env.banner.width / 2), 8)
      }
    ],
    buildBackground: (ctx, S, H) => {
      const rand = rng(325);
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

      // ---------- WEST BRICK STRIP ----------
      tile(ctx, S.env.brick, 20, 2, 10, 98, 5);
      H.R(29, 2, 1, 98, 'rgba(0,0,0,0.25)');
      H.R(20, 2, 10, 1, 'rgba(0,0,0,0.3)');
      H.R(18, 0, 2, 222, PAL.cap);

      // ---------- EAST + SOUTH PERIMETER CAPS ----------
      H.R(300, 0, 2, 222, PAL.cap);
      H.R(18, 220, 284, 2, PAL.cap);

      // ---------- BATHROOM BLOCK ----------
      wallBlock(H, 20, 100, 47, 82, { east: true });

      // ---------- CENTER BOX (extended east: the TV sits against its north side) ----------
      wallBlock(H, 107, 100, 114, 82, { west: true, east: true });

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

      // ---------- KITCHEN COUNTER SEAMS (the fixtures themselves are objects) ----------
      H.R(152, 196, 120, 1, '#2b1d14');
      H.R(271, 110, 1, 87, '#2b1d14');
    },
    drawUnder: (ctx, t) => {
      // A few leaves drifting past outside the sliding glass door
      drawLeaves(ctx, t, {
        count: 3, small: true, x0: 217, x1: 241, y0: 2, y1: 34,
        speed: [5, 9], drift: [1, 4], sway: 3, seed: 316,
        clip: [[221, 6, 13, 24], [236, 6, 2, 24]]
      });
      // Gentle breathing of the emerald LED bloom
      const a = 0.05 + (Math.sin(t * 1.4) + 1) * 0.025;
      A(ctx, 20, 3, 280, 3, `rgba(57,255,122,${a.toFixed(3)})`);
      // Warm oven glow spilling out of the oven door onto the kitchen floor
      const f = 0.85 + Math.sin(t * 5.1) * 0.08 + Math.sin(t * 1.7) * 0.06;
      const glow = getGlow(16, 255, 150, 60);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 271 * 2, 480);
      ctx.clip();
      ctx.globalAlpha = f;
      ctx.drawImage(glow, (271 - 16) * 2, (175 - 16) * 2, glow.width * 2, glow.height * 2);
      ctx.restore();
    }
  });
})();
