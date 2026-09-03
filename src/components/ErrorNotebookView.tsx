import React, { useState, useMemo } from 'react';
import { Question, UserAnswerRecord } from '../types/question';
import { getQuestionContentHash } from '../lib/duplicateEngine';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  ArrowRight
} from 'lucide-react';

interface ErrorNotebookViewProps {
  questions: Question[];
  lastAnswers: Record<number, UserAnswerRecord>;
  onStartPracticeQuestion: (question: Question) => void;
  onExit: () => void;
}

export const ErrorNotebookView: React.FC<ErrorNotebookViewProps> = ({
  questions,
  lastAnswers,
  onStartPracticeQuestion,
  onExit,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

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

  if (errorQuestions.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mx-auto border border-emerald-500/20">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Caderno de Erros Zerado
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
            Você não possui questões com histórico recente de erro. Continue praticando para manter sua retenção em 100%.
          </p>
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs sm:text-sm transition-colors"
        >
          Ir para Prática de Questões
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-2">
      {/* Header Banner */}
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-600 text-white rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rose-950 dark:text-rose-200">
              Caderno de Erros
            </h2>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/80">
              {errorQuestions.length} questões com erro para fixação e re-estudo.
            </p>
          </div>
        </div>

        {errorQuestions.length > 0 && (
          <button
            onClick={() => onStartPracticeQuestion(errorQuestions[0])}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Zerar Erros em Sequência</span>
          </button>
        )}
      </div>

      {/* Subject Filter Pills */}
      {subjects.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
              selectedSubject === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
                className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
                  selectedSubject === s
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-transparent'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
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
        {filteredErrors.map((q) => {
          const ans = lastAnswers[q.sequence_id];
          return (
            <div
              key={q.sequence_id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-slate-400 dark:hover:border-slate-600 transition-colors space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-semibold rounded">
                    #{q.sequence_id}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{q.metadata.subject}</span>
                  <span className="text-slate-400">• {q.metadata.exam_board} • {q.metadata.year}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-rose-600 dark:text-rose-400 font-medium text-xs bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900/60">
                    Sua marcação anterior: <span className="font-mono font-bold">{ans?.selected_letter || '—'}</span>
                  </span>
                  <button
                    onClick={() => onStartPracticeQuestion(q)}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Resolver</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 line-clamp-3 leading-relaxed font-normal">
                {q.stem.full_text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
