# Master Interaction & Dialogue Catalog

> **Purpose**: This is the exhaustive interaction encyclopedia for the **Undertale 4th Anniversary Tribute** game. It catalogs every inspectable object, choice prompt, branching reaction, menu item, combat interaction, and dialogue sequence across all game phases.

---

## 📑 Table of Contents

1. [Overworld C-Menu Interactions](#1-overworld-c-menu-interactions)
2. [Room 1: Exterior Inspectables](#2-room-1-exterior-inspectables)
3. [Room 2: First Floor Townhouse Inspectables](#3-room-2-first-floor-townhouse-inspectables)
4. [Room 3: Staircase & Landing Inspectables](#4-room-3-staircase--landing-inspectables)
5. [Room 4: Second Floor Hallway & Door Encounter](#5-room-4-second-floor-hallway--door-encounter)
6. [Combat Engine: The Jaydon Boss Encounter](#6-combat-engine-the-jaydon-boss-encounter)
   - [Opening Flavour & Stats](#opening-flavour--stats)
   - [FIGHT System & 11 HP Cap](#fight-system--11-hp-cap)
   - [ACT Submenu (Check, Flirt, Smoke, Hug)](#act-submenu-check-flirt-smoke-hug)
   - [ITEM Submenu (Sticky Toffee Pudding & Dress)](#item-submenu-sticky-toffee-pudding--dress)
   - [MERCY Submenu & Spared Unlock](#mercy-submenu--spared-unlock)
7. [The Finale: Save Star & Determination Monologue](#7-the-finale-save-star--determination-monologue)

---

## 1. Overworld C-Menu Interactions

Accessible anywhere in the overworld by pressing **C** or **Ctrl**. Navigated with **W/S** or **Up/Down**, selected with **Z/Enter**, closed with **X/Shift**.

### Option 1: ITEM
Opens inventory descriptions:
- **Page 1**:
  ```text
  * ITEM:
  * Sticky Toffee Pudding
  * Pretty Dress
  ```
- **Page 2**:
  ```text
  * Sticky Toffee Pudding:
  * Warm & baked with love.
  ```
- **Page 3**:
  ```text
  * Pretty Dress:
  * A lovely Dress waiting to
    be worn on a date!
  ```
  *(Note: "Dress" is strictly capitalized).*

### Option 2: STAT
Displays Mallika's character sheet:
- **Page 1**:
  ```text
  * MALLIKA   LV 1
  ```
- **Page 2**:
  ```text
  * HP 20 / 20
  * ATK 10          [If bag has NOT been punched]
  * ATK 11 (Bag bonus +1)  [If bag HAS been punched]
  * DEF 10
  ```
- **Page 3**:
  ```text
  * WEAPON: Strong core muscles
  * ARMOR: Denim overalls
  ```
- **Page 4**:
  ```text
  * LOVE: lots
  ```
  *(Note: "lots" is deliberately without parentheses).*

### Option 3: CELL
Dials Jaydon's phone:
- **Page 1**:
  ```text
  * You dialed Jaydon's cell...
  * (ring... ring...)
  ```
- **Page 2**:
  ```text
  * A muffled ringtone plays
    from his bedroom upstairs!
  ```

---

## 2. Room 1: Exterior Inspectables

| Location / Prop | Trigger Type | Interaction Text / Sequence |
|---|---|---|
| **Front Door** ($x: 300..344, y: 176..232$) | Door Transition | Steps over threshold into First Floor foyer. Plays door sound, switches BGM to `home`. |
| **Brass Plaque** ($x: 262..294, y: 186..204$, left of the door) | Inspect | `* A polished brass plaque reads: 316.` |
| **Autumn Yard / Leaves** | Inspect | `* Crisp autumn breeze rustles through the fallen leaves.` |
| **Sidewalk** | Boundary | Player cannot walk off screen ($x < 160$ or $x > 480$). |

---

## 3. Room 2: First Floor Townhouse Inspectables

### Foyer & Hallway (Bottom-Left & Center)
1. **Coat Closet** ($x: 40..95, y: 370..440$):
   ```text
   * Just some warm coats hanging.
   ```
2. **Shoe Rack** (Pocket left of door, leaning against bathroom wall, $x: 115..141, y: 390..430$):
   ```text
   * A familiar row of New Balances resting in the foyer pocket.
   ```
3. **Front Door Exit** ($x: 156..202, y: 430..444$):
   - Plays door sound and transitions back outside to the exterior walkway.
4. **First Floor Bathroom** ($x: 130, y: 250$):
   ```text
   * You don't have to use the bathroom right now.
   ```
5. **Middle Hallway Storage Closet** ($x: 215, y: 235$):
   ```text
   * A hallway storage closet. It's packed full.
   ```
6. **Stairs Entrance** ($x: 215..265, y: 405..440$):
   ```text
   * You head into the stairs...
   ```
   - Automatically transitions to the switchback staircase.

### Kitchen South & East Walls
7. **Pantry** ($x: 270..305, y: 390..440$):
   ```text
   * The pantry is closed.
   ```
8. **Lower Cabinets Left of Sink** ($x: 305..350, y: 395..440$):
   ```text
   * Dark wood cabinetry filled with plates and mugs.
   ```
9. **Kitchen Sink with Dirty Dishes** ($x: 350..386, y: 400..435$):
   - Interactive prompt:
     ```text
     * There are dirty dishes piled in the sink.
     * Clean them?
     [ YES / NO ]
     ```
   - **If YES**:
     ```text
     * There are too many.
     ```
   - **If NO**:
     ```text
     * You decide to leave them for later.
     ```
10. **Dishwasher** ($x: 390..420, y: 395..440$):
    ```text
    * Never figured out how it worked.
    ```
11. **Lower Cabinets Right of Dishwasher** ($x: 422..545, y: 395..440$):
    ```text
    * More dark wood cabinets with bowls and spices.
    ```
12. **Refrigerator** ($x: 545..600, y: 195..255$):
    ```text
    * I'm not particularly hungry.
    ```
13. **Prep Counter** ($x: 545..600, y: 255..315$):
    ```text
    * A kitchen counter with spices and cutting boards.
    ```
14. **Rotated Warm Oven** ($x: 545..600, y: 315..385$):
    ```text
    * The oven is warm. A rich aroma of brown sugar and dates fills the kitchen.
    ```

### Living Room (Left Half, North)
15. **Sliding Screen Door** ($x: 95..150, y: 45..75$):
    ```text
    * It's chilly outside.
    ```
16. **Freestanding Heavy Punching Bag Station** ($x: 45..93, y: 65..135$):
    - Interactive prompt:
      ```text
      [First Time]:
      * A heavy punching bag on its own contraption, weighed down with sandbags.
      * Give it a punch?
      [ YES / NO ]

      [Subsequent Times]:
      * A heavy punching bag on a metal stand, weighed down with sandbags.
      * Punch it again?
      [ YES / NO ]
      ```
    - **If YES**:
      - Plays punch hit SFX (`window.audioManager.playHit()`).
      - First punch sets `hasPunchedBag = true` (permanently increasing STAT menu ATK to 11 and unlocking bonus dialogue in battle):
        ```text
        * WHAM!
        * You give the punching bag a solid punch!
        * Attack power +1.
        ```
      - Repeat punches:
        ```text
        * WHAM! A satisfying hit.
        * Your knuckles are warm and ready.
        ```
    - **If NO**:
      ```text
      * You leave the punching bag hanging peacefully.
      ```
17. **Red L-Sectional Couch** ($x: 135..211, y: 68..124$):
    ```text
    * The red sectional couch in the center of the room. Warm and inviting.
    ```
18. **Coffee Table Inside L** ($x: 165..205, y: 92..118$):
    ```text
    * Papers just strewn about.
    ```
19. **TV Stand Opposite Couch** ($x: 130..216, y: 148..172$):
    ```text
    * The TV is quiet. A cozy reflection fills the screen.
    ```
20. **White Folding Table with Duckling Puzzle** ($x: 280..316, y: 65..161$):
    ```text
    * A cute puzzle of ducklings and flowers.
    ```

---

## 4. Room 3: Staircase & Landing Inspectables

1. **Intermediate Landing Window** ($x: 270..340, y: 345..390$):
   ```text
   * You pause at the intermediate landing.
   * Outside the window, snowflakes drift through the quiet winter night.
   ```
2. **Flight 1 Doorway** ($x: 235..295, y: 40..65$):
   - Transitions back down to First Floor kitchen.
3. **Flight 2 Doorway** ($x: 315..375, y: 40..65$):
   - Transitions up directly into the Second Floor hallway.

---

## 5. Room 4: Second Floor Hallway & Door Encounter

1. **Bathroom Door (Pair 1 Left, $y: 280$)**:
   ```text
   * You don't have to use the bathroom right now.
   ```
2. **Alex's Door (Pair 1 Right, $y: 280$)**:
   ```text
   * You hear yelling and furious typing. Must be playing a game.
   ```
3. **Storage Closet (Pair 2 Left, $y: 180$)**:
   ```text
   * There are some suitcases in here.
   ```
4. **Kevin's Door (Pair 3 Left, $y: 80$)**:
   ```text
   * You hear him speaking very formally, must be interviewing.
   ```
5. **Jaydon's Door (Pair 3 Right, $y: 80$) — The Boss Trigger**:
   - Interactive prompt:
     ```text
     * Knock on Jaydon's door?
     [ YES / NO ]
     ```
   - **If NO**:
     ```text
     * You decide to wait a moment.
     ```
   - **If YES**:
     - Plays door latch SFX (`playDoor()`).
     - Jaydon steps out into the hallway to the side of Mallika.
     - Dialogue:
       ```text
       * The door opens with a gentle click.
       * Jaydon steps into the hallway wearing glasses, a long-sleeve shirt, and red plaid pajama pants.
       ```
     - Triggers 3-flash Undertale encounter sequence with staccato buzzing SFX.
     - Launches combat mode!

---

## 6. Combat Engine: The Jaydon Boss Encounter

### Opening Flavour & Stats
- **Opening Text**: `* (Why is he in pajama pants?)`
- **Mallika Stats**: HP: 20 / 20 | DEF: 10
- **Jaydon Stats**: HP: 12 / 12 | ATK: 1 | DEF: 999
- **Status Bar**: Clean two-row display with HP bars and numbers (LV 1 removed).

### FIGHT System & 11 HP Cap
- Moving target reticle across oval meter. Press **Z/Enter** to strike.
- Plays slash SFX followed by hit SFX.
- **When Jaydon's HP > 11**:
  - Jaydon's HP drops from 12 to **11** (takes 1 damage).
  - Portrait changes to `surprised` (clean circular 'o' mouth).
  - Narration:
    ```text
    * You try to attack, but you can't bring yourself to do it.
    ```
    - *If bag was punched*:
      ```text
      * Jaydon gasps and dramatically pretends to take 1 extra damage from that punching bag workout!
      * Jaydon: "Whoa! Ow, ow! Those strong core muscles are really paying off!"
      ```
    - *If bag was not punched*:
      ```text
      * Jaydon gasps and dramatically pretends to take 1 damage anyway.
      * Jaydon: "Whoa! Ow, ow, critical hit!"
      ```
- **When Jaydon's HP is at 11 (Damage Cap Reached)**:
  - Jaydon takes **0 damage** (HP remains at 11).
  - Portrait: `neutral`.
  - Narration:
    ```text
    * You try to attack, but you can't bring yourself to do it.
    * Jaydon has pretended enough.
    * Jaydon: "Hey, take it easy!"
    ```
  - *(Guarantees that the maximum damage Jaydon can ever take throughout the game is exactly 1)*.

### ACT Submenu (Check, Flirt, Smoke, Hug)
2×2 grid navigation using WASD / Arrow Keys:

1. **Check**:
   - Portrait: `neutral`.
   - Text:
     ```text
     * JAYDON - ATK 1 DEF 999
     * Currently trying his best to give you the sweetest anniversary possible.
     * Jaydon: "Do you like it so far?"
     ```
2. **Flirt**:
   - Portrait: `blush`. Jaydon's defense drops to 0.
   - Narration:
     ```text
     * You give Jaydon that familiar look.
     * Jaydon blushes bright red! His defense dropped to 0.
     * Jaydon looks back into his bedroom before refocusing on you.
     ```
   - **Rotating Reaction Dialogue**:
     - **1st Flirt**: `* Jaydon: "Whoa..."` *(strictly without "hey there")*
     - **2nd Flirt**: `* Jaydon: "Focus, Focus, FOCUS"`
     - **3rd Flirt**: `* Jaydon: "That's not allowed"`
     - **4th Flirt+**: `* Jaydon: "HEY, what are you trying to do here?"`
3. **Smoke**:
   - **Allowed up to 2 times**.
   - **1st & 2nd Smoke**:
     - Portrait: `cough` (cloud puff).
     - Deals 5 damage to Mallika only (Jaydon takes 0 damage to preserve 1 max damage cap).
     - Jaydon's defense drops by 50.
     - Text:
       ```text
       * You both share a joint.
       * *Cough cough*
       * (Deals 5 damage to Mallika! Defense lowered!)
       * Jaydon: "*cough cough* Do you want some water?"
       ```
   - **3rd Smoke Onward (Denied)**:
     - Text:
       ```text
       * (We are out of joints!)
       ```
     - Returns to menu immediately with 0 damage taken.
4. **Hug (Crucial Action)**:
   - Portrait: `neutral`.
   - **This is the ONLY action that makes Jaydon spare-eligible**.
   - Text:
     ```text
     * You wrap your arms around Jaydon in a warm hug.
     * His embrace feels warm and steady.
     * Jaydon's name turns YELLOW on the Mercy menu!
     * Jaydon: "You give the best hugs in the world."
     ```

### ITEM Submenu (Sticky Toffee Pudding & Dress)
1. **Sticky Toffee Pudding**:
   - Restores Mallika to max HP (20 / 20). Plays heal ding SFX.
   - Text:
     ```text
     * You shared the freshly baked Sticky Toffee Pudding! (HP Maxed)
     * Jaydon: "Is it as good as the one you made?"
     * You let him down easy.
     ```
   - Returns cleanly to the battle button menu.
2. **Dress**:
   - Portrait: `blush`.
   - Text:
     ```text
     * You inspect the package...
     * It's a new pretty Dress! Mallika's style increased by 100!
     * Jaydon: "You're going to look absolutely stunning in it."
     ```

### MERCY Submenu & Spared Unlock
1. **Before giving a Hug**:
   ```text
   * Jaydon isn't ready to be spared yet.
   * Try giving him a hug first!
   ```
2. **After giving a Hug (Name is glowing YELLOW)**:
   - Portrait: `laugh`.
   - Text:
     ```text
     * You chose to SPARE Jaydon.
     * YOU WON! You earned 0 EXP and lots of LOVE.
     * But you gained something more precious.
     ```
     *(Note: "infinitely" is removed).*
   - Triggers transition to the emotional FINALE.

---

## 7. The Finale: Save Star & Determination Monologue

- **Scene**: Pitch-black void with a large, golden pulsing Yellow Save Star surrounded by rotating sparkle particles.
- **BGM**: Toby Fox's *Determination* theme + Save Ding SFX.
- **Typewriter Monologue**:
  - **Page 1**:
    ```text
    * (Knowing how much love, laughter, and adventures you share...)
    ```
  - **Page 2**:
    ```text
    * (...it fills you with DETERMINATION.)
    ```
  - **Page 3 (Glowing Golden Font `#ffff55`)**:
    ```text
    * Happy Anniversary, Mallika. I love you.
    ```
- **Resting Screen**:
  - Glowing pulsing prompt:
    ```text
    ♥ Always & Forever ♥
    ```

---
*End of Master Interaction & Dialogue Catalog.*
