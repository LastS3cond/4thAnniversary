/**
 * Undertale 4th Anniversary - Rooms, Overworld Maps, Triggers & Transitions
 */

class MapManager {
  constructor() {
    this.currentRoom = 'exterior';
    this.rooms = {};
    this.initRooms();
  }

  initRooms() {
    // ----------------------------------------------------
    // ROOM 1: EXTERIOR & TOWNHOUSE ENTRYWAY
    // ----------------------------------------------------
    this.rooms['exterior'] = {
      name: 'exterior',
      bgm: 'snowy',
      width: 640,
      height: 480,
      spawn: { x: 300, y: 380, dir: 'up' },
      colliders: [
        // Exterior brick wall with doorway opening at x: 290-345
        { x: 0, y: 0, w: 290, h: 220 },
        { x: 345, y: 0, w: 295, h: 220 },
        // Protruding stairwell bay feature on right (Photo 3)
        { x: 345, y: 200, w: 110, h: 35 },
        // Screen bounds
        { x: 0, y: 0, w: 60, h: 480 },
        { x: 580, y: 0, w: 60, h: 480 },
        { x: 0, y: 440, w: 640, h: 40 }
      ],
      interactables: [
        {
          x: 290, y: 195, w: 55, h: 30,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('first_floor', 155, 375, 'up'); },
          text: ["* Townhouse 316.", "* You step inside to get out of the cold."]
        },
        {
          x: 250, y: 155, w: 45, h: 35,
          text: ["* The numbers '316' shine against the dark red brick."]
        },
        {
          x: 350, y: 170, w: 100, h: 60,
          text: ["* The brick stairwell bay extends outward from the townhouse facade."]
        },
        {
          x: 100, y: 300, w: 60, h: 60,
          text: ["* A clean, quiet blanket of white snow under the dark sky."]
        },
        {
          x: 480, y: 300, w: 60, h: 60,
          text: ["* Soft footprints lead up to the front door."]
        }
      ],
      draw: (ctx) => {
        // Dark winter sky
        ctx.fillStyle = '#0a0d18';
        ctx.fillRect(0, 0, 640, 480);

        // Falling snowflakes in SKY ONLY (y: 0 to 60) - Snow does NOT fall over the brick building!
        ctx.fillStyle = '#ffffff';
        const t = Date.now() * 0.001;
        for (let i = 0; i < 20; i++) {
          const sx = ((i * 37) + t * 15) % 640;
          const sy = ((i * 23) + t * 20) % 60;
          ctx.fillRect(sx, sy, 2, 2);
        }

        // Townhouse Dark Red Brick Facade (Solid wall)
        const brick = window.spriteManager.env.brickWall;
        for (let x = 60; x < 580; x += 32) {
          for (let y = 60; y < 220; y += 32) {
            ctx.drawImage(brick, x, y);
          }
        }

        // Roofline trim & Beige Siding above awning (Photo 3)
        ctx.fillStyle = '#d4ccbd';
        ctx.fillRect(50, 40, 540, 16);
        ctx.strokeStyle = '#b0a696';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, 48); ctx.lineTo(590, 48);
        ctx.stroke();

        // Shingled Awning Overhang (Photo 3)
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(50, 56, 540, 10);

        // Recessed Dark Front Doorway (Photo 3)
        // High-contrast framing cleanly separated from wall
        ctx.fillStyle = '#110b0a';
        ctx.fillRect(296, 155, 46, 65);
        ctx.strokeStyle = '#1a0d0a';
        ctx.lineWidth = 3;
        ctx.strokeRect(296, 155, 46, 65);

        // Inside the open doorway (Photo 3):
        // Right side: interior foyer white wall visible inside
        ctx.fillStyle = '#f5f0e6';
        ctx.fillRect(314, 158, 26, 60);
        // White closet louver door visible inside on right
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(322, 162, 16, 54);
        ctx.strokeStyle = '#d6cdbd';
        ctx.lineWidth = 1;
        for (let ly = 168; ly < 212; ly += 5) {
          ctx.beginPath(); ctx.moveTo(324, ly); ctx.lineTo(336, ly); ctx.stroke();
        }

        // Left side: Dark front door opened inward (Photo 3)
        // Distinct dark wood door panel swung open to the left with silver hinges
        ctx.fillStyle = '#26150e';
        ctx.fillRect(298, 158, 16, 60);
        ctx.fillStyle = '#180d09';
        ctx.fillRect(299, 160, 13, 56);
        ctx.fillStyle = '#d0d0d0';
        ctx.fillRect(297, 164, 2, 4);
        ctx.fillRect(297, 185, 2, 4);
        ctx.fillRect(297, 206, 2, 4);
        // Deep shadow cast by door inside opening separating it from interior wall
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(310, 158, 6, 60);
        // Door threshold stone at bottom
        ctx.fillStyle = '#444444';
        ctx.fillRect(296, 218, 46, 4);

        // --- PROTRUDING FEATURE: BRICK STAIRWELL BAY (Photo 3) ---
        // Extends forward on the right of the door where the stairs are
        ctx.fillStyle = '#54171a'; // Protruding front brick face
        ctx.fillRect(348, 50, 110, 180);
        for (let bx = 348; bx < 458; bx += 32) {
          for (let by = 60; by < 230; by += 32) {
            ctx.drawImage(brick, bx, by);
          }
        }
        // Shadow cast by protruding bay onto recessed door on the left
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(340, 60, 8, 165);
        // Corner pillar trim on protruding bay
        ctx.fillStyle = '#3a1114';
        ctx.fillRect(348, 50, 4, 180);
        ctx.fillRect(454, 50, 4, 180);
        // Awning segment protruding forward
        ctx.fillStyle = '#3b2b1f';
        ctx.fillRect(344, 52, 118, 12);

        // --- CLEAR, HIGH-CONTRAST "316" PLAQUE (Photo 3) ---
        // Mounted directly on the brick next to front door
        ctx.fillStyle = '#000000';
        ctx.fillRect(260, 155, 34, 16);
        ctx.strokeStyle = '#e6c860';
        ctx.lineWidth = 2;
        ctx.strokeRect(260, 155, 34, 16);
        // Crisp, bold gold numbers "316"
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText('316', 266, 164);

        // Warm porch lantern glow above door
        ctx.fillStyle = 'rgba(255, 230, 140, 0.25)';
        ctx.beginPath();
        ctx.arc(318, 145, 45, 0, Math.PI * 2);
        ctx.fill();

        // Snow ground
        const snow = window.spriteManager.env.snow;
        for (let x = 60; x < 580; x += 32) {
          for (let y = 220; y < 440; y += 32) {
            ctx.drawImage(snow, x, y);
          }
        }

        // Snow path walkway leading to door
        ctx.fillStyle = 'rgba(210, 225, 240, 0.6)';
        ctx.fillRect(288, 220, 60, 200);

        // Front step stone
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(292, 218, 52, 8);

        // Falling snowflakes ON GROUND ONLY (y: 220 to 480)
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 30; i++) {
          const sx = ((i * 43) + t * 18) % 640;
          const sy = 220 + (((i * 31) + t * 25) % 240);
          ctx.fillRect(sx, sy, 2, 2);
        }
      }
    };

    // ----------------------------------------------------
    // ROOM 2: FIRST FLOOR (ACCURATE TOWNHOUSE ARCHITECTURE)
    // ----------------------------------------------------
    this.rooms['first_floor'] = {
      name: 'first_floor',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 175, y: 380, dir: 'up' },
      colliders: [
        // Perimeter outer walls
        { x: 0, y: 0, w: 640, h: 60 },   // Top wall
        { x: 0, y: 440, w: 640, h: 40 }, // Bottom wall
        { x: 0, y: 0, w: 40, h: 480 },   // Left wall
        { x: 600, y: 0, w: 40, h: 480 }, // Right wall

        // Center Interior Dividing Wall (warm drywall partition behind TV)
        // Kept compact so there is wide open walking space to all bottom kitchen cabinets!
        { x: 215, y: 180, w: 160, h: 105 },

        // Bathroom Block on Left of Hallway
        { x: 40, y: 200, w: 95, h: 165 },

        // Bottom Wall (South Wall) Fixtures:
        // Bottom-left corner: coat closet
        { x: 40, y: 385, w: 35, h: 55 },
        // Shoe rack leaning against the vertical bathroom wall
        { x: 135, y: 330, w: 24, h: 36 },
        // Kitchen South Wall: Pantry, Cabinets, Sink, Dishwasher, More Cabinets
        { x: 270, y: 395, w: 275, h: 45 },

        // Kitchen East Wall (Right Wall): Fridge, Cabinet, Stove (Microwave removed)
        { x: 545, y: 195, w: 55, h: 195 },

        // Living Room Furniture:
        // Freestanding heavy punching bag station on left brick corner
        { x: 50, y: 68, w: 40, h: 55 },
        // Red L-Couch on north side in the middle facing south
        { x: 180, y: 72, w: 105, h: 58 },
        // Coffee table inside the L of the couch
        { x: 210, y: 105, w: 45, h: 28 },
        // TV stand directly opposite couch on south side facing north
        { x: 175, y: 142, w: 115, h: 36 },
        // Plastic long folding table rotated 90 degrees (vertical against wall) & bench
        { x: 345, y: 65, w: 48, h: 84 }
      ],
      interactables: [
        // 1. Bottom-Left Coat Closet
        {
          x: 40, y: 385, w: 35, h: 55,
          text: ["* Just some coats hanging."]
        },
        // 2. White Shoe Rack (Leaning against the bathroom wall)
        {
          x: 135, y: 330, w: 25, h: 40,
          text: ["* A familiar row of New Balances leaning against the bathroom wall."]
        },
        // 3. Front Door (Exit back outside)
        {
          x: 155, y: 434, w: 45, h: 12,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('exterior', 318, 240, 'down'); }
        },
        // 4. Hallway Left: First-Floor Bathroom
        {
          x: 130, y: 245, w: 15, h: 45,
          text: ["* You don't have to use the bathroom right now."]
        },
        // 5. Hallway Right: Middle Closet Door
        {
          x: 215, y: 215, w: 15, h: 45,
          text: ["* A hallway storage closet. It's packed full."]
        },
        // 6. Stairs (Right of front door & hallway) - Leads to U-shaped staircase
        {
          x: 215, y: 405, w: 50, h: 35,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('staircase', 255, 90, 'down'); },
          text: ["* You head into the stairs..."]
        },
        // 7. Kitchen South Wall: Pantry
        {
          x: 270, y: 390, w: 35, h: 50,
          text: ["* The pantry is closed."]
        },
        // 8. Kitchen South Wall: Cabinets
        {
          x: 305, y: 395, w: 45, h: 45,
          text: ["* Dark wood cabinetry filled with plates and mugs."]
        },
        // 9. Kitchen South Wall: Sink & Crooked Blinds (Interactive choice to clean!)
        {
          x: 350, y: 385, w: 45, h: 55,
          triggerSink: true
        },
        // 10. Kitchen South Wall: Dishwasher
        {
          x: 395, y: 395, w: 35, h: 45,
          text: ["* Never figured out how it worked."]
        },
        // 11. Kitchen South Wall: More Cabinets
        {
          x: 430, y: 395, w: 115, h: 45,
          text: ["* More dark wood cabinets with bowls and spices."]
        },
        // 12. Kitchen Right Wall: Refrigerator (Top)
        {
          x: 545, y: 195, w: 55, h: 60,
          text: ["* I'm not particularly hungry."]
        },
        // 13. Kitchen Right Wall: Cabinet (Middle)
        {
          x: 545, y: 255, w: 55, h: 60,
          text: ["* A kitchen counter with spices and cutting boards."]
        },
        // 14. Kitchen Right Wall: Oven with Warm Stove (Bottom) (Photo 1)
        {
          x: 545, y: 315, w: 55, h: 70,
          text: [
            "* The oven is warm. A rich aroma of brown sugar and dates fills the kitchen."
          ]
        },
        // 15. Living Room: Punching Bag (Interactive punch choice)
        {
          x: 50, y: 68, w: 40, h: 60,
          triggerPunchingBag: true
        },
        // 16. Living Room: Screen Door (Sliding glass door)
        {
          x: 95, y: 45, w: 55, h: 30,
          text: ["* It's cold outside."]
        },
        // 17. Living Room: BIG Red L-Couch in the middle
        {
          x: 180, y: 72, w: 105, h: 58,
          text: ["* The red couch in the center of the room. Perfect for playing Switch (which is sitting right there)."]
        },
        // 18. Living Room: Coffee Table Inside the L
        {
          x: 210, y: 105, w: 45, h: 30,
          text: ["* Papers just strewn about."]
        },
        // 19. Living Room: BIG TV Stand & TV directly opposite couch
        {
          x: 175, y: 142, w: 115, h: 36,
          text: ["* The TV is quiet. A cozy reflection fills the screen."]
        },
        // 20. Living Room: Plastic Long Folding Table & Bench (Duckling puzzle & cups)
        {
          x: 345, y: 65, w: 48, h: 84,
          text: ["* A cute puzzle of ducklings and flowers."]
        }
      ],
      draw: (ctx) => {
        // --- FLOOR BASE ---
        // Light blonde hardwood flooring (Photo 4)
        ctx.fillStyle = '#caa478';
        ctx.fillRect(40, 60, 560, 380);

        // --- CENTER INTERIOR DIVIDING WALL (Photo 1) ---
        // Finished warm interior drywall behind TV, compact so kitchen has wide open access
        ctx.fillStyle = '#eae3d2';
        ctx.fillRect(215, 180, 160, 105);
        // Baseboard molding along outer edges
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(215, 281, 160, 4); // South baseboard
        ctx.fillRect(215, 180, 160, 4); // North baseboard (behind TV)
        ctx.fillRect(215, 180, 4, 105); // West baseboard (hallway)
        ctx.fillRect(371, 180, 4, 105); // East baseboard (kitchen)
        // Subtle wall edge shading
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(219, 184, 152, 97);

        // --- BATHROOM ROOM BLOCK (Left of hallway) ---
        ctx.fillStyle = '#eae3d2';
        ctx.fillRect(40, 200, 95, 165);
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(40, 361, 95, 4);  // South baseboard
        ctx.fillRect(131, 200, 4, 165); // East baseboard facing hallway
        // Bathroom Door facing hallway
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(130, 245, 8, 45);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(132, 267, 3, 3); // knob
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("BATH", 85, 272);

        // --- CLOSET DOOR ON RIGHT OF HALLWAY (on center wall) ---
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(215, 215, 8, 45);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(217, 237, 3, 3);
        ctx.fillStyle = '#333333';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("CLOSET", 228, 242);

        // --- HALLWAY FLOOR RUNNER ---
        ctx.fillStyle = '#b59068';
        ctx.fillRect(138, 180, 75, 240);

        // --- OUTER WALLS ---
        ctx.fillStyle = '#221a18';
        ctx.fillRect(0, 0, 640, 60);   // Top wall
        ctx.fillStyle = '#302422';
        ctx.fillRect(0, 440, 640, 40); // Bottom wall
        ctx.fillRect(0, 0, 40, 480);   // Left wall
        ctx.fillRect(600, 0, 40, 480); // Right wall

        // Baseboard along south perimeter wall
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(40, 436, 560, 4);

        // --- ONLY A SMALL LINE OF BRICKS ON LEFT WALL (Photo 4 & 5) ---
        // Removed bricks from everywhere else in the room!
        const brick = window.spriteManager.env.brickWall;
        for (let by = 60; by < 190; by += 32) {
          ctx.drawImage(brick, 40, by, 20, 32);
        }

        // --- BOTTOM-LEFT CORNER: CLOSET, SHOE RACK, FOYER LANDING ---
        // Entry Foyer Tile Landing in front of shoe rack & closet
        ctx.fillStyle = '#d6cdbd';
        ctx.fillRect(40, 365, 100, 75);
        ctx.strokeStyle = '#b8ad9b';
        ctx.strokeRect(40, 365, 100, 75);

        // Coat Closet on far left
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(40, 385, 35, 55);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(70, 412, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillText("COATS", 42, 402);

        // White Shoe Rack Leaning Against the Bathroom Wall (Photo 3/5)
        ctx.drawImage(window.spriteManager.env.shoeRack, 136, 330, 24, 36);

        // --- FRONT DOOR (South Wall Entryway) ---
        // High contrast dark casing clearly separated from wall & baseboard
        ctx.fillStyle = '#1c0f0a';
        ctx.fillRect(156, 430, 46, 14);
        ctx.fillStyle = '#2c1a12';
        ctx.fillRect(158, 432, 42, 12);
        // Dark door leaf / threshold
        ctx.fillStyle = '#150c08';
        ctx.fillRect(160, 434, 38, 10);
        // Brass door threshold trim
        ctx.fillStyle = '#c5a059';
        ctx.fillRect(160, 433, 38, 2);
        // Coir Welcome Mat in front of door
        ctx.fillStyle = '#5c432d';
        ctx.fillRect(158, 416, 42, 16);
        ctx.strokeStyle = '#7c5c3f';
        ctx.lineWidth = 1;
        ctx.strokeRect(159, 417, 40, 14);

        // --- KITCHEN SOUTH WALL (STAIRS, PANTRY, CABINETS, SINK, DISHWASHER, MORE CABINETS) ---
        // 1. Staircase Landing & Stairs going up (to the right of hallway)
        ctx.fillStyle = '#c7b299';
        ctx.fillRect(215, 405, 50, 35);
        ctx.strokeStyle = '#a8947c';
        for (let sy = 405; sy <= 440; sy += 7) {
          ctx.beginPath(); ctx.moveTo(215, sy); ctx.lineTo(265, sy); ctx.stroke();
        }
        ctx.fillStyle = '#ffff55';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("STAIRS▲", 212, 398);

        // 2. Pantry
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(270, 390, 35, 50);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(274, 415, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillText("PANTRY", 267, 382);

        // 3. Dark Wood Cabinets left of sink
        ctx.fillStyle = '#4a2c1a';
        ctx.fillRect(305, 395, 45, 45);

        // 4. Sink & Crooked Blinds Window (Photo 2)
        ctx.drawImage(window.spriteManager.env.sink, 350, 385, 45, 55);

        // 5. Dishwasher (Photo 2: black front with silver dial)
        ctx.drawImage(window.spriteManager.env.dishwasher, 395, 395, 35, 45);

        // 6. More Dark Wood Cabinets right of dishwasher
        ctx.fillStyle = '#4a2c1a';
        ctx.fillRect(430, 395, 115, 45);

        // --- KITCHEN EAST WALL (RIGHT WALL: FRIDGE, CABINET, OVEN W/ MICROWAVE) ---
        // 1. Refrigerator (Top)
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(545, 195, 55, 60);
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(545, 225, 55, 2); // fridge door split
        ctx.fillStyle = '#888888';
        ctx.fillRect(548, 205, 3, 12); // handles
        ctx.fillRect(548, 235, 3, 12);

        // 2. Kitchen Cabinet counter (Middle)
        ctx.fillStyle = '#4a2c1a';
        ctx.fillRect(545, 255, 55, 60);

        // 3. Oven with Microwave on top (Bottom) (Photo 1)
        ctx.drawImage(window.spriteManager.env.stove, 545, 315, 55, 70);

        // --- LIVING ROOM (NORTH) ---
        // Vibrant Green LED ceiling perimeter strip!
        ctx.drawImage(window.spriteManager.env.greenLed, 40, 58, 200, 6);
        ctx.drawImage(window.spriteManager.env.greenLed, 240, 58, 200, 6);
        ctx.drawImage(window.spriteManager.env.greenLed, 440, 58, 160, 6);
        ctx.fillStyle = 'rgba(0, 255, 68, 0.08)';
        ctx.fillRect(40, 60, 560, 40);

        // Screen Door (Sliding glass door looking into cold)
        ctx.drawImage(window.spriteManager.env.slidingDoor, 95, 45, 55, 35);

        // Freestanding Heavy Punching Bag Station with sandbag legs in brick corner
        ctx.drawImage(window.spriteManager.env.punchBag, 50, 68, 40, 60);

        // --- SWAPPED: COUCH ON NORTH, TV STAND ON SOUTH (Photo 1) ---
        // BIG Red L-Couch in the middle facing south
        ctx.drawImage(window.spriteManager.env.redCouch, 180, 72, 105, 58);

        // Coffee Table INSIDE THE L of the couch (Photo 1)
        ctx.drawImage(window.spriteManager.env.coffeeTable, 210, 105, 45, 28);

        // BIG TV Stand & TV directly opposite the couch facing north (Photo 1)
        ctx.fillStyle = '#3a2618';
        ctx.fillRect(175, 154, 115, 18); // wooden TV stand
        ctx.fillStyle = '#111111';
        ctx.fillRect(180, 138, 105, 22); // TV screen facing north
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(182, 140, 101, 18); // screen face
        ctx.fillStyle = '#444444';
        ctx.fillRect(228, 156, 9, 4);   // TV pedestal base
        // Rainbow foil streamer next to TV draping down wall (Photo 1)
        ctx.strokeStyle = '#c0d8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(295, 140);
        ctx.quadraticCurveTo(305, 158, 298, 172);
        ctx.stroke();

        // White Long Folding Table Rotated 90 Degrees (Vertical, Longer: 32x84)
        ctx.drawImage(window.spriteManager.env.puzzleTable, 345, 65, 32, 84);
        // Folding bench alongside table
        ctx.fillStyle = '#dcdcdc';
        ctx.fillRect(380, 70, 8, 74);
        ctx.fillStyle = '#888888';
        ctx.fillRect(382, 68, 4, 4);
        ctx.fillRect(382, 140, 4, 4);
      }
    };

    // ----------------------------------------------------
    // ROOM 3: THE STAIRCASE & LANDING TRANSITION
    // Compact U-shaped switchback staircase!
    // Start near top of Flight 1, walk down to landing, turn 180°, walk up Flight 2!
    // ----------------------------------------------------
    this.rooms['staircase'] = {
      name: 'staircase',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 255, y: 90, dir: 'down' },
      colliders: [
        // Shaft boundary outer walls
        { x: 0, y: 0, w: 235, h: 480 },   // Left of shaft
        { x: 375, y: 0, w: 265, h: 480 }, // Right of shaft
        { x: 0, y: 0, w: 640, h: 50 },    // Top bounds (except doorway openings)
        { x: 0, y: 390, w: 640, h: 90 },  // Bottom bounds below landing
        // Central wall / handrail dividing Flight 1 and Flight 2
        { x: 295, y: 40, w: 20, h: 250 }
      ],
      interactables: [
        // Intermediate Landing Window (Photo 2 & 5) overlooking outside snow
        {
          x: 270, y: 345, w: 70, h: 45,
          text: [
            "* You pause at the intermediate landing.",
            "* Outside the window, snowflakes drift through the quiet winter night."
          ]
        },
        // Flight 1 Top Doorway: Exit back down to First Floor
        {
          x: 235, y: 40, w: 60, h: 25,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('first_floor', 235, 360, 'down'); }
        },
        // Flight 2 Top Doorway: Exit into Second Floor Hallway
        {
          x: 315, y: 40, w: 60, h: 25,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('second_floor', 320, 375, 'up'); }
        }
      ],
      draw: (ctx) => {
        // Dark background wall
        ctx.fillStyle = '#1c1618';
        ctx.fillRect(0, 0, 640, 480);

        // Stair shaft enclosure walls (warm interior drywall)
        ctx.fillStyle = '#261c20';
        ctx.fillRect(0, 0, 235, 480);
        ctx.fillRect(375, 0, 265, 480);
        ctx.fillRect(0, 390, 640, 90);

        // Intermediate Landing Floor at the bottom (connecting Flight 1 & Flight 2)
        ctx.fillStyle = '#bfa588'; // Beige carpet landing
        ctx.fillRect(235, 290, 140, 100);

        // Landing Window on bottom wall framing the outside snow (Photo 5)
        ctx.fillStyle = '#3a2820'; // Window frame
        ctx.fillRect(270, 350, 70, 40);
        ctx.fillStyle = '#0a101d'; // Sky
        ctx.fillRect(274, 354, 62, 32);

        // Snow falling outside window
        ctx.fillStyle = '#ffffff';
        const t = Date.now() * 0.001;
        for (let i = 0; i < 12; i++) {
          const wx = 276 + ((i * 17 + t * 10) % 58);
          const wy = 356 + ((i * 23 + t * 18) % 28);
          ctx.fillRect(wx, wy, 2, 2);
        }
        // Window cross mullions
        ctx.strokeStyle = '#3a2820';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(305, 354); ctx.lineTo(305, 386);
        ctx.moveTo(274, 370); ctx.lineTo(336, 370);
        ctx.stroke();

        // Central divider wall / newel post between flight 1 and flight 2
        ctx.fillStyle = '#352428';
        ctx.fillRect(295, 40, 20, 250);
        ctx.fillStyle = '#4a343a';
        ctx.fillRect(297, 40, 16, 250);

        // --- FLIGHT 1: 7 STEPS DESCENDING TO LANDING (Left side, x: 235..295) ---
        ctx.fillStyle = '#c8b299'; // Beige carpet steps
        ctx.fillRect(235, 60, 60, 230);
        ctx.strokeStyle = '#9e8770';
        ctx.lineWidth = 2;
        for (let i = 1; i <= 7; i++) {
          const sy = 60 + i * 32;
          ctx.beginPath();
          ctx.moveTo(235, sy); ctx.lineTo(295, sy); ctx.stroke();
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          ctx.fillRect(235, sy - 6, 60, 6);
        }

        // --- FLIGHT 2: 7 STEPS ASCENDING TO 2ND FLOOR (Right side, x: 315..375) ---
        ctx.fillStyle = '#c8b299';
        ctx.fillRect(315, 60, 60, 230);
        for (let i = 1; i <= 7; i++) {
          const sy = 290 - i * 32;
          ctx.beginPath();
          ctx.moveTo(315, sy); ctx.lineTo(375, sy); ctx.stroke();
          ctx.fillStyle = 'rgba(0,0,0,0.12)';
          ctx.fillRect(315, sy, 60, 6);
        }

        // Wooden Handrails
        ctx.strokeStyle = '#5a3825';
        ctx.lineWidth = 3;
        ctx.beginPath();
        // Left handrail
        ctx.moveTo(237, 60); ctx.lineTo(237, 290);
        // Center handrails
        ctx.moveTo(294, 60); ctx.lineTo(294, 290);
        ctx.moveTo(316, 60); ctx.lineTo(316, 290);
        // Right handrail
        ctx.moveTo(373, 60); ctx.lineTo(373, 290);
        ctx.stroke();

        // Directional guides
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("▼ 7 STEPS DOWN", 236, 75);
        ctx.fillText("TURN 180° ►", 270, 315);
        ctx.fillText("▲ 7 STEPS UP", 316, 75);
      }
    };

    // ----------------------------------------------------
    // ROOM 4: SECOND FLOOR HALLWAY (NARROW TOWNHOUSE CORRIDOR)
    // Layout from South to North:
    // - Stairs lead directly into the hallway
    // - 1st pair: Bathroom on LEFT, Alex's door OPPOSITE (right)
    // - 2nd pair: Storage closet on LEFT, Wall OPPOSITE (right)
    // - 3rd pair: Kevin's door on LEFT, Jaydon's door OPPOSITE (right, Boss Trigger)
    // ----------------------------------------------------
    this.rooms['second_floor'] = {
      name: 'second_floor',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 320, y: 375, dir: 'up' },
      colliders: [
        // Hallway boundaries: Thin corridor matching stair width (x: 280..360, width 80)
        { x: 0, y: 0, w: 280, h: 480 },   // Left rooms / walls
        { x: 360, y: 0, w: 280, h: 480 }, // Right rooms / walls
        { x: 280, y: 0, w: 80, h: 65 },   // Top north wall
        // Bottom walls around stairs opening (x: 280..360)
        { x: 0, y: 440, w: 280, h: 40 },
        { x: 360, y: 440, w: 280, h: 40 }
      ],
      interactables: [
        // 1. FIRST PAIR (y: 270..325)
        // Left: Second-Floor Bathroom
        {
          x: 255, y: 280, w: 30, h: 48,
          text: ["* You don't have to use the bathroom right now."]
        },
        // Opposite (Right): Alex's Door
        {
          x: 355, y: 280, w: 30, h: 48,
          text: ["* You hear yelling and furious typing. Must be playing a game."]
        },

        // 2. SECOND PAIR (y: 175..230)
        // Left: Storage Closet with suitcases
        {
          x: 255, y: 180, w: 30, h: 48,
          text: ["* There are some suitcases in here."]
        },
        // Opposite (Right): Solid Wall (No door!)

        // 3. THIRD PAIR AT END OF HALLWAY (y: 80..135)
        // Left: Kevin's Door
        {
          x: 255, y: 80, w: 30, h: 48,
          text: ["* You hear him speaking very formally, must be interviewing."]
        },
        // Opposite (Right): Jaydon's Door (Boss Encounter Trigger!)
        {
          x: 355, y: 80, w: 30, h: 48,
          triggerBoss: true
        },

        // 4. STAIRS EXIT (Bottom of hallway directly back to staircase)
        {
          x: 285, y: 435, w: 70, h: 25,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('staircase', 335, 80, 'down'); }
        }
      ],
      draw: (ctx) => {
        // Wall base
        ctx.fillStyle = '#231b20';
        ctx.fillRect(0, 0, 640, 480);

        // Thin Hallway Carpet (x: 280..360, width 80px)
        ctx.fillStyle = '#a68c76';
        ctx.fillRect(280, 65, 80, 375);

        // Carpet runner pattern
        ctx.fillStyle = '#8f745e';
        ctx.fillRect(290, 65, 60, 375);
        ctx.strokeStyle = '#c9b29b';
        ctx.lineWidth = 1;
        ctx.strokeRect(290, 65, 60, 375);

        // Baseboard moldings along hallway walls
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(278, 65, 3, 375);
        ctx.fillRect(359, 65, 3, 375);
        ctx.fillRect(280, 64, 80, 3); // top baseboard

        // Helper function to draw crisp bedroom doors
        const drawDoor = (x, y, label, isKnobLeft = false, isGold = false) => {
          ctx.fillStyle = isGold ? '#593220' : '#42281a';
          ctx.fillRect(x, y, 26, 46);
          ctx.fillStyle = isGold ? '#3d2012' : '#2e1b12';
          ctx.fillRect(x + 2, y + 2, 22, 20);
          ctx.fillRect(x + 2, y + 24, 22, 20);
          // Brass knob
          ctx.fillStyle = '#ffd700';
          const knobX = isKnobLeft ? x + 3 : x + 20;
          ctx.fillRect(knobX, y + 24, 3, 4);
          // Label
          ctx.fillStyle = isGold ? '#ffff55' : '#ffffff';
          ctx.font = '6px "Press Start 2P", monospace';
          const lx = isKnobLeft ? x - 4 : x + 4;
          ctx.fillText(label, lx - (isKnobLeft ? 26 : 0), y - 4);
        };

        // --- PAIR 1 (y: 280) ---
        // Left: Bathroom Door
        drawDoor(254, 280, "BATH", false);
        // Right (opposite): Alex's Door
        drawDoor(360, 280, "ALEX", true);

        // --- PAIR 2 (y: 180) ---
        // Left: Storage Closet
        drawDoor(254, 180, "STORAGE", false);
        // Suitcases graphic inside nook next to closet
        ctx.fillStyle = '#1e3852';
        ctx.fillRect(234, 192, 16, 12);
        ctx.fillStyle = '#7a3128';
        ctx.fillRect(237, 206, 14, 14);
        // Right (opposite): Solid Wall (warm interior drywall with baseboard)
        ctx.fillStyle = '#eae3d2';
        ctx.fillRect(362, 175, 45, 56);
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(362, 228, 45, 3);
        ctx.fillStyle = '#999999';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillText("[WALL]", 366, 205);

        // --- PAIR 3 AT END OF HALLWAY (y: 80) ---
        // Left: Kevin's Door
        drawDoor(254, 80, "KEVIN", false);
        // Right (opposite): Jaydon's Door (Boss Trigger!)
        drawDoor(360, 80, "JAYDON", true, true);

        // --- STAIRS DIRECTLY CONNECTING TO BOTTOM OF HALLWAY ---
        ctx.fillStyle = '#c7b299';
        ctx.fillRect(285, 420, 70, 35);
        for (let sy = 420; sy <= 455; sy += 7) {
          ctx.beginPath(); ctx.moveTo(285, sy); ctx.lineTo(355, sy); ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("▼ STAIRS", 295, 412);

        // If Jaydon stepped out into the hallway before battle
        // Jaydon steps out of his bedroom door to the side of Mallika
        if (window.game && window.game.isJaydonInHallway) {
          const player = window.game.player;
          const jx = (player && player.x) ? Math.min(342, Math.max(330, player.x + 18)) : 338;
          const jy = (player && player.y) ? Math.max(65, player.y - 12) : 70;
          ctx.drawImage(window.spriteManager.jaydonOverworld, jx, jy);
        }
      }
    };
  }

  getCurrentRoom() {
    return this.rooms[this.currentRoom];
  }
}

window.mapManager = new MapManager();
