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

        // Recessed Dark Front Doorway
        ctx.fillStyle = '#0e0b0b';
        ctx.fillRect(296, 160, 44, 60);
        // Interior white door slightly visible inside (Photo 3)
        ctx.fillStyle = '#f0ebe1';
        ctx.fillRect(302, 164, 34, 56);
        ctx.fillStyle = '#3a3530';
        ctx.fillRect(304, 166, 14, 24);
        ctx.fillRect(304, 194, 14, 24);
        // Brass knob
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(305, 192, 3, 3);

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
      spawn: { x: 155, y: 375, dir: 'up' },
      colliders: [
        // Perimeter outer walls
        { x: 0, y: 0, w: 640, h: 60 },   // Top wall
        { x: 0, y: 440, w: 640, h: 40 }, // Bottom wall
        { x: 0, y: 0, w: 40, h: 480 },   // Left wall
        { x: 600, y: 0, w: 40, h: 480 }, // Right wall

        // PITCH BLACK VOID IN THE CENTER (where closet leads, no washer/dryer)
        { x: 215, y: 190, w: 245, h: 155 },

        // Bathroom Block on Left of Hallway
        { x: 40, y: 200, w: 95, h: 165 },

        // Bottom Wall (South Wall) Fixtures:
        // Bottom-left corner: coat closet & shoe rack
        { x: 40, y: 390, w: 35, h: 50 },  // Bottom-left coat closet
        { x: 75, y: 400, w: 45, h: 40 },  // Shoe rack
        // Kitchen South Wall: Pantry, Cabinets, Sink, Dishwasher, More Cabinets
        { x: 270, y: 395, w: 275, h: 45 },

        // Kitchen East Wall (Right Wall): Fridge, Cabinet, Stove/Microwave
        { x: 545, y: 195, w: 55, h: 195 },

        // Living Room Furniture:
        { x: 50, y: 65, w: 30, h: 45 },   // Punching bag on left brick line
        { x: 180, y: 55, w: 120, h: 30 }, // BIG TV stand opposite couch
        { x: 185, y: 120, w: 100, h: 55 }, // BIG Red L-Couch in the middle
        { x: 335, y: 55, w: 95, h: 35 }   // Plastic long folding table & bench
      ],
      interactables: [
        // 1. Bottom-Left Coat Closet
        {
          x: 40, y: 390, w: 35, h: 50,
          text: ["* Just some coats hanging."]
        },
        // 2. White Shoe Rack (Bottom-left corner)
        {
          x: 75, y: 400, w: 45, h: 40,
          text: ["* A familiar row of New Balances."]
        },
        // 3. Front Door (Exit back outside)
        {
          x: 140, y: 436, w: 35, h: 10,
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
          x: 215, y: 245, w: 15, h: 45,
          text: ["* A hallway storage closet. It's packed full."]
        },
        // 6. Stairs (Right of front door & hallway)
        {
          x: 215, y: 405, w: 50, h: 35,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('staircase', 120, 380, 'up'); },
          text: ["* You head up the carpeted stairs..."]
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
        // 9. Kitchen South Wall: Sink & Crooked Blinds
        {
          x: 350, y: 385, w: 45, h: 55,
          text: [
            "* There are dirty dishes.",
            "* (Clean them? -> There are too many.)",
            "* Above the sink, the blinds hang completely crooked."
          ]
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
        // 14. Kitchen Right Wall: Oven with Microwave on top (Bottom)
        {
          x: 545, y: 315, w: 55, h: 70,
          text: [
            "* The oven is warm. A rich aroma of brown sugar and dates fills the kitchen.",
            "* A microwave sits right on top."
          ]
        },
        // 15. Living Room: Punching Bag (Interactive punch choice)
        {
          x: 50, y: 65, w: 35, h: 45,
          triggerPunchingBag: true
        },
        // 16. Living Room: Screen Door (Sliding glass door)
        {
          x: 85, y: 45, w: 55, h: 25,
          text: ["* It's cold outside."]
        },
        // 17. Living Room: BIG TV Stand & TV directly opposite couch
        {
          x: 180, y: 55, w: 120, h: 35,
          text: ["* The TV is quiet. A cozy reflection fills the screen."]
        },
        // 18. Living Room: Plastic Long Folding Table & Bench (Duckling puzzle & cups)
        {
          x: 335, y: 55, w: 95, h: 40,
          text: ["* A cute puzzle of ducklings and flowers."]
        },
        // 19. Living Room: BIG Red L-Couch in the middle
        {
          x: 185, y: 120, w: 100, h: 55,
          text: ["* The red couch in the center of the room. Perfect for playing Switch (which is sitting right there)."]
        },
        // 20. Living Room: Coffee Table Inside the L
        {
          x: 215, y: 135, w: 45, h: 30,
          text: ["* Papers just strewn about."]
        }
      ],
      draw: (ctx) => {
        // --- FLOOR BASE ---
        // Light blonde hardwood flooring (Photo 4)
        ctx.fillStyle = '#caa478';
        ctx.fillRect(40, 60, 560, 380);

        // --- PITCH BLACK VOID IN THE MIDDLE (where closet leads, no washer/dryer) ---
        ctx.fillStyle = '#000000';
        ctx.fillRect(215, 190, 245, 155);

        // --- BATHROOM ROOM BLOCK (Left of hallway) ---
        ctx.fillStyle = '#1c1618';
        ctx.fillRect(40, 200, 95, 165);
        // Bathroom Door facing hallway
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(130, 245, 8, 45);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(132, 267, 3, 3); // knob
        ctx.fillStyle = '#ffffff';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("BATH", 85, 272);

        // --- CLOSET DOOR ON RIGHT OF HALLWAY (leads to middle void) ---
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(215, 245, 8, 45);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(217, 267, 3, 3);
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText("CLOSET", 228, 272);

        // --- HALLWAY FLOOR RUNNER ---
        ctx.fillStyle = '#b59068';
        ctx.fillRect(138, 190, 75, 230);

        // --- OUTER WALLS ---
        ctx.fillStyle = '#221a18';
        ctx.fillRect(0, 0, 640, 60);   // Top wall
        ctx.fillStyle = '#302422';
        ctx.fillRect(0, 440, 640, 40); // Bottom wall
        ctx.fillRect(0, 0, 40, 480);   // Left wall
        ctx.fillRect(600, 0, 40, 480); // Right wall

        // --- ONLY A SMALL LINE OF BRICKS ON LEFT WALL (Photo 4 & 5) ---
        // Removed bricks from everywhere else in the room!
        const brick = window.spriteManager.env.brickWall;
        for (let by = 60; by < 190; by += 32) {
          ctx.drawImage(brick, 40, by, 20, 32);
        }

        // --- BOTTOM-LEFT CORNER: CLOSET, SHOE RACK, FOYER LANDING ---
        // Coat Closet on far left
        ctx.fillStyle = '#3d2b20';
        ctx.fillRect(40, 390, 35, 50);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(70, 415, 3, 3);
        ctx.fillStyle = '#ffffff';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillText("COATS", 42, 405);

        // White Shoe Rack with New Balances
        ctx.drawImage(window.spriteManager.env.shoeRack, 75, 400, 45, 35);

        // Entry Foyer Tile Landing in front of shoe rack & closet
        ctx.fillStyle = '#d6cdbd';
        ctx.fillRect(40, 370, 95, 20);
        ctx.strokeStyle = '#b8ad9b';
        ctx.strokeRect(40, 370, 95, 20);

        // Front Door Entryway Mat
        ctx.fillStyle = '#111111';
        ctx.fillRect(140, 432, 35, 8);
        ctx.fillStyle = '#5c4a3b';
        ctx.fillRect(143, 420, 29, 12);

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
        ctx.drawImage(window.spriteManager.env.slidingDoor, 85, 45, 55, 35);

        // Heavy Punching Bag on the brick line
        ctx.drawImage(window.spriteManager.env.punchBag, 55, 65, 24, 48);

        // BIG TV Stand & TV directly opposite the couch
        ctx.fillStyle = '#3a2618';
        ctx.fillRect(180, 78, 120, 12); // wooden TV stand
        ctx.fillStyle = '#111111';
        ctx.fillRect(185, 48, 110, 34);  // big TV screen
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(188, 51, 104, 28);
        // Rainbow foil streamer next to TV (Photo 1)
        ctx.strokeStyle = '#c0d8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(305, 80);
        ctx.quadraticCurveTo(315, 55, 310, 38);
        ctx.stroke();

        // Plastic Long Folding Table and Bench against the wall
        ctx.drawImage(window.spriteManager.env.puzzleTable, 340, 50, 90, 42);
        // Bench in front of table
        ctx.fillStyle = '#dcdcdc';
        ctx.fillRect(345, 92, 80, 8);
        ctx.fillStyle = '#999999';
        ctx.fillRect(350, 100, 4, 4);
        ctx.fillRect(420, 100, 4, 4);

        // BIG Red L-Couch in the middle (Photo 3)
        ctx.drawImage(window.spriteManager.env.redCouch, 185, 120, 100, 60);

        // Coffee Table INSIDE THE L of the couch (Photo 1)
        ctx.drawImage(window.spriteManager.env.coffeeTable, 215, 135, 45, 28);
      }
    };

    // ----------------------------------------------------
    // ROOM 3: THE STAIRCASE & LANDING TRANSITION
    // Ascend 7 steps, turn 180 on landing with window, ascend 7 steps!
    // ----------------------------------------------------
    this.rooms['staircase'] = {
      name: 'staircase',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 120, y: 380, dir: 'up' },
      colliders: [
        // Walls around the staircase shaft with flight 2 opening (x: 450-560)
        { x: 0, y: 0, w: 450, h: 50 },
        { x: 560, y: 0, w: 80, h: 50 },
        { x: 0, y: 0, w: 70, h: 480 },
        { x: 570, y: 0, w: 70, h: 480 },
        { x: 0, y: 440, w: 640, h: 40 },
        // Central wall divider between flight 1 and flight 2
        { x: 280, y: 190, w: 80, h: 250 }
      ],
      interactables: [
        // Landing Window overlooking outside snow
        {
          x: 270, y: 50, w: 100, h: 70,
          text: [
            "* You pause at the intermediate landing.",
            "* Outside, snow falls peacefully through the dark winter night."
          ]
        },
        // Bottom stairs exit back to First Floor
        {
          x: 90, y: 420, w: 80, h: 30,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('first_floor', 235, 360, 'down'); }
        },
        // Top stairs exit into Second Floor Hallway
        {
          x: 460, y: 50, w: 100, h: 40,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('second_floor', 480, 380, 'up'); }
        }
      ],
      draw: (ctx) => {
        // Dark background wall
        ctx.fillStyle = '#1c1618';
        ctx.fillRect(0, 0, 640, 480);

        // Intermediate Landing Floor (Upper area)
        ctx.fillStyle = '#bfa588'; // Beige carpet
        ctx.fillRect(80, 100, 480, 90);

        // Landing Window framing the outside snow
        ctx.fillStyle = '#3a2820'; // Window frame
        ctx.fillRect(260, 50, 120, 65);
        ctx.fillStyle = '#0a101d'; // Sky
        ctx.fillRect(266, 56, 108, 53);

        // Snow falling outside window
        ctx.fillStyle = '#ffffff';
        const t = Date.now() * 0.001;
        for (let i = 0; i < 15; i++) {
          const wx = 268 + ((i * 17 + t * 10) % 100);
          const wy = 58 + ((i * 23 + t * 18) % 48);
          ctx.fillRect(wx, wy, 2, 2);
        }

        // Window mullions
        ctx.strokeStyle = '#3a2820';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(320, 56); ctx.lineTo(320, 109);
        ctx.moveTo(266, 82); ctx.lineTo(374, 82);
        ctx.stroke();

        // Central divider wall
        ctx.fillStyle = '#2a1e20';
        ctx.fillRect(280, 190, 80, 250);

        // --- FLIGHT 1: 7 STEPS ASCENDING (Left side, from bottom up to landing) ---
        ctx.fillStyle = '#c8b299';
        ctx.fillRect(90, 190, 170, 250);
        ctx.strokeStyle = '#9e8770';
        ctx.lineWidth = 3;
        for (let i = 1; i <= 7; i++) {
          const sy = 440 - i * 35;
          ctx.beginPath();
          ctx.moveTo(90, sy);
          ctx.lineTo(260, sy);
          ctx.stroke();
          // Step number indicator / carpet shading
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(90, sy, 170, 8);
        }

        // --- FLIGHT 2: 7 STEPS ASCENDING (Right side, from landing up to 2nd floor) ---
        ctx.fillStyle = '#c8b299';
        ctx.fillRect(380, 70, 170, 200);
        for (let i = 1; i <= 7; i++) {
          const sy = 250 - i * 25;
          ctx.beginPath();
          ctx.moveTo(380, sy);
          ctx.lineTo(550, sy);
          ctx.stroke();
          ctx.fillStyle = 'rgba(0,0,0,0.15)';
          ctx.fillRect(380, sy, 170, 6);
        }

        // Wooden Handrails
        ctx.strokeStyle = '#5a3825';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(85, 440); ctx.lineTo(85, 100);
        ctx.lineTo(275, 100);
        ctx.moveTo(365, 100); ctx.lineTo(555, 100);
        ctx.stroke();

        // Directional guides
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText("▲ 7 STEPS UP", 110, 380);
        ctx.fillText("TURN 180° ►", 270, 150);
        ctx.fillText("▲ 7 STEPS TO 2ND FLOOR", 370, 160);
      }
    };

    // ----------------------------------------------------
    // ROOM 4: SECOND FLOOR HALLWAY
    // Alex's Room, Kevin's Room, Suitcases, Bathroom, Jaydon's Room!
    // ----------------------------------------------------
    this.rooms['second_floor'] = {
      name: 'second_floor',
      bgm: 'home',
      width: 640,
      height: 480,
      spawn: { x: 480, y: 380, dir: 'up' },
      colliders: [
        // Hallway boundaries (Narrow carpeted corridor)
        { x: 0, y: 0, w: 640, h: 70 },
        { x: 0, y: 0, w: 220, h: 480 },  // Left rooms/walls
        { x: 420, y: 0, w: 220, h: 360 }, // Right rooms/walls (except stair opening)
        { x: 550, y: 360, w: 90, h: 120 },
        { x: 0, y: 440, w: 640, h: 40 }
      ],
      interactables: [
        // 1. Alex's Door (Far Left)
        {
          x: 200, y: 80, w: 40, h: 50,
          text: ["* You hear yelling and furious typing. Must be playing a game."]
        },
        // 2. Storage Closet (Left, middle)
        {
          x: 200, y: 180, w: 40, h: 50,
          text: ["* There are some suitcases in here."]
        },
        // 3. Second-Floor Bathroom (Left, near front)
        {
          x: 200, y: 280, w: 40, h: 50,
          text: ["* You don't have to use the bathroom right now."]
        },
        // 4. Kevin's Door (Right, near stairs)
        {
          x: 400, y: 280, w: 40, h: 50,
          text: ["* You hear him speaking very formally, must be interviewing."]
        },
        // 5. Stairs back down to Landing
        {
          x: 430, y: 415, w: 110, h: 30,
          isDoor: true,
          onEnter: () => { window.game.transitionToRoom('staircase', 480, 100, 'down'); }
        },
        // 6. JAYDON'S BEDROOM DOOR (Boss Encounter Trigger!)
        {
          x: 200, y: 20, w: 80, h: 60,
          triggerBoss: true
        }
      ],
      draw: (ctx) => {
        // Wall base
        ctx.fillStyle = '#231b20';
        ctx.fillRect(0, 0, 640, 480);

        // Hallway Carpet
        ctx.fillStyle = '#a68c76';
        ctx.fillRect(220, 60, 200, 390);

        // Carpet runner pattern
        ctx.fillStyle = '#8f745e';
        ctx.fillRect(240, 60, 160, 390);
        ctx.strokeStyle = '#c9b29b';
        ctx.lineWidth = 1;
        ctx.strokeRect(240, 60, 160, 390);

        // --- DOORS ---
        const drawDoor = (x, y, label, isKnobLeft = false) => {
          ctx.fillStyle = '#42281a';
          ctx.fillRect(x, y, 32, 50);
          ctx.fillStyle = '#2e1b12';
          ctx.fillRect(x + 2, y + 2, 28, 22);
          ctx.fillRect(x + 2, y + 26, 28, 22);
          // Brass knob
          ctx.fillStyle = '#ffd700';
          const knobX = isKnobLeft ? x + 4 : x + 25;
          ctx.fillRect(knobX, y + 26, 3, 4);
          // Label
          ctx.fillStyle = '#ffffff';
          ctx.font = '6px "Press Start 2P", monospace';
          ctx.fillText(label, x - 10, y - 5);
        };

        // Alex's Door (Left wall, far end)
        drawDoor(195, 80, "ALEX", false);

        // Storage Closet with suitcases (Left wall, middle)
        drawDoor(195, 180, "STORAGE", false);
        // Suitcases graphic inside nook
        ctx.fillStyle = '#1e3852';
        ctx.fillRect(170, 190, 18, 12);
        ctx.fillStyle = '#7a3128';
        ctx.fillRect(173, 204, 15, 14);

        // 2nd Floor Bathroom (Left wall, front)
        drawDoor(195, 280, "BATH", false);

        // Kevin's Door (Right wall, front)
        drawDoor(415, 280, "KEVIN", true);

        // JAYDON'S ROOM DOOR (Encounter Trigger - Left end of back wall)
        ctx.fillStyle = '#593220';
        ctx.fillRect(225, 20, 45, 50);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(260, 45, 4, 4);
        ctx.fillStyle = '#ffff55';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText("JAYDON'S ROOM", 210, 12);

        // Stairs opening at bottom right
        ctx.fillStyle = '#c7b299';
        ctx.fillRect(450, 410, 80, 40);
        for (let sy = 410; sy <= 450; sy += 7) {
          ctx.beginPath(); ctx.moveTo(450, sy); ctx.lineTo(530, sy); ctx.stroke();
        }
        ctx.fillStyle = '#ffffff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText("▼ STAIRS", 455, 400);

        // If Jaydon stepped out into the hallway before battle
        if (window.game && window.game.isJaydonInHallway) {
          ctx.drawImage(window.spriteManager.jaydonOverworld, 240, 75);
        }
      }
    };
  }

  getCurrentRoom() {
    return this.rooms[this.currentRoom];
  }
}

window.mapManager = new MapManager();
