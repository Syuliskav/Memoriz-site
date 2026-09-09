import React, { useRef } from 'react';
import { BrainCircuit, Repeat, AlertTriangle, Timer, BarChart3 } from 'lucide-react';
import { StudyMode } from '../types/question';
import { useTrackSnapDrag } from '../hooks/usePointerDrag';

interface DraggableModeSwitcherProps {
  currentMode: StudyMode;
  onSelectMode: (mode: StudyMode) => void;
  srsDueCount: number;
  errorCount: number;
  dragProgress?: { activeIndex: number; offsetFraction: number; isDragging: boolean } | null;
  onDragProgress?: (dragProgress: { activeIndex: number; offsetFraction: number; isDragging: boolean }) => void;
  variant?: 'header' | 'bottom-bar';
}

interface ModeItem {
  id: StudyMode;
  label: string;
  icon: React.FC<{ className?: string }>;
}

export const MODES: ModeItem[] = [
  { id: 'practice', label: 'Prática', icon: BrainCircuit },
  { id: 'srs', label: 'Fixação', icon: Repeat },
  { id: 'error_notebook', label: 'Erros', icon: AlertTriangle },
  { id: 'simulado', label: 'Simulado', icon: Timer },
  { id: 'metrics', label: 'Métricas', icon: BarChart3 },
];

export const DraggableModeSwitcher: React.FC<DraggableModeSwitcherProps> = ({
  currentMode,
  onSelectMode,
  srsDueCount,
  errorCount,
  dragProgress,
  onDragProgress,
  variant = 'header',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = Math.max(0, MODES.findIndex(m => m.id === currentMode));

  const {
    isDragging,
    dragProgress: dragP,
    pillGeometry,
    syncGeometry,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useTrackSnapDrag({
    itemCount: MODES.length,
    activeIndex,
    containerRef,
    getItemElement: (idx) => buttonRefs.current[idx],
    dragThreshold: 5,
    externalProgress: dragProgress,
    useContinuousInterpolation: true,
    onDragMove: (info) => {
      if (onDragProgress) {
        onDragProgress({
          activeIndex,
          offsetFraction: info.progress - activeIndex,
          isDragging: true,
        });
      }
    },
    onSnap: (finalIdx) => {
      const targetMode = MODES[finalIdx]?.id || currentMode;
      if (targetMode !== currentMode) {
        onSelectMode(targetMode);
      } else {
        syncGeometry(finalIdx);
      }
    },
    onDragEnd: (_hadDragged, finalIdx) => {
      if (onDragProgress) {
        onDragProgress({
          activeIndex: finalIdx,
          offsetFraction: 0,
          isDragging: false,
        });
      }
    },
  });

  const handleButtonClick = (modeId: StudyMode, index: number) => {
    if (isDragging) return;
    onSelectMode(modeId);
    syncGeometry(index);
    if (onDragProgress) {
      onDragProgress({
        activeIndex: index,
        offsetFraction: 0,
        isDragging: false,
      });
    }
  };

  const isBottomBar = variant === 'bottom-bar';

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`relative flex items-center w-full select-none touch-none ${
        isBottomBar 
          ? 'p-0.5 rounded-2xl theme-card-subtle' 
          : 'p-1 rounded-xl theme-card-subtle'
      }`}
      style={{
        boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
      title="Clique diretamente ou arraste para alternar modos de estudo"
    >
      {/* 
        DOM ANCHORED ACTIVE PILL INDICATOR:
        Position and dimensions are derived directly from the active button's DOM node (offsetLeft, offsetWidth).
        Zero drift, zero desynchronization.
      */}
      {pillGeometry && (
        <div
          className={`absolute bg-surface text-primary theme-text-primary shadow-xs border border-border/70 pointer-events-none ${
            isBottomBar ? 'rounded-xl' : 'rounded-lg'
          }`}
          style={{
            transform: `translate3d(${pillGeometry.left}px, ${pillGeometry.top}px, 0)`,
            width: `${pillGeometry.width}px`,
            height: `${pillGeometry.height}px`,
            transition: (isDragging || dragProgress?.isDragging) ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.22s ease',
            willChange: 'transform',
            left: 0,
            top: 0,
          }}
        />
      )}

      {/* 5 Mode Buttons with Symmetrical Flex distribution */}
      {MODES.map((mode, idx) => {
        const continuousIdx = (isDragging && dragP !== null)
          ? dragP
          : (dragProgress && dragProgress.isDragging)
          ? dragProgress.activeIndex + dragProgress.offsetFraction
          : activeIndex;
        const dist = Math.abs(continuousIdx - idx);
        const isActive = dist < 0.45;
        const Icon = mode.icon;

        if (isBottomBar) {
          return (
            <button
              key={mode.id}
              ref={el => { buttonRefs.current[idx] = el; }}
              type="button"
              aria-label={mode.label}
              title={mode.label}
              onClick={(e) => {
                e.stopPropagation();
                handleButtonClick(mode.id, idx);
              }}
              style={{
                opacity: isActive ? 1 : Math.max(0.65, 1 - dist * 0.35),
              }}
              className={`relative z-10 flex-1 w-0 basis-0 min-w-0 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer select-none ${
                isActive
                  ? 'text-primary theme-text-primary font-bold'
                  : 'text-secondary theme-text-secondary hover:text-primary'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5 tracking-tight truncate max-w-full">
                {mode.label}
              </span>

              {/* SRS Due Badge: sobreposto no canto superior direito do botão */}
              {mode.id === 'srs' && srsDueCount > 0 && (
                <span 
                  className="absolute top-[0.125rem] right-[0.25rem] sm:right-[0.375rem] px-[0.3rem] py-[0.1rem] text-[0.625rem] sm:text-[0.6875rem] font-bold rounded-full bg-accent text-accent-contrast shadow-2xs leading-none pointer-events-none z-20 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center tabular-nums"
                  title={`${srsDueCount} questões para fixação pendente`}
                >
                  {srsDueCount > 99 ? '99+' : srsDueCount}
                </span>
              )}

              {/* Error Notebook Count Badge: sobreposto no canto superior direito do botão */}
              {mode.id === 'error_notebook' && errorCount > 0 && (
                <span 
                  className="absolute top-[0.125rem] right-[0.25rem] sm:right-[0.375rem] px-[0.3rem] py-[0.1rem] text-[0.625rem] sm:text-[0.6875rem] font-bold rounded-full bg-danger-bg text-danger border border-danger-border shadow-2xs leading-none pointer-events-none z-20 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center tabular-nums"
                  title={`${errorCount} questões no caderno de erros`}
                >
                  {errorCount > 99 ? '99+' : errorCount}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={mode.id}
            ref={el => { buttonRefs.current[idx] = el; }}
            type="button"
            aria-label={mode.label}
            title={mode.label}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonClick(mode.id, idx);
            }}
            style={{
              opacity: isActive ? 1 : Math.max(0.65, 1 - dist * 0.35),
            }}
            className={`relative z-10 flex-1 w-0 basis-0 min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 sm:px-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer select-none ${
              isActive
                ? 'text-primary theme-text-primary font-bold'
                : 'text-secondary theme-text-secondary hover:text-primary'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{mode.label}</span>

            {/* SRS Due Badge: sobreposto no canto superior direito do botão */}
            {mode.id === 'srs' && srsDueCount > 0 && (
              <span 
                className="absolute -top-[0.35rem] right-[0.125rem] sm:right-[0.25rem] px-[0.3rem] py-[0.1rem] text-[0.625rem] sm:text-[0.6875rem] font-bold rounded-full bg-accent text-accent-contrast shadow-2xs leading-none pointer-events-none z-20 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center tabular-nums" 
                title={`${srsDueCount} questões para fixação pendente`}
              >
                {srsDueCount > 99 ? '99+' : srsDueCount}
              </span>
            )}

            {/* Error Notebook Count Badge: sobreposto no canto superior direito do botão */}
            {mode.id === 'error_notebook' && errorCount > 0 && (
              <span 
                className="absolute -top-[0.35rem] right-[0.125rem] sm:right-[0.25rem] px-[0.3rem] py-[0.1rem] text-[0.625rem] sm:text-[0.6875rem] font-bold rounded-full bg-danger-bg text-danger border border-danger-border shadow-2xs leading-none pointer-events-none z-20 min-w-[1.125rem] h-[1.125rem] flex items-center justify-center tabular-nums" 
                title={`${errorCount} questões no caderno de erros`}
              >
                {errorCount > 99 ? '99+' : errorCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
