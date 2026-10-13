/**
 * Undertale 4th Anniversary - Map manager: rooms, objects, rendering and collision queries
 *
 * Rendering model (Undertale style):
 *  - Every room background is painted ONCE at native art resolution (320 x 240) into an
 *    offscreen canvas, then blitted at exactly 2x. One art pixel = one 2x2 screen block.
 *  - Colliders, interaction zones and spawn points stay in 640 x 480 screen coordinates.
 *  - Props the player can walk behind are depth-sorted with the characters by their base y.
 *  - Small animated layers (drifting leaves, lantern, LED, oven glow) are drawn
 *    every frame on the same 2x pixel grid.
 *
 * Each room lives in src/rooms/<name>.js and registers itself with mapManager.addRoom({...}):
 *
 *   name, bgm, spawn: { x, y, dir }
 *   walls:   [{ x, y, w, h }]            solid areas that aren't objects (screen px)
 *   objects: [ ... ]                      furniture, fixtures, doors, see below
 *   buildBackground(ctx, S, H)            paints the static architecture once (art px)
 *   drawUnder(ctx, t), drawOver(ctx, t)   optional animated layers below / above the characters
 *
 * An object can have any of:
 *   name                                  a label for humans
 *   at:    { x, y, w, h }                 inspection zone (screen px)
 *   solid: true | { x, y, w, h }          blocks walking (true = the same rect as `at`)
 *   art:   { sprite, x, y, layer }        a spriteManager.env sprite painted into the background
 *          or (ctx, S, H) => {...}        (art px); a higher `layer` paints later (on top)
 *   prop:  { sprite, x, y, baseY }        a sprite drawn every frame and depth-sorted with the
 *                                         characters (art px); `baseY` (screen px) defaults to
 *                                         the bottom edge of `solid` / `at`
 *   npc:   { character, x, y, dir }       a character (src/characters/) standing here, drawn
 *                                         like the player (screen px, sprite top-left)
 *   text | choice | door | onInteract     what Z does, see src/world/interactions.js
 *
 * When the player can reach several zones at once, the object listed first wins.
 */
class MapManager {
  constructor() {
    this.currentRoom = null;   // set to the story's start room by Game.init()
    this.rooms = {};
    this.bgCache = {};
  }

  // ----------------------------------------------------
  // Room registry
  // ----------------------------------------------------
  addRoom(def) {
    const objects = def.objects || [];
    const solidRect = (o) => (o.solid === true ? o.at : o.solid);
    const room = {
      name: def.name,
      bgm: def.bgm,
      spawn: def.spawn,
      objects,
      colliders: (def.walls || []).concat(objects.filter((o) => o.solid).map(solidRect)),
      interactables: objects.filter((o) => o.at).map((o) => {
        const onEnter = o.door ? Interact.enterDoor(o.door) : null;
        return {
          name: o.name,
          x: o.at.x,
          y: o.at.y,
          w: o.at.w,
          h: o.at.h,
          isDoor: !!onEnter,
          onEnter,
          interact: Interact.behaviourFor(o, onEnter)
        };
      }),
      props: objects.filter((o) => o.prop).map((o) => {
        const base = solidRect(o) || o.at;
        return {
          sprite: o.prop.sprite,
          x: o.prop.x,
          y: o.prop.y,
          baseY: o.prop.baseY !== undefined ? o.prop.baseY : base.y + base.h
        };
      }),
      npcs: objects.filter((o) => o.npc).map((o) => o.npc),
      buildBackground: def.buildBackground,
      drawUnder: def.drawUnder,
      drawOver: def.drawOver
    };
    this.rooms[room.name] = room;
    return room;
  }

  getCurrentRoom() {
    return this.rooms[this.currentRoom];
  }

  // ----------------------------------------------------
  // Rendering
  // ----------------------------------------------------
  getBackground(room) {
    if (!this.bgCache[room.name]) {
      const S = window.spriteManager;
      const { canvas, ctx } = S.createCanvas(320, 240);
      const H = WorldArt.helpers(ctx);
      if (room.buildBackground) room.buildBackground(ctx, S, H);
      this.paintObjects(room, ctx, S, H);
      this.bgCache[room.name] = canvas;
    }
    return this.bgCache[room.name];
  }

  // Paints each object's `art` over the static background: list order, lower layers first.
  paintObjects(room, ctx, S, H) {
    const layer = (o) => (typeof o.art === 'function' ? 0 : o.art.layer || 0);
    room.objects
      .filter((o) => o.art)
      .sort((a, b) => layer(a) - layer(b))
      .forEach((o) => {
        if (typeof o.art === 'function') {
          o.art(ctx, S, H);
          return;
        }
        const img = S.env[o.art.sprite];
        if (!img) throw new Error(`Room "${room.name}": unknown sprite "${o.art.sprite}"`);
        H.img(img, o.art.x, o.art.y);
      });
  }

  // Draw the whole room: background, under-layer, depth-sorted actors & props, over-layer.
  drawRoom(ctx, actors) {
    const room = this.getCurrentRoom();
    if (!room) return;
    const t = performance.now() / 1000;
    ctx.drawImage(this.getBackground(room), 0, 0, 640, 480);
    if (room.drawUnder) room.drawUnder(ctx, t);

    const list = actors.slice();
    const S = window.spriteManager;
    room.props.forEach((p) => {
      const img = S.env[p.sprite];
      if (img) list.push({ img, x: p.x * 2, y: p.y * 2, w: img.width * 2, h: img.height * 2, baseY: p.baseY });
    });
    room.npcs.forEach((n) => list.push(MapManager.characterActor(n.character, n.x, n.y, n.dir)));
    list.sort((a, b) => a.baseY - b.baseY);
    list.forEach((a) => {
      if (a.draw) { a.draw(ctx); return; }
      ctx.drawImage(a.img, Math.round(a.x / 2) * 2, Math.round(a.y / 2) * 2, a.w || a.img.width, a.h || a.img.height);
    });

    if (room.drawOver) room.drawOver(ctx, t);
  }

  // A character (src/characters/) standing at (x, y) facing `dir`, ready for depth sorting
  static characterActor(name, x, y, dir, frame = 0) {
    const c = window.spriteManager.characters[name];
    const frames = c.walk[dir] || c.walk.down;
    return { img: frames[frame] || frames[0], x, y, baseY: y + c.baseline };
  }

  // ----------------------------------------------------
  // Queries (rects in screen px)
  // ----------------------------------------------------
  static overlaps(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // Does the rect hit a wall or a solid object?
  isBlocked(rect) {
    return this.getCurrentRoom().colliders.some((c) => MapManager.overlaps(rect, c));
  }

  // First door whose zone the rect overlaps
  doorAt(rect) {
    const room = this.getCurrentRoom();
    if (!room) return null;
    return room.interactables.find((i) => i.isDoor && i.onEnter && MapManager.overlaps(rect, i)) || null;
  }

  // First object with a Z behaviour whose zone the rect overlaps
  interactableAt(rect) {
    return this.getCurrentRoom().interactables.find((i) => i.interact && MapManager.overlaps(rect, i)) || null;
  }
}

window.mapManager = new MapManager();
