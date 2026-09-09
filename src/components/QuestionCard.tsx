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
  XCircle,
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

export const DEFAULT_ELIMINATED_OPTIONS_EXPIRATION_MS = 4 * 60 * 60 * 1000; // 4 horas em milissegundos

/**
 * Verifica se as alternativas riscadas salvas no registro ultrapassaram o tempo limite definido (ex: 4 horas)
 */
export function isEliminatedOptionsExpired(
  record?: UserAnswerRecord | null,
  expirationMs: number = DEFAULT_ELIMINATED_OPTIONS_EXPIRATION_MS
): boolean {
  if (!record) return false;
  const strikeTime = record.eliminated_options_timestamp ?? record.timestamp ?? (record as any).timestamp_ms;
  if (!strikeTime || typeof strikeTime !== 'number') return false;
  return (Date.now() - strikeTime) > expirationMs;
}

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalFiltered: number;
  onPrev: () => void;
  onNext: () => void;
  onAnswer: (
    letter: string, 
    timeSpentSeconds: number, 
    answeredStrikes?: string[], 
    targetQuestionOverride?: Question,
    eliminatedOptionsTimestamp?: number
  ) => void;
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
  initialElapsedSeconds?: number;
  onUpdateElapsedSeconds?: (seconds: number) => void;
  showQuestionNumber?: boolean;
  sequenceLabel?: string;
  eliminatedOptionsExpirationMs?: number;
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
  initialElapsedSeconds = 0,
  onUpdateElapsedSeconds,
  showQuestionNumber = true,
  sequenceLabel,
  eliminatedOptionsExpirationMs = DEFAULT_ELIMINATED_OPTIONS_EXPIRATION_MS,
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

  // Indica se o usuário realizou novas marcações/desmarcações na sessão atual da questão
  const hasUserModifiedStrikesInSessionRef = useRef<boolean>(false);
  // Momento exato em que as marcações de alternativas riscadas foram feitas/modificadas
  const lastStrikeActionTimestampRef = useRef<number>(Date.now());

  // Snapshot of strikes at the moment the answer was given
  const answeredStrikes = useMemo(() => {
    if (!lastAnswer) return [];
    // Se a diferença de tempo ultrapassar o limite (ex: 4h), ignora as marcações salvas
    if (isEliminatedOptionsExpired(lastAnswer, eliminatedOptionsExpirationMs)) {
      return [];
    }
    if (lastAnswer.eliminated_options && Array.isArray(lastAnswer.eliminated_options)) {
      return lastAnswer.eliminated_options;
    }
    // Fallback for legacy answer records
    return strikes || [];
  }, [lastAnswer, strikes, eliminatedOptionsExpirationMs]);

  const isAnswered = !!lastAnswer;
  const isSolvedCorrectly = isAnswered && lastAnswer.is_correct === true;
  const isShowingOfficialResolution = isSolvedCorrectly && showResolution;

  // Active strikes to display:
  // 1. When official resolution is shown: immutable snapshot of strikes when answered
  // 2. When question is answered but resolution is hidden: independent review strikes
  // 3. When question is not yet answered: active strikes from parent
  const currentDisplayedStrikes = useMemo(() => {
    if (isShowingOfficialResolution) {
      return answeredStrikes;
    }
    if (isSolvedCorrectly && !showResolution) {
      return reviewStrikes;
    }
    // Se as marcações do registro anterior expiraram (> 4h) e o usuário ainda não interagiu nesta nova tentativa,
    // inicia a questão com todas as alternativas desmarcadas
    if (
      isEliminatedOptionsExpired(lastAnswer, eliminatedOptionsExpirationMs) && 
      !hasUserModifiedStrikesInSessionRef.current
    ) {
      return [];
    }
    return strikes;
  }, [
    isShowingOfficialResolution, 
    answeredStrikes, 
    isSolvedCorrectly, 
    showResolution, 
    reviewStrikes, 
    strikes, 
    lastAnswer, 
    eliminatedOptionsExpirationMs
  ]);

  const prevQuestionIdRef = useRef<number | null>(null);
  const prevLastAnswerRef = useRef<UserAnswerRecord | undefined>(lastAnswer);
  const onUpdateElapsedSecondsRef = useRef(onUpdateElapsedSeconds);

  useEffect(() => {
    onUpdateElapsedSecondsRef.current = onUpdateElapsedSeconds;
  }, [onUpdateElapsedSeconds]);

  // Synchronize when question changes or answer is provided
  useEffect(() => {
    const isNewQuestion = prevQuestionIdRef.current !== question.sequence_id;
    // Only detect a genuine new answer submission when timestamp, status or selected letter changes
    const prevAns = prevLastAnswerRef.current;
    const isNewAnswerSubmission = Boolean(
      lastAnswer && (
        !prevAns ||
        prevAns.timestamp_ms !== (lastAnswer as any).timestamp_ms ||
        prevAns.timestamp !== lastAnswer.timestamp ||
        prevAns.selected_letter !== lastAnswer.selected_letter ||
        prevAns.is_correct !== lastAnswer.is_correct
      )
    );

    prevQuestionIdRef.current = question.sequence_id;
    prevLastAnswerRef.current = lastAnswer;

    if (isNewQuestion) {
      hasUserModifiedStrikesInSessionRef.current = false;
      lastStrikeActionTimestampRef.current = Date.now();

      // Verifica expiração de tempo prolongado (ex: 4 horas)
      const isExpired = isEliminatedOptionsExpired(lastAnswer, eliminatedOptionsExpirationMs);
      if (isExpired) {
        // Se expirou, ignora as marcações salvas e inicia com todas alternativas desmarcadas
        if (onSetStrikes) {
          onSetStrikes([]);
        }
        setReviewStrikes([]);
      } else if (lastAnswer?.eliminated_options && Array.isArray(lastAnswer.eliminated_options)) {
        // Se dentro do limite (< 4h), mantém as marcações normalmente como já acontece hoje
        if (onSetStrikes && (!strikes || strikes.length === 0) && lastAnswer.eliminated_options.length > 0) {
          onSetStrikes(lastAnswer.eliminated_options);
        }
        setReviewStrikes(lastAnswer.eliminated_options);
      }

      if (lastAnswer && lastAnswer.is_correct) {
        setSelectedLetter(lastAnswer.selected_letter);
        setShowResolution(true);
        setTimeElapsed(lastAnswer.time_spent_seconds || 0);
      } else {
        setSelectedLetter('');
        setShowResolution(false);
        setTimeElapsed(initialElapsedSeconds ?? 0);
      }
      setDragOffset(null);
    } else if (isNewAnswerSubmission && lastAnswer) {
      if (lastAnswer.is_correct) {
        setSelectedLetter(lastAnswer.selected_letter);
        setShowResolution(true);
      }
      setTimeElapsed(lastAnswer.time_spent_seconds || 0);
    }
  }, [question.sequence_id, lastAnswer, eliminatedOptionsExpirationMs]);

  const timeElapsedRef = useRef<number>(initialElapsedSeconds ?? 0);
  useEffect(() => {
    timeElapsedRef.current = timeElapsed;
  }, [timeElapsed]);

  // Question active timer (runs while question is not answered or when not paused)
  useEffect(() => {
    if (showResolution || isSolvedCorrectly || isPaused) return;
    const timer = setInterval(() => {
      setTimeElapsed(t => {
        const next = t + 1;
        timeElapsedRef.current = next;
        return next;
      });
      // Call parent callback asynchronously outside React's render/updater phase
      if (onUpdateElapsedSecondsRef.current) {
        Promise.resolve().then(() => {
          onUpdateElapsedSecondsRef.current?.(timeElapsedRef.current);
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [showResolution, isSolvedCorrectly, question.sequence_id, isPaused]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStrike = (letter: string) => {
    if (isShowingOfficialResolution) return;
    hasUserModifiedStrikesInSessionRef.current = true;
    lastStrikeActionTimestampRef.current = Date.now();

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
    hasUserModifiedStrikesInSessionRef.current = true;
    lastStrikeActionTimestampRef.current = Date.now();

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
    if (isSolvedCorrectly) {
      // Re-reveal official resolution without overwriting previous history
      setSelectedLetter(lastAnswer.selected_letter);
      setShowResolution(true);
      return;
    }
    if (!selectedLetter) return;
    const finalTime = Math.max(1, timeElapsed);
    const isAnswerCorrect = selectedLetter === question.resolution.deduced_answer;
    if (isAnswerCorrect) {
      setShowResolution(true);
    } else {
      setShowResolution(false);
    }
    const strikeMoment = lastStrikeActionTimestampRef.current || Date.now();
    // Pass currentDisplayedStrikes and timestamp to be saved into the answer record permanently
    onAnswer(selectedLetter, finalTime, currentDisplayedStrikes, undefined, strikeMoment);
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
      <div className="flex items-start sm:items-center justify-between gap-3 pb-4 border-b border-border">
        
        {/* Left: Clean Breadcrumb Metadata (No excessive bordered boxes) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs min-w-0 flex-1">
          {showQuestionNumber && (
            <span className="font-semibold text-primary theme-text-primary bg-surface-subtle border border-border px-2.5 py-1 rounded-md">
              {sequenceLabel || `Questão #${question.sequence_id}`}
              {totalFiltered > 0 && (
                <span className="text-secondary theme-text-secondary font-normal ml-1.5 opacity-90">
                  ({currentIndex + 1} de {totalFiltered})
                </span>
              )}
            </span>
          )}

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
        <div className="flex items-center gap-2 text-xs shrink-0 ml-auto">
          {/* Timer */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs transition-colors border ${
              isPaused 
                ? 'bg-warning-bg text-warning border-warning-border' 
                : 'text-secondary theme-text-secondary bg-surface-subtle border-border'
            }`}
            title={isPaused ? "Cronômetro pausado (Pressione Espaço para retomar)" : "Tempo decorrido nesta questão (Pressione Espaço para pausar)"}
          >
            <Clock className={`w-3.5 h-3.5 ${isPaused ? 'text-warning animate-pulse' : 'text-muted'}`} />
            <span>{formatTimer(timeElapsed)}</span>
            {isPaused && <span className="text-[10px] font-sans font-medium opacity-80">(pausado)</span>}
          </div>

          {/* Bookmark Button */}
          <button
            id="toggle-bookmark-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={`p-1.5 rounded-md transition-colors cursor-pointer border ${
              isBookmarked
                ? 'theme-badge-accent shadow-xs font-semibold'
                : 'bg-surface-subtle text-muted hover:text-primary border-border'
            }`}
            title="Marcar questão para revisar depois (M)"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-accent' : ''}`} />
          </button>
        </div>
      </div>

      {/* Unified Secondary Metadata Row (Origem, Área/Contexto, Tópicos) */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted theme-text-muted">
        {question.metadata.institution && (
          <>
            <span>
              Origem: <span className="font-medium text-secondary theme-text-secondary">{question.metadata.institution}</span>
            </span>
            <span>•</span>
          </>
        )}
        {question.metadata.role && (
          <>
            <span>
              Área: <span className="font-medium text-secondary theme-text-secondary">{question.metadata.role}</span>
            </span>
            {question.metadata.topics?.length > 0 && <span>•</span>}
          </>
        )}
        {question.metadata.topics?.length > 0 && (
          <span>
            Tópico: <span className="font-medium text-secondary theme-text-secondary">{question.metadata.topics.join(' • ')}</span>
          </span>
        )}
      </div>

      {/* Question Stem (Enunciado / Assertivas) - Clean, document-like typography */}
      <div 
        id="question-stem-text"
        className="text-primary theme-text-primary text-base leading-relaxed whitespace-pre-line font-medium"
      >
        {question.stem.full_text}
      </div>

      {/* Media: Image, chart or table if present (Schema v2) */}
      {question.media && question.media.length > 0 && (
        <div className="space-y-3 py-2">
          {question.media.map((item, idx) => (
            <div key={idx} className="rounded-lg overflow-hidden border border-border bg-surface-subtle p-2 max-w-2xl mx-auto">
              <img 
                src={item.url} 
                alt={item.alt_text || 'Material visual da questão'} 
                className="max-h-96 w-auto mx-auto rounded object-contain"
                referrerPolicy="no-referrer" 
              />
              {item.alt_text && (
                <p className="text-center text-xs text-muted mt-1.5 italic">{item.alt_text}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Options Header Hint */}
      {!isShowingOfficialResolution && (
        <div className="flex items-center justify-end text-[11px] text-muted theme-text-muted pb-0.5 px-0.5">
          <span className="text-[11px] flex items-center gap-1 text-muted">
            <span className="hidden sm:inline">Botão direito: riscar • Botão esquerdo: selecionar / desriscar</span>
            <span className="sm:hidden">Arraste pro lado para riscar • Toque para desriscar</span>
          </span>
        </div>
      )}

      {/* Options List - Sleek, minimalist IDE / Document items with Touch Drag & Mouse elimination */}
      <div className="space-y-2.5 pt-0.5">
        {question.options.map((opt) => {
          const isSelected = selectedLetter === opt.letter;
          const isStriked = currentDisplayedStrikes.includes(opt.letter);
          const isCorrectOption = opt.letter === question.resolution.deduced_answer;
          const isBeingDragged = dragOffset?.letter === opt.letter;
          const currentDragX = isBeingDragged ? dragOffset.x : 0;
          const isAttemptedWrong = !isSolvedCorrectly && lastAnswer && !lastAnswer.is_correct && opt.letter === lastAnswer.selected_letter;
          
          // Selective explanation rule:
          // - Only show explanation for correct option when solved correctly
          // - Show explanation for wrong option if attempted incorrectly and explanation is available
          // - Other unselected options do NOT show explanation
          const shouldShowOptionExplanation = isShowingOfficialResolution 
            ? (Boolean(opt.why_wrong_or_right) && isCorrectOption)
            : (isAttemptedWrong && Boolean(opt.why_wrong_or_right));
          
          let cardStyle = 'theme-card hover:border-[var(--theme-border-hover)] text-primary theme-text-primary';
          
          if (isShowingOfficialResolution) {
            if (isCorrectOption) {
              cardStyle = 'theme-option-correct font-medium';
            } else {
              cardStyle = 'opacity-40 theme-card-subtle text-muted';
            }
          } else if (isAttemptedWrong) {
            cardStyle = 'theme-option-wrong font-medium';
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
                      ? 'bg-success text-success-contrast theme-badge-correct'
                      : isAttemptedWrong
                      ? 'bg-danger text-danger-contrast theme-badge-wrong'
                      : isSelected
                      ? 'bg-accent text-accent-contrast theme-badge-selected'
                      : isStriked
                      ? 'theme-badge-striked'
                      : 'theme-badge-default bg-surface-subtle text-secondary theme-text-secondary border border-border'
                  }`}
                >
                  {opt.letter}
                </div>

                {/* Option Text */}
                <div className="flex-1 text-sm leading-relaxed pt-0.5 option-text-content">
                  <div>{opt.text}</div>
                  {shouldShowOptionExplanation && (
                    <div className={`mt-2 pt-2 border-t border-border/50 text-xs leading-relaxed italic ${
                      isCorrectOption ? 'text-success font-medium' : 'text-danger font-medium'
                    }`}>
                      {opt.why_wrong_or_right}
                    </div>
                  )}
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

      {/* Wrong Answer Feedback Notice */}
      {!isSolvedCorrectly && lastAnswer && !lastAnswer.is_correct && (
        <div className="p-3 rounded-xl border border-danger-border bg-danger-bg text-danger text-xs flex items-center justify-between gap-2.5 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 shrink-0 text-danger" />
            <span>
              Alternativa <strong>{lastAnswer.selected_letter}</strong> incorreta. Analise o enunciado e tente outra alternativa!
            </span>
          </div>
        </div>
      )}

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
          {isSolvedCorrectly ? (
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
              <span>{lastAnswer && !lastAnswer.is_correct && selectedLetter === lastAnswer.selected_letter ? 'Tentar Novamente' : 'Responder (Enter)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Resolution & Commentary Section */}
      {isShowingOfficialResolution && (
        <ResolutionSection
          resolution={question.resolution}
          isCorrect={true}
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
