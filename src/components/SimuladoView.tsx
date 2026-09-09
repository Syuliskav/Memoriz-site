import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Question, SimuladoResult, UserAnswerRecord } from '../types/question';
import { deduplicateQuestions } from '../lib/duplicateEngine';
import { useTrackSnapDrag } from '../hooks/usePointerDrag';
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
  Clock,
  Plus,
  Minus
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
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Track drag-to-scroll state for desktop (only when overflowing)
  const [isTrackDragging, setIsTrackDragging] = useState(false);
  const isTrackPointerDownRef = useRef(false);
  const hasTrackDraggedRef = useRef(false);
  const startTrackXRef = useRef(0);
  const startTrackScrollLeftRef = useRef(0);

  const matchedIndex = options.indexOf(value);
  const activeIndex = matchedIndex >= 0 ? matchedIndex : 0;

  // Measure overflow with ResizeObserver
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const hasOverflow = containerRef.current.scrollWidth > containerRef.current.clientWidth + 2;
        setIsOverflowing(hasOverflow);
      }
    };

    checkOverflow();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      checkOverflow();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [options]);

  const {
    isDragging: isPillDragging,
    pillGeometry,
    handlePointerDown: handlePillPointerDown,
    handlePointerMove: handlePillPointerMove,
    handlePointerUp: handlePillPointerUp,
    handlePointerCancel: handlePillPointerCancel,
  } = useTrackSnapDrag({
    itemCount: options.length,
    activeIndex,
    containerRef,
    getItemElement: (idx) => buttonRefs.current[idx],
    dragThreshold: 4,
    useContinuousInterpolation: false,
    onDragMove: (info) => {
      if (containerRef.current) {
        const container = containerRef.current;
        const targetBtn = buttonRefs.current[info.closestIndex];
        const w = targetBtn ? targetBtn.offsetWidth : 40;
        const pillRight = info.clampedLeft + w;
        if (pillRight > container.scrollLeft + container.clientWidth - 16) {
          container.scrollLeft = pillRight - container.clientWidth + 16;
        } else if (info.clampedLeft < container.scrollLeft + 16) {
          container.scrollLeft = info.clampedLeft - 16;
        }
      }
    },
    onSnap: (finalIdx) => {
      const selectedOpt = options[finalIdx];
      if (selectedOpt !== undefined) {
        onChange(selectedOpt);
        const targetBtn = buttonRefs.current[finalIdx];
        if (targetBtn) {
          targetBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
      }
    },
  });

  // Track Background Drag-to-Scroll Handlers (active only when overflowing)
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isOverflowing || e.button !== 0) return;
    isTrackPointerDownRef.current = true;
    hasTrackDraggedRef.current = false;
    startTrackXRef.current = e.clientX;
    startTrackScrollLeftRef.current = containerRef.current ? containerRef.current.scrollLeft : 0;
  };

  const handleTrackPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isTrackPointerDownRef.current || isPillDragging) return;
    const delta = e.clientX - startTrackXRef.current;

    if (!hasTrackDraggedRef.current && Math.abs(delta) > 4) {
      hasTrackDraggedRef.current = true;
      setIsTrackDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }

    if (hasTrackDraggedRef.current && containerRef.current) {
      containerRef.current.scrollLeft = startTrackScrollLeftRef.current - delta;
    }
  };

  const handleTrackPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTrackPointerDownRef.current) {
      isTrackPointerDownRef.current = false;
      if (hasTrackDraggedRef.current) {
        setTimeout(() => {
          hasTrackDraggedRef.current = false;
        }, 50);
      }
      setIsTrackDragging(false);
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleTrackPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    isTrackPointerDownRef.current = false;
    hasTrackDraggedRef.current = false;
    setIsTrackDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-1.5" id={`selector-group-${id}`}>
      <label htmlFor={`btn-decrement-${id}`} className="text-xs font-semibold text-secondary block cursor-pointer">
        {label}
      </label>

      <div className="flex items-center gap-2">
        {/* Scrollable / Swipeable Sliding Track */}
        <div 
          ref={containerRef}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          onPointerCancel={handleTrackPointerCancel}
          className={`relative flex-1 flex items-center p-1 rounded-xl theme-card-subtle overflow-x-auto scrollbar-none select-none touch-pan-x ${
            isOverflowing 
              ? (isTrackDragging ? 'cursor-grabbing' : 'cursor-grab')
              : 'cursor-default'
          }`}
        >
          {/* Active sliding pill - Existing highlight div becomes draggable */}
          {matchedIndex >= 0 && pillGeometry && (
            <div
              onPointerDown={handlePillPointerDown}
              onPointerMove={handlePillPointerMove}
              onPointerUp={handlePillPointerUp}
              onPointerCancel={handlePillPointerCancel}
              className={`absolute top-1 bottom-1 rounded-lg bg-surface shadow-xs border border-border/70 z-20 touch-none select-none ${
                isPillDragging 
                  ? 'cursor-grabbing transition-none shadow-md' 
                  : 'cursor-grab transition-all duration-200 ease-out'
              }`}
              style={{
                left: `${pillGeometry.left}px`,
                width: `${pillGeometry.width}px`,
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
                onClick={(e) => {
                  if (hasTrackDraggedRef.current || isPillDragging) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  onChange(opt);
                }}
                className={`relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isOverflowing ? 'shrink-0' : 'flex-1 text-center'
                } ${
                  isSelected ? 'z-30 pointer-events-none' : 'z-30 cursor-pointer'
                } ${
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

        {/* Compact split-pill control for fine value adjustment */}
        <div 
          className="relative inline-flex items-center h-8 rounded-xl overflow-hidden border border-border/80 shadow-xs shrink-0 select-none min-w-[5.25rem] text-xs font-semibold"
          id={`pill-fine-control-${id}`}
        >
          {/* Left half: -10% composition variant */}
          <button
            type="button"
            id={`btn-decrement-${id}`}
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            aria-label={`Diminuir ${label}`}
            className="w-1/2 h-full pl-2 pr-3.5 bg-surface-elevated hover:bg-surface-hover/60 active:bg-surface-inset disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-start text-secondary hover:text-primary"
          >
            <Minus className="w-3 h-3 shrink-0" />
          </button>

          {/* Right half: +10% composition variant */}
          <button
            type="button"
            id={`btn-increment-${id}`}
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            aria-label={`Aumentar ${label}`}
            className="w-1/2 h-full pr-2 pl-3.5 bg-surface-inset hover:bg-surface-hover/60 active:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-end text-secondary hover:text-primary"
          >
            <Plus className="w-3 h-3 shrink-0" />
          </button>

          {/* Center exact value display */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4">
            <span className="text-xs font-semibold text-primary theme-text-primary whitespace-nowrap">
              {value}{unitSuffix}
            </span>
          </div>
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

  // Garante explicitamente que o modal de confirmação seja desmontado imediatamente caso o step mude
  useEffect(() => {
    if (step !== 'active') {
      setShowFinishConfirm(false);
    }
  }, [step]);

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
        message: 'A dificuldade não pôde ser estimada ou aferida com precisão por falta de dados.',
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
      levelBadgeClass = 'bg-warning-bg text-warning border-warning-border';
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
          try {
            finishSimulado();
          } catch (err) {
            console.error('Erro ao finalizar simulado por tempo esgotado:', err);
          }
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
    // Garante que qualquer modal pendente seja explicitamente desmontado
    setShowFinishConfirm(false);

    try {
      let correct = 0;
      let wrong = 0;
      let unanswered = 0;
      const answerBreakdown: SimuladoResult['answers'] = {};
      const questionsList = Array.isArray(simuladoQuestions) ? simuladoQuestions : [];

      for (const q of questionsList) {
        if (!q) continue;
        const seqId = q.sequence_id;
        const chosen = userAnswers?.[seqId] || '';
        const deduced = q.resolution?.deduced_answer || '';

        if (!chosen) {
          unanswered++;
          answerBreakdown[seqId] = {
            selected: '',
            correct: deduced,
            is_correct: false,
          };
        } else {
          const isRight = deduced ? chosen === deduced : false;
          if (isRight) {
            correct++;
          } else {
            wrong++;
          }
          answerBreakdown[seqId] = {
            selected: chosen,
            correct: deduced,
            is_correct: isRight,
          };
        }
      }

      const totalQ = questionsList.length;
      const result: SimuladoResult = {
        id: 'sim_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        time_spent_seconds: typeof totalSecondsSpent === 'number' ? totalSecondsSpent : 0,
        time_limit_seconds: (timeLimitMinutes || 0) * 60,
        total_questions: totalQ,
        correct_count: correct,
        wrong_count: wrong,
        unanswered_count: unanswered,
        score_percentage: totalQ > 0 ? Math.round((correct / totalQ) * 100) : 0,
        answers: answerBreakdown,
      };

      setSimuladoResult(result);
      try {
        onRecordSimuladoResult(result);
      } catch (recErr) {
        console.error('Erro ao registrar resultado do simulado nas métricas:', recErr);
      }
      setStep('results');
    } catch (err) {
      console.error('Erro crítico ao finalizar simulado:', err);
      // Fallback defensivo para garantir que a interface sempre transicione com segurança
      const totalQ = simuladoQuestions?.length || 0;
      const fallbackResult: SimuladoResult = {
        id: 'sim_err_' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        time_spent_seconds: totalSecondsSpent || 0,
        time_limit_seconds: (timeLimitMinutes || 0) * 60,
        total_questions: totalQ,
        correct_count: 0,
        wrong_count: 0,
        unanswered_count: totalQ,
        score_percentage: 0,
        answers: {},
      };
      setSimuladoResult(fallbackResult);
      setStep('results');
    }
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
                Disciplina / Área
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
              options={[5, 10, 15, 20, 25, 30, 40, 50, 75, 100]}
              min={1}
              max={Math.max(1, availableCount)}
              onChange={(val) => setQuestionCount(val)}
            />

            {/* Time limit with sliding selector & direct typing */}
            <SliderSelector
              id="time-limit"
              label="Tempo limite (min)"
              value={timeLimitMinutes}
              options={[5, 10, 15, 20, 30, 45, 60, 90, 120, 180]}
              min={1}
              max={300}
              onChange={(val) => setTimeLimitMinutes(val)}
            />

            {/* Difficulty Tag Estimation */}
            {difficultyEstimation.status === 'calculated' && (
              <div className="p-3.5 rounded-xl border border-border theme-card-subtle space-y-1.5" id="difficulty-estimation-card">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-secondary flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-accent" />
                    <span>Dificuldade Estimada da Prova</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${difficultyEstimation.levelBadgeClass}`}>
                    {difficultyEstimation.level}
                  </span>
                </div>

                <p className="text-[11px] text-muted leading-relaxed">
                  Tempo estimado previsto: <strong>{difficultyEstimation.expectedMinutes} min</strong> para {Math.min(questionCount, availableCount)} questões.
                </p>
              </div>
            )}

            {difficultyEstimation.status === 'insufficient_data' && (
              <p className="text-xs text-warning leading-relaxed py-1 text-center font-medium block w-full" id="difficulty-insufficient-data-msg">
                {difficultyEstimation.message}
              </p>
            )}

            {/* Start button */}
            {(() => {
              const effQuestions = Math.min(questionCount, Math.max(1, availableCount));
              const totalSecs = timeLimitMinutes * 60;
              const avgSecsPerQ = Math.round(totalSecs / (effQuestions || 1));

              return (
                <button
                  id="btn-start-simulado"
                  onClick={handleStartSimulado}
                  disabled={availableCount === 0}
                  className="w-full py-2.5 theme-btn-accent disabled:opacity-40 font-medium rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Simulado ({avgSecsPerQ}s/questão)</span>
                </button>
              );
            })()}
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
        {showFinishConfirm && step === 'active' && (
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
                  id="btn-confirm-finish-simulado"
                  onClick={() => {
                    // Desmonta imediatamente o modal de confirmação e seu backdrop do DOM
                    setShowFinishConfirm(false);
                    // Executa finishSimulado de forma desacoplada no próximo ciclo de eventos
                    // garantindo que a desmontagem do modal seja concluída independentemente de qualquer processamento
                    setTimeout(() => {
                      try {
                        finishSimulado();
                      } catch (err) {
                        console.error('Erro na chamada de finishSimulado:', err);
                      }
                    }, 0);
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
                  <span className="w-2 h-2 bg-warning rounded-full absolute -top-0.5 -right-0.5" />
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
                  ? 'bg-warning-bg border-warning-border text-warning font-medium'
                  : 'bg-surface-subtle border-border text-muted hover:text-primary'
              }`}
            >
              <Flag className={`w-3 h-3 ${isFlagged ? 'fill-warning text-warning' : ''}`} />
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
  if (step === 'results') {
    const safeResult: SimuladoResult = simuladoResult || {
      id: 'sim_safe_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      time_spent_seconds: totalSecondsSpent || 0,
      time_limit_seconds: (timeLimitMinutes || 0) * 60,
      total_questions: simuladoQuestions?.length || 0,
      correct_count: 0,
      wrong_count: 0,
      unanswered_count: simuladoQuestions?.length || 0,
      score_percentage: 0,
      answers: {},
    };

    const answersMap = safeResult.answers || {};
    const questionsList = Array.isArray(simuladoQuestions) ? simuladoQuestions : [];

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
            Tempo gasto: {formatTime(safeResult.time_spent_seconds || 0)}
          </p>
        </div>

        {/* Score Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 theme-card rounded-xl text-center shadow-xs">
            <div className="text-2xl font-bold text-accent">
              {typeof safeResult.score_percentage === 'number' ? safeResult.score_percentage : 0}%
            </div>
            <div className="text-xs text-muted mt-0.5 font-medium">Taxa de Acerto</div>
          </div>
          <div className="p-4 theme-card rounded-xl text-center shadow-xs">
            <div className="text-2xl font-bold text-success">
              {safeResult.correct_count ?? 0}
            </div>
            <div className="text-xs text-muted mt-0.5 font-medium">Acertos</div>
          </div>
          <div className="p-4 theme-card rounded-xl text-center shadow-xs">
            <div className="text-2xl font-bold text-danger">
              {safeResult.wrong_count ?? Math.max(0, (safeResult.total_questions || 0) - (safeResult.correct_count || 0) - (safeResult.unanswered_count || 0))}
            </div>
            <div className="text-xs text-muted mt-0.5 font-medium">Erros</div>
          </div>
          <div className="p-4 theme-card rounded-xl text-center shadow-xs">
            <div className="text-2xl font-bold text-secondary">
              {safeResult.unanswered_count ?? 0}
            </div>
            <div className="text-xs text-muted mt-0.5 font-medium">Em Branco</div>
          </div>
        </div>

        {/* Question Review List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-primary">
            Revisão das Questões
          </h3>
          
          {questionsList.map((q, idx) => {
            if (!q) return null;
            const seqId = q.sequence_id ?? idx;
            const ans = answersMap[seqId] || {
              selected: userAnswers?.[seqId] || '',
              correct: q.resolution?.deduced_answer || '',
              is_correct: false,
            };
            const wasAnswered = Boolean(ans?.selected);
            const isCorrect = wasAnswered && Boolean(ans?.is_correct);
            const isRevealed = Boolean(revealedUnanswered?.[seqId]);
            const deducedAnswer = q.resolution?.deduced_answer || ans?.correct || 'N/D';
            const subjectText = q.metadata?.subject || 'Geral';
            const examBoardText = q.metadata?.exam_board || '';
            const stemText = q.stem?.full_text || 'Enunciado não disponível.';
            const pedagogicalExplanation =
              q.resolution?.pedagogical_explanation ||
              (q.resolution as any)?.explanation ||
              (q.resolution as any)?.cot_reasoning ||
              (q.resolution as any)?.comentario ||
              'Gabarito oficial confirmado.';

            return (
              <div
                key={seqId}
                className="theme-card rounded-xl p-5 space-y-3 shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between text-xs pb-2.5 border-b border-border gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">Item #{idx + 1}</span>
                    <span className="text-muted">• {subjectText}</span>
                    {examBoardText && <span className="text-muted">• {examBoardText}</span>}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {wasAnswered ? (
                      isCorrect ? (
                        <span className="text-success flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" /> Acertou (Alternativa {ans?.selected || '?'})
                        </span>
                      ) : (
                        <span className="text-danger flex items-center gap-1 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> Errou (Você marcou {ans?.selected || '?'} → Gabarito {deducedAnswer})
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
                  {stemText}
                </p>

                {/* Commentary & Solution display */}
                {wasAnswered || isRevealed ? (
                  <div className="space-y-2 pt-1">
                    {!wasAnswered && (
                      <div className="text-xs font-semibold text-accent">
                        Gabarito Oficial: Alternativa {deducedAnswer}
                      </div>
                    )}
                    <div className="p-3 bg-surface-subtle border border-border rounded-lg text-xs text-secondary leading-relaxed">
                      <strong className="font-semibold text-primary">Comentário pedagógico:</strong>{' '}
                      {pedagogicalExplanation}
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => setRevealedUnanswered(prev => ({ ...prev, [seqId]: true }))}
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
