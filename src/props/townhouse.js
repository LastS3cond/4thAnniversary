/**
 * Props: the townhouse's furniture and fixtures (see PropArt in src/sprites.js).
 * Each one becomes spriteManager.env[name]; rooms place them with an object's `art` / `prop`.
 */
(() => {
  // Kitchen wood cabinet run (south wall) at any width
  function cabinets(S, w) {
    const { canvas, ctx } = S.createCanvas(w, 23);
    const R = (x, y, ww, h, c) => S.rect(ctx, x, y, ww, h, c);
    R(0, 0, w, 9, '#6e4426');
    const doors = Math.max(1, Math.round(w / 11));
    const dw = w / doors;
    for (let i = 0; i < doors; i++) {
      const x0 = Math.round(i * dw);
      const x1 = Math.round((i + 1) * dw);
      R(x0 + 1, 1, x1 - x0 - 2, 7, '#7d4f2e');
      const kx = i % 2 === 0 ? x1 - 3 : x0 + 2;
      R(kx, 4, 1, 2, '#d9a93c');
    }
    R(0, 8, w, 1, '#4f2f1a');
    R(0, 9, w, 14, '#ece2c8');
    R(0, 9, w, 1, '#fbf5e6');
    R(0, 21, w, 2, '#ddd2b6');
    return canvas;
  }

  // ---------- Punching bag station (24 x 36) ----------
  PropArt.define('punchBag', (S) => S.makeProp(24, 36, (ctx, R, P) => {
    // floor shadow
    S.ellipse(ctx, 12, 32, 10, 2, 'rgba(0,0,0,0.28)');
    // steel post + cantilever arm + brace
    R(4, 3, 2, 29, '#3b3f46'); R(4, 3, 1, 29, '#5f6670');
    R(4, 2, 14, 2, '#3b3f46'); R(4, 2, 14, 1, '#5f6670');
    for (let i = 0; i < 6; i++) P(6 + i, 9 - i, '#3b3f46');
    // chain
    P(15, 4, '#a9b0ba'); P(15, 5, '#7c838d'); P(15, 6, '#a9b0ba');
    P(14, 7, '#7c838d'); P(16, 7, '#7c838d');
    // heavy black vinyl bag
    R(11, 8, 9, 20, '#202226');
    R(12, 7, 7, 1, '#202226');
    R(12, 28, 7, 1, '#202226');
    R(12, 9, 1, 18, '#3c4048'); R(13, 9, 1, 18, '#2c2f35');
    R(18, 9, 1, 18, '#141518');
    R(11, 11, 9, 1, '#141518'); R(11, 24, 9, 1, '#141518');
    // base: legs + round steel plate
    R(1, 31, 22, 2, '#3b3f46'); R(1, 31, 22, 1, '#5f6670');
    S.ellipse(ctx, 5, 31, 3, 1, '#4a5058');
    // sandbags weighing the legs
    R(0, 29, 6, 4, '#b89c72'); R(18, 29, 6, 4, '#b89c72');
    R(0, 29, 6, 1, '#d3b98e'); R(18, 29, 6, 1, '#d3b98e');
    R(2, 30, 1, 3, '#8f7552'); R(21, 30, 1, 3, '#8f7552');
  }, { shadow: true }));

  // ---------- Red L-sectional couch: the living room centerpiece (88 x 34) ----------
  PropArt.define('couch', (S) => S.makeProp(88, 34, (ctx, R) => {
    const base = '#9e2a2b';
    const shade = '#7a1d22';
    const dark = '#57131a';
    const hi = '#bf4744';
    const seams = [26, 47, 67];
    // long backrest along the north
    R(0, 0, 88, 9, shade);
    R(1, 0, 86, 1, hi);
    R(0, 8, 88, 1, dark);
    seams.forEach((x) => R(x, 1, 1, 7, dark));
    // main seat cushions
    R(0, 9, 88, 12, base);
    R(0, 9, 88, 1, hi);
    seams.forEach((x) => R(x, 9, 1, 12, dark));
    // seat front face (right of the chaise)
    R(26, 21, 62, 4, dark);
    // chaise lounge projecting forward on the left (the L)
    R(0, 21, 26, 9, base);
    R(4, 21, 22, 1, shade);
    R(0, 30, 26, 4, dark);
    // arms
    R(0, 1, 4, 29, shade); R(0, 1, 1, 29, hi);
    R(83, 1, 5, 20, shade); R(87, 1, 1, 20, dark);
    R(0, 30, 4, 4, '#46101a'); R(83, 21, 5, 4, '#46101a');
    // red throw pillows
    R(6, 2, 11, 6, '#d8403a'); R(6, 2, 11, 1, '#f06a5c'); R(6, 7, 11, 1, '#a82a26');
    R(70, 2, 10, 6, '#d8403a'); R(70, 2, 10, 1, '#f06a5c'); R(70, 7, 10, 1, '#a82a26');
  }));

  // ---------- Coffee table inside the L: papers + notebook strewn about (38 x 15) ----------
  PropArt.define('coffeeTable', (S) => S.makeProp(38, 15, (ctx, R, P) => {
    R(0, 0, 38, 11, '#5e3a22');
    R(0, 0, 38, 1, '#7a4f31');
    R(0, 11, 38, 2, '#3f2615');
    R(1, 13, 2, 2, '#3f2615'); R(35, 13, 2, 2, '#3f2615');
    // open spiral notebook
    R(3, 2, 13, 7, '#2c4a78');
    R(4, 2, 11, 6, '#f4f1e8');
    R(9, 2, 1, 6, '#c9c2b0');
    R(5, 3, 3, 1, '#9fb0c9'); R(5, 5, 3, 1, '#9fb0c9'); R(11, 3, 3, 1, '#9fb0c9'); R(11, 5, 3, 1, '#9fb0c9');
    // papers strewn about
    R(19, 1, 8, 6, '#ece6d6');
    R(20, 2, 6, 1, '#b5ad99'); R(20, 4, 4, 1, '#b5ad99');
    R(22, 4, 9, 6, '#fbfaf5');
    R(23, 5, 7, 1, '#a9a395'); R(23, 7, 5, 1, '#a9a395');
    R(15, 8, 6, 2, '#f1ecdf');
    // pen
    R(17, 10, 5, 1, '#c8323a'); P(22, 10, '#e8e8e8');
    // little bowl
    R(32, 2, 4, 4, '#f2efe6'); P(32, 2, '#ffffff'); R(32, 6, 4, 1, '#c9c4b6');
  }));

  // ---------- TV stand + TV seen from behind (TV faces north toward the couch) (76 x 22) ----------
  PropArt.define('tvStand', (S) => S.makeProp(76, 22, (ctx, R) => {
    // TV back panel
    R(12, 0, 52, 7, '#101012');
    R(12, 0, 52, 1, '#2e2f35');
    R(35, 7, 6, 1, '#1a1a1d');
    // black TV stand: lighter top surface, dark body
    R(0, 8, 76, 3, '#34343a');
    R(0, 8, 76, 1, '#4c4c54');
    R(0, 11, 76, 7, '#1b1b1f');
    R(1, 12, 74, 1, '#28282d');
    R(2, 18, 3, 4, '#0c0c0e'); R(71, 18, 3, 4, '#0c0c0e');
  }));

  // ---------- White folding table + folding bench + duckling puzzle (24 x 68) ----------
  PropArt.define('puzzleTable', (S) => S.makeProp(24, 68, (ctx, R, P) => {
    // folding bench (tucked along the west side)
    R(0, 6, 5, 56, '#dcdad3'); R(0, 6, 1, 56, '#f1efe9'); R(0, 62, 5, 2, '#a9a79f');
    // table top
    R(4, 0, 20, 64, '#efede7');
    R(4, 0, 20, 1, '#ffffff');
    R(23, 0, 1, 64, '#cfccc3');
    R(4, 64, 20, 2, '#bdb9ae');
    R(5, 66, 2, 2, '#8c9097'); R(21, 66, 2, 2, '#8c9097');
    // --- the duckling + water lily puzzle (north half) ---
    R(7, 3, 14, 28, '#3f7f8f');
    R(7, 3, 14, 1, '#2e6370'); R(7, 30, 14, 1, '#2e6370');
    R(7, 3, 1, 28, '#2e6370'); R(20, 3, 1, 28, '#2e6370');
    // ripples
    [[9, 8], [10, 8], [15, 22], [16, 22], [12, 16], [17, 11]].forEach(([x, y]) => P(x, y, '#6fb0bb'));
    // lily pads
    R(8, 18, 5, 3, '#4f9b3a'); P(8, 18, '#79c25a');
    R(8, 25, 4, 3, '#4f9b3a');
    R(14, 6, 4, 3, '#4f9b3a'); P(14, 6, '#79c25a');
    R(15, 26, 4, 3, '#4f9b3a'); P(15, 26, '#79c25a');
    // yellow water lilies
    R(9, 17, 2, 2, '#ffe680'); P(9, 17, '#ffffff');
    R(15, 5, 2, 2, '#ffe680'); P(16, 5, '#ffffff');
    R(16, 25, 2, 2, '#ffe680');
    // purple flowers along the bank
    [[19, 10], [19, 12], [18, 14], [19, 16], [18, 19], [8, 29]].forEach(([x, y], i) => P(x, y, i % 2 ? '#e07ae8' : '#c45ad6'));
    // a little row of ducklings
    const duck = (x, y) => {
      R(x, y, 3, 2, '#f2c33c'); P(x + 2, y - 1, '#f2c33c'); P(x + 3, y - 1, '#f08a24');
      P(x, y + 1, '#c99a2a');
    };
    duck(9, 11); duck(12, 12); duck(15, 14);
    // --- south half: tall blue cups, pens, phone ---
    R(9, 38, 4, 5, '#1f5fb0'); R(9, 38, 4, 1, '#4f8ad8');
    R(15, 46, 4, 5, '#1f5fb0'); R(15, 46, 4, 1, '#4f8ad8');
    R(8, 55, 7, 1, '#1a1a1a'); R(18, 38, 1, 6, '#c8323a');
    R(14, 56, 5, 3, '#3a3d44'); P(15, 57, '#8fb3d9');
  }));

  // ---------- White shoe rack with New Balances (14 x 22) ----------
  PropArt.define('shoeRack', (S) => S.makeProp(14, 22, (ctx, R, P) => {
    // posts
    R(0, 0, 1, 22, '#f2f2ef'); R(13, 0, 1, 22, '#d6d6d2');
    // shelves
    [6, 13, 20].forEach((y) => { R(0, y, 14, 1, '#fafaf7'); R(0, y + 1, 14, 1, '#cfcfcb'); });
    // a pair of New Balance sneakers (side view, toes left) on each shelf
    const sneaker = (x, y, upper, accent) => {
      R(x + 2, y - 3, 3, 1, upper);       // collar / heel
      R(x, y - 2, 6, 1, upper);           // upper
      R(x, y - 1, 6, 1, '#f4f4f1');       // white midsole
      P(x + 3, y - 2, accent);            // the 'N'
      P(x, y - 2, '#e6e6e2');             // toe cap
    };
    sneaker(1, 6, '#8a929c', '#1f2d52'); sneaker(7, 6, '#8a929c', '#1f2d52');
    sneaker(1, 13, '#2a3f6e', '#e9edf5'); sneaker(7, 13, '#2a3f6e', '#e9edf5');
    sneaker(1, 20, '#b5bbc4', '#c8323a'); sneaker(7, 20, '#b5bbc4', '#c8323a');
  }));

  // ---------- Sliding glass door with vertical blinds (32 x 26) ----------
  PropArt.define('slidingDoor', (S) => {
    const { canvas, ctx } = S.createCanvas(32, 26);
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    R(0, 0, 32, 26, '#9aa1aa');
    R(2, 2, 13, 24, '#131a2c'); R(17, 2, 13, 24, '#131a2c');
    R(2, 2, 13, 1, '#22304d'); R(17, 2, 13, 1, '#22304d');
    // a few faint stars outside
    S.px(ctx, 5, 8, '#cfd8ea'); S.px(ctx, 10, 15, '#cfd8ea'); S.px(ctx, 7, 20, '#cfd8ea');
    // vertical blinds gathered on the right pane
    for (let x = 19; x < 30; x += 2) { R(x, 2, 1, 24, '#e6e4dc'); R(x + 1, 2, 1, 24, '#c4c1b6'); }
    R(0, 0, 32, 1, '#c6ccd3');
    R(15, 2, 2, 24, '#7d848e');
    R(13, 12, 1, 4, '#d7dbe0');
    return canvas;
  });

  // ---------- Kitchen: south counter run pieces ----------
  // Each piece: front band (cabinet faces toward the room, north) + countertop.
  PropArt.define('cabinetsWest', (S) => cabinets(S, 35));
  PropArt.define('cabinetsEast', (S) => cabinets(S, 49));
  // Sink (20 x 23)
  PropArt.define('sink', (S) => {
    const { canvas, ctx } = S.createCanvas(20, 23);
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    R(0, 0, 20, 9, '#6e4426');
    R(1, 1, 8, 7, '#7d4f2e'); R(11, 1, 8, 7, '#7d4f2e');
    R(7, 4, 1, 2, '#d9a93c'); R(12, 4, 1, 2, '#d9a93c');
    R(0, 8, 20, 1, '#4f2f1a');
    R(0, 9, 20, 14, '#ece2c8');
    R(0, 9, 20, 1, '#fbf5e6');
    R(0, 21, 20, 2, '#ddd2b6');
    // stainless double basin
    R(2, 11, 14, 7, '#8f99a6');
    R(3, 12, 5, 5, '#6c7580'); R(10, 12, 5, 5, '#6c7580');
    // dirty dishes piled up
    R(3, 13, 4, 3, '#f4f4f0'); R(4, 14, 2, 1, '#d5d0c4');
    R(10, 12, 4, 3, '#e7e7e2'); R(11, 15, 3, 2, '#f8f8f4');
    S.px(ctx, 12, 13, '#c9a26a'); S.px(ctx, 5, 13, '#b5865a');
    R(8, 12, 2, 3, '#4f8ad8');
    // faucet on the south side pointing north into the basin
    R(8, 18, 2, 3, '#cdd3da'); R(8, 17, 2, 1, '#eef1f4'); R(7, 20, 4, 1, '#9aa1aa');
    // soap + gloves on the counter
    R(17, 16, 2, 3, '#2f86e0'); S.px(ctx, 17, 15, '#ffffff');
    R(0, 12, 2, 3, '#ec5c8d');
    return canvas;
  });
  // Dishwasher (16 x 23): black front, silver dial
  PropArt.define('dishwasher', (S) => {
    const { canvas, ctx } = S.createCanvas(16, 23);
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    R(0, 0, 16, 9, '#1f1f22');
    R(1, 6, 14, 2, '#2c2c31');
    R(1, 1, 14, 4, '#26262a');
    R(2, 5, 12, 1, '#9aa1aa');
    S.disc(ctx, 12, 3, 1, '#c9ced5'); S.px(ctx, 12, 3, '#ffffff');
    R(0, 8, 16, 1, '#111113');
    R(0, 9, 16, 14, '#ece2c8');
    R(0, 9, 16, 1, '#fbf5e6');
    R(0, 21, 16, 2, '#ddd2b6');
    return canvas;
  });

  // ---------- Kitchen: east wall pieces (fronts face west) ----------
  // Fridge (28 x 27) - clean stainless double door
  PropArt.define('fridge', (S) => {
    const { canvas, ctx } = S.createCanvas(28, 27);
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    R(0, 0, 28, 27, '#c9ced5');
    R(0, 0, 13, 27, '#d9dde2');
    R(0, 13, 13, 1, '#9aa1aa');
    R(1, 0, 1, 27, '#eef0f3');
    R(10, 3, 1, 7, '#7f8790'); R(10, 16, 1, 7, '#7f8790');
    R(13, 0, 1, 27, '#9aa1aa');
    R(14, 0, 14, 2, '#b4bac2');
    R(0, 25, 28, 2, '#8d949d');
    return canvas;
  });
  // Prep counter (28 x 20): cabinets + butcher block + spices
  PropArt.define('prepCounter', (S) => {
    const { canvas, ctx } = S.createCanvas(28, 20);
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    R(0, 0, 9, 20, '#6e4426');
    R(1, 1, 7, 8, '#7d4f2e'); R(1, 11, 7, 8, '#7d4f2e');
    R(6, 4, 1, 2, '#d9a93c'); R(6, 14, 1, 2, '#d9a93c');
    R(8, 0, 1, 20, '#4f2f1a');
    R(9, 0, 19, 20, '#ece2c8');
    R(9, 0, 1, 20, '#fbf5e6');
    R(12, 3, 8, 11, '#b98a54'); R(12, 3, 8, 1, '#d8ab70'); R(12, 13, 8, 1, '#8c6238');
    R(14, 7, 4, 1, '#8c6238');
    const jar = (x, y, c) => { R(x, y, 2, 3, c); S.px(ctx, x, y, '#ffffff'); };
    jar(22, 3, '#c8323a'); jar(25, 3, '#e0a43a'); jar(22, 8, '#5f8f3a'); jar(25, 8, '#8b5a2b');
    jar(22, 14, '#e0a43a');
    R(26, 0, 2, 20, '#ddd2b6');
    return canvas;
  });
  // Stove + oven (28 x 35): white electric coil range, oven door faces west, backguard east
  PropArt.define('stove', (S) => {
    const { canvas, ctx } = S.createCanvas(28, 35);
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    // oven door band (west)
    R(0, 0, 9, 35, '#f1f1ed');
    R(0, 0, 1, 35, '#ffffff');
    R(2, 6, 5, 23, '#2a1b14');
    R(3, 8, 3, 19, '#e8892e');
    R(3, 8, 3, 2, '#ffc46b');
    R(8, 0, 1, 35, '#c7c7c0');
    R(1, 3, 1, 29, '#d7d7d0');
    // cooktop
    R(9, 0, 15, 35, '#fafaf6');
    R(9, 0, 1, 35, '#ffffff');
    const coil = (cx, cy, r) => {
      S.disc(ctx, cx, cy, r, '#202022');
      S.disc(ctx, cx, cy, r - 1, '#4a4a4f');
      S.disc(ctx, cx, cy, Math.max(0, r - 2), '#202022');
    };
    coil(13, 8, 3); coil(13, 26, 3); coil(20, 9, 2); coil(20, 25, 2);
    // backguard (east) with knobs
    R(24, 0, 4, 35, '#e3e3dc');
    R(24, 0, 1, 35, '#c7c7c0');
    [5, 11, 23, 29].forEach((y) => R(25, y, 2, 2, '#55555a'));
    R(25, 16, 2, 3, '#1f1f22'); S.px(ctx, 25, 17, '#5cff8a');
    return S.outline(canvas);
  });
  // Corner counter (28 x 28) with a microwave on it: next to the oven, facing
  // west toward the sink, set back so the oven sticks out further than it does.
  PropArt.define('cornerCounter', (S) => {
    const { canvas, ctx } = S.createCanvas(28, 28);
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    R(0, 0, 28, 28, '#ece2c8');
    // cabinet fronts below the counter (continuing both runs)
    R(0, 0, 9, 14, '#6e4426');
    R(1, 0, 7, 4, '#7d4f2e');
    R(1, 6, 7, 7, '#7d4f2e');
    R(6, 9, 1, 2, '#d9a93c');
    R(8, 0, 1, 14, '#4f2f1a'); R(0, 13, 9, 1, '#4f2f1a');
    R(9, 0, 1, 14, '#fbf5e6'); R(0, 14, 9, 1, '#fbf5e6');
    R(26, 0, 2, 28, '#ddd2b6'); R(0, 26, 28, 2, '#ddd2b6');
    // microwave: top surface + its door/window on the west face
    R(11, 22, 15, 1, 'rgba(0,0,0,0.22)');
    R(11, 7, 15, 15, '#000000');
    R(15, 8, 10, 13, '#2c2c31');
    R(15, 8, 10, 1, '#47474e');
    R(12, 8, 3, 13, '#1d1d21');
    R(12, 10, 2, 7, '#3d4b5c');
    S.px(ctx, 12, 10, '#5d6f84');
    R(12, 18, 2, 2, '#9aa1aa');
    S.px(ctx, 13, 18, '#5cff8a');
    return canvas;
  });

  // ---------- "HAPPY ANNIVERSARY" ribbon banner (hung above the couch) ----------
  PropArt.define('banner', (S) => {
    const text = 'HAPPY ANNIVERSARY';
    const tw = S.textWidth(text);
    const w = tw + 14;
    return S.makeProp(w + 6, 11, (ctx, R, P) => {
      // folded tails (notched)
      R(0, 3, 4, 7, '#a52e46');
      ctx.clearRect(0, 6, 1, 1);
      R(w + 2, 3, 4, 7, '#a52e46');
      ctx.clearRect(w + 5, 6, 1, 1);
      // main ribbon
      R(3, 1, w, 9, '#d8445e');
      R(3, 1, w, 1, '#f07a8c');
      R(3, 9, w, 1, '#a52e46');
      // tiny hearts at each end
      P(5, 4, '#fff1d8'); P(7, 4, '#fff1d8'); R(5, 5, 3, 1, '#fff1d8'); P(6, 6, '#fff1d8');
      P(w - 3, 4, '#fff1d8'); P(w - 1, 4, '#fff1d8'); R(w - 3, 5, 3, 1, '#fff1d8'); P(w - 2, 6, '#fff1d8');
      S.drawText(ctx, text, 3 + Math.floor((w - tw) / 2), 3, '#fff6e6');
    });
  });

  // ---------- Brick tile (16 x 8) ----------
  PropArt.define('brick', (S) => {
    const { canvas, ctx } = S.createCanvas(16, 8);
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    R(0, 0, 16, 8, '#8b3a2b');
    R(0, 3, 16, 1, '#6a261a'); R(0, 7, 16, 1, '#6a261a');
    R(7, 0, 1, 3, '#6a261a'); R(15, 0, 1, 3, '#6a261a');
    R(3, 4, 1, 3, '#6a261a'); R(11, 4, 1, 3, '#6a261a');
    R(1, 0, 5, 1, '#9c4635'); R(12, 4, 3, 1, '#9c4635');
    R(8, 4, 3, 3, '#7e3324');
    return canvas;
  });
})();
