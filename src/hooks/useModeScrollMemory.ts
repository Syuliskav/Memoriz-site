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
  const prevQuestionIndexRef = useRef(currentIndex);

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

  // Reseta o scroll para o topo SOMENTE ao avançar ou retroceder de questão na Prática
  useEffect(() => {
    if (currentMode === 'practice' && typeof window !== 'undefined') {
      // Só zera se o índice da questão de fato mudou (troca de questão, não troca de modo)
      if (prevQuestionIndexRef.current !== currentIndex) {
        prevQuestionIndexRef.current = currentIndex;
        modeScrollPositionsRef.current['practice'] = 0;
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } else {
      prevQuestionIndexRef.current = currentIndex;
    }
  }, [currentIndex, currentMode]);

  // Track mode transitions to restore scroll position per mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (prevModeRef.current !== currentMode) {
      const enteringMode = currentMode;
      prevModeRef.current = currentMode;

      const targetScroll = modeScrollPositionsRef.current[enteringMode] || 0;
      isRestoringScrollRef.current = true;
      setIsModeTransitioning(true);

      // Aguarda o container esticar no DOM antes de executar a rolagem
      const t1 = setTimeout(() => {
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
        const t2 = setTimeout(() => {
          window.scrollTo({ top: targetScroll, behavior: 'instant' });
          isRestoringScrollRef.current = false;
          setIsModeTransitioning(false);
        }, 120);
      }, 40);

      return () => {
        clearTimeout(t1);
      };
    }
  }, [currentMode, setIsModeTransitioning]);

  return {
    modeScrollPositionsRef,
    isRestoringScrollRef,
    snapshotCurrentScroll,
  };
}
