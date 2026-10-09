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
  // ==========================================
  // JAYDON OVERWORLD SPRITE (Steps out of bedroom)
  // Curly hair stopping at ear level, glasses, grey crewneck,
  // red plaid pajama pants, and barefoot (no shoes)!
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
      'E': '#3b82f6', // Blue eyes
      'T': '#a8abb0', // Heather grey long sleeve
      't': '#8e9196', // Seams
      'C': '#ffea75', // Chest crest/logo
      'R': '#c72228', // Red plaid base
      'K': '#48080c'  // Black/dark plaid criss-cross grid
    };

    const pattern = [
      "      HHHHHHH       ",
      "    HhhHHhhhhHH     ",
      "   HhhHHHhhhhhhH    ",
      "   HhSSSSSSSSShH    ",
      "   HhGGgE ssGGgh    ",
      "   HhGGSsssGGSh     ", // Hair ends at ear level
      "    SSSSSSSSSSS     ",
      "     SSSSSSSSS      ",
      "    TTTTTTTTTTT     ",
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
      "    SSSS   SSSS     ", // Barefoot (no shoes!)
      "    ssss   ssss     "
    ];

    const { canvas, ctx } = this.createCanvas(w, h);
    this.drawGrid(ctx, 0, 0, scale, colors, pattern);
    this.jaydonOverworld = canvas;
  }

  // ==========================================
  // JAYDON BATTLE SPRITE (Large Undertale style, ~144x192 px)
  // Curly hair stopping at ear level, clear blue eyes (no black),
  // arms resting naturally at sides, longer torso, red plaid pants, barefoot!
  // ==========================================
  generateJaydonBattleSprite() {
    const scale = 3;
    const w = 48 * scale;
    const h = 64 * scale;

    const colors = {
      'H': '#2b1a13', // Deep brown curly hair
      'h': '#442e23', // Curly hair curls
      'S': '#f6cbb0', // Skin
      's': '#deaf93', // Skin contour
      'G': '#4b5563', // Soft steel grey glasses frame (no harsh black)
      'g': '#ffffff', // Glass shine
      'E': '#3b82f6', // Bright clear blue eyes
      'e': '#60a5fa', // Blue eye highlight
      'M': '#6a2a2e', // Small gentle smile
      'T': '#b8bac0', // Heather grey long sleeve
      't': '#9ea1a7', // Shirt shading
      'C': '#ecd466', // Shirt chest logo
      'R': '#cc1e24', // Red plaid pajama base
      'K': '#3e060a'  // Dark plaid crosshatch
    };

    const pattern = [
      "                 HHHHHHHHHHHHHH                 ",
      "              HHhhhhhhhHHhhhhhhhHH              ",
      "            HHhhhhhhhhhhhhhhhhhhhhHH            ",
      "           HhhhhhhhhhhhhhhhhhhhhhhhH            ",
      "          HHhhHHHHHHHHHHHHHHHHHHhhhhHH          ",
      "          HhhHSSSSSSSSSSSSSSSSSSShhhHH          ",
      "          HhhHSSGGGGGgSSSSGGGGGgShhhHH          ",
      "          HhhHSgEEEEgSSSSgEEEEgSShhHH           ", // Clear bright blue eyes (no black)
      "          HhhHSSgEEgSSSSSSgEEgSShhhHH           ", // Hair stops around ear
      "               SSSSSSSSSSSSSSSS                 ",
      "               SSSSssSSssSSSSSS                 ",
      "               SSSSSSMMMMSSSSSS                 ", // Smaller lips
      "               SSSSSSSMMSSSSSSS                 ",
      "                SSSSSSSSSSSSSS                  ",
      "                 SSSSSSSSSSSS                   ",
      "             TTTTTTTTTTTTTTTTTTTT               ",
      "          TT TTTTTTTTTTTTTTTTTTTT TT            ", // Distinct arms starting at shoulders
      "         TTT TTTTTTTTCTTTTTTTTTTT TTT           ",
      "        TTTT TTTTTTTCCCTTTTTTTTTT TTTT          ",
      "        TTTT TTTTTTTTCTTTTTTTTTTT TTTT          ",
      "        TTTT TTTTTTTTTTTTTTTTTTTT TTTT          ",
      "        tttt TTTTTTTTTTTTTTTTTTTT tttt          ", // Elbows
      "        tttt TTTTTTTTTTTTTTTTTTTT tttt          ",
      "        tttt TTTTTTTTTTTTTTTTTTTT tttt          ", // Forearms
      "        SSSS TTTTTTTTTTTTTTTTTTTT SSSS          ", // Hands resting naturally at sides
      "        SSSS tttttttttttttttttttt SSSS          ",
      "        ssss RKRKRKRKRKRKRKRKRKRK ssss          ",
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
      "          SSSSSSSSS     SSSSSSSSS               ", // Barefoot (no shoes!)
      "          sssssssss     sssssssss               "
    ];

    const { canvas, ctx } = this.createCanvas(w, h);
    this.drawGrid(ctx, 0, 0, scale, colors, pattern);
    this.jaydonBattle = canvas;
  }

  // ==========================================
  // JAYDON DIALOGUE PORTRAITS (Neutral, Blush, Laugh, Surprised, Smoke/Cough)
  // Displayed in battle dialogue box with blue eyes & ear-length hair!
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
      'E': '#3b82f6', // Blue eyes
      'e': '#1d4ed8',
      'M': '#6a2a2e',
      'B': '#ff4766', // Bright blush pink
      'W': '#ffffff',
      'C': '#cccccc',
      'T': '#a8abb0'
    };

    // 1. NEUTRAL PORTRAIT (Blue eyes, hair stops at ear, small smile)
    const neutralPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH     ",
      "    HHhhHHHHHHHHHHHHhhhhH    ",
      "    HhhHSSSSSSSSSSSSShhhH    ",
      "    HhhHSSGGgEEgSSGGgEEgSh   ",
      "    HhhHSGGGEEGgSGGGEEGgSh   ",
      "    HhhHSSGGGGgSSGGGGgShh    ",
      "        SSSSSSSSSSSSSSSS     ",
      "        SSSSSssSSssSSSSS     ",
      "        SSSSSsMMMMsSSSSS     ",
      "         SSSSSSMMSSSSSS      ",
      "          SSSSSSSSSSSS       ",
      "           SSSSSSSSSS        ",
      "          TTTTTTTTTTTT       "
    ];

    // 2. BLUSH PORTRAIT (Flirt action: Cheeks bright red, shy cute smile)
    const blushPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH     ",
      "    HHhhHHHHHHHHHHHHhhhhH    ",
      "    HhhHSSSSSSSSSSSSShhhH    ",
      "    HhhHSSGGgEEgSSGGgEEgSh   ",
      "    HhhHSGGGEEGgSGGGEEGgSh   ",
      "    HhhHSSGGGGgSSGGGGgShh    ",
      "        SSBBssSSssBBSSSS     ",
      "        SBBBBsssssBBBBSS     ",
      "        SSSSSsMMMMsSSSSS     ",
      "         SSSSSSMMSSSSSS      ",
      "          SSSSSSSSSSSS       ",
      "           SSSSSSSSSS        ",
      "          TTTTTTTTTTTT       "
    ];

    // 3. SURPRISED / FIGHT REACTION PORTRAIT (Clean circle 'o' shocked mouth!)
    const surprisedPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH     ",
      "    HHhhHHHHHHHHHHHHhhhhH    ",
      "    HhhHSSSSSSSSSSSSShhhH    ",
      "    HhhHSSGgEEgGSSGgEEgGSh   ",
      "    HhhHSGGGEEGgSGGGEEGgSh   ",
      "    HhhHSSGGGGgSSGGGGgShh    ",
      "        SSSSSSSSSSSSSSSS     ",
      "        SSSSSsMMMMsSSSSS     ",
      "        SSSSSMMssMMSSSSS     ",
      "         SSSSMMssMMSSSS      ",
      "          SSSSMMMMSSSS       ",
      "           SSSSSSSSSS        ",
      "          TTTTTTTTTTTT       "
    ];

    // 4. LAUGH PORTRAIT (Crinkled eyes, happy warm smile)
    const laughPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH     ",
      "    HHhhHHHHHHHHHHHHhhhhH    ",
      "    HhhHSSSSSSSSSSSSShhhH    ",
      "    HhhHSSG^^GgSSG^^GgShh    ",
      "    HhhHSGGGGGgSGGGGGgShh    ",
      "    HhhHSSGGGGSSGGGGSSSh     ",
      "        SSSSSSSSSSSSSSSS     ",
      "        SSSSSsMMMMsSSSSS     ",
      "        SSSSSMMMMMMSSSSS     ",
      "         SSSSSSMMSSSSSS      ",
      "          SSSSSSSSSSSS       ",
      "           SSSSSSSSSS        ",
      "          TTTTTTTTTTTT       "
    ];

    // 5. COUGH / SMOKE PORTRAIT (Smoke act: coughing, little puff of smoke)
    const coughPattern = [
      "        HHHHHHHHHHHHH        ",
      "      HHhhhhhHHhhhhhhHH      ",
      "     HhhhhhhhhhhhhhhhhhH  CC ",
      "    HHhhHHHHHHHHHHHHhhhhHCCC ",
      "    HhhHSSSSSSSSSSSSShhhCC   ",
      "    HhhHSSG><GgSSG><GgShHC   ",
      "    HhhHSGGGGGgSGGGGGgShh    ",
      "        SSSSSSSSSSSSSSSS     ",
      "        SSSSSssSSssSSSSS     ",
      "        SSSSsMMMMsSSSSSS     ",
      "         SSSSMMMMSSSSSS      ",
      "          SSSSSSSSSSSS       ",
      "           SSSSSSSSSS        ",
      "          TTTTTTTTTTTT       "
    ];

    const list = [
      { name: 'neutral', pat: neutralPattern },
      { name: 'blush', pat: blushPattern },
      { name: 'surprised', pat: surprisedPattern },
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

    // 5. White Long Folding Table Rotated 90 Degrees - BIGGER (36x96)
    const { canvas: puzzleTable, ctx: ptCtx } = this.createCanvas(36, 96);
    // White plastic folding tabletop (longer & wider, oriented vertically)
    ptCtx.fillStyle = '#f5f5f5';
    ptCtx.fillRect(2, 2, 32, 92);
    ptCtx.fillStyle = '#dcdcdc'; // Beveled edge trim
    ptCtx.strokeRect(2, 2, 32, 92);
    // Folding metal leg hinges visible at top and bottom
    ptCtx.fillStyle = '#999999';
    ptCtx.fillRect(0, 6, 2, 10);
    ptCtx.fillRect(34, 6, 2, 10);
    ptCtx.fillRect(0, 80, 2, 10);
    ptCtx.fillRect(34, 80, 2, 10);

    // --- TOP HALF OF TABLE: CUTE PUZZLE OF DUCKLINGS & FLOWERS ---
    ptCtx.fillStyle = '#224a37'; // Pond water backing
    ptCtx.fillRect(4, 4, 28, 42);
    ptCtx.strokeStyle = '#183829';
    ptCtx.lineWidth = 1;
    ptCtx.strokeRect(4, 4, 28, 42);

    // Lily pads
    ptCtx.fillStyle = '#488b48';
    ptCtx.fillRect(7, 8, 9, 7);
    ptCtx.fillRect(17, 24, 10, 7);
    ptCtx.fillRect(6, 32, 8, 6);

    // Cute yellow baby ducklings!
    // Duckling 1 (Top)
    ptCtx.fillStyle = '#ffd13b';
    ptCtx.fillRect(17, 10, 7, 6); // Body
    ptCtx.fillRect(21, 8, 5, 5);  // Head
    ptCtx.fillStyle = '#ff7700';  // Beak
    ptCtx.fillRect(26, 9, 3, 2);
    ptCtx.fillStyle = '#111111';  // Eye
    ptCtx.fillRect(23, 8, 1, 1);

    // Duckling 2 (Middle)
    ptCtx.fillStyle = '#ffd13b';
    ptCtx.fillRect(9, 20, 6, 6);  // Body
    ptCtx.fillRect(7, 18, 5, 5);  // Head
    ptCtx.fillStyle = '#ff7700';
    ptCtx.fillRect(4, 19, 3, 2);
    ptCtx.fillStyle = '#111111';
    ptCtx.fillRect(8, 18, 1, 1);

    // Flowers (Pink water lilies & white blossoms)
    ptCtx.fillStyle = '#ff88aa';
    ptCtx.fillRect(8, 10, 5, 5);
    ptCtx.fillStyle = '#ffffff';
    ptCtx.fillRect(10, 11, 2, 2);

    ptCtx.fillStyle = '#ffffff';
    ptCtx.fillRect(19, 26, 5, 5);
    ptCtx.fillStyle = '#ffd700';
    ptCtx.fillRect(20, 27, 2, 2);

    // --- BOTTOM HALF OF TABLE: CLUTTER, BLUE CUPS & PENS ---
    // Tall blue plastic cups
    ptCtx.fillStyle = '#1b56a3';
    ptCtx.fillRect(12, 54, 10, 14);
    ptCtx.fillStyle = '#3a79d0';
    ptCtx.fillRect(13, 55, 8, 3);

    ptCtx.fillStyle = '#1b56a3';
    ptCtx.fillRect(14, 74, 9, 12);
    ptCtx.fillStyle = '#3a79d0';
    ptCtx.fillRect(15, 75, 7, 2);

    // Pens and pencils lying on table
    ptCtx.fillStyle = '#111111';
    ptCtx.fillRect(25, 58, 2, 16);
    ptCtx.fillStyle = '#d9333f';
    ptCtx.fillRect(7, 66, 2, 14);
    this.env.puzzleTable = puzzleTable;

    // 6. Kitchen Stove with Warm Oven - ROTATED 90 DEGREES (44x36)
    // Sits against East wall; backguard is on East, oven door faces West into room!
    const { canvas: stove, ctx: stCtx } = this.createCanvas(44, 36);
    // Oven body / countertop surface
    stCtx.fillStyle = '#f5f5f5';
    stCtx.fillRect(0, 0, 44, 36);

    // Backguard panel on EAST side (right wall) with clock and dials
    stCtx.fillStyle = '#e0e0e0';
    stCtx.fillRect(34, 0, 10, 36);
    stCtx.fillStyle = '#222222';
    stCtx.fillRect(36, 12, 6, 12); // digital clock
    stCtx.fillStyle = '#00ff44';
    stCtx.fillRect(37, 14, 4, 8);  // timer glow
    // Burner knobs along backguard
    stCtx.fillStyle = '#444444';
    stCtx.fillRect(36, 4, 4, 3);
    stCtx.fillRect(36, 28, 4, 3);

    // 4 Coil burners in the middle
    stCtx.fillStyle = '#222222';
    stCtx.fillRect(18, 4, 6, 6);
    stCtx.fillRect(26, 4, 6, 6);
    stCtx.fillRect(18, 24, 6, 6);
    stCtx.fillRect(26, 24, 6, 6);
    // Warm red burner glow
    stCtx.fillStyle = '#ff4422';
    stCtx.fillRect(19, 5, 4, 4);

    // Oven door facing WEST (into kitchen room)
    stCtx.fillStyle = '#333333';
    stCtx.fillRect(0, 0, 4, 36);   // West edge border
    stCtx.fillStyle = '#2a1a10';  // Tinted oven glass window
    stCtx.fillRect(4, 6, 8, 24);
    stCtx.fillStyle = 'rgba(255, 170, 50, 0.4)'; // Warm oven light inside
    stCtx.fillRect(5, 8, 6, 20);
    // Oven handle
    stCtx.fillStyle = '#cccccc';
    stCtx.fillRect(2, 4, 2, 28);
    this.env.stove = stove;

    // 7. Kitchen Sink - Window REMOVED, Rotated 180° (36x28) (Photo 2)
    // Sits against South wall; faucet on South side pointing into basin!
    const { canvas: sink, ctx: skCtx } = this.createCanvas(36, 28);
    // Dark laminate counter
    skCtx.fillStyle = '#242424';
    skCtx.fillRect(0, 0, 36, 28);

    // Stainless steel basin
    skCtx.fillStyle = '#778899';
    skCtx.fillRect(6, 4, 24, 18);
    skCtx.fillStyle = '#5c6d7e';
    skCtx.fillRect(8, 6, 20, 14);

    // Dirty dishes stacked in basin
    skCtx.fillStyle = '#e6e6e6';
    skCtx.fillRect(9, 8, 7, 6); // small plate
    skCtx.fillStyle = '#ffffff';
    skCtx.fillRect(17, 8, 9, 8); // big plate

    // Chrome faucet on SOUTH side pointing North into basin (faucet rotated 180°)
    skCtx.fillStyle = '#cccccc';
    skCtx.fillRect(17, 20, 3, 6);
    skCtx.fillRect(16, 24, 5, 2);

    // Blue Dawn dish soap bottle on right
    skCtx.fillStyle = '#0088ff';
    skCtx.fillRect(31, 16, 3, 7);
    // Pink cleaning gloves on left
    skCtx.fillStyle = '#ff5588';
    skCtx.fillRect(2, 14, 3, 8);
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

    // 8. Deep Red L-Couch - CLEAR L-SHAPE, NO SWITCH! (76x56) (Photo 3)
    const { canvas: couch, ctx: cCtx } = this.createCanvas(76, 56);
    // Maroon backrest along top
    cCtx.fillStyle = '#6e141a';
    cCtx.fillRect(0, 0, 76, 14);
    // Left armrest running down full height
    cCtx.fillRect(0, 0, 10, 56);
    // Right armrest along top half
    cCtx.fillRect(68, 0, 8, 36);

    // Main horizontal seating
    cCtx.fillStyle = '#8c1f26';
    cCtx.fillRect(10, 14, 58, 22);

    // L-Chaise section extending DOWNWARD on the left
    cCtx.fillRect(10, 36, 26, 18);

    // Deep cushion seams
    cCtx.fillStyle = '#550d12';
    cCtx.fillRect(36, 14, 2, 22);
    cCtx.fillRect(10, 35, 26, 2);
    cCtx.fillRect(36, 36, 2, 18);
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
    cfCtx.fillStyle = '#f0ece1';
    cfCtx.fillRect(16, 5, 11, 9);
    cfCtx.fillStyle = '#8a857b';
    cfCtx.fillRect(18, 7, 7, 1);
    cfCtx.fillRect(18, 10, 6, 1);

    cfCtx.fillStyle = '#ffffff';
    cfCtx.fillRect(14, 11, 13, 10);
    cfCtx.fillStyle = '#7a7a7a';
    cfCtx.fillRect(16, 13, 9, 1);
    cfCtx.fillRect(16, 16, 7, 1);
    cfCtx.fillRect(16, 19, 8, 1);

    // Red pen resting across the papers
    cfCtx.fillStyle = '#d9333f';
    cfCtx.fillRect(17, 8, 8, 2);
    cfCtx.fillStyle = '#cccccc';
    cfCtx.fillRect(16, 8, 1, 2);

    // White soup/cereal bowl with spoon
    cfCtx.fillStyle = '#ffffff';
    cfCtx.beginPath();
    cfCtx.arc(32, 13, 4, 0, Math.PI * 2);
    cfCtx.fill();
    cfCtx.fillStyle = '#aaaaaa';
    cfCtx.fillRect(33, 11, 4, 1);
    this.env.coffeeTable = coffeeTable;

    // 10. Freestanding Punching Bag Contraption with Sandbag Legs - BIGGER (48x70)
    const { canvas: punchBag, ctx: pbCtx } = this.createCanvas(48, 70);
    // Heavy tubular steel frame
    pbCtx.fillStyle = '#222222';
    pbCtx.fillRect(8, 6, 5, 56);
    pbCtx.fillStyle = '#444444';
    pbCtx.fillRect(10, 6, 2, 56);
    // Overhead cantilever arched arm
    pbCtx.fillStyle = '#222222';
    pbCtx.fillRect(8, 4, 24, 5);
    pbCtx.fillRect(28, 6, 4, 6);
    // Steel hanging chain & swivel
    pbCtx.strokeStyle = '#aaaaaa';
    pbCtx.lineWidth = 1.5;
    pbCtx.beginPath();
    pbCtx.moveTo(30, 9);
    pbCtx.lineTo(26, 17);
    pbCtx.moveTo(30, 9);
    pbCtx.lineTo(34, 17);
    pbCtx.stroke();

    // Heavy leather cylinder punching bag (thicker, taller)
    pbCtx.fillStyle = '#8b1e22'; // Deep red leather bag
    pbCtx.fillRect(21, 18, 18, 40);
    pbCtx.fillStyle = '#111111'; // Black reinforced bottom
    pbCtx.fillRect(21, 52, 18, 6);
    pbCtx.fillStyle = '#222222'; // Black hanging straps
    pbCtx.fillRect(23, 18, 3, 6);
    pbCtx.fillRect(34, 18, 3, 6);

    // Support legs weighed down with heavy canvas sandbags
    pbCtx.fillStyle = '#222222';
    pbCtx.fillRect(4, 60, 40, 4); // Steel base spreaders
    // Heavy canvas sandbags
    pbCtx.fillStyle = '#bda27e'; // Tan burlap canvas
    pbCtx.fillRect(2, 58, 14, 8);
    pbCtx.fillRect(32, 58, 14, 8);
    pbCtx.fillStyle = '#8c7558'; // Sandbag stitching
    pbCtx.strokeRect(2, 58, 14, 8);
    pbCtx.strokeRect(32, 58, 14, 8);
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
