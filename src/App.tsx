/**
 * Memoriz - High Performance Offline Learning & Question Bank Application
 * Minimalist AI Studio Interface with Collapsible Sidebar & Fast Inverted Index
 */

import React, { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'react';
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
import { CarouselDiagnosticOverlay } from './components/CarouselDiagnosticOverlay';
import { DraggableModeSwitcher } from './components/DraggableModeSwitcher';
import { SlidersHorizontal, FilterX } from 'lucide-react';
import { runCarouselDiagnostic } from './lib/carouselDiagnosticProbe';
import { 
  auth, 
  onAuthStateChanged, 
  syncUserDataToFirestore, 
  loadUserDataFromFirestore 
} from './lib/firebase';

const MODE_KEYS: StudyMode[] = ['practice', 'srs', 'error_notebook', 'simulado', 'metrics'];

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

  // Verificação de ambiente local de desenvolvimento (sem dados pessoais ou e-mails hardcoded)
  const isDevEnvironment = Boolean(
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  );
  const isDevUser = isDevEnvironment;
  
  // 2. Navigation, Pause & View State
  const [currentMode, setCurrentMode] = useState<StudyMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (isDevEnvironment && (params.get('mode') === 'kitchen_sink' || params.has('kitchen_sink') || params.get('dev') === 'themes')) {
        return 'kitchen_sink';
      }
    }
    return 'practice';
  });

  // Scroll positions per study mode to preserve reading position when switching between modes
  const modeScrollPositionsRef = useRef<Record<string, number>>({
    practice: 0,
    srs: 0,
    errors: 0,
    simulado: 0,
    metrics: 0,
    kitchen_sink: 0,
  });
  const isRestoringScrollRef = useRef(false);
  const currentModeRef = useRef<StudyMode>(currentMode);
  currentModeRef.current = currentMode;

  // Canonical mode switcher that records exiting scroll position and sets new mode
  const handleSelectMode = useCallback((newMode: StudyMode) => {
    if (newMode === currentModeRef.current) return;
    const currentY = window.scrollY || document.documentElement.scrollTop || 0;
    modeScrollPositionsRef.current[currentModeRef.current] = currentY;
    setCurrentMode(newMode);
  }, []);

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
  const rightVeilRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [slideHeights, setSlideHeights] = useState<number[]>([0, 0, 0, 0, 0]);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Trigger diagnostic reporting only in local development environment
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

  // Measure initial container width synchronously before paint
  useLayoutEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;
    const w = Math.round(container.getBoundingClientRect().width || container.clientWidth || 0);
    if (w > 0) {
      setContainerWidth(w);
    }
  }, []);

  // Handle drag progress from top mode switcher (syncs pages in 1:1 real-time lockstep via translateX)
  const handleModeDragProgress = useCallback((dragProgress: { activeIndex: number; offsetFraction: number; isDragging: boolean }) => {
    if (dragProgress.isDragging) {
      if (!modeDragProgress?.isDragging) {
        // At the very start of dragging, snapshot current mode scroll position
        const currentY = window.scrollY || document.documentElement.scrollTop || 0;
        modeScrollPositionsRef.current[currentModeRef.current] = currentY;
      }
      setModeDragProgress(dragProgress);
    } else {
      setModeDragProgress(null);
    }
  }, [modeDragProgress?.isDragging]);

  // Track active scrolling to continuously record scroll position per mode
  useEffect(() => {
    const handleScroll = () => {
      if (isRestoringScrollRef.current) return;
      if (isModeTransitioning) return;
      if (modeDragProgress?.isDragging) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      modeScrollPositionsRef.current[currentModeRef.current] = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isModeTransitioning, modeDragProgress?.isDragging]);

  // Reset scroll to top when changing question inside practice mode
  useEffect(() => {
    if (currentMode === 'practice') {
      modeScrollPositionsRef.current['practice'] = 0;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [currentIndex, currentMode]);

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUserAccount((prev) => {
          if (prev.provider !== 'google' || prev.id !== firebaseUser.uid || prev.email !== firebaseUser.email) {
            const updated: UserAccount = {
              ...prev,
              id: firebaseUser.uid,
              name: prev.name || firebaseUser.displayName || 'Estudante',
              email: firebaseUser.email || prev.email || '',
              avatar: prev.avatar || firebaseUser.photoURL || '🎯',
              provider: 'google',
              isCloudSyncEnabled: true,
              lastLoginAt: new Date().toISOString(),
            };
            LocalStorageManager.saveUserAccount(updated);
            return updated;
          }
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Background debounce sync to Firestore when user is authenticated with Google
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (auth.currentUser && userAccount.provider === 'google' && userAccount.isCloudSyncEnabled) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        if (auth.currentUser) {
          syncUserDataToFirestore(auth.currentUser, userAccount, {
            stats,
            srsItems,
            answers,
            bookmarks,
          }).catch((err) => {
            console.warn('Background Firestore sync error:', err);
          });
        }
      }, 3000);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [answers, srsItems, bookmarks, stats, userAccount]);

  // Track mode transitions to restore scroll position per mode and animate container height
  useEffect(() => {
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

      // 3. Immediately scroll and reinforce after next frame for flawless synchronization
      window.scrollTo({ top: targetScroll, behavior: 'instant' });

      const rafId = requestAnimationFrame(() => {
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
      });

      const timer = setTimeout(() => {
        setIsModeTransitioning(false);
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
        // Unlock scroll listener after transition settles
        setTimeout(() => {
          isRestoringScrollRef.current = false;
        }, 80);
      }, 320);

      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timer);
      };
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

  // Derived Map of latest answers per question (respects content_hash and database isolation)
  const lastAnswerMap = useMemo(() => {
    const rawMap: Record<number, UserAnswerRecord> = {};
    const hashToAnswerMap = new Map<string, UserAnswerRecord>();

    for (const [qidStr, recordList] of Object.entries(answers) as [string, UserAnswerRecord[]][]) {
      const qid = Number(qidStr);
      if (recordList && recordList.length > 0) {
        const latest = recordList[recordList.length - 1];
        if (latest.content_hash) {
          hashToAnswerMap.set(latest.content_hash, latest);
        }
        rawMap[qid] = latest;
      }
    }

    const verifiedMap: Record<number, UserAnswerRecord> = {};
    for (const q of questions) {
      const qHash = getQuestionContentHash(q);
      const answerByHash = hashToAnswerMap.get(qHash);
      if (answerByHash) {
        verifiedMap[q.sequence_id] = { ...answerByHash, question_id: q.sequence_id };
      } else if (rawMap[q.sequence_id]) {
        const directAns = rawMap[q.sequence_id];
        // If direct answer record has a content_hash, only match if it matches this question's hash
        if (directAns.content_hash) {
          if (directAns.content_hash === qHash) {
            verifiedMap[q.sequence_id] = directAns;
          }
        } else {
          // Legacy records without content_hash: only match if database matches
          const qDb = q.database_id || 'default_main';
          const ansDb = directAns.database_id || 'default_main';
          if (qDb === ansDb) {
            verifiedMap[q.sequence_id] = directAns;
          }
        }
      }
    }

    return verifiedMap;
  }, [answers, questions]);

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

  // Measure individual slide heights precisely with scroll capture immunity for dynamic height transition
  useEffect(() => {
    const container = carouselContainerRef.current;
    if (!container) return;

    let isScrolling = false;
    let scrollDebounceTimer: number | null = null;

    const updateDimensions = (force = false) => {
      // Never perform layout recalculations during active vertical page scrolling
      if (isScrolling && !force) return;

      const w = Math.round(container.getBoundingClientRect().width || container.clientWidth || 0);
      if (w > 0) {
        setContainerWidth(prev => (prev !== w ? w : prev));
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

    const handleWindowResize = () => {
      updateDimensions(true);
    };
    window.addEventListener('resize', handleWindowResize, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleWindowResize, { passive: true });
    }

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
      content_hash: getQuestionContentHash(q),
      database_id: q.database_id || 'default_main',
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
        handleSelectMode(currentMode === 'kitchen_sink' ? 'practice' : 'kitchen_sink');
        return;
      }

      if (e.key === 'Escape') {
        if (currentMode === 'kitchen_sink') {
          handleSelectMode('practice');
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

  // Persistent timer tracking for unanswered questions in Practice mode (never resets when navigating)
  const [unansweredTimes, setUnansweredTimes] = useState<Record<number, number>>({});

  // Base pause state whenever screen is paused or any modal is open
  const isBasePaused = isPaused || isSidebarOpen || isShortcutsOpen || isDatabaseManagerOpen || isXPPerformanceOpen || currentMode === 'kitchen_sink';

  // Separate pause flags for each individual mode/page (so timers immediately pause when switching to another mode!)
  const isPracticeTimerPaused = isBasePaused || currentMode !== 'practice';
  const isSRSTimerPaused = isBasePaused || currentMode !== 'srs';
  const isErrorTimerPaused = isBasePaused || currentMode !== 'error_notebook';
  const isSimuladoTimerPaused = isBasePaused || currentMode !== 'simulado';

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
    <div className="min-h-[100vh] min-h-[100dvh] flex flex-col">
      {/* Top Minimalist Header */}
      <Header
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
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
        onOpenKitchenSink={() => handleSelectMode('kitchen_sink')}
        modeDragProgress={modeDragProgress}
        onModeDragProgress={handleModeDragProgress}
      />

      {/* Collapsible Sidebar Drawer with Filters & Nav */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        currentMode={currentMode}
        onSelectMode={handleSelectMode}
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
          handleSelectMode('kitchen_sink');
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

      {/* Main Content Area with CSS Scroll Snap Horizontal Carousel */}
      <main className="flex-1 max-w-7xl w-full mx-auto pt-4 sm:pt-6 lg:pt-8 pb-24 lg:pb-8">
        {(() => {
          const isCarouselMode = MODE_KEYS.includes(currentMode);
          const activeModeIndex = Math.max(0, MODE_KEYS.indexOf(currentMode));
          
          // Continuous proportional position for height interpolation during real-time scrolling/dragging
          const continuousPos = modeDragProgress?.isDragging
            ? Math.max(0, Math.min(MODE_KEYS.length - 1, modeDragProgress.activeIndex + modeDragProgress.offsetFraction))
            : activeModeIndex;

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

          const targetScrollForActiveMode = modeScrollPositionsRef.current[currentMode] || 0;
          const neededMinHeight = targetScrollForActiveMode > 0
            ? targetScrollForActiveMode + (typeof window !== 'undefined' ? window.innerHeight : 800)
            : undefined;

          const isDragging = !!modeDragProgress?.isDragging;
          const heightTransition = isDragging
            ? 'none'
            : isModeTransitioning
            ? 'height 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)'
            : 'none';

          // Exact pixel calculations to prevent any subpixel rounding overlap/drift
          const pixelOffset = containerWidth > 0 ? -Math.round(continuousPos * containerWidth) : 0;
          const slideWidthStyle = containerWidth > 0 ? `${containerWidth}px` : '100%';
          const trackWidthStyle = containerWidth > 0 ? `${MODE_KEYS.length * containerWidth}px` : '500%';

          if (isCarouselMode) {
            return (
              <div className="relative w-full">
                {/* Fixed visual lateral strips (veil) matching app background on top of carousel content */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-4 sm:w-6 lg:w-8 bg-canvas theme-bg-canvas z-20 pointer-events-none" 
                  aria-hidden="true"
                />
                <div 
                  ref={rightVeilRef}
                  className="absolute right-0 top-0 bottom-0 w-4 sm:w-6 lg:w-8 bg-canvas theme-bg-canvas z-20 pointer-events-none" 
                  aria-hidden="true"
                />

                <div 
                  ref={carouselContainerRef}
                  className="w-full bg-canvas theme-bg-canvas"
                  style={{
                    overflow: 'hidden',
                    height: dynamicContainerHeight > 0 ? `${dynamicContainerHeight}px` : undefined,
                    minHeight: neededMinHeight ? `${neededMinHeight}px` : undefined,
                    transition: heightTransition,
                  }}
                >
                  <div
                    className="flex items-start flex-nowrap"
                    style={{
                      width: trackWidthStyle,
                      transform: (pixelOffset !== 0 || isDragging || isModeTransitioning) ? `translate3d(${pixelOffset}px, 0, 0)` : undefined,
                      willChange: (isDragging || isModeTransitioning) ? 'transform' : 'auto',
                      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                  >
                    {/* SLIDE 0: PRÁTICA DE QUESTÕES COM SPLIT-SCREEN INTELIGENTE */}
                    <div 
                      ref={el => { slideRefs.current[0] = el; }}
                      className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8" 
                      style={{
                        width: slideWidthStyle,
                        minWidth: slideWidthStyle,
                        maxWidth: slideWidthStyle,
                        flexShrink: 0,
                        boxSizing: 'border-box',
                      }}
                    >
                    <div className={currentQuestion?.associated_context?.has_associated_context ? "w-full space-y-4" : "max-w-4xl mx-auto w-full space-y-4"}>
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
                          {/* Left Split: Associated Context Panel (Sticky on desktop so it scrolls along with the question view) */}
                          {currentQuestion.associated_context?.has_associated_context && (
                            <div className="lg:col-span-5 lg:sticky lg:top-14 lg:max-h-[calc(100vh-4rem)] lg:max-h-[calc(100dvh-4rem)]">
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
                              isPaused={isPracticeTimerPaused}
                              initialElapsedSeconds={unansweredTimes[currentQuestion.sequence_id] || 0}
                              onUpdateElapsedSeconds={(secs) => {
                                setUnansweredTimes(prev => {
                                  if (prev[currentQuestion.sequence_id] === secs) return prev;
                                  return { ...prev, [currentQuestion.sequence_id]: secs };
                                });
                              }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* SLIDE 1: MODO SRS REPETIÇÃO ESPAÇADA */}
                  <div 
                    ref={el => { slideRefs.current[1] = el; }}
                    className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8" 
                    style={{
                      width: slideWidthStyle,
                      minWidth: slideWidthStyle,
                      maxWidth: slideWidthStyle,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    <SRSModeView
                      questions={questions}
                      srsItems={srsItems}
                      isPaused={isSRSTimerPaused}
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
                      onExit={() => handleSelectMode('practice')}
                    />
                  </div>

                  {/* SLIDE 2: CADERNO DE ERROS AUTOMÁTICO */}
                  <div 
                    ref={el => { slideRefs.current[2] = el; }}
                    className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8" 
                    style={{
                      width: slideWidthStyle,
                      minWidth: slideWidthStyle,
                      maxWidth: slideWidthStyle,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
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
                        handleSelectMode('practice');
                        const targetHash = getQuestionContentHash(q);
                        const idx = filteredQuestions.findIndex(item => item.sequence_id === q.sequence_id || getQuestionContentHash(item) === targetHash);
                        setCurrentIndex(idx >= 0 ? idx : 0);
                      }}
                      onExit={() => handleSelectMode('practice')}
                      onAnswerQuestion={handleAnswer}
                      srsItems={srsItems}
                      onRateSRS={handleRateSRS}
                      bookmarks={bookmarks}
                      onToggleBookmark={handleToggleBookmark}
                      onSaveNote={handleSaveNote}
                      strikes={strikes}
                      onToggleStrike={handleToggleStrike}
                      isPaused={isErrorTimerPaused}
                      isPageSettled={currentMode === 'errors' && !modeDragProgress?.isDragging && !isModeTransitioning}
                    />
                  </div>

                  {/* SLIDE 3: MODO SIMULADO COM CRONÔMETRO */}
                  <div 
                    ref={el => { slideRefs.current[3] = el; }}
                    className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8" 
                    style={{
                      width: slideWidthStyle,
                      minWidth: slideWidthStyle,
                      maxWidth: slideWidthStyle,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    <SimuladoView
                      questions={questions}
                      isPaused={isSimuladoTimerPaused}
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
                      onExit={() => handleSelectMode('practice')}
                    />
                  </div>

                  {/* SLIDE 4: DASHBOARD DE MÉTRICAS & RETENÇÃO */}
                  <div 
                    ref={el => { slideRefs.current[4] = el; }}
                    className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8" 
                    style={{
                      width: slideWidthStyle,
                      minWidth: slideWidthStyle,
                      maxWidth: slideWidthStyle,
                      flexShrink: 0,
                      boxSizing: 'border-box',
                    }}
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
                        setUnansweredTimes({});
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (currentMode === 'kitchen_sink') {
          return (
            <div className="px-4 sm:px-6 lg:px-8">
              <ThemeKitchenSink
                onExit={() => handleSelectMode('practice')}
                currentActiveTheme={theme}
                onSelectActiveTheme={(newTheme) => {
                  setTheme(newTheme);
                  applyThemeToDOM(newTheme);
                  LocalStorageManager.savePreferences({ theme: newTheme });
                }}
              />
            </div>
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
          handleSelectMode('kitchen_sink');
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

      {/* Mobile iOS-style Floating Bottom Mode Switcher Bar (< lg / iPhone & compact style) */}
      <nav 
        aria-label="Navegação de modos de estudo"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-transparent pointer-events-none pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 select-none flex justify-center"
      >
        <div className="w-full max-w-md pointer-events-auto rounded-2xl shadow-xl bg-surface/90 backdrop-blur-xl border border-border">
          <DraggableModeSwitcher
            variant="bottom-bar"
            currentMode={currentMode}
            onSelectMode={handleSelectMode}
            srsDueCount={srsDueCount}
            errorCount={errorCount}
            dragProgress={modeDragProgress}
            onDragProgress={handleModeDragProgress}
          />
        </div>
      </nav>

      {/* Real-time Carousel Diagnostic Tooling & Overlay (Oculto por padrão; ativado apenas com parâmetro explícito ?diag=1) */}
      {isDevEnvironment && typeof window !== 'undefined' && window.location.search.includes('diag=1') && (
        <CarouselDiagnosticOverlay
          containerWidth={containerWidth}
          carouselContainerRef={carouselContainerRef}
          slideRefs={slideRefs}
          rightVeilRef={rightVeilRef}
          currentMode={currentMode}
        />
      )}
    </div>
  );
}
