import React, { useState, useEffect } from 'react';
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
  onAnswer: (letter: string, timeSpentSeconds: number) => void;
  lastAnswer: UserAnswerRecord | undefined;
  srsItem: SRSItem | undefined;
  onRateSRS: (rating: SRSRating) => void;
  isBookmarked: boolean;
  bookmarkData: UserBookmark | undefined;
  onToggleBookmark: () => void;
  onSaveNote: (note: string) => void;
  strikes: string[];
  onToggleStrike: (letter: string) => void;
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
  isPaused = false,
}) => {
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [showResolution, setShowResolution] = useState<boolean>(false);

  // Synchronize when question changes
  useEffect(() => {
    if (lastAnswer) {
      setSelectedLetter(lastAnswer.selected_letter);
      setShowResolution(true);
      setTimeElapsed(lastAnswer.time_spent_seconds || 0);
    } else {
      setSelectedLetter('');
      setShowResolution(false);
      setTimeElapsed(0);
    }
  }, [question.sequence_id, lastAnswer]);

  // Question active timer (pauses when answered, showing resolution, or isPaused)
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

  const handleSubmit = () => {
    if (!selectedLetter) return;
    const finalTime = Math.max(1, timeElapsed);
    setShowResolution(true);
    onAnswer(selectedLetter, finalTime);
  };

  const isAnswered = showResolution && !!lastAnswer;
  const isCorrect = isAnswered && lastAnswer.selected_letter === question.resolution.deduced_answer;

  // Local card keyboard shortcuts (A-E to pick option, Enter to submit, G to toggle resolution)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const key = e.key.toUpperCase();
      if (!isAnswered && ['A', 'B', 'C', 'D', 'E'].includes(key)) {
        // Check if question has this option
        if (question.options.some(o => o.letter.toUpperCase() === key)) {
          e.preventDefault();
          setSelectedLetter(key);
        }
      } else if (!isAnswered && e.key === 'Enter' && selectedLetter) {
        e.preventDefault();
        handleSubmit();
      } else if (isAnswered && (e.key.toLowerCase() === 'g')) {
        e.preventDefault();
        setShowResolution(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, selectedLetter, timeElapsed, question.options, isPaused]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6 transition-colors shadow-xs">
      
      {/* Top Metadata Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Left: Metadata & Identifiers */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            Questão #{question.sequence_id}
          </span>
          {question.database_name && (
            <span className="font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1">
              <span className="opacity-70">Banco:</span>
              <span className="font-semibold truncate max-w-[180px] sm:max-w-xs">{question.database_name}</span>
            </span>
          )}
          <span className="font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-md">
            {question.metadata.subject}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {question.metadata.exam_board} • {question.metadata.year}
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {question.metadata.reference_code}
          </span>
        </div>

        {/* Right: Timer & Bookmark */}
        <div className="flex items-center gap-2 text-xs">
          {/* Timer */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
              isPaused 
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60' 
                : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800'
            }`}
            title={isPaused ? "Cronômetro pausado (Pressione Espaço para retomar)" : "Tempo decorrido nesta questão (Pressione Espaço para pausar)"}
          >
            <Clock className={`w-3.5 h-3.5 ${isPaused ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
            <span>{formatTimer(timeElapsed)}</span>
            {isPaused && <span className="text-[10px] font-sans font-medium opacity-80">(pausado)</span>}
          </div>

          {/* Bookmark Button */}
          <button
            id="toggle-bookmark-btn"
            onClick={onToggleBookmark}
            className={`p-1.5 rounded-md border transition-colors ${
              isBookmarked
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Marcar questão para revisar depois (M)"
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Institution, Role & Topics info (Clean inline metadata) */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
        <span><strong className="font-medium text-slate-700 dark:text-slate-300">Órgão:</strong> {question.metadata.institution}</span>
        <span><strong className="font-medium text-slate-700 dark:text-slate-300">Cargo:</strong> {question.metadata.role}</span>
        {question.metadata.topics?.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-slate-400" />
            <span>{question.metadata.topics.join(' • ')}</span>
          </div>
        )}
      </div>

      {/* Question Stem (Enunciado / Assertivas) - Clean, document-like typography */}
      <div 
        id="question-stem-text"
        className="text-slate-900 dark:text-slate-100 text-base leading-relaxed whitespace-pre-line font-medium"
      >
        {question.stem.full_text}
      </div>

      {/* Options List - Sleek, minimalist IDE / Document items */}
      <div className="space-y-2.5 pt-1">
        {question.options.map((opt) => {
          const isSelected = selectedLetter === opt.letter;
          const isStriked = strikes.includes(opt.letter);
          const isCorrectOption = opt.letter === question.resolution.deduced_answer;
          
          let cardStyle = 'bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200';
          
          if (isAnswered) {
            if (isCorrectOption) {
              cardStyle = 'bg-emerald-500/10 border border-emerald-500 text-emerald-900 dark:text-emerald-200 font-medium';
            } else if (isSelected && !isCorrect) {
              cardStyle = 'bg-rose-500/10 border border-rose-500 text-rose-900 dark:text-rose-200 font-medium';
            } else {
              cardStyle = 'opacity-40 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 text-slate-400';
            }
          } else if (isSelected) {
            cardStyle = 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-500 text-indigo-950 dark:text-indigo-100 font-medium';
          }

          return (
            <div
              key={opt.letter}
              onContextMenu={(e) => {
                e.preventDefault();
                onToggleStrike(opt.letter);
              }}
              className={`group flex items-start gap-3 p-3.5 sm:p-4 rounded-lg transition-all cursor-pointer relative ${cardStyle} ${
                isStriked ? 'strikethrough-option' : ''
              }`}
              onClick={() => {
                if (!isAnswered) {
                  setSelectedLetter(opt.letter);
                }
              }}
            >
              {/* Option Letter Badge */}
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  isAnswered && isCorrectOption
                    ? 'bg-emerald-600 text-white'
                    : isAnswered && isSelected && !isCorrect
                    ? 'bg-rose-600 text-white'
                    : isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt.letter}
              </div>

              {/* Option Text */}
              <div className="flex-1 text-sm leading-relaxed pt-0.5">
                {opt.text}
              </div>

              {/* Distractor Eliminator (Riscador) Button */}
              {!isAnswered && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStrike(opt.letter);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all ${
                    isStriked ? 'opacity-100 text-rose-600' : ''
                  }`}
                  title="Riscar/Eliminar alternativa descartada (ou clique com botão direito)"
                >
                  <Scissors className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Control Navigation & Submit Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            id="prev-question-btn"
            onClick={onPrev}
            disabled={currentIndex <= 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
            title="Questão anterior (Seta Esquerda)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <button
            id="next-question-btn"
            onClick={onNext}
            disabled={currentIndex >= totalFiltered - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
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
              onClick={() => setShowResolution(!showResolution)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showResolution ? 'Ocultar Gabarito' : 'Ver Gabarito Comentado'}</span>
            </button>
          ) : (
            <button
              id="submit-answer-btn"
              onClick={handleSubmit}
              disabled={!selectedLetter}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors shadow-xs"
              title="Confirmar resposta (Enter)"
            >
              <Check className="w-4 h-4" />
              <span>Responder (Enter)</span>
            </button>
          )}
        </div>
      </div>

      {/* Resolution & Commentary Section */}
      {showResolution && (
        <ResolutionSection
          resolution={question.resolution}
          isCorrect={isCorrect}
          selectedLetter={selectedLetter || (lastAnswer?.selected_letter || '')}
          srsItem={srsItem}
          onRateSRS={onRateSRS}
          note={bookmarkData?.note || ''}
          onSaveNote={onSaveNote}
        />
      )}
    </div>
  );
};
