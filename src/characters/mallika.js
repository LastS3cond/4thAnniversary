/**
 * Character: Mallika (the protagonist)
 *
 * 20x30 art px, shown at 40x60. Long wavy dark brunette hair, rose glasses, denim overalls
 * with silver buckles over an olive tube top, rolled cuffs, white socks. Three frames per
 * direction: standing, step-left, step-right (right is the mirrored left).
 */
CharacterArt.define('mallika', (S) => {
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
  const frontTop = S.mirrorRows([
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
  const backTop = S.mirrorRows([
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

  const walk = { down: [], up: [], left: [], right: [] };
  for (let i = 0; i < 3; i++) {
    const down = S.fromPattern(frontTop.concat(frontLegs[i]), colors);
    const up = S.fromPattern(backTop.concat(frontLegs[i]), colors);
    const left = S.fromPattern(sideTop.concat(sideLegs[i]), colors);
    walk.down.push(S.scaleCanvas(down, 2));
    walk.up.push(S.scaleCanvas(up, 2));
    walk.left.push(S.scaleCanvas(left, 2));
    walk.right.push(S.scaleCanvas(S.flipH(left), 2));
  }

  return {
    walk,
    feet: { x: 8, y: 42, w: 24, h: 16 },   // what bumps into walls when she's the player
    baseline: 58                           // where her feet touch the floor (depth sorting)
  };
});
