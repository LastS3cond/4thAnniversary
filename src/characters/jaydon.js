/**
 * Character: Jaydon
 *
 *  - Overworld: 20x31 art px, shown at 40x62. Curly dark-brown hair ending at the ears, thin
 *    grey glasses, heather-grey crewneck long sleeve, red/black buffalo plaid pajama pants,
 *    barefoot. One standing frame per direction (down, left, right).
 *  - Battle: 72x84 art px (144x168) in three poses, plus 40x40 (80x80) portraits. Both use the
 *    same procedural face, drawHead(), so they always match.
 */
CharacterArt.define('jaydon', (S) => {
  // ---------- Overworld ----------
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
  let down = S.fromPattern(front, colors);
  down = S.applyPlaid(down, colors.R, 4);

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
  let left = S.fromPattern(side, colors);
  left = S.applyPlaid(left, colors.R, 4);

  const walk = {
    down: [S.scaleCanvas(down, 2)],
    left: [S.scaleCanvas(left, 2)],
    right: [S.scaleCanvas(S.flipH(left), 2)]
  };

  // ---------- Face (shared by the battle sprite and every portrait) ----------
  // Head occupies roughly x: 19..52, y: 1..36 relative to (ox, oy).
  // Expressions: neutral, blush, surprised, laugh, cough, dazed.
  function drawHead(ctx, ox, oy, expr) {
    const P = {
      H: '#2b1810', h: '#4a2c1c', j: '#38200f',
      S: '#f2c7a5', s: '#dca787', r: '#c98a74',
      G: '#4b5563', g: '#8a94a3',
      B: '#38bdf8', b: '#0f8fd0', W: '#ffffff',
      M: '#8e4a3e', m: '#5c2620',
      P: '#ff6b81'
    };
    const R = (x, y, w, h, c) => S.rect(ctx, ox + x, oy + y, w, h, c);
    const D = (x, y, c) => S.px(ctx, ox + x, oy + y, c);
    const disc = (x, y, rr, c) => S.disc(ctx, ox + x, oy + y, rr, c);

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

  // ---------- Battle sprite (72x84 art px -> 144x168 on screen) ----------
  function buildBattle(expr) {
    const { canvas, ctx } = S.createCanvas(72, 84);
    const T = '#7a808b';
    const t = '#5e646f';
    const u = '#9aa0aa';
    const skin = '#f2c7a5';
    const skinShade = '#dca787';
    const R = (x, y, w, h, c) => S.rect(ctx, x, y, w, h, c);
    const D = (x, y, c) => S.px(ctx, x, y, c);

    // --- Pants (drawn first, plaid applied later) ---
    R(23, 61, 26, 6, '#991b1b');
    R(23, 66, 12, 13, '#991b1b');
    R(37, 66, 12, 13, '#991b1b');
    R(35, 66, 2, 2, '#991b1b');
    R(23, 66, 2, 13, '#5e1111'); R(37, 66, 2, 13, '#5e1111');

    // --- Bare feet ---
    R(23, 79, 11, 3, skin); R(38, 79, 11, 3, skin);
    R(22, 81, 12, 2, skin); R(38, 81, 12, 2, skin);
    D(23, 82, skinShade); D(25, 82, skinShade); D(27, 82, skinShade); D(44, 82, skinShade); D(46, 82, skinShade); D(48, 82, skinShade);
    R(23, 79, 11, 1, skinShade); R(38, 79, 11, 1, skinShade);

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
    R(15, 59, 6, 6, skin); R(51, 59, 6, 6, skin);
    R(16, 65, 4, 1, skin); R(52, 65, 4, 1, skin);
    D(16, 63, skinShade); D(18, 63, skinShade); D(53, 63, skinShade); D(55, 63, skinShade);
    R(15, 59, 6, 1, skinShade); R(51, 59, 6, 1, skinShade);

    // --- Neck + crew collar ---
    R(32, 33, 8, 5, skin);
    R(32, 33, 8, 2, skinShade);
    R(30, 37, 12, 1, t); R(31, 38, 10, 1, t);

    // --- Head ---
    drawHead(ctx, 0, 0, expr);

    let out = S.applyPlaid(canvas, '#991b1b', 6);
    out = S.outline(out, '#000000');
    return out;
  }

  const battle = {
    idle: S.scaleCanvas(buildBattle('neutral'), 2),
    hit: S.scaleCanvas(buildBattle('surprised'), 2),
    // Knocked flat on the floor after a hit (head to the left)
    fallen: S.scaleCanvas(S.rotateCCW(buildBattle('dazed')), 2)
  };

  // ---------- Portraits (40x40 art px -> 80x80 on screen) ----------
  const portraits = {};
  ['neutral', 'blush', 'surprised', 'laugh', 'cough', 'dazed'].forEach((expr) => {
    const { canvas, ctx } = S.createCanvas(40, 40);
    // Shoulders of his heather-grey long sleeve
    S.rect(ctx, 2, 37, 36, 3, '#7a808b');
    S.rect(ctx, 5, 36, 30, 1, '#7a808b');
    S.rect(ctx, 14, 36, 12, 1, '#5e646f');
    S.rect(ctx, 16, 33, 8, 4, '#f2c7a5');
    S.rect(ctx, 16, 33, 8, 2, '#dca787');
    drawHead(ctx, -16, 2, expr);
    const c = S.outline(canvas, '#000000');
    portraits[expr] = S.scaleCanvas(c, 2);
  });

  return {
    walk,
    baseline: 60,   // where his feet touch the floor (depth sorting)
    battle,
    portraits
  };
});
