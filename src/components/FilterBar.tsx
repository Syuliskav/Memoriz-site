import React from 'react';
import { Search, Filter, RotateCcw, Tag, Calendar, Building2, CheckCircle2, XCircle, Bookmark, Clock, Sparkles } from 'lucide-react';
import { FilterState } from '../types/question';

interface FilterBarProps {
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
}

export const FilterBar: React.FC<FilterBarProps> = ({
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
}) => {
  const handleReset = () => {
    onChangeFilters({
      subject: 'all',
      exam_board: 'all',
      year: 'all',
      topic: 'all',
      status: 'all',
      searchQuery: '',
    });
  };

  const hasActiveFilters = 
    filters.subject !== 'all' || 
    filters.exam_board !== 'all' || 
    filters.year !== 'all' || 
    filters.topic !== 'all' || 
    filters.status !== 'all' || 
    filters.searchQuery.trim().length > 0;

  return (
    <div className="theme-card rounded-3xl p-5 shadow-sm space-y-4">
      {/* Top Search and Status Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="search-input"
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
            placeholder="Buscar por termo, lei, assertiva ou código (ex: 'Q3950352', 'crase', 'art. 37')..."
            className="w-full pl-11 pr-4 py-2.5 theme-input rounded-2xl text-sm font-semibold"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onChangeFilters({ ...filters, searchQuery: '' })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted hover:text-primary px-2 py-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onChangeFilters({ ...filters, status: 'all' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filters.status === 'all'
                ? 'theme-chip-active'
                : 'theme-chip-inactive'
            }`}
          >
            <span>Todas</span>
            <span className="opacity-80 text-[10px] px-1.5 py-0.5 rounded-full bg-surface-subtle">
              {statusCounts.all}
            </span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'unanswered' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filters.status === 'unanswered'
                ? 'theme-chip-active'
                : 'theme-chip-inactive'
            }`}
          >
            <span>Novas</span>
            <span className="opacity-80 text-[10px] px-1.5 py-0.5 rounded-full bg-surface-subtle">
              {statusCounts.unanswered}
            </span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'correct' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.status === 'correct'
                ? 'bg-success-bg text-success border-2 border-success-border font-black'
                : 'bg-surface-subtle text-success border border-border-subtle hover:bg-surface-hover'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acertos</span>
            <span className="opacity-80 text-[10px]">({statusCounts.correct})</span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'wrong' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.status === 'wrong'
                ? 'bg-danger-bg text-danger border-2 border-danger-border font-black'
                : 'bg-surface-subtle text-danger border border-border-subtle hover:bg-surface-hover'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Erros</span>
            <span className="opacity-80 text-[10px]">({statusCounts.wrong})</span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'bookmarked' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.status === 'bookmarked'
                ? 'theme-badge-accent shadow-xs font-black'
                : 'bg-surface-subtle text-secondary border border-border-subtle hover:bg-surface-hover'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${filters.status === 'bookmarked' ? 'fill-current text-accent' : 'text-muted'}`} />
            <span>Marcadas</span>
            <span className="opacity-80 text-[10px]">({statusCounts.bookmarked})</span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'srs_due' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              filters.status === 'srs_due'
                ? 'bg-accent text-accent-contrast shadow-sm'
                : 'bg-accent-subtle text-accent-subtle-text border border-accent-subtle-border hover:bg-surface-hover'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Para Revisar</span>
            <span className="opacity-80 text-[10px]">({statusCounts.srs_due})</span>
          </button>
        </div>
      </div>

      {/* Disciplines Fast Filter Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-black text-muted uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Disciplinas:
        </span>
        <button
          onClick={() => onChangeFilters({ ...filters, subject: 'all' })}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
            filters.subject === 'all'
              ? 'theme-chip-active'
              : 'theme-chip-inactive'
          }`}
        >
          Todas ({totalAll})
        </button>
        {subjects.map((sub) => {
          const count = subjectCounts[sub] || 0;
          return (
            <button
              key={sub}
              onClick={() => onChangeFilters({ ...filters, subject: sub })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filters.subject === sub
                  ? 'theme-chip-active'
                  : 'theme-chip-inactive'
              }`}
            >
              <span>{sub}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${filters.subject === sub ? 'bg-surface-elevated/30 text-accent-contrast' : 'bg-surface-inset text-secondary theme-text-secondary'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Facet Dropdowns (Ano, Banca, Tópicos) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-border text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Origem / Banca Dropdown */}
          <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2 rounded-2xl border border-border font-bold">
            <Building2 className="w-3.5 h-3.5 text-muted" />
            <select
              value={filters.exam_board}
              onChange={(e) => onChangeFilters({ ...filters, exam_board: e.target.value })}
              className="bg-transparent text-xs font-bold text-primary theme-text-primary focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-surface text-primary">Todas as Origens / Bancas</option>
              {examBoards.map((board) => (
                <option key={board} value={board} className="bg-surface text-primary">
                  {board}
                </option>
              ))}
            </select>
          </div>

          {/* Ano Dropdown */}
          <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2 rounded-2xl border border-border font-bold">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            <select
              value={filters.year}
              onChange={(e) => onChangeFilters({ ...filters, year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
              className="bg-transparent text-xs font-bold text-primary theme-text-primary focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-surface text-primary">Todos os Anos</option>
              {years.map((y) => (
                <option key={y} value={y} className="bg-surface text-primary">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Topico Dropdown */}
          {topics.length > 0 && (
            <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2 rounded-2xl border border-border font-bold max-w-xs">
              <Tag className="w-3.5 h-3.5 text-muted shrink-0" />
              <select
                value={filters.topic}
                onChange={(e) => onChangeFilters({ ...filters, topic: e.target.value })}
                className="bg-transparent text-xs font-bold text-primary theme-text-primary focus:outline-none cursor-pointer truncate"
              >
                <option value="all" className="bg-surface text-primary">Todos os Tópicos / Tags</option>
                {topics.map((t) => (
                  <option key={t} value={t} className="bg-surface text-primary">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-secondary hover:text-accent font-bold px-3 py-1.5 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Total Results indicator */}
        <div className="text-secondary theme-text-secondary font-semibold">
          Exibindo <span className="font-black text-primary theme-text-primary px-2 py-0.5 bg-surface-subtle border border-border rounded-lg">{totalFiltered}</span> de <span className="font-bold">{totalAll}</span> questões
        </div>
      </div>
    </div>
  );
};

