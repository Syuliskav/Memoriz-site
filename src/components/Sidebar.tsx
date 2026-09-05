import React, { useEffect } from 'react';
import { 
  BookOpen, 
  BrainCircuit, 
  Flame, 
  Award, 
  Timer, 
  AlertTriangle, 
  BarChart3, 
  Database, 
  Keyboard, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  X,
  ChevronLeft,
  RefreshCw,
  Palette,
} from 'lucide-react';
import { StudyMode, FilterState, UserStatistics, QuestionDatabase, UserAccount } from '../types/question';
import { forcePurgeAndReload } from '../lib/versionManager';

interface SidebarProps {
  isOpen: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  databases: QuestionDatabase[];
  activeDatabaseId: string | 'all';
  onChangeDatabase: (dbId: string | 'all') => void;
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  subjects: string[];
  examBoards: string[];
  years: number[];
  topics: string[];
  subjectCounts: Record<string, number>;
  statusCounts: {
    all: number;
    unanswered: number;
    correct: number;
    wrong: number;
    bookmarked: number;
    srs_due: number;
  };
  totalFiltered: number;
  totalAll: number;
  stats: UserStatistics;
  errorCount: number;
  srsDueCount: number;
  onOpenDatabaseManager: () => void;
  onOpenShortcuts: () => void;
  onOpenAppInfo?: () => void;
  userAccount?: UserAccount;
  onOpenAccountModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  onClose,
  currentMode,
  onSelectMode,
  filters,
  onChangeFilters,
  subjects,
  examBoards,
  years,
  topics,
  subjectCounts,
  statusCounts,
  totalFiltered,
  totalAll,
  stats,
  errorCount,
  srsDueCount,
  onOpenDatabaseManager,
  onOpenShortcuts,
  onOpenAppInfo,
  userAccount,
  onOpenAccountModal,
}) => {
  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onToggle) {
      onToggle();
    }
  };

  const handleResetFilters = () => {
    onChangeFilters({
      database_id: 'all',
      subject: 'all',
      exam_board: 'all',
      year: 'all',
      topic: 'all',
      status: 'all',
      searchQuery: '',
      isRegexSearch: false,
    });
  };

  const hasActiveFilters = 
    filters.subject !== 'all' || 
    filters.exam_board !== 'all' || 
    filters.year !== 'all' || 
    filters.topic !== 'all' || 
    filters.status !== 'all' || 
    filters.searchQuery.trim().length > 0 ||
    !!filters.isRegexSearch;

  const xpProgress = Math.min(100, Math.round((stats.today_xp / stats.daily_goal_xp) * 100));

  return (
    <>
      {/* Mobile & Desktop Backdrop */}
      {isOpen && (
        <div 
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-canvas/80 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-88 theme-card border-r flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0">
          <button
            id="sidebar-app-info-btn"
            onClick={() => {
              if (onOpenAppInfo) onOpenAppInfo();
              if (window.innerWidth < 1024) handleClose();
            }}
            className="flex items-center gap-2.5 px-1.5 py-1 -my-1 rounded-lg hover:bg-surface-subtle transition-colors text-left group cursor-pointer"
            title="Sobre o Memoriz & Instalação"
            aria-label="Abrir informações sobre o App"
          >
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-lg text-primary tracking-tight group-hover:text-accent transition-colors block leading-tight">
                Memoriz
              </span>
              <span className="text-[10px] text-muted font-medium">
                Sobre o App &bull; PWA
              </span>
            </div>
          </button>

          <button
            id="collapse-sidebar-btn"
            onClick={handleClose}
            className="p-1.5 text-muted hover:text-primary hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer"
            title="Recolher menu lateral"
            aria-label="Recolher menu lateral"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs scrollbar-thin">
          
          {/* USER ACCOUNT / ACTIVE PROFILE QUICK SWITCHER */}
          {userAccount && (
            <div className="rounded-xl border border-border theme-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Perfil de Estudo
                </span>
                {userAccount.provider === 'google' ? (
                  <span className="text-[10px] font-semibold text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    <span>Google</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-muted">
                    Local
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAccountModal) onOpenAccountModal();
                  if (window.innerWidth < 1024) handleClose();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg theme-card-subtle hover:border-accent transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-accent/10 border border-accent/20 shrink-0">
                    {userAccount.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate text-primary">
                      {userAccount.name}
                    </div>
                    <div className="text-[10px] text-secondary truncate">
                      {userAccount.targetExam}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-accent shrink-0 ml-1">
                  Editar
                </span>
              </button>
            </div>
          )}

          {/* SECTION 1: NAVEGAÇÃO PRINCIPAL */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
              Navegação
            </div>

            <button
              onClick={() => {
                onSelectMode('practice');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                currentMode === 'practice'
                  ? 'bg-accent-subtle text-accent font-medium border border-accent/30'
                  : 'text-secondary hover:bg-surface-subtle hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Prática de Questões</span>
              </div>
              <span className="text-xs text-muted font-mono">{totalFiltered}/{totalAll}</span>
            </button>

            <button
              onClick={() => {
                onSelectMode('srs');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                currentMode === 'srs'
                  ? 'bg-accent-subtle text-accent font-medium border border-accent/30'
                  : 'text-secondary hover:bg-surface-subtle hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-4 h-4" />
                <span>Fixação de Conteúdo</span>
              </div>
              {srsDueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent text-white">
                  {srsDueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onSelectMode('error_notebook');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                currentMode === 'error_notebook'
                  ? 'bg-danger-bg text-danger font-medium border border-danger-border'
                  : 'text-secondary hover:bg-surface-subtle hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Caderno de Erros</span>
              </div>
              {errorCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-danger text-white">
                  {errorCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onSelectMode('simulado');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                currentMode === 'simulado'
                  ? 'bg-amber-bg text-amber font-medium border border-amber-border'
                  : 'text-secondary hover:bg-surface-subtle hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Timer className="w-4 h-4" />
                <span>Modo Simulado</span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectMode('metrics');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                currentMode === 'metrics'
                  ? 'bg-success-bg text-success font-medium border border-success-border'
                  : 'text-secondary hover:bg-surface-subtle hover:text-primary'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Métricas & Retenção</span>
              </div>
            </button>
          </div>

          {/* SECTION 2: BUSCA & FILTROS DE QUESTÕES */}
          <div className="space-y-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold tracking-wider text-muted uppercase">
                Busca & Filtros
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  title="Restaurar todos os filtros"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            {/* Fast Search Input with Regex Support */}
            <div className="space-y-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder={filters.isRegexSearch ? "Regex ex: (furto|roubo), art\\.\\s*\\d+" : "Buscar termo, código, regex..."}
                  className={`w-full pl-9 pr-16 py-2 theme-input rounded-lg text-xs ${
                    filters.isRegexSearch
                      ? 'border-accent font-mono text-[11px]'
                      : ''
                  }`}
                />
                
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* Regex Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, isRegexSearch: !filters.isRegexSearch })}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-tighter transition-colors cursor-pointer ${
                      filters.isRegexSearch
                        ? 'bg-accent text-white shadow-xs'
                        : 'text-muted hover:text-primary hover:bg-surface-subtle'
                    }`}
                    title={filters.isRegexSearch ? "Busca por Expressão Regular (Regex) ATIVA (clique para desativar)" : "Ativar busca por Expressão Regular (Regex)"}
                  >
                    .*
                  </button>

                  {/* Clear Button */}
                  {filters.searchQuery && (
                    <button
                      type="button"
                      onClick={() => onChangeFilters({ ...filters, searchQuery: '' })}
                      className="p-1 text-muted hover:text-primary rounded cursor-pointer"
                      title="Limpar busca"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {filters.isRegexSearch && (
                <div className="flex items-center justify-between px-1 text-[10px] text-accent font-mono">
                  <span>Modo Regex ativo</span>
                  <span className="opacity-75">Ex: \bcrime\b | art\.\s*\d+</span>
                </div>
              )}
            </div>

            {/* Status Filter Badges */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted px-1 font-medium block">
                Status de Resolução
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'all' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    filters.status === 'all'
                      ? 'theme-chip-active font-semibold'
                      : 'theme-chip-inactive'
                  }`}
                >
                  <span>Todas</span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.all}</span>
                </button>

                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'unanswered' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    filters.status === 'unanswered'
                      ? 'theme-chip-active font-semibold'
                      : 'theme-chip-inactive'
                  }`}
                >
                  <span>Novas</span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.unanswered}</span>
                </button>

                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'correct' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    filters.status === 'correct'
                      ? 'bg-success-bg text-success border border-success-border font-semibold'
                      : 'theme-chip-inactive'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-success" />
                    <span>Acertos</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.correct}</span>
                </button>

                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'wrong' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    filters.status === 'wrong'
                      ? 'bg-danger-bg text-danger border border-danger-border font-semibold'
                      : 'theme-chip-inactive'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-danger" />
                    <span>Erros</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.wrong}</span>
                </button>

                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'bookmarked' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors col-span-2 cursor-pointer ${
                    filters.status === 'bookmarked'
                      ? 'bg-amber-bg text-amber border border-amber-border font-semibold'
                      : 'theme-chip-inactive'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-amber" />
                    <span>Marcadas / Salvas</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.bookmarked}</span>
                </button>
              </div>
            </div>

            {/* Disciplinas List */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted px-1 font-medium block">
                Disciplinas
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                <button
                  onClick={() => onChangeFilters({ ...filters, subject: 'all' })}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                    filters.subject === 'all'
                      ? 'bg-accent text-white font-semibold shadow-xs'
                      : 'text-secondary hover:bg-surface-subtle'
                  }`}
                >
                  <span>Todas as Disciplinas</span>
                  <span className="text-[10px] opacity-75 font-mono">{totalAll}</span>
                </button>

                {subjects.map(s => {
                  const count = subjectCounts[s] || 0;
                  const isSelected = filters.subject === s;
                  return (
                    <button
                      key={s}
                      onClick={() => onChangeFilters({ ...filters, subject: isSelected ? 'all' : s })}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-accent text-white font-semibold shadow-xs'
                          : 'text-secondary hover:bg-surface-subtle'
                      }`}
                    >
                      <span className="truncate pr-2">{s}</span>
                      <span className="text-[10px] opacity-75 font-mono shrink-0">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bancas, Anos & Tópicos Dropdowns */}
            <div className="space-y-2 pt-2">
              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1 font-medium">
                  Banca Examinadora
                </label>
                <select
                  value={filters.exam_board}
                  onChange={(e) => onChangeFilters({ ...filters, exam_board: e.target.value })}
                  className="w-full px-2.5 py-1.5 theme-input rounded-lg text-xs"
                >
                  <option value="all">Todas as Bancas</option>
                  {examBoards.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-muted uppercase tracking-wider block mb-1 font-medium">
                  Ano
                </label>
                <select
                  value={filters.year.toString()}
                  onChange={(e) => onChangeFilters({ ...filters, year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 theme-input rounded-lg text-xs"
                >
                  <option value="all">Todos os Anos</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {topics.length > 0 && (
                <div>
                  <label className="text-[10px] text-muted uppercase tracking-wider block mb-1 font-medium">
                    Tópico / Conteúdo
                  </label>
                  <select
                    value={filters.topic}
                    onChange={(e) => onChangeFilters({ ...filters, topic: e.target.value })}
                    className="w-full px-2.5 py-1.5 theme-input rounded-lg text-xs"
                  >
                    <option value="all">Todos os Tópicos</option>
                    {topics.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: FERRAMENTAS */}
          <div className="space-y-1 pt-3 border-t border-border">
            <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">
              Ferramentas
            </div>

            <button
              onClick={() => {
                onOpenDatabaseManager();
                if (window.innerWidth < 1024) handleClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-secondary hover:bg-surface-subtle hover:text-primary transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-muted" />
              <span>Gerenciador de Banco JSON</span>
            </button>

            <button
              onClick={() => {
                onSelectMode('kitchen_sink');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                currentMode === 'kitchen_sink'
                  ? 'bg-accent-subtle text-accent font-medium border border-accent/30'
                  : 'text-secondary hover:bg-surface-subtle hover:text-primary'
              }`}
            >
              <Palette className="w-4 h-4 text-muted" />
              <span>Diagnóstico de Temas</span>
            </button>

            <button
              onClick={() => {
                onOpenShortcuts();
                if (window.innerWidth < 1024) handleClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-secondary hover:bg-surface-subtle hover:text-primary transition-colors cursor-pointer"
            >
              <Keyboard className="w-4 h-4 text-muted" />
              <span>Atalhos de Teclado</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('Deseja limpar todo o cache de versões antigas e forçar o recarregamento da versão mais recente?')) {
                  forcePurgeAndReload();
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted hover:bg-surface-subtle hover:text-primary transition-colors cursor-pointer text-xs"
              title="0 Tolerância a Versão Antiga: Limpa caches e recarrega"
            >
              <RefreshCw className="w-3.5 h-3.5 text-muted" />
              <span>Limpar Cache & Recarregar</span>
            </button>
          </div>
        </div>

        {/* Footer: User Gamification Stats (Thick unified progress bar with contents inside) */}
        <div className="p-3 border-t border-border theme-card-subtle shrink-0">
          <div 
            className="relative w-full h-9 rounded-lg overflow-hidden border flex items-center px-3 justify-between text-xs select-none shadow-xs xp-track"
            title={`Ofensiva: ${stats.streak_days} ${stats.streak_days === 1 ? 'dia' : 'dias'} | Meta diária: ${stats.today_xp}/${stats.daily_goal_xp} XP (${xpProgress}%)`}
          >
            {/* Progress Fill Underlay */}
            <div 
              className="absolute left-0 top-0 bottom-0 xp-fill transition-all duration-500 ease-out"
              style={{ width: `${Math.max(4, xpProgress)}%` }}
            />

            {/* Left Content Inside Bar: Streak Flame + Text */}
            <div className="relative z-10 flex items-center gap-1.5 font-semibold xp-streak-text min-w-0">
              <Flame className="w-4 h-4 xp-flame-icon shrink-0" />
              <span className="truncate">{stats.streak_days} {stats.streak_days === 1 ? 'dia' : 'dias'} de Ofensiva</span>
            </div>

            {/* Right Content Inside Bar: XP Badge */}
            <div className="relative z-10 flex items-center gap-1 font-mono font-bold xp-badge-text shrink-0 text-xs pl-2">
              <Award className="w-3.5 h-3.5 xp-badge-icon shrink-0" />
              <span>{stats.today_xp} XP</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
