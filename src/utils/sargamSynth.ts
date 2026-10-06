// Sargam Sound Synthesizer using Web Audio API
// 100% Free from audio files, recordings, and external audio assets.
// Root note Sa = C4 (261.63 Hz), perfectly in tune with Raag Bhoopali flute synth.

export type InstrumentType = 'flute' | 'piano';

export type SwarName = 'Sa' | 'Re' | 'Ga' | 'Ma' | 'Pa' | 'Dha' | 'ni' | 'Ni' | "Sa'";

// Accurate 12-TET frequencies with Sa = C4 (261.63 Hz)
export const SWAR_FREQUENCIES: Record<SwarName, number> = {
  Sa: 261.63,  // C4 (0 semitones)
  Re: 293.66,  // D4 (+2 semitones)
  Ga: 329.63,  // E4 (+4 semitones)
  Ma: 349.23,  // F4 (+5 semitones)
  Pa: 392.00,  // G4 (+7 semitones)
  Dha: 440.00, // A4 (+9 semitones)
  ni: 466.16,  // Bb4 / A#4 (+10 semitones) - Komal Ni (flat 7th)
  Ni: 493.88,  // B4 (+11 semitones) - Shuddha Ni
  "Sa'": 523.25, // C5 (+12 semitones) - Upper Sa (Taar Saptak)
};

// 8 repeating notes cycle for shelf book keys
export const SWAR_CYCLE: SwarName[] = ['Sa', 'Re', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni', "Sa'"];
export const PC_KEY_CYCLE = ['S', 'R', 'G', 'M', 'P', 'D', 'N', 'Z'];

// Polyphony management to prevent crackling or CPU exhaustion
interface ActiveVoice {
  id: number;
  stop: (fadeMs?: number) => void;
  startTime: number;
}

let audioCtx: AudioContext | null = null;
let activeVoices: ActiveVoice[] = [];
let nextVoiceId = 1;
const MAX_CONCURRENT_VOICES = 6;

/**
 * Ensures AudioContext is created and resumed on user interaction.
 * Vital for iPhone Safari and mobile browsers that block auto-play.
 */
export const ensureAudioContext = async (): Promise<AudioContext | null> => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // Play 1-sample silent buffer to unlock iOS Safari WebKit audio pipeline
    if (audioCtx.state === 'running') {
      const buffer = audioCtx.createBuffer(1, 1, audioCtx.sampleRate);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    }

    return audioCtx;
  } catch {
    return null;
  }
};

/**
 * Stop oldest active voice if maximum polyphony is reached
 */
const pruneActiveVoices = () => {
  while (activeVoices.length >= MAX_CONCURRENT_VOICES) {
    const oldest = activeVoices.shift();
    if (oldest) {
      try {
        oldest.stop(15);
      } catch {
        // Voice might already be ended
      }
    }
  }
};

/**
 * Plays a single note with given duration (or held sustained until stopped)
 * @param freq Frequency in Hz
 * @param instrument 'flute' or 'piano'
 * @param duration Duration in seconds. If 0 or negative, sustains until returned stop function is called.
 * @param volume Soft volume level (default ~0.08)
 */
export const playSwarNote = (
  freq: number,
  instrument: InstrumentType = 'flute',
  duration: number = 0.5,
  volume: number = 0.08
): (() => void) => {
  ensureAudioContext();
  if (!audioCtx) return () => {};

  pruneActiveVoices();

  const ctx = audioCtx;
  const now = ctx.currentTime;
  const voiceId = nextVoiceId++;

  const masterGain = ctx.createGain();
  const safeVol = Math.max(0.01, Math.min(0.18, volume));

  let stopped = false;
  let voiceStopFn: (fadeMs?: number) => void = () => {};

  if (instrument === 'flute') {
    // ══════════════════════════════════════════════════════════
    // FLUTE SYNTHESIZER:
    // Sine + Triangle blend, soft attack, light vibrato, a little breath
    // ══════════════════════════════════════════════════════════
    const osc1 = ctx.createOscillator(); // Sine fundamental
    const osc2 = ctx.createOscillator(); // Triangle harmonic
    const vibratoLfo = ctx.createOscillator(); // Vibrato LFO
    const vibratoGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 1.5, now); // Fifth harmonic warmth

    // Vibrato setup: 5 Hz subtle pitch modulation (+/- 1.8 Hz)
    vibratoLfo.frequency.setValueAtTime(5.2, now);
    vibratoGain.gain.setValueAtTime(0, now);
    vibratoGain.gain.linearRampToValueAtTime(1.8, now + 0.12);
    vibratoLfo.connect(vibratoGain);
    vibratoGain.connect(osc1.frequency);
    vibratoGain.connect(osc2.frequency);

    // Filter to keep acoustic smoothness
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.value = 1.0;

    // Breath noise simulation (very subtle airy breath)
    let noiseSource: AudioBufferSourceNode | null = null;
    let noiseFilter: BiquadFilterNode | null = null;
    let noiseGain: GainNode | null = null;
    try {
      const bufferLen = Math.floor(ctx.sampleRate * 0.3);
      const noiseBuffer = ctx.createBuffer(1, bufferLen, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferLen * 0.6));
      }
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2200, now);
      noiseFilter.Q.value = 2.0;
      noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.007, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start(now);
    } catch {
      // Breath noise is secondary, proceed gracefully
    }

    // Connect oscillators
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Attack Envelope: soft attack
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(safeVol, now + 0.045);

    if (duration > 0) {
      // Timed note
      masterGain.gain.setValueAtTime(safeVol, now + Math.max(0.05, duration - 0.12));
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc1.start(now);
      osc2.start(now);
      vibratoLfo.start(now);

      const stopTime = now + duration + 0.05;
      osc1.stop(stopTime);
      osc2.stop(stopTime);
      vibratoLfo.stop(stopTime);
    } else {
      // Sustained note until released (long press)
      osc1.start(now);
      osc2.start(now);
      vibratoLfo.start(now);
    }

    voiceStopFn = (fadeMs: number = 80) => {
      if (stopped) return;
      stopped = true;
      const stopNow = ctx.currentTime;
      const fadeSec = fadeMs / 1000;
      try {
        masterGain.gain.cancelScheduledValues(stopNow);
        masterGain.gain.setValueAtTime(masterGain.gain.value, stopNow);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, stopNow + fadeSec);
        osc1.stop(stopNow + fadeSec + 0.02);
        osc2.stop(stopNow + fadeSec + 0.02);
        vibratoLfo.stop(stopNow + fadeSec + 0.02);
        if (noiseSource) noiseSource.stop(stopNow + fadeSec);
      } catch {
        // Ignore if already stopped
      }
    };
  } else {
    // ══════════════════════════════════════════════════════════
    // PIANO SYNTHESIZER:
    // Instant attack, quick decay, soft low-pass filter
    // ══════════════════════════════════════════════════════════
    const osc1 = ctx.createOscillator(); // Triangle body
    const osc2 = ctx.createOscillator(); // Sine fundamental
    const filter = ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now); // Second harmonic chime

    // Low-pass filter starts bright and warms up quickly
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.22);
    filter.Q.value = 1.0;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // Piano Envelope: Instant attack (< 3ms), quick decay
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(safeVol * 1.1, now + 0.003);

    const actualDuration = duration > 0 ? duration : 1.2;
    // Quick initial decay into ringing tail
    masterGain.gain.exponentialRampToValueAtTime(safeVol * 0.35, now + 0.15);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + actualDuration);

    osc1.start(now);
    osc2.start(now);
    const stopTime = now + actualDuration + 0.04;
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    voiceStopFn = (fadeMs: number = 60) => {
      if (stopped) return;
      stopped = true;
      const stopNow = ctx.currentTime;
      const fadeSec = fadeMs / 1000;
      try {
        masterGain.gain.cancelScheduledValues(stopNow);
        masterGain.gain.setValueAtTime(masterGain.gain.value, stopNow);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, stopNow + fadeSec);
        osc1.stop(stopNow + fadeSec + 0.02);
        osc2.stop(stopNow + fadeSec + 0.02);
      } catch {
        // Ignore if already stopped
      }
    };
  }

  const voiceRecord: ActiveVoice = {
    id: voiceId,
    stop: voiceStopFn,
    startTime: now,
  };
  activeVoices.push(voiceRecord);

  // Auto clean up from activeVoices array once finished
  const autoCleanMs = duration > 0 ? (duration + 0.1) * 1000 : 3000;
  setTimeout(() => {
    activeVoices = activeVoices.filter((v) => v.id !== voiceId);
  }, autoCleanMs);

  return () => {
    voiceStopFn();
    activeVoices = activeVoices.filter((v) => v.id !== voiceId);
  };
};

/**
 * Stop all active sargam sounds and release voices immediately
 */
export const stopAllSargamSounds = () => {
  activeVoices.forEach((v) => {
    try {
      v.stop(10);
    } catch {
      // Ignore
    }
  });
  activeVoices = [];
};

/**
 * Soft closing note when reaching the end of the bookshelf
 */
export const playSoftClosingNote = () => {
  ensureAudioContext();
  if (!audioCtx) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(SWAR_FREQUENCIES.Sa, now); // Warm Sa root note

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.9);
};
