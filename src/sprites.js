/**
 * Undertale 4th Anniversary - Procedural Pixel Art Sprite Generator
 *
 * Everything is drawn at Undertale's native "art pixel" resolution (320x240 worth of
 * pixels) onto small offscreen canvases, then displayed at exactly 2x so every art
 * pixel becomes a crisp 2x2 block on the 640x480 screen.
 *
 *  - Characters (Mallika, Jaydon) are pixel patterns with black Undertale outlines.
 *  - The Jaydon battle sprite + portraits share one procedural face so they always match.
 *  - Environment props (furniture, fixtures) are defined in src/world/props.js and end up
 *    in spriteManager.env; the rooms compose them into their backgrounds.
 */

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
  // ENVIRONMENT PROPS (1x art pixel canvases, defined in src/world/props.js)
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
