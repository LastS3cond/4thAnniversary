/**
 * Undertale 4th Anniversary - Pure Web Audio API Sound & Music Synthesizer
 * Zero external audio dependencies; synthesizes retro chiptune BGM and SFX.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.currentTrack = null;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.bgmTempo = 120;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  ensureAudio() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects ---

  // Classic Undertale text blip
  playTextBlip() {
    this.ensureAudio();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Randomize pitch slightly (110Hz - 135Hz) for authentic retro voice feel
    const baseFreq = 120 + (Math.random() * 20 - 10);
    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, this.ctx.currentTime + 0.04);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Menu navigation cursor chirp
  playMenuMove() {
    this.ensureAudio();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(240, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.045);
  }

  // Menu item confirm chirp
  playMenuSelect() {
    this.ensureAudio();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.13);
  }

  // Menu back / cancel
  playMenuCancel() {
    this.ensureAudio();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.setValueAtTime(220, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Iconic Undertale Encounter sound (3 loud staccato pulses)
  playEncounter() {
    this.ensureAudio();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 0.11, 0.22].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t + offset);
      osc.frequency.exponentialRampToValueAtTime(110, t + offset + 0.08);

      gain.gain.setValueAtTime(0.5, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.095);
    });
  }

  // Attack swing slash sound
  playSlash() {
    this.ensureAudio();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Damage hit impact sound
  playHit() {
    this.ensureAudio();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  // Heal sparkle sound (for Sticky Toffee Pudding)
  playHeal() {
    this.ensureAudio();
    if (!this.ctx) return;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.3, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.26);
    });
  }

  // Save Star ding / sparkle
  playSaveDing() {
    this.ensureAudio();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 1.2);
  }

  // Door opening sound
  playDoor() {
    this.ensureAudio();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  // --- Background Music Engine ---

  playBgm(trackName) {
    if (this.currentTrack === trackName) return;
    this.stopBgm();
    this.ensureAudio();
    this.currentTrack = trackName;
    this.bgmStep = 0;

    if (trackName === 'snowy') {
      this.startSnowyBgm();
    } else if (trackName === 'home') {
      this.startHomeBgm();
    } else if (trackName === 'battle') {
      this.startBattleBgm();
    } else if (trackName === 'determination') {
      this.startDeterminationBgm();
    }
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.currentTrack = null;
  }

  // Note frequency utility
  noteToFreq(note) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = note.match(/([A-G]#?)([0-9])/);
    if (!match) return 0;
    const name = match[1];
    const oct = parseInt(match[2]);
    const semitone = notes.indexOf(name);
    return 440 * Math.pow(2, (oct * 12 + semitone - 57) / 12);
  }

  // Play a single procedural chiptune note
  playChiptuneNote(freq, type = 'square', duration = 0.2, volume = 0.2, filterFreq = 1200) {
    if (!this.ctx || freq <= 0) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration * 0.95);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // 1. Snowy Exterior Theme (Peaceful, gentle sine/triangle bells, walking in cold snow)
  startSnowyBgm() {
    const melody = [
      'G4', 'E4', 'D4', 'C4', 'D4', 'E4', 'G4', null,
      'A4', 'G4', 'E4', 'D4', 'C4', 'D4', 'E4', null,
      'F4', 'E4', 'D4', 'C4', 'D4', 'E4', 'D4', null,
      'G4', 'F4', 'E4', 'D4', 'C4', 'B3', 'C4', null
    ];
    const bass = [
      'C3', null, 'G3', null, 'C3', null, 'E3', null,
      'A2', null, 'E3', null, 'A2', null, 'C3', null,
      'F2', null, 'C3', null, 'F2', null, 'A2', null,
      'G2', null, 'D3', null, 'G2', null, 'B2', null
    ];

    const stepInterval = 280; // ms
    this.bgmTimer = setInterval(() => {
      const idx = this.bgmStep % melody.length;
      const mNote = melody[idx];
      const bNote = bass[idx];

      if (mNote) {
        this.playChiptuneNote(this.noteToFreq(mNote), 'triangle', 0.45, 0.22, 1400);
      }
      if (bNote) {
        this.playChiptuneNote(this.noteToFreq(bNote), 'sine', 0.5, 0.18, 400);
      }
      this.bgmStep++;
    }, stepInterval);
  }

  // 2. Home Theme (Warm, cozy loop, acoustic chiptune arpeggios, green LED vibe)
  startHomeBgm() {
    const melody = [
      'C4', 'E4', 'G4', 'C5', 'B4', 'G4', 'E4', 'D4',
      'C4', 'E4', 'A4', 'C5', 'B4', 'G4', 'E4', null,
      'F4', 'A4', 'C5', 'E5', 'D5', 'A4', 'F4', 'G4',
      'E4', 'G4', 'C5', 'D5', 'C5', null, null, null
    ];
    const bass = [
      'C3', null, 'G3', null, 'E3', null, 'G3', null,
      'A2', null, 'E3', null, 'C3', null, 'E3', null,
      'F2', null, 'C3', null, 'A2', null, 'C3', null,
      'G2', null, 'D3', null, 'C3', null, 'G2', null
    ];

    const stepInterval = 240; // ms
    this.bgmTimer = setInterval(() => {
      const idx = this.bgmStep % melody.length;
      const mNote = melody[idx];
      const bNote = bass[idx];

      if (mNote) {
        this.playChiptuneNote(this.noteToFreq(mNote), 'square', 0.35, 0.15, 1200);
      }
      if (bNote) {
        this.playChiptuneNote(this.noteToFreq(bNote), 'triangle', 0.4, 0.22, 500);
      }
      this.bgmStep++;
    }, stepInterval);
  }

  // 3. Battle Theme (Upbeat, bouncy, energetic Undertale battle rhythm!)
  startBattleBgm() {
    const lead = [
      'D4', 'D4', 'D5', 'A4', null, 'G#4', 'G4', 'F4',
      'D4', 'F4', 'G4', null, 'C4', 'C4', 'D4', null,
      'D4', 'D4', 'D5', 'A4', null, 'G#4', 'G4', 'F4',
      'D4', 'F4', 'G4', 'A4', 'C5', 'A4', 'D5', null
    ];
    const bass = [
      'D3', 'D3', 'D3', 'D3', 'C3', 'C3', 'B2', 'B2',
      'Bb2', 'Bb2', 'Bb2', 'Bb2', 'C3', 'C3', 'C#3', 'C#3',
      'D3', 'D3', 'D3', 'D3', 'C3', 'C3', 'B2', 'B2',
      'G2', 'G2', 'A2', 'A2', 'C3', 'C3', 'D3', 'D3'
    ];

    const stepInterval = 150; // ms (fast & energetic!)
    this.bgmTimer = setInterval(() => {
      const idx = this.bgmStep % lead.length;
      const lNote = lead[idx];
      const bNote = bass[idx];

      if (lNote) {
        this.playChiptuneNote(this.noteToFreq(lNote), 'square', 0.18, 0.22, 2200);
      }
      if (bNote) {
        this.playChiptuneNote(this.noteToFreq(bNote), 'sawtooth', 0.14, 0.18, 700);
      }
      // Add subtle retro hi-hat noise on even beats
      if (idx % 2 === 1) {
        this.playChiptuneNote(2000, 'triangle', 0.04, 0.08, 3000);
      }
      this.bgmStep++;
    }, stepInterval);
  }

  // 4. Determination Theme (Gentle, touching music box theme during the Save Star)
  startDeterminationBgm() {
    const melody = [
      'D4', 'F#4', 'A4', 'D5', 'C#5', 'A4', 'F#4', 'E4',
      'D4', 'F#4', 'B4', 'D5', 'C#5', 'A4', 'F#4', null,
      'G4', 'B4', 'D5', 'F#5', 'E5', 'B4', 'G4', 'A4',
      'F#4', 'A4', 'D5', 'E5', 'D5', null, null, null
    ];

    const stepInterval = 320; // slow, gentle, heartfelt
    this.bgmTimer = setInterval(() => {
      const idx = this.bgmStep % melody.length;
      const note = melody[idx];
      if (note) {
        // Pure music box sine chime with slight shimmer
        this.playChiptuneNote(this.noteToFreq(note), 'sine', 0.7, 0.28, 2500);
      }
      this.bgmStep++;
    }, stepInterval);
  }
}

window.audioManager = new AudioManager();
