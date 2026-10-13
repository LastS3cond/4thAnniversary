/**
 * Undertale 4th Anniversary - Interactions
 *
 * Everything the player can inspect or use is an object in a room (src/rooms/*.js) with an
 * inspection zone `at` and one of these behaviours:
 *
 *   text: ['* Page one.', '* Page two.']    plain dialogue; optional `then: () => {...}` runs after it
 *   choice: { prompt, yes, no }              a [ YES / NO ] prompt; `yes` / `no` are pages or functions
 *   door: { to, x, y, dir, sound, say }      walking into the zone (or pressing Z at it) fades to room
 *                                            `to` with the player at (x, y) facing `dir`; `sound: true`
 *                                            plays the door SFX, `say` shows pages first
 *   onInteract: (game) => {...}              anything else, scripted with the helpers below
 *
 * Helpers for scripted behaviours: Interact.say(pages, then, portrait), Interact.ask(prompt,
 * yes, no), Interact.goTo(room, x, y, dir). Story progress lives in game.flags.
 */
const Interact = {
  // Shows dialogue pages (a string or an array of pages), then calls `then` if given.
  // `portrait` ('character/expression', e.g. 'jaydon/blush') shows that face beside the text.
  say(pages, then = null, portrait = null) {
    window.dialogueManager.start(pages, then, portrait);
  },

  // Asks a [ YES / NO ] question. `yes` / `no` are dialogue pages or functions to run.
  ask(prompt, yes, no) {
    window.dialogueManager.startChoice(prompt, (answer) => {
      const outcome = answer === 'YES' ? yes : no;
      if (typeof outcome === 'function') outcome();
      else window.dialogueManager.start(outcome);
    });
  },

  // Fades to another room and places the player at (x, y) facing `dir`
  goTo(room, x, y, dir) {
    window.game.transitionToRoom(room, x, y, dir);
  },

  // What happens when the player walks into a door
  enterDoor(door) {
    return () => {
      if (door.sound && window.audioManager) window.audioManager.playDoor();
      const go = () => Interact.goTo(door.to, door.x, door.y, door.dir);
      if (door.say) Interact.say(door.say, go);
      else go();
    };
  },

  // What happens when the player presses Z at an object (null if it has no behaviour)
  behaviourFor(obj, onEnter) {
    if (obj.onInteract) return () => obj.onInteract(window.game);
    if (obj.choice) return () => Interact.ask(obj.choice.prompt, obj.choice.yes, obj.choice.no);
    if (onEnter && !obj.text) {
      return () => {
        const game = window.game;
        if (game.doorCooldown <= 0 && !game.isTransitioning) onEnter();
      };
    }
    if (obj.text) return () => Interact.say(obj.text, obj.then || null);
    return null;
  }
};
