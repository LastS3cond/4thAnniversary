/**
 * Undertale 4th Anniversary - Sprite toolkit
 *
 * Everything is drawn at Undertale's native "art pixel" resolution (320x240 worth of
 * pixels) onto small offscreen canvases, then displayed at exactly 2x so every art
 * pixel becomes a crisp 2x2 block on the 640x480 screen.
 *
 * This file holds the shared pixel helpers, the tiny pixel font, the UI sprites, and two
 * registries that the content files fill in:
 *  - CharacterArt: one file per character in src/characters/ -> spriteManager.characters[name]
 *  - PropArt: furniture and fixtures in src/props/ -> spriteManager.env[name]
 */

/**
 * Characters. CharacterArt.define(name, build): build(S) gets the spriteManager and returns
 *   walk:      { down, up, left, right } arrays of frames (frame 0 = standing, then walk frames);
 *              a missing direction falls back to `down`
 *   baseline:  y offset (screen px from the sprite's top) where the feet touch the floor
 *   feet:      { x, y, w, h } collision box from the sprite's top-left, used when this
 *              character is the player (optional)
 *   battle:    { idle, hit, fallen } battle poses (optional)
 *   portraits: { expression: canvas } dialogue / battle portraits (optional)
 * All of these canvases are already at screen size (2x).
 */
const CharacterArt = {
  builders: {},

  define(name, build) {
    CharacterArt.builders[name] = build;
  },

  buildAll(S) {
    const characters = {};
    Object.keys(CharacterArt.builders).forEach((name) => { characters[name] = CharacterArt.builders[name](S); });
    return characters;
  }
};

/**
 * Environment props. PropArt.define(name, build): build(S) returns one canvas drawn in art
 * pixels (1x); rooms place it by name with an object's `art` / `prop`.
 *
 * Props made with S.makeProp(w, h, draw) get a 1px margin so the black outline wraps all four
 * sides: place those at (x - 1, y - 1). draw(ctx, R, P) receives R(x, y, w, h, color) and
 * P(x, y, color) helpers.
 */
const PropArt = {
  builders: {},

  define(name, build) {
    PropArt.builders[name] = build;
  },

  buildAll(S) {
    const env = {};
    Object.keys(PropArt.builders).forEach((name) => { env[name] = PropArt.builders[name](S); });
    return env;
  }
};

class SpriteManager {
  // ==========================================
  // CANVAS + PIXEL HELPERS
  // ==========================================
  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  // Draw pixel grid from an array of strings ('.' and ' ' are transparent)
  drawGrid(ctx, x, y, scale, colorMap, pattern) {
    for (let r = 0; r < pattern.length; r++) {
      const row = pattern[r];
      for (let c = 0; c < row.length; c++) {
        const char = row[c];
        if (char !== ' ' && char !== '.' && colorMap[char]) {
          ctx.fillStyle = colorMap[char];
          ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
        }
      }
    }
  }

  // Build a canvas from a pattern (1 char = 1 art pixel)
  fromPattern(pattern, colors) {
    const w = pattern.reduce((m, r) => Math.max(m, r.length), 0);
    const { canvas, ctx } = this.createCanvas(w, pattern.length);
    this.drawGrid(ctx, 0, 0, 1, colors, pattern);
    return canvas;
  }

  // Mirror half-rows: "abc" -> "abccba" (used for symmetric front / back views)
  mirrorRows(halfRows) {
    return halfRows.map((r) => r + r.split('').reverse().join(''));
  }

  // Upscale a canvas by an integer factor (nearest neighbour)
  scaleCanvas(src, s) {
    const { canvas, ctx } = this.createCanvas(src.width * s, src.height * s);
    ctx.drawImage(src, 0, 0, src.width * s, src.height * s);
    return canvas;
  }

  // Rotates a canvas 90 degrees counter-clockwise (exact, keeps pixels crisp)
  rotateCCW(src) {
    const { canvas, ctx } = this.createCanvas(src.height, src.width);
    ctx.translate(0, src.width);
    ctx.rotate(-Math.PI / 2);
    ctx.drawImage(src, 0, 0);
    return canvas;
  }

  flipH(src) {
    const { canvas, ctx } = this.createCanvas(src.width, src.height);
    ctx.translate(src.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(src, 0, 0);
    return canvas;
  }

  // Adds a 1px outline around every opaque pixel (Undertale style black outline)
  outline(src, color = '#000000') {
    const w = src.width;
    const h = src.height;
    const { canvas, ctx } = this.createCanvas(w, h);
    ctx.drawImage(src, 0, 0);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const out = new Uint8ClampedArray(d);
    const rgb = this.hexToRgb(color);
    const opaque = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (opaque(x, y)) continue;
        if (opaque(x - 1, y) || opaque(x + 1, y) || opaque(x, y - 1) || opaque(x, y + 1)) {
          const i = (y * w + x) * 4;
          out[i] = rgb[0]; out[i + 1] = rgb[1]; out[i + 2] = rgb[2]; out[i + 3] = 255;
        }
      }
    }
    ctx.putImageData(new ImageData(out, w, h), 0, 0);
    return canvas;
  }

  hexToRgb(hex) {
    const v = parseInt(hex.replace('#', ''), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  // Simple pixel primitives (art pixel units)
  px(ctx, x, y, c) { ctx.fillStyle = c; ctx.fillRect(x, y, 1, 1); }
  rect(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  disc(ctx, cx, cy, r, c) {
    ctx.fillStyle = c;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r + r * 0.6) ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }
  ellipse(ctx, cx, cy, rx, ry, c) {
    ctx.fillStyle = c;
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        if ((x * x) / (rx * rx + 0.6 * rx) + (y * y) / (ry * ry + 0.6 * ry) <= 1) ctx.fillRect(cx + x, cy + y, 1, 1);
      }
    }
  }

  // Draws a prop into a canvas with a 1px transparent margin so the black
  // outline wraps all four sides. Place the result at (x - 1, y - 1).
  makeProp(w, h, draw, opts = {}) {
    const { canvas, ctx } = this.createCanvas(w + 2, h + 2);
    ctx.translate(1, 1);
    draw(ctx, (x, y, ww, hh, c) => this.rect(ctx, x, y, ww, hh, c), (x, y, c) => this.px(ctx, x, y, c));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return opts.shadow ? this.outlineKeepShadow(canvas) : this.outline(canvas);
  }

  // ==========================================
  // TINY 3x5 PIXEL FONT (house number)
  // ==========================================
  getGlyphs() {
    if (this.glyphs) return this.glyphs;
    const g = {
      A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
      C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
      E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
      G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
      I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
      K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
      M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'], N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
      O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
      Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
      S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
      U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
      W: ['#...#', '#...#', '#.#.#', '##.##', '#...#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
      Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
      0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
      2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
      4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
      6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
      8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
      ' ': ['...', '...', '...', '...', '...']
    };
    this.glyphs = g;
    return g;
  }

  // Glyphs are 5 rows tall and 3-5 columns wide; letters are spaced by 1 pixel.
  textWidth(text) {
    const g = this.getGlyphs();
    let w = 0;
    for (const ch of text.toUpperCase()) w += (g[ch] || g[' '])[0].length + 1;
    return Math.max(0, w - 1);
  }

  // Draws text in art pixels at (x, y) on a 1x canvas
  drawText(ctx, text, x, y, color) {
    const g = this.getGlyphs();
    ctx.fillStyle = color;
    let cx = x;
    for (const ch of text.toUpperCase()) {
      const glyph = g[ch] || g[' '];
      const gw = glyph[0].length;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < gw; c++) {
          if (glyph[r][c] === '#') ctx.fillRect(cx + c, y + r, 1, 1);
        }
      }
      cx += gw + 1;
    }
  }

  init() {
    this.characters = CharacterArt.buildAll(this);
    this.generateEnvironmentSprites();
    this.generateUISprites();
  }

  // Looks up a portrait by 'character/expression', e.g. 'jaydon/blush' (undefined if missing)
  portrait(ref) {
    const [name, expr] = String(ref).split('/');
    const c = this.characters[name];
    return c && c.portraits ? c.portraits[expr] : undefined;
  }

  // Overlays a buffalo-plaid grid on every pixel of `baseColor` in a canvas.
  applyPlaid(src, baseColor, period) {
    const w = src.width;
    const h = src.height;
    const { canvas, ctx } = this.createCanvas(w, h);
    ctx.drawImage(src, 0, 0);
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    const base = this.hexToRgb(baseColor);
    const shade = this.hexToRgb('#5e1111');
    const black = this.hexToRgb('#1a1a1a');
    const half = period / 2;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        const isBase = d[i] === base[0] && d[i + 1] === base[1] && d[i + 2] === base[2] && d[i + 3] > 0;
        const isShade = d[i] === shade[0] && d[i + 1] === shade[1] && d[i + 2] === shade[2] && d[i + 3] > 0;
        if (!isBase && !isShade) continue;
        const vx = Math.floor(x / half) % 2 === 1;
        const hy = Math.floor(y / half) % 2 === 1;
        let c = base;
        if (vx && hy) c = black;
        else if (vx || hy) c = shade;
        if (isShade && c === base) c = shade;
        d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
      }
    }
    ctx.putImageData(img, 0, 0);
    return canvas;
  }

  // ==========================================
  // ENVIRONMENT PROPS (1x art pixel canvases, defined in src/props/)
  // ==========================================
  generateEnvironmentSprites() {
    this.env = PropArt.buildAll(this);
  }

  // Outline only the opaque (non-shadow) pixels of a prop that has a soft floor shadow.
  outlineKeepShadow(src) {
    const w = src.width;
    const h = src.height;
    const { canvas: solid, ctx: sctx } = this.createCanvas(w, h);
    sctx.drawImage(src, 0, 0);
    const img = sctx.getImageData(0, 0, w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      if (img.data[i + 3] < 200) img.data[i + 3] = 0;
    }
    sctx.putImageData(img, 0, 0);
    const outlined = this.outline(solid);
    const { canvas, ctx } = this.createCanvas(w, h);
    ctx.drawImage(src, 0, 0);
    ctx.drawImage(outlined, 0, 0);
    return canvas;
  }

  // ==========================================
  // UI SPRITES (Heart SOUL, Save Star)
  // ==========================================
  generateUISprites() {
    this.ui = {};

    // 1. Red SOUL Heart (16x16)
    const { canvas: soul, ctx: sCtx } = this.createCanvas(16, 16);
    const soulPat = [
      '  RRR   RRR  ',
      ' RRRRR RRRRR ',
      'RRRRRRRRRRRRR',
      'RRRRRRRRRRRRR',
      ' RRRRRRRRRRR ',
      '  RRRRRRRRR  ',
      '   RRRRRRR   ',
      '    RRRRR    ',
      '     RRR     ',
      '      R      '
    ];
    this.drawGrid(sCtx, 1, 3, 1, { R: '#ff0000' }, soulPat);
    this.ui.soul = soul;

    // 2. Yellow Save Star (16x16), outlined five-point star
    const starPat = [
      '.......K........',
      '......KYK.......',
      '......KYK.......',
      '.....KYYYK......',
      'KKKKKKYYYKKKKKK.',
      'KYYYYYYYYYYYYYK.',
      '.KYYYYYYYYYYYK..',
      '..KYYYYYYYYYK...',
      '...KYYYYYYYK....',
      '...KYYYYYYYK....',
      '..KYYYYKYYYYK...',
      '..KYYYK.KYYYK...',
      '.KYYYK...KYYYK..',
      '.KYKK.....KKYK..',
      '.KK.........KK..',
      '................'
    ];
    this.ui.saveStar = this.fromPattern(starPat, { K: '#000000', Y: '#ffff00' });
  }
}

window.spriteManager = new SpriteManager();
