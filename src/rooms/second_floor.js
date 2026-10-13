/**
 * Room: Second floor hallway (narrow corridor x: 280..360)
 * South -> North: Bathroom | Alex, Storage | wall, Kevin | Jaydon
 *
 * Knocking on Jaydon's door plays a short cutscene (he steps out beside Mallika), then the
 * battle encounter starts.
 */
(() => {
  const { screenRect: A } = WorldArt;
  const { say, ask } = Interact;

  // A door on the left ('L') or right ('R') corridor wall; its frame starts 5 art px above `y`.
  // No labels; Jaydon's has the gold trim.
  const hallDoor = (side, y, gold) => (ctx, S, H) => {
    const dx = side === 'L' ? 122 : 183;
    const dy = y - 5;
    const trim = gold ? '#e6c04a' : '#f4efe4';
    H.R(dx - 1, dy - 1, 17, 31, '#000000');
    H.R(dx, dy, 15, 30, trim);
    if (gold) { H.R(dx, dy, 15, 1, '#fff0a0'); H.R(dx, dy, 1, 30, '#fff0a0'); }
    H.R(dx + 1, dy + 1, 13, 29, PAL.wood);
    H.R(dx + 1, dy + 1, 13, 1, '#9a6a43');
    H.R(dx + 3, dy + 4, 9, 10, PAL.woodMid);
    H.R(dx + 3, dy + 17, 9, 10, PAL.woodMid);
    H.R(dx + 3, dy + 4, 9, 1, '#9a6a43');
    H.R(dx + 3, dy + 17, 9, 1, '#9a6a43');
    const kx = side === 'L' ? dx + 12 : dx + 2;
    H.R(kx, dy + 15, 1, 2, PAL.brass); H.P(kx, dy + 15, PAL.brassHi);
  };

  // Set once Jaydon has stepped out: his door is drawn swung open
  let jaydonDoorOpen = false;

  // Jaydon steps out into the hallway, to the SIDE of Mallika (never behind her):
  // Mallika keeps the left half of the 80px corridor, Jaydon takes the right half.
  function startJaydonEntrance(game) {
    const p = game.player;
    jaydonDoorOpen = true;
    const mallikaX = Math.min(p.x, 276);
    const jaydonX = Math.max(316, Math.min(322, mallikaX + 44));
    const jaydon = { room: 'second_floor', x: 352, y: p.y - 2, dir: 'left', character: 'jaydon' };
    game.npcs.push(jaydon);
    const c = { t: 0, duration: 520, fromX: p.x, toX: mallikaX, jFromX: 352, jToX: jaydonX };
    p.dir = 'right';
    game.playCutscene({
      update(dt) {
        c.t = Math.min(c.duration, c.t + dt);
        const k = c.t / c.duration;
        const ease = k * (2 - k);
        p.x = c.fromX + (c.toX - c.fromX) * ease;
        jaydon.x = c.jFromX + (c.jToX - c.jFromX) * ease;

        // Little walk cycle while Mallika steps aside
        if (Math.abs(c.toX - c.fromX) > 1 && k < 1) {
          p.animTimer += dt;
          if (p.animTimer >= 140) {
            p.animTimer = 0;
            p.walkFrame = (p.walkFrame === 1) ? 2 : 1;
          }
        } else {
          p.walkFrame = 0;
        }

        if (k >= 1) {
          p.walkFrame = 0;
          game.endCutscene();
          say([
            "* The door opens with a gentle click.",
            "* Jaydon steps into the hallway wearing glasses, a long-sleeve shirt, and red plaid pajama pants."
          ], () => {
            // Launch the Undertale encounter flash!
            game.triggerBattleEncounter('jaydon');
          });
        }
      }
    });
  }

  window.mapManager.addRoom({
    name: 'second_floor',
    bgm: 'home',
    spawn: { x: 300, y: 372, dir: 'up' },
    walls: [
      { x: 0, y: 0, w: 280, h: 480 },
      { x: 360, y: 0, w: 280, h: 480 },
      { x: 280, y: 0, w: 80, h: 65 },
      { x: 0, y: 455, w: 640, h: 25 }
    ],
    objects: [
      {
        name: 'Bathroom',
        at: { x: 255, y: 280, w: 30, h: 48 },
        text: ["* You don't have to use the bathroom right now."],
        art: hallDoor('L', 140)
      },
      {
        name: "Alex's room",
        at: { x: 355, y: 280, w: 30, h: 48 },
        text: ["* You hear yelling and furious typing. Must be playing a game."],
        art: hallDoor('R', 140)
      },
      {
        name: 'Storage',
        at: { x: 255, y: 180, w: 30, h: 48 },
        text: ["* There are some suitcases in here."],
        art: hallDoor('L', 90)
      },
      {
        name: "Kevin's room",
        at: { x: 255, y: 80, w: 30, h: 48 },
        text: ["* You hear him speaking very formally, must be interviewing."],
        art: hallDoor('L', 40)
      },
      {
        name: "Jaydon's room",            // knocking starts the encounter
        at: { x: 355, y: 80, w: 30, h: 48 },
        art: hallDoor('R', 40, true),
        onInteract: (game) => ask("* Knock on Jaydon's door?", () => {
          if (window.audioManager) window.audioManager.playDoor();
          startJaydonEntrance(game);
        }, ["* You decide to wait a moment."])
      },
      {
        name: 'Stairs down',
        at: { x: 285, y: 435, w: 70, h: 25 },
        door: { to: 'staircase', x: 325, y: 88, dir: 'down' }
      }
    ],
    buildBackground: (ctx, S, H) => {
      H.R(0, 0, 320, 240, PAL.void);
      // side wall faces + caps
      H.R(102, 2, 2, 212, PAL.cap); H.R(216, 2, 2, 212, PAL.cap);
      H.R(104, 4, 36, 208, PAL.wallSide); H.R(180, 4, 36, 208, PAL.wallSide);
      H.R(104, 4, 36, 1, PAL.wallShade); H.R(180, 4, 36, 1, PAL.wallShade);
      H.R(137, 4, 3, 208, PAL.base); H.R(137, 4, 1, 208, PAL.baseHi);
      H.R(180, 4, 3, 208, PAL.base); H.R(182, 4, 1, 208, PAL.baseHi);
      H.R(102, 2, 116, 2, PAL.cap);
      // end-of-hallway north wall
      H.R(140, 4, 40, 28, PAL.wall);
      H.R(140, 4, 40, 1, PAL.wallShade);
      H.R(140, 29, 40, 3, PAL.base);
      H.R(140, 29, 40, 1, PAL.baseHi);

      // carpet + runner with a rich brown border
      H.R(140, 32, 40, 180, PAL.carpet);
      H.R(146, 32, 28, 180, '#a3846a');
      H.R(146, 32, 1, 180, '#6b4630'); H.R(173, 32, 1, 180, '#6b4630');
      H.R(148, 32, 1, 180, '#c4a888'); H.R(171, 32, 1, 180, '#c4a888');

      // stairs opening at the south end of the hallway
      H.R(140, 212, 40, 28, '#000000');
      const treads = ['#c8b294', '#b9a387', '#a5907a', '#8b7864', '#6f604f'];
      treads.forEach((c, i) => {
        const y = 212 + i * 5;
        H.R(142, y, 36, 5, c);
        H.R(142, y, 36, 1, i === 0 ? PAL.carpetLight : '#cbb79c');
        H.R(142, y + 4, 36, 1, 'rgba(0,0,0,0.25)');
      });
      H.R(141, 212, 1, 28, PAL.woodMid); H.R(178, 212, 1, 28, PAL.woodMid);
      H.R(102, 212, 38, 2, PAL.cap); H.R(180, 212, 38, 2, PAL.cap);
    },
    drawUnder: (ctx) => {
      // Jaydon's door swings open once he steps out
      if (jaydonDoorOpen) {
        A(ctx, 184, 36, 13, 29, '#120c09');
        A(ctx, 184, 36, 13, 1, '#2a1d15');
        A(ctx, 184, 56, 13, 9, 'rgba(255,214,140,0.16)');
        A(ctx, 184, 36, 2, 29, '#3b2216');
      }
    }
  });
})();
