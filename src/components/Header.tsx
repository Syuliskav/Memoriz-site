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
  Play
} from 'lucide-react';
import { StudyMode, UserStatistics, FilterState, ThemeMode } from '../types/question';

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
  errorCount: number;
  srsDueCount: number;
  filters?: FilterState;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  isPaused?: boolean;
  onTogglePause?: () => void;
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
  errorCount,
  srsDueCount,
  filters,
  currentQuestionIndex,
  totalQuestions,
  isPaused = false,
  onTogglePause,
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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="w-full px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          
          {/* Left: Hamburger menu toggle + Logo + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              id="toggle-navigation-menu-btn"
              onClick={onToggleSidebar}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle navigation menu (Menu Lateral)"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Memoriz
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-800">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {getModeTitle()}
              </span>
              {currentMode === 'practice' && totalQuestions !== undefined && currentQuestionIndex !== undefined && (
                <>
                  <span>/</span>
                  <span className="text-slate-500 font-mono">
                    Questão {totalQuestions > 0 ? currentQuestionIndex + 1 : 0} de {totalQuestions}
                  </span>
                </>
              )}
              {filters && filters.subject !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium">
                  {filters.subject}
                </span>
              )}
            </div>
          </div>

          {/* Quick Mode Navigation Switcher (Minimal Desktop Pills) */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
            <button
              onClick={() => onSelectMode('practice')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                currentMode === 'practice'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Prática
            </button>
            <button
              onClick={() => onSelectMode('srs')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                currentMode === 'srs'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Fixação</span>
              {srsDueCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-600 text-white font-mono">
                  {srsDueCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectMode('error_notebook')}
              className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                currentMode === 'error_notebook'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Erros</span>
              {errorCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-600 text-white font-mono">
                  {errorCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectMode('simulado')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                currentMode === 'simulado'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Simulado
            </button>
            <button
              onClick={() => onSelectMode('metrics')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                currentMode === 'metrics'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Métricas
            </button>
          </div>

          {/* Right Controls: Streak (desktop), Theme, Shortcuts */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Streak & XP Indicator (Hidden on mobile to keep header clean) */}
            <div 
              className="hidden sm:flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 text-xs rounded-lg font-medium shrink-0 xp-header-pill border"
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
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                id="theme-btn-light"
                onClick={() => onToggleTheme('light')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  theme === 'light' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Light Mode (Modo Claro)"
                aria-label="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-reading"
                onClick={() => onToggleTheme('reading')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  theme === 'reading' ? 'bg-[#ede3cb] text-[#433422] shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Reading Mode (Modo Leitura)"
                aria-label="Reading Mode"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-night"
                onClick={() => onToggleTheme('night')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  theme === 'night' ? 'bg-[#ff5500] text-white shadow-xs' : 'text-slate-400 hover:text-[#ff7733]'
                }`}
                title="Night Mode (Modo Noturno Circadiano / Zero Blue)"
                aria-label="Night Mode"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
              <button
                id="theme-btn-dark"
                onClick={() => onToggleTheme('dark')}
                className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-slate-900 text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="Dark Mode (Modo Escuro)"
                aria-label="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pause / Resume Button */}
            {onTogglePause && (
              <button
                id="header-toggle-pause-btn"
                onClick={onTogglePause}
                className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                  isPaused 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isPaused ? "Retomar estudo (Espaço)" : "Pausar estudo (Espaço)"}
                aria-label="Pausar estudo"
              >
                {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
              </button>
            )}

            {/* Keyboard Shortcuts (Hidden on mobile) */}
            <button
              onClick={onOpenShortcuts}
              className="hidden sm:flex p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Atalhos de teclado (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
