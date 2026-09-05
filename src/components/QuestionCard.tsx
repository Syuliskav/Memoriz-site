import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Question, 
  SRSItem, 
  SRSRating, 
  UserBookmark, 
  UserAnswerRecord 
} from '../types/question';
import { 
  Bookmark, 
  Clock, 
  Check, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Scissors, 
  Sparkles,
  Tag,
  Building,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getMasteryPercentage, getMasteryBadge } from '../lib/srsEngine';
import { ResolutionSection } from './ResolutionSection';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalFiltered: number;
  onPrev: () => void;
  onNext: () => void;
  onAnswer: (letter: string, timeSpentSeconds: number, answeredStrikes?: string[]) => void;
  lastAnswer: UserAnswerRecord | undefined;
  srsItem: SRSItem | undefined;
  onRateSRS: (rating: SRSRating) => void;
  isBookmarked: boolean;
  bookmarkData: UserBookmark | undefined;
  onToggleBookmark: () => void;
  onSaveNote: (note: string) => void;
  strikes: string[];
  onToggleStrike: (letter: string) => void;
  onSetStrikes?: (letters: string[]) => void;
  isPaused?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalFiltered,
  onPrev,
  onNext,
  onAnswer,
  lastAnswer,
  srsItem,
  onRateSRS,
  isBookmarked,
  bookmarkData,
  onToggleBookmark,
  onSaveNote,
  strikes,
  onToggleStrike,
  onSetStrikes,
  isPaused = false,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [showResolution, setShowResolution] = useState<boolean>(false);
  // Review strikes when gabarito is hidden on an already answered question
  const [reviewStrikes, setReviewStrikes] = useState<string[]>([]);

  // Touch gesture & drag-to-strike state
  const [dragOffset, setDragOffset] = useState<{ letter: string; x: number } | null>(null);
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    letter: string;
    hasMovedHorizontal: boolean;
    hasMovedVertical: boolean;
    hasSwiped: boolean;
  } | null>(null);
  const swipedJustNowRef = useRef<boolean>(false);

  // Snapshot of strikes at the moment the answer was given
  const answeredStrikes = useMemo(() => {
    if (!lastAnswer) return [];
    if (lastAnswer.eliminated_options && Array.isArray(lastAnswer.eliminated_options)) {
      return lastAnswer.eliminated_options;
    }
    // Fallback for legacy answer records
    return strikes || [];
  }, [lastAnswer, strikes]);

  const isAnswered = !!lastAnswer;
  const isCorrect = isAnswered && lastAnswer.selected_letter === question.resolution.deduced_answer;
  const isShowingOfficialResolution = isAnswered && showResolution;

  // Active strikes to display:
  // 1. When official resolution is shown: immutable snapshot of strikes when answered
  // 2. When question is answered but resolution is hidden: independent review strikes
  // 3. When question is not yet answered: active strikes from parent
  const currentDisplayedStrikes = useMemo(() => {
    if (isShowingOfficialResolution) {
      return answeredStrikes;
    }
    if (isAnswered && !showResolution) {
      return reviewStrikes;
    }
    return strikes;
  }, [isShowingOfficialResolution, answeredStrikes, isAnswered, showResolution, reviewStrikes, strikes]);

  // Synchronize when question changes or answer is provided
  useEffect(() => {
    if (lastAnswer) {
      setSelectedLetter(lastAnswer.selected_letter);
      setShowResolution(true);
      setTimeElapsed(lastAnswer.time_spent_seconds || 0);
      setReviewStrikes([]);
    } else {
      setSelectedLetter('');
      setShowResolution(false);
      setTimeElapsed(0);
      setReviewStrikes([]);
    }
    setDragOffset(null);
  }, [question.sequence_id, lastAnswer]);

  // Question active timer (runs while question is not answered or when not paused)
  useEffect(() => {
    if (showResolution || !!lastAnswer || isPaused) return;
    const timer = setInterval(() => {
      setTimeElapsed(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showResolution, lastAnswer, question.sequence_id, isPaused]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStrike = (letter: string) => {
    if (isShowingOfficialResolution) return;

    if (isAnswered && !showResolution) {
      setReviewStrikes(prev => (prev.includes(letter) ? prev : [...prev, letter]));
    } else {
      if (!strikes.includes(letter)) {
        onToggleStrike(letter);
      }
    }

    if (selectedLetter === letter) {
      setSelectedLetter('');
    }
  };

  const handleUnstrike = (letter: string) => {
    if (isShowingOfficialResolution) return;

    if (isAnswered && !showResolution) {
      setReviewStrikes(prev => prev.filter(l => l !== letter));
    } else {
      if (strikes.includes(letter)) {
        onToggleStrike(letter);
      }
    }
  };

  const handleToggleStrikeOption = (letter: string) => {
    if (isShowingOfficialResolution) return;
    if (currentDisplayedStrikes.includes(letter)) {
      handleUnstrike(letter);
    } else {
      handleStrike(letter);
    }
  };

  const handleSubmit = () => {
    if (isAnswered) {
      // Re-reveal official resolution without overwriting previous history
      setSelectedLetter(lastAnswer.selected_letter);
      setShowResolution(true);
      return;
    }
    if (!selectedLetter) return;
    const finalTime = Math.max(1, timeElapsed);
    setShowResolution(true);
    // Pass currentDisplayedStrikes to be saved into the answer record permanently
    onAnswer(selectedLetter, finalTime, currentDisplayedStrikes);
  };

  const handleToggleResolution = () => {
    if (showResolution) {
      // Ocultar gabarito: clear selection and show clean original state with empty review strikes
      setShowResolution(false);
      setSelectedLetter('');
      setReviewStrikes([]);
    } else {
      // Ver gabarito comentado: restore snapshot at the moment they answered
      if (lastAnswer) {
        setSelectedLetter(lastAnswer.selected_letter);
      }
      setShowResolution(true);
      // currentDisplayedStrikes automatically resolves to answeredStrikes!
    }
  };

  // Touch gesture handlers for drag-to-strike
  const handleTouchStart = (e: React.TouchEvent, letter: string) => {
    if (isShowingOfficialResolution) return;
    const touch = e.touches[0];
    touchStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      letter,
      hasMovedHorizontal: false,
      hasMovedVertical: false,
      hasSwiped: false,
    };
  };

  const handleTouchMove = (e: React.TouchEvent, letter: string) => {
    if (!touchStateRef.current || touchStateRef.current.letter !== letter) return;
    if (isShowingOfficialResolution) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - touchStateRef.current.startX;
    const diffY = touch.clientY - touchStateRef.current.startY;

    // Detect horizontal swipe vs vertical scroll
    if (!touchStateRef.current.hasMovedHorizontal && !touchStateRef.current.hasMovedVertical) {
      if (Math.abs(diffX) > 8 && Math.abs(diffX) > Math.abs(diffY)) {
        touchStateRef.current.hasMovedHorizontal = true;
      } else if (Math.abs(diffY) > 8) {
        touchStateRef.current.hasMovedVertical = true;
        touchStateRef.current = null;
        setDragOffset(null);
        return;
      }
    }

    if (touchStateRef.current?.hasMovedHorizontal) {
      const clampedX = Math.max(-80, Math.min(80, diffX));
      setDragOffset({ letter, x: clampedX });
      if (Math.abs(diffX) >= 30) {
        touchStateRef.current.hasSwiped = true;
      }
    }
  };

  const handleTouchEnd = (letter: string, isStriked: boolean) => {
    const state = touchStateRef.current;
    touchStateRef.current = null;
    setDragOffset(null);

    if (!state || state.letter !== letter) return;

    if (state.hasSwiped) {
      swipedJustNowRef.current = true;
      setTimeout(() => {
        swipedJustNowRef.current = false;
      }, 350);

      // Swiped sideways: strike the option!
      if (!isStriked) {
        handleStrike(letter);
      }
    }
  };

  const handleTouchCancel = () => {
    touchStateRef.current = null;
    setDragOffset(null);
  };

  // Mouse & Click handlers (Right-click: strike, Left-click: unstrike or select)
  const handleContextMenu = (e: React.MouseEvent, letter: string, isStriked: boolean) => {
    e.preventDefault();
    if (isShowingOfficialResolution) return;

    if (!isStriked) {
      // Right click strikes
      handleStrike(letter);
    } else {
      // Right click on already striked unstrikes
      handleUnstrike(letter);
    }
  };

  const handleOptionClick = (letter: string, isStriked: boolean) => {
    if (swipedJustNowRef.current) return;
    if (isShowingOfficialResolution) return;

    if (isStriked) {
      // Left click / tap on striked option unstrikes (returns to original state)
      handleUnstrike(letter);
    } else {
      // Left click / tap on unstriked option selects it
      setSelectedLetter(letter);
    }
  };

  // Local card keyboard shortcuts (A-E to pick option, Enter to submit, G to toggle resolution)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const key = e.key.toUpperCase();
      if (!isShowingOfficialResolution && ['A', 'B', 'C', 'D', 'E'].includes(key)) {
        // Check if question has this option
        if (question.options.some(o => o.letter.toUpperCase() === key)) {
          e.preventDefault();
          setSelectedLetter(key);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (isAnswered && !showResolution) {
          handleToggleResolution();
        } else if (!isAnswered && selectedLetter) {
          handleSubmit();
        }
      } else if (isAnswered && (e.key.toLowerCase() === 'g')) {
        e.preventDefault();
        handleToggleResolution();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, showResolution, isShowingOfficialResolution, selectedLetter, timeElapsed, question.options, isPaused, lastAnswer]);

  return (
    <div className="theme-card border border-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
      
      {/* Harmonized Top Metadata Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        
        {/* Left: Clean Breadcrumb Metadata (No excessive bordered boxes) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <span className="font-semibold text-primary theme-text-primary bg-surface-subtle border border-border px-2.5 py-1 rounded-md">
            Questão #{question.sequence_id}
          </span>

          {question.database_name && (
            <>
              <span className="text-muted">•</span>
              <span className="text-muted theme-text-muted">
                Banco: <span className="font-medium text-primary theme-text-primary">{question.database_name}</span>
              </span>
            </>
          )}

          <span className="text-muted">•</span>
          <span className="font-medium text-secondary theme-text-secondary">
            {question.metadata.subject}
          </span>

          <span className="text-muted">•</span>
          <span className="text-muted theme-text-muted">
            {question.metadata.exam_board} • {question.metadata.year} • Cód: {question.metadata.reference_code}
          </span>
        </div>

        {/* Right: Standardized Timer & Bookmark */}
        <div className="flex items-center gap-2 text-xs">
          {/* Timer */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs transition-colors border ${
              isPaused 
                ? 'bg-amber-bg text-amber border-amber-border' 
                : 'text-secondary theme-text-secondary bg-surface-subtle border-border'
            }`}
            title={isPaused ? "Cronômetro pausado (Pressione Espaço para retomar)" : "Tempo decorrido nesta questão (Pressione Espaço para pausar)"}
          >
            <Clock className={`w-3.5 h-3.5 ${isPaused ? 'text-amber animate-pulse' : 'text-muted'}`} />
            <span>{formatTimer(timeElapsed)}</span>
            {isPaused && <span className="text-[10px] font-sans font-medium opacity-80">(pausado)</span>}
          </div>

          {/* Bookmark Button */}
          <button
            id="toggle-bookmark-btn"
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-md transition-colors cursor-pointer border ${
              isBookmarked
                ? 'bg-amber-bg text-amber border-amber-border'
                : 'bg-surface-subtle text-muted hover:text-primary border-border'
            }`}
            title="Marcar questão para revisar depois (M)"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber text-amber' : ''}`} />
          </button>
        </div>
      </div>

      {/* Unified Secondary Metadata Row (Órgão, Cargo, Tópicos) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted theme-text-muted">
        <span>
          Órgão: <span className="font-medium text-secondary theme-text-secondary">{question.metadata.institution}</span>
        </span>
        <span>•</span>
        <span>
          Cargo: <span className="font-medium text-secondary theme-text-secondary">{question.metadata.role}</span>
        </span>
        {question.metadata.topics?.length > 0 && (
          <>
            <span>•</span>
            <span>
              Tópico: <span className="font-medium text-secondary theme-text-secondary">{question.metadata.topics.join(' • ')}</span>
            </span>
          </>
        )}
      </div>

      {/* Question Stem (Enunciado / Assertivas) - Clean, document-like typography */}
      <div 
        id="question-stem-text"
        className="text-primary theme-text-primary text-base leading-relaxed whitespace-pre-line font-medium"
      >
        {question.stem.full_text}
      </div>

      {/* Options Header Hint */}
      <div className="flex items-center justify-between text-[11px] text-muted theme-text-muted pb-0.5 px-0.5">
        <span className="font-semibold text-secondary theme-text-secondary">Alternativas</span>
        {!isShowingOfficialResolution && (
          <span className="text-[11px] flex items-center gap-1 text-muted">
            <span className="hidden sm:inline">Botão direito: riscar • Botão esquerdo: selecionar / desriscar</span>
            <span className="sm:hidden">Arraste pro lado para riscar • Toque para desriscar</span>
          </span>
        )}
      </div>

      {/* Options List - Sleek, minimalist IDE / Document items with Touch Drag & Mouse elimination */}
      <div className="space-y-2.5 pt-0.5">
        {question.options.map((opt) => {
          const isSelected = selectedLetter === opt.letter;
          const isStriked = currentDisplayedStrikes.includes(opt.letter);
          const isCorrectOption = opt.letter === question.resolution.deduced_answer;
          const isBeingDragged = dragOffset?.letter === opt.letter;
          const currentDragX = isBeingDragged ? dragOffset.x : 0;
          
          let cardStyle = 'theme-card hover:border-[var(--theme-border-hover)] text-primary theme-text-primary';
          
          if (isShowingOfficialResolution) {
            if (isCorrectOption) {
              cardStyle = 'theme-option-correct font-medium';
            } else if (lastAnswer?.selected_letter === opt.letter && !isCorrect) {
              cardStyle = 'theme-option-wrong font-medium';
            } else {
              cardStyle = 'opacity-40 theme-card-subtle text-muted';
            }
          } else if (isSelected) {
            cardStyle = 'theme-option-selected font-medium shadow-xs';
          }

          return (
            <div
              key={opt.letter}
              className="relative overflow-hidden rounded-lg touch-pan-y select-none"
            >
              {/* Swipe-to-strike background indicator for touch screens */}
              {isBeingDragged && Math.abs(currentDragX) > 10 && !isShowingOfficialResolution && (
                <div 
                  className={`absolute inset-0 flex items-center px-4 rounded-lg transition-colors pointer-events-none ${
                    Math.abs(currentDragX) >= 30
                      ? 'bg-danger-bg text-danger'
                      : 'bg-surface-subtle text-muted'
                  } ${currentDragX > 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Scissors className="w-4 h-4 animate-pulse" />
                    <span>{Math.abs(currentDragX) >= 30 ? 'Solte para riscar' : 'Arraste para riscar'}</span>
                  </div>
                </div>
              )}

              {/* Option Card Body */}
              <div
                onContextMenu={(e) => handleContextMenu(e, opt.letter, isStriked)}
                onClick={() => handleOptionClick(opt.letter, isStriked)}
                onTouchStart={(e) => handleTouchStart(e, opt.letter)}
                onTouchMove={(e) => handleTouchMove(e, opt.letter)}
                onTouchEnd={() => handleTouchEnd(opt.letter, isStriked)}
                onTouchCancel={handleTouchCancel}
                style={{
                  transform: currentDragX !== 0 ? `translateX(${currentDragX}px)` : undefined,
                  transition: isBeingDragged ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
                }}
                className={`group flex items-start gap-3 p-3.5 sm:p-4 rounded-lg transition-all relative ${cardStyle} ${
                  isStriked ? 'strikethrough-option cursor-pointer' : 'cursor-pointer'
                }`}
                title={
                  isShowingOfficialResolution 
                    ? undefined 
                    : isStriked 
                    ? 'Alternativa riscada. Clique com o botão esquerdo (ou toque) para desriscar e restaurar.' 
                    : 'Clique com o botão direito para riscar, ou clique para selecionar.'
                }
              >
                {/* Option Letter Badge */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isShowingOfficialResolution && isCorrectOption
                      ? 'bg-success text-white theme-badge-correct'
                      : isShowingOfficialResolution && lastAnswer?.selected_letter === opt.letter && !isCorrect
                      ? 'bg-danger text-white theme-badge-wrong'
                      : isSelected
                      ? 'bg-accent text-white theme-badge-selected'
                      : isStriked
                      ? 'theme-badge-striked'
                      : 'theme-badge-default bg-surface-subtle text-secondary theme-text-secondary border border-border'
                  }`}
                >
                  {opt.letter}
                </div>

                {/* Option Text */}
                <div className="flex-1 text-sm leading-relaxed pt-0.5 option-text-content">
                  {opt.text}
                </div>

                {/* Strikethrough Status Badge & Eliminator Button */}
                {!isShowingOfficialResolution && (
                  <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                    {isStriked && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded flex items-center gap-1 theme-pill-striked">
                        <span>Riscada</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStrikeOption(opt.letter);
                      }}
                      className={`p-1 rounded transition-all cursor-pointer theme-scissors-btn ${
                        isStriked
                          ? 'opacity-100 theme-scissors-active'
                          : 'opacity-0 group-hover:opacity-100 text-muted hover:text-danger'
                      }`}
                      title={isStriked ? "Restaurar alternativa (desriscar)" : "Riscar alternativa (ou clique direito / arraste)"}
                    >
                      <Scissors className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Control Navigation & Submit Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <button
            id="prev-question-btn"
            onClick={onPrev}
            disabled={currentIndex <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-subtle hover:bg-surface-hover disabled:opacity-30 text-secondary theme-text-secondary border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Questão anterior (Seta Esquerda)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <button
            id="next-question-btn"
            onClick={onNext}
            disabled={currentIndex >= totalFiltered - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-subtle hover:bg-surface-hover disabled:opacity-30 text-secondary theme-text-secondary border border-border rounded-lg text-xs font-medium transition-colors cursor-pointer"
            title="Próxima questão (Seta Direita)"
          >
            <span>Próxima</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isAnswered ? (
            <button
              id="toggle-resolution-btn"
              onClick={handleToggleResolution}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent-subtle text-accent border border-accent/20 hover:bg-accent/15 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showResolution ? 'Ocultar Gabarito (G)' : 'Ver Gabarito Comentado (G)'}</span>
            </button>
          ) : (
            <button
              id="submit-answer-btn"
              onClick={handleSubmit}
              disabled={!selectedLetter}
              className="flex items-center gap-2 px-5 py-2 theme-btn-accent disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
              title="Confirmar resposta (Enter)"
            >
              <Check className="w-4 h-4" />
              <span>Responder (Enter)</span>
            </button>
          )}
        </div>
      </div>

      {/* Resolution & Commentary Section */}
      {isShowingOfficialResolution && (
        <ResolutionSection
          resolution={question.resolution}
          isCorrect={isCorrect}
          selectedLetter={lastAnswer?.selected_letter || selectedLetter}
          srsItem={srsItem}
          onRateSRS={onRateSRS}
          note={bookmarkData?.note || ''}
          onSaveNote={onSaveNote}
        />
      )}
    </div>
  );
};
