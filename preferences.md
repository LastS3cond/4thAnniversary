# User Preferences & Design Philosophy

This document tracks learned preferences, design rules, and behavioral guidelines accumulated while collaborating on the **Undertale 4th Anniversary Tribute** project.

---

## 🎨 Visual & Aesthetic Design
1. **Undertale Authenticity**: Strictly follow Toby Fox's *Undertale* visual language:
   - 4:3 CRT letterboxing (native 640×480 canvas).
   - Crisp pixel art with `imageSmoothingEnabled = false`.
   - Classic fonts: `"Press Start 2P"`, `"8bitoperator JVE"`, monospace fallbacks.
   - Distinct high-contrast UI borders (white border `#ffffff`, black fill `#000000`).
2. **Townhouse Proportions & Scale**:
   - Keep spaces authentic, compact, and cozy—avoid oversized rooms, gigantic staircases, or overly wide hallways.
   - Hallways should be narrow corridors (matching stair width, ~70px wide), not cavernous rooms.
   - Staircases should be compact U-shaped switchbacks (180° turns at an intermediate landing).
3. **Clutter & Composition**:
   - Avoid visual clutter on appliances and counters (e.g., remove countertop microwave if it clutters the stove).
   - High-contrast separation: Never allow doors, furniture, or props to merge visually with adjacent walls. Always use distinct casing, baseboards, or drop shadows.
   - Top-down perspective consistency: Objects against south walls face north into the room (e.g., sink basin in front, window and backsplash against the wall).

---

## 🕹️ Gameplay & Interaction Mechanics
1. **Active Choices over Passive Text**:
   - Whenever an observation involves a possible action, turn it into an interactive Undertale choice box `[ YES / NO ]`:
     - Punching bag: Prompt `Give it a punch?` -> Only punch/play SFX if selected YES.
     - Dirty dishes in the sink: Prompt `Clean them?` -> Selecting YES gives `There are too many.`
2. **Smooth Traversal & Ergonomics**:
   - Every fixture and counter must be easily reachable by the player without narrow choke points blocking movement.
   - Ensure open walking clearance in front of all cabinets, pantry, sink, and dishwasher.
   - Staircase navigation must feel natural (e.g., switchback U-shape walking down to the landing, turning 180°, and walking up to the next floor).
3. **Transition Protection**:
   - Never allow spawn coordinates to overlap with doorway exit trigger boxes.
   - Maintain an active `doorCooldown` buffer (800ms) upon room transitions to prevent instant bounce-backs.

---

## 📐 Townhouse Architecture (True-to-Life Layout)
1. **First Floor**:
   - Foyer / Bottom-left: Coat closet in the corner, shoe rack leaning against the vertical bathroom wall, front door on south wall.
   - Hallway: Bathroom on the left, storage closet on the right (on the central divider wall).
   - Kitchen: Stairs immediately right of hallway/foyer; south wall has Pantry, Cabinets, Sink (with crooked blinds window behind), Dishwasher, Cabinets. East wall has Refrigerator, Counter, Stove/Oven.
   - Living Room: Center red L-couch facing south towards TV; TV stand on south side facing north towards couch; coffee table inside the L with strewn papers, notebook, bowl; vertical folding table with duckling puzzle against east wall; freestanding punching bag with sandbag legs in west brick corner.
2. **Staircase**:
   - U-shaped switchback stairwell.
   - Enter near top of Flight 1, walk down to intermediate landing with window, turn 180°, walk up Flight 2 to the second floor.
3. **Second Floor**:
   - Narrow hallway directly connected to the stairs.
   - Walking south to north:
     - 1st pair: Bathroom on LEFT, Alex's door on RIGHT (opposite).
     - 2nd pair: Storage closet (suitcases) on LEFT, Solid Wall on RIGHT (opposite).
     - 3rd pair (end): Kevin's door on LEFT, Jaydon's door on RIGHT (opposite, Boss Trigger).

---

## 💻 Codebase Standards
- **Zero External Dependencies**: Pure vanilla HTML5, Canvas 2D, and Web Audio API.
- **Audio Autoplay**: Always support instant audio unlock across mouse clicks, touches, and key presses with helpful on-screen cues if suspended.
- **Documentation**: Keep `README.md` completely up to date with full specifications, room catalogs, and floor plans.
