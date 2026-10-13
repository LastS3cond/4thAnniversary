/**
 * Undertale 4th Anniversary - Story setup
 *
 * Where the game starts, who you play, and what the C-menu shows. Everything else this game is
 * made of lives in the content folders: src/characters/, src/props/, src/rooms/,
 * src/encounters/ and src/music.js.
 */
const Story = {
  startRoom: 'exterior',
  player: 'mallika',

  // C-menu entries (ITEM / STAT / CELL): pages(game) returns the dialogue each one shows
  menu: [
    {
      label: 'ITEM',
      pages: () => [
        "* ITEM:\n* Sticky Toffee Pudding\n* Pretty Dress",
        "* Sticky Toffee Pudding:\n* Warm & baked with love.",
        "* Pretty Dress:\n* A lovely Dress waiting to\n  be worn on a date!"
      ]
    },
    {
      label: 'STAT',
      pages: (game) => {
        const atkDesc = game.flags.punchedBag ? "* ATK 11 (Bag bonus +1)" : "* ATK 10";
        return [
          "* MALLIKA   LV 1",
          `* HP 20 / 20\n${atkDesc}\n* DEF 10`,
          "* WEAPON: Strong core muscles\n* ARMOR: Denim overalls",
          "* LOVE: lots"
        ];
      }
    },
    {
      label: 'CELL',
      pages: () => [
        "* You dialed Jaydon's cell...\n* (ring... ring...)",
        "* A muffled ringtone plays\n  from his bedroom upstairs!"
      ]
    }
  ]
};
