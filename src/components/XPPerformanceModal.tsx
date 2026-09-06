import React from 'react';
import { X, Flame, Award, Target, CheckCircle2, XCircle, TrendingUp, BookOpen } from 'lucide-react';
import { UserStatistics } from '../types/question';

interface XPPerformanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStatistics;
  onUpdateGoal: (newGoal: number) => void;
}

export const XPPerformanceModal: React.FC<XPPerformanceModalProps> = ({
  isOpen,
  onClose,
  stats,
  onUpdateGoal,
}) => {
  if (!isOpen) return null;

  const effectiveGoal = stats.daily_goal_xp > 0 ? stats.daily_goal_xp : 50;
  const currentTodayXP = stats.today_xp || 0;
  const goalPercent = Math.min(100, Math.round((currentTodayXP / effectiveGoal) * 100));
  
  const accuracyRate = stats.total_answered > 0 
    ? Math.round((stats.total_correct / stats.total_answered) * 100) 
    : 0;

  const goalOptions = [20, 50, 100, 150];

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="xp-modal-title"
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] max-h-[90dvh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border theme-card-subtle shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle text-accent flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 id="xp-modal-title" className="text-base font-bold text-primary theme-text-primary leading-tight">
                Painel de Desempenho & Metas
              </h2>
              <p className="text-xs text-muted">Acompanhe seu progresso e ritmo de estudos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Daily Goal Card (Duolingo style) */}
          <div className="p-4 rounded-xl border border-border theme-card bg-surface-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-secondary theme-text-secondary">
                <Target className="w-4 h-4 text-accent" />
                <span>Meta Diária de XP</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-accent-subtle text-accent flex items-center gap-1">
                {goalPercent >= 100 ? (
                  <>
                    <span>Meta Concluída!</span>
                    <span className="emoji-filter" data-emoji="true">🎉</span>
                  </>
                ) : (
                  <span>{`${currentTodayXP} / ${effectiveGoal} XP`}</span>
                )}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 rounded-full bg-border overflow-hidden">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
                style={{ width: `${goalPercent}%` }}
              />
            </div>

            {/* Goal Preset Selector */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted">Ajustar meta:</span>
              <div className="flex items-center gap-1.5">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => onUpdateGoal(goal)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                      effectiveGoal === goal
                        ? 'bg-accent text-accent-contrast border-accent shadow-xs'
                        : 'bg-surface text-secondary border-border hover:bg-surface-hover'
                    }`}
                  >
                    {goal} XP
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Streak */}
            <div className="p-3 rounded-xl border border-border bg-surface flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-amber mb-1">
                <Flame className="w-4 h-4 fill-amber" />
                <span className="text-lg font-bold font-mono">{stats.streak_days}d</span>
              </div>
              <span className="text-[11px] text-muted">Ofensiva</span>
            </div>

            {/* Total XP */}
            <div className="p-3 rounded-xl border border-border bg-surface flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-accent mb-1">
                <Award className="w-4 h-4" />
                <span className="text-lg font-bold font-mono">{stats.xp_points}</span>
              </div>
              <span className="text-[11px] text-muted">XP Total</span>
            </div>

            {/* Accuracy Rate */}
            <div className="p-3 rounded-xl border border-border bg-surface flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-success mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-lg font-bold font-mono">{accuracyRate}%</span>
              </div>
              <span className="text-[11px] text-muted">Aproveitamento</span>
            </div>

            {/* Total Answered */}
            <div className="p-3 rounded-xl border border-border bg-surface flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1 text-secondary theme-text-secondary mb-1">
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span className="text-lg font-bold font-mono">{stats.total_answered}</span>
              </div>
              <span className="text-[11px] text-muted">Respondidas</span>
            </div>
          </div>

          {/* Total Breakdown: Right vs Wrong */}
          <div className="p-3.5 rounded-xl border border-border bg-surface space-y-2">
            <div className="flex items-center justify-between text-xs text-secondary theme-text-secondary">
              <span className="flex items-center gap-1.5 text-success font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {stats.total_correct} Acertos
              </span>
              <span className="flex items-center gap-1.5 text-danger font-medium">
                <XCircle className="w-3.5 h-3.5" />
                {stats.total_wrong} Erros
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-danger/20 overflow-hidden flex">
              <div 
                className="h-full bg-success transition-all duration-300"
                style={{ width: `${stats.total_answered > 0 ? (stats.total_correct / stats.total_answered) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Subject Breakdown */}
          {Object.keys(stats.subject_stats || {}).length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-secondary theme-text-secondary">
                <BookOpen className="w-3.5 h-3.5 text-accent" />
                <span>Rendimento por Disciplina</span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(Object.entries(stats.subject_stats) as [string, { total: number; correct: number }][]).map(([subj, subStat]) => {
                  const rate = subStat.total > 0 ? Math.round((subStat.correct / subStat.total) * 100) : 0;
                  return (
                    <div key={subj} className="p-2.5 rounded-lg border border-border bg-surface text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary theme-text-primary truncate max-w-[220px]">
                          {subj}
                        </span>
                        <span className="font-mono text-muted text-[11px]">
                          {subStat.correct}/{subStat.total} ({rate}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-surface-subtle flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-accent text-accent-contrast rounded-lg text-xs font-semibold hover:bg-accent-hover transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
