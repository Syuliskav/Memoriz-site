import React, { useState, useMemo } from 'react';
import { UserStatistics, SRSItem, Question, UserAnswerRecord } from '../types/question';
import { 
  BarChart3, 
  Flame, 
  Award, 
  Sparkles, 
  TrendingUp, 
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import { getMasteryPercentage } from '../lib/srsEngine';
import { LocalStorageManager } from '../lib/storage';
import { deduplicateQuestions } from '../lib/duplicateEngine';

interface MetricsDashboardProps {
  stats: UserStatistics;
  questions: Question[];
  srsItems: Record<number, SRSItem>;
  answers: Record<number, UserAnswerRecord[]>;
  onResetProgress: () => void;
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  stats,
  questions,
  srsItems,
  answers,
  onResetProgress,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const uniqueQuestions = useMemo(() => deduplicateQuestions(questions), [questions]);

  const totalAnswered = stats?.total_answered || 0;
  const totalCorrect = stats?.total_correct || 0;
  const accuracy = totalAnswered > 0 
    ? Math.round((totalCorrect / totalAnswered) * 100) 
    : 0;

  const totalXP = stats?.xp_points || 0;
  const currentLevel = Math.floor(totalXP / 100) + 1;
  const levelTitle = currentLevel >= 10 ? 'Especialista' : currentLevel >= 5 ? 'Avançado' : 'Iniciante';
  
  const simuladosCount = LocalStorageManager.getSimulados().length;

  let novatoCount = 0;
  let aprendizCount = 0;
  let praticanteCount = 0;
  let especialistaCount = 0;
  let mestreCount = 0;

  for (const q of uniqueQuestions) {
    const srs = srsItems[q.sequence_id];
    const pct = getMasteryPercentage(srs);
    if (pct === 0) novatoCount++;
    else if (pct < 35) aprendizCount++;
    else if (pct < 70) praticanteCount++;
    else if (pct < 95) especialistaCount++;
    else mestreCount++;
  }

  const subjectList = Array.from(new Set(uniqueQuestions.map(q => q.metadata.subject))) as string[];
  subjectList.sort();

  const totalQuestionsCount = Math.max(1, uniqueQuestions.length);

  return (
    <div className="max-w-4xl mx-auto space-y-5 py-2">
      {/* Top Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-primary theme-text-primary flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            <span>Desempenho e Retenção</span>
          </h2>
          <p className="text-muted theme-text-muted text-xs mt-0.5">
            Estatísticas calculadas localmente na memória do dispositivo.
          </p>
        </div>

        <button
          id="zerar-progresso-btn"
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-danger hover:bg-danger-bg rounded-lg border border-danger-border transition-colors self-start sm:self-center font-medium cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Zerar Progresso</span>
        </button>
      </div>

      {/* In-app Confirmation Modal for Resetting Progress */}
      {showResetConfirm && (
        <div
          id="reset-progress-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            className="w-full max-w-md theme-card border border-border rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-danger-bg text-danger flex items-center justify-center shrink-0 border border-danger-border">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-primary theme-text-primary">
                  Zerar todo o progresso e histórico?
                </h3>
                <p className="text-xs text-secondary theme-text-secondary leading-relaxed">
                  Esta ação reiniciará todas as estatísticas, histórico de resoluções, revisões espaçadas (SRS) e cadernos. Seus bancos de questões permanecerão intactos.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <button
                type="button"
                id="cancel-reset-progress-btn"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-secondary theme-text-secondary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                id="confirm-reset-progress-btn"
                onClick={() => {
                  onResetProgress();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 text-xs font-medium text-danger-contrast bg-danger hover:opacity-90 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sim, Zerar Tudo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="theme-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Taxa de Acerto</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="text-2xl font-bold text-primary theme-text-primary mt-1.5">
            {accuracy}%
          </div>
          <div className="text-[11px] text-muted theme-text-muted mt-0.5">
            {totalCorrect} acertos de {totalAnswered}
          </div>
        </div>

        <div className="theme-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Ofensiva Atual</span>
            <Flame className="w-4 h-4 text-amber" />
          </div>
          <div className="text-2xl font-bold text-amber mt-1.5">
            {stats?.streak_days || 1} dias
          </div>
          <div className="text-[11px] text-muted theme-text-muted mt-0.5">
            Recorde: {stats?.streak_days || 1} dias
          </div>
        </div>

        <div className="theme-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Pontuação Total</span>
            <Award className="w-4 h-4 xp-badge-icon" />
          </div>
          <div className="text-2xl font-bold xp-badge-text mt-1.5">
            {totalXP} XP
          </div>
          <div className="text-[11px] text-muted theme-text-muted mt-0.5">
            Nível {currentLevel} ({levelTitle})
          </div>
        </div>

        <div className="theme-card border border-border rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Simulados Feitos</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent mt-1.5">
            {simuladosCount}
          </div>
          <div className="text-[11px] text-muted theme-text-muted mt-0.5">
            Testes sob pressão
          </div>
        </div>
      </div>

      {/* Content Mastery Distribution */}
      <div className="theme-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
        <h3 className="font-semibold text-sm text-primary theme-text-primary">
          Nível de Domínio e Retenção do Conteúdo
        </h3>

        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-secondary theme-text-secondary">Mestre (&gt; 95% retenção)</span>
              <span className="font-semibold text-accent">{mestreCount} questões</span>
            </div>
            <div className="h-1.5 bg-surface-subtle border border-border rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${(mestreCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-secondary theme-text-secondary">Especialista (70% - 94%)</span>
              <span className="font-semibold text-success">{especialistaCount} questões</span>
            </div>
            <div className="h-1.5 bg-surface-subtle border border-border rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{ width: `${(especialistaCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-secondary theme-text-secondary">Praticante (35% - 69%)</span>
              <span className="font-semibold text-accent">{praticanteCount} questões</span>
            </div>
            <div className="h-1.5 bg-surface-subtle border border-border rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full" style={{ width: `${(praticanteCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-secondary theme-text-secondary">Aprendiz (1% - 34%)</span>
              <span className="font-semibold text-amber">{aprendizCount} questões</span>
            </div>
            <div className="h-1.5 bg-surface-subtle border border-border rounded-full overflow-hidden">
              <div className="h-full bg-amber rounded-full" style={{ width: `${(aprendizCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-secondary theme-text-secondary">Não Estudado (0%)</span>
              <span className="font-semibold text-muted">{novatoCount} questões</span>
            </div>
            <div className="h-1.5 bg-surface-subtle border border-border rounded-full overflow-hidden">
              <div className="h-full bg-muted rounded-full" style={{ width: `${(novatoCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown Table */}
      <div className="theme-card border border-border rounded-xl p-5 space-y-3 shadow-xs">
        <h3 className="font-semibold text-sm text-primary theme-text-primary">
          Aproveitamento por Disciplina
        </h3>

        <div className="divide-y divide-border">
          {subjectList.map((subject) => {
            const subjectQuestions = questions.filter(q => q.metadata.subject === subject);
            let answered = 0;
            let correct = 0;
            for (const q of subjectQuestions) {
              const hist = answers[q.sequence_id];
              if (hist && hist.length > 0) {
                answered++;
                if (hist[hist.length - 1].is_correct) correct++;
              }
            }

            const pct = answered > 0 ? Math.round((correct / answered) * 100) : 0;

            return (
              <div key={subject} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-primary theme-text-primary">{subject}</div>
                  <div className="text-[11px] text-muted">
                    {subjectQuestions.length} questões no banco • {answered} resolvidas
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-semibold text-primary theme-text-primary">
                    {pct}% acerto
                  </div>
                  <div className="text-[11px] text-muted">
                    {correct}/{answered} itens
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
