import { useState, useEffect, useRef, useCallback } from 'react';
import { getDelayMultiplier } from '../utils/orp';
import type { AnnotatedSection } from '../utils/parser';

export interface ReaderSettings {
  wpm: number;
  chunkSize: number;
  orpEnabled: boolean;
  fontFamily: string;
  fontSize: number;
  theme: 'light' | 'dark';
  showPreview: boolean;
  metronomeEnabled: boolean;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  wpm: 300,
  chunkSize: 1,
  orpEnabled: true,
  fontFamily: 'font-sans',
  fontSize: 3.5, // rem
  theme: 'dark',
  showPreview: true,
  metronomeEnabled: false,
};

export function useSpeedReader() {
  const [words, setWords] = useState<string[]>([]);
  const [sections, setSections] = useState<AnnotatedSection[]>([]);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync ref with state for callbacks
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const playClick = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      // Short click/tick sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Ignore audio errors (e.g. if browser blocks autoplay before interaction)
    }
  }, []);

  const loadDocument = useCallback((docWords: string[], docSections: AnnotatedSection[]) => {
    setWords(docWords);
    setSections(docSections);
    setBookmarks([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  // Keep backward compat for loading raw word arrays (e.g. plain text without sections)
  const loadText = useCallback((textTokens: string[]) => {
    setWords(textTokens);
    setSections([]);
    setBookmarks([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying(p => !p), []);
  
  const seek = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, words.length - 1)));
  }, [words.length]);

  const seekRelative = useCallback((delta: number) => {
    setCurrentIndex(prev => Math.max(0, Math.min(prev + delta, words.length - 1)));
  }, [words.length]);

  const toggleBookmark = useCallback((index?: number) => {
    const targetIndex = index ?? currentIndexRef.current;
    setBookmarks(prev => {
      if (prev.includes(targetIndex)) {
        return prev.filter(b => b !== targetIndex);
      }
      return [...prev, targetIndex].sort((a, b) => a - b);
    });
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setCurrentIndex(0);
  }, []);

  const clearDocument = useCallback(() => {
    setWords([]);
    setSections([]);
    setBookmarks([]);
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!isPlaying || words.length === 0 || currentIndex >= words.length) {
      if (currentIndex >= words.length && isPlaying) {
        setIsPlaying(false);
      }
      return;
    }

    const currentWord = words[currentIndex];
    const baseDelayMs = 60000 / settings.wpm;
    
    // Apply delay multiplier if the word has punctuation
    const delayMultiplier = getDelayMultiplier(currentWord);
    const totalDelayMs = baseDelayMs * delayMultiplier;

    // Advance by chunkSize
    const nextIndex = currentIndex + settings.chunkSize;

    timerRef.current = window.setTimeout(() => {
      setCurrentIndex(nextIndex);
    }, totalDelayMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentIndex, words, settings.wpm, settings.chunkSize]);

  // Handle metronome sound
  useEffect(() => {
    if (isPlaying && settings.metronomeEnabled && words.length > 0) {
      playClick();
    }
  }, [currentIndex, isPlaying, settings.metronomeEnabled, playClick, words.length]);

  // Handle dark mode theme change
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  return {
    words,
    sections,
    bookmarks,
    currentIndex,
    isPlaying,
    settings,
    loadDocument,
    loadText,
    play,
    pause,
    togglePlay,
    seek,
    seekRelative,
    toggleBookmark,
    stop,
    clearDocument,
    updateSetting
  };
}
