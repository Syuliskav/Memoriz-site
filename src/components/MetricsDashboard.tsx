import React, { useMemo } from 'react';
import { UserStatistics, SRSItem, Question, UserAnswerRecord } from '../types/question';
import { 
  BarChart3, 
  Flame, 
  Award, 
  Sparkles, 
  TrendingUp, 
  RotateCcw
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Desempenho e Retenção</span>
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Estatísticas calculadas localmente na memória do dispositivo.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Tem certeza que deseja zerar todas as estatísticas e histórico de respostas?')) {
              onResetProgress();
            }
          }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors self-start sm:self-center font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Zerar Progresso</span>
        </button>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Taxa de Acerto</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {accuracy}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {totalCorrect} acertos de {totalAnswered}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Ofensiva Atual</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">
            {stats?.streak_days || 1} dias
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Recorde: {stats?.streak_days || 1} dias
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Pontuação Total</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1.5">
            {totalXP} XP
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Nível {currentLevel} ({levelTitle})
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Simulados Feitos</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1.5">
            {simuladosCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Testes sob pressão
          </div>
        </div>
      </div>

      {/* Content Mastery Distribution */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-xs">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
          Nível de Domínio e Retenção do Conteúdo
        </h3>

        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Mestre (&gt; 95% retenção)</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">{mestreCount} questões</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(mestreCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Especialista (70% - 94%)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{especialistaCount} questões</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(especialistaCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Praticante (35% - 69%)</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{praticanteCount} questões</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(praticanteCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Aprendiz (1% - 34%)</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{aprendizCount} questões</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(aprendizCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">Não Estudado (0%)</span>
              <span className="font-semibold text-slate-400">{novatoCount} questões</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-300 dark:bg-slate-700 rounded-full" style={{ width: `${(novatoCount / totalQuestionsCount) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-xs">
        <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
          Aproveitamento por Disciplina
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                  <div className="font-medium text-slate-900 dark:text-slate-100">{subject}</div>
                  <div className="text-[11px] text-slate-400">
                    {subjectQuestions.length} questões no banco • {answered} resolvidas
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-semibold text-slate-900 dark:text-white">
                    {pct}% acerto
                  </div>
                  <div className="text-[11px] text-slate-400">
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
