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
    <div className="theme-card rounded-3xl p-5 shadow-lg shadow-slate-200/40 dark:shadow-none space-y-4">
      {/* Top Search and Status Filter Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
            <span className="opacity-80 text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
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
            <span className="opacity-80 text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">
              {statusCounts.unanswered}
            </span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'correct' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filters.status === 'correct'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25 border-b-2 border-emerald-800'
                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Acertos</span>
            <span className="opacity-80 text-[10px]">({statusCounts.correct})</span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'wrong' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filters.status === 'wrong'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 border-b-2 border-rose-800'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Erros</span>
            <span className="opacity-80 text-[10px]">({statusCounts.wrong})</span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'bookmarked' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filters.status === 'bookmarked'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 border-b-2 border-amber-700'
                : 'bg-amber-50 text-amber-900 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Marcadas</span>
            <span className="opacity-80 text-[10px]">({statusCounts.bookmarked})</span>
          </button>

          <button
            onClick={() => onChangeFilters({ ...filters, status: 'srs_due' })}
            className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
              filters.status === 'srs_due'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 border-b-2 border-indigo-800'
                : 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
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
        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Disciplinas:
        </span>
        <button
          onClick={() => onChangeFilters({ ...filters, subject: 'all' })}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
            filters.subject === 'all'
              ? 'bg-indigo-600 text-white shadow-sm border-b-2 border-indigo-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 ${
                filters.subject === sub
                  ? 'bg-indigo-600 text-white shadow-sm border-b-2 border-indigo-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{sub}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${filters.subject === sub ? 'bg-indigo-800/60 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Facet Dropdowns (Ano, Banca, Tópicos) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Banca Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.exam_board}
              onChange={(e) => onChangeFilters({ ...filters, exam_board: e.target.value })}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Bancas</option>
              {examBoards.map((board) => (
                <option key={board} value={board} className="dark:bg-slate-900">
                  {board}
                </option>
              ))}
            </select>
          </div>

          {/* Ano Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.year}
              onChange={(e) => onChangeFilters({ ...filters, year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">Todos os Anos</option>
              {years.map((y) => (
                <option key={y} value={y} className="dark:bg-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Topico Dropdown */}
          {topics.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 font-bold max-w-xs">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filters.topic}
                onChange={(e) => onChangeFilters({ ...filters, topic: e.target.value })}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate"
              >
                <option value="all">Todos os Tópicos / Tags</option>
                {topics.map((t) => (
                  <option key={t} value={t} className="dark:bg-slate-900">
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
              className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Total Results indicator */}
        <div className="text-slate-500 dark:text-slate-400 font-semibold">
          Exibindo <span className="font-black text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">{totalFiltered}</span> de <span className="font-bold">{totalAll}</span> questões
        </div>
      </div>
    </div>
  );
};

