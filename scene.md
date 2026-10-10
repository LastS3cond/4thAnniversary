# Master Scene & Character Redesign Specification (Handoff Document)

> **Purpose**: This is an extensive, authoritative handoff document specifically prepared for a stronger LLM / senior graphics architect to redesign the scenes, layouts, and character sprites for the **Undertale 4th Anniversary Tribute** game. It catalogs every visual detail, architectural dimension, environmental rule, asset specification, color palette, and piece of user feedback accumulated across all project iterations.

---

## 📑 Table of Contents

1. [Engine Architecture & Visual Constraints](#1-engine-architecture--visual-constraints)
2. [Exterior Scene & Facade (Townhouse 316)](#2-exterior-scene--facade-townhouse-316)
3. [First Floor Townhouse Layout & Architecture](#3-first-floor-townhouse-layout--architecture)
   - [Zoning & Proportions](#zoning--proportions)
   - [Foyer & Entry Pocket (Bottom-Left)](#foyer--entry-pocket-bottom-left)
   - [Kitchen South Wall & Fixtures](#kitchen-south-wall--fixtures)
   - [Kitchen East Wall & Removal of Clutter](#kitchen-east-wall--removal-of-clutter)
   - [Living Room & Furniture Layout](#living-room--furniture-layout)
   - [Interior Walls & The "Void"](#interior-walls--the-void)
4. [Staircase & Intermediate Landing (U-Shape Switchback)](#4-staircase--intermediate-landing-u-shape-switchback)
5. [Second Floor Hallway (Narrow Townhouse Corridor)](#5-second-floor-hallway-narrow-townhouse-corridor)
6. [Character Sprite Specifications](#6-character-sprite-specifications)
   - [Mallika (Protagonist Overworld Sprite)](#mallika-protagonist-overworld-sprite)
   - [Jaydon (Overworld Sprite)](#jaydon-overworld-sprite)
   - [Jaydon (Battle Sprite)](#jaydon-battle-sprite)
   - [Jaydon (Portrait Emotion Busts)](#jaydon-portrait-emotion-busts)
7. [Color Palettes & Asset Dimension Cheat Sheet](#7-color-palettes--asset-dimension-cheat-sheet)

---

## 1. Engine Architecture & Visual Constraints

- **Rendering Engine**: Pure HTML5 Canvas 2D (`CanvasRenderingContext2D`), nearest-neighbor pixelated rendering (`ctx.imageSmoothingEnabled = false`).
- **Canvas Resolution**: Native **640 × 480 pixels**, letterboxed on modern displays inside an Undertale retro CRT frame.
- **Sprite Generation Pattern**: Sprites are procedurally rendered to off-screen canvases on boot (`window.spriteManager`), then drawn via `ctx.drawImage()`. Redesigns can replace procedural canvas draw commands or load external pixel art PNG assets.
- **Collision Physics**: Top-down 2.5D perspective where the player's collision box is anchored at the feet (`x + 8, y + 42, w: 24, h: 16`), allowing head and torso to overlap furniture tops naturally.
- **Boundary Colliders**: All rooms must have strict enclosing colliders so the player cannot step onto walls or walk off the canvas.
- **Native Art Pixel Grid**: All art is authored at Undertale's native **320 × 240 "art pixel"** resolution and displayed at exactly **2x** (one art pixel = one crisp 2 × 2 block). Room backgrounds are painted once into cached offscreen canvases; colliders, interactables and spawns stay in 640 × 480 screen coordinates (art coordinate × 2).
- **Depth Sorting**: Props the player can walk behind (TV stand, shoe rack) and characters are drawn in order of where their feet touch the floor, so Mallika correctly disappears behind the TV when standing in the couch/TV corridor.
- **Overworld Text**: No floating text labels in the overworld (doors and fixtures speak for themselves, including every door). The only in-world lettering is the brass `316` plaque, drawn with a tiny 3 × 5 pixel font.

---

## 2. Exterior Scene & Facade (Townhouse 316)

```
+-------------------------------------------------------------------------------+
| BLACK VOID (x: 0..160)   |  AUTUMN NIGHT SKY: Falling Leaves  | BLACK VOID   |
|                          |  Full Brick Stairwell Bay (Right)  | (x: 480..640)|
|                          |  White Siding (Above Door Only)    |              |
|                          |  Front Door Framed in Red Brick    |              |
|                          |  Brass '316' Plaque (Left of Door) |              |
|                          |  Autumn Lawn & Concrete Walkway    |              |
|                          |  Sidewalk + Asphalt Street (y>344) |              |
+-------------------------------------------------------------------------------+
```

### Aesthetic & Environment:
- **Season**: **Fall Emulation** (autumn theme). Autumn grass lawn (golden/olive tones `#5a6828`, `#6b7a32`) with scattered rust-colored fallen leaves (`#c05822`, `#d97724`, `#e29b38`).
- **Falling Leaves**: Animated autumn leaf particles drifting in the sky and lawn (replacing winter snow).
- **Playable Alleyway Bounds**: Thinner playable alleyway—the first 1/4 and last 1/4 of the 640px screen are cut out. Walkable area is strictly bounded between **$x = 160$** and **$x = 480$**. Outside this ($x < 160$ and $x > 480$) is pitch-black void.

### Facade Architecture:
1. **Full Brick Stairwell Bay (Right of Door)**:
   - The protruding bay feature where the interior stairs reside is **100% full red brick** (`#8b3a2b`, `#6a261a`) from the ground up to the roofline ($x = 392..480$). No white siding appears on this protruding structure.
   - It sits to the **right** of the door, matching the photo of the real house (and the interior, where the stairs are east of the front door). Its shadowed side face and lower foundation line sell the protrusion.
2. **Front Door Framing**:
   - The front door is **completely framed in red brick** on both sides and around its immediate casing.
   - The door does **not** merge into any white wall; there is zero white siding inside the door frame or beside the door jamb.
3. **White Siding Placement**:
   - Horizontal white vinyl siding (`#dedede`, `#cccccc`) exists **strictly directly above the door**, spanning **exactly 3 door widths wide** (138px wide, $x = 254..392$, $y = 60..156$), with one warmly lit upstairs window.
   - A small brown shingled awning runs along the bottom of the siding, directly over the door ($y = 156..170$).
4. **House Number Plaque**:
   - A distinct brass plaque marked **"316"** is mounted directly on the red brick to the left of the door casing ($x = 262..294, y = 186..204$).
5. **Front Doorway**:
   - Dark wooden four-panel exterior door ($x = 300..344, y = 176..232$) with a brass knob, a warm transom header, a concrete stoop, and a black lantern to its right casting a gently flickering amber glow.

---

## 3. First Floor Townhouse Layout & Architecture

```
0    40                        320                     600   640
+----+------------------------------------------------------+----+
|    | LIVING ROOM (full width, y: 60..200)                 |    |
|    | Emerald LED strip along the whole north wall         |    |
| B  | Bag | Sliding Door | RED L-COUCH + COFFEE TABLE |Puz-|  B |
| L  |     |              | ~ walking corridor ~       |zle |  L |
| A  |     |              | TV STAND (faces the couch) |Tbl |  A |
| C  +-----------+----------+------------+-------------+----+  C |
| K  | BATHROOM  | HALLWAY  | CENTER BOX | KITCHEN     |Frdg|  K |
|    | (40..135) |(135..215)| (215..320) | (open to    |Cntr|    |
| V  |           |          |            |  living rm) |Stov|  V |
| O  +-----------+          +------------+             +----+  O |
| I  | COAT      | SHOE     | STAIRS | PANTRY | SINK |D/W|VOID|  I |
| D  | CLOSET    | RACK     |        |        |      |   |W/D |  D |
+----+-----------+----------+--------+--------+------+---+----+----+
```

### Zoning & Proportions
- **Living Room**: Spans the **full width** of the townhouse along the north ($x = 40..600, y = 60..200$). There is no dividing wall; the old empty pocket above the kitchen is now living room.
- **Kitchen**: Sits on the right below the living room ($x = 320..600, y = 195..440$), open to it; the floor changes from hardwood to warm vinyl at $y \approx 194$.
- **Pitch-Black Void**: The exterior perimeter ($x < 40$, $x > 600$, $y < 60$, $y > 440$) and removed utility areas are deep black void.

### Foyer & Entry Pocket (Bottom-Left)
1. **Coat Closet**:
   - Located in the **bottom-left corner** ($x = 40..95, y = 370..440$, size $55 \times 70$).
   - Ceramic tile foyer landing. Brass door handle. Inspect text: `* Just some warm coats hanging.`
2. **Shoe Rack**:
   - Must **not** be on the same south wall as the front door.
   - Sits in the **pocket to the left of the front door, leaning against the vertical bathroom wall** ($x = 115..141, y = 390..430$).
   - Multi-tier white shoe rack stacked with New Balance sneakers.
3. **Front Door**:
   - Centered on south entryway wall ($x = 156..202, y = 430..444$).
   - Traditional coir welcome mat (`* Welcome`). Transition back to exterior.

### Kitchen South Wall & Fixtures
Running from left to right along the south wall ($y = 395..440$):
1. **Stairs Entrance**:
   - Starts immediately right of the foyer hallway ($x = 215..265$). Beige carpet steps leading up into the switchback stairwell.
2. **Pantry**:
   - Tall wooden pantry door ($x = 270..305, y = 390..440$) with brass knob. Inspect text: `* The pantry is closed.`
3. **Lower Cabinets (Left)**:
   - Dark wood shaker cabinets ($x = 305..350$).
4. **Kitchen Sink (Rotated 180°, Window Removed)**:
   - **Orientation**: Rotated 180° so the faucet is on the south perimeter wall pointing north into the stainless steel double basin ($x = 350..386, y = 400..435$).
   - **Window**: **Completely removed** (there is no exterior window above this sink).
   - **Dishes & Inspection**: Pile of dirty dishes. Selecting `Clean them?` prompts: `* There are too many.`
5. **Dishwasher**:
   - Stainless steel/black dishwasher ($x = 390..420, y = 395..440$). Inspect text: `* Never figured out how it worked.`
6. **Lower Cabinets (Right)**:
   - Continuous row of dark wood cabinets ($x = 422..545$) extending to the east wall.

### Kitchen East Wall & Removal of Clutter
Running from top to bottom along the right wall ($x = 545..600$):
1. **Refrigerator (Top)**:
   - Clean stainless steel double-door fridge ($y = 195..255$). Inspect text: `* I'm not particularly hungry.`
2. **Kitchen Counter (Middle)**:
   - Prep counter with butcher block and spices ($y = 255..315$).
3. **Stove & Oven (Rotated 90°, Microwave Removed)**:
   - **Orientation**: Rotated 90° so the appliance backguard is against the east wall ($x = 595$) and the oven door/burners face west into the room ($x = 545..600, y = 315..385$).
   - **Microwave**: **Completely removed** to eliminate visual clutter.
   - **Atmosphere**: Warm oven glow. Inspect text: `* The oven is warm. A rich aroma of brown sugar and dates fills the kitchen.`
4. **Washer & Dryer**:
   - **Completely removed**. That corner (below the stove, $x = 545..600, y = 384..440$) is left as clean pitch-black void.

### Living Room & Furniture Layout
Spans the whole north of the house ($x = 40..600, y = 60..200$). The couch and TV stand sit in the middle and take up a good share of the room; open space around them is intentional:
1. **Emerald Ceiling LED Strip**:
   - A glowing emerald-green LED strip running along the entire north ceiling perimeter casting a subtle ambient green bloom (`rgba(0, 255, 68, 0.08)`).
2. **Sliding Screen Door**:
   - Sliding glass patio door on north wall ($x = 95..150, y = 45..75$). Inspect text: `* It's chilly outside.`
3. **Freestanding Heavy Punching Bag Station (Enlarged)**:
   - Tucked in the top-left corner against the brick wall ($x = 45..93, y = 65..135$, size $48 \times 70$).
   - **Structure**: Freestanding metal frame contraption with triangular cantilever support arm, circular steel base with **sandbags weighing down the support legs**. Heavy black vinyl punching bag.
   - **Interaction**: Interactive prompt `Give it a punch?` Selecting YES plays hit SFX, gives `* WHAM! Attack power +1` on first hit, and increases ATK to 11 in STAT menu.
4. **Red L-Sectional Couch (Centered)**:
   - Placed in the **middle of the living room** ($x = 232..408, y = 66..134$, $176 \times 68$).
   - Distinct, unmistakable **L-shape**: Long back cushion along the north, chaise lounge extension projecting forward on the left side. Warm crimson upholstery (`#9e2a2b`).
   - **Nintendo Switch**: Removed from cushion (no clutter).
5. **Coffee Table (Inside the L)**:
   - Tucked neatly inside the nook of the L-couch ($x = 312..388, y = 100..130$).
   - **Surface**: No laptop. Just **papers and a notebook strewn about**. Inspect text: `* Papers just strewn about.`
6. **TV Stand (Directly Opposite Couch)**:
   - Placed opposite the couch, centered, facing north ($x = 244..396, y = 160..188$, $152 \times 28$). Seen from behind; no clutter on the TV.
   - **Corridor**: There is a clear, open **walking corridor between the couch and the TV stand** ($y = 134..160$) so the player can freely walk between them (Mallika correctly passes behind the TV).
7. **White Plastic Folding Table & Duckling Puzzle (Enlarged)**:
   - Long rectangular folding table ($36 \times 96$, $x = 558..594, y = 65..161$) with folding bench on its room side.
   - Positioned against the right (east) living room wall, **directly above where the fridge begins**.
   - **Puzzle**: A colorful jigsaw puzzle covering half the table depicting ducklings among flowers. Inspect text: `* A cute puzzle of ducklings and flowers.`

### Interior Walls & The "Void"
1. **Living Room / Kitchen Dividing Wall**:
   - **Removed.** The living room spans the full width and the kitchen opens directly off its south-east side.
2. **Center Interior Dividing Wall Box**:
   - Moved **DOWN so it is at par with the bathroom box** ($x = 215..320, y = 200..365$).
   - Leaves a central void where the back of the hallway closet sits.
3. **Bathroom Block**:
   - Enclosed room on the left of the hallway ($x = 40..135, y = 200..365$). Door facing hallway at $x = 130$.
4. **Hallway Corridor**:
   - Clean 80px corridor ($x = 135..215$) connecting the front entrance to the living room.
5. **Left Wall Brickwork**:
   - Only a single vertical strip of exposed red brick along the left living room wall ($x = 40..60, y = 60..200$, solid collider). All other walls use warm neutral drywall (`#eae3d2`).
6. **How Walls Read**:
   - Wall masses (bathroom block, center box, coat closet) show a muted taupe top (`#6b5a4e`), cream side bands where doors face the hallway/foyer, and a cream south face with a wood baseboard. Fixtures on the kitchen walls show their fronts toward the room (cabinet doors / black dishwasher along the north edge of the south run, oven door and fridge handles along the west edge of the east run).

---

## 4. Staircase & Intermediate Landing (U-Shape Switchback)

```
235             295  315             375
+----------------+----+----------------+
| FLIGHT 1 DOOR  |WALL| FLIGHT 2 DOOR  |
| (From 1st Flr) |    | (To 2nd Flr)   |
|                |    |                |
| ▼ 7 Steps Down | H  | ▲ 7 Steps Up   |
|   (Beige       | A  |   (Beige       |
|    Carpet)     | N  |    Carpet)     |
|                | D  |                |
|                | R  |                |
+----------------+ A  +----------------+
| LANDING FLOOR  | I  | LANDING FLOOR  |
| (Connecting)   | L  | (Turn 180°)    |
|                +----+                |
| COLLIDER: Intermediate Window (Snow) |
+--------------------------------------+
```

### Proportions & Navigation:
- **Corridor Width**: Narrow, intimate stair shaft matching the 80px hallway width ($x = 235..375$, total width 140px). Outside walls are solid drywall.
- **Flight 1 (Left, Descending to Landing)**:
  - Player spawns near the top ($x: 255, y: 90$).
  - 7 beige carpet steps descending south to the landing ($x = 235..295, y = 60..290$).
- **Intermediate Landing (Bottom)**:
  - Beige carpet landing platform ($x = 235..375, y = 290..350$).
  - Smooth 180° turn from left flight to right flight.
  - **No Directional Text**: The `"TURN 180° ►"` instruction text has been removed for a clean, non-handholding Undertale aesthetic.
- **Landing Window & Collider**:
  - Double-hung window on the south landing wall framing the night sky ($x = 270..340, y = 350..390$). No falling snow particles; just a calm night sky and a faint moonlight patch on the landing.
  - **Strict Collider**: A solid collider at `{ x: 235, y: 350, w: 140, h: 40 }` prevents the player from ever walking onto or through the window graphic.
- **Flight 2 (Right, Ascending to Second Floor)**:
  - 7 beige carpet steps ascending north ($x = 315..375, y = 60..290$).
  - Doorway at top leads directly into the second-floor hallway.

---

## 5. Second Floor Hallway (Narrow Townhouse Corridor)

```
280                     360
+-----------------------+  y: 0..65 (North Wall)
| KEVIN'S DOOR | JAYDON'S DOOR  |  y: 80 (Pair 3: End of Hallway)
| (Left)       | (Right: Boss!) |
+--------------+--------+
| STORAGE      | SOLID  |  y: 180 (Pair 2: Middle)
| CLOSET       | WALL   |  (NO suitcases graphic! NO [WALL] text!)
+--------------+--------+
| BATHROOM     | ALEX'S |  y: 280 (Pair 1: South)
| (Left)       | (Right)|
+--------------+--------+
| ▼ STAIRS ENTRANCE     |  y: 420..455 (Stairs lead directly into hallway)
+-----------------------+
```

### Layout & Corridor Scale:
- **Dimensions**: Narrow corridor matching stair width ($x = 280..360$, width 80px, $y = 65..440$).
- **Flooring**: Beige carpet with rich brown carpet runner border.
- **Stairs Connection**: The switchback stairs connect **directly into the bottom of the hallway** ($y = 420$).
- **Pair 1 (South, $y = 280$)**:
  - **Left**: Bathroom Door (`BATH`). Inspect: `* You don't have to use the bathroom right now.`
  - **Right (Opposite)**: Alex's Door (`ALEX`). Inspect: `* You hear yelling and furious typing. Must be playing a game.`
- **Pair 2 (Middle, $y = 180$)**:
  - **Left**: Storage Closet Door (`STORAGE`). Inspect: `* There are some suitcases in here.` (Note: suitcases graphic inside hallway nook is **completely removed**).
  - **Right (Opposite)**: **Solid Blank Wall**. Clean drywall with floor baseboard. (Note: `[WALL]` label text is **completely removed**).
- **Pair 3 (End of Hallway, $y = 80$)**:
  - **Left**: Kevin's Door (`KEVIN`). Inspect: `* You hear him speaking very formally, must be interviewing.`
  - **Right (Opposite)**: Jaydon's Door (`JAYDON`, Gold Trim). Inspect / Knock prompts boss encounter.
- **No Door Labels**: Doors carry no text labels or nameplates; Jaydon's door is told apart by its gold trim. The side walls are drawn as cream bands flanking the 80px corridor.
- **Jaydon Hallway Staging**:
  - When Jaydon steps out into the hallway upon knocking, **he stands to the side of Mallika**, never behind her: his door swings open, Mallika steps over to the left half of the corridor ($x \le 276$) while Jaydon slides out into the right half ($x \approx 316..322$), feet aligned, facing her.

---

## 6. Character Sprite Specifications

### Mallika (Protagonist Overworld Sprite)
- **Dimensions**: Chibi Undertale proportions, $40 \times 60$ pixels.
- **Body Shape**: Authentic blocky Undertale silhouette (similar to Frisk), not hourglass or spindly.
- **Clothing Layering**:
  - **Denim Overalls** with silver buckles worn **over** an olive-green tube top (`#556b2f`). The tube top is visible at the shoulders and sides beneath the denim straps.
  - Rolled denim cuffs.
- **Footwear**: Barefoot or clean white socks indoors.
- **Hair & Face**: Long, voluminous, wavy dark brunette hair (`#2c1a12`) cascading past shoulders; expressive dark brown eyes behind rose-colored glasses frames (`#b34a5e`).
- **Walk Cycle**: Natural, straight-forward foot stepping (frames 1 and 2). **Legs do not splay or sprawl outwards** during walking.

### Jaydon (Overworld Sprite)
- **Dimensions**: $40 \times 62$ pixels.
- **Hair**: Curly dark brown hair (`#2b1810`) styled to **stop cleanly around his ears** (no long chin-length or shoulder-length curls).
- **Face & Glasses**: Thin rectangular black/grey glasses frames with clear lenses.
- **Attire**:
  - Heather-grey crewneck long-sleeve shirt (`#6b7280`).
  - Red-and-black buffalo plaid pajama pants (`#991b1b` with `#1a1a1a` cross-hatch grid).
  - **Feet**: **Completely barefoot** (no shoes, no sneakers, no socks indoors).

### Jaydon (Battle Sprite)
- **Dimensions**: Large Undertale combat sprite, $144 \times 168$ pixels, centered in upper combat zone.
- **Proportions**: **Longer torso** giving an accurate tall, relaxed silhouette.
- **Face & Features**:
  - **Eyes**: Bright, clear **sky-blue eyes** (`#38bdf8`) with white glint highlights. **Zero black fill** in the eyes.
  - **Glasses**: Soft grey/slate rectangular frames (`#4b5563`) cleanly resting on the bridge of the nose.
  - **Lips & Mouth**: Subtle, gentle smile with smaller, restrained lips (not overly wide or thick).
  - **Fight Reaction Mouth**: When taking a hit in battle, his mouth changes to an expressive, clean circular **'o' / surprised look** (not a goofy or silly grin).
- **Arms & Pose**: Distinct **long-sleeved arms and hands** resting naturally alongside his torso.
- **Clothing**: Heather-grey long-sleeve knit shirt and high-contrast red plaid pajama pants.

### Jaydon (Portrait Emotion Busts)
$80 \times 80$ pixel dialogue portraits displayed in the combat text box:
1. `neutral`: Gentle smile, soft eyes, rectangular glasses.
2. `blush`: Bright pink cheeks (`#ff6b81`), averted gaze, sweet flustered smile.
3. `surprised`: Wide sky-blue eyes, round circular 'o' mouth.
4. `laugh`: Eyes crinkled in genuine joy, warm wide grin.
5. `cough`: Eyes squeezed shut with a small cloud puff (`*cough cough*`).

---

## 7. Color Palettes & Asset Dimension Cheat Sheet

### Architectural Elements
| Asset | Dimensions | Primary Color(s) | Hex Codes |
|---|---|---|---|
| Red Brick Wall | Tile $32 \times 32$ | Deep Terracotta / Crimson Brick | `#8b3a2b`, `#6a261a` |
| White Vinyl Siding | Strip $138 \times 85$ | Neutral White / Light Grey | `#dedede`, `#cccccc` |
| Hardwood Flooring | Room base | Light Blonde Birch / Natural Oak | `#caa478`, `#b59068` |
| Drywall Interior | Wall surfaces | Warm Alabaster / Beige | `#eae3d2`, `#3d281a` (baseboard) |
| Carpet Runner | $60 \times 375$ | Toasted Almond / Camel | `#a68c76`, `#8f745e` |
| Kitchen Floor | Kitchen half | Warm Vinyl (faint lattice, no tile grid) | `#cfc0a0`, `#bba987` |
| Countertops | Kitchen runs | Cream Laminate | `#ece2c8`, `#ddd2b6` |
| Wall Mass Tops | Interior blocks | Muted Taupe | `#6b5a4e`, `#84705f` |
| Pitch-Black Void | Room boundaries | Void Black | `#000000` |

### Furniture & Props
| Object | Dimensions | Location | Key Design Requirement |
|---|---|---|---|
| Coat Closet | $55 \times 70$ | Bottom-Left Foyer | Tile landing, brass knob |
| Shoe Rack | $24 \times 36$ | Pocket left of door | Leaning against bathroom wall |
| Red L-Couch | $176 \times 68$ | Middle of Living Room | Clear L-shape, no Switch on cushion |
| TV Stand | $152 \times 28$ | Opposite Couch | Walking corridor between TV and Couch |
| Coffee Table | $76 \times 30$ | Inside the L-Couch | Strewn papers and notebook |
| Puzzle Table | $36 \times 96$ | East Living Room Wall (above the fridge) | Duckling and flowers jigsaw puzzle |
| Heavy Punching Bag | $48 \times 70$ | West Brick Corner | Metal stand, cantilever, sandbag legs |
| Kitchen Sink | $36 \times 28$ | South Kitchen Wall | Rotated 180°, NO window, dirty dishes |
| Stove / Oven | $55 \times 70$ | East Kitchen Wall | Rotated 90°, white coil range, warm glow, NO microwave |

---
*End of Master Scene Specification.*
