/**
 * Music: this game's songs (see Music in src/audio.js). Each track loops forever:
 *   step:   ms per step
 *   voices: played in order on every step. `notes` holds note names ('C4', 'F#3'), raw
 *           frequencies in Hz, or null for a rest; wave / length (s) / volume / filter
 *           (low-pass Hz) shape the sound. Note names the parser doesn't understand (flats
 *           like 'Bb2') stay silent, so write sharps ('A#2').
 * Rooms and encounters pick a track by key (`bgm`).
 */

// 1. Exterior theme (peaceful, gentle triangle bells). The key is left over from the winter version.
Music.define('snowy', {
  step: 280,
  voices: [
    {
      wave: 'triangle', length: 0.45, volume: 0.22, filter: 1400,
      notes: [
        'G4', 'E4', 'D4', 'C4', 'D4', 'E4', 'G4', null,
        'A4', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4', null,
        'F4', 'E4', 'D4', 'C4', 'D4', 'E4', 'D4', null,
        'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'C4', null
      ]
    },
    {
      wave: 'sine', length: 0.5, volume: 0.18, filter: 400,
      notes: [
        'C3', null, 'G3', null, 'C3', null, 'E3', null,
        'A2', null, 'E3', null, 'A2', null, 'C3', null,
        'F2', null, 'C3', null, 'F2', null, 'A2', null,
        'G2', null, 'D3', null, 'G2', null, 'B2', null
      ]
    }
  ]
});

// 2. Home theme (warm, cozy loop, chiptune arpeggios)
Music.define('home', {
  step: 240,
  voices: [
    {
      wave: 'square', length: 0.35, volume: 0.15, filter: 1200,
      notes: [
        'C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'D4',
        'C4', 'E4', 'A4', 'C5', 'B4', 'G4', 'E4', null,
        'F4', 'A4', 'C5', 'E5', 'D5', 'A4', 'F4', 'G4',
        'E4', 'G4', 'C5', 'D5', 'C5', null, null, null
      ]
    },
    {
      wave: 'triangle', length: 0.4, volume: 0.22, filter: 500,
      notes: [
        'C3', null, 'G3', null, 'E3', null, 'G3', null,
        'A2', null, 'E3', null, 'C3', null, 'E3', null,
        'F2', null, 'C3', null, 'A2', null, 'C3', null,
        'G2', null, 'D3', null, 'C3', null, 'G2', null
      ]
    }
  ]
});

// 3. Battle theme (upbeat, bouncy, fast)
Music.define('battle', {
  step: 150,
  voices: [
    {
      wave: 'square', length: 0.18, volume: 0.22, filter: 2200,
      notes: [
        'D4', 'D4', 'D5', 'A4', null, 'G#4', 'G4', 'F4',
        'D4', 'F4', 'G4', null, 'C4', 'C4', 'D4', null,
        'D4', 'D4', 'D5', 'A4', null, 'G#4', 'G4', 'F4',
        'D4', 'F4', 'G4', 'A4', 'C5', 'A4', 'D5', null
      ]
    },
    {
      wave: 'sawtooth', length: 0.14, volume: 0.18, filter: 700,
      notes: [
        'D3', 'D3', 'D3', 'D3', 'C3', 'C3', 'B2', 'B2',
        'Bb2', 'Bb2', 'Bb2', 'Bb2', 'C3', 'C3', 'C#3', 'C#3',
        'D3', 'D3', 'D3', 'D3', 'C3', 'C3', 'B2', 'B2',
        'G2', 'G2', 'A2', 'A2', 'C3', 'C3', 'D3', 'D3'
      ]
    },
    {
      // subtle retro hi-hat on every other step
      wave: 'triangle', length: 0.04, volume: 0.08, filter: 3000,
      notes: Array.from({ length: 32 }, (_, i) => (i % 2 === 1 ? 2000 : null))
    }
  ]
});

// 4. Determination theme (gentle music box during the Save Star finale)
Music.define('determination', {
  step: 320,
  voices: [
    {
      wave: 'sine', length: 0.7, volume: 0.28, filter: 2500,
      notes: [
        'D4', 'F#4', 'A4', 'D5', 'C#5', 'A4', 'F#4', 'E4',
        'D4', 'F#4', 'B4', 'D5', 'C#5', 'A4', 'F#4', null,
        'G4', 'B4', 'D5', 'F#5', 'E5', 'B4', 'G4', 'A4',
        'F#4', 'A4', 'D5', 'E5', 'D5', null, null, null
      ]
    }
  ]
});
