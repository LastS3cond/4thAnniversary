/**
 * Battle: Jaydon, the anniversary "boss" behind the gold-trimmed door.
 *
 * He can't really be beaten: FIGHT only wears him down to 1 HP. A Hug makes him spareable,
 * and sparing him leads to the finale. (Engine and handler API: src/battle.js.)
 */
(() => {
  const punchedBag = () => window.game.flags.punchedBag;

  Encounters.define('jaydon', {
    player: { name: 'MALLIKA', hp: 20 },
    enemy: { name: 'JAYDON', speaker: 'Jaydon', hp: 20, minHp: 1, character: 'jaydon' },
    bgm: 'battle',
    idleText: "* (Why is he in pajama pants?)",

    setup(battle) {
      battle.vars.smokes = 0;
      battle.vars.flirts = 0;
    },

    acts: [
      {
        name: 'Check',
        run(battle) {
          battle.portrait = 'neutral';
          battle.narrate([
            "* JAYDON - ATK 1 DEF 999",
            "* Currently trying his best to give you the sweetest anniversary possible."
          ], () => {
            battle.reply("Do you like it so far?");
          });
        }
      },
      {
        name: 'Flirt',                    // rotating responses
        run(battle) {
          battle.vars.flirts++;
          battle.portrait = 'blush';
          const flirtResponses = [
            "Whoa...",
            "Focus, Focus, FOCUS",
            "That's not allowed",
            "HEY, what are you trying to do here?"
          ];
          const reactionText = flirtResponses[Math.min(battle.vars.flirts - 1, 3)];
          battle.narrate([
            "* You give Jaydon that familiar look.",
            "* Jaydon blushes bright red! His defense dropped to 0.",
            "* Jaydon looks back into his bedroom before refocusing on you."
          ], () => {
            battle.reply(reactionText);
          });
        }
      },
      {
        name: 'Smoke',                    // max 2 uses; hurts Mallika, never Jaydon
        run(battle) {
          if (battle.vars.smokes >= 2) {
            battle.narrate([
              "* (We are out of joints!)"
            ]);
            return;
          }
          battle.vars.smokes++;
          battle.portrait = 'cough';
          battle.player.hp = Math.max(1, battle.player.hp - 5);
          if (window.audioManager) window.audioManager.playHit();
          battle.narrate([
            "* You both share a joint.",
            "* *Cough cough*",
            "* (Deals 5 damage to Mallika! Defense lowered!)"
          ], () => {
            battle.reply("*cough cough* Do you want some water?");
          });
        }
      },
      {
        name: 'Hug',                      // the only way to make him spareable
        run(battle) {
          battle.portrait = 'neutral';
          battle.spareable = true;
          battle.narrate([
            "* You wrap your arms around Jaydon in a warm hug.",
            "* His embrace feels warm and steady.",
            "* Jaydon's name turns YELLOW on the Mercy menu!"
          ], () => {
            battle.reply("You give the best hugs in the world.");
          });
        }
      }
    ],

    items: [
      {
        name: 'Sticky Toffee Pudding',
        use(battle) {
          battle.player.hp = battle.player.maxHp;
          if (window.audioManager) window.audioManager.playHeal();
          battle.narrate([
            "* You shared the freshly baked Sticky Toffee Pudding! (HP Maxed)"
          ], () => {
            battle.portrait = 'neutral';
            battle.reply("Is it as good as the one you made?", () => {
              battle.narrate([
                "* You let him down easy."
              ]);
            });
          });
        }
      },
      {
        name: 'Dress',
        use(battle) {
          battle.portrait = 'blush';
          battle.narrate([
            "* You inspect the package...",
            "* It's a new pretty Dress! Mallika's style increased by 100!"
          ], () => {
            battle.reply("You're going to look absolutely stunning in it.");
          });
        }
      }
    ],

    fight: {
      // Timing-based damage (2-6, +1 from the punching bag workout). He bottoms out at 1 HP,
      // where every attack misses because he has "pretended enough".
      damage: (accuracy) => 2 + Math.round(accuracy * 4) + (punchedBag() ? 1 : 0),

      onHit(battle, dmg) {
        battle.portrait = 'surprised';
        const punchMsg = punchedBag()
          ? "* Jaydon gasps and dramatically pretends to take 1 extra damage from that punching bag workout!"
          : `* Jaydon gasps and dramatically pretends to take ${dmg} damage anyway.`;
        const reactionMsg = punchedBag()
          ? "Ugh... you are very strong... Those core muscles are really paying off."
          : "Ugh... you are very strong...";
        battle.narrate([
          "* You try to attack, but you can't bring yourself to do it.",
          punchMsg
        ], () => {
          // ...and down he goes
          battle.knockDown();
          battle.portrait = 'dazed';
          battle.narrate([
            "* Jaydon staggers back and falls to the ground."
          ], () => {
            battle.reply(reactionMsg);
          });
        });
      },

      onMiss(battle) {
        battle.portrait = 'neutral';
        battle.narrate([
          "* You try to attack, but you can't bring yourself to do it.",
          "* Jaydon has pretended enough."
        ], () => {
          battle.reply("Hey, take it easy!");
        });
      }
    },

    spare(battle) {
      if (battle.spareable) {
        battle.portrait = 'laugh';
        battle.narrate([
          "* You chose to SPARE Jaydon.",
          "* YOU WON! You earned 0 EXP and lots of LOVE.",
          "* But you gained something more precious."
        ], () => {
          battle.win();
        });
      } else {
        battle.narrate([
          "* Jaydon isn't ready to be spared yet.",
          "* Try giving him a hug first!"
        ]);
      }
    },

    onVictory: (game) => game.startFinale({
      lines: [
        "* (Knowing how much love, laughter, and adventures you share...)",
        "* (...it fills you with DETERMINATION.)",
        "* Happy Anniversary, Mallika. I love you."
      ],
      footer: "♥ Always & Forever ♥"
    })
  });
})();
