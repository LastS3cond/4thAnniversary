/**
 * Undertale 4th Anniversary - Procedural Pixel Art Sprite Generator
 *
 * Everything is drawn at Undertale's native "art pixel" resolution (320x240 worth of
 * pixels) onto small offscreen canvases, then displayed at exactly 2x so every art
 * pixel becomes a crisp 2x2 block on the 640x480 screen.
 *
 *  - Characters (Mallika, Jaydon) are pixel patterns with black Undertale outlines.
 *  - The Jaydon battle sprite + portraits share one procedural face so they always match.
 *  - Props are small 1x canvases composed into the room backgrounds by maps.js.
 */

class SpriteManager {
  constructor() {
    this.cache = {};
  }

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
    this.generateMallikaSprites();
    this.generateJaydonOverworld();
    this.generateJaydonBattleSprite();
    this.generateJaydonPortraits();
    this.generateEnvironmentSprites();
    this.generateUISprites();
  }

  // ==========================================
  // MALLIKA (Protagonist, 20x30 art px -> 40x60 on screen)
  // Long wavy dark brunette hair, rose glasses, denim overalls with
  // silver buckles over an olive tube top, rolled cuffs, white socks.
  // ==========================================
  generateMallikaSprites() {
    const colors = {
      K: '#000000',
      H: '#2c1a12', h: '#4d3021',            // hair + wave highlight
      S: '#b8794f', s: '#93593a',            // warm brown skin
      E: '#1e0f08',                           // dark brown eyes
      G: '#b34a5e',                           // rose glasses frames
      M: '#7a3a2e',                           // gentle mouth
      T: '#556b2f', t: '#3d4f20',            // olive tube top
      D: '#3f66a3', d: '#2b4a7c', L: '#7194c9', // denim, shade, rolled cuff
      B: '#dde3ea',                           // silver buckles
      W: '#f6f6f6', w: '#c9c9c9'             // white socks
    };

    // ---------- FRONT (DOWN) : left halves, mirrored ----------
    const frontTop = this.mirrorRows([
      '......KKKK',
      '....KKHHHH',
      '...KHHHHhh',
      '..KHHHHhHH',
      '..KHHHHHHH',
      '.KHHHHHHHH',
      '.KHHHHHSSS',
      '.KHhHSSSSS',
      '.KHHHSGGGS',
      '.KHHhSGEGS',
      '.KHhHSSSSS',
      '.KHHHSSSSS',
      '.KhHHHSSSM',
      '.KHHHHHSSS',
      '.KHhHHHKss',
      '.KHHHKSSSD',
      '.KhHKSTTDT',
      '.KHHKSTBDD',
      '.KHhKStDDD',
      '..KHKSDDDD',
      '..KKKsDDDD',
      '....KsDDDd',
      '....KKDDDD'
    ]);
    // Legs: [idle, step-left, step-right]. Straight under the body, no splay.
    const frontLegs = [
      [
        '.....KDDDKKDDDK.....',
        '.....KDDDKKDDDK.....',
        '.....KDDdKKdDDK.....',
        '.....KLLLKKLLLK.....',
        '.....KWWWKKWWWK.....',
        '.....KWWwKKwWWK.....',
        '.....KKKKKKKKKK.....'
      ],
      [
        '.....KDDDKKDDDK.....',
        '.....KDDdKKDDDK.....',
        '.....KLLLKKdDDK.....',
        '.....KWWWKKLLLK.....',
        '.....KWWwKKWWWK.....',
        '.....KKKKKKwWWK.....',
        '..........KKKKK.....'
      ],
      [
        '.....KDDDKKDDDK.....',
        '.....KDDDKKdDDK.....',
        '.....KDDdKKLLLK.....',
        '.....KLLLKKWWWK.....',
        '.....KWWWKKwWWK.....',
        '.....KWWwKKKKKK.....',
        '.....KKKKK..........'
      ]
    ];

    // ---------- BACK (UP) : hair cascades down the back ----------
    const backTop = this.mirrorRows([
      '......KKKK',
      '....KKHHHH',
      '...KHHHHhh',
      '..KHHHHhHH',
      '..KHHHHHHH',
      '.KHHHHHHHH',
      '.KHHHhHHHH',
      '.KHHHHhHHH',
      '.KHhHHHhHH',
      '.KHHHHhHHH',
      '.KHHHhHHHH',
      '.KHhHHhHHH',
      '.KHHHHHhHH',
      '.KHHHHhHHH',
      '.KHhHhHHHH',
      '.KHHKSHhHH',
      '.KhHKSHHhH',
      '.KHHKSHhHH',
      '.KHhKSHHhH',
      '..KHKSHhHH',
      '..KKKsKHHH',
      '....KsDKHH',
      '....KKDDKK'
    ]);
    // ---------- SIDE (LEFT) ----------
    const sideTop = [
      '.......KKKKKK.......',
      '.....KKHHHHHHKK.....',
      '....KHHHhhhHHHHK....',
      '...KHHhHHHHHHHHHK...',
      '...KHHHHHHHHHHHHK...',
      '..KHHHHHHHHhHHHHHK..',
      '..KHSSSHHHHHHhHHHK..',
      '.KSSSSSSHHHHHHhHHK..',
      '.KSGGGSSHHhHHHhHHK..',
      'KSSGEGGGHHHhHHHhHK..',
      '.KSSSSSSHHHHhHHHhK..',
      '.KSSSSSSHHHHhHHHHK..',
      '..KMSSSSHHHhHHHhHK..',
      '..KSSSSHHHhHHHhHHK..',
      '...KKssKHHHhHHhHHK..',
      '...KTSDSKHHhHHHhHK..',
      '...KTDDSKHHHhHHHK...',
      '...KBDDSKHHhHHHK....',
      '...KDDDSKHHHhHK.....',
      '...KDDDSKHHhHK......',
      '...KDDDsKKHHK.......',
      '...KDDDDDKKK........',
      '....KDDDDDDK........'
    ];
    const sideLegs = [
      [
        '....KDDDDDK.........',
        '....KDDDDDK.........',
        '....KDDdDDK.........',
        '....KLLLLLK.........',
        '....KWWWWWK.........',
        '...KWWWWWwK.........',
        '...KKKKKKKK.........'
      ],
      [
        '....KDDKDDDK........',
        '...KDDDKKDDK........',
        '...KDDdK.KLLK.......',
        '..KLLLK..KWWK.......',
        '..KWWWK..KWwK.......',
        '.KWWWwK..KKKK.......',
        '.KKKKKK.............'
      ],
      [
        '....KDDDDDK.........',
        '....KDDKDDDK........',
        '...KLLK.KDDK........',
        '...KWWK.KLLLK.......',
        '...KWWK.KWWWK.......',
        '...KKKK.KWWWwK......',
        '........KKKKKK......'
      ]
    ];

    this.mallika = { down: [], up: [], left: [], right: [] };
    for (let i = 0; i < 3; i++) {
      const down = this.fromPattern(frontTop.concat(frontLegs[i]), colors);
      const up = this.fromPattern(backTop.concat(frontLegs[i]), colors);
      const left = this.fromPattern(sideTop.concat(sideLegs[i]), colors);
      this.mallika.down.push(this.scaleCanvas(down, 2));
      this.mallika.up.push(this.scaleCanvas(up, 2));
      this.mallika.left.push(this.scaleCanvas(left, 2));
      this.mallika.right.push(this.scaleCanvas(this.flipH(left), 2));
    }
  }

  // ==========================================
  // JAYDON OVERWORLD (20x31 art px -> 40x62 on screen)
  // Curly dark-brown hair ending at the ears, thin grey glasses, heather-grey
  // crewneck long sleeve, red/black buffalo plaid pajama pants, barefoot.
  // ==========================================
  generateJaydonOverworld() {
    const colors = {
      K: '#000000',
      H: '#2b1810', h: '#4a2c1c',
      S: '#f1c6a4', s: '#d6a17f',
      G: '#4b5563', E: '#2f8fcb',
      M: '#9c5a4c',
      T: '#7a808b', t: '#5c626d', u: '#979ca6',
      C: '#e8c547',
      R: '#991b1b', r: '#5e1111', X: '#1a1a1a'
    };
    const front = [
      '......KKKKKKKK......',
      '....KKHhHHhHHhKK....',
      '...KHhHHhHHhHHhHK...',
      '..KHHHhHHHHhHHHhHK..',
      '..KHhHHHhHHHHhHHHK..',
      '.KHHHHhHHHhHHHHhHHK.',
      '.KHhHHHHhHHHhHHHhHK.',
      '.KHHHhSShSShSShHHHK.',
      '.KHHSSSSSSSSSSSSHHK.',
      '..KHSGGGGSSGGGGSHK..',
      '..KSSGSEGGGGESGSSK..',
      '..KSSSSSSSSSSSSSSK..',
      '...KSSSSSMMSSSSSK...',
      '....KSSSSSSSSSSK....',
      '.....KKsSSSSsKK.....',
      '...KKuTTTTTTTTuKK...',
      '..KTTTTTTTTTTTTTTK..',
      '..KTTTTTTTTTCTTTTK..',
      '..KTTKTTTTTTTTKTTK..',
      '..KTTKTTTTTTTTKTTK..',
      '..KtTKTTTTTTTTKTtK..',
      '..KtTKTTTTTTTTKTtK..',
      '..KSSKttttttttKSSK..',
      '..KSsKRRrRRrRRKsSK..',
      '...KKKRrRRRRrRKKK...',
      '.....KRRRRRRRRK.....',
      '.....KRRRKKRRRK.....',
      '.....KrRRKKRRrK.....',
      '.....KSSSKKSSSK.....',
      '....KSSSsKKsSSSK....',
      '....KKKKKKKKKKKK....'
    ];
    let down = this.fromPattern(front, colors);
    down = this.applyPlaid(down, colors.R, 4);

    const side = [
      '.......KKKKKK.......',
      '.....KKHhHHhHKK.....',
      '....KHhHHHhHHhHK....',
      '...KHHHhHHHHhHHHK...',
      '...KHhHHHhHHHHhHK...',
      '..KHHHHhHHHhHHHHK...',
      '..KHhHHHHhHHHhHHK...',
      '..KhSShHHHhHHHhHK...',
      '.KSSSSSSHHHHhHHHK...',
      '.KSGGGGSSHHHHHHK....',
      'KSSGESGGGSSHHHHK....',
      '.KSSSSSSSSsSHHK.....',
      '.KMSSSSSSSSSKK......',
      '..KSSSSSSSSK........',
      '...KKsSSSKK.........',
      '..KuTTTTTKK.........',
      '..KTTTTTTTTK........',
      '..KTTTTTTTTK........',
      '..KTTTKTTTTK........',
      '..KTTTKTTTTK........',
      '..KTTTKTTTTK........',
      '..KTTTKtTTTK........',
      '..KtttKSStK.........',
      '...KRRKSsRK.........',
      '...KRRRKKRK.........',
      '...KRRRRRRK.........',
      '...KRRKRRRK.........',
      '...KrRKKRrK.........',
      '...KSSK.KSSK........',
      '..KSSsK.KSSsK.......',
      '..KKKKK.KKKKK.......'
    ];
    let left = this.fromPattern(side, colors);
    left = this.applyPlaid(left, colors.R, 4);

    this.jaydonOW = {
      down: this.scaleCanvas(down, 2),
      left: this.scaleCanvas(left, 2),
      right: this.scaleCanvas(this.flipH(left), 2)
    };
    // Back-compat alias
    this.jaydonOverworld = this.jaydonOW.down;
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
  // JAYDON FACE (shared by the battle sprite and every portrait)
  // Head occupies roughly x: 19..52, y: 1..36 relative to (ox, oy).
  // ==========================================
  drawJaydonHead(ctx, ox, oy, expr) {
    const P = {
      H: '#2b1810', h: '#4a2c1c', j: '#38200f',
      S: '#f2c7a5', s: '#dca787', r: '#c98a74',
      G: '#4b5563', g: '#8a94a3',
      B: '#38bdf8', b: '#0f8fd0', W: '#ffffff',
      M: '#8e4a3e', m: '#5c2620',
      P: '#ff6b81'
    };
    const R = (x, y, w, h, c) => this.rect(ctx, ox + x, oy + y, w, h, c);
    const D = (x, y, c) => this.px(ctx, ox + x, oy + y, c);
    const disc = (x, y, rr, c) => this.disc(ctx, ox + x, oy + y, rr, c);

    // --- Ears (hair stops cleanly at ear level) ---
    R(21, 19, 3, 7, P.S); R(48, 19, 3, 7, P.S);
    D(22, 21, P.s); D(22, 22, P.s); D(22, 23, P.s);
    D(49, 21, P.s); D(49, 22, P.s); D(49, 23, P.s);

    // --- Face shape ---
    R(24, 9, 24, 21, P.S);
    R(25, 30, 22, 1, P.S);
    R(26, 31, 20, 1, P.S);
    R(28, 32, 16, 1, P.S);
    R(31, 33, 10, 1, P.S);
    // soft jaw shading
    R(24, 26, 1, 4, P.s); R(47, 26, 1, 4, P.s);
    R(25, 30, 1, 1, P.s); R(46, 30, 1, 1, P.s);

    // --- Curly hair mass ---
    R(23, 4, 26, 9, P.H);
    R(21, 7, 30, 9, P.H);
    R(20, 11, 3, 8, P.H); R(49, 11, 3, 8, P.H);
    const curls = [
      [24, 5, 3], [30, 3, 3], [36, 3, 3], [42, 3, 3], [47, 5, 3],
      [21, 9, 3], [51, 9, 3], [20, 14, 2], [52, 14, 2],
      [27, 1, 2], [39, 1, 2], [33, 1, 2], [45, 2, 2]
    ];
    curls.forEach(([x, y, rr]) => disc(x, y, rr, P.H));
    // Fringe curls tumbling over the forehead
    const fringe = [[26, 12, 2], [31, 13, 2], [37, 12, 2], [42, 13, 2], [46, 11, 2]];
    fringe.forEach(([x, y, rr]) => disc(x, y, rr, P.H));
    // Curl highlights (little arcs)
    const hi = [
      [23, 4], [24, 3], [29, 2], [30, 1], [35, 1], [36, 0], [41, 1], [42, 1], [46, 3], [47, 3],
      [20, 8], [21, 7], [50, 8], [51, 7], [25, 11], [30, 12], [36, 11], [41, 12], [45, 10],
      [27, 7], [33, 6], [39, 7], [44, 6], [24, 9], [48, 9], [32, 9], [38, 9]
    ];
    hi.forEach(([x, y]) => D(x, y, P.h));
    const mid = [[28, 9], [34, 8], [40, 9], [26, 6], [45, 7], [22, 12], [50, 12]];
    mid.forEach(([x, y]) => D(x, y, P.j));

    // --- Eyebrows ---
    if (expr !== 'surprised') {
      R(27, 17, 5, 1, P.H); R(40, 17, 5, 1, P.H);
    } else {
      R(27, 16, 5, 1, P.H); R(40, 16, 5, 1, P.H);
    }

    // --- Eyes (sky blue with white glints, no black) ---
    const eyeL = 28;
    const eyeR = 41;
    if (expr === 'laugh') {
      // happy crinkled arcs
      [[eyeL, 22], [eyeL + 1, 21], [eyeL + 2, 21], [eyeL + 3, 22]].forEach(([x, y]) => D(x, y, P.b));
      [[eyeR, 22], [eyeR + 1, 21], [eyeR + 2, 21], [eyeR + 3, 22]].forEach(([x, y]) => D(x, y, P.b));
    } else if (expr === 'cough' || expr === 'dazed') {
      // squeezed shut  > <
      [[eyeL, 20], [eyeL + 1, 21], [eyeL + 2, 22], [eyeL + 1, 23], [eyeL, 24]].forEach(([x, y]) => D(x + 1, y, P.b));
      [[eyeR + 3, 20], [eyeR + 2, 21], [eyeR + 1, 22], [eyeR + 2, 23], [eyeR + 3, 24]].forEach(([x, y]) => D(x - 1, y, P.b));
    } else if (expr === 'surprised') {
      R(eyeL, 20, 4, 4, P.B); R(eyeR, 20, 4, 4, P.B);
      D(eyeL, 20, P.W); D(eyeL + 1, 20, P.W); D(eyeL, 21, P.W);
      D(eyeR, 20, P.W); D(eyeR + 1, 20, P.W); D(eyeR, 21, P.W);
      D(eyeL + 3, 23, P.b); D(eyeR + 3, 23, P.b);
    } else {
      // neutral / blush: soft eyes (blush glances aside)
      const shift = expr === 'blush' ? 1 : 0;
      R(eyeL + shift, 21, 3, 3, P.B); R(eyeR + shift, 21, 3, 3, P.B);
      D(eyeL + shift, 21, P.W); D(eyeR + shift, 21, P.W);
      D(eyeL + shift + 2, 23, P.b); D(eyeR + shift + 2, 23, P.b);
    }

    // --- Glasses (soft slate rectangular frames) ---
    const frame = (x) => {
      R(x, 19, 8, 1, P.G); R(x, 25, 8, 1, P.G);
      R(x, 19, 1, 7, P.G); R(x + 7, 19, 1, 7, P.G);
      D(x + 1, 20, P.g);
    };
    frame(26); frame(39);
    R(34, 20, 5, 1, P.G);           // bridge
    R(24, 20, 2, 1, P.G); R(47, 20, 2, 1, P.G); // temples

    // --- Nose ---
    D(35, 26, P.s); D(36, 27, P.s); D(35, 27, P.r);

    // --- Blush cheeks ---
    if (expr === 'blush') {
      R(26, 27, 4, 2, P.P); R(42, 27, 4, 2, P.P);
      D(26, 27, '#ff9aa9'); D(42, 27, '#ff9aa9');
    }

    // --- Mouth ---
    if (expr === 'surprised') {
      // clean round 'o'
      R(35, 29, 2, 1, P.m); R(35, 32, 2, 1, P.m);
      R(34, 30, 1, 2, P.m); R(37, 30, 1, 2, P.m);
      R(35, 30, 2, 2, '#3a1210');
    } else if (expr === 'laugh') {
      R(32, 29, 8, 1, P.m);
      R(33, 30, 6, 2, '#6b1f1c');
      R(33, 30, 6, 1, '#ffffff');
      R(34, 32, 4, 1, P.m);
      D(32, 30, P.m); D(39, 30, P.m); D(33, 31, P.m); D(38, 31, P.m);
    } else if (expr === 'cough') {
      R(35, 30, 2, 2, P.m);
    } else if (expr === 'dazed') {
      // woozy zigzag mouth
      [[32, 30], [33, 29], [34, 30], [35, 29], [36, 30], [37, 29], [38, 30]].forEach(([x, y]) => D(x, y, P.m));
    } else if (expr === 'blush') {
      // small flustered wobble smile
      D(32, 29, P.M); D(33, 30, P.M); D(34, 30, P.M); D(35, 29, P.M);
      D(36, 29, P.M); D(37, 30, P.M); D(38, 30, P.M); D(39, 29, P.M);
    } else {
      // gentle, restrained smile
      D(32, 29, P.M); R(33, 30, 6, 1, P.M); D(39, 29, P.M);
    }

    // --- Cough cloud puff ---
    if (expr === 'cough') {
      const cl = '#e9edf2';
      const cs = '#b8c0cc';
      disc(44, 32, 2, cs); disc(48, 30, 3, cs); disc(52, 32, 2, cs);
      disc(44, 31, 2, cl); disc(48, 29, 3, cl); disc(52, 31, 2, cl);
    }
  }

  // ==========================================
  // JAYDON BATTLE SPRITE (72x84 art px -> 144x168 on screen)
  // ==========================================
  buildJaydonBattle(expr) {
    const { canvas, ctx } = this.createCanvas(72, 84);
    const T = '#7a808b';
    const t = '#5e646f';
    const u = '#9aa0aa';
    const S = '#f2c7a5';
    const s = '#dca787';
    const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
    const D = (x, y, c) => this.px(ctx, x, y, c);

    // --- Pants (drawn first, plaid applied later) ---
    R(23, 61, 26, 6, '#991b1b');
    R(23, 66, 12, 13, '#991b1b');
    R(37, 66, 12, 13, '#991b1b');
    R(35, 66, 2, 2, '#991b1b');
    R(23, 66, 2, 13, '#5e1111'); R(37, 66, 2, 13, '#5e1111');

    // --- Bare feet ---
    R(23, 79, 11, 3, S); R(38, 79, 11, 3, S);
    R(22, 81, 12, 2, S); R(38, 81, 12, 2, S);
    D(23, 82, s); D(25, 82, s); D(27, 82, s); D(44, 82, s); D(46, 82, s); D(48, 82, s);
    R(23, 79, 11, 1, s); R(38, 79, 11, 1, s);

    // --- Torso (longer, relaxed) ---
    R(23, 38, 26, 25, T);
    R(21, 39, 30, 4, T);
    R(22, 37, 28, 2, T);
    // knit shading + hem
    R(23, 58, 26, 1, t); R(23, 61, 26, 2, t);
    R(26, 44, 1, 12, t); R(45, 44, 1, 12, t);
    R(24, 39, 24, 1, u);
    // heather speckle
    [[28, 47], [33, 52], [39, 45], [42, 54], [30, 41], [44, 49], [36, 57], [26, 53]].forEach(([x, y]) => D(x, y, u));
    // chest emblem (yellow + blue crest)
    R(40, 43, 4, 4, '#e8c547'); D(41, 44, '#2d4f9e'); D(42, 45, '#2d4f9e'); D(41, 45, '#2d4f9e'); D(42, 44, '#f6dd7c');

    // --- Arms: long sleeves resting at his sides ---
    R(15, 41, 6, 18, T); R(51, 41, 6, 18, T);
    R(16, 40, 5, 1, T); R(51, 40, 5, 1, T);
    R(15, 41, 1, 18, t); R(56, 41, 1, 18, t);
    R(17, 42, 1, 14, u); R(54, 42, 1, 14, u);
    R(15, 57, 6, 2, t); R(51, 57, 6, 2, t);   // cuffs
    // hands
    R(15, 59, 6, 6, S); R(51, 59, 6, 6, S);
    R(16, 65, 4, 1, S); R(52, 65, 4, 1, S);
    D(16, 63, s); D(18, 63, s); D(53, 63, s); D(55, 63, s);
    R(15, 59, 6, 1, s); R(51, 59, 6, 1, s);

    // --- Neck + crew collar ---
    R(32, 33, 8, 5, S);
    R(32, 33, 8, 2, s);
    R(30, 37, 12, 1, t); R(31, 38, 10, 1, t);

    // --- Head ---
    this.drawJaydonHead(ctx, 0, 0, expr);

    let out = this.applyPlaid(canvas, '#991b1b', 6);
    out = this.outline(out, '#000000');
    return out;
  }

  generateJaydonBattleSprite() {
    this.jaydonBattle = this.scaleCanvas(this.buildJaydonBattle('neutral'), 2);
    this.jaydonBattleHit = this.scaleCanvas(this.buildJaydonBattle('surprised'), 2);
    // Knocked flat on the floor after a hit (head to the left)
    this.jaydonBattleFallen = this.scaleCanvas(this.rotateCCW(this.buildJaydonBattle('dazed')), 2);
  }

  // ==========================================
  // JAYDON DIALOGUE PORTRAITS (40x40 art px -> 80x80 on screen)
  // neutral, blush, surprised, laugh, cough
  // ==========================================
  generateJaydonPortraits() {
    this.portraits = {};
    ['neutral', 'blush', 'surprised', 'laugh', 'cough', 'dazed'].forEach((expr) => {
      const { canvas, ctx } = this.createCanvas(40, 40);
      // Shoulders of his heather-grey long sleeve
      this.rect(ctx, 2, 37, 36, 3, '#7a808b');
      this.rect(ctx, 5, 36, 30, 1, '#7a808b');
      this.rect(ctx, 14, 36, 12, 1, '#5e646f');
      this.rect(ctx, 16, 33, 8, 4, '#f2c7a5');
      this.rect(ctx, 16, 33, 8, 2, '#dca787');
      this.drawJaydonHead(ctx, -16, 2, expr);
      const c = this.outline(canvas, '#000000');
      this.portraits[expr] = this.scaleCanvas(c, 2);
    });
  }

  // ==========================================
  // ENVIRONMENT PROPS (1x art pixel canvases)
  // ==========================================
  generateEnvironmentSprites() {
    this.env = {};

    // ---------- Punching bag station (24 x 36) ----------
    this.env.punchBag = this.makeProp(24, 36, (ctx, R, P) => {
      // floor shadow
      this.ellipse(ctx, 12, 32, 10, 2, 'rgba(0,0,0,0.28)');
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
      this.ellipse(ctx, 5, 31, 3, 1, '#4a5058');
      // sandbags weighing the legs
      R(0, 29, 6, 4, '#b89c72'); R(18, 29, 6, 4, '#b89c72');
      R(0, 29, 6, 1, '#d3b98e'); R(18, 29, 6, 1, '#d3b98e');
      R(2, 30, 1, 3, '#8f7552'); R(21, 30, 1, 3, '#8f7552');
    }, { shadow: true });

    // ---------- Red L-sectional couch: the living room centerpiece (88 x 34) ----------
    this.env.couch = this.makeProp(88, 34, (ctx, R) => {
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
    });

    // ---------- Coffee table inside the L: papers + notebook strewn about (38 x 15) ----------
    this.env.coffeeTable = this.makeProp(38, 15, (ctx, R, P) => {
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
    });

    // ---------- TV stand + TV seen from behind (TV faces north toward the couch) (76 x 22) ----------
    this.env.tvStand = this.makeProp(76, 22, (ctx, R) => {
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
    });

    // ---------- White folding table + folding bench + duckling puzzle (24 x 68) ----------
    this.env.puzzleTable = this.makeProp(24, 68, (ctx, R, P) => {
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
    });

    // ---------- White shoe rack with New Balances (14 x 22) ----------
    this.env.shoeRack = this.makeProp(14, 22, (ctx, R, P) => {
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
    });

    // ---------- Sliding glass door with vertical blinds (32 x 26) ----------
    {
      const { canvas, ctx } = this.createCanvas(32, 26);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 32, 26, '#9aa1aa');
      R(2, 2, 13, 24, '#131a2c'); R(17, 2, 13, 24, '#131a2c');
      R(2, 2, 13, 1, '#22304d'); R(17, 2, 13, 1, '#22304d');
      // a few faint stars outside
      this.px(ctx, 5, 8, '#cfd8ea'); this.px(ctx, 10, 15, '#cfd8ea'); this.px(ctx, 7, 20, '#cfd8ea');
      // vertical blinds gathered on the right pane
      for (let x = 19; x < 30; x += 2) { R(x, 2, 1, 24, '#e6e4dc'); R(x + 1, 2, 1, 24, '#c4c1b6'); }
      R(0, 0, 32, 1, '#c6ccd3');
      R(15, 2, 2, 24, '#7d848e');
      R(13, 12, 1, 4, '#d7dbe0');
      this.env.slidingDoor = canvas;
    }

    // ---------- Kitchen: south counter run pieces ----------
    // Each piece: front band (cabinet faces toward the room, north) + countertop.
    // Sink (20 x 23)
    {
      const { canvas, ctx } = this.createCanvas(20, 23);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
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
      this.px(ctx, 12, 13, '#c9a26a'); this.px(ctx, 5, 13, '#b5865a');
      R(8, 12, 2, 3, '#4f8ad8');
      // faucet on the south side pointing north into the basin
      R(8, 18, 2, 3, '#cdd3da'); R(8, 17, 2, 1, '#eef1f4'); R(7, 20, 4, 1, '#9aa1aa');
      // soap + gloves on the counter
      R(17, 16, 2, 3, '#2f86e0'); this.px(ctx, 17, 15, '#ffffff');
      R(0, 12, 2, 3, '#ec5c8d');
      this.env.sink = canvas;
    }
    // Dishwasher (16 x 23): black front, silver dial
    {
      const { canvas, ctx } = this.createCanvas(16, 23);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 16, 9, '#1f1f22');
      R(1, 6, 14, 2, '#2c2c31');
      R(1, 1, 14, 4, '#26262a');
      R(2, 5, 12, 1, '#9aa1aa');
      this.disc(ctx, 12, 3, 1, '#c9ced5'); this.px(ctx, 12, 3, '#ffffff');
      R(0, 8, 16, 1, '#111113');
      R(0, 9, 16, 14, '#ece2c8');
      R(0, 9, 16, 1, '#fbf5e6');
      R(0, 21, 16, 2, '#ddd2b6');
      this.env.dishwasher = canvas;
    }

    // ---------- Kitchen: east wall pieces (fronts face west) ----------
    // Fridge (28 x 27) - clean stainless double door
    {
      const { canvas, ctx } = this.createCanvas(28, 27);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 28, 27, '#c9ced5');
      R(0, 0, 13, 27, '#d9dde2');
      R(0, 13, 13, 1, '#9aa1aa');
      R(1, 0, 1, 27, '#eef0f3');
      R(10, 3, 1, 7, '#7f8790'); R(10, 16, 1, 7, '#7f8790');
      R(13, 0, 1, 27, '#9aa1aa');
      R(14, 0, 14, 2, '#b4bac2');
      R(0, 25, 28, 2, '#8d949d');
      this.env.fridge = canvas;
    }
    // Prep counter (28 x 20): cabinets + butcher block + spices
    {
      const { canvas, ctx } = this.createCanvas(28, 20);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 9, 20, '#6e4426');
      R(1, 1, 7, 8, '#7d4f2e'); R(1, 11, 7, 8, '#7d4f2e');
      R(6, 4, 1, 2, '#d9a93c'); R(6, 14, 1, 2, '#d9a93c');
      R(8, 0, 1, 20, '#4f2f1a');
      R(9, 0, 19, 20, '#ece2c8');
      R(9, 0, 1, 20, '#fbf5e6');
      R(12, 3, 8, 11, '#b98a54'); R(12, 3, 8, 1, '#d8ab70'); R(12, 13, 8, 1, '#8c6238');
      R(14, 7, 4, 1, '#8c6238');
      const jar = (x, y, c) => { R(x, y, 2, 3, c); this.px(ctx, x, y, '#ffffff'); };
      jar(22, 3, '#c8323a'); jar(25, 3, '#e0a43a'); jar(22, 8, '#5f8f3a'); jar(25, 8, '#8b5a2b');
      jar(22, 14, '#e0a43a');
      R(26, 0, 2, 20, '#ddd2b6');
      this.env.prepCounter = canvas;
    }
    // Stove + oven (28 x 35): white electric coil range, oven door faces west, backguard east
    {
      const { canvas, ctx } = this.createCanvas(28, 35);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
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
        this.disc(ctx, cx, cy, r, '#202022');
        this.disc(ctx, cx, cy, r - 1, '#4a4a4f');
        this.disc(ctx, cx, cy, Math.max(0, r - 2), '#202022');
      };
      coil(13, 8, 3); coil(13, 26, 3); coil(20, 9, 2); coil(20, 25, 2);
      // backguard (east) with knobs
      R(24, 0, 4, 35, '#e3e3dc');
      R(24, 0, 1, 35, '#c7c7c0');
      [5, 11, 23, 29].forEach((y) => R(25, y, 2, 2, '#55555a'));
      R(25, 16, 2, 3, '#1f1f22'); this.px(ctx, 25, 17, '#5cff8a');
      this.env.stove = this.outline(canvas);
    }
    // Corner counter (28 x 28) with a microwave on it: next to the oven, facing
    // west toward the sink, set back so the oven sticks out further than it does.
    {
      const { canvas, ctx } = this.createCanvas(28, 28);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
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
      this.px(ctx, 12, 10, '#5d6f84');
      R(12, 18, 2, 2, '#9aa1aa');
      this.px(ctx, 13, 18, '#5cff8a');
      this.env.cornerCounter = canvas;
    }

    // ---------- Kitchen wood cabinet run (south wall) generator ----------
    this.makeSouthCabinets = (w) => {
      const { canvas, ctx } = this.createCanvas(w, 23);
      const R = (x, y, ww, h, c) => this.rect(ctx, x, y, ww, h, c);
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
    };

    // ---------- "HAPPY ANNIVERSARY" ribbon banner (hung above the couch) ----------
    {
      const text = 'HAPPY ANNIVERSARY';
      const tw = this.textWidth(text);
      const w = tw + 14;
      this.env.banner = this.makeProp(w + 6, 11, (ctx, R, P) => {
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
        this.drawText(ctx, text, 3 + Math.floor((w - tw) / 2), 3, '#fff6e6');
      });
    }

    // ---------- Brick tile (16 x 8) ----------
    {
      const { canvas, ctx } = this.createCanvas(16, 8);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 16, 8, '#8b3a2b');
      R(0, 3, 16, 1, '#6a261a'); R(0, 7, 16, 1, '#6a261a');
      R(7, 0, 1, 3, '#6a261a'); R(15, 0, 1, 3, '#6a261a');
      R(3, 4, 1, 3, '#6a261a'); R(11, 4, 1, 3, '#6a261a');
      R(1, 0, 5, 1, '#9c4635'); R(12, 4, 3, 1, '#9c4635');
      R(8, 4, 3, 3, '#7e3324');
      this.env.brick = canvas;
    }
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
