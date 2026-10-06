import { SwarName } from '../utils/sargamSynth';

export interface SargamNoteItem {
  id: string;
  note: SwarName;
  syllable: string;
  durationBeats: number; // e.g. 0.5 = quick, 1.0 = normal, 2.0 = held
  lineIndex: number;
}

export interface SargamSong {
  id: string;
  title: string;
  celebrationEmoji: string;
  celebrationMessage: string;
  defaultBpm: number;
  slowBpm: number;
  lines: {
    lineText: string;
    notes: SargamNoteItem[];
  }[];
}

// Exactly two songs stored in one array so more can be added later.
export const SARGAM_SONGS: SargamSong[] = [
  {
    id: 'happy-birthday',
    title: 'Happy Birthday',
    celebrationEmoji: '🎂',
    celebrationMessage: 'Happy Birthday 🎂',
    defaultBpm: 90,
    slowBpm: 55,
    lines: [
      {
        lineText: 'Hap-py birth-day to you',
        notes: [
          { id: 'hb-1-1', note: 'Sa', syllable: 'Hap-', durationBeats: 0.5, lineIndex: 0 },
          { id: 'hb-1-2', note: 'Sa', syllable: 'py', durationBeats: 0.5, lineIndex: 0 },
          { id: 'hb-1-3', note: 'Re', syllable: 'birth-', durationBeats: 1.0, lineIndex: 0 },
          { id: 'hb-1-4', note: 'Sa', syllable: 'day', durationBeats: 1.0, lineIndex: 0 },
          { id: 'hb-1-5', note: 'Ma', syllable: 'to', durationBeats: 1.0, lineIndex: 0 },
          { id: 'hb-1-6', note: 'Ga', syllable: 'you', durationBeats: 2.0, lineIndex: 0 }, // held longer
        ],
      },
      {
        lineText: 'Hap-py birth-day to you',
        notes: [
          { id: 'hb-2-1', note: 'Sa', syllable: 'Hap-', durationBeats: 0.5, lineIndex: 1 },
          { id: 'hb-2-2', note: 'Sa', syllable: 'py', durationBeats: 0.5, lineIndex: 1 },
          { id: 'hb-2-3', note: 'Re', syllable: 'birth-', durationBeats: 1.0, lineIndex: 1 },
          { id: 'hb-2-4', note: 'Sa', syllable: 'day', durationBeats: 1.0, lineIndex: 1 },
          { id: 'hb-2-5', note: 'Pa', syllable: 'to', durationBeats: 1.0, lineIndex: 1 },
          { id: 'hb-2-6', note: 'Ma', syllable: 'you', durationBeats: 2.0, lineIndex: 1 }, // held longer
        ],
      },
      {
        lineText: 'Hap-py birth-day dear friend',
        notes: [
          { id: 'hb-3-1', note: 'Sa', syllable: 'Hap-', durationBeats: 0.5, lineIndex: 2 },
          { id: 'hb-3-2', note: 'Sa', syllable: 'py', durationBeats: 0.5, lineIndex: 2 },
          { id: 'hb-3-3', note: "Sa'", syllable: 'birth-', durationBeats: 1.0, lineIndex: 2 },
          { id: 'hb-3-4', note: 'Dha', syllable: 'day', durationBeats: 1.0, lineIndex: 2 },
          { id: 'hb-3-5', note: 'Ma', syllable: 'dear', durationBeats: 1.0, lineIndex: 2 },
          { id: 'hb-3-6', note: 'Ga', syllable: 'friend', durationBeats: 1.0, lineIndex: 2 },
          { id: 'hb-3-7', note: 'Re', syllable: '✨', durationBeats: 2.0, lineIndex: 2 },
        ],
      },
      {
        lineText: 'Hap-py birth-day to you',
        notes: [
          { id: 'hb-4-1', note: 'ni', syllable: 'Hap-', durationBeats: 0.5, lineIndex: 3 }, // komal-Ni
          { id: 'hb-4-2', note: 'ni', syllable: 'py', durationBeats: 0.5, lineIndex: 3 },  // komal-Ni
          { id: 'hb-4-3', note: 'Dha', syllable: 'birth-', durationBeats: 1.0, lineIndex: 3 },
          { id: 'hb-4-4', note: 'Ma', syllable: 'day', durationBeats: 1.0, lineIndex: 3 },
          { id: 'hb-4-5', note: 'Pa', syllable: 'to', durationBeats: 1.0, lineIndex: 3 },
          { id: 'hb-4-6', note: 'Ma', syllable: 'you', durationBeats: 2.0, lineIndex: 3 }, // held longer
        ],
      },
    ],
  },
  {
    id: 'twinkle-twinkle',
    title: 'Twinkle Twinkle Little Star',
    celebrationEmoji: '⭐',
    celebrationMessage: 'Twinkle Twinkle! Well Done ⭐',
    defaultBpm: 90,
    slowBpm: 55,
    lines: [
      {
        lineText: 'Twin-kle twin-kle lit-tle star',
        notes: [
          { id: 'tt-1-1', note: 'Sa', syllable: 'Twin-', durationBeats: 1.0, lineIndex: 0 },
          { id: 'tt-1-2', note: 'Sa', syllable: 'kle', durationBeats: 1.0, lineIndex: 0 },
          { id: 'tt-1-3', note: 'Pa', syllable: 'twin-', durationBeats: 1.0, lineIndex: 0 },
          { id: 'tt-1-4', note: 'Pa', syllable: 'kle', durationBeats: 1.0, lineIndex: 0 },
          { id: 'tt-1-5', note: 'Dha', syllable: 'lit-', durationBeats: 1.0, lineIndex: 0 },
          { id: 'tt-1-6', note: 'Dha', syllable: 'tle', durationBeats: 1.0, lineIndex: 0 },
          { id: 'tt-1-7', note: 'Pa', syllable: 'star', durationBeats: 2.0, lineIndex: 0 }, // held twice as long
        ],
      },
      {
        lineText: 'How I won-der what you are',
        notes: [
          { id: 'tt-2-1', note: 'Ma', syllable: 'How', durationBeats: 1.0, lineIndex: 1 },
          { id: 'tt-2-2', note: 'Ma', syllable: 'I', durationBeats: 1.0, lineIndex: 1 },
          { id: 'tt-2-3', note: 'Ga', syllable: 'won-', durationBeats: 1.0, lineIndex: 1 },
          { id: 'tt-2-4', note: 'Ga', syllable: 'der', durationBeats: 1.0, lineIndex: 1 },
          { id: 'tt-2-5', note: 'Re', syllable: 'what', durationBeats: 1.0, lineIndex: 1 },
          { id: 'tt-2-6', note: 'Re', syllable: 'you', durationBeats: 1.0, lineIndex: 1 },
          { id: 'tt-2-7', note: 'Sa', syllable: 'are', durationBeats: 2.0, lineIndex: 1 }, // held
        ],
      },
      {
        lineText: 'Up a-bove the world so high',
        notes: [
          { id: 'tt-3-1', note: 'Pa', syllable: 'Up', durationBeats: 1.0, lineIndex: 2 },
          { id: 'tt-3-2', note: 'Pa', syllable: 'a-', durationBeats: 1.0, lineIndex: 2 },
          { id: 'tt-3-3', note: 'Ma', syllable: 'bove', durationBeats: 1.0, lineIndex: 2 },
          { id: 'tt-3-4', note: 'Ma', syllable: 'the', durationBeats: 1.0, lineIndex: 2 },
          { id: 'tt-3-5', note: 'Ga', syllable: 'world', durationBeats: 1.0, lineIndex: 2 },
          { id: 'tt-3-6', note: 'Ga', syllable: 'so', durationBeats: 1.0, lineIndex: 2 },
          { id: 'tt-3-7', note: 'Re', syllable: 'high', durationBeats: 2.0, lineIndex: 2 }, // held
        ],
      },
      {
        lineText: 'Like a dia-mond in the sky',
        notes: [
          { id: 'tt-4-1', note: 'Pa', syllable: 'Like', durationBeats: 1.0, lineIndex: 3 },
          { id: 'tt-4-2', note: 'Pa', syllable: 'a', durationBeats: 1.0, lineIndex: 3 },
          { id: 'tt-4-3', note: 'Ma', syllable: 'dia-', durationBeats: 1.0, lineIndex: 3 },
          { id: 'tt-4-4', note: 'Ma', syllable: 'mond', durationBeats: 1.0, lineIndex: 3 },
          { id: 'tt-4-5', note: 'Ga', syllable: 'in', durationBeats: 1.0, lineIndex: 3 },
          { id: 'tt-4-6', note: 'Ga', syllable: 'the', durationBeats: 1.0, lineIndex: 3 },
          { id: 'tt-4-7', note: 'Re', syllable: 'sky', durationBeats: 2.0, lineIndex: 3 }, // held
        ],
      },
      {
        lineText: 'Twin-kle twin-kle lit-tle star',
        notes: [
          { id: 'tt-5-1', note: 'Sa', syllable: 'Twin-', durationBeats: 1.0, lineIndex: 4 },
          { id: 'tt-5-2', note: 'Sa', syllable: 'kle', durationBeats: 1.0, lineIndex: 4 },
          { id: 'tt-5-3', note: 'Pa', syllable: 'twin-', durationBeats: 1.0, lineIndex: 4 },
          { id: 'tt-5-4', note: 'Pa', syllable: 'kle', durationBeats: 1.0, lineIndex: 4 },
          { id: 'tt-5-5', note: 'Dha', syllable: 'lit-', durationBeats: 1.0, lineIndex: 4 },
          { id: 'tt-5-6', note: 'Dha', syllable: 'tle', durationBeats: 1.0, lineIndex: 4 },
          { id: 'tt-5-7', note: 'Pa', syllable: 'star', durationBeats: 2.0, lineIndex: 4 }, // held
        ],
      },
      {
        lineText: 'How I won-der what you are',
        notes: [
          { id: 'tt-6-1', note: 'Ma', syllable: 'How', durationBeats: 1.0, lineIndex: 5 },
          { id: 'tt-6-2', note: 'Ma', syllable: 'I', durationBeats: 1.0, lineIndex: 5 },
          { id: 'tt-6-3', note: 'Ga', syllable: 'won-', durationBeats: 1.0, lineIndex: 5 },
          { id: 'tt-6-4', note: 'Ga', syllable: 'der', durationBeats: 1.0, lineIndex: 5 },
          { id: 'tt-6-5', note: 'Re', syllable: 'what', durationBeats: 1.0, lineIndex: 5 },
          { id: 'tt-6-6', note: 'Re', syllable: 'you', durationBeats: 1.0, lineIndex: 5 },
          { id: 'tt-6-7', note: 'Sa', syllable: 'are', durationBeats: 2.0, lineIndex: 5 }, // held
        ],
      },
    ],
  },
];
