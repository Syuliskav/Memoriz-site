/**
 * Memoriz - High Performance Offline Learning & Question Bank Application
 * Minimalist AI Studio Interface with Collapsible Sidebar & Fast Inverted Index
 */

import React from 'react';
import { LocalStorageManager } from './lib/storage';
import { getQuestionContentHash } from './lib/duplicateEngine';
import { applyThemeToDOM } from './hooks/useTheme';

// Custom Dedicated Hooks
import { useTheme } from './hooks/useTheme';
import { useStudyCarousel, MODE_KEYS } from './hooks/useStudyCarousel';
import { useModeScrollMemory } from './hooks/useModeScrollMemory';
import { useUserAccount } from './hooks/useUserAccount';
import { useStudyData } from './hooks/useStudyData';
import { useModals } from './hooks/useModals';

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

export default function App() {
  // Verificação de ambiente local de desenvolvimento (sem dados pessoais ou e-mails hardcoded)
  const isDevEnvironment = Boolean(
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  );
  const isDevUser = isDevEnvironment;

  // 1. Theme Management Hook
  const { theme, setTheme, handleToggleTheme } = useTheme();

  // 2. Study Carousel & Modes Navigation Hook
  const {
    currentMode,
    handleSelectMode,
    modeDragProgress,
    handleModeDragProgress,
    isModeTransitioning,
    setIsModeTransitioning,
    isDragging,
    carouselContainerRef,
    rightVeilRef,
    slideRefs,
    containerWidth,
    isCarouselMode,
    dynamicContainerHeight,
    heightTransition,
    pixelOffset,
    slideWidthStyle,
    trackWidthStyle,
  } = useStudyCarousel({
    isDevEnvironment,
    onBeforeModeChange: (mode) => {
      snapshotCurrentScroll(mode);
    },
  });

  // 3. Question Bank, Filters, Search & Progress State Hook
  const {
    databases,
    setDatabases,
    questions,
    answers,
    srsItems,
    bookmarks,
    strikes,
    stats,
    unansweredTimes,
    filters,
    setFilters,
    currentIndex,
    setCurrentIndex,
    searchEngine,
    twinMap,
    lastAnswerMap,
    filteredQuestions,
    currentQuestion,
    subjectCounts,
    statusCounts,
    errorCount,
    srsDueCount,
    totalPoolUniqueQuestions,
    handleAnswer,
    handleRateSRS,
    handleToggleBookmark,
    handleSaveNote,
    handleToggleStrike,
    handleSetStrikes,
    handleSelectDatabase,
    handleAddDatabase,
    handleRenameDatabase,
    handleDeleteDatabase,
    handleRestoreDefaultDatabases,
    handleRecordSimuladoResult,
    handleSaveSRSFromView,
    handleRecordSRSAnswer,
    handleResetAllProgress,
    handleUpdateElapsedSeconds,
    handleUpdateDailyGoalXP,
  } = useStudyData({ currentMode });

  // 4. Scroll Memory Per Study Mode Hook
  const { modeScrollPositionsRef, snapshotCurrentScroll } = useModeScrollMemory({
    currentMode,
    currentIndex,
    isDragging,
    isModeTransitioning,
    setIsModeTransitioning,
  });

  // 5. User Account & Cloud Synchronization Hook
  const { userAccount, setUserAccount } = useUserAccount({
    stats,
    srsItems,
    answers,
    bookmarks,
  });

  // 6. Modal Windows & Keyboard Shortcuts Hook
  const {
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
    isPracticeTimerPaused,
    isSRSTimerPaused,
    isErrorTimerPaused,
    isSimuladoTimerPaused,
  } = useModals({
    currentMode,
    onSelectMode: handleSelectMode,
    filteredQuestionsLength: filteredQuestions.length,
    onNavigatePrevQuestion: () => setCurrentIndex(i => Math.max(0, i - 1)),
    onNavigateNextQuestion: () => setCurrentIndex(i => Math.min(filteredQuestions.length - 1, i + 1)),
    onToggleBookmark: () => handleToggleBookmark(),
  });

  const targetScrollForActiveMode = modeScrollPositionsRef.current[currentMode] || 0;
  const neededMinHeight = targetScrollForActiveMode > 0
    ? targetScrollForActiveMode + (typeof window !== 'undefined' ? window.innerHeight : 800)
    : undefined;

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
      <main className="flex-1 max-w-7xl w-full mx-auto pt-0 pb-24 lg:pb-8">
        {(() => {
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
                  onScroll={(e) => { e.currentTarget.scrollLeft = 0; }}
                  className="w-full bg-canvas theme-bg-canvas"
                  style={{
                    overflow: 'hidden',
                    overflowX: 'hidden',
                    height: dynamicContainerHeight > 0 ? `${dynamicContainerHeight}px` : undefined,
                    minHeight: neededMinHeight ? `${neededMinHeight}px` : undefined,
                    transition: heightTransition,
                  }}
                >
                  <div
                    className="flex items-start flex-nowrap"
                    style={{
                      width: trackWidthStyle,
                      transform: `translate3d(${pixelOffset}px, 0, 0)`,
                      willChange: (isDragging || isModeTransitioning) ? 'transform' : 'auto',
                      transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
                    }}
                  >
                    {/* SLIDE 0: PRÁTICA DE QUESTÕES COM SPLIT-SCREEN INTELIGENTE */}
                    <div 
                      ref={el => { slideRefs.current[0] = el; }}
                      className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4" 
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
                            {/* Left Split: Associated Context Panel (Sticky on desktop) */}
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
                                  handleUpdateElapsedSeconds(currentQuestion.sequence_id, secs);
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
                      className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4" 
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
                        onSaveSRS={handleSaveSRSFromView}
                        onRecordAnswer={handleRecordSRSAnswer}
                        streakDays={stats.streak_days}
                        onExit={() => handleSelectMode('practice')}
                      />
                    </div>

                    {/* SLIDE 2: CADERNO DE ERROS AUTOMÁTICO */}
                    <div 
                      ref={el => { slideRefs.current[2] = el; }}
                      className="shrink-0 bg-canvas theme-bg-canvas px-0 pt-0" 
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
                        onSetStrikes={handleSetStrikes}
                        isPaused={isErrorTimerPaused}
                        isPageSettled={currentMode === 'error_notebook' && !modeDragProgress?.isDragging && !isModeTransitioning}
                      />
                    </div>

                    {/* SLIDE 3: MODO SIMULADO COM CRONÔMETRO */}
                    <div 
                      ref={el => { slideRefs.current[3] = el; }}
                      className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4" 
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
                        lastAnswers={answers}
                        isPaused={isSimuladoTimerPaused}
                        onRecordSimuladoResult={handleRecordSimuladoResult}
                        onExit={() => handleSelectMode('practice')}
                      />
                    </div>

                    {/* SLIDE 4: DASHBOARD DE MÉTRICAS & RETENÇÃO */}
                    <div 
                      ref={el => { slideRefs.current[4] = el; }}
                      className="shrink-0 bg-canvas theme-bg-canvas px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4" 
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
                        onResetProgress={handleResetAllProgress}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (currentMode === 'kitchen_sink') {
            return (
              <div className="px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4">
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
        onNavigateToMetrics={() => handleSelectMode('metrics')}
      />

      {/* XP Performance & Daily Goals Panel */}
      <XPPerformanceModal
        isOpen={isXPPerformanceOpen}
        onClose={() => setIsXPPerformanceOpen(false)}
        stats={stats}
        onUpdateGoal={handleUpdateDailyGoalXP}
      />

      {/* Mobile Floating Bottom Mode Switcher Bar (< lg / compact style) */}
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
