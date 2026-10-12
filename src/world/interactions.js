/**
 * Undertale 4th Anniversary - Interactions
 *
 * Everything Mallika can inspect or use is an object in a room (src/rooms/*.js) with an
 * inspection zone `at` and one of these behaviours:
 *
 *   text: ['* Page one.', '* Page two.']    plain dialogue; optional `then: () => {...}` runs after it
 *   choice: { prompt, yes, no }              a [ YES / NO ] prompt; `yes` / `no` are pages or functions
 *   door: { to, x, y, dir, sound, say }      walking into the zone (or pressing Z at it) fades to room
 *                                            `to` with Mallika at (x, y) facing `dir`; `sound: true`
 *                                            plays the door SFX, `say` shows pages first
 *   onInteract: (game) => {...}              anything else, scripted with the helpers below
 *
 * Helpers for scripted behaviours: Interact.say(pages, then), Interact.ask(prompt, yes, no),
 * Interact.goTo(room, x, y, dir).
 */
const Interact = {
  // Shows dialogue pages (a string or an array of pages), then calls `then` if given
  say(pages, then = null) {
    window.dialogueManager.start(pages, then);
  },

  // Asks a [ YES / NO ] question. `yes` / `no` are dialogue pages or functions to run.
  ask(prompt, yes, no) {
    window.dialogueManager.startChoice(prompt, (answer) => {
      const outcome = answer === 'YES' ? yes : no;
      if (typeof outcome === 'function') outcome();
      else window.dialogueManager.start(outcome);
    });
  },

  // Fades to another room and places Mallika at (x, y) facing `dir`
  goTo(room, x, y, dir) {
    window.game.transitionToRoom(room, x, y, dir);
  },

  // What happens when Mallika walks into a door
  enterDoor(door) {
    return () => {
      if (door.sound && window.audioManager) window.audioManager.playDoor();
      const go = () => Interact.goTo(door.to, door.x, door.y, door.dir);
      if (door.say) Interact.say(door.say, go);
      else go();
    };
  },

  // What happens when Mallika presses Z at an object (null if it has no behaviour)
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
