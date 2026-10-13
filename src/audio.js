/**
 * Undertale 4th Anniversary - Pure Web Audio API Sound & Music Synthesizer
 * Zero external audio dependencies; synthesizes retro chiptune BGM and SFX.
 * The songs themselves are data in src/music.js.
 */

// Background music tracks: Music.define(key, { step, voices }) (format described in src/music.js)
const Music = {
  tracks: {},

  define(key, track) {
    Music.tracks[key] = track;
  }
};

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
    this.pendingTrack = null;
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
      this.ctx.resume().then(() => {
        if (this.pendingTrack) {
          const track = this.pendingTrack;
          this.pendingTrack = null;
          this.playBgm(track);
        }
      }).catch(() => {});
    } else if (this.ctx && this.ctx.state === 'running' && this.pendingTrack) {
      const track = this.pendingTrack;
      this.pendingTrack = null;
      this.playBgm(track);
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
    if (!this.ctx) this.init();
    if (!this.ctx || this.ctx.state === 'suspended') {
      this.pendingTrack = trackName;
      this.currentTrack = trackName;
      return;
    }
    if (this.currentTrack === trackName && this.bgmTimer) return;
    this.stopBgm();
    this.currentTrack = trackName;
    this.bgmStep = 0;

    const track = Music.tracks[trackName];
    if (track) this.startTrack(track);
  }

  // Step sequencer: every `step` ms, play each voice's note for the current step
  startTrack(track) {
    const length = track.voices[0].notes.length;
    this.bgmTimer = setInterval(() => {
      const idx = this.bgmStep % length;
      track.voices.forEach((voice) => {
        const note = voice.notes[idx];
        if (note) {
          const freq = typeof note === 'number' ? note : this.noteToFreq(note);
          this.playChiptuneNote(freq, voice.wave, voice.length, voice.volume, voice.filter);
        }
      });
      this.bgmStep++;
    }, track.step);
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
}

window.audioManager = new AudioManager();

// Global unlock on any user gesture
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    if (window.audioManager) {
      window.audioManager.ensureAudio();
    }
  };
  ['click', 'pointerdown', 'mousedown', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { passive: true });
  });
}
