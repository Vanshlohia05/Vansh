import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  InstrumentType,
  SwarName,
  SWAR_FREQUENCIES,
  stopAllSargamSounds,
  ensureAudioContext,
} from '../utils/sargamSynth';
import { SARGAM_SONGS, SargamNoteItem } from '../data/sargamSongs';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

export interface SargamPanelProps {
  isOpen: boolean;
  instrument: InstrumentType;
  onInstrumentChange: (inst: InstrumentType) => void;
  targetNote: SwarName | null;
  onTargetNoteChange: (note: SwarName | null) => void;
  isPlayItYourself: boolean;
  onTogglePlayItYourself: () => void;
  advanceTrigger: number;
  onPlaySwar: (swar: SwarName) => void;
  onClose?: () => void;
}

export const SargamPanel: React.FC<SargamPanelProps> = ({
  isOpen,
  instrument,
  onInstrumentChange,
  targetNote,
  onTargetNoteChange,
  isPlayItYourself,
  onTogglePlayItYourself,
  advanceTrigger,
  onPlaySwar,
}) => {
  // Song picker state: exactly 2 songs (Happy Birthday, Twinkle Twinkle)
  const [selectedSongIndex, setSelectedSongIndex] = useState<number>(0);
  const currentSong = SARGAM_SONGS[selectedSongIndex];

  // Flattened notes for playback strip
  const allSongNotes: SargamNoteItem[] = React.useMemo(() => {
    return currentSong.lines.flatMap((line) => line.notes);
  }, [currentSong]);

  // Player state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSlowMode, setIsSlowMode] = useState<boolean>(false); // 55 bpm vs 90 bpm
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // References for timers & scrolling strip
  const playTimerRef = useRef<number | null>(null);
  const stripScrollRef = useRef<HTMLDivElement>(null);

  // Stop all sounds & timers on close or unmount
  useEffect(() => {
    if (!isOpen) {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
      setIsPlaying(false);
      stopAllSargamSounds();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
      stopAllSargamSounds();
    };
  }, []);

  // When switching song, reset playback
  useEffect(() => {
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    setIsPlaying(false);
    setCurrentNoteIndex(0);
    setShowCelebration(false);
  }, [selectedSongIndex]);

  // Sync targetNote to parent for highlighting books on the shelf
  useEffect(() => {
    if (isPlayItYourself && !showCelebration) {
      const neededNote = allSongNotes[currentNoteIndex]?.note || null;
      onTargetNoteChange(neededNote);
    } else {
      onTargetNoteChange(null);
    }
  }, [isPlayItYourself, currentNoteIndex, allSongNotes, showCelebration, onTargetNoteChange]);

  // Handle external practice advance from tapping books on the shelf or pressing PC keys
  useEffect(() => {
    if (advanceTrigger > 0 && isPlayItYourself && !showCelebration) {
      const nextIdx = currentNoteIndex + 1;
      if (nextIdx >= allSongNotes.length) {
        setShowCelebration(true);
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.7 },
          });
        } catch {
          // Ignore
        }
      } else {
        setCurrentNoteIndex(nextIdx);
        if (stripScrollRef.current) {
          const noteEl = stripScrollRef.current.children[nextIdx] as HTMLElement;
          if (noteEl) {
            noteEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }
    }
  }, [advanceTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-play step runner
  const playNextAutoNote = useCallback(
    (index: number) => {
      if (index >= allSongNotes.length) {
        setIsPlaying(false);
        setCurrentNoteIndex(0);
        return;
      }

      const noteItem = allSongNotes[index];
      setCurrentNoteIndex(index);

      // Scroll strip to current note
      if (stripScrollRef.current) {
        const noteEl = stripScrollRef.current.children[index] as HTMLElement;
        if (noteEl) {
          noteEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }

      const bpm = isSlowMode ? currentSong.slowBpm : currentSong.defaultBpm;
      const beatDurationSec = 60 / bpm;
      const notePlaySec = noteItem.durationBeats * beatDurationSec;

      // Sound the note and highlight matching books on the shelf
      onPlaySwar(noteItem.note);

      // Schedule next note
      playTimerRef.current = window.setTimeout(() => {
        playNextAutoNote(index + 1);
      }, notePlaySec * 1000);
    },
    [allSongNotes, currentSong.defaultBpm, currentSong.slowBpm, isSlowMode, onPlaySwar]
  );

  // Toggle Auto-play
  const togglePlay = () => {
    ensureAudioContext();
    if (isPlaying) {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
      setIsPlaying(false);
      stopAllSargamSounds();
    } else {
      setIsPlaying(true);
      setShowCelebration(false);
      if (isPlayItYourself) onTogglePlayItYourself();
      playNextAutoNote(currentNoteIndex >= allSongNotes.length ? 0 : currentNoteIndex);
    }
  };

  // Restart in Slow Mode (55 bpm)
  const handleRestartSlow = () => {
    ensureAudioContext();
    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
    stopAllSargamSounds();
    setIsSlowMode(true);
    setCurrentNoteIndex(0);
    setShowCelebration(false);

    if (isPlayItYourself) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playNextAutoNote(0);
    }
  };

  // Komal Ni button click handler
  const handleKomalNiClick = () => {
    ensureAudioContext();
    onPlaySwar('ni');

    // In practice mode, advance if komal-Ni is the required note
    if (isPlayItYourself && !showCelebration && targetNote === 'ni') {
      const nextIdx = currentNoteIndex + 1;
      if (nextIdx >= allSongNotes.length) {
        setShowCelebration(true);
        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.7 },
          });
        } catch {
          // Ignore
        }
      } else {
        setCurrentNoteIndex(nextIdx);
        if (stripScrollRef.current) {
          const noteEl = stripScrollRef.current.children[nextIdx] as HTMLElement;
          if (noteEl) {
            noteEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full mt-3 p-3.5 sm:p-4 bg-white border border-neutral-200 rounded-lg shadow-none transition-all select-none sargam-slide-enter">
      {/* ── Header: Small grey monospace text with no colored dot ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-3 border-b border-neutral-100">
        <div className="text-micro font-mono text-neutral-400 tracking-wide uppercase">
          Interactive Sargam Synth • Sa = C4 (261.6 Hz)
        </div>

        {/* ── Control Pills Row (Styled like site's small tags/pills) ── */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Flute / Piano Toggle */}
          <div className="inline-flex rounded border border-neutral-200 bg-white p-0.5 text-micro font-mono">
            <button
              onClick={() => {
                ensureAudioContext();
                onInstrumentChange('flute');
              }}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                instrument === 'flute'
                  ? 'bg-neutral-100 text-black font-semibold'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              🪈 Flute
            </button>
            <button
              onClick={() => {
                ensureAudioContext();
                onInstrumentChange('piano');
              }}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                instrument === 'piano'
                  ? 'bg-neutral-100 text-black font-semibold'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              🎹 Piano
            </button>
          </div>

          {/* Song Tabs */}
          <div className="inline-flex rounded border border-neutral-200 bg-white p-0.5 text-micro font-mono">
            {SARGAM_SONGS.map((song, sIdx) => (
              <button
                key={song.id}
                onClick={() => setSelectedSongIndex(sIdx)}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  selectedSongIndex === sIdx
                    ? 'bg-neutral-100 text-black font-semibold'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                {song.title}
              </button>
            ))}
          </div>

          {/* Auto-Play */}
          <button
            onClick={togglePlay}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-micro font-mono border transition-colors cursor-pointer ${
              isPlaying
                ? 'bg-neutral-100 text-black border-neutral-300 font-semibold'
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
            title={isPlaying ? 'Pause auto-play' : 'Auto-play song'}
          >
            {isPlaying ? <Pause size={10} /> : <Play size={10} />}
            <span>{isPlaying ? 'Pause' : 'Auto-Play'}</span>
          </button>

          {/* Restart (Slow) */}
          <button
            onClick={handleRestartSlow}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-micro font-mono bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 transition-colors cursor-pointer"
            title="Restart from beginning in slow mode (55 bpm)"
          >
            <RotateCcw size={10} />
            <span>Restart (Slow)</span>
          </button>

          {/* Speed Toggle: 55 bpm (Slow) vs 90 bpm (Normal) */}
          <button
            onClick={() => setIsSlowMode(!isSlowMode)}
            className={`px-2.5 py-1 rounded text-micro font-mono border transition-colors cursor-pointer ${
              isSlowMode
                ? 'bg-neutral-100 text-black border-neutral-300 font-semibold'
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
            title="Toggle tempo between 55 bpm and 90 bpm"
          >
            <span>{isSlowMode ? '55 bpm (Slow)' : '90 bpm (Normal)'}</span>
          </button>

          {/* Play it yourself */}
          <button
            onClick={() => {
              ensureAudioContext();
              if (isPlaying) {
                if (playTimerRef.current) clearTimeout(playTimerRef.current);
                setIsPlaying(false);
              }
              onTogglePlayItYourself();
              setCurrentNoteIndex(0);
              setShowCelebration(false);
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-micro font-mono border transition-colors cursor-pointer ${
              isPlayItYourself
                ? 'bg-[#d2fd78] text-black border-neutral-400 font-semibold shadow-xs'
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
            title="Interactive practice mode: tap highlighted books on shelf to advance"
          >
            <Sparkles size={10} />
            <span>{isPlayItYourself ? 'Practicing 🎯' : 'Play it yourself'}</span>
          </button>

          {/* Komal Ni button (Flat 7th for Happy Birthday) */}
          <button
            onClick={handleKomalNiClick}
            className={`px-2.5 py-1 rounded text-micro font-mono border transition-all cursor-pointer ${
              targetNote === 'ni'
                ? 'bg-[#d2fd78] text-black border-neutral-400 font-bold animate-pulse shadow-xs scale-105'
                : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200'
            }`}
            title="Play komal-Ni (flat 7th, 10 semitones above Sa) [K]"
          >
            <span>ni (komal) [K]</span>
          </button>
        </div>
      </div>

      {/* ── Celebratory Message when finished in Practice Mode ── */}
      {showCelebration && (
        <div className="mb-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between gap-3 text-neutral-800 font-mono text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentSong.celebrationEmoji}</span>
            <div>
              <span className="font-bold text-black">
                {currentSong.celebrationMessage}
              </span>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                You played the entire melody on the bookshelf!
              </p>
            </div>
          </div>
          <button
            onClick={handleRestartSlow}
            className="px-3 py-1 bg-white border border-neutral-200 text-black font-mono text-micro rounded hover:bg-neutral-100 transition-colors font-semibold cursor-pointer"
          >
            Play Again ↺
          </button>
        </div>
      )}

      {/* ── Sargam Notation Strip (Light Theme) ── */}
      <div
        ref={stripScrollRef}
        onClick={() => {
          if (!isPlayItYourself) togglePlay();
        }}
        title={isPlayItYourself ? 'Practice mode: tap the highlighted books on the shelf' : 'Tap strip to pause/resume playback'}
        className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 scroll-smooth no-scrollbar border border-neutral-200 rounded bg-neutral-50/50 cursor-pointer"
      >
        {allSongNotes.map((noteItem, idx) => {
          const isCurrent = idx === currentNoteIndex;
          const isPassed = idx < currentNoteIndex;

          return (
            <div
              key={noteItem.id}
              className={`flex flex-col items-center justify-center min-w-[42px] sm:min-w-[46px] py-1.5 px-1 rounded border transition-all shrink-0 ${
                isCurrent
                  ? 'bg-[#d2fd78] text-black border-neutral-400 font-bold scale-105 shadow-xs'
                  : isPassed
                  ? 'bg-neutral-50 text-neutral-400 border-neutral-200/60'
                  : 'bg-white text-neutral-700 border-neutral-200'
              }`}
            >
              {/* Note Symbol (Sa, Re, Ga, Ma, Pa, Dha, ni, Ni, Sa') */}
              <span className="text-xs sm:text-sm font-mono font-bold leading-none">
                {noteItem.note}
              </span>

              {/* Syllable in small text under note */}
              <span className="text-[10px] font-mono tracking-tight mt-1 truncate max-w-[40px] text-neutral-500">
                {noteItem.syllable}
              </span>

              {/* Held note indicator dot */}
              {noteItem.durationBeats > 1.0 && (
                <span className="w-1 h-1 rounded-full bg-neutral-400 mt-0.5" title="Held note" />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Subtitle helper ── */}
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-neutral-400">
        <span>
          {isPlayItYourself
            ? '🎯 Practice mode: tap highlighted books on shelf or use keyboard keys [S, R, G, M, P, D, N, Z, K]'
            : isPlaying
            ? '▶ Playing... Tap strip to pause'
            : '❚❚ Every book on shelf is a key • Tap any book to play'}
        </span>
      </div>
    </div>
  );
};
