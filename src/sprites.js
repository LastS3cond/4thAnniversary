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

    // 4. White Shoe Rack Leaning Against the Bathroom Wall (24x36)
    const { canvas: shoeRack, ctx: srCtx } = this.createCanvas(24, 36);
    // Vertical frame leaning against the wall on left
    srCtx.fillStyle = '#e2e2e2';
    srCtx.fillRect(0, 4, 4, 30);  // Left vertical support upright against wall
    srCtx.fillRect(18, 8, 4, 26); // Right slanted support
    // Angled shoe shelves
    srCtx.fillStyle = '#ffffff';
    srCtx.fillRect(2, 10, 18, 4);
    srCtx.fillRect(2, 20, 18, 4);
    srCtx.fillRect(2, 30, 18, 4);
    // New Balance sneakers on the shelves (Navy / Grey / White)
    srCtx.fillStyle = '#4a5568'; // Navy sneaker
    srCtx.fillRect(4, 9, 7, 3);
    srCtx.fillRect(12, 9, 7, 3);
    srCtx.fillStyle = '#718096'; // Grey sneaker
    srCtx.fillRect(4, 19, 7, 3);
    srCtx.fillRect(12, 19, 7, 3);
    srCtx.fillStyle = '#e2e8f0'; // White sneaker
    srCtx.fillRect(4, 29, 7, 3);
    srCtx.fillRect(12, 29, 7, 3);
    // Tiny white N logos
    srCtx.fillStyle = '#ffffff';
    srCtx.fillRect(7, 9, 2, 1);
    srCtx.fillRect(15, 19, 2, 1);
    this.env.shoeRack = shoeRack;

    // 5. White Long Folding Table Rotated 90 Degrees (Vertical, Longer: 32x84)
    const { canvas: puzzleTable, ctx: ptCtx } = this.createCanvas(32, 84);
    // White plastic folding tabletop (longer, oriented vertically)
    ptCtx.fillStyle = '#f5f5f5';
    ptCtx.fillRect(2, 2, 28, 80);
    ptCtx.fillStyle = '#dcdcdc'; // Beveled edge trim
    ptCtx.strokeRect(2, 2, 28, 80);
    // Folding metal leg hinges visible at top and bottom
    ptCtx.fillStyle = '#999999';
    ptCtx.fillRect(0, 6, 2, 8);
    ptCtx.fillRect(30, 6, 2, 8);
    ptCtx.fillRect(0, 70, 2, 8);
    ptCtx.fillRect(30, 70, 2, 8);

    // --- TOP HALF OF TABLE: CUTE PUZZLE OF DUCKLINGS & FLOWERS ---
    ptCtx.fillStyle = '#224a37'; // Pond water backing
    ptCtx.fillRect(4, 4, 24, 36);
    ptCtx.strokeStyle = '#183829';
    ptCtx.lineWidth = 1;
    ptCtx.strokeRect(4, 4, 24, 36);

    // Lily pads
    ptCtx.fillStyle = '#488b48';
    ptCtx.fillRect(7, 8, 8, 6);
    ptCtx.fillRect(15, 22, 9, 6);
    ptCtx.fillRect(6, 28, 7, 5);

    // Cute yellow baby ducklings!
    // Duckling 1 (Top)
    ptCtx.fillStyle = '#ffd13b';
    ptCtx.fillRect(15, 10, 6, 5); // Body
    ptCtx.fillRect(19, 8, 4, 4);  // Head
    ptCtx.fillStyle = '#ff7700';  // Beak
    ptCtx.fillRect(23, 9, 2, 2);
    ptCtx.fillStyle = '#111111';  // Eye
    ptCtx.fillRect(20, 8, 1, 1);

    // Duckling 2 (Middle)
    ptCtx.fillStyle = '#ffd13b';
    ptCtx.fillRect(9, 18, 5, 5);  // Body
    ptCtx.fillRect(7, 16, 4, 4);  // Head
    ptCtx.fillStyle = '#ff7700';
    ptCtx.fillRect(5, 17, 2, 2);
    ptCtx.fillStyle = '#111111';
    ptCtx.fillRect(8, 16, 1, 1);

    // Flowers (Pink water lilies & white blossoms)
    ptCtx.fillStyle = '#ff88aa';  // Pink water lily
    ptCtx.fillRect(8, 10, 4, 4);
    ptCtx.fillStyle = '#ffffff';
    ptCtx.fillRect(9, 11, 2, 2);

    ptCtx.fillStyle = '#ffffff';  // White flower
    ptCtx.fillRect(17, 24, 4, 4);
    ptCtx.fillStyle = '#ffd700';  // Yellow center
    ptCtx.fillRect(18, 25, 2, 2);

    // --- BOTTOM HALF OF TABLE: CLUTTER, BLUE CUPS & PENS ---
    // Tall blue plastic cup (Photo 1)
    ptCtx.fillStyle = '#1b56a3';
    ptCtx.fillRect(10, 46, 8, 12);
    ptCtx.fillStyle = '#3a79d0';
    ptCtx.fillRect(11, 47, 6, 3);

    // Second blue cup
    ptCtx.fillStyle = '#1b56a3';
    ptCtx.fillRect(12, 64, 7, 10);
    ptCtx.fillStyle = '#3a79d0';
    ptCtx.fillRect(13, 65, 5, 2);

    // Pens and pencils lying on table
    ptCtx.fillStyle = '#111111';  // Black pen
    ptCtx.fillRect(21, 50, 2, 14);
    ptCtx.fillStyle = '#d9333f';  // Red pen
    ptCtx.fillRect(6, 56, 2, 12);
    this.env.puzzleTable = puzzleTable;

    // 6. Kitchen Stove with Warm Oven (36x44) (Photo 1) - Microwave removed to reduce clutter
    const { canvas: stove, ctx: stCtx } = this.createCanvas(36, 44);
    // Backguard panel with control dials
    stCtx.fillStyle = '#e8e8e8';
    stCtx.fillRect(0, 0, 36, 12);
    stCtx.fillStyle = '#222222';
    stCtx.fillRect(12, 2, 12, 6); // digital clock/timer display
    stCtx.fillStyle = '#00ff44';
    stCtx.fillRect(14, 3, 8, 4);  // clock digits
    // Burner control knobs
    stCtx.fillStyle = '#444444';
    stCtx.fillRect(3, 4, 3, 4);
    stCtx.fillRect(7, 4, 3, 4);
    stCtx.fillRect(26, 4, 3, 4);
    stCtx.fillRect(30, 4, 3, 4);

    // Stovetop surface
    stCtx.fillStyle = '#f5f5f5';
    stCtx.fillRect(0, 12, 36, 16);
    // 4 coil burners
    stCtx.fillStyle = '#222222';
    stCtx.fillRect(4, 14, 6, 6);
    stCtx.fillRect(18, 14, 6, 6);
    stCtx.fillRect(4, 21, 6, 6);
    stCtx.fillRect(18, 21, 6, 6);
    // Warm red burner glow (aroma of brown sugar and dates!)
    stCtx.fillStyle = '#ff4422';
    stCtx.fillRect(5, 15, 4, 4);

    // Oven body & door
    stCtx.fillStyle = '#e0e0e0';
    stCtx.fillRect(0, 28, 36, 16);
    // Oven handle
    stCtx.fillStyle = '#333333';
    stCtx.fillRect(4, 29, 28, 2);
    // Tinted oven glass window
    stCtx.fillStyle = '#2a1a10';
    stCtx.fillRect(5, 33, 26, 9);
    // Warm oven light glow inside
    stCtx.fillStyle = 'rgba(255, 170, 50, 0.4)';
    stCtx.fillRect(7, 35, 22, 6);
    this.env.stove = stove;

    // 7. Kitchen Sink with Crooked Mini-Blind Window - FLIPPED 180° (36x42) (Photo 2)
    // Counter/basin is in front (North facing room), window/crooked blinds behind against wall (South)
    const { canvas: sink, ctx: skCtx } = this.createCanvas(36, 42);
    // Front counter facing the room
    skCtx.fillStyle = '#242424';
    skCtx.fillRect(0, 0, 36, 20);
    // Stainless steel sink basin with dishes
    skCtx.fillStyle = '#778899';
    skCtx.fillRect(6, 3, 24, 14);
    skCtx.fillStyle = '#5c6d7e';
    skCtx.fillRect(8, 5, 20, 10);
    // Dirty dishes stacked in basin
    skCtx.fillStyle = '#e6e6e6';
    skCtx.fillRect(9, 7, 7, 6); // small plate
    skCtx.fillStyle = '#ffffff';
    skCtx.fillRect(17, 6, 9, 8); // big plate
    // Chrome faucet facing into basin
    skCtx.fillStyle = '#cccccc';
    skCtx.fillRect(17, 0, 3, 5);
    // Blue Dawn dish soap bottle (Photo 2)
    skCtx.fillStyle = '#0088ff';
    skCtx.fillRect(31, 2, 3, 7);
    // Pink cleaning gloves hanging on left
    skCtx.fillStyle = '#ff5588';
    skCtx.fillRect(1, 4, 3, 8);

    // Window mounted on the south wall behind the counter
    skCtx.fillStyle = '#4a3528'; // window frame
    skCtx.fillRect(4, 20, 28, 22);
    skCtx.fillStyle = '#0a101d'; // night sky through glass
    skCtx.fillRect(6, 22, 24, 18);
    // Iconic Crooked mini blinds at steep 45° angle (Photo 2)!
    skCtx.strokeStyle = '#ffffff';
    skCtx.lineWidth = 1.5;
    skCtx.beginPath();
    skCtx.moveTo(8, 24);
    skCtx.lineTo(28, 36); // Sharp crooked slant!
    skCtx.moveTo(8, 28);
    skCtx.lineTo(28, 40);
    skCtx.stroke();
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

    // 10. Freestanding Punching Bag Contraption with Sandbag Legs (40x60)
    const { canvas: punchBag, ctx: pbCtx } = this.createCanvas(40, 60);
    // Heavy tubular steel frame
    // Upright main pole
    pbCtx.fillStyle = '#222222';
    pbCtx.fillRect(6, 6, 4, 48);
    pbCtx.fillStyle = '#444444';
    pbCtx.fillRect(8, 6, 2, 48); // metal highlight
    // Overhead cantilever arched arm
    pbCtx.fillStyle = '#222222';
    pbCtx.fillRect(6, 4, 18, 4);
    pbCtx.fillRect(20, 6, 4, 6);
    // Steel hanging chain & swivel
    pbCtx.strokeStyle = '#aaaaaa';
    pbCtx.lineWidth = 1.5;
    pbCtx.beginPath();
    pbCtx.moveTo(22, 10);
    pbCtx.lineTo(22, 18);
    pbCtx.stroke();
    // Heavy black punching bag
    pbCtx.fillStyle = '#141414';
    pbCtx.fillRect(15, 18, 14, 28);
    pbCtx.fillStyle = '#2a2a2a';
    pbCtx.fillRect(17, 18, 4, 28); // bag sheen
    pbCtx.fillStyle = '#d9333f'; // Red reinforced collar strap
    pbCtx.fillRect(15, 19, 14, 2);

    // --- FREESTANDING BASE CONTRAPTION LEGS ---
    // Metal support legs extending diagonally on the floor
    pbCtx.fillStyle = '#1c1c1c';
    pbCtx.fillRect(2, 52, 12, 4);  // Left support foot
    pbCtx.fillRect(6, 54, 28, 4);  // Center/right cross brace foot
    pbCtx.fillRect(28, 52, 10, 4); // Far right stabilizing foot

    // --- HEAVY SANDBAGS RESTING ON BASE LEGS TO KEEP IT UPRIGHT ---
    // Sandbag 1 (Left leg sandbag)
    pbCtx.fillStyle = '#c5b382'; // Canvas tan sandbag
    pbCtx.fillRect(1, 48, 12, 7);
    pbCtx.fillStyle = '#9e8d5f'; // Sandbag shadow & tied seams
    pbCtx.fillRect(1, 54, 12, 2);
    pbCtx.fillRect(0, 50, 2, 3); // tied end knot

    // Sandbag 2 (Right leg sandbag)
    pbCtx.fillStyle = '#c5b382';
    pbCtx.fillRect(25, 48, 13, 7);
    pbCtx.fillStyle = '#9e8d5f';
    pbCtx.fillRect(25, 54, 13, 2);
    pbCtx.fillRect(37, 50, 2, 3);

    // Sandbag 3 (Center stack)
    pbCtx.fillStyle = '#bfa975';
    pbCtx.fillRect(5, 45, 10, 6);
    pbCtx.fillStyle = '#8f7e53';
    pbCtx.fillRect(5, 50, 10, 1);

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
