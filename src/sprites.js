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

  // ==========================================
  // TINY 3x5 PIXEL FONT (door nameplates, house number)
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
    } else if (expr === 'cough') {
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
  }

  // ==========================================
  // JAYDON DIALOGUE PORTRAITS (40x40 art px -> 80x80 on screen)
  // neutral, blush, surprised, laugh, cough
  // ==========================================
  generateJaydonPortraits() {
    this.portraits = {};
    ['neutral', 'blush', 'surprised', 'laugh', 'cough'].forEach((expr) => {
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
    {
      const { canvas, ctx } = this.createCanvas(24, 36);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      // floor shadow
      this.ellipse(ctx, 12, 32, 10, 2, 'rgba(0,0,0,0.28)');
      // steel post + cantilever arm + brace
      R(4, 3, 2, 29, '#3b3f46'); R(4, 3, 1, 29, '#5f6670');
      R(4, 2, 14, 2, '#3b3f46'); R(4, 2, 14, 1, '#5f6670');
      for (let i = 0; i < 6; i++) this.px(ctx, 6 + i, 9 - i, '#3b3f46');
      // chain
      this.px(ctx, 15, 4, '#a9b0ba'); this.px(ctx, 15, 5, '#7c838d'); this.px(ctx, 15, 6, '#a9b0ba');
      this.px(ctx, 14, 7, '#7c838d'); this.px(ctx, 16, 7, '#7c838d');
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
      this.env.punchBag = this.outlineKeepShadow(canvas);
    }

    // ---------- Red L-sectional couch (38 x 28) ----------
    {
      const { canvas, ctx } = this.createCanvas(38, 28);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      const base = '#9e2a2b';
      const shade = '#7a1d22';
      const dark = '#57131a';
      const hi = '#bf4744';
      // backrest (long, along the north)
      R(0, 0, 38, 7, shade);
      R(1, 0, 36, 1, hi);
      R(0, 6, 38, 1, dark);
      // back cushion seams
      R(13, 1, 1, 5, dark); R(25, 1, 1, 5, dark);
      // main seat
      R(0, 7, 38, 8, base);
      R(0, 7, 38, 1, hi);
      R(13, 7, 1, 8, dark); R(25, 7, 1, 8, dark);
      // seat front face (right part)
      R(13, 15, 25, 3, dark);
      // chaise lounge projecting forward on the left
      R(0, 15, 13, 9, base);
      R(0, 15, 13, 1, shade);
      R(0, 24, 13, 4, dark);
      // arms
      R(0, 1, 3, 23, shade); R(0, 1, 1, 23, hi);
      R(35, 1, 3, 14, shade); R(37, 1, 1, 14, dark);
      R(0, 24, 3, 4, '#46101a'); R(35, 15, 3, 3, '#46101a');
      // throw pillow
      R(4, 2, 6, 5, '#e6d8b8'); R(4, 2, 6, 1, '#f6ecd4'); R(4, 6, 6, 1, '#bfae88');
      this.env.couch = this.outline(canvas);
    }

    // ---------- Coffee table with strewn papers + notebook (22 x 14) ----------
    {
      const { canvas, ctx } = this.createCanvas(22, 14);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 22, 10, '#5e3a22');
      R(0, 0, 22, 1, '#7a4f31');
      R(0, 10, 22, 2, '#3f2615');
      R(1, 12, 2, 2, '#3f2615'); R(19, 12, 2, 2, '#3f2615');
      // notebook (open, blue cover)
      R(2, 2, 8, 6, '#2c4a78');
      R(3, 2, 6, 5, '#f4f1e8');
      R(6, 2, 1, 5, '#c9c2b0');
      R(4, 3, 2, 1, '#9fb0c9'); R(4, 5, 2, 1, '#9fb0c9'); R(7, 4, 1, 1, '#9fb0c9');
      // strewn papers
      R(11, 1, 6, 5, '#ece6d6');
      R(12, 2, 4, 1, '#b5ad99'); R(12, 4, 3, 1, '#b5ad99');
      R(13, 4, 6, 5, '#fbfaf5');
      R(14, 5, 4, 1, '#a9a395'); R(14, 7, 3, 1, '#a9a395');
      R(9, 7, 4, 2, '#f1ecdf');
      // pen
      R(11, 8, 4, 1, '#c8323a'); this.px(ctx, 15, 8, '#e8e8e8');
      // little bowl
      R(18, 1, 3, 3, '#f2efe6'); this.px(ctx, 18, 1, '#ffffff'); R(18, 4, 3, 1, '#c9c4b6');
      this.env.coffeeTable = this.outline(canvas);
    }

    // ---------- TV stand + TV seen from behind (TV faces north toward couch) (44 x 18) ----------
    {
      const { canvas, ctx } = this.createCanvas(44, 18);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      // TV back panel
      R(7, 0, 30, 6, '#18191c');
      R(7, 0, 30, 1, '#34363b');
      R(19, 6, 6, 1, '#26282c');
      // stand top + body (wood)
      R(0, 7, 44, 3, '#8a5a36');
      R(0, 7, 44, 1, '#a8744a');
      R(0, 10, 44, 5, '#5e3a22');
      R(1, 11, 42, 1, '#4c2e1a');
      R(2, 15, 2, 3, '#3f2615'); R(40, 15, 2, 3, '#3f2615');
      this.env.tvStand = this.outline(canvas);
    }

    // ---------- White folding table + folding bench + duckling puzzle (19 x 49) ----------
    {
      const { canvas, ctx } = this.createCanvas(19, 49);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      const P = (x, y, c) => this.px(ctx, x, y, c);
      // folding bench (tucked along the west side)
      R(0, 4, 4, 40, '#dcdad3'); R(0, 4, 1, 40, '#f1efe9'); R(0, 44, 4, 2, '#a9a79f');
      // table top
      R(3, 0, 16, 45, '#efede7');
      R(3, 0, 16, 1, '#ffffff');
      R(18, 0, 1, 45, '#cfccc3');
      R(3, 45, 16, 2, '#bdb9ae');
      R(4, 47, 2, 2, '#8c9097'); R(16, 47, 2, 2, '#8c9097');
      // --- the duckling + water lily puzzle (north half) ---
      R(5, 2, 12, 20, '#3f7f8f');
      R(5, 2, 12, 1, '#2e6370'); R(5, 21, 12, 1, '#2e6370');
      R(5, 2, 1, 20, '#2e6370'); R(16, 2, 1, 20, '#2e6370');
      // ripples
      P(7, 6, '#6fb0bb'); P(8, 6, '#6fb0bb'); P(12, 16, '#6fb0bb'); P(13, 16, '#6fb0bb'); P(10, 11, '#6fb0bb');
      // lily pads
      R(6, 13, 4, 3, '#4f9b3a'); P(6, 13, '#79c25a'); R(6, 18, 3, 2, '#4f9b3a');
      R(11, 4, 3, 2, '#4f9b3a'); R(13, 19, 3, 2, '#4f9b3a'); P(13, 19, '#79c25a');
      // yellow water lilies
      R(7, 12, 2, 2, '#ffe680'); P(7, 12, '#ffffff');
      R(12, 3, 2, 2, '#ffe680'); P(13, 3, '#ffffff');
      // purple flowers along the bank
      P(15, 8, '#c45ad6'); P(15, 10, '#e07ae8'); P(14, 12, '#c45ad6'); P(15, 14, '#e07ae8'); P(6, 20, '#c45ad6');
      // three ducklings in a row
      const duck = (x, y) => {
        R(x, y, 3, 2, '#f2c33c'); P(x + 2, y - 1, '#f2c33c'); P(x + 3, y - 1, '#f08a24');
        P(x, y + 1, '#c99a2a');
      };
      duck(7, 8); duck(10, 9); duck(12, 13);
      // --- south half: tall blue cups + pens ---
      R(7, 27, 3, 4, '#1f5fb0'); R(7, 27, 3, 1, '#4f8ad8');
      R(12, 33, 3, 4, '#1f5fb0'); R(12, 33, 3, 1, '#4f8ad8');
      R(6, 38, 5, 1, '#1a1a1a'); R(13, 28, 1, 4, '#c8323a');
      this.env.puzzleTable = this.outline(canvas);
    }

    // ---------- White shoe rack with New Balances (14 x 22) ----------
    {
      const { canvas, ctx } = this.createCanvas(14, 22);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      const P = (x, y, c) => this.px(ctx, x, y, c);
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
      this.env.shoeRack = this.outline(canvas);
    }

    // ---------- Sliding glass door with vertical blinds (28 x 23) ----------
    {
      const { canvas, ctx } = this.createCanvas(28, 23);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 28, 23, '#9aa1aa');
      R(2, 2, 11, 21, '#131a2c'); R(15, 2, 11, 21, '#131a2c');
      R(2, 2, 11, 1, '#22304d'); R(15, 2, 11, 1, '#22304d');
      // a few cold specks outside
      this.px(ctx, 5, 7, '#cfd8ea'); this.px(ctx, 9, 13, '#cfd8ea'); this.px(ctx, 6, 17, '#cfd8ea');
      // vertical blinds gathered on the right pane
      for (let x = 17; x < 26; x += 2) { R(x, 2, 1, 21, '#e6e4dc'); R(x + 1, 2, 1, 21, '#c4c1b6'); }
      R(0, 0, 28, 1, '#c6ccd3');
      R(13, 2, 2, 21, '#7d848e');
      R(11, 11, 1, 3, '#d7dbe0');
      this.env.slidingDoor = this.outline(canvas);
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
    // Fridge (28 x 30) - clean stainless double door
    {
      const { canvas, ctx } = this.createCanvas(28, 30);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 28, 30, '#c9ced5');
      R(0, 0, 13, 30, '#d9dde2');
      R(0, 14, 13, 1, '#9aa1aa');
      R(1, 0, 1, 30, '#eef0f3');
      R(10, 4, 1, 7, '#7f8790'); R(10, 18, 1, 7, '#7f8790');
      R(13, 0, 1, 30, '#9aa1aa');
      R(14, 0, 14, 2, '#b4bac2');
      R(0, 28, 28, 2, '#8d949d');
      this.env.fridge = this.outline(canvas);
    }
    // Prep counter (28 x 30): cabinets + butcher block + spices
    {
      const { canvas, ctx } = this.createCanvas(28, 30);
      const R = (x, y, w, h, c) => this.rect(ctx, x, y, w, h, c);
      R(0, 0, 9, 30, '#6e4426');
      R(1, 1, 7, 13, '#7d4f2e'); R(1, 16, 7, 13, '#7d4f2e');
      R(6, 6, 1, 2, '#d9a93c'); R(6, 21, 1, 2, '#d9a93c');
      R(8, 0, 1, 30, '#4f2f1a');
      R(9, 0, 19, 30, '#ece2c8');
      R(9, 0, 1, 30, '#fbf5e6');
      R(12, 4, 9, 13, '#b98a54'); R(12, 4, 9, 1, '#d8ab70'); R(12, 16, 9, 1, '#8c6238');
      R(15, 8, 4, 1, '#8c6238');
      const jar = (x, y, c) => { R(x, y, 2, 3, c); this.px(ctx, x, y, '#ffffff'); };
      jar(22, 4, '#c8323a'); jar(25, 4, '#e0a43a'); jar(22, 9, '#5f8f3a'); jar(25, 9, '#8b5a2b');
      jar(14, 21, '#e0a43a'); jar(18, 22, '#c8323a');
      R(26, 0, 2, 30, '#ddd2b6');
      this.env.prepCounter = this.outline(canvas);
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
    // ---------- Kitchen wood cabinet run (south wall) generator ----------
    this.makeSouthCabinets = (w) => {
      const { canvas, ctx } = this.createCanvas(w, 23);
      const R = (x, y, ww, h, c) => this.rect(ctx, x, y, ww, h, c);
      R(0, 0, w, 9, '#6e4426');
      const doors = Math.max(1, Math.round(w / 10));
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
