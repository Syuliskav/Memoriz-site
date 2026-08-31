import React, { useState, useEffect } from 'react';
import { Question, SRSItem, UserAnswerRecord } from '../types/question';
import { 
  Flame, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateNextSRS } from '../lib/srsEngine';
import { deduplicateQuestions } from '../lib/duplicateEngine';

interface SRSModeViewProps {
  questions: Question[];
  srsItems: Record<number, SRSItem>;
  onSaveSRS: (item: SRSItem) => void;
  onRecordAnswer: (record: UserAnswerRecord) => void;
  streakDays: number;
  onExit: () => void;
}

export const SRSModeView: React.FC<SRSModeViewProps> = ({
  questions,
  srsItems,
  onSaveSRS,
  onRecordAnswer,
  streakDays,
  onExit,
}) => {
  const [queue, setQueue] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [sessionXP, setSessionXP] = useState<number>(0);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [correctInSession, setCorrectInSession] = useState<number>(0);

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

  const handleSelectOption = (letter: string) => {
    if (isAnswered) return;
    setSelectedOption(letter);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
    setIsAnswered(true);

    const isCorrect = selectedOption === currentQuestion.resolution.deduced_answer;
    const earnedXP = isCorrect ? 20 : 5;
    
    setSessionXP(xp => xp + earnedXP);
    if (isCorrect) setCorrectInSession(c => c + 1);

    // Record answer
    onRecordAnswer({
      question_id: currentQuestion.sequence_id,
      selected_letter: selectedOption,
      is_correct: isCorrect,
      timestamp: Date.now(),
      time_spent_seconds: 15,
      mode: 'srs',
    });

    // Automatically update spaced repetition schedule in background
    const currentSRS = srsItems[currentQuestion.sequence_id];
    const rating = isCorrect ? 3 : 1;
    const updated = calculateNextSRS(currentSRS, rating, currentQuestion.sequence_id);
    onSaveSRS(updated);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(i => i + 1);
      setSelectedOption('');
      setIsAnswered(false);
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
        <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
          <Award className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Sessão de Fixação Concluída
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Seu progresso e retenção foram salvos com sucesso.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">+{sessionXP}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">XP Ganho</div>
          </div>
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {correctInSession}/{queue.length}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Acertos</div>
          </div>
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <div className="text-lg font-bold text-amber-500 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-500" />
              {streakDays}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Ofensiva</div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOption('');
              setIsAnswered(false);
              setSessionCompleted(false);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Treinar Novamente
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            Voltar para a Prática Geral
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQuestion.resolution.deduced_answer;
  const progressPercent = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-4 py-2">
      {/* Progress Bar & Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onExit}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
        >
          ✕ Sair
        </button>

        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <span className="text-xs font-mono text-slate-500">
          {currentIndex + 1}/{queue.length}
        </span>
      </div>

      {/* Main Question Card in Fixação Mode */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-5 shadow-xs">
        
        {/* Taxonomies */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium rounded-md">
              {currentQuestion.metadata.subject}
            </span>
            <span className="text-slate-400">
              {currentQuestion.metadata.exam_board} • {currentQuestion.metadata.year}
            </span>
          </div>

          <span className="text-slate-400 font-mono text-[11px]">
            Questão #{currentQuestion.sequence_id}
          </span>
        </div>

        {/* Associated Context Snippet if present */}
        {currentQuestion.associated_context?.has_associated_context && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-700 dark:text-slate-300 max-h-32 overflow-y-auto leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-slate-100 block mb-1">
              {currentQuestion.associated_context.title || 'Texto de Apoio'}
            </span>
            <p className="whitespace-pre-line">{currentQuestion.associated_context.content}</p>
          </div>
        )}

        {/* Stem */}
        <div className="text-slate-900 dark:text-slate-100 font-medium text-base leading-relaxed whitespace-pre-line">
          {currentQuestion.stem.full_text}
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOption === opt.letter;
            const isTarget = opt.letter === currentQuestion.resolution.deduced_answer;
            
            let btnClass = 'bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-800 dark:text-slate-200 cursor-pointer';
            
            if (isAnswered) {
              if (isTarget) {
                btnClass = 'bg-emerald-500/10 border border-emerald-500 text-emerald-900 dark:text-emerald-200 font-medium';
              } else if (isSelected && !isCorrect) {
                btnClass = 'bg-rose-500/10 border border-rose-500 text-rose-900 dark:text-rose-200 font-medium';
              } else {
                btnClass = 'opacity-40 bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800';
              }
            } else if (isSelected) {
              btnClass = 'bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-500 text-indigo-950 dark:text-indigo-100 font-medium';
            }

            return (
              <button
                key={opt.letter}
                onClick={() => handleSelectOption(opt.letter)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-lg text-left transition-colors ${btnClass}`}
              >
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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

        {/* Bottom Actions */}
        {!isAnswered ? (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleConfirmAnswer}
              disabled={!selectedOption}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-medium rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verificar Resposta</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-150">
            <div className={`p-3.5 rounded-lg border text-xs ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200' : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'}`}>
              <div className="font-semibold flex items-center gap-1.5 text-sm">
                {isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                <span>{isCorrect ? 'Resposta Correta!' : `Resposta Incorreta. Gabarito: (${currentQuestion.resolution.deduced_answer}).`}</span>
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
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
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
