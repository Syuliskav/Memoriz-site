import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Question, 
  UserAnswerRecord, 
  SRSItem, 
  SRSRating, 
  UserBookmark 
} from '../types/question';
import { getQuestionContentHash } from '../lib/duplicateEngine';
import { QuestionCard } from './QuestionCard';
import confetti from 'canvas-confetti';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { PendantLightFixture, VerifiedSpinningBadge } from './ErrorAnimations';

interface ErrorNotebookViewProps {
  questions: Question[];
  lastAnswers: Record<number, UserAnswerRecord>;
  onStartPracticeQuestion: (question: Question) => void;
  onExit: () => void;
  onAnswerQuestion?: (letter: string, timeSpentSeconds: number, answeredStrikes?: string[], targetQuestionOverride?: Question) => void;
  srsItems?: Record<number, SRSItem>;
  onRateSRS?: (rating: SRSRating, targetQuestionOverride?: Question) => void;
  bookmarks?: Record<number, UserBookmark>;
  onToggleBookmark?: (question: Question) => void;
  onSaveNote?: (note: string, questionId: number) => void;
  strikes?: Record<number, string[]>;
  onToggleStrike?: (letter: string, questionId: number) => void;
  isPaused?: boolean;
  isPageSettled?: boolean;
}

export const ErrorNotebookView: React.FC<ErrorNotebookViewProps> = ({
  questions,
  lastAnswers,
  onStartPracticeQuestion,
  onExit,
  onAnswerQuestion,
  srsItems = {},
  onRateSRS,
  bookmarks = {},
  onToggleBookmark,
  onSaveNote,
  strikes = {},
  onToggleStrike,
  isPaused = false,
  isPageSettled = false,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeSessionIndex, setActiveSessionIndex] = useState<number | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [unansweredTimes, setUnansweredTimes] = useState<Record<number, number>>({});

  // Local scroll activity tracker: pauses/hides decorative animations during active scrolling
  const [isLocalScrolling, setIsLocalScrolling] = useState<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsLocalScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsLocalScrolling(false);
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const isViewSettled = isPageSettled && !isLocalScrolling;

  // Filter questions that were answered incorrectly, deduplicating identical questions
  const errorQuestions = useMemo(() => {
    const seenHashes = new Set<string>();
    const list: Question[] = [];
    for (const q of questions) {
      const last = lastAnswers[q.sequence_id];
      if (last && !last.is_correct) {
        const hash = getQuestionContentHash(q);
        if (!seenHashes.has(hash)) {
          seenHashes.add(hash);
          list.push(q);
        }
      }
    }
    return list;
  }, [questions, lastAnswers]);

  const subjects = useMemo(() => {
    return Array.from(new Set(errorQuestions.map(q => q.metadata.subject))).sort();
  }, [errorQuestions]);

  const filteredErrors = useMemo(() => {
    return selectedSubject === 'all'
      ? errorQuestions
      : errorQuestions.filter(q => q.metadata.subject === selectedSubject);
  }, [selectedSubject, errorQuestions]);

  const handleStartSession = (startIndex = 0) => {
    if (onAnswerQuestion) {
      setSessionQuestions(filteredErrors);
      setActiveSessionIndex(startIndex);
    } else {
      // Fallback
      if (filteredErrors[startIndex]) {
        onStartPracticeQuestion(filteredErrors[startIndex]);
      }
    }
  };

  const handleExitSession = () => {
    setActiveSessionIndex(null);
    setSessionQuestions([]);
  };

  // Active question set for the interactive session
  const activeSessionList = sessionQuestions.length > 0 ? sessionQuestions : filteredErrors;

  // If currently in active interactive session inside the Error Notebook
  if (activeSessionIndex !== null && activeSessionList.length > 0) {
    const safeIndex = Math.min(Math.max(0, activeSessionIndex), activeSessionList.length - 1);
    const activeQ = activeSessionList[safeIndex];
    const activeAns = lastAnswers[activeQ.sequence_id];
    const isNowCorrect = activeAns?.is_correct === true;

    return (
      <div className="max-w-4xl mx-auto space-y-4 pt-3 sm:pt-4 pb-2 animate-in fade-in duration-200">
        {/* In-Session Header Bar */}
        <div className="bg-surface border border-danger-border/40 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExitSession}
              className="p-1.5 rounded-lg theme-btn-secondary hover:bg-surface-hover text-secondary hover:text-primary transition-colors cursor-pointer"
              title="Voltar à lista do Caderno de Erros"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-danger flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Caderno de Erros
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-surface-subtle border border-border text-primary font-semibold">
                  {safeIndex + 1} de {activeSessionList.length}
                </span>
                {isNowCorrect && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-success-bg text-success border border-success-border flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Corrigida!
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted truncate max-w-xs sm:max-w-md">
                {activeQ.metadata.subject} &bull; {activeQ.metadata.exam_board} &bull; {activeQ.metadata.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={safeIndex <= 0}
              onClick={() => setActiveSessionIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
              className="p-2 rounded-lg border border-border bg-surface text-secondary hover:text-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              title="Questão com erro anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={safeIndex >= activeSessionList.length - 1}
              onClick={() => setActiveSessionIndex(prev => (prev !== null && prev < activeSessionList.length - 1 ? prev + 1 : prev))}
              className="p-2 rounded-lg border border-border bg-surface text-secondary hover:text-primary disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
              title="Próxima questão com erro"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleExitSession}
              className="px-3 py-1.5 text-xs font-medium rounded-lg theme-btn-secondary hover:bg-surface-hover text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Lista de Erros
            </button>
          </div>
        </div>

        {/* Embedded Real QuestionCard within Error Context */}
        <QuestionCard
          question={activeQ}
          currentIndex={safeIndex}
          totalFiltered={activeSessionList.length}
          onPrev={() => setActiveSessionIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev))}
          onNext={() => {
            if (safeIndex < activeSessionList.length - 1) {
              setActiveSessionIndex(safeIndex + 1);
            } else {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            }
          }}
          onAnswer={(letter, time, strks) => {
            if (onAnswerQuestion) {
              onAnswerQuestion(letter, time, strks, activeQ);
              if (letter === activeQ.resolution.deduced_answer) {
                confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
              }
            }
          }}
          lastAnswer={lastAnswers[activeQ.sequence_id]}
          srsItem={srsItems[activeQ.sequence_id]}
          onRateSRS={(rating) => {
            if (onRateSRS) onRateSRS(rating, activeQ);
          }}
          isBookmarked={!!bookmarks[activeQ.sequence_id]}
          bookmarkData={bookmarks[activeQ.sequence_id]}
          onToggleBookmark={() => {
            if (onToggleBookmark) onToggleBookmark(activeQ);
          }}
          onSaveNote={(note) => {
            if (onSaveNote) onSaveNote(note, activeQ.sequence_id);
          }}
          strikes={strikes[activeQ.sequence_id] || []}
          onToggleStrike={(letter) => {
            if (onToggleStrike) onToggleStrike(letter, activeQ.sequence_id);
          }}
          isPaused={isPaused}
          initialElapsedSeconds={unansweredTimes[activeQ.sequence_id] || 0}
          onUpdateElapsedSeconds={(secs) => {
            setUnansweredTimes(prev => {
              if (prev[activeQ.sequence_id] === secs) return prev;
              return { ...prev, [activeQ.sequence_id]: secs };
            });
          }}
        />
      </div>
    );
  }

  if (errorQuestions.length === 0) {
    return (
      <div className="relative w-full max-w-4xl mx-auto pt-0 pb-8 sm:pb-12 px-4 min-h-[380px] overflow-hidden">
        {/* Light SVG fixture hanging from top left attached directly to top ceiling edge */}
        <div className="absolute top-0 left-2 sm:left-6 md:left-10 w-24 sm:w-32 md:w-40 pointer-events-none z-10">
          <PendantLightFixture isPageSettled={isViewSettled} />
        </div>

        {/* Decorative background watermark in bottom right corner */}
        <VerifiedSpinningBadge isPageSettled={isViewSettled} />

        {/* Empty state card centered with top spacing for hanging fixture */}
        <div className="relative z-10 max-w-xl mx-auto text-center space-y-6 pt-16 sm:pt-20">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-primary theme-text-primary">
              Caderno de Erros Zerado
            </h2>
            <p className="text-muted theme-text-muted text-sm max-w-sm mx-auto">
              Você não possui questões com histórico recente de erro. Continue praticando para manter sua retenção em 100%.
            </p>
          </div>
          <button
            onClick={onExit}
            className="px-4 py-2 theme-btn-accent font-medium rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Ir para Prática de Questões
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto space-y-4 pt-3 sm:pt-4 pb-2">
      {/* Header Banner - Note: decorative icons are completely disabled during active questions so as not to distract study */}
      <div className="bg-surface border border-danger-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-danger text-danger-contrast flex items-center justify-center shadow-xs shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary theme-text-primary">
              Caderno de Erros
            </h2>
            <p className="text-xs text-secondary theme-text-secondary mt-0.5">
              {errorQuestions.length} questões com erro para fixação e re-estudo.
            </p>
          </div>
        </div>

        {errorQuestions.length > 0 && (
          <button
            id="zerar-erros-sequencia-btn"
            onClick={() => handleStartSession(0)}
            className="px-4 py-2.5 bg-danger hover:opacity-90 text-danger-contrast font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 self-start sm:self-center cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Zerar Erros em Sequência</span>
          </button>
        )}
      </div>

      {/* Subject Filter Pills */}
      {subjects.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-accent text-accent-contrast border-transparent font-semibold shadow-xs'
                : 'bg-surface text-secondary theme-text-secondary border-border hover:bg-surface-hover'
            }`}
          >
            Todos ({errorQuestions.length})
          </button>
          {subjects.map(s => {
            const count = errorQuestions.filter(q => q.metadata.subject === s).length;
            return (
              <button
                key={s}
                onClick={() => setSelectedSubject(s)}
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
                  selectedSubject === s
                    ? 'bg-accent text-accent-contrast border-transparent font-semibold shadow-xs'
                    : 'bg-surface text-secondary theme-text-secondary border-border hover:bg-surface-hover'
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Error Items List */}
      <div className="space-y-3">
        {filteredErrors.map((q, idx) => {
          const ans = lastAnswers[q.sequence_id];
          return (
            <div
              key={q.sequence_id}
              className="theme-card border border-border rounded-xl p-5 transition-colors space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-surface-subtle text-primary theme-text-primary border border-border font-mono font-semibold rounded">
                    #{q.sequence_id}
                  </span>
                  <span className="font-semibold text-primary theme-text-primary">{q.metadata.subject}</span>
                  <span className="text-muted">&bull; {q.metadata.exam_board} &bull; {q.metadata.year}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-danger font-medium text-xs bg-danger-bg px-2.5 py-1 rounded-md border border-danger-border">
                    Sua marcação anterior: <span className="font-mono font-bold">{ans?.selected_letter || '—'}</span>
                  </span>
                  <button
                    onClick={() => handleStartSession(idx)}
                    className="flex items-center gap-1 px-3 py-1 theme-btn-accent font-medium rounded-md text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Resolver</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-primary theme-text-primary line-clamp-3 leading-relaxed font-normal">
                {q.stem.full_text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
