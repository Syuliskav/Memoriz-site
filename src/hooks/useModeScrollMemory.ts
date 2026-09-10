import { useEffect, useRef, useCallback } from 'react';
import { StudyMode } from '../types/question';

interface UseModeScrollMemoryOptions {
  currentMode: StudyMode;
  currentIndex: number;
  isDragging: boolean;
  isModeTransitioning: boolean;
  setIsModeTransitioning: (transitioning: boolean) => void;
}

export function useModeScrollMemory({
  currentMode,
  currentIndex,
  isDragging,
  isModeTransitioning,
  setIsModeTransitioning,
}: UseModeScrollMemoryOptions) {
  const modeScrollPositionsRef = useRef<Record<string, number>>({
    practice: 0,
    srs: 0,
    error_notebook: 0,
    errors: 0,
    simulado: 0,
    metrics: 0,
    kitchen_sink: 0,
  });

  const isRestoringScrollRef = useRef(false);
  const currentModeRef = useRef<StudyMode>(currentMode);
  currentModeRef.current = currentMode;
  const prevModeRef = useRef<StudyMode>(currentMode);

  // Snapshot active scroll position manually
  const snapshotCurrentScroll = useCallback((modeToSnapshot: StudyMode = currentModeRef.current) => {
    if (typeof window === 'undefined') return;
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;
    modeScrollPositionsRef.current[modeToSnapshot] = currentY;
  }, []);

  // Track active scrolling to continuously record scroll position per mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      // Blindagem absoluta: ignora qualquer evento de scroll durante restauração, transição ou arraste
      if (isRestoringScrollRef.current) return;
      if (isModeTransitioning) return;
      if (isDragging) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      modeScrollPositionsRef.current[currentModeRef.current] = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isModeTransitioning, isDragging]);

  // Reset scroll to top when changing question inside practice mode
  useEffect(() => {
    if (currentMode === 'practice' && typeof window !== 'undefined') {
      modeScrollPositionsRef.current['practice'] = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentIndex, currentMode]);

  // Track mode transitions to restore scroll position per mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prevModeRef.current !== currentMode) {
      const exitingMode = prevModeRef.current;
      prevModeRef.current = currentMode;

      // 1. Snapshot scroll position of exiting mode before switching DOM layout
      if (!isRestoringScrollRef.current) {
        const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
        modeScrollPositionsRef.current[exitingMode] = currentScrollY;
      }

      // 2. Prepare to restore saved scroll position of the incoming mode
      const targetScroll = modeScrollPositionsRef.current[currentMode] || 0;
      isRestoringScrollRef.current = true;
      setIsModeTransitioning(true);

      let rafId2: number | null = null;
      let settleTimer: NodeJS.Timeout | null = null;

      // Restauração em Dois Quadros (Double RAF) com layout já garantido
      const rafId1 = requestAnimationFrame(() => {
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
        rafId2 = requestAnimationFrame(() => {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
          settleTimer = setTimeout(() => {
            isRestoringScrollRef.current = false;
            setIsModeTransitioning(false);
          }, 100);
        });
      });

      return () => {
        cancelAnimationFrame(rafId1);
        if (rafId2 !== null) cancelAnimationFrame(rafId2);
        if (settleTimer !== null) clearTimeout(settleTimer);
      };
    }
  }, [currentMode, setIsModeTransitioning]);

  return {
    modeScrollPositionsRef,
    isRestoringScrollRef,
    snapshotCurrentScroll,
  };
}
