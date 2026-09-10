import { useState, useEffect } from 'react';
import { StudyMode } from '../types/question';

interface UseModalsOptions {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  filteredQuestionsLength: number;
  onNavigatePrevQuestion: () => void;
  onNavigateNextQuestion: () => void;
  onToggleBookmark: () => void;
}

export function useModals({
  currentMode,
  onSelectMode,
  filteredQuestionsLength,
  onNavigatePrevQuestion,
  onNavigateNextQuestion,
  onToggleBookmark,
}: UseModalsOptions) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isDatabaseManagerOpen, setIsDatabaseManagerOpen] = useState<boolean>(false);
  const [isAppInfoOpen, setIsAppInfoOpen] = useState<boolean>(false);
  const [isXPPerformanceOpen, setIsXPPerformanceOpen] = useState<boolean>(false);
  const [isUserAccountModalOpen, setIsUserAccountModalOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Trava de Scroll Centralizada para qualquer modal, menu ou pausa
  const isAnyModalOrOverlayOpen = Boolean(
    isSidebarOpen ||
    isShortcutsOpen ||
    isDatabaseManagerOpen ||
    isAppInfoOpen ||
    isXPPerformanceOpen ||
    isUserAccountModalOpen ||
    isPaused
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isAnyModalOrOverlayOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;

      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isAnyModalOrOverlayOpen]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input, textarea, select or contenteditable element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      // Check for Question Mark '?' shortcut to open/close shortcuts modal:
      // Handles standard '?', Shift + '/', or Brazilian ABNT2 AltGr + W
      const isAltGr = Boolean(e.getModifierState?.('AltGraph') || (e.altKey && e.ctrlKey));
      const isAltGrW = isAltGr && (e.code === 'KeyW' || e.key.toLowerCase() === 'w');
      const isQuestionMark = e.key === '?' || isAltGrW;

      if (isQuestionMark) {
        e.preventDefault();
        setIsShortcutsOpen(open => !open);
        return;
      }

      // Spacebar toggles full-screen blur pause
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsSidebarOpen(open => !open);
        return;
      }

      // Internal Developer shortcut: Ctrl+Shift+D or Cmd+Shift+D toggles theme diagnostic panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onSelectMode(currentMode === 'kitchen_sink' ? 'practice' : 'kitchen_sink');
        return;
      }

      if (e.key === 'Escape') {
        if (currentMode === 'kitchen_sink') {
          onSelectMode('practice');
          return;
        }
        setIsPaused(false);
        setIsSidebarOpen(false);
        setIsShortcutsOpen(false);
        setIsDatabaseManagerOpen(false);
        setIsUserAccountModalOpen(false);
        setIsXPPerformanceOpen(false);
        setIsAppInfoOpen(false);
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigateNextQuestion();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigatePrevQuestion();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        onToggleBookmark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentMode, 
    filteredQuestionsLength, 
    onSelectMode, 
    onNavigateNextQuestion, 
    onNavigatePrevQuestion, 
    onToggleBookmark
  ]);

  // Base pause state whenever screen is paused or any modal is open
  const isBasePaused = 
    isPaused || 
    isSidebarOpen || 
    isShortcutsOpen || 
    isDatabaseManagerOpen || 
    isXPPerformanceOpen || 
    isUserAccountModalOpen ||
    currentMode === 'kitchen_sink';

  // Mode-specific pause states
  const isPracticeTimerPaused = isBasePaused || currentMode !== 'practice';
  const isSRSTimerPaused = isBasePaused || currentMode !== 'srs';
  const isErrorTimerPaused = isBasePaused || currentMode !== 'error_notebook';
  const isSimuladoTimerPaused = isBasePaused || currentMode !== 'simulado';

  return {
    isSidebarOpen,
    setIsSidebarOpen,
    isShortcutsOpen,
    setIsShortcutsOpen,
    isDatabaseManagerOpen,
    setIsDatabaseManagerOpen,
    isAppInfoOpen,
    setIsAppInfoOpen,
    isXPPerformanceOpen,
    setIsXPPerformanceOpen,
    isUserAccountModalOpen,
    setIsUserAccountModalOpen,
    isPaused,
    setIsPaused,
    isBasePaused,
    isPracticeTimerPaused,
    isSRSTimerPaused,
    isErrorTimerPaused,
    isSimuladoTimerPaused,
  };
}
