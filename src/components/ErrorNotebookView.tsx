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
        <div className="w-14 h-14 bg-success-bg text-success rounded-xl flex items-center justify-center mx-auto border border-success-border">
          <CheckCircle2 className="w-7 h-7" />
        </div>
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
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 py-2">
      {/* Header Banner */}
      <div className="bg-danger-bg border border-danger-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-danger text-white rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-danger">
              Caderno de Erros
            </h2>
            <p className="text-xs text-secondary theme-text-secondary">
              {errorQuestions.length} questões com erro para fixação e re-estudo.
            </p>
          </div>
        </div>

        {errorQuestions.length > 0 && (
          <button
            onClick={() => onStartPracticeQuestion(errorQuestions[0])}
            className="px-4 py-2 theme-btn-danger font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 self-start sm:self-center cursor-pointer"
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
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-accent text-white border-transparent'
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
                    ? 'bg-accent text-white border-transparent'
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
        {filteredErrors.map((q) => {
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
                  <span className="text-muted">• {q.metadata.exam_board} • {q.metadata.year}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-danger font-medium text-xs bg-danger-bg px-2.5 py-1 rounded-md border border-danger-border">
                    Sua marcação anterior: <span className="font-mono font-bold">{ans?.selected_letter || '—'}</span>
                  </span>
                  <button
                    onClick={() => onStartPracticeQuestion(q)}
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
