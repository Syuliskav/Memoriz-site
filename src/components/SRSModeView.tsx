import React, { useState, useEffect, useMemo } from 'react';
import { Question, SRSItem, UserAnswerRecord } from '../types/question';
import { 
  Flame, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Shuffle,
  X,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateNextSRS } from '../lib/srsEngine';
import { deduplicateQuestions } from '../lib/duplicateEngine';

interface ShuffledOption {
  letter: string;
  text: string;
  originalLetter: string;
}

interface SRSModeViewProps {
  questions: Question[];
  srsItems: Record<number, SRSItem>;
  onSaveSRS: (item: SRSItem) => void;
  onRecordAnswer: (record: UserAnswerRecord) => void;
  streakDays: number;
  onExit: () => void;
  isPaused?: boolean;
}

export const SRSModeView: React.FC<SRSModeViewProps> = ({
  questions,
  srsItems,
  onSaveSRS,
  onRecordAnswer,
  streakDays,
  onExit,
  isPaused = false,
}) => {
  const [queue, setQueue] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [attemptedWrongOptions, setAttemptedWrongOptions] = useState<string[]>([]);
  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState<boolean>(false);
  const [sessionXP, setSessionXP] = useState<number>(0);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [correctInSession, setCorrectInSession] = useState<number>(0);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);

  // Active question timer for SRS Fixação mode (paused when modal or app is paused or when not on SRS page)
  useEffect(() => {
    if (isAnsweredCorrectly || sessionCompleted || isPaused) return;
    const timer = setInterval(() => {
      setTimeElapsed(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isAnsweredCorrectly, sessionCompleted, isPaused, currentIndex]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const uniquePool = deduplicateQuestions(questions);
    
    const dueList: Question[] = [];
    const newList: Question[] = [];
    const otherList: Question[] = [];

    for (const q of uniquePool) {
      const srs = srsItems[q.sequence_id];
      if (!srs || srs.state === 'new') {
        newList.push(q);
      } else if (srs.next_review_date <= today) {
        dueList.push(q);
      } else {
        otherList.push(q);
      }
    }

    const combined = [...dueList, ...newList, ...otherList].slice(0, 12);
    setQueue(combined);
    setCurrentIndex(0);
    setSessionCompleted(false);
  }, [questions, srsItems]);

  const currentQuestion = queue[currentIndex];

  // Dynamically shuffle options specifically for Fixação / Spaced Repetition mode
  // This prevents memorization by position/letter and forces true content retention.
  const { shuffledOptions, targetLetter, originalTargetLetter } = useMemo(() => {
    if (!currentQuestion || !currentQuestion.options || currentQuestion.options.length === 0) {
      return { shuffledOptions: [], targetLetter: '', originalTargetLetter: '' };
    }

    const originalAnswer = currentQuestion.resolution?.deduced_answer || '';
    
    // Create copy with original letter reference
    const items = currentQuestion.options.map(opt => ({
      originalLetter: opt.letter,
      text: opt.text,
    }));

    // Fisher-Yates shuffle
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }

    // Assign sequential standard option badges (A, B, C, D, E...)
    const letterLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const shuffled: ShuffledOption[] = items.map((item, idx) => ({
      letter: letterLabels[idx] || item.originalLetter,
      text: item.text,
      originalLetter: item.originalLetter,
    }));

    // Find the new letter that corresponds to the original deduced answer
    const newTarget = shuffled.find(o => o.originalLetter === originalAnswer)?.letter || originalAnswer;

    return {
      shuffledOptions: shuffled,
      targetLetter: newTarget,
      originalTargetLetter: originalAnswer,
    };
  }, [currentQuestion?.sequence_id]);

  const handleSelectOption = (letter: string) => {
    if (isAnsweredCorrectly) return;
    setSelectedOption(letter);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || !currentQuestion) return;

    const isCorrect = selectedOption === targetLetter;
    
    if (isCorrect) {
      setIsAnsweredCorrectly(true);
      const earnedXP = attemptedWrongOptions.length === 0 ? 20 : 10;
      setSessionXP(xp => xp + earnedXP);
      if (attemptedWrongOptions.length === 0) {
        setCorrectInSession(c => c + 1);
      }

      // Map selected letter back to original option letter for persistent database tracking
      const originalSelectedLetter = shuffledOptions.find(o => o.letter === selectedOption)?.originalLetter || selectedOption;

      // Record answer
      onRecordAnswer({
        question_id: currentQuestion.sequence_id,
        selected_letter: originalSelectedLetter,
        is_correct: true,
        timestamp: Date.now(),
        time_spent_seconds: Math.max(1, timeElapsed),
        mode: 'srs',
      });

      // Automatically update spaced repetition schedule in background
      const currentSRS = srsItems[currentQuestion.sequence_id];
      const rating = attemptedWrongOptions.length === 0 ? 3 : 2;
      const updated = calculateNextSRS(currentSRS, rating, currentQuestion.sequence_id);
      onSaveSRS(updated);
    } else {
      // Mark as wrong attempt without revealing the right answer
      if (!attemptedWrongOptions.includes(selectedOption)) {
        setAttemptedWrongOptions(prev => [...prev, selectedOption]);
      }
      
      const originalSelectedLetter = shuffledOptions.find(o => o.letter === selectedOption)?.originalLetter || selectedOption;
      onRecordAnswer({
        question_id: currentQuestion.sequence_id,
        selected_letter: originalSelectedLetter,
        is_correct: false,
        timestamp: Date.now(),
        time_spent_seconds: Math.max(1, timeElapsed),
        mode: 'srs',
      });

      const currentSRS = srsItems[currentQuestion.sequence_id];
      const updated = calculateNextSRS(currentSRS, 1, currentQuestion.sequence_id);
      onSaveSRS(updated);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOption('');
      setAttemptedWrongOptions([]);
      setIsAnsweredCorrectly(false);
      setTimeElapsed(0);
    } else {
      setSessionCompleted(true);
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  };

  if (!currentQuestion || sessionCompleted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-14 h-14 mx-auto rounded-xl bg-success-bg text-success flex items-center justify-center border border-success-border">
          <Award className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-primary theme-text-primary">
            Sessão de Fixação Concluída
          </h2>
          <p className="text-muted theme-text-muted text-xs sm:text-sm">
            Seu progresso e retenção foram salvos com sucesso.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          <div className="p-3.5 theme-card border border-border rounded-lg">
            <div className="text-lg font-bold xp-badge-text">+{sessionXP}</div>
            <div className="text-[11px] text-muted theme-text-muted mt-0.5">XP Ganho</div>
          </div>
          <div className="p-3.5 theme-card border border-border rounded-lg">
            <div className="text-lg font-bold text-success">
              {correctInSession}/{queue.length}
            </div>
            <div className="text-[11px] text-muted theme-text-muted mt-0.5">Acertos de 1ª</div>
          </div>
          <div className="p-3.5 theme-card border border-border rounded-lg">
            <div className="text-lg font-bold xp-streak-text flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 xp-flame-icon" />
              {streakDays}
            </div>
            <div className="text-[11px] text-muted theme-text-muted mt-0.5">Ofensiva</div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOption('');
              setAttemptedWrongOptions([]);
              setIsAnsweredCorrectly(false);
              setSessionCompleted(false);
            }}
            className="px-4 py-2 bg-surface-subtle hover:bg-surface-hover text-secondary theme-text-secondary border border-border font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Treinar Novamente
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 theme-btn-accent font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Voltar para a Prática Geral
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-4 py-2">
      {/* Progress Bar & Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onExit}
          className="text-xs text-muted hover:text-primary px-2.5 py-1 rounded border border-border transition-colors cursor-pointer flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>

        <div className="flex-1 h-2 bg-surface-subtle border border-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="text-xs font-mono text-muted">
          {currentIndex + 1}/{queue.length}
        </span>
      </div>

      {/* Main Question Card in Fixação Mode */}
      <div className="theme-card border border-border rounded-xl p-6 sm:p-8 space-y-5 shadow-xs">
        
        {/* Taxonomies */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-accent-subtle text-accent border border-accent/20 font-medium rounded-md">
              {currentQuestion.metadata.subject}
            </span>
            <span className="text-muted">
              {currentQuestion.metadata.exam_board} • {currentQuestion.metadata.year}
            </span>
            <span 
              className="px-2 py-0.5 bg-surface-subtle text-secondary theme-text-secondary font-medium rounded-md flex items-center gap-1 text-[11px] border border-border"
              title="Alternativas embaralhadas ativamente neste modo para evitar memorização por letra/posição e treinar a retenção real do conteúdo."
            >
              <Shuffle className="w-3 h-3 text-secondary theme-text-secondary" />
              <span>Alternativas Embaralhadas</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-mono text-muted bg-surface-subtle px-2 py-0.5 rounded border border-border">
              <Timer className="w-3 h-3 text-muted" />
              <span>{formatTimer(timeElapsed)}</span>
            </div>
            <span className="text-muted font-mono text-[11px]" title="Identificador único da questão no banco">
              Ref #{currentQuestion.sequence_id}
            </span>
          </div>
        </div>

        {/* Associated Context Snippet if present */}
        {currentQuestion.associated_context?.has_associated_context && (
          <div className="p-3.5 bg-surface-subtle border border-border rounded-lg text-xs text-secondary theme-text-secondary max-h-32 overflow-y-auto leading-relaxed">
            <span className="font-semibold text-primary theme-text-primary block mb-1">
              {currentQuestion.associated_context.title || 'Texto de Apoio'}
            </span>
            <p className="whitespace-pre-line">{currentQuestion.associated_context.content}</p>
          </div>
        )}

        {/* Stem */}
        <div className="text-primary theme-text-primary font-medium text-base leading-relaxed whitespace-pre-line">
          {currentQuestion.stem.full_text}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {shuffledOptions.map((opt) => {
            const isSelected = selectedOption === opt.letter;
            const isTarget = opt.letter === targetLetter;
            const isAttemptedWrong = attemptedWrongOptions.includes(opt.letter);
            
            let btnClass = 'theme-card hover:border-[var(--theme-border-hover)] text-primary theme-text-primary cursor-pointer';
            
            if (isAnsweredCorrectly) {
              if (isTarget) {
                btnClass = 'theme-option-correct font-medium';
              } else {
                btnClass = 'opacity-40 theme-card-subtle text-muted';
              }
            } else if (isAttemptedWrong) {
              btnClass = 'theme-option-wrong font-medium';
            } else if (isSelected) {
              btnClass = 'theme-option-selected font-medium shadow-xs';
            }

            return (
              <button
                key={opt.letter}
                onClick={() => handleSelectOption(opt.letter)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-lg text-left transition-colors ${btnClass}`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                    isAnsweredCorrectly && isTarget
                      ? 'bg-success text-success-contrast theme-badge-correct'
                      : isAttemptedWrong
                      ? 'bg-danger text-danger-contrast theme-badge-wrong'
                      : isSelected
                      ? 'bg-accent text-accent-contrast theme-badge-selected'
                      : 'bg-surface-subtle text-secondary theme-text-secondary border border-border'
                  }`}
                >
                  {opt.letter}
                </div>
                <div className="flex-1 text-sm leading-relaxed pt-0.5">
                  {opt.text}
                </div>
              </button>
            );
          })}
        </div>

        {/* Wrong feedback banner */}
        {!isAnsweredCorrectly && attemptedWrongOptions.length > 0 && (
          <div className="p-3 rounded-lg border border-danger-border bg-danger-bg text-danger text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <XCircle className="w-4 h-4 shrink-0 text-danger" />
            <span>
              Alternativa <strong>{attemptedWrongOptions[attemptedWrongOptions.length - 1]}</strong> incorreta. Analise o enunciado e tente outra alternativa!
            </span>
          </div>
        )}

        {/* Bottom Actions */}
        {!isAnsweredCorrectly ? (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleConfirmAnswer}
              disabled={!selectedOption}
              className="px-5 py-2 theme-btn-accent disabled:opacity-40 disabled:cursor-not-allowed font-medium rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{attemptedWrongOptions.includes(selectedOption) ? 'Tentar Novamente' : 'Verificar Resposta'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-3 border-t border-border animate-in fade-in duration-150">
            <div className="p-3.5 rounded-lg border border-success-border bg-success-bg text-success text-xs">
              <div className="font-semibold flex items-center gap-1.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>
                  Resposta Correta! Alternativa ({targetLetter}){targetLetter !== originalTargetLetter ? ` [Original: (${originalTargetLetter})]` : ''}.
                </span>
              </div>
              <p className="opacity-85 mt-1 leading-relaxed">
                {currentQuestion.resolution?.pedagogical_explanation ||
                  (currentQuestion.resolution as any)?.explanation ||
                  (currentQuestion.resolution as any)?.cot_reasoning ||
                  (currentQuestion.resolution as any)?.comentario ||
                  ''}
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 theme-btn-accent font-medium rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>{currentIndex + 1 < queue.length ? 'Próxima Questão' : 'Finalizar Sessão'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
