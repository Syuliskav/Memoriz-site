import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  ArrowLeft, 
  Sun, 
  Moon, 
  BookOpen, 
  Eye, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Flame, 
  Scissors, 
  Layers, 
  Info,
  Bookmark
} from 'lucide-react';
import { QuestionCard } from './QuestionCard';
import { Card, Panel, Badge, PrimaryButton, SecondaryButton } from './ui/primitives';
import { 
  ThemeMode, 
  Question, 
  SRSItem, 
  SRSRating, 
  UserBookmark, 
  UserAnswerRecord 
} from '../types/question';

interface ThemeKitchenSinkProps {
  onExit: () => void;
  currentActiveTheme: ThemeMode;
  onSelectActiveTheme?: (theme: ThemeMode) => void;
}

const THEME_OPTIONS: {
  id: ThemeMode;
  name: string;
  subtitle: string;
  icon: typeof Sun;
  description: string;
  characteristics: string[];
}[] = [
  {
    id: 'light',
    name: 'LightTheme',
    subtitle: 'Tema Claro',
    icon: Sun,
    description: 'Interface diurna com fundo slate neutro, superfícies brancas de alto contraste e acento índigo profundo.',
    characteristics: [
      'Superfície branca pura (#ffffff) em fundo suave (#f1f5f9)',
      'Acento índigo clássico com excelente legibilidade diurna',
      'Contraste superior a 7:1 (WCAG AAA) para enunciados densos',
    ],
  },
  {
    id: 'dark',
    name: 'DarkTheme',
    subtitle: 'Tema Escuro',
    icon: Moon,
    description: 'Fundo preto obsidiano, cartões slate-900 e acento elétrico índigo de alto contraste.',
    characteristics: [
      'Fundo preto profundo (#07090e) ideal para telas OLED/AMOLED',
      'Superfícies slate (#0f172a) com bordas sutis e sem cinzas lavados',
      'Contraste elétrico índigo com foco visual direcionado',
    ],
  },
  {
    id: 'reading',
    name: 'ReadingTheme',
    subtitle: 'Tema Leitura',
    icon: BookOpen,
    description: 'Paleta pergaminho suave, tons canela e texto café escuro calibrado para leitura prolongada sem fadiga.',
    characteristics: [
      'Fundo pergaminho quente (#fbf5e8) que reduz reflexos na retina',
      'Tipografia café (#292524) e bordas suaves canela (#d5c3aa)',
      'Barra de rolagem estilizada em tom âmbar suave com trilho transparente',
    ],
  },
  {
    id: 'night',
    name: 'NightTheme',
    subtitle: 'Tema Noturno',
    icon: Eye,
    description: '100% espectro vermelho-âmbar com canal azul estritamente zerado (B = 0). Preserva a secreção de melatonina.',
    characteristics: [
      'Zero luz azul e verde nos pixels de texto e superfície (B = 0)',
      'Fundo preto rubi (#100300) e texto vermelho carmim (#ff9e80)',
      'Barra de rolagem vermelha (#801c00) com trilho 100% transparente',
    ],
  },
];

const SAMPLE_QUESTION: Question = {
  sequence_id: 99001,
  metadata: {
    reference_code: "SEN-2024-CONST-01",
    subject: "Direito Constitucional",
    topics: ["Controle de Constitucionalidade", "Ação Direta de Inconstitucionalidade"],
    year: 2024,
    exam_board: "FGV",
    institution: "Senado Federal",
    exam_name: "Concurso Público Senado",
    role: "Consultor Legislativo",
  },
  associated_context: {
    has_associated_context: false,
    title: "",
    source: "",
    content: "",
  },
  stem: {
    full_text: "Em matéria de controle concentrado de constitucionalidade perante o Supremo Tribunal Federal, considere a jurisprudência pacificada acerca da legitimidade ativa e dos efeitos temporais das decisões. Assinale a afirmativa correta:",
  },
  options: [
    { letter: "A", text: "A Mesa de Assembleia Legislativa possui legitimidade universal, dispensando a comprovação de pertinência temática." },
    { letter: "B", text: "A declaração incidental opera efeitos erga omnes automáticos, tornando dispensável a resolução do Senado Federal." },
    { letter: "C", text: "O Governador de Estado ostenta legitimação especial, dependendo da demonstração de pertinência temática entre a norma e as atribuições estaduais." },
    { letter: "D", text: "As confederações sindicais dispensam comprovação de representatividade de classe de âmbito nacional." },
    { letter: "E", text: "A modulação temporal dos efeitos em ação direta pode ser deferida por decisão unânime de comissão temática do Congresso." },
  ],
  resolution: {
    cot_reasoning: "O art. 103 da CF/88 divide os legitimados à ADI em universais e especiais. O Governador de Estado e a Mesa de Assembleia Legislativa são legitimados especiais, exigindo comprovação de pertinência temática.",
    deduced_answer: "C",
    pedagogical_explanation: "O Governador de Estado e a Mesa da Assembleia Legislativa integram o rol dos legitimados especiais (CF/88, art. 103, IV e V), necessitando comprovar o nexo de pertinência temática entre o objeto impugnado e as atribuições ou interesses do respectivo ente federativo."
  }
};

export const ThemeKitchenSink: React.FC<ThemeKitchenSinkProps> = ({
  onExit,
  currentActiveTheme,
  onSelectActiveTheme,
}) => {
  // Question card interactive state
  const [questionStrikes, setQuestionStrikes] = useState<string[]>([]);
  const [lastAnswer, setLastAnswer] = useState<UserAnswerRecord | undefined>(undefined);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [userNote, setUserNote] = useState<string>('');
  const [srsItem, setSrsItem] = useState<SRSItem | undefined>(undefined);

  // Form controls test state
  const [inputText, setInputText] = useState<string>('Exemplo de digitação no input');
  const [selectValue, setSelectValue] = useState<string>('fgv');
  const [checkboxChecked, setCheckboxChecked] = useState<boolean>(true);

  // Active theme info
  const activeConfig = THEME_OPTIONS.find(t => t.id === currentActiveTheme) || THEME_OPTIONS[0];

  // Token sampler (reads CSS variables computed by browser on :root)
  const [computedTokens, setComputedTokens] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rootStyles = window.getComputedStyle(document.documentElement);
      const tokens: Record<string, string> = {
        '--theme-app-bg': rootStyles.getPropertyValue('--theme-app-bg').trim(),
        '--theme-surface': rootStyles.getPropertyValue('--theme-surface').trim(),
        '--theme-text-primary': rootStyles.getPropertyValue('--theme-text-primary').trim(),
        '--theme-text-secondary': rootStyles.getPropertyValue('--theme-text-secondary').trim(),
        '--theme-accent': rootStyles.getPropertyValue('--theme-accent').trim(),
        '--theme-border': rootStyles.getPropertyValue('--theme-border').trim(),
        '--theme-success-text': rootStyles.getPropertyValue('--theme-success-text').trim(),
        '--theme-danger-text': rootStyles.getPropertyValue('--theme-danger-text').trim(),
      };
      setComputedTokens(tokens);
    }
  }, [currentActiveTheme]);

  // Handle QuestionCard answers
  const handleAnswerQuestion = (letter: string, timeSpentSeconds: number, answeredStrikes?: string[]) => {
    const isCorrect = letter === SAMPLE_QUESTION.resolution.deduced_answer;
    setLastAnswer({
      question_id: SAMPLE_QUESTION.sequence_id,
      selected_letter: letter,
      is_correct: isCorrect,
      time_spent_seconds: timeSpentSeconds,
      timestamp: Date.now(),
      mode: 'practice',
      eliminated_options: answeredStrikes || questionStrikes,
    });
  };

  const handleToggleStrike = (letter: string) => {
    setQuestionStrikes(prev => 
      prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]
    );
  };

  const handleRateSRS = (rating: SRSRating) => {
    const isEasy = rating === 3;
    setSrsItem({
      question_id: SAMPLE_QUESTION.sequence_id,
      repetition_count: rating === 1 ? 0 : 2,
      interval_days: rating === 1 ? 1 : (isEasy ? 7 : 4),
      ease_factor: 2.5,
      next_review_date: new Date(Date.now() + 86400000 * (rating === 1 ? 1 : 4)).toISOString().split('T')[0],
      last_reviewed_date: new Date().toISOString().split('T')[0],
      state: isEasy ? 'mastered' : 'learning',
      streak: rating === 1 ? 0 : 2,
      consecutive_correct: rating === 1 ? 0 : 2,
      total_reviews: 1,
      correct_reviews: rating === 1 ? 0 : 1,
    });
  };

  // Simulation presets for rapid testing
  const setPresetUnanswered = () => {
    setLastAnswer(undefined);
    setQuestionStrikes([]);
  };

  const setPresetCorrect = () => {
    setLastAnswer({
      question_id: SAMPLE_QUESTION.sequence_id,
      selected_letter: 'C',
      is_correct: true,
      time_spent_seconds: 42,
      timestamp: Date.now(),
      mode: 'practice',
      eliminated_options: ['A', 'B'],
    });
    setQuestionStrikes(['A', 'B']);
  };

  const setPresetWrong = () => {
    setLastAnswer({
      question_id: SAMPLE_QUESTION.sequence_id,
      selected_letter: 'A',
      is_correct: false,
      time_spent_seconds: 55,
      timestamp: Date.now(),
      mode: 'practice',
      eliminated_options: ['B'],
    });
    setQuestionStrikes(['B']);
  };

  const setPresetStrikes = () => {
    setQuestionStrikes(['B', 'D', 'E']);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* 1. Header Toolbar with Global Theme Switcher */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onExit}
              className="p-2 rounded-xl theme-btn-secondary shrink-0 cursor-pointer"
              title="Voltar ao modo de estudo (Esc)"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-accent" />
                <h2 className="text-base sm:text-lg font-bold text-primary">
                  Painel Diagnóstico de Temas
                </h2>
                <Badge variant="subtle" size="xs">
                  Interno (:root)
                </Badge>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Auditoria visual em tempo real dos componentes reais sob o tema global ativo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SecondaryButton size="sm" onClick={onExit}>
              <span>Voltar ao Estudo</span>
            </SecondaryButton>
          </div>
        </div>

        {/* Global Theme Status Banner */}
        <div className="pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent text-accent-contrast flex items-center justify-center shrink-0 shadow-xs">
              <activeConfig.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary">
                  Tema Global Ativo: {activeConfig.name} ({activeConfig.subtitle})
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-subtle border border-border text-secondary">
                  html[data-theme="{currentActiveTheme}"]
                </span>
              </div>
              <p className="text-[11px] text-muted">
                Para alternar entre <strong>LightTheme</strong>, <strong>DarkTheme</strong>, <strong>ReadingTheme</strong> e <strong>NightTheme</strong>, utilize os ícones no topo da página.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Badge variant="accent" size="xs">
              Sincronizado Globalmente
            </Badge>
          </div>
        </div>
      </div>

      {/* 2. Active Theme Diagnosis & Specimen Summary */}
      <Card variant="default" padding="md" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-primary">
              Diagnóstico do Tema Ativo: {activeConfig.name} ({activeConfig.subtitle})
            </h3>
          </div>
          <Badge variant="accent" size="xs">
            Variáveis Globais Aplicadas
          </Badge>
        </div>

        <p className="text-xs text-secondary leading-relaxed">
          {activeConfig.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
          {activeConfig.characteristics.map((c, i) => (
            <div key={i} className="flex items-start gap-1.5 p-2 rounded-lg bg-surface-subtle border border-border text-secondary">
              <span className="text-accent font-bold">•</span>
              <span className="text-[11px] leading-tight">{c}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Real Component: QuestionCard */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h3 className="text-sm font-bold text-primary flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span>Componente Real: QuestionCard</span>
            </h3>
            <p className="text-xs text-muted">
              Mesmo componente utilizado nas sessões reais de estudo com enunciado, alternativas, gabarito e notas
            </p>
          </div>

          {/* Quick Simulation Action Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={setPresetUnanswered}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                lastAnswer === undefined && questionStrikes.length === 0
                  ? 'bg-accent text-accent-contrast border-accent'
                  : 'bg-surface border-border text-secondary hover:text-primary'
              }`}
            >
              Não Respondida
            </button>
            <button
              onClick={setPresetCorrect}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                lastAnswer?.is_correct === true
                  ? 'bg-accent text-accent-contrast border-accent'
                  : 'bg-surface border-border text-secondary hover:text-primary'
              }`}
            >
              Acerto (C)
            </button>
            <button
              onClick={setPresetWrong}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                lastAnswer?.is_correct === false
                  ? 'bg-accent text-accent-contrast border-accent'
                  : 'bg-surface border-border text-secondary hover:text-primary'
              }`}
            >
              Erro (A)
            </button>
            <button
              onClick={setPresetStrikes}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border bg-surface border-border text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Riscar (B, D, E)
            </button>
          </div>
        </div>

        {/* Real QuestionCard Component Injected */}
        <QuestionCard
          question={SAMPLE_QUESTION}
          currentIndex={0}
          totalFiltered={1}
          onPrev={() => {}}
          onNext={() => {}}
          onAnswer={handleAnswerQuestion}
          lastAnswer={lastAnswer}
          srsItem={srsItem}
          onRateSRS={handleRateSRS}
          isBookmarked={isBookmarked}
          bookmarkData={isBookmarked ? { question_id: SAMPLE_QUESTION.sequence_id, created_at: Date.now(), note: userNote, tags: ['Diagnóstico'] } : undefined}
          onToggleBookmark={() => setIsBookmarked(b => !b)}
          onSaveNote={(note) => setUserNote(note)}
          strikes={questionStrikes}
          onToggleStrike={handleToggleStrike}
        />
      </div>

      {/* 4. Real Primitives: Buttons & Badges */}
      <Panel
        title="Primitivas de Design (ui/primitives)"
        description="Botões, badges e superfícies primitivas do design system"
      >
        <div className="space-y-4">
          {/* Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-secondary">
              Botões de Ação (PrimaryButton & SecondaryButton):
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <PrimaryButton size="md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ação Primária (MD)</span>
              </PrimaryButton>
              <PrimaryButton size="sm">
                <span>Primária (SM)</span>
              </PrimaryButton>
              <SecondaryButton size="md">
                <span>Ação Secundária (MD)</span>
              </SecondaryButton>
              <SecondaryButton size="sm">
                <span>Secundária (SM)</span>
              </SecondaryButton>
              <PrimaryButton size="sm" disabled>
                <span>Desabilitado</span>
              </PrimaryButton>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-secondary">
              Badges Semânticas (Badge variants):
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent" size="sm">Accent</Badge>
              <Badge variant="subtle" size="sm">Subtle</Badge>
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Sucesso / Correta</span>
              </Badge>
              <Badge variant="danger" size="sm">
                <XCircle className="w-3 h-3" />
                <span>Erro / Incorreta</span>
              </Badge>
              <Badge variant="warning" size="sm">Atenção / SRS</Badge>
              <Badge variant="neutral" size="sm">Neutro</Badge>
            </div>
          </div>

          {/* Surface Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Card variant="default" padding="sm" className="space-y-1">
              <span className="text-xs font-bold text-primary block">Card variant="default"</span>
              <span className="text-xs text-secondary block">Superfície padrão com borda semântica border-border.</span>
            </Card>
            <Card variant="subtle" padding="sm" className="space-y-1">
              <span className="text-xs font-bold text-primary block">Card variant="subtle"</span>
              <span className="text-xs text-secondary block">Superfície sutil para agrupamentos e filtros secundários.</span>
            </Card>
          </div>
        </div>
      </Panel>

      {/* 5. Inputs & Form Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel
          title="Controles de Formulário"
          description="Campos de texto, seletores e checkboxes no tema ativo"
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">
                Campo de Texto (theme-input):
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full px-3 py-2 theme-input rounded-xl text-xs"
                placeholder="Digite para testar contraste..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">
                Seletor Suspenso (theme-select):
              </label>
              <select
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                className="w-full px-3 py-2 theme-select rounded-xl text-xs"
              >
                <option value="fgv">FGV - Fundação Getulio Vargas</option>
                <option value="cebraspe">Cebraspe (CESPE)</option>
                <option value="fcc">FCC - Fundação Carlos Chagas</option>
                <option value="vunesp">Vunesp</option>
              </select>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <input
                type="checkbox"
                id="kitchen-sink-checkbox"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
                className="w-4 h-4 rounded text-accent cursor-pointer"
              />
              <label htmlFor="kitchen-sink-checkbox" className="text-xs text-primary font-medium cursor-pointer">
                Exemplo de Checkbox interativo
              </label>
            </div>
          </div>
        </Panel>

        {/* 6. Gamification & Scrollbar */}
        <Panel
          title="Gamificação & Scrollbar"
          description="Barra de XP, ofensiva e comportamento da barra de rolagem"
        >
          <div className="space-y-4">
            {/* Gamification Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-primary flex items-center gap-1.5">
                  <Flame className="w-4 h-4 xp-flame-icon" />
                  <span className="xp-streak-text">Ofensiva: 14 dias seguidos</span>
                </span>
                <span className="font-mono text-xs font-bold text-secondary">
                  280 / 350 XP
                </span>
              </div>
              <div className="w-full h-3 rounded-full xp-track border overflow-hidden">
                <div className="h-full xp-fill transition-all duration-300 w-4/5" />
              </div>
            </div>

            {/* Scrollbar container */}
            <div className="space-y-1 pt-2 border-t border-border">
              <span className="text-xs font-semibold text-secondary block">
                Teste de Barra de Rolagem ({activeConfig.name}):
              </span>
              <div className="h-24 p-3 rounded-xl bg-surface border border-border overflow-y-auto text-xs text-secondary space-y-1.5">
                <p>1. Role esta caixa para testar o comportamento visual do scrollbar.</p>
                <p>2. No tema <strong>Night Circadian</strong>, o scrollbar é estritamente vermelho-âmbar com trilho transparente.</p>
                <p>3. No tema <strong>Reading Sepia</strong>, o scrollbar utiliza tom canela pergaminho.</p>
                <p>4. No tema <strong>Dark Slate</strong> e <strong>Daylight</strong>, o scrollbar se harmoniza com as superfícies slate.</p>
                <p>5. Fim da área de teste de rolagem.</p>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* 7. Active CSS Custom Properties (Tokens Inspector) */}
      <Panel
        title="Inspetor de Variáveis CSS (:root / documentElement)"
        description="Valores resolvidos pelo navegador para o tema atualmente ativo"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          {Object.entries(computedTokens).map(([tokenName, tokenValue]) => (
            <div 
              key={tokenName}
              className="p-2.5 rounded-xl bg-surface-subtle border border-border flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] text-muted truncate font-sans font-semibold">
                  {tokenName.replace('--theme-', '')}
                </span>
                <div 
                  className="w-3.5 h-3.5 rounded-md border border-border shrink-0 shadow-xs"
                  style={{ backgroundColor: tokenValue || 'transparent' }}
                  title={tokenValue}
                />
              </div>
              <span className="text-xs font-bold text-primary truncate">
                {tokenValue || '...'}
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
