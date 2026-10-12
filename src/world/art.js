/**
 * Undertale 4th Anniversary - World art toolkit
 *
 * The shared palette plus the small drawing helpers the rooms use. Two coordinate spaces:
 *  - art pixels (320 x 240): everything painted into a room's cached background
 *  - screen pixels (640 x 480, i.e. art x 2): colliders, interaction zones, spawns, actors
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

const WorldArt = (() => {
  const cache = {};

  // Art-pixel shorthands for drawing on a 1x canvas
  function helpers(ctx) {
    return {
      R: (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); },
      P: (x, y, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); },
      img: (im, x, y) => ctx.drawImage(im, x, y)
    };
  }

  // Deterministic pseudo random generator (stable scatter of leaves / specks)
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  // Tile a pattern canvas over a rectangle (clipped)
  function tile(ctx, tileCanvas, x, y, w, h, offX = 0) {
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
  function wallBlock(H, x, y, w, h, opts = {}) {
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
  function sideDoor(H, x, y, w, h, knobSide) {
    H.R(x, y, w, h, PAL.woodDark);              // thin dark frame, no light casing
    H.R(x + 1, y + 1, w - 2, h - 2, PAL.wood);
    H.R(x + 1, y + 1, w - 2, 1, '#9a6a43');
    H.R(x + 2, y + 3, w - 4, Math.floor(h / 2) - 4, PAL.woodMid);
    H.R(x + 2, y + Math.floor(h / 2) + 1, w - 4, Math.floor(h / 2) - 4, PAL.woodMid);
    const kx = knobSide === 'right' ? x + w - 2 : x + 1;
    H.R(kx, y + Math.floor(h / 2), 1, 2, PAL.brass);
    H.P(kx, y + Math.floor(h / 2), PAL.brassHi);
  }

  // Fills an art-pixel rect (x, y, w, h in art px) directly on the 640 x 480 screen.
  // Used by the animated layers, which are drawn every frame on the same 2x grid.
  function screenRect(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x) * 2, Math.round(y) * 2, w * 2, h * 2);
  }

  // Tiny tumbling autumn-leaf sprites (4 colors x 4 tumble frames), cached
  function leafFrames(small) {
    const key = small ? 'leaf_small' : 'leaf';
    if (cache[key]) return cache[key];
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
    cache[key] = frames;
    return frames;
  }

  // Draws a few leaves drifting down through a region (art px), optionally clipped
  // to window panes. Deterministic per seed, so every frame lines up smoothly.
  //   o: { count, small, up, x0, x1, y0, y1, speed: [min, max], drift: [min, max], sway, seed, clip: [[x, y, w, h]] }
  function drawLeaves(ctx, t, o) {
    const frames = leafFrames(o.small);
    const rand = rng(o.seed);
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

  // Cached stepped radial glow (pixel-art friendly light pool), radius r art px
  function getGlow(r, cr, cg, cb) {
    const key = `glow_${r}_${cr}_${cg}_${cb}`;
    if (cache[key]) return cache[key];
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
    cache[key] = canvas;
    return canvas;
  }

  return { helpers, rng, tile, wallBlock, sideDoor, screenRect, drawLeaves, getGlow };
})();
