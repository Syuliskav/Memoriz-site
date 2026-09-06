/**
 * Memoriz - High Performance Offline Learning & Question Bank Application
 * Minimalist AI Studio Interface with Collapsible Sidebar & Fast Inverted Index
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Question, 
  QuestionDatabase,
  StudyMode, 
  FilterState, 
  SRSItem, 
  SRSRating, 
  UserAnswerRecord, 
  UserBookmark, 
  SimuladoResult, 
  UserStatistics,
  ThemeMode,
  UserAccount
} from './types/question';
import { initialQuestionBank } from './data/question_bank';
import { LocalStorageManager, defaultStatistics } from './lib/storage';
import { FastSearchEngine } from './lib/searchEngine';
import { calculateNextSRS, isItemDueForReview } from './lib/srsEngine';
import { buildTwinMap, getQuestionContentHash, countUniqueQuestions } from './lib/duplicateEngine';

// UI Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { QuestionCard } from './components/QuestionCard';
import { AssociatedContextPanel } from './components/AssociatedContextPanel';
import { SRSModeView } from './components/SRSModeView';
import { SimuladoView } from './components/SimuladoView';
import { ErrorNotebookView } from './components/ErrorNotebookView';
import { MetricsDashboard } from './components/MetricsDashboard';
import { DatabaseManagerModal } from './components/DatabaseManagerModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { AppInfoModal } from './components/AppInfoModal';
import { PauseOverlay } from './components/PauseOverlay';
import { UserAccountModal } from './components/UserAccountModal';
import { ThemeKitchenSink } from './components/ThemeKitchenSink';
import { XPPerformanceModal } from './components/XPPerformanceModal';
import { SlidersHorizontal, FilterX } from 'lucide-react';

export default function App() {
  // 1. Core Data State (Multiple databases supported)
  const [databases, setDatabases] = useState<QuestionDatabase[]>(() => {
    return LocalStorageManager.getDatabases(initialQuestionBank.question_bank);
  });

  const questions = useMemo(() => {
    return LocalStorageManager.getAllQuestions(databases);
  }, [databases]);

  const [answers, setAnswers] = useState<Record<number, UserAnswerRecord[]>>(() => LocalStorageManager.getAnswers());
  const [srsItems, setSRSItems] = useState<Record<number, SRSItem>>(() => LocalStorageManager.getSRSItems());
  const [bookmarks, setBookmarks] = useState<Record<number, UserBookmark>>(() => LocalStorageManager.getBookmarks());
  const [strikes, setStrikes] = useState<Record<number, string[]>>(() => LocalStorageManager.getOptionStrikes());
  const [stats, setStats] = useState<UserStatistics>(() => LocalStorageManager.getStatistics());
  const [userAccount, setUserAccount] = useState<UserAccount>(() => LocalStorageManager.getUserAccount());
  const [isUserAccountModalOpen, setIsUserAccountModalOpen] = useState<boolean>(false);

  // Developer account recognition (access to Theme Kitchen Sink diagnostic panel)
  const DEV_EMAIL = 'paulohenrique.manager@gmail.com';
  const isDevUser = Boolean(
    (userAccount.email && userAccount.email.trim().toLowerCase() === DEV_EMAIL.toLowerCase()) ||
    (typeof window !== 'undefined' && (new URLSearchParams(window.location.search).get('dev') === 'themes' || new URLSearchParams(window.location.search).has('kitchen_sink')))
  );
  
  // 2. Navigation, Pause & View State
  const [currentMode, setCurrentMode] = useState<StudyMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'kitchen_sink' || params.has('kitchen_sink') || params.get('dev') === 'themes') {
        return 'kitchen_sink';
      }
    }
    return 'practice';
  });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isDatabaseManagerOpen, setIsDatabaseManagerOpen] = useState<boolean>(false);
  const [isAppInfoOpen, setIsAppInfoOpen] = useState<boolean>(false);
  const [isXPPerformanceOpen, setIsXPPerformanceOpen] = useState<boolean>(false);
  const [modeDragProgress, setModeDragProgress] = useState<{ activeIndex: number; offsetFraction: number; isDragging: boolean } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isModeTransitioning, setIsModeTransitioning] = useState<boolean>(false);
  const prevModeRef = useRef<StudyMode>(currentMode);
  const carouselContainerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [carouselWidth, setCarouselWidth] = useState<number>(0);
  const [slideHeights, setSlideHeights] = useState<number[]>([0, 0, 0, 0, 0]);

  // Track mode transitions to only animate container height during active mode switches
  useEffect(() => {
    if (prevModeRef.current !== currentMode) {
      prevModeRef.current = currentMode;
      setIsModeTransitioning(true);
      const timer = setTimeout(() => {
        setIsModeTransitioning(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [currentMode]);

  // 3. User Preferences & Theme
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return LocalStorageManager.getPreferences().theme || 'light';
  });

  // 4. Filters State
  const [filters, setFilters] = useState<FilterState>({
    database_id: 'all',
    subject: 'all',
    exam_board: 'all',
    year: 'all',
    topic: 'all',
    status: 'all',
    searchQuery: '',
  });

  // Apply HTML Theme Attribute synchronously and update top bar color dynamically
  const applyThemeToDOM = (themeMode: ThemeMode) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeMode);
    // ONLY 'dark' mode uses Tailwind's .dark class (AMOLED Slate / Electric Indigo).
    // 'night' is the dedicated zero-blue circadian amber theme (no blue pixels).
    // 'reading' is warm paper sepia, and 'light' is daylight.
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Dynamic top bar & status bar color (for Windows title bar and Android status bar in PWA/browser)
    const THEME_TOPBAR_COLORS: Record<ThemeMode, string> = {
      light: '#ffffff',
      dark: '#0d131f',
      reading: '#f5ece0',
      night: '#1c0700',
    };
    const topBarColor = THEME_TOPBAR_COLORS[themeMode] || '#ffffff';
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', topBarColor);
  };

  useEffect(() => {
    applyThemeToDOM(theme);
    LocalStorageManager.savePreferences({
      ...LocalStorageManager.getPreferences(),
      theme,
    });
  }, [theme]);

  // Smooth, fluid theme transition handler
  const handleToggleTheme = useCallback((newTheme: ThemeMode) => {
    if (newTheme === theme) return;

    applyThemeToDOM(newTheme);
    setTheme(newTheme);

    LocalStorageManager.savePreferences({
      ...LocalStorageManager.getPreferences(),
      theme: newTheme,
    });
  }, [theme]);

  // High-performance Search Engine Instance (Built with typed buffers)
  const searchEngine = useMemo(() => {
    return new FastSearchEngine(questions);
  }, [questions]);

  // Derived Twin Map for instantaneous synchronization of duplicate questions across banks
  const twinMap = useMemo(() => {
    return buildTwinMap(questions);
  }, [questions]);

  // Derived Map of latest answers per question
  const lastAnswerMap = useMemo(() => {
    const map: Record<number, UserAnswerRecord> = {};
    for (const [qidStr, recordList] of Object.entries(answers) as [string, UserAnswerRecord[]][]) {
      const qid = Number(qidStr);
      if (recordList && recordList.length > 0) {
        map[qid] = recordList[recordList.length - 1];
      }
    }
    return map;
  }, [answers]);

  // Compute Filtered Question Indices via Inverted Index
  const matchedIndices = useMemo(() => {
    return searchEngine.filter(filters, srsItems, bookmarks, lastAnswerMap);
  }, [searchEngine, filters, srsItems, bookmarks, lastAnswerMap]);

  // Filtered Questions Array
  const filteredQuestions = useMemo(() => {
    return matchedIndices.map(idx => questions[idx]);
  }, [matchedIndices, questions]);

  // Compute Facet Counts for Filter Sidebar
  const { subjectCounts, statusCounts } = useMemo(() => {
    return searchEngine.getFacetCounts(filters, srsItems, bookmarks, lastAnswerMap);
  }, [searchEngine, filters, lastAnswerMap, bookmarks, srsItems]);

  // Clamp Current Index safely
  useEffect(() => {
    if (currentIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCurrentIndex(filteredQuestions.length - 1);
    }
  }, [filteredQuestions.length, currentIndex]);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  // Measure carousel container width and each individual slide height precisely with scroll and address bar immunity
  useEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollDebounceTimer: number | null = null;
    let lastWidth = typeof window !== 'undefined' 
      ? Math.round(window.visualViewport?.width || window.innerWidth) 
      : 0;

    const updateDimensions = (force = false) => {
      // Never perform layout recalculations during active vertical page scrolling
      if (isScrolling && !force) return;

      const rect = container.getBoundingClientRect();
      if (rect.width > 0) {
        const roundedW = Math.round(rect.width);
        setCarouselWidth(prev => (Math.abs(prev - roundedW) >= 1 ? roundedW : prev));
      }
      const newHeights = slideRefs.current.map(el => {
        if (!el) return 0;
        return Math.round(el.offsetHeight || el.getBoundingClientRect().height || 0);
      });
      setSlideHeights(prev => {
        const hasChanged = prev.length !== newHeights.length || prev.some((h, i) => Math.abs(h - newHeights[i]) >= 2);
        return hasChanged ? newHeights : prev;
      });
    };

    // Initial measurement
    updateDimensions(true);

    // ResizeObserver on container and individual slides
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

    // Window / VisualViewport Resize Handler:
    // Strictly filter out mobile address-bar hide/show events (which ONLY change height, not width)
    const handleViewportResize = () => {
      const currentWidth = Math.round(window.visualViewport?.width || window.innerWidth);
      if (Math.abs(currentWidth - lastWidth) < 2) {
        // Pure height change (mobile address bar retracted/expanded during scroll) -> ignore!
        return;
      }
      lastWidth = currentWidth;
      updateDimensions(true);
    };

    // Scroll Listener: detects when user is actively scrolling ANY element on the page (via capture phase) and delays updates
    const handleScroll = () => {
      isScrolling = true;
      if (scrollDebounceTimer) {
        window.clearTimeout(scrollDebounceTimer);
      }
      scrollDebounceTimer = window.setTimeout(() => {
        isScrolling = false;
      }, 150);
    };

    window.addEventListener('resize', handleViewportResize, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize, { passive: true });
    }
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (scrollDebounceTimer) window.clearTimeout(scrollDebounceTimer);
      window.removeEventListener('resize', handleViewportResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportResize);
      }
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [currentMode, filteredQuestions.length, currentIndex, srsItems, currentQuestion]);

  // Handler: Answer Submission (synchronizes across all twin questions)
  const handleAnswer = useCallback((
    letter: string, 
    timeSpentSeconds: number, 
    answeredStrikes?: string[], 
    targetQuestionOverride?: Question
  ) => {
    const q = targetQuestionOverride || currentQuestion;
    if (!q) return;

    const isCorrect = letter === q.resolution.deduced_answer;
    const earnedXP = isCorrect ? 15 : 5;
    const twinIds = twinMap.get(q.sequence_id) || [q.sequence_id];
    const strikesToSave = answeredStrikes !== undefined ? answeredStrikes : (strikes[q.sequence_id] || []);

    // Record answer for target question and all its twins
    const record: UserAnswerRecord = {
      question_id: q.sequence_id,
      selected_letter: letter,
      is_correct: isCorrect,
      timestamp: Date.now(),
      time_spent_seconds: timeSpentSeconds,
      mode: currentMode === 'practice' ? 'practice' : 'error_notebook',
      eliminated_options: strikesToSave,
    };

    const updatedAnswers = LocalStorageManager.saveAnswer(record, twinIds);
    setAnswers(updatedAnswers);

    // Update stats & XP (counted once for the interaction)
    const updatedStats = LocalStorageManager.addXP(earnedXP, isCorrect, q.metadata.subject);
    setStats(updatedStats);

    // Auto-update SRS for question and all twins
    const existingSRS = srsItems[q.sequence_id];
    const defaultRating: SRSRating = isCorrect ? 2 : 1;
    const updatedSRS = calculateNextSRS(existingSRS, defaultRating, q.sequence_id);
    const newSRSItems = LocalStorageManager.saveSRSItem(updatedSRS, twinIds);
    setSRSItems(newSRSItems);
  }, [currentQuestion, currentMode, srsItems, twinMap, strikes]);

  // Handler: Rate SRS manually (synchronizes twins)
  const handleRateSRS = useCallback((rating: SRSRating, targetQuestionOverride?: Question) => {
    const q = targetQuestionOverride || currentQuestion;
    if (!q) return;
    const twinIds = twinMap.get(q.sequence_id) || [q.sequence_id];
    const existingSRS = srsItems[q.sequence_id];
    const updated = calculateNextSRS(existingSRS, rating, q.sequence_id);
    const newSRSItems = LocalStorageManager.saveSRSItem(updated, twinIds);
    setSRSItems(newSRSItems);
  }, [currentQuestion, srsItems, twinMap]);

  // Handler: Toggle Bookmark (synchronizes twins)
  const handleToggleBookmark = useCallback((targetQuestionOverride?: Question) => {
    const q = targetQuestionOverride || currentQuestion;
    if (!q) return;
    const twinIds = twinMap.get(q.sequence_id) || [q.sequence_id];
    const newBookmarks = LocalStorageManager.toggleBookmark(q.sequence_id, '', [], twinIds);
    setBookmarks(newBookmarks);
  }, [currentQuestion, twinMap]);

  // Handler: Save Personal Note (synchronizes twins)
  const handleSaveNote = useCallback((note: string, targetQuestionId?: number) => {
    const qid = targetQuestionId ?? currentQuestion?.sequence_id;
    if (!qid) return;
    const twinIds = twinMap.get(qid) || [qid];
    const newBookmarks = LocalStorageManager.updateBookmarkNote(qid, note, twinIds);
    setBookmarks(newBookmarks);
  }, [currentQuestion, twinMap]);

  // Handler: Option Strike (synchronizes twins)
  const handleToggleStrike = useCallback((letter: string, targetQuestionId?: number) => {
    const qid = targetQuestionId ?? currentQuestion?.sequence_id;
    if (!qid) return;
    const twinIds = twinMap.get(qid) || [qid];
    const newStrikes = LocalStorageManager.toggleOptionStrike(qid, letter, twinIds);
    setStrikes(newStrikes);
  }, [currentQuestion, twinMap]);

  // Handler: Set All Strikes for question (synchronizes twins)
  const handleSetStrikes = useCallback((letters: string[]) => {
    if (!currentQuestion) return;
    const twinIds = twinMap.get(currentQuestion.sequence_id) || [currentQuestion.sequence_id];
    const newStrikes = LocalStorageManager.setOptionStrikes(currentQuestion.sequence_id, letters, twinIds);
    setStrikes(newStrikes);
  }, [currentQuestion, twinMap]);

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
        setCurrentMode(prev => prev === 'kitchen_sink' ? 'practice' : 'kitchen_sink');
        return;
      }

      if (e.key === 'Escape') {
        if (currentMode === 'kitchen_sink') {
          setCurrentMode('practice');
          return;
        }
        setIsPaused(false);
        setIsSidebarOpen(false);
        setIsShortcutsOpen(false);
        setIsDatabaseManagerOpen(false);
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex(i => Math.min(filteredQuestions.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex(i => Math.max(0, i - 1));
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleBookmark();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredQuestions.length, handleToggleBookmark, currentMode]);

  // Sync mode with URL query parameter for internal diagnostic access
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

  // Derived: Timer is paused whenever screen is paused, main menu/sidebar is open, or any modal is open
  const isQuestionTimerPaused = isPaused || isSidebarOpen || isShortcutsOpen || isDatabaseManagerOpen;

  // Error count & SRS due count for badges (counting unique question hashes so identical items count as 1)
  const errorCount = useMemo(() => {
    const wrongHashes = new Set<string>();
    for (const q of questions) {
      const last = lastAnswerMap[q.sequence_id];
      if (last && !last.is_correct) {
        wrongHashes.add(getQuestionContentHash(q));
      }
    }
    return wrongHashes.size;
  }, [questions, lastAnswerMap]);

  const srsDueCount = useMemo(() => {
    const dueHashes = new Set<string>();
    for (const q of questions) {
      if (isItemDueForReview(srsItems[q.sequence_id])) {
        dueHashes.add(getQuestionContentHash(q));
      }
    }
    return dueHashes.size;
  }, [questions, srsItems]);

  const activePoolQuestions = useMemo(() => {
    if (filters.database_id === 'all') return questions;
    return questions.filter(q => (q.database_id || 'default_main') === filters.database_id);
  }, [questions, filters.database_id]);

  const totalPoolUniqueQuestions = useMemo(() => {
    return countUniqueQuestions(activePoolQuestions);
  }, [activePoolQuestions]);

  const hasActiveFilters = 
    filters.database_id !== 'all' ||
    filters.subject !== 'all' || 
    filters.exam_board !== 'all' || 
    filters.year !== 'all' || 
    filters.topic !== 'all' || 
    filters.status !== 'all' || 
    filters.searchQuery.trim() !== '';

  const handleSelectDatabase = useCallback((dbId: string | 'all') => {
    setFilters(prev => ({ ...prev, database_id: dbId }));
    setCurrentIndex(0);
  }, []);

  const handleAddDatabase = useCallback((
    newDb: { name: string; filename?: string; questions: Question[] }, 
    activateImmediately: boolean
  ) => {
    const { updatedDatabases, newDatabaseId } = LocalStorageManager.addDatabase(newDb, databases);
    setDatabases(updatedDatabases);
    if (activateImmediately) {
      setFilters(prev => ({ ...prev, database_id: newDatabaseId }));
    }
    setCurrentIndex(0);
  }, [databases]);

  const handleRenameDatabase = useCallback((id: string, newName: string) => {
    const updated = LocalStorageManager.renameDatabase(id, newName, databases);
    setDatabases(updated);
  }, [databases]);

  const handleDeleteDatabase = useCallback((id: string) => {
    const updated = LocalStorageManager.deleteDatabase(id, databases);
    setDatabases(updated);
    if (filters.database_id === id) {
      setFilters(prev => ({ ...prev, database_id: 'all' }));
    }
    setCurrentIndex(0);
  }, [databases, filters.database_id]);

  const handleRestoreDefaultDatabases = useCallback(() => {
    const defaultDb: QuestionDatabase = {
      id: 'default_main',
      name: 'Principal',
      questions: initialQuestionBank.question_bank.map(q => ({
        ...q,
        database_id: 'default_main',
        database_name: 'Principal',
      })),
      created_at: Date.now(),
      is_default: true,
    };
    LocalStorageManager.saveDatabases([defaultDb]);
    setDatabases([defaultDb]);
    setFilters(prev => ({ ...prev, database_id: 'all' }));
    setCurrentIndex(0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Minimalist Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        stats={stats}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenDatabaseManager={() => setIsDatabaseManagerOpen(true)}
        onOpenAppInfo={() => setIsAppInfoOpen(true)}
        onOpenXPPerformance={() => setIsXPPerformanceOpen(true)}
        errorCount={errorCount}
        srsDueCount={srsDueCount}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(open => !open)}
        filters={filters}
        currentQuestionIndex={currentIndex}
        totalQuestions={filteredQuestions.length}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(p => !p)}
        userAccount={userAccount}
        onOpenAccountModal={() => setIsUserAccountModalOpen(true)}
        isDevUser={isDevUser}
        onOpenKitchenSink={() => setCurrentMode('kitchen_sink')}
        onModeDragProgress={setModeDragProgress}
      />

      {/* Collapsible Sidebar Drawer with Filters & Nav */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        currentMode={currentMode}
        onSelectMode={setCurrentMode}
        databases={databases}
        activeDatabaseId={filters.database_id}
        onChangeDatabase={handleSelectDatabase}
        stats={stats}
        errorCount={errorCount}
        srsDueCount={srsDueCount}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenDatabaseManager={() => setIsDatabaseManagerOpen(true)}
        onOpenAppInfo={() => setIsAppInfoOpen(true)}
        onOpenXPPerformance={() => setIsXPPerformanceOpen(true)}
        userAccount={userAccount}
        onOpenAccountModal={() => setIsUserAccountModalOpen(true)}
        isDevUser={isDevUser}
        onOpenKitchenSink={() => {
          setIsSidebarOpen(false);
          setCurrentMode('kitchen_sink');
        }}
        filters={filters}
        onChangeFilters={setFilters}
        subjects={searchEngine.subjects}
        examBoards={searchEngine.examBoards}
        years={searchEngine.years}
        topics={searchEngine.topics}
        subjectCounts={subjectCounts}
        statusCounts={statusCounts}
        totalFiltered={filteredQuestions.length}
        totalAll={totalPoolUniqueQuestions}
      />

      {/* Main Content Area with Ultra-Fluid Hardware Accelerated Mode Sliding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {(() => {
          const MODE_KEYS: StudyMode[] = ['practice', 'srs', 'error_notebook', 'simulado', 'metrics'];
          const isCarouselMode = MODE_KEYS.includes(currentMode);
          const activeModeIndex = Math.max(0, MODE_KEYS.indexOf(currentMode));
          const dragOffsetFraction = modeDragProgress?.isDragging ? modeDragProgress.offsetFraction : 0;
          const continuousPos = Math.max(0, Math.min(MODE_KEYS.length - 1, activeModeIndex + dragOffsetFraction));
          const roundedWidth = Math.round(carouselWidth);
          const translateX = Math.round(-continuousPos * roundedWidth);

          // Dynamic height interpolation based on continuous gesture position
          const fromIdx = Math.floor(continuousPos);
          const toIdx = Math.min(MODE_KEYS.length - 1, fromIdx + 1);
          const t = continuousPos - fromIdx;
          const hFrom = slideHeights[fromIdx] || 0;
          const hTo = slideHeights[toIdx] || 0;
          let dynamicContainerHeight = 0;
          if (hFrom > 0 && hTo > 0) {
            dynamicContainerHeight = Math.round(hFrom * (1 - t) + hTo * t);
          } else if (hFrom > 0) {
            dynamicContainerHeight = hFrom;
          } else if (hTo > 0) {
            dynamicContainerHeight = hTo;
          } else if (slideHeights[activeModeIndex] > 0) {
            dynamicContainerHeight = slideHeights[activeModeIndex];
          }

          const slideStyle: React.CSSProperties = roundedWidth > 0 ? {
            width: `${roundedWidth}px`,
            minWidth: `${roundedWidth}px`,
            maxWidth: `${roundedWidth}px`,
            boxSizing: 'border-box',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          } : {
            width: '100%',
            minWidth: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          };

          const isDragging = !!modeDragProgress?.isDragging;
          const heightTransition = isDragging
            ? 'none'
            : isModeTransitioning
            ? 'height 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)'
            : 'none';

          if (isCarouselMode) {
            return (
              <div 
                ref={carouselContainerRef}
                className="relative w-full overflow-hidden bg-canvas theme-bg-canvas"
                style={{
                  height: dynamicContainerHeight > 0 ? `${dynamicContainerHeight}px` : undefined,
                  transition: heightTransition,
                }}
              >
                <div
                  className="flex items-start bg-canvas theme-bg-canvas"
                  style={{
                    width: roundedWidth > 0 ? `${roundedWidth * MODE_KEYS.length}px` : `${MODE_KEYS.length * 100}%`,
                    transform: roundedWidth > 0 
                      ? `translate3d(${translateX}px, 0, 0)` 
                      : `translate3d(${Math.round(-continuousPos * 100)}%, 0, 0)`,
                    transition: isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    willChange: 'transform, height',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  {/* SLIDE 0: PRÁTICA DE QUESTÕES COM SPLIT-SCREEN INTELIGENTE */}
                  <div 
                    ref={el => { slideRefs.current[0] = el; }}
                    className="w-full shrink-0 bg-canvas theme-bg-canvas" 
                    style={slideStyle}
                  >
                    <div className={currentQuestion?.associated_context?.has_associated_context ? "w-full space-y-4" : "max-w-4xl mx-auto w-full space-y-4"}>
                      {/* Minimalist Question Header / Filter Status Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs text-muted theme-text-muted w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary theme-text-primary">
                            Questão {filteredQuestions.length > 0 ? currentIndex + 1 : 0} de {filteredQuestions.length}
                          </span>
                          {hasActiveFilters && (
                            <span className="text-[11px] bg-surface-subtle text-secondary theme-text-secondary border border-border px-2 py-0.5 rounded">
                              Filtros ativos ({filteredQuestions.length}/{totalPoolUniqueQuestions})
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {hasActiveFilters && (
                            <button
                              onClick={() => setFilters({
                                database_id: 'all',
                                subject: 'all',
                                exam_board: 'all',
                                year: 'all',
                                topic: 'all',
                                status: 'all',
                                searchQuery: '',
                              })}
                              className="flex items-center gap-1 text-[11px] text-danger hover:underline cursor-pointer"
                            >
                              <FilterX className="w-3 h-3" />
                              <span>Limpar filtros</span>
                            </button>
                          )}
                          <button
                            id="open-filters-sidebar-btn"
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface hover:bg-surface-hover text-secondary theme-text-secondary border border-border rounded-md transition-colors cursor-pointer"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Filtrar e Navegar (Ctrl+B)</span>
                            <span className="sm:hidden">Filtrar / Menu</span>
                          </button>
                        </div>
                      </div>

                      {/* Questions View */}
                      {filteredQuestions.length === 0 ? (
                        <div className="theme-card border border-border rounded-xl p-10 text-center space-y-3 shadow-xs">
                          <div className="w-12 h-12 bg-surface-subtle text-muted border border-border rounded-lg flex items-center justify-center mx-auto text-xl font-bold">
                            ∅
                          </div>
                          <h3 className="font-semibold text-base text-primary theme-text-primary">
                            Nenhuma questão encontrada
                          </h3>
                          <p className="text-xs text-muted theme-text-muted max-w-sm mx-auto">
                            Nenhum registro corresponde aos filtros selecionados.
                          </p>
                          <button
                            onClick={() => setFilters({
                              database_id: 'all',
                              subject: 'all',
                              exam_board: 'all',
                              year: 'all',
                              topic: 'all',
                              status: 'all',
                              searchQuery: '',
                            })}
                            className="px-4 py-2 theme-btn-accent font-medium rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Restaurar Todos os Filtros
                          </button>
                        </div>
                      ) : currentQuestion ? (
                        <div className={currentQuestion.associated_context?.has_associated_context ? "grid grid-cols-1 lg:grid-cols-12 gap-5 items-start" : "w-full"}>
                          {/* Left Split: Associated Context Panel */}
                          {currentQuestion.associated_context?.has_associated_context && (
                            <div className="lg:col-span-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]">
                              <AssociatedContextPanel context={currentQuestion.associated_context} />
                            </div>
                          )}

                          {/* Right Split: Question Card & Resolutions */}
                          <div className={currentQuestion.associated_context?.has_associated_context ? "lg:col-span-7" : "w-full"}>
                            <QuestionCard
                              question={currentQuestion}
                              currentIndex={currentIndex}
                              totalFiltered={filteredQuestions.length}
                              onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
                              onNext={() => setCurrentIndex(i => Math.min(filteredQuestions.length - 1, i + 1))}
                              onAnswer={handleAnswer}
                              lastAnswer={lastAnswerMap[currentQuestion.sequence_id]}
                              srsItem={srsItems[currentQuestion.sequence_id]}
                              onRateSRS={handleRateSRS}
                              isBookmarked={!!bookmarks[currentQuestion.sequence_id]}
                              bookmarkData={bookmarks[currentQuestion.sequence_id]}
                              onToggleBookmark={handleToggleBookmark}
                              onSaveNote={handleSaveNote}
                              strikes={strikes[currentQuestion.sequence_id] || []}
                              onToggleStrike={handleToggleStrike}
                              onSetStrikes={handleSetStrikes}
                              isPaused={isQuestionTimerPaused}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* SLIDE 1: MODO SRS REPETIÇÃO ESPAÇADA */}
                  <div 
                    ref={el => { slideRefs.current[1] = el; }}
                    className="w-full shrink-0 bg-canvas theme-bg-canvas" 
                    style={slideStyle}
                  >
                    <SRSModeView
                      questions={questions}
                      srsItems={srsItems}
                      onSaveSRS={(item) => {
                        const twinIds = twinMap.get(item.question_id) || [item.question_id];
                        const updated = LocalStorageManager.saveSRSItem(item, twinIds);
                        setSRSItems(updated);
                      }}
                      onRecordAnswer={(record) => {
                        const twinIds = twinMap.get(record.question_id) || [record.question_id];
                        const updated = LocalStorageManager.saveAnswer(record, twinIds);
                        setAnswers(updated);
                        const isCorrect = record.is_correct;
                        const q = questions.find(item => item.sequence_id === record.question_id);
                        if (q) {
                          const updatedStats = LocalStorageManager.addXP(isCorrect ? 20 : 5, isCorrect, q.metadata.subject);
                          setStats(updatedStats);
                        }
                      }}
                      streakDays={stats.streak_days}
                      onExit={() => setCurrentMode('practice')}
                    />
                  </div>

                  {/* SLIDE 2: CADERNO DE ERROS AUTOMÁTICO */}
                  <div 
                    ref={el => { slideRefs.current[2] = el; }}
                    className="w-full shrink-0 bg-canvas theme-bg-canvas" 
                    style={slideStyle}
                  >
                    <ErrorNotebookView
                      questions={questions}
                      lastAnswers={lastAnswerMap}
                      onStartPracticeQuestion={(q) => {
                        setFilters({
                          database_id: 'all',
                          subject: 'all',
                          exam_board: 'all',
                          year: 'all',
                          topic: 'all',
                          status: 'wrong',
                          searchQuery: '',
                        });
                        setCurrentMode('practice');
                        const targetHash = getQuestionContentHash(q);
                        const idx = filteredQuestions.findIndex(item => item.sequence_id === q.sequence_id || getQuestionContentHash(item) === targetHash);
                        setCurrentIndex(idx >= 0 ? idx : 0);
                      }}
                      onExit={() => setCurrentMode('practice')}
                      onAnswerQuestion={handleAnswer}
                      srsItems={srsItems}
                      onRateSRS={handleRateSRS}
                      bookmarks={bookmarks}
                      onToggleBookmark={handleToggleBookmark}
                      onSaveNote={handleSaveNote}
                      strikes={strikes}
                      onToggleStrike={handleToggleStrike}
                      isPaused={isQuestionTimerPaused}
                    />
                  </div>

                  {/* SLIDE 3: MODO SIMULADO COM CRONÔMETRO */}
                  <div 
                    ref={el => { slideRefs.current[3] = el; }}
                    className="w-full shrink-0 bg-canvas theme-bg-canvas" 
                    style={slideStyle}
                  >
                    <SimuladoView
                      questions={questions}
                      isPaused={isQuestionTimerPaused}
                      onRecordSimuladoResult={(result) => {
                        LocalStorageManager.saveSimulado(result);
                        for (const [qidStr, ans] of Object.entries(result.answers) as [string, { selected: string; correct: string; is_correct: boolean }][]) {
                          if (!ans.selected) continue;
                          const qid = Number(qidStr);
                          const twinIds = twinMap.get(qid) || [qid];
                          const record: UserAnswerRecord = {
                            question_id: qid,
                            selected_letter: ans.selected,
                            is_correct: ans.is_correct,
                            timestamp: Date.now(),
                            time_spent_seconds: Math.round(result.time_spent_seconds / Math.max(1, result.total_questions)),
                            mode: 'simulado',
                          };
                          LocalStorageManager.saveAnswer(record, twinIds);
                        }
                        setAnswers(LocalStorageManager.getAnswers());
                        const updatedStats = LocalStorageManager.addXP(
                          result.correct_count * 20, 
                          result.score_percentage >= 70, 
                          'Simulados'
                        );
                        setStats(updatedStats);
                      }}
                      onExit={() => setCurrentMode('practice')}
                    />
                  </div>

                  {/* SLIDE 4: DASHBOARD DE MÉTRICAS & RETENÇÃO */}
                  <div 
                    ref={el => { slideRefs.current[4] = el; }}
                    className="w-full shrink-0 bg-canvas theme-bg-canvas" 
                    style={slideStyle}
                  >
                    <MetricsDashboard
                      stats={stats}
                      questions={questions}
                      srsItems={srsItems}
                      answers={answers}
                      onResetProgress={() => {
                        LocalStorageManager.resetAllProgress();
                        setAnswers({});
                        setSRSItems({});
                        setBookmarks({});
                        setStrikes({});
                        setStats(defaultStatistics);
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          }

          if (currentMode === 'kitchen_sink') {
            return (
              <ThemeKitchenSink
                onExit={() => setCurrentMode('practice')}
                currentActiveTheme={theme}
                onSelectActiveTheme={(newTheme) => {
                  setTheme(newTheme);
                  applyThemeToDOM(newTheme);
                  LocalStorageManager.savePreferences({ theme: newTheme });
                }}
              />
            );
          }

          return null;
        })()}
      </main>

      {/* Database Manager Modal */}
      <DatabaseManagerModal
        isOpen={isDatabaseManagerOpen}
        onClose={() => setIsDatabaseManagerOpen(false)}
        databases={databases}
        activeDatabaseId={filters.database_id}
        onSelectDatabase={handleSelectDatabase}
        onAddDatabase={handleAddDatabase}
        onRenameDatabase={handleRenameDatabase}
        onDeleteDatabase={handleDeleteDatabase}
        onRestoreDefault={handleRestoreDefaultDatabases}
        onRestoreBackupSuccess={() => {
          setDatabases(LocalStorageManager.getDatabases());
          setCurrentIndex(0);
        }}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* App Info & PWA Install Modal */}
      <AppInfoModal
        isOpen={isAppInfoOpen}
        onClose={() => setIsAppInfoOpen(false)}
        totalQuestions={questions.length}
        isDevUser={isDevUser}
        onOpenKitchenSink={() => {
          setIsAppInfoOpen(false);
          setCurrentMode('kitchen_sink');
        }}
      />

      {/* Full-Screen Blur Pause Overlay */}
      <PauseOverlay
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
      />

      {/* User Account, Profile & Storage Manager Modal */}
      <UserAccountModal
        isOpen={isUserAccountModalOpen}
        onClose={() => setIsUserAccountModalOpen(false)}
        account={userAccount}
        onUpdateAccount={setUserAccount}
        stats={stats}
      />

      {/* Duolingo-style XP Performance & Daily Goals Panel */}
      <XPPerformanceModal
        isOpen={isXPPerformanceOpen}
        onClose={() => setIsXPPerformanceOpen(false)}
        stats={stats}
        onUpdateGoal={(newGoal) => {
          const updated = LocalStorageManager.setDailyGoalXP(newGoal);
          setStats(updated);
        }}
      />
    </div>
  );
}
