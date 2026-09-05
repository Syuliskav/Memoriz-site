import React, { useState, useEffect, useMemo } from 'react';
import { Question, SimuladoResult } from '../types/question';
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
  EyeOff
} from 'lucide-react';

interface SimuladoViewProps {
  questions: Question[];
  onRecordSimuladoResult: (result: SimuladoResult) => void;
  onExit: () => void;
  isPaused?: boolean;
}

export const SimuladoView: React.FC<SimuladoViewProps> = ({
  questions,
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

  const uniqueQuestions = useMemo(() => deduplicateQuestions(questions), [questions]);
  const subjects = useMemo(() => Array.from(new Set(uniqueQuestions.map(q => q.metadata.subject))).sort(), [uniqueQuestions]);

  const handleStartSimulado = () => {
    let pool = uniqueQuestions;
    if (selectedSubject !== 'all') {
      pool = pool.filter(q => q.metadata.subject === selectedSubject);
    }
    
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount, pool.length));
    
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
      score_percentage: Math.round((correct / simuladoQuestions.length) * 100),
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
    const availableCount = selectedSubject === 'all' 
      ? questions.length 
      : questions.filter(q => q.metadata.subject === selectedSubject).length;

    return (
      <div className="max-w-xl mx-auto py-6 space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 theme-badge-accent rounded-xl flex items-center justify-center mx-auto mb-2">
            <Timer className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-primary">
            Modo Simulado Cronometrado
          </h2>
          <p className="text-muted text-xs sm:text-sm">
            Condições reais de prova com contagem regressiva e gabarito ao final.
          </p>
        </div>

        <div className="theme-card rounded-xl p-6 space-y-5 shadow-xs">
          {/* Subject selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary">
              Disciplina / Área
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full p-2.5 theme-input rounded-lg text-xs font-medium"
            >
              <option value="all">Todas as Disciplinas ({questions.length} questões)</option>
              {subjects.map(s => (
                <option key={s} value={s}>
                  {s} ({questions.filter(q => q.metadata.subject === s).length} questões)
                </option>
              ))}
            </select>
          </div>

          {/* Question count */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary flex justify-between">
              <span>Quantidade de Questões</span>
              <span className="text-accent font-bold">{Math.min(questionCount, availableCount)}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 30].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 text-xs font-medium rounded-lg cursor-pointer ${
                    questionCount === count
                      ? 'theme-chip-active'
                      : 'theme-chip-inactive'
                  }`}
                >
                  {count} itens
                </button>
              ))}
            </div>
          </div>

          {/* Time limit */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-secondary flex justify-between">
              <span>Tempo Limite</span>
              <span className="text-accent font-bold">{timeLimitMinutes} min</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 45, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTimeLimitMinutes(mins)}
                  className={`py-2 text-xs font-medium rounded-lg cursor-pointer ${
                    timeLimitMinutes === mins
                      ? 'theme-chip-active'
                      : 'theme-chip-inactive'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStartSimulado}
            disabled={availableCount === 0}
            className="w-full py-2.5 theme-btn-accent disabled:opacity-40 font-medium rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Iniciar Simulado</span>
          </button>
        </div>
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
      <div className="max-w-4xl mx-auto space-y-4 py-2">
        {/* Header with Timer */}
        <div className="theme-card rounded-xl p-4 flex items-center justify-between">
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
              onClick={() => setShowFinishConfirm(true)}
              className="px-3 py-1 bg-danger hover:opacity-90 text-white font-medium rounded-md text-xs transition-colors cursor-pointer"
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
                  className="px-3.5 py-1.5 bg-danger hover:opacity-90 text-white font-medium rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
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
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-md text-xs font-semibold shrink-0 transition-colors relative border ${
                  isCur
                    ? 'border-accent bg-accent text-white'
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
        <div className="theme-card rounded-xl p-6 sm:p-8 space-y-5">
          
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
                  onClick={() => {
                    setUserAnswers(prev => ({ ...prev, [currentQ.sequence_id]: opt.letter }));
                  }}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-lg border text-left cursor-pointer ${
                    isSelected
                      ? 'theme-option-selected font-medium'
                      : 'theme-option-default'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected ? 'bg-accent text-white' : 'bg-surface-subtle border border-border text-secondary'
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
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="theme-btn-secondary flex items-center gap-1 px-3 py-1.5 disabled:opacity-30 rounded-lg text-xs font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <button
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
      <div className="max-w-3xl mx-auto py-6 space-y-6">
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
