/**
 * Memoriz - High Performance Offline Learning & Question Bank Application
 * Minimalist AI Studio Interface with Collapsible Sidebar & Fast Inverted Index
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  ThemeMode
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
  
  // 2. Navigation, Pause & View State
  const [currentMode, setCurrentMode] = useState<StudyMode>('practice');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isDatabaseManagerOpen, setIsDatabaseManagerOpen] = useState<boolean>(false);
  const [isAppInfoOpen, setIsAppInfoOpen] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

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

  // Apply HTML Theme Attribute synchronously
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

  // Handler: Answer Submission (synchronizes across all twin questions)
  const handleAnswer = useCallback((letter: string, timeSpentSeconds: number, answeredStrikes?: string[]) => {
    if (!currentQuestion) return;

    const isCorrect = letter === currentQuestion.resolution.deduced_answer;
    const earnedXP = isCorrect ? 15 : 5;
    const twinIds = twinMap.get(currentQuestion.sequence_id) || [currentQuestion.sequence_id];
    const strikesToSave = answeredStrikes !== undefined ? answeredStrikes : (strikes[currentQuestion.sequence_id] || []);

    // Record answer for current question and all its twins
    const record: UserAnswerRecord = {
      question_id: currentQuestion.sequence_id,
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
    const updatedStats = LocalStorageManager.addXP(earnedXP, isCorrect, currentQuestion.metadata.subject);
    setStats(updatedStats);

    // Auto-update SRS for current question and all twins
    const existingSRS = srsItems[currentQuestion.sequence_id];
    const defaultRating: SRSRating = isCorrect ? 2 : 1;
    const updatedSRS = calculateNextSRS(existingSRS, defaultRating, currentQuestion.sequence_id);
    const newSRSItems = LocalStorageManager.saveSRSItem(updatedSRS, twinIds);
    setSRSItems(newSRSItems);
  }, [currentQuestion, currentMode, srsItems, twinMap, strikes]);

  // Handler: Rate SRS manually (synchronizes twins)
  const handleRateSRS = useCallback((rating: SRSRating) => {
    if (!currentQuestion) return;
    const twinIds = twinMap.get(currentQuestion.sequence_id) || [currentQuestion.sequence_id];
    const existingSRS = srsItems[currentQuestion.sequence_id];
    const updated = calculateNextSRS(existingSRS, rating, currentQuestion.sequence_id);
    const newSRSItems = LocalStorageManager.saveSRSItem(updated, twinIds);
    setSRSItems(newSRSItems);
  }, [currentQuestion, srsItems, twinMap]);

  // Handler: Toggle Bookmark (synchronizes twins)
  const handleToggleBookmark = useCallback(() => {
    if (!currentQuestion) return;
    const twinIds = twinMap.get(currentQuestion.sequence_id) || [currentQuestion.sequence_id];
    const newBookmarks = LocalStorageManager.toggleBookmark(currentQuestion.sequence_id, '', [], twinIds);
    setBookmarks(newBookmarks);
  }, [currentQuestion, twinMap]);

  // Handler: Save Personal Note (synchronizes twins)
  const handleSaveNote = useCallback((note: string) => {
    if (!currentQuestion) return;
    const twinIds = twinMap.get(currentQuestion.sequence_id) || [currentQuestion.sequence_id];
    const newBookmarks = LocalStorageManager.updateBookmarkNote(currentQuestion.sequence_id, note, twinIds);
    setBookmarks(newBookmarks);
  }, [currentQuestion, twinMap]);

  // Handler: Option Strike (synchronizes twins)
  const handleToggleStrike = useCallback((letter: string) => {
    if (!currentQuestion) return;
    const twinIds = twinMap.get(currentQuestion.sequence_id) || [currentQuestion.sequence_id];
    const newStrikes = LocalStorageManager.toggleOptionStrike(currentQuestion.sequence_id, letter, twinIds);
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

      if (e.key === 'Escape') {
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
  }, [filteredQuestions.length, handleToggleBookmark]);

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
        errorCount={errorCount}
        srsDueCount={srsDueCount}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(open => !open)}
        filters={filters}
        currentQuestionIndex={currentIndex}
        totalQuestions={filteredQuestions.length}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(p => !p)}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* VIEW 1: PRÁTICA DE QUESTÕES COM SPLIT-SCREEN INTELIGENTE */}
        {currentMode === 'practice' && (
          <div className={currentQuestion?.associated_context?.has_associated_context ? "w-full space-y-4" : "max-w-4xl mx-auto w-full space-y-4"}>
            
            {/* Minimalist Question Header / Filter Status Bar - Aligned with Question Block */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs text-slate-500 dark:text-slate-400 w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Questão {filteredQuestions.length > 0 ? currentIndex + 1 : 0} de {filteredQuestions.length}
                </span>
                {hasActiveFilters && (
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
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
                    className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                  >
                    <FilterX className="w-3 h-3" />
                    <span>Limpar filtros</span>
                  </button>
                )}
                <button
                  id="open-filters-sidebar-btn"
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-md transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Filtrar e Navegar (Ctrl+B)</span>
                  <span className="sm:hidden">Filtrar / Menu</span>
                </button>
              </div>
            </div>

            {/* Questions View */}
            {filteredQuestions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-10 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg flex items-center justify-center mx-auto text-xl font-bold">
                  ∅
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                  Nenhuma questão encontrada
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
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
        )}

        {/* VIEW 2: MODO SRS REPETIÇÃO ESPAÇADA */}
        {currentMode === 'srs' && (
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
        )}

        {/* VIEW 3: CADERNO DE ERROS AUTOMÁTICO */}
        {currentMode === 'error_notebook' && (
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
          />
        )}

        {/* VIEW 4: MODO SIMULADO COM CRONÔMETRO */}
        {currentMode === 'simulado' && (
          <SimuladoView
            questions={questions}
            isPaused={isQuestionTimerPaused}
            onRecordSimuladoResult={(result) => {
              LocalStorageManager.saveSimulado(result);
              for (const [qidStr, ans] of Object.entries(result.answers) as [string, { selected: string; correct: string; is_correct: boolean }][]) {
                // If question was left blank / unanswered in simulado, do NOT record as wrong answer or send to error notebook
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
        )}

        {/* VIEW 5: DASHBOARD DE MÉTRICAS & RETENÇÃO */}
        {currentMode === 'metrics' && (
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
        )}
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
      />

      {/* Full-Screen Blur Pause Overlay */}
      <PauseOverlay
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
      />
    </div>
  );
}
