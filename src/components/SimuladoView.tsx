import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Question, SimuladoResult, UserAnswerRecord } from '../types/question';
import { deduplicateQuestions } from '../lib/duplicateEngine';
import { 
  Timer, 
  Play, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  Flag, 
  HelpCircle, 
  Eye, 
  Gauge, 
  AlertTriangle, 
  Hash, 
  Clock 
} from 'lucide-react';

interface SimuladoViewProps {
  questions: Question[];
  lastAnswers?: Record<number, UserAnswerRecord>;
  onRecordSimuladoResult: (result: SimuladoResult) => void;
  onExit: () => void;
  isPaused?: boolean;
}

// Interactive Sliding Selector with direct typing support
interface SliderSelectorProps {
  id: string;
  label: string;
  value: number;
  options: number[];
  unitSuffix?: string;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
}

const SliderSelector: React.FC<SliderSelectorProps> = ({
  id,
  label,
  value,
  options,
  unitSuffix = '',
  min = 1,
  max = 999,
  onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number } | null>(null);

  const matchedIndex = options.indexOf(value);

  useEffect(() => {
    if (matchedIndex >= 0) {
      const btn = buttonRefs.current[matchedIndex];
      if (btn) {
        setPillStyle({
          left: btn.offsetLeft,
          width: btn.offsetWidth,
        });
        // Scroll into view if needed
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    } else {
      setPillStyle(null);
    }
  }, [matchedIndex, value, options]);

  return (
    <div className="space-y-1.5" id={`selector-group-${id}`}>
      <label htmlFor={`input-${id}`} className="text-xs font-semibold text-secondary block">
        {label}
      </label>

      <div className="flex items-center gap-2">
        {/* Scrollable / Swipeable Sliding Track */}
        <div 
          ref={containerRef}
          className="relative flex-1 flex items-center p-1 rounded-xl theme-card-subtle overflow-x-auto scrollbar-none select-none touch-pan-x"
        >
          {/* Active sliding pill */}
          {pillStyle && (
            <div
              className="absolute top-1 bottom-1 rounded-lg bg-surface shadow-xs border border-border/70 pointer-events-none transition-all duration-200"
              style={{
                left: `${pillStyle.left}px`,
                width: `${pillStyle.width}px`,
              }}
            />
          )}

          {options.map((opt, idx) => {
            const isSelected = value === opt;
            return (
              <button
                key={opt}
                ref={el => { buttonRefs.current[idx] = el; }}
                type="button"
                id={`btn-${id}-${opt}`}
                onClick={() => onChange(opt)}
                className={`relative z-10 px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors whitespace-nowrap cursor-pointer ${
                  isSelected 
                    ? 'text-primary theme-text-primary' 
                    : 'text-secondary theme-text-secondary hover:text-primary'
                }`}
              >
                {opt}{unitSuffix}
              </button>
            );
          })}
        </div>

        {/* Responsive numeric direct-typing input */}
        <div className="flex items-center gap-1 shrink-0">
          <input
            id={`input-${id}`}
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10);
              if (!isNaN(num)) {
                onChange(Math.max(min, Math.min(max, num)));
              }
            }}
            className="w-16 px-2 py-1.5 text-xs font-bold text-center rounded-lg theme-input text-primary font-mono focus:outline-none"
            aria-label={`${label} digitada`}
          />
        </div>
      </div>
    </div>
  );
};

export const SimuladoView: React.FC<SimuladoViewProps> = ({
  questions,
  lastAnswers,
  onRecordSimuladoResult,
  onExit,
  isPaused = false,
}) => {
  const [step, setStep] = useState<'setup' | 'active' | 'results'>('setup');
  
  // Config
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(20);

  // Active Simulado State
  const [simuladoQuestions, setSimuladoQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [totalSecondsSpent, setTotalSecondsSpent] = useState<number>(0);
  const [simuladoResult, setSimuladoResult] = useState<SimuladoResult | null>(null);
  const [revealedUnanswered, setRevealedUnanswered] = useState<Record<number, boolean>>({});
  const [showFinishConfirm, setShowFinishConfirm] = useState<boolean>(false);

  // Deduplicate and filter out already answered questions
  const uniqueQuestions = useMemo(() => deduplicateQuestions(questions), [questions]);
  
  const unansweredQuestions = useMemo(() => {
    if (!lastAnswers || Object.keys(lastAnswers).length === 0) {
      return uniqueQuestions;
    }
    return uniqueQuestions.filter(q => !lastAnswers[q.sequence_id]);
  }, [uniqueQuestions, lastAnswers]);

  const subjects = useMemo(() => {
    return Array.from(new Set(unansweredQuestions.map(q => q.metadata.subject))).sort();
  }, [unansweredQuestions]);

  const availableCount = useMemo(() => {
    return selectedSubject === 'all' 
      ? unansweredQuestions.length 
      : unansweredQuestions.filter(q => q.metadata.subject === selectedSubject).length;
  }, [unansweredQuestions, selectedSubject]);

  // Difficulty estimation based on time requirements
  const difficultyEstimation = useMemo(() => {
    const pool = selectedSubject === 'all' 
      ? unansweredQuestions 
      : unansweredQuestions.filter(q => q.metadata.subject === selectedSubject);

    const effectiveCount = Math.min(questionCount, pool.length);
    if (effectiveCount === 0) {
      return {
        status: 'no_questions' as const,
        message: 'Nenhuma questão não resolvida disponível para o filtro atual.',
      };
    }

    let missingCount = 0;
    let totalEstimatedSeconds = 0;
    let countWithData = 0;

    for (const q of pool) {
      const t = q.estimated_time_seconds || (q as any).estimated_time || (q as any).time_limit_seconds;
      if (typeof t === 'number' && t > 0) {
        totalEstimatedSeconds += t;
        countWithData++;
      } else {
        missingCount++;
      }
    }

    const missingPercentage = (missingCount / pool.length) * 100;

    // Strict rule: if missing data for > 10% of questions
    if (missingPercentage > 10) {
      return {
        status: 'insufficient_data' as const,
        message: 'dificuldade não pôde ser estimada ou aferida com precisão por falta de dados',
        missingPercentage: Math.round(missingPercentage),
      };
    }

    const avgSecondsPerQuestion = countWithData > 0 ? (totalEstimatedSeconds / countWithData) : 120;
    const expectedTotalSeconds = effectiveCount * avgSecondsPerQuestion;
    const chosenTotalSeconds = timeLimitMinutes * 60;

    // delta: percentage difference between chosen time and expected time
    const deltaPercent = ((chosenTotalSeconds - expectedTotalSeconds) / expectedTotalSeconds) * 100;

    let level: 'Muito Fácil' | 'Fácil' | 'Média' | 'Difícil' | 'Muito Difícil';
    let levelBadgeClass: string;

    if (deltaPercent > 25) {
      level = 'Muito Fácil';
      levelBadgeClass = 'bg-success-bg text-success border-success-border';
    } else if (deltaPercent >= 11) {
      level = 'Fácil';
      levelBadgeClass = 'bg-success-bg text-success border-success-border';
    } else if (deltaPercent >= -10) {
      level = 'Média';
      levelBadgeClass = 'bg-accent-subtle text-accent border-accent/30';
    } else if (deltaPercent >= -25) {
      level = 'Difícil';
      levelBadgeClass = 'bg-amber-bg text-amber border-amber-border';
    } else {
      level = 'Muito Difícil';
      levelBadgeClass = 'bg-danger-bg text-danger border-danger-border';
    }

    return {
      status: 'calculated' as const,
      level,
      levelBadgeClass,
      avgPerQuestionSecs: Math.round(avgSecondsPerQuestion),
      expectedMinutes: Math.max(1, Math.round(expectedTotalSeconds / 60)),
      deltaPercent: Math.round(deltaPercent),
    };
  }, [unansweredQuestions, selectedSubject, questionCount, timeLimitMinutes]);

  const handleStartSimulado = () => {
    let pool = unansweredQuestions;
    if (selectedSubject !== 'all') {
      pool = pool.filter(q => q.metadata.subject === selectedSubject);
    }
    
    const countToTake = Math.min(questionCount, pool.length);
    if (countToTake === 0) return;

    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, countToTake);
    
    setSimuladoQuestions(shuffled);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedQuestions(new Set());
    setSecondsRemaining(timeLimitMinutes * 60);
    setTotalSecondsSpent(0);
    setStep('active');
  };

  useEffect(() => {
    if (step !== 'active' || isPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishSimulado();
          return 0;
        }
        return prev - 1;
      });
      setTotalSecondsSpent(s => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, simuladoQuestions, userAnswers, isPaused]);

  const toggleFlag = (seqId: number) => {
    setFlaggedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(seqId)) next.delete(seqId);
      else next.add(seqId);
      return next;
    });
  };

  const finishSimulado = () => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const answerBreakdown: SimuladoResult['answers'] = {};

    for (const q of simuladoQuestions) {
      const chosen = userAnswers[q.sequence_id] || '';
      if (!chosen) {
        unanswered++;
        answerBreakdown[q.sequence_id] = {
          selected: '',
          correct: q.resolution.deduced_answer,
          is_correct: false,
        };
      } else {
        const isRight = chosen === q.resolution.deduced_answer;
        if (isRight) {
          correct++;
        } else {
          wrong++;
        }
        answerBreakdown[q.sequence_id] = {
          selected: chosen,
          correct: q.resolution.deduced_answer,
          is_correct: isRight,
        };
      }
    }

    const result: SimuladoResult = {
      id: 'sim_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time_spent_seconds: totalSecondsSpent,
      time_limit_seconds: timeLimitMinutes * 60,
      total_questions: simuladoQuestions.length,
      correct_count: correct,
      wrong_count: wrong,
      unanswered_count: unanswered,
      score_percentage: Math.round((correct / Math.max(1, simuladoQuestions.length)) * 100),
      answers: answerBreakdown,
    };

    setSimuladoResult(result);
    onRecordSimuladoResult(result);
    setStep('results');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. SETUP STEP
  if (step === 'setup') {
    return (
      <div className="max-w-xl mx-auto py-6 space-y-5" id="simulado-setup-view">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 theme-badge-accent rounded-xl flex items-center justify-center mx-auto mb-2">
            <Timer className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-primary">
            Modo Simulado Cronometrado
          </h2>
          <p className="text-muted text-xs sm:text-sm">
            Questões inéditas não resolvidas, cronômetro regressivo e gabarito ao final.
          </p>
        </div>

        {unansweredQuestions.length === 0 ? (
          <div className="theme-card rounded-xl p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-success-bg text-success mx-auto flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-primary">
              Todas as questões do banco já foram resolvidas!
            </h3>
            <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
              O modo Simulado seleciona apenas questões inéditas. Você pode revisar as questões já feitas no Modo Prática, no Caderno de Erros ou reiniciar seu histórico nas configurações.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onExit}
                className="theme-btn-secondary px-4 py-2 rounded-lg text-xs font-medium cursor-pointer"
              >
                Voltar para o Modo Prática
              </button>
            </div>
          </div>
        ) : (
          <div className="theme-card rounded-xl p-6 space-y-5 shadow-xs">
            {/* Subject selection */}
            <div className="space-y-1.5" id="simulado-subject-picker">
              <label htmlFor="select-subject" className="text-xs font-semibold text-secondary block">
                Disciplina / Área (Apenas questões não resolvidas)
              </label>
              <select
                id="select-subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2.5 theme-input rounded-lg text-xs font-medium"
              >
                <option value="all">
                  Todas as Disciplinas ({unansweredQuestions.length} questões disponíveis)
                </option>
                {subjects.map(s => (
                  <option key={s} value={s}>
                    {s} ({unansweredQuestions.filter(q => q.metadata.subject === s).length} questões)
                  </option>
                ))}
              </select>
            </div>

            {/* Question count with sliding selector & direct typing */}
            <SliderSelector
              id="question-count"
              label="Quantidade de questões"
              value={Math.min(questionCount, Math.max(1, availableCount))}
              options={[5, 10, 15, 20, 30, 50].filter(o => o <= Math.max(5, availableCount))}
              min={1}
              max={Math.max(1, availableCount)}
              onChange={(val) => setQuestionCount(val)}
            />

            {/* Time limit with sliding selector & direct typing */}
            <SliderSelector
              id="time-limit"
              label="Tempo limite"
              value={timeLimitMinutes}
              options={[5, 10, 15, 20, 30, 45, 60, 90, 120]}
              unitSuffix=" min"
              min={1}
              max={300}
              onChange={(val) => setTimeLimitMinutes(val)}
            />

            {/* Difficulty Tag Estimation */}
            <div className="p-3.5 rounded-xl border border-border theme-card-subtle space-y-1.5" id="difficulty-estimation-card">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-secondary flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-accent" />
                  <span>Dificuldade Estimada da Prova</span>
                </span>
                {difficultyEstimation.status === 'calculated' && (
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${difficultyEstimation.levelBadgeClass}`}>
                    {difficultyEstimation.level}
                  </span>
                )}
              </div>

              {difficultyEstimation.status === 'insufficient_data' && (
                <div className="flex items-start gap-2 text-xs text-amber leading-relaxed bg-amber-bg/50 p-2 rounded-lg border border-amber-border/40">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber" />
                  <span>{difficultyEstimation.message}</span>
                </div>
              )}

              {difficultyEstimation.status === 'calculated' && (
                <p className="text-[11px] text-muted leading-relaxed">
                  Tempo estimado previsto: <strong>{difficultyEstimation.expectedMinutes} min</strong> (~{difficultyEstimation.avgPerQuestionSecs}s por item) para {Math.min(questionCount, availableCount)} questões.
                </p>
              )}
            </div>

            {/* Start button */}
            <button
              id="btn-start-simulado"
              onClick={handleStartSimulado}
              disabled={availableCount === 0}
              className="w-full py-2.5 theme-btn-accent disabled:opacity-40 font-medium rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Iniciar Simulado ({Math.min(questionCount, availableCount)} itens)</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. ACTIVE EXAM STEP
  if (step === 'active') {
    const currentQ = simuladoQuestions[currentIndex];
    if (!currentQ) return null;

    const answeredCount = Object.keys(userAnswers).length;
    const isFlagged = flaggedQuestions.has(currentQ.sequence_id);

    return (
      <div className="max-w-4xl mx-auto space-y-4 py-2" id="simulado-active-view">
        {/* Header with Timer */}
        <div className="theme-card rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-xs sm:text-sm text-primary">
              Questão {currentIndex + 1} de {simuladoQuestions.length}
            </span>
            <span className="text-xs text-muted hidden sm:inline">
              ({answeredCount} respondidas)
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs font-semibold ${
              secondsRemaining < 180 
                ? 'bg-danger-bg text-danger border border-danger-border' 
                : 'bg-surface-subtle text-primary border border-border'
            }`}>
              <Timer className="w-3.5 h-3.5" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            <button
              id="btn-finish-simulado"
              onClick={() => setShowFinishConfirm(true)}
              className="px-3 py-1 bg-danger hover:opacity-90 text-danger-contrast font-medium rounded-md text-xs transition-colors cursor-pointer"
            >
              Finalizar Prova
            </button>
          </div>
        </div>

        {/* In-App Confirmation Modal for Finishing Simulado */}
        {showFinishConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="theme-card rounded-xl p-5 max-w-sm w-full space-y-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-danger-bg text-danger border border-danger-border rounded-lg">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-primary">
                    Finalizar Simulado?
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    Você respondeu <strong>{answeredCount} de {simuladoQuestions.length}</strong> questões. Deseja encerrar e ver seu resultado detalhado?
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowFinishConfirm(false)}
                  className="theme-btn-secondary px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  Continuar Prova
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFinishConfirm(false);
                    finishSimulado();
                  }}
                  className="px-3.5 py-1.5 bg-danger hover:opacity-90 text-danger-contrast font-medium rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Sim, Finalizar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Question Grid Navigator */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-surface-subtle rounded-lg border border-border scrollbar-none">
          {simuladoQuestions.map((q, idx) => {
            const hasAns = !!userAnswers[q.sequence_id];
            const isFlg = flaggedQuestions.has(q.sequence_id);
            const isCur = idx === currentIndex;

            return (
              <button
                key={q.sequence_id}
                id={`grid-btn-q-${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-md text-xs font-semibold shrink-0 transition-colors relative border cursor-pointer ${
                  isCur
                    ? 'border-accent bg-accent text-accent-contrast'
                    : hasAns
                    ? 'border-success-border bg-success-bg text-success'
                    : 'border-border bg-surface text-secondary hover:border-accent'
                }`}
              >
                {idx + 1}
                {isFlg && (
                  <span className="w-2 h-2 bg-amber rounded-full absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Question Area */}
        <div className="theme-card rounded-xl p-6 sm:p-8 space-y-5 shadow-xs">
          
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-accent-subtle text-accent border border-accent/30 font-medium rounded">
                {currentQ.metadata.subject}
              </span>
              <span className="text-muted">
                {currentQ.metadata.exam_board} • {currentQ.metadata.year}
              </span>
            </div>

            <button
              id="btn-flag-question"
              onClick={() => toggleFlag(currentQ.sequence_id)}
              className={`px-2.5 py-1 rounded-md border flex items-center gap-1 text-xs transition-colors cursor-pointer ${
                isFlagged
                  ? 'bg-amber-bg border-amber-border text-amber font-medium'
                  : 'bg-surface-subtle border-border text-muted hover:text-primary'
              }`}
            >
              <Flag className={`w-3 h-3 ${isFlagged ? 'fill-amber' : ''}`} />
              <span>{isFlagged ? 'Marcada' : 'Marcar para rever'}</span>
            </button>
          </div>

          {currentQ.associated_context?.has_associated_context && (
            <div className="p-3.5 bg-surface-subtle border border-border rounded-lg text-xs text-secondary max-h-36 overflow-y-auto leading-relaxed">
              <span className="font-semibold text-primary block mb-1">
                {currentQ.associated_context.title || 'Texto de Apoio'}
              </span>
              <p className="whitespace-pre-line">{currentQ.associated_context.content}</p>
            </div>
          )}

          <div className="text-primary font-medium text-base leading-relaxed whitespace-pre-line">
            {currentQ.stem.full_text}
          </div>

          <div className="space-y-2.5">
            {currentQ.options.map((opt) => {
              const isSelected = userAnswers[currentQ.sequence_id] === opt.letter;
              return (
                <button
                  key={opt.letter}
                  id={`opt-${opt.letter}`}
                  onClick={() => {
                    setUserAnswers(prev => ({ ...prev, [currentQ.sequence_id]: opt.letter }));
                  }}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'theme-option-selected font-medium'
                      : 'theme-option-default'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-accent text-accent-contrast' : 'bg-surface-subtle border border-border text-secondary'
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

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              id="btn-prev-question"
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="theme-btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-30 rounded-lg text-xs font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <button
              id="btn-next-question"
              onClick={() => setCurrentIndex(i => Math.min(simuladoQuestions.length - 1, i + 1))}
              disabled={currentIndex === simuladoQuestions.length - 1}
              className="theme-btn-accent flex items-center gap-1 px-4 py-1.5 disabled:opacity-30 rounded-lg text-xs font-medium cursor-pointer"
            >
              <span>Próxima</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. RESULTS REPORT STEP
  if (step === 'results' && simuladoResult) {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-6" id="simulado-results-view">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-accent-subtle text-accent rounded-xl flex items-center justify-center mx-auto border border-accent/30">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold text-primary">
            Resultado do Simulado
          </h2>
          <p className="text-muted text-xs sm:text-sm">
            Tempo gasto: {formatTime(simuladoResult.time_spent_seconds)}
          </p>
        </div>

        {/* Score Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 theme-card rounded-xl text-center shadow-xs">
            <div className="text-2xl font-bold text-accent">
              {simuladoResult.score_percentage}%
            </div>
            <div className="text-xs text-muted mt-0.5 font-medium">Taxa de Acerto</div>
          </div>
          <div className="p-4 theme-card rounded-xl text-center shadow-xs">
            <div className="text-2xl font-bold text-success">
              {simuladoResult.correct_count}
            </div>
            <div className="text-xs text-muted mt-0.5 font-medium">Acertos</div>
          </div>
          <div className="p-4 theme-card rounded-xl text-center shadow-xs">
            <div className="text-2xl font-bold text-danger">
              {simuladoResult.wrong_count ?? (simuladoResult.total_questions - simuladoResult.correct_count)}
            </div>
            <div className="text-xs text-muted mt-0.5 font-medium">Erros</div>
          </div>
          <div className="p-4 theme-card rounded-xl text-center shadow-xs">
            <div className="text-2xl font-bold text-secondary">
              {simuladoResult.unanswered_count ?? 0}
            </div>
            <div className="text-xs text-muted mt-0.5 font-medium">Em Branco</div>
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-primary">
            Revisão das Questões
          </h3>
          
          {simuladoQuestions.map((q, idx) => {
            const ans = simuladoResult.answers[q.sequence_id];
            const wasAnswered = Boolean(ans?.selected);
            const isCorrect = wasAnswered && ans?.is_correct;
            const isRevealed = Boolean(revealedUnanswered[q.sequence_id]);

            return (
              <div
                key={q.sequence_id}
                className="theme-card rounded-xl p-5 space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between text-xs pb-2.5 border-b border-border gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">Item #{idx + 1}</span>
                    <span className="text-muted">• {q.metadata.subject}</span>
                    <span className="text-muted">• {q.metadata.exam_board}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {wasAnswered ? (
                      isCorrect ? (
                        <span className="text-success flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Acertou (Alternativa {ans.selected})
                        </span>
                      ) : (
                        <span className="text-danger flex items-center gap-1 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Errou (Você marcou {ans.selected} → Gabarito {q.resolution.deduced_answer})
                        </span>
                      )
                    ) : (
                      <span className="text-muted bg-surface-subtle border border-border px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" /> Em Branco (Não respondida)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-primary leading-relaxed">
                  {q.stem.full_text}
                </p>

                {/* Commentary & Solution display */}
                {wasAnswered || isRevealed ? (
                  <div className="space-y-2 pt-1">
                    {!wasAnswered && (
                      <div className="text-xs font-semibold text-accent">
                        Gabarito Oficial: Alternativa {q.resolution.deduced_answer}
                      </div>
                    )}
                    <div className="p-3 bg-surface-subtle border border-border rounded-lg text-xs text-secondary leading-relaxed">
                      <strong className="font-semibold text-primary">Comentário pedagógico:</strong>{' '}
                      {q.resolution?.pedagogical_explanation ||
                        (q.resolution as any)?.explanation ||
                        (q.resolution as any)?.cot_reasoning ||
                        (q.resolution as any)?.comentario ||
                        'Gabarito oficial confirmado.'}
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => setRevealedUnanswered(prev => ({ ...prev, [q.sequence_id]: true }))}
                      className="flex items-center gap-1.5 text-xs text-accent hover:opacity-90 font-medium py-1 px-2.5 rounded-md bg-accent-subtle border border-accent/30 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Gabarito e Comentário desta questão</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => setStep('setup')}
            className="theme-btn-secondary px-4 py-2 font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Fazer Outro Simulado
          </button>
          <button
            onClick={onExit}
            className="theme-btn-accent px-4 py-2 font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Voltar para o Menu Geral
          </button>
        </div>
      </div>
    );
  }

  return null;
};
