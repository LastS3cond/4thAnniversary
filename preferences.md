# User Preferences & Design Philosophy

This document tracks learned preferences, design rules, and behavioral guidelines accumulated while collaborating on the **Undertale 4th Anniversary Tribute** project.

---

## 🎨 Visual & Aesthetic Design

1. **Undertale Authenticity**: Strictly follow Toby Fox's *Undertale* visual language:
   - 4:3 CRT letterboxing (native $640 \times 480$ canvas).
   - Crisp nearest-neighbor pixel art (`ctx.imageSmoothingEnabled = false`).
   - Authentic retro fonts: `"Press Start 2P"`, monospace fallbacks.
   - High-contrast UI borders (crisp white `#ffffff` border, black `#000000` fill).
2. **Startup & Audio Policy**:
   - Provide an Undertale **`[ ♥ PLAY? ]`** start screen on boot so browser Web Audio API unlocks cleanly on the player's first gesture without autoplay warnings.
3. **The Void & Boundary Integrity**:
   - Prefer a pitch-black void (`#000000`) for exterior bounds and removed utility areas (e.g. washer/dryer corner).
   - Strict colliders must prevent the player from walking onto walls, windows, or off-screen.
4. **Townhouse Architecture & True Scale**:
   - **Proportions**: The Living Room spans the full width of the house along the north ($x = 40..600$); the Kitchen is a galley below it on the right, reached through a doorway in the kitchen's north wall. The center box extends east as the TV wall (hallway on one side of the TV, kitchen doorway on the other, like the real house).
   - **Centerpiece**: The couch (red pillows) and black TV stand sit in the middle of the living room, each pushed toward its own wall with a wide corridor between them; a "Happy Anniversary" banner hangs above the couch. Open space around them is fine.
   - **Center Divider Box**: Moved DOWN to be at par with the bathroom box ($y = 200..365$).
   - **Corridors**: Hallways and staircases should be narrow corridors (~80px wide), not cavernous rooms.
   - **Walking Clearances**: Maintain clear walking corridors between furniture (e.g., between the couch and TV stand).
5. **Exterior Facade & Fall Theme**:
   - **Season**: Fall emulation with autumn leaves drifting across the sky and an autumn-toned lawn.
   - **Brickwork**: Protruding stairwell bay is 100% full brick. The front door is completely framed in brick.
   - **White Siding**: Sits strictly directly above the front door, spanning 3 door widths wide (~138px).
6. **Less Is More (Reference Photos)**:
   - Use the real photos for palette, materials and the overall read of each object (white coil stove, black dishwasher, walnut cabinets, cream counters, maroon couch, duckling puzzle), **not** as a checklist of every detail.
   - Do not draw individual floor tiles, wall outlets/switches, or extra clutter on the TV. Be deliberate about what earns a place in the scene; details already in the game stay.
   - Keep every sprite on the native 2x art-pixel grid (Undertale's 320 × 240) with black character outlines so everything reads as one cohesive pixel-art world.
7. **Decluttering & Perspective**:
   - Kitchen sink is rotated 180° (faucet south pointing into basin) with exterior window removed.
   - Kitchen stove is rotated 90° (backguard east, oven door west). The microwave lives on the corner counter next to the oven (facing the sink, set back behind the oven's front), not on the stove.
   - Remove unnecessary text labels in the overworld (e.g., remove `[WALL]` label, remove `TURN 180° ►` prompt, no labels next to doors).
   - The season is fall everywhere: a few drifting leaves outside (exterior, landing window, sliding door glass), never snow or winter references. Outside, empty parking spaces sit below the sidewalk instead of a road.
   - Thin side-view doors get a plain dark frame (no light casing); front-facing doors keep their casing.
   - Remove suitcases prop graphic from the second-floor hallway.

---

## 🕹️ Gameplay & Interaction Mechanics

1. **Active Choices over Passive Text**:
   - Whenever an observation involves a possible action, turn it into an interactive Undertale choice box `[ YES / NO ]`:
     - Punching bag: Prompt `Give it a punch?` -> Only punch/play hit SFX if YES. Grants +1 ATK bonus.
     - Dirty dishes in the sink: Prompt `Clean them?` -> `* There are too many.`
     - Jaydon's door: Prompt `Knock on Jaydon's door?` -> Initiates encounter on YES.
     - Sliding door's broken blind: Prompt `Do you want to put it back up?` -> YES: `* You try, but you are too short.` / NO: `* You leave it there.`
2. **Ergonomic Traversal & Colliders**:
   - Maintain active `doorCooldown` buffer (800ms) upon room transitions to prevent instant bounce-backs.
   - Staircase intermediate landing window must have a solid collider preventing walking onto the glass.
3. **Typewriter Text Wrapping & Pagination**:
   - Monospace font at 14px–16px requires strict character wrapping limits:
     - Overworld dialogue: $\le 36$ characters without portrait, $\le 24$ characters with portrait (up to 4 lines per page).
     - Combat text box: $\le 26$ characters without portrait, $\le 22$ characters with portrait.
     - Finale monologue: $\le 28$ characters.
   - Avoid hanging single-word lines or premature pagination splits.

---

## 🧍 Character Sprites & Staging

1. **Jaydon (Overworld & Battle)**:
   - **Barefoot Indoors**: Wears cozy red-and-black plaid pajama pants and heather grey long-sleeve shirt, completely barefoot (no shoes, no socks).
   - **Hair Length**: Curly dark brown hair styled neatly around his ears (terminates at ear level; no long chin/shoulder curls).
   - **Hallway Staging**: When Jaydon steps out into the second-floor hallway, he stands to the side of Mallika rather than behind her.
   - **Battle Sprite Proportions**: Longer torso, clear bright sky-blue eyes with white sparkle highlights (zero black fill in eyes), soft grey rectangular glasses frames, and subtle smaller lips.
   - **Arms & Pose**: Distinct long-sleeved arms and hands resting at his sides.
   - **Fight Reaction Expression**: When struck in combat, his mouth changes to an expressive, clean circular 'o' / surprised look (not a goofy or silly grin).
2. **Mallika (Protagonist)**:
   - Authentic blocky Undertale silhouette.
   - Denim overalls layered over an olive tube top (tube top underneath), barefoot or white socks indoors.
   - Straight-forward walking gait—legs do not splay or sprawl outwards.

---

## ⚔️ Battle System & Dialogue Flow

1. **Status Bar Layout**:
   - Remove `LV 1` from the combat status bar for a clean Undertale aesthetic.
   - Cleanly align player and opponent rows (MALLIKA HP 20/20, JAYDON HP 20/20).
2. **FIGHT Damage (Down to 1 HP)**:
   - Mallika and Jaydon both start at 20 HP.
   - Attacks deal timing-based damage (2–6, +1 after punching the bag), so Jaydon can take several hits. Each hit knocks him flat ("* Jaydon staggers back and falls to the ground.") and he groans "Ugh... you are very strong..." before getting back up.
   - Damage is capped so Jaydon bottoms out at 1 / 20; at 1 HP attacks deal 0 damage (`MISS`) and display: `* Jaydon has pretended enough.`
3. **ACT Submenu Nuances**:
   - **Check**: Jaydon asks `"Do you like it so far?"`.
   - **Flirt**: Narration notes Jaydon looks back into his bedroom before refocusing on Mallika. Subsequent flirts rotate across 4 distinct responses:
     1. `"Whoa..."` *(strictly without "hey there")*
     2. `"Focus, Focus, FOCUS"`
     3. `"That's not allowed"`
     4. `"HEY, what are you trying to do here?"`
   - **Smoke**: Max 2 uses! Deals 5 damage to Mallika and lowers defense (Jaydon takes 0 damage). On 3rd use onward: denied with `* (We are out of joints!)`.
   - **Hug**: Captures the warm and steady feeling of their embrace. **Only this unlocks yellow Spare**.
4. **ITEM Submenu**:
   - **Sticky Toffee Pudding**: Heals to max HP. Jaydon asks `"Is it as good as the one you made?"`, answered by `* You let him down easy.`, then cleanly returning to menu.
   - **Dress**: Capitalized ("Dress"). Jaydon says `"You're going to look absolutely stunning in it."`
5. **MERCY System**:
   - `* Spare` only turns yellow after giving Jaydon a Hug.
   - Win narration: `* But you gained something more precious.` *(removed "infinitely")*.

---

## 💻 Codebase Standards

- **Zero External Dependencies**: Pure vanilla HTML5, Canvas 2D, and Web Audio API.
- **Handoff Documentation**:
  - `scene.md`: Master specification for character sprite and scene redesigns.
  - `interactions.md`: Master catalog of all dialogues and overworld/combat mechanics.
  - `README.md`: Concise high-level project summary linking to both.
  - `preferences.md`: Continuous record of design rules.

---
