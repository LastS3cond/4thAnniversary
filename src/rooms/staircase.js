/**
 * Room: U-shaped switchback staircase
 * Flight 1 (left) down to the landing, 180 deg turn, Flight 2 (right) up.
 */
(() => {
  const { screenRect: A, drawLeaves } = WorldArt;

  window.mapManager.addRoom({
    name: 'staircase',
    bgm: 'home',
    spawn: { x: 255, y: 90, dir: 'down' },
    walls: [
      { x: 0, y: 0, w: 235, h: 480 },    // left of the shaft
      { x: 375, y: 0, w: 265, h: 480 },  // right of the shaft
      { x: 0, y: 0, w: 640, h: 50 },     // top (doorway triggers sit just below)
      { x: 0, y: 390, w: 640, h: 90 },   // below the landing wall
      { x: 235, y: 350, w: 140, h: 40 }, // landing window wall
      { x: 295, y: 40, w: 20, h: 250 }   // central wall between the flights
    ],
    objects: [
      {
        name: 'Landing window',
        at: { x: 270, y: 345, w: 70, h: 45 },
        text: [
          "* You pause at the intermediate landing.",
          "* Outside the window, leaves drift through the quiet fall night."
        ]
      },
      {
        name: 'Doorway to the first floor',
        at: { x: 235, y: 40, w: 60, h: 25 },
        door: { to: 'first_floor', x: 220, y: 340, dir: 'up' }
      },
      {
        name: 'Doorway to the second floor',
        at: { x: 315, y: 40, w: 60, h: 25 },
        door: { to: 'second_floor', x: 300, y: 372, dir: 'up' }
      }
    ],
    buildBackground: (ctx, S, H) => {
      H.R(0, 0, 320, 240, PAL.void);
      // side wall faces of the narrow shaft
      H.R(110, 2, 2, 196, PAL.cap); H.R(188 + 6, 2, 2, 196, PAL.cap);
      H.R(112, 4, 6, 192, PAL.wallSide); H.R(188, 4, 6, 192, PAL.wallSide);
      H.R(117, 4, 1, 192, PAL.base); H.R(188, 4, 1, 192, PAL.base);
      // north wall header with two doorways
      H.R(110, 2, 86, 2, PAL.cap);
      H.R(112, 4, 82, 28, PAL.wall);
      H.R(112, 4, 82, 1, PAL.wallShade);
      H.R(119, 10, 28, 22, '#f2ede2'); H.R(159, 10, 28, 22, '#f2ede2');
      H.R(120, 11, 26, 21, '#000000'); H.R(160, 11, 26, 21, '#000000');
      // doorway glows hinting where each flight leads
      H.R(120, 26, 26, 6, '#1a1410'); H.R(160, 26, 26, 6, '#1a1410');

      // Beige carpet treads: each flight gets gently deeper toward the landing,
      // so Flight 1 reads as going down and Flight 2 as climbing back up.
      const tone = ['#d2bd9f', '#cdb89a', '#c8b394', '#c3ae8f', '#bea98a', '#b9a485', '#b49f80'];
      // Flight 1 (descending toward the landing)
      for (let i = 0; i < 7; i++) {
        const y = 32 + i * 16;
        H.R(118, y, 30, 16, tone[i]);
        H.R(118, y + 13, 30, 1, PAL.carpetLight);
        H.R(118, y + 14, 30, 2, '#9c8670');
      }
      // Flight 2 (ascending north, risers face the viewer)
      for (let i = 0; i < 7; i++) {
        const y = 32 + i * 16;
        H.R(158, y, 30, 16, tone[i]);
        H.R(158, y + 10, 30, 1, PAL.carpetLight);
        H.R(158, y + 11, 30, 5, PAL.carpetShade);
        H.R(158, y + 15, 30, 1, '#8e7963');
      }
      // wall-side shadows + wooden handrails on the outer walls
      H.R(118, 32, 2, 113, 'rgba(0,0,0,0.10)'); H.R(186, 32, 2, 113, 'rgba(0,0,0,0.10)');
      H.R(118, 32, 1, 113, '#6e4426'); H.R(187, 32, 1, 113, '#6e4426');
      for (let y = 36; y < 145; y += 16) { H.P(118, y, '#4f2f1a'); H.P(187, y, '#4f2f1a'); }

      // Landing (lowest point of the switchback)
      H.R(118, 145, 70, 30, '#b49f80');
      H.R(118, 145, 70, 1, '#a08b6e');
      H.R(118, 145, 2, 30, 'rgba(0,0,0,0.10)'); H.R(186, 145, 2, 30, 'rgba(0,0,0,0.10)');

      // Central wall / handrail between the flights
      H.R(148, 4, 10, 129, PAL.wallTop);
      H.R(148, 4, 10, 1, PAL.wallTopHi);
      H.R(149, 4, 8, 129, '#6e4426');
      H.R(149, 4, 1, 129, '#8e5d38');
      H.R(148, 133, 10, 12, PAL.wall);
      H.R(148, 142, 10, 3, PAL.base);
      H.R(147, 130, 12, 3, '#5a3622');
      H.R(147, 130, 12, 1, '#8e5d38');

      // South landing wall with the double-hung window
      H.R(118, 175, 70, 20, PAL.wall);
      H.R(118, 175, 70, 2, PAL.base);
      H.R(118, 177, 70, 1, PAL.wallShade);
      H.R(110, 195, 86, 2, PAL.cap);
      // This wall is drawn folded down (its floor edge is at the top), so the sill sits up top
      H.R(134, 178, 38, 2, '#ddd8cc');
      H.R(134, 180, 38, 15, '#000000');
      H.R(135, 180, 36, 14, '#f4f1ea');
      H.R(137, 181, 32, 5, '#18213d');
      H.R(137, 188, 32, 5, '#18213d');
      H.R(135, 186, 36, 2, '#f4f1ea');
      H.R(152, 181, 2, 12, '#f4f1ea');
    },
    drawUnder: (ctx, t) => {
      // Faint cool moonlight from the landing window
      A(ctx, 136, 165, 34, 10, 'rgba(170,190,255,0.07)');
      A(ctx, 140, 158, 26, 7, 'rgba(170,190,255,0.05)');
      // A few fall leaves drifting past outside the window panes
      drawLeaves(ctx, t, {
        count: 5, small: true, up: true, x0: 132, x1: 174, y0: 176, y1: 198,
        speed: [5, 8], drift: [2, 5], sway: 3, seed: 2021,
        clip: [[137, 181, 15, 5], [154, 181, 15, 5], [137, 188, 15, 5], [154, 188, 15, 5]]
      });
    }
  });
})();
