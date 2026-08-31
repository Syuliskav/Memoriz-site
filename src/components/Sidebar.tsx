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
} from 'lucide-react';
import { StudyMode, FilterState, UserStatistics, QuestionDatabase } from '../types/question';

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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-88 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside Sidebar */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg text-slate-900 dark:text-white tracking-tight">Memoriz</span>
          </div>

          <button
            id="collapse-sidebar-btn"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Recolher menu lateral"
            aria-label="Recolher menu lateral"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          
          {/* SECTION 1: NAVEGAÇÃO PRINCIPAL */}
          <div className="space-y-1">
            <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
              Navegação
            </div>

            <button
              onClick={() => {
                onSelectMode('practice');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'practice'
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Prática de Questões</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">{totalFiltered}/{totalAll}</span>
            </button>

            <button
              onClick={() => {
                onSelectMode('srs');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'srs'
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-400 font-medium border border-indigo-200 dark:border-indigo-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-4 h-4" />
                <span>Fixação de Conteúdo</span>
              </div>
              {srsDueCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600 text-white">
                  {srsDueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onSelectMode('error_notebook');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'error_notebook'
                  ? 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 font-medium border border-rose-200 dark:border-rose-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Caderno de Erros</span>
              </div>
              {errorCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-600 text-white">
                  {errorCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                onSelectMode('simulado');
                if (window.innerWidth < 1024) handleClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'simulado'
                  ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium border border-amber-200 dark:border-amber-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
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
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                currentMode === 'metrics'
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Métricas & Retenção</span>
              </div>
            </button>
          </div>

          {/* SECTION 2: BUSCA & FILTROS DE QUESTÕES */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                Busca & Filtros
              </span>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
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
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={filters.searchQuery}
                  onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
                  placeholder={filters.isRegexSearch ? "Regex ex: (furto|roubo), art\\.\\s*\\d+" : "Buscar termo, código, regex..."}
                  className={`w-full pl-9 pr-16 py-2 bg-slate-50 dark:bg-slate-800/80 border rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none transition-all ${
                    filters.isRegexSearch
                      ? 'border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-[11px]'
                      : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
                
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {/* Regex Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, isRegexSearch: !filters.isRegexSearch })}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-tighter transition-colors cursor-pointer ${
                      filters.isRegexSearch
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700/60'
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
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded cursor-pointer"
                      title="Limpar busca"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {filters.isRegexSearch && (
                <div className="flex items-center justify-between px-1 text-[10px] text-indigo-600 dark:text-indigo-300 font-mono">
                  <span>Modo Regex ativo</span>
                  <span className="opacity-75">Ex: \bcrime\b | art\.\s*\d+</span>
                </div>
              )}
            </div>

            {/* Status Filter Badges */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium block">
                Status de Resolução
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'all' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.status === 'all'
                      ? 'bg-slate-800 text-white dark:bg-slate-700 dark:text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>Todas</span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.all}</span>
                </button>

                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'unanswered' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.status === 'unanswered'
                      ? 'bg-slate-800 text-white dark:bg-slate-700 dark:text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>Novas</span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.unanswered}</span>
                </button>

                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'correct' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.status === 'correct'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Acertos</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.correct}</span>
                </button>

                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'wrong' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    filters.status === 'wrong'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-700 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    <span>Erros</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.wrong}</span>
                </button>

                <button
                  onClick={() => onChangeFilters({ ...filters, status: 'bookmarked' })}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center justify-between transition-colors col-span-2 ${
                    filters.status === 'bookmarked'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700 font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Marcadas / Salvas</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-75">{statusCounts.bookmarked}</span>
                </button>
              </div>
            </div>

            {/* Disciplinas List */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium block">
                Disciplinas
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                <button
                  onClick={() => onChangeFilters({ ...filters, subject: 'all' })}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                    filters.subject === 'all'
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-medium">
                  Banca Examinadora
                </label>
                <select
                  value={filters.exam_board}
                  onChange={(e) => onChangeFilters({ ...filters, exam_board: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Todas as Bancas</option>
                  {examBoards.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-medium">
                  Ano
                </label>
                <select
                  value={filters.year.toString()}
                  onChange={(e) => onChangeFilters({ ...filters, year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Todos os Anos</option>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {topics.length > 0 && (
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1 font-medium">
                    Tópico / Conteúdo
                  </label>
                  <select
                    value={filters.topic}
                    onChange={(e) => onChangeFilters({ ...filters, topic: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
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
          <div className="space-y-1 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="px-2 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
              Ferramentas
            </div>

            <button
              onClick={() => {
                onOpenDatabaseManager();
                if (window.innerWidth < 1024) handleClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Gerenciador de Banco JSON</span>
            </button>

            <button
              onClick={() => {
                onOpenShortcuts();
                if (window.innerWidth < 1024) handleClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <Keyboard className="w-4 h-4 text-slate-400" />
              <span>Atalhos de Teclado</span>
            </button>
          </div>
        </div>

        {/* Footer: User Gamification Stats */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Flame className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
              <span>{stats.streak_days} dias de Ofensiva</span>
            </div>
            <div className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>{stats.today_xp} XP</span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
