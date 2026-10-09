/**
 * Undertale 4th Anniversary - Procedural Pixel Art Sprite Generator
 * Generates faithful Undertale-style pixel art directly to offscreen canvases.
 */

class SpriteManager {
  constructor() {
    this.cache = {};
  }

  // Helper to create an offscreen canvas
  createCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  // Draw pixel grid from a 2D string or array
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

  init() {
    this.generateMallikaSprites();
    this.generateJaydonOverworld();
    this.generateJaydonBattleSprite();
    this.generateJaydonPortraits();
    this.generateEnvironmentSprites();
    this.generateUISprites();
  }

  // ==========================================
  // MALLIKA SPRITES (Frisk-sized, 4 directions, walk frames)
  // Matching photos: warm brown skin, dark wavy hair past shoulders,
  // dark glasses, heather grey hoodie, dark pants.
  // ==========================================
  generateMallikaSprites() {
    const scale = 2; // Internal resolution: 20x26 scaled up
    const w = 20 * scale;
    const h = 26 * scale;

    const colors = {
      'H': '#15100e', // Deep dark wavy hair
      'h': '#2b1d18', // Hair wave highlight
      'S': '#be825c', // Warm South Asian skin tone
      's': '#a06846', // Skin shadow
      'G': '#161616', // Dark rounded glasses frames
      'g': '#ffffff', // Glasses reflection glint
      'M': '#6a2a2e', // Gentle warm smile
      'T': '#e85d75', // Coral/rose tube top
      't': '#c44258', // Tube top shadow
      'D': '#355c94', // Denim blue overalls
      'd': '#223c63', // Denim seam / pocket shading
      'B': '#f0c23a', // Brass buckles & buttons on overalls
      'W': '#f2f2f2', // Clean white sneakers
      'w': '#999999'  // Sneaker soles
    };

    // Mallika Facing Down (0: Stand, 1: Step Left, 2: Step Right)
    const downPatterns = [
      // Down Idle
      [
        "     HHHHHHHHHH     ",
        "    HhhhhhhhhhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhSSSSSSSShhH    ",
        "   HhGGssSGGshhH    ",
        "   HhGSgsGSgshhH    ",
        "   HhGGssSGGshhH    ",
        "   HhhSSSSSSshhH    ",
        "   HhhSSMSSShHH     ",
        "   HhhSSSSSSshH     ",
        "    hhSTTTTTSth     ",
        "    hBDTTTTTDBh     ",
        "    tBDDDDDDDBt     ",
        "    tBDDddDDDBt     ",
        "     DDDDDDDDD      ",
        "     DDdddddDD      ",
        "      DDDDDDD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      WW   WW       ",
        "      ww   ww       "
      ],
      // Down Walk 1 (Natural centered step forward with left foot, no outward sprawl)
      [
        "     HHHHHHHHHH     ",
        "    HhhhhhhhhhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhSSSSSSSShhH    ",
        "   HhGGssSGGshhH    ",
        "   HhGSgsGSgshhH    ",
        "   HhGGssSGGshhH    ",
        "   HhhSSSSSSshhH    ",
        "   HhhSSMSSShHH     ",
        "   HhhSSSSSSshH     ",
        "    hhSTTTTTSth     ",
        "    hBDTTTTTDBh     ",
        "    tBDDDDDDDBt     ",
        "    tBDDddDDDBt     ",
        "     DDDDDDDDD      ",
        "     DDdddddDD      ",
        "      DDDDDDD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      WW   DD       ",
        "      ww   WW       ",
        "           ww       ",
        "                    "
      ],
      // Down Walk 2 (Natural centered step forward with right foot, no outward sprawl)
      [
        "     HHHHHHHHHH     ",
        "    HhhhhhhhhhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhSSSSSSSShhH    ",
        "   HhGGssSGGshhH    ",
        "   HhGSgsGSgshhH    ",
        "   HhGGssSGGshhH    ",
        "   HhhSSSSSSshhH    ",
        "   HhhSSMSSShHH     ",
        "   HhhSSSSSSshH     ",
        "    hhSTTTTTSth     ",
        "    hBDTTTTTDBh     ",
        "    tBDDDDDDDBt     ",
        "    tBDDddDDDBt     ",
        "     DDDDDDDDD      ",
        "     DDdddddDD      ",
        "      DDDDDDD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      DD   WW       ",
        "      WW   ww       ",
        "      ww            ",
        "                    "
      ]
    ];

    // Mallika Facing Up (Back view: wavy hair flowing down, overalls cross-straps over tube top)
    const upPatterns = [
      // Up Idle
      [
        "     HHHHHHHHHH     ",
        "    HhhhhhhhhhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhhhhhhhhhhHH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhhHHHHHHHhHH    ",
        "   HhhHHHHHHHhHH    ",
        "   HhhHHHHHHHhHH    ",
        "    hhDTTTTTDhh     ",
        "    h D D D D h     ",
        "    t DDD DDD t     ",
        "     DDDDDDDDD      ",
        "     DDdddddDD      ",
        "      DDDDDDD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      WW   WW       ",
        "      ww   ww       "
      ],
      // Up Walk 1
      [
        "     HHHHHHHHHH     ",
        "    HhhhhhhhhhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhhhhhhhhhhHH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhhHHHHHHHhHH    ",
        "   HhhHHHHHHHhHH    ",
        "   HhhHHHHHHHhHH    ",
        "    hhDTTTTTDhh     ",
        "    h D D D D h     ",
        "    t DDD DDD t     ",
        "     DDDDDDDDD      ",
        "     DDdddddDD      ",
        "      DDDDDDD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      WW   DD       ",
        "      ww   WW       ",
        "           ww       ",
        "                    "
      ],
      // Up Walk 2
      [
        "     HHHHHHHHHH     ",
        "    HhhhhhhhhhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhhhhhhhhhhHH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhHHHHHHHHhhH    ",
        "   HhhHHHHHHHhHH    ",
        "   HhhHHHHHHHhHH    ",
        "   HhhHHHHHHHhHH    ",
        "    hhDTTTTTDhh     ",
        "    h D D D D h     ",
        "    t DDD DDD t     ",
        "     DDDDDDDDD      ",
        "     DDdddddDD      ",
        "      DDDDDDD       ",
        "      DD   DD       ",
        "      DD   DD       ",
        "      DD   WW       ",
        "      WW   ww       ",
        "      ww            ",
        "                    "
      ]
    ];

    // Mallika Facing Left (Side profile: tube top under overalls bib & strap)
    const leftPatterns = [
      // Left Idle
      [
        "      HHHHHHHH      ",
        "     HhhhhhhhhH     ",
        "    HhHHHHHHhhH     ",
        "    HhSSSSSSSg      ",
        "    HhGSGSgssg      ",
        "    HhGSGSgssg      ",
        "    HhhSSSSSSg      ",
        "    HhhSSSMSSS      ",
        "    HhhSSSSSSS      ",
        "    HhSTTTTTTh      ",
        "    HhBDTTTTDh      ",
        "    HhBDDDDDDh      ",
        "    HhBDdDDDDh      ",
        "    HhBDDDDDDh      ",
        "     hDDDDDDDh      ",
        "      DDDDDDD       ",
        "       DD  DD       ",
        "       DD  DD       ",
        "       DD  DD       ",
        "       DD  DD       ",
        "       WW  WW       ",
        "       ww  ww       "
      ],
      // Left Walk
      [
        "      HHHHHHHH      ",
        "     HhhhhhhhhH     ",
        "    HhHHHHHHhhH     ",
        "    HhSSSSSSSg      ",
        "    HhGSGSgssg      ",
        "    HhGSGSgssg      ",
        "    HhhSSSSSSg      ",
        "    HhhSSSMSSS      ",
        "    HhhSSSSSSS      ",
        "    HhSTTTTTTh      ",
        "    HhBDTTTTDh      ",
        "    HhBDDDDDDh      ",
        "    HhBDdDDDDh      ",
        "    HhBDDDDDDh      ",
        "     hDDDDDDDh      ",
        "      DDDDDDD       ",
        "       DD   DD      ",
        "       DD   DD      ",
        "       WW   DD      ",
        "       ww   WW      ",
        "            ww      ",
        "                    "
      ]
    ];

    this.mallika = { down: [], up: [], left: [], right: [] };

    // Build Down
    downPatterns.forEach((pat, i) => {
      const { canvas, ctx } = this.createCanvas(w, h);
      this.drawGrid(ctx, 0, 0, scale, colors, pat);
      this.mallika.down.push(canvas);
    });

    // Build Up
    upPatterns.forEach((pat, i) => {
      const { canvas, ctx } = this.createCanvas(w, h);
      this.drawGrid(ctx, 0, 0, scale, colors, pat);
      this.mallika.up.push(canvas);
    });

    // Build Left
    leftPatterns.forEach((pat, i) => {
      const { canvas, ctx } = this.createCanvas(w, h);
      this.drawGrid(ctx, 0, 0, scale, colors, pat);
      this.mallika.left.push(canvas);

      // Build Right by flipping Left horizontally!
      const rightObj = this.createCanvas(w, h);
      rightObj.ctx.save();
      rightObj.ctx.translate(w, 0);
      rightObj.ctx.scale(-1, 1);
      rightObj.ctx.drawImage(canvas, 0, 0);
      rightObj.ctx.restore();
      this.mallika.right.push(rightObj.canvas);
    });
  }

  // ==========================================
  // JAYDON OVERWORLD SPRITE (Steps out of bedroom)
  // Curly hair, glasses, grey crewneck, red plaid pajama pants!
  // ==========================================
  generateJaydonOverworld() {
    const scale = 2;
    const w = 22 * scale;
    const h = 32 * scale;

    const colors = {
      'H': '#34211a', // Curly dark brown hair
      'h': '#4b3228', // Curly highlights
      'S': '#f2c19e', // Skin tone
      's': '#d8a483', // Skin shading
      'G': '#111111', // Black rectangular glasses
      'g': '#ffffff', // Glasses reflection
      'T': '#a8abb0', // Heather grey long sleeve
      't': '#8e9196', // Seams
      'C': '#ffea75', // Chest crest/logo
      'R': '#c72228', // Red plaid base
      'K': '#48080c', // Black/dark plaid criss-cross grid
      'W': '#ffffff', // White socks
      'w': '#cccccc'
    };

    const pattern = [
      "      HHHHHHH       ",
      "    HhhHHhhhhHH     ",
      "   HhhHHHhhhhhhH    ",
      "   HhSSSSSSSSShH    ",
      "   HhGGgSssGGghH    ",
      "   HhGGSsssGGShH    ",
      "   HhSSSSSSSSShH    ",
      "   HhhSSSSSSShHH    ",
      "    hhTTTTTTTth     ",
      "   TTTTTTTTTTTTT    ",
      "  TTTTTTCCTTTTTTT   ",
      "  TTTTTTTTTTTTTTT   ",
      "  TTTTTTTTTTTTTTT   ",
      "  TTTTTTTTTTTTTTT   ",
      "   ttttttttttttt    ",
      "    RKRKRKRKRKR     ",
      "    KRKRKRKRKRK     ",
      "    RKRKRKRKRKR     ",
      "    KRKRKRKRKRK     ",
      "    RKRK   RKRK     ",
      "    KRKR   KRKR     ",
      "    RKRK   RKRK     ",
      "    KRKR   KRKR     ",
      "    WWWW   WWWW     ",
      "    wwww   wwww     "
    ];

    const { canvas, ctx } = this.createCanvas(w, h);
    this.drawGrid(ctx, 0, 0, scale, colors, pattern);
    this.jaydonOverworld = canvas;
  }

  // ==========================================
  // JAYDON BATTLE SPRITE (Large Undertale style, ~140x170 px)
  // Curly hair, glasses with glint, warm grin, grey long sleeve,
  // iconic RED PLAID PAJAMA PANTS!
  // ==========================================
  generateJaydonBattleSprite() {
    const scale = 3;
    const w = 48 * scale;
    const h = 58 * scale;

    const colors = {
      'H': '#2b1a13', // Deep brown curly hair
      'h': '#442e23', // Curly hair curls
      'S': '#f6cbb0', // Skin
      's': '#deaf93', // Skin contour
      'G': '#1a1a1a', // Rectangular glasses
      'g': '#ffffff', // Glass shine
      'M': '#6a2a2e', // Warm smile
      'T': '#b8bac0', // Heather grey long sleeve
      't': '#9ea1a7', // Shirt shading
      'C': '#ecd466', // Shirt chest logo
      'R': '#cc1e24', // Red plaid pajama base
      'K': '#3e060a', // Dark plaid crosshatch
      'F': '#e0e0e0', // Socks
      'O': '#111111'  // Outlines
    };

    const pattern = [
      "                 HHHHHHHHHHHHHH                 ",
      "              HHhhhhhhhHHhhhhhhhHH              ",
      "            HHhhhhhhhhhhhhhhhhhhhhHH            ",
      "           HhhhhhhhhhhhhhhhhhhhhhhhH            ",
      "          HHhhHHHHHHHHHHHHHHHHHHhhhhHH          ",
      "          HhhHSSSSSSSSSSSSSSSSSSShhhHH          ",
      "          HhhHSSGGGGGgSSSSGGGGGgShhhHH          ",
      "          HhhHSGGGGGGgSSSSGGGGGGgShhHH          ",
      "          HhhHSSGGGGGGSSSSGGGGGGShhhHH          ",
      "          HhhHSSSSSssSSssSSSSSSSShhhHH          ",
      "          HhhhSSSSSssssssSSSSSSSShhhHH          ",
      "           HhhSSSSSMMMMMMSSSSSSSShhH            ",
      "           HHhhSSSSSMMMMSSSSSSSShhHH            ",
      "            HHhhhSSSSSSSSSSSSShhhHH             ",
      "              HHHhhhhhhhhhhhhHHH                ",
      "             TTTTTTTTTTTTTTTTTTTT               ",
      "           TTTTTTTTTTTTTTTTTTTTTTTT             ",
      "         TTTTTTTTTTTTCTTTTTTTTTTTTTTT           ",
      "        TTTTTTTTTTTTCCCTTTTTTTTTTTTTTT          ",
      "       TTTTTTTTTTTTTTCTTTTTTTTTTTTTTTTT         ",
      "       TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT         ",
      "       TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT         ",
      "       TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT         ",
      "       tttttttttttttttttttttttttttttttt         ",
      "         RKRKRKRKRKRKRKRKRKRKRKRKRKR            ",
      "         KRKRKRKRKRKRKRKRKRKRKRKRKRK            ",
      "         RKRKRKRKRKRKRKRKRKRKRKRKRKR            ",
      "         KRKRKRKRKRKRKRKRKRKRKRKRKRK            ",
      "         RKRKRKRKRKRKRKRKRKRKRKRKRKR            ",
      "         KRKRKRKRKRKRKRKRKRKRKRKRKRK            ",
      "         RKRKRKRKRKR   KRKRKRKRKRKRK            ",
      "         KRKRKRKRKRK   RKRKRKRKRKRKR            ",
      "         RKRKRKRKRKR   KRKRKRKRKRKRK            ",
      "         KRKRKRKRKRK   RKRKRKRKRKRKR            ",
      "         RKRKRKRKRKR   KRKRKRKRKRKRK            ",
      "         KRKRKRKRKRK   RKRKRKRKRKRKR            ",
      "          FFFFFFFFF     FFFFFFFFF               ",
      "          FFFFFFFFF     FFFFFFFFF               "
    ];

    const { canvas, ctx } = this.createCanvas(w, h);
    this.drawGrid(ctx, 0, 0, scale, colors, pattern);
    this.jaydonBattle = canvas;
  }

  // ==========================================
  // JAYDON DIALOGUE PORTRAITS (Neutral, Blush, Laugh, Smoke/Cough)
  // Displayed in battle dialogue box with typewriter sound!
  // ==========================================
  generateJaydonPortraits() {
    this.portraits = {};
    const scale = 2;
    const w = 32 * scale;
    const h = 32 * scale;

    const baseColors = {
      'H': '#2b1a13',
      'h': '#442e23',
      'S': '#f6cbb0',
      's': '#deaf93',
      'G': '#111111',
      'g': '#ffffff',
      'M': '#6a2a2e',
      'B': '#ff4766', // Bright blush pink
      'W': '#ffffff',
      'C': '#cccccc'
    };

    // 1. NEUTRAL PORTRAIT
    const neutralPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH     ",
      "    HHhhHHHHHHHHHHHHhhhhH    ",
      "    HhhHSSSSSSSSSSSSShhhH    ",
      "    HhhHSSGGGGgSSGGGGgShH    ",
      "    HhhHSGGGGGgSGGGGGgShH    ",
      "    HhhHSSGGGGSSGGGGSSShH    ",
      "    HhhSSSSSssSSssSSSSShH    ",
      "    HhhSSSSSssssssSSSSShH    ",
      "    HHhSSSSSMMMMMMSSSSShH    ",
      "     HhhSSSSSMMMMSSSSShhH    ",
      "      HhhhSSSSSSSSSSShhH     ",
      "        HHhhhhhhhhhhHH       ",
      "         TTTTTTTTTTTT        "
    ];

    // 2. BLUSH PORTRAIT (Flirt action: Cheeks bright red, shy cute smile)
    const blushPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH     ",
      "    HHhhHHHHHHHHHHHHhhhhH    ",
      "    HhhHSSSSSSSSSSSSShhhH    ",
      "    HhhHSSGGGGgSSGGGGgShH    ",
      "    HhhHSGGGGGgSGGGGGgShH    ",
      "    HhhHSSGGGGSSGGGGSSShH    ",
      "    HhhSSBBssSSssBBSSSShH    ",
      "    HhhSBBBBsssssBBBBSSShH   ",
      "    HHhSSSSSsMMMMsSSSSShH    ",
      "     HhhSSSSSSSSSSSSShhH     ",
      "      HhhhSSSSSSSSSSShhH     ",
      "        HHhhhhhhhhhhHH       ",
      "         TTTTTTTTTTTT        "
    ];

    // 3. LAUGH PORTRAIT (Fight / Date: Crinkled eyes, wide laughing grin)
    const laughPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH     ",
      "    HHhhHHHHHHHHHHHHhhhhH    ",
      "    HhhHSSSSSSSSSSSSShhhH    ",
      "    HhhHSSG^^GgSSG^^GgShH    ",
      "    HhhHSGGGGGgSGGGGGgShH    ",
      "    HhhHSSSSSSSSSSSSSSShH    ",
      "    HhhSSSSSssSSssSSSSShH    ",
      "    HhhSSSSWMMMMMWSSSSShH    ",
      "    HHhSSSWMMMMMMMWSSSShH    ",
      "     HhhSSWMMMMMMMWSSShhH    ",
      "      HhhhSSSSSSSSSSShhH     ",
      "        HHhhhhhhhhhhHH       ",
      "         TTTTTTTTTTTT        "
    ];

    // 4. COUGH / SMOKE PORTRAIT (Smoke act: coughing, little puff of smoke)
    const coughPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH  CC ",
      "    HHhhHHHHHHHHHHHHhhhhHCCC ",
      "    HhhHSSSSSSSSSSSSShhhCC   ",
      "    HhhHSSG><GgSSG><GgShHC   ",
      "    HhhHSGGGGGgSGGGGGgShH    ",
      "    HhhHSSSSSSSSSSSSSSShH    ",
      "    HhhSSSSSssSSssSSSSShH    ",
      "    HhhSSSSSOOOOOSSSSSShH    ",
      "    HHhSSSSSOOOOOSSSSSShH    ",
      "     HhhSSSSSSSSSSSSShhH     ",
      "      HhhhSSSSSSSSSSShhH     ",
      "        HHhhhhhhhhhhHH       ",
      "         TTTTTTTTTTTT        "
    ];

    const list = [
      { name: 'neutral', pat: neutralPattern },
      { name: 'blush', pat: blushPattern },
      { name: 'laugh', pat: laughPattern },
      { name: 'cough', pat: coughPattern }
    ];

    list.forEach(item => {
      const { canvas, ctx } = this.createCanvas(w, h);
      this.drawGrid(ctx, 0, 0, scale, baseColors, item.pat);
      this.portraits[item.name] = canvas;
    });
  }

  // ==========================================
  // ENVIRONMENT SPRITES & PROPS
  // ==========================================
  generateEnvironmentSprites() {
    this.env = {};

    // 1. Exterior Brick Wall Tile (32x32)
    const { canvas: brick, ctx: bCtx } = this.createCanvas(32, 32);
    bCtx.fillStyle = '#6b2024';
    bCtx.fillRect(0, 0, 32, 32);
    bCtx.fillStyle = '#481215';
    bCtx.fillRect(0, 7, 32, 2);
    bCtx.fillRect(0, 15, 32, 2);
    bCtx.fillRect(0, 23, 32, 2);
    bCtx.fillRect(0, 31, 32, 1);
    bCtx.fillRect(15, 0, 2, 7);
    bCtx.fillRect(7, 8, 2, 7);
    bCtx.fillRect(23, 8, 2, 7);
    bCtx.fillRect(15, 16, 2, 7);
    bCtx.fillRect(7, 24, 2, 7);
    bCtx.fillRect(23, 24, 2, 7);
    this.env.brickWall = brick;

    // 2. Door 316 (Matching Photo 3 with shingled awning & beige siding above)
    const { canvas: door316, ctx: dCtx } = this.createCanvas(36, 56);
    // Beige horizontal siding top
    dCtx.fillStyle = '#d6cdbd';
    dCtx.fillRect(0, 0, 36, 12);
    dCtx.strokeStyle = '#b8ad9b';
    dCtx.lineWidth = 1;
    dCtx.beginPath();
    dCtx.moveTo(0, 4); dCtx.lineTo(36, 4);
    dCtx.moveTo(0, 8); dCtx.lineTo(36, 8);
    dCtx.stroke();
    // Shingled awning
    dCtx.fillStyle = '#614d3a';
    dCtx.fillRect(0, 11, 36, 4);
    // Dark red brick around doorway
    dCtx.fillStyle = '#5a1d21';
    dCtx.fillRect(0, 15, 36, 41);
    // Recessed dark doorway
    dCtx.fillStyle = '#111111';
    dCtx.fillRect(14, 18, 20, 38);
    dCtx.fillStyle = '#1f1918';
    dCtx.fillRect(16, 20, 16, 36);
    // Brass handle
    dCtx.fillStyle = '#ffd700';
    dCtx.fillRect(17, 36, 2, 4);
    // "316" Plaque on the left brick wall
    dCtx.fillStyle = '#111111';
    dCtx.fillRect(1, 24, 12, 6);
    dCtx.fillStyle = '#ffffff';
    dCtx.font = 'bold 5px monospace';
    dCtx.fillText('316', 2, 29);
    this.env.door316 = door316;

    // 3. Snow Tile with subtle footsteps (32x32)
    const { canvas: snow, ctx: sCtx } = this.createCanvas(32, 32);
    sCtx.fillStyle = '#f0f5fa';
    sCtx.fillRect(0, 0, 32, 32);
    sCtx.fillStyle = '#dce6f2';
    sCtx.fillRect(4, 5, 2, 2);
    sCtx.fillRect(20, 18, 3, 2);
    sCtx.fillRect(12, 27, 2, 2);
    this.env.snow = snow;

    // 4. White Shoe Rack with New Balances (32x24)
    const { canvas: shoeRack, ctx: srCtx } = this.createCanvas(32, 24);
    srCtx.fillStyle = '#e6e6e6';
    srCtx.fillRect(2, 6, 28, 16);
    srCtx.fillStyle = '#ffffff';
    srCtx.fillRect(4, 8, 24, 5);
    srCtx.fillRect(4, 15, 24, 5);
    // New Balance shoes (Navy/Grey/White)
    srCtx.fillStyle = '#5c6475';
    srCtx.fillRect(5, 9, 6, 3);
    srCtx.fillRect(12, 9, 6, 3);
    srCtx.fillRect(19, 9, 6, 3);
    srCtx.fillStyle = '#ffffff'; // N logo
    srCtx.fillRect(7, 10, 2, 1);
    srCtx.fillRect(14, 10, 2, 1);
    srCtx.fillRect(21, 10, 2, 1);
    this.env.shoeRack = shoeRack;

    // 5. White Folding Table with Duckling & Flower Puzzle on Half (48x32)
    const { canvas: puzzleTable, ctx: ptCtx } = this.createCanvas(48, 32);
    // Table surface
    ptCtx.fillStyle = '#f2f2f2';
    ptCtx.fillRect(0, 2, 48, 28);
    ptCtx.fillStyle = '#cccccc';
    ptCtx.fillRect(2, 28, 4, 4);
    ptCtx.fillRect(42, 28, 4, 4);
    // Table edge bevel
    ptCtx.fillStyle = '#e0e0e0';
    ptCtx.fillRect(0, 2, 48, 2);

    // Cute Jigsaw Puzzle of Ducklings & Flowers on LEFT HALF of table
    ptCtx.fillStyle = '#24523d'; // Pond water base
    ptCtx.fillRect(3, 5, 20, 20);
    // Jigsaw border trim
    ptCtx.strokeStyle = '#1b3d2d';
    ptCtx.lineWidth = 1;
    ptCtx.strokeRect(3, 5, 20, 20);

    // Lily pads
    ptCtx.fillStyle = '#488b48';
    ptCtx.fillRect(5, 7, 6, 5);
    ptCtx.fillRect(13, 16, 7, 5);

    // Cute yellow baby ducklings!
    ptCtx.fillStyle = '#ffd13b';
    ptCtx.fillRect(14, 8, 4, 4);   // Duckling 1 body
    ptCtx.fillRect(16, 7, 3, 3);   // Duckling 1 head
    ptCtx.fillStyle = '#ff7700';   // Beak
    ptCtx.fillRect(19, 8, 2, 1);
    ptCtx.fillStyle = '#111111';   // Eye
    ptCtx.fillRect(17, 7, 1, 1);

    ptCtx.fillStyle = '#ffd13b';
    ptCtx.fillRect(7, 14, 4, 4);   // Duckling 2 body
    ptCtx.fillRect(6, 13, 3, 3);   // Duckling 2 head
    ptCtx.fillStyle = '#ff7700';
    ptCtx.fillRect(4, 14, 2, 1);
    ptCtx.fillStyle = '#111111';
    ptCtx.fillRect(7, 13, 1, 1);

    // Flowers (Water lilies and pink/white blossoms)
    ptCtx.fillStyle = '#ff88aa';   // Pink water lily
    ptCtx.fillRect(6, 8, 3, 3);
    ptCtx.fillStyle = '#ffffff';
    ptCtx.fillRect(7, 9, 1, 1);

    ptCtx.fillStyle = '#ffffff';   // White flower
    ptCtx.fillRect(15, 17, 3, 3);
    ptCtx.fillStyle = '#ffd700';   // Yellow blossom center
    ptCtx.fillRect(16, 18, 1, 1);

    // RIGHT HALF OF TABLE: Clutter, blue cups, and pens
    // Tall blue plastic cup (Photo 1)
    ptCtx.fillStyle = '#1b56a3';
    ptCtx.fillRect(35, 6, 6, 9);
    ptCtx.fillStyle = '#3a79d0';
    ptCtx.fillRect(36, 7, 4, 3);

    // Second blue cup
    ptCtx.fillStyle = '#1b56a3';
    ptCtx.fillRect(37, 18, 5, 7);

    // Colored pens lying on table
    ptCtx.fillStyle = '#111111';   // Black pen
    ptCtx.fillRect(26, 11, 7, 2);
    ptCtx.fillStyle = '#d9333f';   // Red pen
    ptCtx.fillRect(27, 16, 7, 2);
    this.env.puzzleTable = puzzleTable;

    // 6. Kitchen Stove with Warm Oven & Microwave on top (36x48)
    const { canvas: stove, ctx: stCtx } = this.createCanvas(36, 48);
    // Microwave mounted on top
    stCtx.fillStyle = '#f0f0f0';
    stCtx.fillRect(2, 0, 32, 16);
    stCtx.fillStyle = '#222222';
    stCtx.fillRect(4, 3, 20, 10); // microwave door window
    stCtx.fillStyle = '#555555';
    stCtx.fillRect(26, 3, 6, 10); // keypad
    stCtx.fillStyle = '#00ff44';
    stCtx.fillRect(27, 4, 4, 2);  // green clock display
    // White Stove body below
    stCtx.fillStyle = '#e8e8e8';
    stCtx.fillRect(0, 16, 36, 32);
    // Black coil burners
    stCtx.fillStyle = '#222222';
    stCtx.fillRect(4, 18, 7, 7);
    stCtx.fillRect(18, 18, 7, 7);
    stCtx.fillRect(4, 27, 7, 7);
    stCtx.fillRect(18, 27, 7, 7);
    // Red warm burner glow (brown sugar & dates aroma!)
    stCtx.fillStyle = '#ff4422';
    stCtx.fillRect(5, 19, 5, 5);
    // Oven glass door
    stCtx.fillStyle = '#332211';
    stCtx.fillRect(4, 37, 28, 9);
    this.env.stove = stove;

    // 7. Kitchen Sink with Crooked Mini-Blind Window (Photo 2)
    const { canvas: sink, ctx: skCtx } = this.createCanvas(36, 42);
    // Dark wood cabinet on left
    skCtx.fillStyle = '#4e2f1d';
    skCtx.fillRect(0, 0, 6, 26);
    // Pink cleaning gloves hanging from cabinet! (Photo 2)
    skCtx.fillStyle = '#ff5588';
    skCtx.fillRect(4, 16, 3, 7);
    // Window frame
    skCtx.fillStyle = '#4a3528';
    skCtx.fillRect(6, 2, 28, 22);
    skCtx.fillStyle = '#0a101d'; // Night sky
    skCtx.fillRect(8, 4, 24, 18);
    // Iconic Crooked mini blinds at steep 45° angle (Photo 2)!
    skCtx.strokeStyle = '#ffffff';
    skCtx.lineWidth = 1.5;
    skCtx.beginPath();
    skCtx.moveTo(10, 5);
    skCtx.lineTo(30, 16); // Sharp crooked slant!
    skCtx.moveTo(10, 9);
    skCtx.lineTo(30, 20);
    skCtx.stroke();
    // Sink counter
    skCtx.fillStyle = '#222222';
    skCtx.fillRect(0, 24, 36, 18);
    // Metal sink basin
    skCtx.fillStyle = '#778899';
    skCtx.fillRect(8, 26, 22, 14);
    // Faucet
    skCtx.fillStyle = '#dddddd';
    skCtx.fillRect(18, 23, 3, 5);
    // Blue Dawn dish soap bottle! (Photo 2)
    skCtx.fillStyle = '#0088ff';
    skCtx.fillRect(31, 23, 3, 5);
    this.env.sink = sink;

    // 7b. Dishwasher (Photo 2: Black front with silver control dial)
    const { canvas: dishwasher, ctx: dwCtx } = this.createCanvas(28, 36);
    dwCtx.fillStyle = '#181818';
    dwCtx.fillRect(0, 0, 28, 36);
    dwCtx.fillStyle = '#282828';
    dwCtx.fillRect(2, 2, 24, 32);
    // Control panel at top
    dwCtx.fillStyle = '#111111';
    dwCtx.fillRect(2, 2, 24, 8);
    // Silver round dial knob
    dwCtx.fillStyle = '#cccccc';
    dwCtx.beginPath();
    dwCtx.arc(8, 6, 3, 0, Math.PI * 2);
    dwCtx.fill();
    this.env.dishwasher = dishwasher;

    // 8. Deep Red L-Couch - BIGGER! (64x50) (Photo 3)
    const { canvas: couch, ctx: cCtx } = this.createCanvas(64, 50);
    // Rich red/maroon fabric
    cCtx.fillStyle = '#6e141a';
    cCtx.fillRect(0, 0, 64, 15); // Backrest along top
    cCtx.fillRect(0, 0, 18, 50); // L-section extending down left
    cCtx.fillStyle = '#8c1f26';
    cCtx.fillRect(18, 15, 46, 33); // Main seat cushion
    cCtx.fillRect(0, 15, 18, 33);  // L seat cushion
    // Cushion seam dividers
    cCtx.fillStyle = '#550d12';
    cCtx.fillRect(38, 15, 2, 33);
    cCtx.fillRect(18, 15, 2, 33);
    // Nintendo Switch on seat (Red & Blue Joy-Cons!)
    cCtx.fillStyle = '#111111'; // Switch screen
    cCtx.fillRect(44, 25, 10, 7);
    cCtx.fillStyle = '#00aaff'; // Blue joycon
    cCtx.fillRect(42, 25, 2, 7);
    cCtx.fillStyle = '#ff3b3b'; // Red joycon
    cCtx.fillRect(54, 25, 2, 7);
    this.env.redCouch = couch;

    // 9. Brown Coffee Table with Notebook, Papers Just Strewn About & Bowl (Photo 1)
    const { canvas: coffeeTable, ctx: cfCtx } = this.createCanvas(40, 26);
    cfCtx.fillStyle = '#5c3a21'; // Rich wood surface
    cfCtx.fillRect(0, 0, 40, 26);
    cfCtx.fillStyle = '#442814'; // Table legs
    cfCtx.fillRect(2, 22, 4, 4);
    cfCtx.fillRect(34, 22, 4, 4);

    // Notebook (Blue spiral notebook with white/ruled pages)
    cfCtx.fillStyle = '#264268'; // Dark blue cover
    cfCtx.fillRect(4, 4, 13, 14);
    cfCtx.fillStyle = '#f8f6f0'; // Notebook page showing
    cfCtx.fillRect(5, 5, 11, 12);
    // Ruled lines in notebook
    cfCtx.fillStyle = '#b0c2de';
    cfCtx.fillRect(7, 8, 8, 1);
    cfCtx.fillRect(7, 11, 8, 1);
    cfCtx.fillRect(7, 14, 8, 1);
    // Spiral binding along left edge
    cfCtx.fillStyle = '#999999';
    cfCtx.fillRect(4, 5, 1, 12);

    // Papers just strewn about (Loose overlapping sheets with scribbles)
    // Sheet 1 (Angled/shifted cream paper)
    cfCtx.fillStyle = '#f0ece1';
    cfCtx.fillRect(16, 5, 11, 9);
    cfCtx.fillStyle = '#8a857b';
    cfCtx.fillRect(18, 7, 7, 1);
    cfCtx.fillRect(18, 10, 6, 1);

    // Sheet 2 (Overlapping white paper)
    cfCtx.fillStyle = '#ffffff';
    cfCtx.fillRect(14, 11, 13, 10);
    cfCtx.fillStyle = '#7a7a7a';
    cfCtx.fillRect(16, 13, 9, 1);
    cfCtx.fillRect(16, 16, 7, 1);
    cfCtx.fillRect(16, 19, 8, 1);

    // Red pen resting across the papers
    cfCtx.fillStyle = '#d9333f';
    cfCtx.fillRect(17, 8, 8, 2);
    cfCtx.fillStyle = '#cccccc'; // Silver tip
    cfCtx.fillRect(16, 8, 1, 2);

    // White soup/cereal bowl with spoon (Photo 1)
    cfCtx.fillStyle = '#ffffff';
    cfCtx.beginPath();
    cfCtx.arc(32, 13, 4, 0, Math.PI * 2);
    cfCtx.fill();
    cfCtx.fillStyle = '#aaaaaa';
    cfCtx.fillRect(33, 11, 4, 1); // spoon handle
    this.env.coffeeTable = coffeeTable;

    // 10. Heavy Punching Bag (16x36)
    const { canvas: punchBag, ctx: pbCtx } = this.createCanvas(16, 36);
    // Chain mount
    pbCtx.strokeStyle = '#aaaaaa';
    pbCtx.lineWidth = 1;
    pbCtx.beginPath();
    pbCtx.moveTo(8, 0);
    pbCtx.lineTo(8, 8);
    pbCtx.stroke();
    // Heavy black bag
    pbCtx.fillStyle = '#181818';
    pbCtx.fillRect(3, 8, 10, 24);
    pbCtx.fillStyle = '#333333';
    pbCtx.fillRect(5, 8, 2, 24);
    this.env.punchBag = punchBag;

    // 11. Sliding Glass Door (32x48)
    const { canvas: slidingDoor, ctx: sdCtx } = this.createCanvas(32, 48);
    sdCtx.fillStyle = '#222222';
    sdCtx.fillRect(0, 0, 32, 48);
    // Glass panels showing dark snowy night
    sdCtx.fillStyle = '#0c1b26';
    sdCtx.fillRect(3, 3, 12, 42);
    sdCtx.fillRect(17, 3, 12, 42);
    // Snow flakes outside
    sdCtx.fillStyle = '#ffffff';
    sdCtx.fillRect(6, 12, 2, 2);
    sdCtx.fillRect(10, 28, 2, 2);
    sdCtx.fillRect(22, 16, 2, 2);
    this.env.slidingDoor = slidingDoor;

    // 12. Green Ceiling LED Strip (32x6)
    const { canvas: greenLed, ctx: ledCtx } = this.createCanvas(32, 6);
    ledCtx.fillStyle = '#00ff44';
    ledCtx.fillRect(0, 2, 32, 2);
    ledCtx.fillStyle = 'rgba(0, 255, 68, 0.4)';
    ledCtx.fillRect(0, 0, 32, 6);
    this.env.greenLed = greenLed;
  }

  // ==========================================
  // UI SPRITES (Heart SOUL, Save Star, Reticle)
  // ==========================================
  generateUISprites() {
    this.ui = {};

    // 1. Red SOUL Heart (16x16)
    const { canvas: soul, ctx: sCtx } = this.createCanvas(16, 16);
    const soulPat = [
      "  RRR   RRR  ",
      " RRRRR RRRRR ",
      "RRRRRRRRRRRRR",
      "RRRRRRRRRRRRR",
      " RRRRRRRRRRR ",
      "  RRRRRRRRR  ",
      "   RRRRRRR   ",
      "    RRRRR    ",
      "     RRR     ",
      "      R      "
    ];
    this.drawGrid(sCtx, 1, 3, 1, { 'R': '#ff0000' }, soulPat);
    this.ui.soul = soul;

    // 2. Yellow Save Star (16x16)
    const { canvas: star, ctx: stCtx } = this.createCanvas(16, 16);
    const starPat = [
      "      YY      ",
      "      YY      ",
      "     YYYY     ",
      "    YYYYYY    ",
      "  YYYYYYYYYY  ",
      "YYYYYYYYYYYYYY",
      "  YYYYYYYYYY  ",
      "    YYYYYY    ",
      "     YYYY     ",
      "      YY      ",
      "      YY      "
    ];
    this.drawGrid(stCtx, 1, 2, 1, { 'Y': '#ffff00' }, starPat);
    this.ui.saveStar = star;
  }
}

window.spriteManager = new SpriteManager();
