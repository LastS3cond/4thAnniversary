# Developer Handoff Notes

> **Purpose**: Practical advice for whoever works on this game next: how the pieces fit together, the conventions the code relies on, the traps, and how to check your work. It complements the other docs instead of repeating them:
> - [`README.md`](README.md): how to run it, architecture overview, file manifest, and **Adding an Interactive Object**.
> - [`scene.md`](scene.md): layout, coordinates, palettes, and character art specs.
> - [`interactions.md`](interactions.md): every line of dialogue and every interaction.
> - [`preferences.md`](preferences.md): design rules and the requester's preferences.

---

## 1. How the Code Fits Together

- **Plain scripts, no modules.** `index.html` loads classic `<script>` tags in dependency order; there is no bundler and no `import`. That is what lets the game run straight from disk (ES modules don't load from `file://`). A new file needs its own `<script>` tag: rooms go after `map_manager.js`, everything goes before `game.js`.
- **Globals.** The managers live on `window`: `game`, `mapManager`, `spriteManager`, `dialogueManager`, `battleManager`, `finaleManager`, `audioManager`. Top-level `const` / `class` names are also shared across files (`PAL`, `WorldArt`, `PropArt`, `Interact`, `TextLayout`, `TitleScreen`, `OverworldMenu`, `InputManager`). Declaring the same top-level name in two files is a SyntaxError that stops the second file from running (check the console), which is why each room file wraps its contents in `(() => { ... })()`.
- **Load time vs. run time.** Room files run as soon as they load, but sprites only exist after `spriteManager.init()` (on `DOMContentLoaded`). Only touch `S.env` / `window.spriteManager` inside `buildBackground`, `art` functions, `drawUnder` / `drawOver`, or interaction handlers, never at the top level of a room file.
- **State machine** (`game.js`): `TITLE → OVERWORLD` (with `CUTSCENE` and `ENCOUNTER_FLASH`) `→ BATTLE → FINALE`. `update()` checks things in a fixed order and returns early, so each key press is handled by one thing per frame (the Z that closes a dialogue doesn't also inspect what's in front of Mallika). Overworld order: room fade → door cooldown → dialogue → C-menu → movement (walk-in doors) → Z interactions.
- **Scripted moments.** `game.playCutscene({ update(dt) { ... } })` calls `update` every frame until it calls `game.endCutscene()`. Extra characters go in `game.npcs` as `{ room, x, y, dir, sprites, footOffset }` and are depth-sorted like Mallika. Jaydon's entrance at the bottom of `src/rooms/second_floor.js` is the worked example.

---

## 2. Coordinates Cheat Sheet

| What | Units | Notes |
|---|---|---|
| `buildBackground`, object `art` / `prop` positions, `drawLeaves` options, `WorldArt.screenRect` | art px (320 × 240) | 1 art px = a 2 × 2 block on screen |
| `walls`, `at`, `solid`, `spawn`, door targets, `game.player`, `baseY` | screen px (640 × 480) | |

- **Mallika**: `player.x/y` is the top-left of her 40 × 60 sprite. Walls only stop her **feet box** `(x + 8, y + 42, 24 × 16)`, so her head and torso can overlap furniture. Z uses a **probe** `(x + 8, y + 35, 24 × 25)` moved 25 px in the direction she faces. Her depth line (`baseY`) is `y + 58`. She walks at 140 px/s, or 210 px/s holding X / Shift.
- **Reach rule**: Z reaches about 25 px past her feet (up to 32 px when facing up), and her feet can't enter walls. A zone for something set into a wall therefore only needs to cover the wall's first ~25 px, and it can sit entirely inside the wall's collider (the kitchen counters and the fridge work this way).
- **Sprite → zone**: a `makeProp(w, h)` sprite placed at art `(ax, ay)` shows its drawing at screen `(2·ax + 2, 2·ay + 2)`, sized `2w × 2h`. That rect is the natural starting point for `at` / `solid` (the couch matches exactly).
- **Spawn points** (a room's `spawn` and every door's `x/y`) must be outside the destination room's door zones. Otherwise Mallika bounces straight back as soon as the 800 ms door cooldown ends.
- **`walls` vs. `solid`**: when a run of fixtures shares one collider (the kitchen counters), use a single `walls` rect. `solid: true` copies `at`, which only works when the zones cover the collider exactly.
- **Moving something** means editing its `at` / `solid` (screen px) and its `art` / `prop` (art px) together, then updating `scene.md`.

---

## 3. Rendering and Caching

- Each room's background is painted **once**: first `buildBackground`, then every object's `art` (lower `layer` first, list order within a layer). The result is cached in `mapManager.bgCache`. After changing `PAL` or room art from the console, clear it with `mapManager.bgCache = {}`. For changed prop sprites, also run `spriteManager.generateEnvironmentSprites()` first.
- **Every frame**: cached background → `drawUnder(ctx, t)` → props and characters sorted by `baseY` (on a tie, the prop is drawn over the character) → `drawOver(ctx, t)` → menu, dialogue and fades (in `game.draw`). Characters snap to even screen pixels so they stay on the art grid.
- Use `art` for anything against a wall (baked in). Use `prop` only where Mallika can walk behind the object.
- Animated layers take art-px numbers but draw on the screen every frame:
  - `screenRect(ctx, x, y, w, h, color)` draws flat shapes.
  - `drawLeaves(ctx, t, {...})` is deterministic per `seed`, so give each instance its own seed. Use `up: true` for the folded-down landing wall and `clip` to keep leaves inside window panes.
  - `getGlow(r, red, green, blue)` makes a cached, stepped light pool.
  - Wrap any alpha or clip changes in `ctx.save()` / `ctx.restore()`.
- **In-world lettering** must use the pixel font: `S.drawText(ctx, text, x, y, color)` and `S.textWidth(text)`. Backgrounds are cached forever, and the web font may not be loaded yet when they're painted. The font only has `A–Z`, `0–9` and space; lowercase is upper-cased and anything else renders blank.
- **Canvas state leaks between draws.** Set `textAlign` and `textBaseline` explicitly whenever you draw text; a leaked `textAlign` once broke the battle UI.

---

## 4. Pixel-Art Toolkit Gotchas

- `S.outline(canvas)` only paints **transparent** pixels that touch opaque ones, so a fully opaque canvas gets no outline. `makeProp` adds the 1 px transparent margin that makes outlining work, which is why props are placed at `(x − 1, y − 1)`.
- `makeProp(..., { shadow: true })` keeps soft floor shadows un-outlined: pixels with alpha below 200 count as shadow.
- `applyPlaid` recolors pixels that are exactly `#991b1b` (base) or `#5e1111` (shade). Don't use those two colors for anything else in a sprite that gets plaid.
- **Character sprites are stored pre-scaled to 2×** (screen px). Environment props in `S.env` are 1× (art px).
  - `mallika.{down, up, left, right}[0..2]`: frame 0 is idle and 1 / 2 are walking; right is the mirrored left.
  - `jaydonOW.{down, left, right}`: there is no `up`, and NPC drawing falls back to `down`.
  - Also `jaydonBattle`, `jaydonBattleHit`, `jaydonBattleFallen` and `portraits.*`.
- **Jaydon's face is one function**, `drawJaydonHead(ctx, ox, oy, expr)`, shared by the battle sprites and every portrait. Expressions: `neutral`, `blush`, `surprised`, `laugh`, `cough`, `dazed`.
  - A new expression needs branches in `drawJaydonHead` and its name in `generateJaydonPortraits`.
  - A misspelled expression silently draws the neutral face; a misspelled portrait name shows no portrait at all.
- Mallika is drawn from string patterns (one character per art pixel, `.` is transparent). `mirrorRows` builds symmetric front and back rows from half-rows.

---

## 5. Perspective Conventions

The scene uses Undertale's mix of top-down floors and front-facing walls. Keep new art consistent:

- North walls are drawn upright, showing their face. Interior wall masses use `wallBlock` (dark top, cream south face, optional side bands). Thin partitions use the first floor's local `thinWall`.
- Fixtures on a **south** wall show their fronts as a band on their **north** edge. Fixtures on an **east** wall show their fronts on their **west** edge (see the kitchen runs).
- The staircase landing's south wall is folded **down**: its floor edge is at the top, so the window sill is at the top and the leaves outside rise (`up: true`). This came from a "the leaves are falling upside down" report.
- Doors seen edge-on use `sideDoor` (thin dark frame, no light casing); front-facing doors keep a casing.

---

## 6. Dialogue Gotchas

- `dialogueManager.start(pages, then, portrait)`: every array element starts a new box. Text wraps at 36 characters (24 with a portrait), 4 lines per box, and spills onto extra boxes. Start each page with `* `.
- `Interact.say` has no portrait argument. To show one of Jaydon's faces in the overworld, call `dialogueManager.start` directly.
- The box moves to the top of the screen while Mallika stands in the lower half (`player.y + 30 > 260`), so it never covers her.
- **`[ YES / NO ]` prompts** (`choice`, `Interact.ask`) leave room for only 3 lines.
  - If the wrapped prompt is longer, everything before the **last `\n`** becomes normal boxes and the last segment is the question, which is **cut to 2 lines**.
  - A long prompt with no `\n` at all shows an empty first box followed by a truncated question.
  - Keep the question short and put a `\n` before it, like the punching bag prompt.
- On the question box, Z only confirms once typing has finished. Everywhere else, Z first completes the line, then advances. X / Shift speeds typing up (and makes Mallika run in the overworld).

---

## 7. Battle and Finale Internals

- **Content** is written inline in `battle.js` (`handleActSubmenu`, `handleItemSubmenu`, `handleMercySubmenu`).
  - Set `this.jaydonPortrait` before calling `jaydonTurnReaction(text)`.
  - Use `setMultipleMessages([...])` for narration: it wraps at 26 characters and splits into 4-line boxes. `setBattleText` alone wraps but does **not** split, so long text overflows the box.
- **Menus**:
  - **ACT** is a 2 × 2 grid navigated by flipping bits (left / right flip bit 0, up / down flip bit 1), so a fifth action needs new navigation and layout.
  - **ITEM** cycles through `this.items`. Items can be reused (their `used` flag is never set).
  - Unused leftovers: `actsCompletedCount`, `jaydonAtk`, `isFighting`, `jaydonBubbleText` / `jaydonBubbleTimer`. `jaydonDef` changes but is never shown (Check always prints `DEF 999`).
- **Damage**:
  - The meter moves 50 → 550 px and back at 350 px/s.
  - accuracy = `max(0, 1 − |x + 6 − 320| / 270)`, damage = `2 + round(accuracy × 4)`, plus 1 after punching the bag.
  - Damage is capped at `jaydonHp − 1`, so at 1 HP every hit is a `MISS` and "Jaydon has pretended enough".
  - `pendingDamage` is fixed the instant Z is pressed.
- **Hit timing** (`hitFx.t`, ms after the strike): shake 200–750, damage number 220–1300, surprised sprite until 1400, cleared at 1500. The knocked-down sprite (`jaydonDown`) appears after the attack messages and resets when the button menu returns.
- **You can't lose, by design**: Jaydon never attacks (there's no dodging phase), and Smoke stops Mallika at 1 HP.
- **Finale**:
  - Pages wrap at 28 characters but are **not** split, so keep each page to 3 lines (the last one shares the box with the "♥ Always & Forever ♥" footer).
  - The gold color is hard-coded to the third page (`pageIndex === 2`); update it if you add or remove pages.
  - After the last page, Z does nothing.

---

## 8. Audio

- Everything is synthesized in `audio.js`; there are no files to load.
- Music keys: `'snowy'` (exterior; a leftover name from the winter version, harmless), `'home'` (every interior), `'battle'`, `'determination'`. A room's `bgm` must be one of these; a new track needs a `start…Bgm` function plus a branch in `playBgm`.
- `playBgm` ignores a request for the track that's already playing, so walking between rooms that share `'home'` doesn't restart the song.
- Browsers keep audio off until the first key press or click; that's what the `[ ♥ PLAY? ]` screen is for, and an in-game hint shows while audio is still off. Music runs on `setInterval`, so it can stutter in a background tab (cosmetic only).

---

## 9. Debugging From the Browser Console

Every manager is a global, so the DevTools console is the fastest tool:

```js
game.startGameFromTitle();                              // skip the title screen
game.transitionToRoom('first_floor', 420, 128, 'down'); // teleport with the fade and the right music
mapManager.currentRoom = 'staircase'; game.player.x = 255; game.player.y = 200; // instant teleport
game.hasPunchedBag = true;                              // as if the bag was punched
game.state = 'BATTLE'; battleManager.startBattle();     // straight to the battle
battleManager.jaydonHp = 2; battleManager.jaydonSparedEligible = true;
game.startFinale();                                     // straight to the ending
PAL.carpet = '#4466aa'; mapManager.bgCache = {};        // live-tweak a palette color
```

Outline walls (red), inspection zones (cyan), Mallika's feet (yellow) and her Z reach (magenta) on every frame:

```js
const draw = mapManager.drawRoom.bind(mapManager);
mapManager.drawRoom = (ctx, actors) => {
  draw(ctx, actors);
  const r = mapManager.getCurrentRoom(), p = game.player;
  const box = (b, c) => { ctx.strokeStyle = c; ctx.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1); };
  ctx.lineWidth = 1;
  r.colliders.forEach((c) => box(c, 'red'));
  r.interactables.forEach((i) => box(i, 'cyan'));
  box(game.feetBox(p.x, p.y), 'yellow');
  box(game.probeBox(), 'magenta');
};
```

Save the exact 640 × 480 frame as a PNG:

```js
Object.assign(document.createElement('a'), { href: document.getElementById('game-canvas').toDataURL(), download: 'frame.png' }).click();
```

---

## 10. Checking Your Work

- **Text**: compare every quoted string in `src/` with `interactions.md` before shipping. The requester's wording must match exactly.
- **Visuals**: walk (or teleport) through every room and look at screenshots of the canvas. Pay special attention to depth sorting (walk behind the TV and next to the shoe rack), where the dialogue box lands, and the battle UI.
- **Refactors must not change anything on screen.** The room / module refactor was checked like this:
  1. Load `index.html` in headless Chrome through the DevTools protocol.
  2. Before the game's own scripts run, inject a script that puts `performance.now`, `Date.now`, `requestAnimationFrame` and the timers on a manual clock, seeds `Math.random`, replaces `AudioContext` with a silent stub, and blocks the Google Fonts request.
  3. Play a fixed input script frame by frame (dispatching `keydown` / `keyup`). Hash the canvas at checkpoints and log every `audioManager.play*` call.
  4. Also hash `mapManager.getBackground(room)` for every room, and record what `game.checkCollision`, `game.checkDoorTriggers` and `game.checkPlayerInteractions` do at every position in every room (with `dialogueManager.start` / `startChoice` stubbed to record their calls).
  5. Run the old and new versions and compare. Break something on purpose once to prove the check catches it.

  The core of the manual clock:

  ```js
  let now = 0, queued = [];
  performance.now = () => now;
  Date.now = () => 1767225600000 + now;
  requestAnimationFrame = (cb) => queued.push(cb);
  window.step = (ms = 16) => { now += ms; const q = queued; queued = []; q.forEach((cb) => cb(now)); };
  ```

---

## 11. Known Gaps and Ideas

- **No touch controls.** The README promises mobile play, but a tap only starts the game from the title screen; moving needs a keyboard. An on-screen D-pad plus Z / X buttons that set `game.input.keysDown` / `keysPressed` would fix it.
- **No restart or save.** The finale is the end; reloading the page starts over.
- **Fonts come from Google Fonts** (the `@import` in `style.css`). Offline, text falls back to the browser's monospace font. Wrapping counts characters, so layouts survive, but it looks less like Undertale.
- **Latent prompt bug**: long `[ YES / NO ]` prompts without a `\n` (see §6). No current prompt triggers it.
- **Naming leftovers**: the music key `'snowy'`, and the README's track names (*Snowy*, *Heartache*) don't match the fall theme or the code keys (`'battle'`). Cosmetic.
- The corner microwave is decoration only, as requested.

---

## 12. Shipping

- With GitHub Pages set to deploy from `main` (root), every push is a release; there's no build step. Give Pages a minute, then hard-refresh.
- Pushing over HTTPS needs a token, not a password. A fine-grained personal access token needs **Contents: Read and write** on this repository; the default "Public repositories (read-only)" access gets a 403. macOS Keychain remembers it after the first push.
- When changes come from someone who can't push, they've been delivered as git bundles. Base the bundle on what's on GitHub: `git bundle create update.bundle main ^origin/main`. On the receiving side: `git pull --ff-only update.bundle main && git push`.

---

## 13. Working With the Requester

- **Screenshots come annotated**: red squares mean "add wall here" and red arrows mean "move this that way". They're "not pixel perfect", so interpret them generously, keep walkways and doorways clear, and say what you assumed.
- **Dialogue is given in plain words**: use it verbatim, only adding the `* ` prefix and a final period for consistency. Then check it against `interactions.md`.
- **Update the docs in the same change as the code**: `scene.md`, `interactions.md` and `preferences.md` are the reference for future redesigns.
- Share screenshots of what changed, and don't add visual changes nobody asked for.
- Keep replies short and in plain words.
