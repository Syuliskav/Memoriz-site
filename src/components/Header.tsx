import React from 'react';
import { 
  Menu, 
  BrainCircuit, 
  Flame, 
  Award, 
  Database, 
  Keyboard, 
  Moon, 
  Sun, 
  SlidersHorizontal,
  BookOpen,
  Eye,
  AlertTriangle,
  Timer,
  BarChart3,
  Pause,
  Play,
  Palette,
} from 'lucide-react';
import { StudyMode, UserStatistics, FilterState, ThemeMode, UserAccount } from '../types/question';

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
  errorCount: number;
  srsDueCount: number;
  filters?: FilterState;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  isPaused?: boolean;
  onTogglePause?: () => void;
  userAccount?: UserAccount;
  onOpenAccountModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  currentMode,
  onSelectMode,
  stats,
  theme,
  onToggleTheme,
  onOpenShortcuts,
  onOpenDatabaseManager,
  onOpenAppInfo,
  errorCount,
  srsDueCount,
  filters,
  currentQuestionIndex,
  totalQuestions,
  isPaused = false,
  onTogglePause,
  userAccount,
  onOpenAccountModal,
}) => {
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
    <header className="sticky top-0 z-30 bg-canvas/90 backdrop-blur-md border-b border-border">
      <div className="relative w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          
          {/* Left: Hamburger menu toggle + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-accent text-accent-contrast flex items-center justify-center font-black text-xs sm:text-sm shadow-xs group-hover:scale-105 transition-transform shrink-0">
                M
              </div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-primary theme-text-primary group-hover:text-accent transition-colors">
                Memoriz
              </span>
            </button>

            {/* Current app mode indicator: only on extra large displays (>1600px) so it never occupies space needed by the mode switcher */}
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

          {/* Quick Mode Navigation Switcher - In-flow centered flex item: responsive, never overlaps */}
          <div className="hidden md:flex items-center justify-center flex-1 min-w-0 px-1 sm:px-2">
            <div className="flex items-center gap-0.5 sm:gap-1 bg-surface-subtle p-1 rounded-lg border border-border text-xs shrink-0 shadow-2xs">
              <button
                onClick={() => onSelectMode('practice')}
                className={`px-2 sm:px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  currentMode === 'practice'
                    ? 'bg-surface text-primary theme-text-primary shadow-xs font-semibold'
                    : 'text-secondary theme-text-secondary hover:text-primary'
                }`}
              >
                Prática
              </button>
              <button
                onClick={() => onSelectMode('srs')}
                className={`px-2 sm:px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer ${
                  currentMode === 'srs'
                    ? 'bg-surface text-primary theme-text-primary shadow-xs font-semibold'
                    : 'text-secondary theme-text-secondary hover:text-primary'
                }`}
              >
                <span>Fixação</span>
                {srsDueCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-accent text-accent-contrast font-mono">
                    {srsDueCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onSelectMode('error_notebook')}
                className={`px-2 sm:px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer ${
                  currentMode === 'error_notebook'
                    ? 'bg-surface text-danger shadow-xs font-semibold'
                    : 'text-secondary theme-text-secondary hover:text-primary'
                }`}
              >
                <span>Erros</span>
                {errorCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-danger text-white font-mono">
                    {errorCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => onSelectMode('simulado')}
                className={`px-2 sm:px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  currentMode === 'simulado'
                    ? 'bg-surface text-primary theme-text-primary shadow-xs font-semibold'
                    : 'text-secondary theme-text-secondary hover:text-primary'
                }`}
              >
                Simulado
              </button>
              <button
                onClick={() => onSelectMode('metrics')}
                className={`px-2 sm:px-3 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  currentMode === 'metrics'
                    ? 'bg-surface text-primary theme-text-primary shadow-xs font-semibold'
                    : 'text-secondary theme-text-secondary hover:text-primary'
                }`}
              >
                Métricas
              </button>
            </div>
          </div>

          {/* Right Controls: Streak (desktop), Theme, Shortcuts */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Streak & XP Indicator (Hidden on smaller screens to keep ample space for mode switcher) */}
            <div 
              className="hidden min-[1100px]:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 text-xs rounded-lg font-medium shrink-0 xp-header-pill border"
              title={`Ofensiva: ${stats.streak_days} dias | XP: ${stats.today_xp}/${stats.daily_goal_xp}`}
            >
              <div className="flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5 xp-flame-icon shrink-0" />
                <span className="xp-streak-text">{stats.streak_days}d</span>
              </div>
              <span className="opacity-25 xp-streak-text">|</span>
              <div className="flex items-center gap-1 font-semibold">
                <Award className="w-3.5 h-3.5 xp-badge-icon shrink-0" />
                <span className="xp-badge-text">{stats.today_xp} XP</span>
              </div>
            </div>

            {/* Theme Toggle (Light / Reading / Night / Dark) */}
            <div className="flex items-center theme-card-subtle p-0.5 rounded-lg shrink-0">
              <button
                id="theme-btn-light"
                onClick={() => onToggleTheme('light')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  theme === 'light' ? 'bg-surface text-accent shadow-xs' : 'text-muted hover:text-primary'
                }`}
                title="Modo Claro"
                aria-label="Modo Claro"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-reading"
                onClick={() => onToggleTheme('reading')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  theme === 'reading' ? 'bg-surface text-accent font-bold shadow-xs' : 'text-muted hover:text-primary'
                }`}
                title="Modo Leitura"
                aria-label="Modo Leitura"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-night"
                onClick={() => onToggleTheme('night')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  theme === 'night' ? 'bg-surface text-accent font-bold shadow-xs' : 'text-muted hover:text-primary'
                }`}
                title="Modo Noturno"
                aria-label="Modo Noturno"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-dark"
                onClick={() => onToggleTheme('dark')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  theme === 'dark' ? 'bg-surface text-accent font-bold shadow-xs' : 'text-muted hover:text-primary'
                }`}
                title="Modo Escuro"
                aria-label="Modo Escuro"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-kitchen-sink"
                onClick={() => onSelectMode('kitchen_sink')}
                className={`p-1.5 rounded-md text-xs cursor-pointer ${
                  currentMode === 'kitchen_sink' ? 'bg-surface text-accent font-bold shadow-xs' : 'text-muted hover:text-primary'
                }`}
                title="Painel Diagnóstico de Temas (Kitchen Sink)"
                aria-label="Diagnóstico de Temas"
              >
                <Palette className="w-3.5 h-3.5" />
              </button>
            </div>

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

            {/* Keyboard Shortcuts (Only on desktop screens >= 1280px) */}
            <button
              onClick={onOpenShortcuts}
              className="hidden xl:flex p-2 text-muted hover:text-primary hover:bg-surface-hover rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Atalhos de teclado (? ou AltGr+W)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* User Account / Profile Button */}
            {onOpenAccountModal && (
              <button
                id="header-user-account-btn"
                onClick={onOpenAccountModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border theme-card hover:border-border-strong transition-all shrink-0 cursor-pointer shadow-2xs"
                title={`Perfil: ${userAccount?.name || 'Concurseiro'} (${userAccount?.provider === 'google' ? 'Google Conectado' : 'Perfil Local'})`}
                aria-label="Perfil do Usuário e Armazenamento"
              >
                <span className="text-sm leading-none">{userAccount?.avatar || '🎯'}</span>
                <span className="hidden md:inline text-xs font-semibold max-w-[110px] truncate theme-text-primary">
                  {userAccount?.name || 'Conta'}
                </span>
                {userAccount?.provider === 'google' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" title="Conta Google Vinculada" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
