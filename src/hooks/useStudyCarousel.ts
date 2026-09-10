import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { StudyMode } from '../types/question';
import { runCarouselDiagnostic } from '../lib/carouselDiagnosticProbe';

export const MODE_KEYS: StudyMode[] = ['practice', 'srs', 'error_notebook', 'simulado', 'metrics'];

interface UseStudyCarouselOptions {
  isDevEnvironment: boolean;
  onBeforeModeChange?: (currentMode: StudyMode) => void;
  onModeChanged?: (newMode: StudyMode) => void;
}

export function useStudyCarousel({
  isDevEnvironment,
  onBeforeModeChange,
}: UseStudyCarouselOptions) {
  const [currentMode, setCurrentMode] = useState<StudyMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (isDevEnvironment && (params.get('mode') === 'kitchen_sink' || params.has('kitchen_sink') || params.get('dev') === 'themes')) {
        return 'kitchen_sink';
      }
    }
    return 'practice';
  });

  const [modeDragProgress, setModeDragProgress] = useState<{
    activeIndex: number;
    offsetFraction: number;
    isDragging: boolean;
  } | null>(null);

  const [isModeTransitioning, setIsModeTransitioning] = useState<boolean>(false);
  const [slideHeights, setSlideHeights] = useState<number[]>([0, 0, 0, 0, 0]);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const rightVeilRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const currentModeRef = useRef<StudyMode>(currentMode);
  currentModeRef.current = currentMode;

  const onBeforeModeChangeRef = useRef(onBeforeModeChange);
  onBeforeModeChangeRef.current = onBeforeModeChange;

  const handleSelectMode = useCallback((newMode: StudyMode) => {
    setModeDragProgress(null);
    if (newMode === currentModeRef.current) return;
    if (onBeforeModeChangeRef.current) {
      onBeforeModeChangeRef.current(currentModeRef.current);
    }
    setCurrentMode(newMode);
  }, []);

  const handleModeDragProgress = useCallback((dragProgress: { activeIndex: number; offsetFraction: number; isDragging: boolean }) => {
    if (dragProgress.isDragging) {
      if (!modeDragProgress?.isDragging && onBeforeModeChangeRef.current) {
        onBeforeModeChangeRef.current(currentModeRef.current);
      }
      setModeDragProgress(dragProgress);
    } else {
      setModeDragProgress(null);
    }
  }, [modeDragProgress?.isDragging]);

  // Synchronous initial width measurement
  useLayoutEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;
    const w = Math.round(container.getBoundingClientRect().width || container.clientWidth || 0);
    if (w > 0) {
      setContainerWidth(w);
    }
  }, []);

  // Diagnostic tool integration in development mode
  useEffect(() => {
    if (!isDevEnvironment) return;
    const timer = setTimeout(() => {
      if (carouselContainerRef.current) {
        runCarouselDiagnostic(
          containerWidth,
          carouselContainerRef.current,
          slideRefs.current,
          rightVeilRef.current
        );
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [containerWidth, currentMode, isDevEnvironment]);

  // Measure individual slide heights and container width
  useEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollDebounceTimer: number | null = null;

    const updateDimensions = (force = false) => {
      const w = Math.round(container.getBoundingClientRect().width || container.clientWidth || 0);
      if (w > 0) {
        setContainerWidth(prev => (prev !== w ? w : prev));
      }

      if (isScrolling && !force) return;

      const newHeights = slideRefs.current.map(el => {
        if (!el) return 0;
        return Math.round(el.offsetHeight || el.getBoundingClientRect().height || 0);
      });
      setSlideHeights(prev => {
        const hasChanged = prev.length !== newHeights.length || prev.some((h, i) => Math.abs(h - newHeights[i]) >= 2);
        return hasChanged ? newHeights : prev;
      });
    };

    updateDimensions(true);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (!isScrolling) {
          updateDimensions();
        }
      });
      resizeObserver.observe(container);
      slideRefs.current.forEach(slideEl => {
        if (slideEl) resizeObserver?.observe(slideEl);
      });
    }

    const handleWindowResize = () => {
      updateDimensions(true);
    };
    window.addEventListener('resize', handleWindowResize, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleWindowResize, { passive: true });
    }

    const handleScroll = () => {
      isScrolling = true;
      if (scrollDebounceTimer) {
        window.clearTimeout(scrollDebounceTimer);
      }
      scrollDebounceTimer = window.setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (scrollDebounceTimer) window.clearTimeout(scrollDebounceTimer);
      document.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleWindowResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleWindowResize);
      }
    };
  }, [currentMode]);

  // Sync mode with URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (currentMode === 'kitchen_sink') {
        url.searchParams.set('mode', 'kitchen_sink');
        window.history.replaceState(null, '', url.toString());
      } else if (url.searchParams.get('mode') === 'kitchen_sink') {
        url.searchParams.delete('mode');
        window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
      }
    }
  }, [currentMode]);

  // Dynamic layout calculations for rendering
  const isCarouselMode = MODE_KEYS.includes(currentMode);
  const activeModeIndex = Math.max(0, MODE_KEYS.indexOf(currentMode));
  
  const continuousPos = modeDragProgress?.isDragging
    ? Math.max(0, Math.min(MODE_KEYS.length - 1, modeDragProgress.activeIndex + modeDragProgress.offsetFraction))
    : activeModeIndex;

  const fromIdx = Math.floor(continuousPos);
  const toIdx = Math.min(MODE_KEYS.length - 1, fromIdx + 1);
  const hFrom = slideHeights[fromIdx] || 0;
  const hTo = slideHeights[toIdx] || 0;
  const isDragging = !!modeDragProgress?.isDragging;

  let dynamicContainerHeight = 0;
  if (isDragging) {
    // Durante o arrasto, mantém a altura do maior slide visível para zero corte (anti-guilhotina)
    dynamicContainerHeight = Math.max(hFrom || 0, hTo || 0, slideHeights[activeModeIndex] || 0);
  } else if (slideHeights[activeModeIndex] > 0) {
    // Em repouso, adota estritamente a altura do slide ativo
    dynamicContainerHeight = slideHeights[activeModeIndex];
  } else if (hFrom > 0 || hTo > 0) {
    dynamicContainerHeight = Math.max(hFrom, hTo);
  }

  const heightTransition = isDragging
    ? 'none'
    : 'height 0.25s ease';

  const pixelOffset = containerWidth > 0 ? -Math.round(continuousPos * containerWidth) : 0;
  const slideWidthStyle = containerWidth > 0 ? `${containerWidth}px` : '100%';
  const trackWidthStyle = containerWidth > 0 ? `${MODE_KEYS.length * containerWidth}px` : '500%';

  return {
    currentMode,
    setCurrentMode,
    handleSelectMode,
    modeDragProgress,
    handleModeDragProgress,
    isModeTransitioning,
    setIsModeTransitioning,
    isDragging,
    carouselContainerRef,
    rightVeilRef,
    slideRefs,
    slideHeights,
    containerWidth,
    isCarouselMode,
    activeModeIndex,
    continuousPos,
    dynamicContainerHeight,
    heightTransition,
    pixelOffset,
    slideWidthStyle,
    trackWidthStyle,
  };
}
