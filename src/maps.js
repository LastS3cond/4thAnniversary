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
    // ----------------------------------------------------
    // ROOM 1: TOWNHOUSE EXTERIOR (FALL EMULATION, THINNER ALLEY)
    // - Width cut by 1/4 on left and right (playable width x: 160..480, 320px)
    // - Fall emulation: falling autumn leaves in sky/yard, autumn grass lawn
    // - Facade: 100% full brick around door & stairwell bay, white siding strictly above door
    // ----------------------------------------------------
    this.rooms['exterior'] = {
      name: 'exterior',
      bgm: 'snowy',
      width: 640,
      height: 480,
      spawn: { x: 310, y: 380, dir: 'up' },
      colliders: [
        // Thinned boundaries: Cut out first 1/4 (0..160) and last 1/4 (480..640)
        { x: 0, y: 0, w: 160, h: 480 },   // Left void boundary
        { x: 480, y: 0, w: 160, h: 480 }, // Right void boundary

        // North townhouse building wall with doorway opening at x: 296..342
        { x: 160, y: 0, w: 136, h: 220 }, // Left facade
        { x: 342, y: 0, w: 138, h: 220 }, // Right stairwell bay facade (Full brick!)
        // Bottom screen boundary
        { x: 160, y: 440, w: 320, h: 40 }
      ],
      interactables: [
        {
          x: 296, y: 195, w: 46, h: 30,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('first_floor', 175, 380, 'up'); },
          text: ["* Townhouse 316.", "* You step inside the warm townhouse."]
        },
        {
          x: 260, y: 165, w: 34, h: 25,
          text: ["* The numbers '316' shine against the dark red brick."]
        },
        {
          x: 348, y: 160, w: 110, h: 60,
          text: ["* The full-brick stairwell bay extends outward from the facade."]
        },
        {
          x: 170, y: 300, w: 70, h: 70,
          text: ["* A patch of autumn grass with fallen amber leaves."]
        },
        {
          x: 400, y: 300, w: 70, h: 70,
          text: ["* Golden and crimson leaves rustle softly on the lawn."]
        }
      ],
      draw: (ctx) => {
        // Deep black void outside the alley bounds (0..160 and 480..640)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 640, 480);

        // Autumn dusk sky over the alley (x: 160..480, y: 0..60)
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(160, 0, 320, 60);

        // Townhouse Dark Red Brick Facade (Left and around doorway: x: 160..348)
        const brick = window.spriteManager.env.brickWall;
        for (let x = 160; x < 348; x += 32) {
          for (let y = 60; y < 220; y += 32) {
            ctx.drawImage(brick, x, y);
          }
        }

        // --- WHITE SECTION: STRICTLY ABOVE THE DOOR (3 door widths wide: 138px, x: 250..388, y: 60..130) ---
        ctx.fillStyle = '#f1ede4'; // Crisp white architectural siding
        ctx.fillRect(250, 60, 138, 70);
        // Horizontal white lap siding shadow lines
        ctx.strokeStyle = '#d6cfc0';
        ctx.lineWidth = 1;
        for (let sy = 68; sy < 130; sy += 10) {
          ctx.beginPath();
          ctx.moveTo(250, sy); ctx.lineTo(388, sy);
          ctx.stroke();
        }
        // White trim border around the white facade
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(248, 58, 142, 3);
        ctx.fillRect(248, 128, 142, 3);
        ctx.fillRect(248, 58, 3, 73);
        ctx.fillRect(387, 58, 3, 73);

        // Roofline trim & shingled awning across the top
        ctx.fillStyle = '#4a3728';
        ctx.fillRect(160, 52, 320, 10);

        // --- 100% FULL BRICK AROUND THE DOORWAY (y: 130..220) ---
        for (let x = 248; x < 348; x += 32) {
          for (let y = 130; y < 220; y += 32) {
            ctx.drawImage(brick, x, y);
          }
        }

        // --- RECESSED DARK FRONT DOORWAY (x: 296..342, y: 155..220) ---
        // Clean brick door frame - NO white part inside!
        ctx.fillStyle = '#110b0a';
        ctx.fillRect(296, 155, 46, 65);
        ctx.strokeStyle = '#1a0d0a';
        ctx.lineWidth = 3;
        ctx.strokeRect(296, 155, 46, 65);

        // Dark open doorway interior
        ctx.fillStyle = '#1a1210';
        ctx.fillRect(298, 158, 42, 60);

        // Mahogany front door opened inward to the left
        ctx.fillStyle = '#26150e';
        ctx.fillRect(298, 158, 14, 60);
        ctx.fillStyle = '#150c08';
        ctx.fillRect(300, 160, 10, 56);
        // Brass hinges
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(297, 166, 2, 4);
        ctx.fillRect(297, 188, 2, 4);
        ctx.fillRect(297, 210, 2, 4);
        // Interior shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(312, 158, 28, 60);
        // Door threshold stone at bottom
        ctx.fillStyle = '#444444';
        ctx.fillRect(296, 218, 46, 4);

        // --- PROTRUDING FEATURE: FULL BRICK STAIRWELL BAY (x: 348..460) ---
        // 100% Full dark red brick facade from roofline to ground!
        ctx.fillStyle = '#54171a';
        ctx.fillRect(348, 50, 112, 180);
        for (let bx = 348; bx < 460; bx += 32) {
          for (let by = 56; by < 230; by += 32) {
            ctx.drawImage(brick, bx, by);
          }
        }
        // Shadow cast by protruding bay onto recessed facade on left
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(340, 60, 8, 165);
        // Corner pillar trim
        ctx.fillStyle = '#3a1114';
        ctx.fillRect(348, 50, 4, 180);
        ctx.fillRect(456, 50, 4, 180);

        // --- CLEAR "316" PLAQUE ON BRICK BESIDE DOOR (Photo 3) ---
        ctx.fillStyle = '#000000';
        ctx.fillRect(258, 166, 34, 16);
        ctx.strokeStyle = '#e6c860';
        ctx.lineWidth = 2;
        ctx.strokeRect(258, 166, 34, 16);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px monospace';
        ctx.textBaseline = 'middle';
        ctx.fillText('316', 264, 175);

        // Warm porch lantern glow above door
        ctx.fillStyle = 'rgba(255, 230, 140, 0.25)';
        ctx.beginPath();
        ctx.arc(319, 145, 45, 0, Math.PI * 2);
        ctx.fill();

        // --- FALL EMULATION: AUTUMN GRASS LAWN (y: 220..440) ---
        ctx.fillStyle = '#3f5d2b'; // Autumn olive-green grass
        ctx.fillRect(160, 220, 320, 220);

        // Grass texture specks
        ctx.fillStyle = '#4c6e34';
        for (let gx = 165; gx < 475; gx += 14) {
          for (let gy = 225; gy < 435; gy += 16) {
            ctx.fillRect(gx + ((gy * 7) % 11), gy, 2, 3);
          }
        }

        // Stone flagstone paver walkway leading to door (x: 290..348, y: 220..440)
        ctx.fillStyle = '#6b5a4d';
        ctx.fillRect(290, 220, 58, 220);
        ctx.strokeStyle = '#4a3b30';
        ctx.lineWidth = 1.5;
        for (let py = 220; py < 440; py += 18) {
          ctx.beginPath();
          ctx.moveTo(290, py); ctx.lineTo(348, py);
          ctx.stroke();
        }

        // Door entrance step stone
        ctx.fillStyle = '#7a7a7a';
        ctx.fillRect(292, 218, 54, 8);

        // --- FALLING AUTUMN LEAVES (Fluttering across sky & yard) ---
        const leafColors = ['#d97706', '#b45309', '#dc2626', '#f59e0b', '#78350f'];
        const t = Date.now() * 0.001;
        for (let i = 0; i < 28; i++) {
          const lx = 165 + ((i * 31) + t * 20 + Math.sin(t * 2 + i) * 14) % 310;
          const ly = ((i * 27) + t * 30) % 440;
          ctx.fillStyle = leafColors[i % leafColors.length];
          ctx.fillRect(lx, ly, 3, 2);
        }

        // Alley side borders (high-contrast frame separating void)
        ctx.fillStyle = '#1c1c1c';
        ctx.fillRect(158, 0, 2, 480);
        ctx.fillRect(480, 0, 2, 480);
      }
    };

    // ----------------------------------------------------
    // ROOM 2: FIRST FLOOR (ACCURATE TOWNHOUSE ARCHITECTURE)
    // - Pitch black void for exterior/unused space
    // - Living room is left half of house (x: 40..325)
    // - Dividing wall between living room and kitchen/fridge (x: 325, y: 60..180)
    // - Middle divider box moved DOWN at par with bathroom box (y: 200..365)
    // - Couch & TV stand centered in middle of living room with walking corridor
    // - Punching bag, coat closet, and folding table bigger
    // - Folding table against right wall where fridge leaves off
    // - Shoe rack in pocket to the left of front door
    // - Sink rotated 180° without window; stove rotated 90° on east wall
    // ----------------------------------------------------
    this.rooms['first_floor'] = {
      name: 'first_floor',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 175, y: 380, dir: 'up' },
      colliders: [
        // Perimeter outer walls
        { x: 0, y: 0, w: 640, h: 60 },   // Top perimeter wall
        { x: 0, y: 440, w: 640, h: 40 }, // Bottom perimeter wall
        { x: 0, y: 0, w: 40, h: 480 },   // Left perimeter wall
        { x: 600, y: 0, w: 40, h: 480 }, // Right perimeter wall

        // Living Room / Kitchen Dividing Wall (x: 325, y: 60..180)
        { x: 325, y: 60, w: 8, h: 120 },

        // Center Interior Dividing Wall (Moved down at par with bathroom box: y: 200..365)
        { x: 215, y: 200, w: 105, h: 165 },

        // Bathroom Block on Left of Hallway (y: 200..365)
        { x: 40, y: 200, w: 95, h: 165 },

        // Bottom Wall (South Wall) Fixtures:
        // Bigger Coat Closet in bottom-left corner
        { x: 40, y: 370, w: 55, h: 70 },
        // Shoe rack in the pocket to the left of the door
        { x: 115, y: 390, w: 26, h: 40 },
        // Kitchen South Wall: Pantry, Cabinets, Sink, Dishwasher, More Cabinets
        { x: 270, y: 395, w: 275, h: 45 },

        // Kitchen East Wall (Right Wall): Fridge, Counter, Rotated Stove
        { x: 545, y: 195, w: 55, h: 195 },

        // Living Room Furniture:
        // Bigger freestanding heavy punching bag station
        { x: 45, y: 65, w: 48, h: 70 },
        // Clear L-Couch in middle of living room
        { x: 135, y: 68, w: 76, h: 56 },
        // Coffee table inside the L
        { x: 165, y: 92, w: 40, h: 26 },
        // TV stand directly opposite couch facing north (space between couch and TV for walking!)
        { x: 130, y: 148, w: 86, h: 24 },
        // Bigger plastic folding table against right living room wall
        { x: 280, y: 65, w: 36, h: 96 }
      ],
      interactables: [
        // 1. Bigger Bottom-Left Coat Closet
        {
          x: 40, y: 370, w: 55, h: 70,
          text: ["* Just some warm coats hanging."]
        },
        // 2. White Shoe Rack in the pocket to the left of the door
        {
          x: 115, y: 390, w: 26, h: 40,
          text: ["* A familiar row of New Balances resting in the foyer pocket."]
        },
        // 3. Front Door (Exit back outside)
        {
          x: 155, y: 434, w: 45, h: 12,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('exterior', 310, 240, 'down'); }
        },
        // 4. Hallway Left: First-Floor Bathroom
        {
          x: 130, y: 250, w: 15, h: 45,
          text: ["* You don't have to use the bathroom right now."]
        },
        // 5. Hallway Right: Middle Closet Door
        {
          x: 215, y: 235, w: 15, h: 45,
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
        // 9. Kitchen South Wall: Sink (Rotated 180°, no window; interactive clean prompt!)
        {
          x: 350, y: 400, w: 36, h: 35,
          triggerSink: true
        },
        // 10. Kitchen South Wall: Dishwasher
        {
          x: 390, y: 395, w: 30, h: 45,
          text: ["* Never figured out how it worked."]
        },
        // 11. Kitchen South Wall: More Cabinets
        {
          x: 422, y: 395, w: 123, h: 45,
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
        // 14. Kitchen Right Wall: Rotated Oven with Warm Stove (Bottom)
        {
          x: 545, y: 315, w: 55, h: 70,
          text: [
            "* The oven is warm. A rich aroma of brown sugar and dates fills the kitchen."
          ]
        },
        // 15. Living Room: Punching Bag (Interactive punch choice)
        {
          x: 45, y: 65, w: 48, h: 70,
          triggerPunchingBag: true
        },
        // 16. Living Room: Screen Door (Sliding glass door)
        {
          x: 95, y: 45, w: 55, h: 30,
          text: ["* It's chilly outside."]
        },
        // 17. Living Room: Clear Red L-Couch in the middle
        {
          x: 135, y: 68, w: 76, h: 56,
          text: ["* The red sectional couch in the center of the room. Warm and inviting."]
        },
        // 18. Living Room: Coffee Table Inside the L
        {
          x: 165, y: 92, w: 40, h: 26,
          text: ["* Papers just strewn about."]
        },
        // 19. Living Room: TV Stand directly opposite couch (facing north)
        {
          x: 130, y: 148, w: 86, h: 24,
          text: ["* The TV is quiet. A cozy reflection fills the screen."]
        },
        // 20. Living Room: Bigger Plastic Folding Table against right wall
        {
          x: 280, y: 65, w: 36, h: 96,
          text: ["* A cute puzzle of ducklings and flowers."]
        }
      ],
      draw: (ctx) => {
        // Deep black void outside the townhouse
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 640, 480);

        // --- FLOOR BASE ---
        // Light blonde hardwood flooring across the living room and kitchen
        ctx.fillStyle = '#caa478';
        ctx.fillRect(40, 60, 560, 380);

        // --- WALL BETWEEN LIVING ROOM AND KITCHEN/FRIDGE (x: 325, y: 60..180) ---
        ctx.fillStyle = '#eae3d2';
        ctx.fillRect(325, 60, 8, 120);
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(324, 60, 2, 120); // West baseboard
        ctx.fillRect(332, 60, 2, 120); // East baseboard

        // --- CENTER INTERIOR DIVIDING WALL (Moved DOWN at par with bathroom box: y: 200..365) ---
        ctx.fillStyle = '#eae3d2';
        ctx.fillRect(215, 200, 105, 165);
        // Baseboard molding along outer edges
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(215, 361, 105, 4); // South baseboard
        ctx.fillRect(215, 200, 105, 4); // North baseboard
        ctx.fillRect(215, 200, 4, 165); // West baseboard (hallway)
        ctx.fillRect(316, 200, 4, 165); // East baseboard (kitchen)

        // --- BATHROOM ROOM BLOCK (Left of hallway: y: 200..365) ---
        ctx.fillStyle = '#eae3d2';
        ctx.fillRect(40, 200, 95, 165);
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(40, 361, 95, 4);  // South baseboard
        ctx.fillRect(131, 200, 4, 165); // East baseboard facing hallway
        // Bathroom Door facing hallway
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(130, 250, 8, 45);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(132, 272, 3, 3); // knob
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("BATH", 85, 275);

        // --- CLOSET DOOR ON RIGHT OF HALLWAY (on center wall) ---
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(215, 235, 8, 45);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(217, 257, 3, 3);
        ctx.fillStyle = '#333333';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("CLOSET", 228, 255);

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

        // --- ONLY A SMALL LINE OF BRICKS ON LEFT WALL ---
        const brick = window.spriteManager.env.brickWall;
        for (let by = 60; by < 190; by += 32) {
          ctx.drawImage(brick, 40, by, 20, 32);
        }

        // --- BOTTOM-LEFT CORNER: BIGGER COAT CLOSET ---
        ctx.fillStyle = '#d6cdbd';
        ctx.fillRect(40, 370, 110, 70); // Foyer tile landing
        ctx.strokeStyle = '#b8ad9b';
        ctx.strokeRect(40, 370, 110, 70);

        // Bigger Coat Closet on far left
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(40, 370, 55, 70);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(90, 405, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("COATS", 44, 405);

        // White Shoe Rack in the pocket to the left of the door
        ctx.drawImage(window.spriteManager.env.shoeRack, 116, 390, 24, 36);

        // --- FRONT DOOR (South Wall Entryway) ---
        ctx.fillStyle = '#1c0f0a';
        ctx.fillRect(156, 430, 46, 14);
        ctx.fillStyle = '#2c1a12';
        ctx.fillRect(158, 432, 42, 12);
        ctx.fillStyle = '#150c08';
        ctx.fillRect(160, 434, 38, 10);
        ctx.fillStyle = '#c5a059';
        ctx.fillRect(160, 433, 38, 2);
        // Coir Welcome Mat
        ctx.fillStyle = '#5c432d';
        ctx.fillRect(158, 416, 42, 16);
        ctx.strokeStyle = '#7c5c3f';
        ctx.lineWidth = 1;
        ctx.strokeRect(159, 417, 40, 14);

        // --- KITCHEN SOUTH WALL (STAIRS, PANTRY, CABINETS, SINK, DISHWASHER, MORE CABINETS) ---
        // 1. Staircase Landing & Stairs going up
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

        // 4. Sink (Rotated 180°, Window REMOVED!)
        ctx.drawImage(window.spriteManager.env.sink, 350, 405, 36, 28);

        // 5. Dishwasher
        ctx.drawImage(window.spriteManager.env.dishwasher, 390, 395, 28, 36);

        // 6. More Dark Wood Cabinets right of dishwasher
        ctx.fillStyle = '#4a2c1a';
        ctx.fillRect(422, 395, 123, 45);

        // --- KITCHEN EAST WALL (RIGHT WALL: FRIDGE, CABINET, ROTATED OVEN) ---
        // 1. Refrigerator (Top)
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(545, 195, 55, 60);
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(545, 225, 55, 2);
        ctx.fillStyle = '#888888';
        ctx.fillRect(548, 205, 3, 12);
        ctx.fillRect(548, 235, 3, 12);

        // 2. Kitchen Cabinet counter (Middle)
        ctx.fillStyle = '#4a2c1a';
        ctx.fillRect(545, 255, 55, 60);

        // 3. Oven Rotated 90 Degrees (Bottom)
        ctx.drawImage(window.spriteManager.env.stove, 545, 320, 55, 45);

        // --- LIVING ROOM (NORTH HALF OF HOUSE: x: 40..325) ---
        // Emerald LED ceiling perimeter strip
        ctx.drawImage(window.spriteManager.env.greenLed, 40, 58, 285, 6);
        ctx.fillStyle = 'rgba(0, 255, 68, 0.08)';
        ctx.fillRect(40, 60, 285, 40);

        // Screen Door
        ctx.drawImage(window.spriteManager.env.slidingDoor, 95, 45, 55, 35);

        // Bigger Freestanding Heavy Punching Bag Station in brick corner
        ctx.drawImage(window.spriteManager.env.punchBag, 45, 65, 48, 70);

        // Centered Clear L-Couch in middle of living room (x: 135, y: 68)
        ctx.drawImage(window.spriteManager.env.redCouch, 135, 68, 76, 56);

        // Coffee Table inside the L
        ctx.drawImage(window.spriteManager.env.coffeeTable, 165, 92, 40, 26);

        // TV Stand directly opposite couch with clear walking space between them
        ctx.fillStyle = '#3a2618';
        ctx.fillRect(130, 158, 86, 14); // wooden TV stand
        ctx.fillStyle = '#111111';
        ctx.fillRect(135, 146, 76, 18); // TV screen facing north
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(137, 148, 72, 14);
        ctx.fillStyle = '#444444';
        ctx.fillRect(170, 160, 6, 4);   // Pedestal

        // Bigger White Long Folding Table against right living room wall (where fridge leaves off)
        ctx.drawImage(window.spriteManager.env.puzzleTable, 280, 65, 36, 96);
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
        // Landing window collider (prevents walking onto window)
        { x: 235, y: 350, w: 140, h: 40 },
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
        // Right (opposite): Solid Wall (warm interior drywall with baseboard)
        ctx.fillStyle = '#eae3d2';
        ctx.fillRect(362, 175, 45, 56);
        ctx.fillStyle = '#3d281a';
        ctx.fillRect(362, 228, 45, 3);

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
