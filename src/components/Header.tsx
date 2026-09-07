import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Flame, 
  Award, 
  Keyboard, 
  Pause, 
  Play
} from 'lucide-react';
import { StudyMode, UserStatistics, FilterState, ThemeMode, UserAccount } from '../types/question';
import { MemorizLogo } from './MemorizLogo';
import { DraggableModeSwitcher } from './DraggableModeSwitcher';
import { DraggableThemeSwitcher } from './DraggableThemeSwitcher';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  stats: UserStatistics;
  theme: ThemeMode;
  onToggleTheme: (newTheme: ThemeMode) => void;
  onOpenShortcuts: () => void;
  onOpenDatabaseManager: () => void;
  onOpenAppInfo?: () => void;
  onOpenXPPerformance?: () => void;
  errorCount: number;
  srsDueCount: number;
  filters?: FilterState;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  isPaused?: boolean;
  onTogglePause?: () => void;
  userAccount?: UserAccount;
  onOpenAccountModal?: () => void;
  isDevUser?: boolean;
  onOpenKitchenSink?: () => void;
  modeDragProgress?: { activeIndex: number; offsetFraction: number; isDragging: boolean } | null;
  onModeDragProgress?: (dragProgress: { activeIndex: number; offsetFraction: number; isDragging: boolean }) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  currentMode,
  onSelectMode,
  stats,
  theme,
  onToggleTheme,
  onOpenShortcuts,
  onOpenAppInfo,
  onOpenXPPerformance,
  errorCount = 0,
  srsDueCount,
  filters,
  isPaused = false,
  onTogglePause,
  onOpenKitchenSink,
  modeDragProgress,
  onModeDragProgress,
}) => {
  const [, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen not supported or blocked in iframe
    }
  };

  const getModeTitle = () => {
    switch (currentMode) {
      case 'practice':
        return 'Prática de Questões';
      case 'srs':
        return 'Fixação de Conteúdo';
      case 'error_notebook':
        return 'Caderno de Erros';
      case 'simulado':
        return 'Modo Simulado';
      case 'metrics':
        return 'Métricas & Desempenho';
      default:
        return 'Memoriz';
    }
  };

  return (
    <header 
      onDoubleClick={(e) => {
        // Double-click on any non-clickable part toggles fullscreen
        if ((e.target as HTMLElement).closest('button, a, input, select, [role="button"]')) {
          return;
        }
        handleToggleFullscreen();
      }}
      className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-border select-none"
      title="Dê dois cliques em qualquer espaço livre da barra superior para alternar tela cheia"
    >
      <div className="relative w-full px-3 sm:px-6">
        <div className="relative flex items-center justify-between h-14">
          
          {/* Left: Hamburger menu toggle + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
            <button
              id="toggle-navigation-menu-btn"
              onClick={onToggleSidebar}
              className="p-2 -ml-1 text-secondary hover:text-primary rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
              title="Menu Lateral (Ctrl+B)"
              aria-label="Menu Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              id="header-app-info-btn"
              onClick={onOpenAppInfo}
              className="flex items-center gap-2 px-1.5 py-1 -my-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer group text-left shrink-0"
              title="Sobre o Memoriz & Instalação"
              aria-label="Abrir informações sobre o App"
            >
              <MemorizLogo size={28} />
              <span className="text-base sm:text-lg font-bold tracking-tight text-primary theme-text-primary group-hover:text-accent transition-colors">
                Memoriz
              </span>
            </button>

            {/* Current app mode indicator: only on extra large displays (>1600px) */}
            <div className="hidden min-[1600px]:flex items-center gap-2 text-xs text-muted pl-2 border-l border-border">
              <span className="font-medium text-secondary theme-text-secondary">
                {getModeTitle()}
              </span>
              {filters && filters.subject !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-accent-subtle text-accent-subtle-text border border-accent-subtle-border text-[11px] font-medium">
                  {filters.subject}
                </span>
              )}
            </div>
          </div>

          {/* Centralized Draggable Mode Switcher: In top header for desktop and tablet (>= md / 768px) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-full max-w-sm lg:max-w-md xl:max-w-lg px-2 pointer-events-none z-20 justify-center">
            <div className="w-full pointer-events-auto">
              <DraggableModeSwitcher
                variant="header"
                currentMode={currentMode}
                onSelectMode={onSelectMode}
                srsDueCount={srsDueCount}
                errorCount={errorCount}
                dragProgress={modeDragProgress}
                onDragProgress={onModeDragProgress}
              />
            </div>
          </div>

          {/* Right Controls: Streak & XP Badge (Optional / Wide screens only), Draggable Theme, Pause, Shortcuts */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10 ml-auto">
            {/* Streak & XP Indicator (Optional: only shown when there's abundant horizontal space >= 2xl / 1400px) */}
            <button
              id="header-xp-panel-btn"
              type="button"
              onClick={onOpenXPPerformance}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-medium shrink-0 xp-header-pill border hover:opacity-90 active:scale-98 transition-all cursor-pointer shadow-2xs"
              title="Clique para ver seu Painel de Desempenho & Metas"
            >
              <div className="flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5 xp-flame-icon shrink-0" />
                <span className="xp-streak-text">{stats.streak_days}d</span>
              </div>
              <span className="opacity-25 xp-streak-text">|</span>
              <div className="flex items-center gap-1 font-semibold">
                <Award className="w-3.5 h-3.5 xp-badge-icon shrink-0" />
                <span className="xp-badge-text">{stats.xp_points > 0 ? `${stats.xp_points} XP` : `${stats.today_xp} XP`}</span>
              </div>
            </button>

            {/* Draggable Theme Toggle (Light -> Dark -> Reading -> Night; 3x click opens Dev mode) */}
            <DraggableThemeSwitcher
              theme={theme}
              onToggleTheme={onToggleTheme}
              onTriggerDevMode={onOpenKitchenSink}
            />

            {/* Pause / Resume Button */}
            {onTogglePause && (
              <button
                id="header-toggle-pause-btn"
                onClick={onTogglePause}
                className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  isPaused 
                    ? 'bg-warning-bg text-warning border border-warning-border shadow-xs' 
                    : 'text-muted hover:text-primary hover:bg-surface-hover'
                }`}
                title={isPaused ? "Retomar estudo (Espaço)" : "Pausar estudo (Espaço)"}
                aria-label="Pausar estudo"
              >
                {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
              </button>
            )}

            {/* Keyboard Shortcuts */}
            <button
              onClick={onOpenShortcuts}
              className="hidden xl:flex p-2 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Atalhos de teclado (? ou AltGr+W)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
