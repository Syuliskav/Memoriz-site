import React, { useState } from 'react';
import { 
  Palette, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Flame, 
  Sliders, 
  Scissors, 
  Eye, 
  LayoutGrid, 
  Maximize2 
} from 'lucide-react';
import { Card, Panel, Badge, PrimaryButton, SecondaryButton } from './ui/primitives';
import { ThemeMode } from '../types/question';

interface ThemeKitchenSinkProps {
  onExit: () => void;
  currentActiveTheme: ThemeMode;
  onSelectActiveTheme: (theme: ThemeMode) => void;
}

interface ThemeConfig {
  id: ThemeMode;
  name: string;
  subtitle: string;
  description: string;
  tag: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'light',
    name: 'Daylight (Padrão)',
    subtitle: 'Claro / Alto Contraste',
    description: 'Interface diurna com fundo slate-50, cartões brancos e acento índigo profundo.',
    tag: 'Diurno',
  },
  {
    id: 'dark',
    name: 'Dark Slate (AMOLED)',
    subtitle: 'Escuro / Foco Noturno',
    description: 'Fundo preto obsidiano, superfícies slate e contraste elétrico índigo.',
    tag: 'Escuro',
  },
  {
    id: 'reading',
    name: 'Reading Sepia',
    subtitle: 'Papel Quente / Zero Fadiga',
    description: 'Paleta pergaminho suave, tons canela e texto café para maratonas de leitura.',
    tag: 'Papel',
  },
  {
    id: 'night',
    name: 'Night Circadian',
    subtitle: 'Vermelho / Zero Luz Azul',
    description: '100% vermelho âmbar (B=0). Preserva a melatonina sem alterar o ciclo circadiano.',
    tag: 'Circadiano',
  },
];

export const ThemeKitchenSink: React.FC<ThemeKitchenSinkProps> = ({
  onExit,
  currentActiveTheme,
  onSelectActiveTheme,
}) => {
  const [viewLayout, setViewLayout] = useState<'grid' | 'single'>('grid');
  const [selectedSingleTheme, setSelectedSingleTheme] = useState<ThemeMode>('night');
  const [strikedOption, setStrikedOption] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<string>('B');
  const [demoInputText, setDemoInputText] = useState<string>('Texto de exemplo no input');

  const renderThemeSpecimen = (t: ThemeConfig) => {
    return (
      <div 
        key={t.id}
        data-theme={t.id}
        className={`rounded-2xl border border-border bg-canvas p-4 sm:p-5 flex flex-col gap-4 text-primary transition-all duration-200 ${
          t.id === 'dark' ? 'dark' : ''
        }`}
      >
        {/* Header of the theme card */}
        <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-primary">
                {t.name}
              </h3>
              <Badge variant="subtle" size="xs">
                {t.tag}
              </Badge>
            </div>
            <p className="text-xs text-secondary mt-0.5">
              {t.subtitle}
            </p>
          </div>
          <button
            onClick={() => onSelectActiveTheme(t.id)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 ${
              currentActiveTheme === t.id
                ? 'bg-accent text-accent-contrast'
                : 'theme-btn-secondary'
            }`}
          >
            {currentActiveTheme === t.id ? 'Ativo no App' : 'Ativar'}
          </button>
        </div>

        {/* 1. Typography & Colors */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            1. Tipografia & Hierarquia
          </span>
          <div className="p-2.5 rounded-lg bg-surface border border-border space-y-1">
            <p className="text-xs font-bold text-primary">
              Texto Primário: Título da Questão
            </p>
            <p className="text-xs text-secondary">
              Texto Secundário: Enunciado detalhado e suporte textual.
            </p>
            <p className="text-[11px] text-muted">
              Texto Muted: Metadados, banca organizadora e ano da prova.
            </p>
          </div>
        </div>

        {/* 2. Primitives: Buttons & Badges */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            2. Botões & Badges Primitivas
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <PrimaryButton size="sm">
              <Sparkles className="w-3 h-3" />
              <span>Ação Principal</span>
            </PrimaryButton>
            <SecondaryButton size="sm">
              <span>Secundário</span>
            </SecondaryButton>
            <PrimaryButton size="sm" disabled>
              <span>Desabilitado</span>
            </PrimaryButton>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge variant="accent" size="xs">Accent</Badge>
            <Badge variant="subtle" size="xs">Subtle</Badge>
            <Badge variant="success" size="xs">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Correto</span>
            </Badge>
            <Badge variant="danger" size="xs">
              <XCircle className="w-2.5 h-2.5" />
              <span>Erro</span>
            </Badge>
            <Badge variant="warning" size="xs">Revisão</Badge>
            <Badge variant="neutral" size="xs">Neutro</Badge>
          </div>
        </div>

        {/* 3. Cards & Panels */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            3. Superfícies (Card & Panel)
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <Card variant="default" padding="sm" className="text-center">
              <span className="font-semibold text-primary block">Card Normal</span>
              <span className="text-[10px] text-muted">Superfície padrão</span>
            </Card>
            <Card variant="subtle" padding="sm" className="text-center">
              <span className="font-semibold text-primary block">Card Sutil</span>
              <span className="text-[10px] text-muted">Superfície sutil</span>
            </Card>
          </div>
        </div>

        {/* 4. Form Controls & Inputs */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            4. Inputs & Controles
          </span>
          <input 
            type="text"
            value={demoInputText}
            onChange={(e) => setDemoInputText(e.target.value)}
            className="w-full px-3 py-1.5 theme-input rounded-lg text-xs"
            placeholder="Digite algo para testar..."
          />
        </div>

        {/* 5. Question Alternatives States */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            5. Estados das Alternativas (A, B, C, D)
          </span>
          <div className="space-y-1.5 text-xs">
            {/* Default State */}
            <div 
              onClick={() => setSelectedOption('A')}
              className="p-2 rounded-lg theme-option-default flex items-center justify-between cursor-pointer text-primary"
            >
              <span>A) Alternativa no estado Padrão</span>
              <span className="text-[10px] text-muted">Clique</span>
            </div>

            {/* Selected State */}
            <div 
              onClick={() => setSelectedOption('B')}
              className="p-2 rounded-lg theme-option-selected flex items-center justify-between cursor-pointer font-medium"
            >
              <span>B) Alternativa Selecionada (Foco)</span>
              <Badge variant="accent" size="xs">Selecionada</Badge>
            </div>

            {/* Correct State */}
            <div className="p-2 rounded-lg theme-option-correct flex items-center justify-between font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>C) Alternativa Correta (Gabarito)</span>
              </div>
              <Badge variant="success" size="xs">Correta</Badge>
            </div>

            {/* Wrong State */}
            <div className="p-2 rounded-lg theme-option-wrong flex items-center justify-between font-medium">
              <div className="flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                <span>D) Alternativa Incorreta</span>
              </div>
              <Badge variant="danger" size="xs">Incorreta</Badge>
            </div>

            {/* Strike-through State */}
            <div className="p-2 rounded-lg theme-option-default flex items-center justify-between strikethrough-option">
              <span className="option-text-content">E) Alternativa Riscada com Tesoura</span>
              <div className="flex items-center gap-1">
                <Scissors className="w-3 h-3 text-muted" />
                <span className="theme-badge-striked text-[9px] px-1.5 py-0.2 rounded font-bold">Riscada</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Gamification XP Bar */}
        <div className="space-y-1 pt-1 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-primary flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 xp-flame-icon" />
              <span className="xp-streak-text">Ofensiva: 12 dias</span>
            </span>
            <span className="text-[11px] font-mono font-bold text-secondary">
              240 / 300 XP
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full xp-track border overflow-hidden p-0.5">
            <div className="h-full rounded-full xp-fill transition-all duration-300 w-4/5" />
          </div>
        </div>

        {/* 7. Scrollbar Test Container */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            7. Barra de Rolagem ({t.tag})
          </span>
          <div className="h-16 p-2 rounded-lg bg-surface border border-border overflow-y-auto text-[11px] text-secondary space-y-1">
            <p>Role para verificar o comportamento visual do scrollbar neste tema.</p>
            <p>1. Linha de teste para verificação do thumb e track.</p>
            <p>2. No tema Night, o scrollbar é estritamente vermelho-âmbar com track transparente.</p>
            <p>3. Zero luz azul e zero bordas brancas indesejadas.</p>
            <p>4. Fim do container de rolagem de teste.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="theme-card rounded-2xl p-4 sm:p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-2 rounded-xl theme-btn-secondary shrink-0 cursor-pointer"
            title="Voltar ao modo de estudo"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-accent" />
              <h2 className="text-base sm:text-lg font-bold text-primary">
                Painel Diagnóstico de Temas (Kitchen Sink)
              </h2>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Renderização simultânea e isolada de todos os 4 temas para auditoria de contraste e tokens
            </p>
          </div>
        </div>

        {/* View Layout Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="flex items-center p-1 bg-surface-subtle border border-border rounded-xl">
            <button
              onClick={() => setViewLayout('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewLayout === 'grid'
                  ? 'bg-accent text-accent-contrast shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>4 Temas Paralelos</span>
            </button>
            <button
              onClick={() => setViewLayout('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewLayout === 'single'
                  ? 'bg-accent text-accent-contrast shadow-xs'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Foco Individual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: 4-Column Grid View */}
      {viewLayout === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 items-start">
          {THEMES.map((themeConfig) => renderThemeSpecimen(themeConfig))}
        </div>
      )}

      {/* Mode 2: Single Theme Focus View */}
      {viewLayout === 'single' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedSingleTheme(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  selectedSingleTheme === t.id
                    ? 'bg-accent text-accent-contrast font-bold shadow-xs'
                    : 'theme-btn-secondary'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            {renderThemeSpecimen(THEMES.find(t => t.id === selectedSingleTheme)!)}
          </div>
        </div>
      )}
    </div>
  );
};
