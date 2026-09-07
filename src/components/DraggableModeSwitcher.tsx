import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { BrainCircuit, Repeat, AlertTriangle, Timer, BarChart3 } from 'lucide-react';
import { StudyMode } from '../types/question';

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

  // Mathematical DOM Layout Anchoring: stores physical pixel geometry measured from the DOM node
  const [pillGeometry, setPillGeometry] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const startXRef = useRef(0);
  const startLeftRef = useRef(0);
  const startIndexRef = useRef(0);
  const startCenterRef = useRef(0);
  const currentHoverModeRef = useRef<StudyMode>(currentMode);
  const [dragP, setDragP] = useState<number | null>(null);

  const activeIndex = Math.max(0, MODES.findIndex(m => m.id === currentMode));

  const syncPillToButton = useCallback((idx: number) => {
    const btn = buttonRefs.current[idx];
    if (!btn) return;
    setPillGeometry({
      left: btn.offsetLeft,
      top: btn.offsetTop,
      width: btn.offsetWidth,
      height: btn.offsetHeight,
    });
  }, []);

  // Proportional synchronization from external carousel scroll or drag gesture
  useLayoutEffect(() => {
    if (isDraggingRef.current) return;

    if (dragProgress && dragProgress.isDragging) {
      const p = Math.max(0, Math.min(MODES.length - 1, dragProgress.activeIndex + dragProgress.offsetFraction));
      const fromIdx = Math.floor(p);
      const toIdx = Math.min(MODES.length - 1, fromIdx + 1);
      const t = p - fromIdx;

      const btns = buttonRefs.current;
      const bFrom = btns[fromIdx];
      const bTo = btns[toIdx];

      if (bFrom && bTo) {
        const fromLeft = bFrom.offsetLeft;
        const fromRight = bFrom.offsetLeft + bFrom.offsetWidth;
        const toLeft = bTo.offsetLeft;
        const toRight = bTo.offsetLeft + bTo.offsetWidth;

        const interpLeft = fromLeft * (1 - t) + toLeft * t;
        const interpRight = fromRight * (1 - t) + toRight * t;
        const interpWidth = interpRight - interpLeft;
        const interpTop = bFrom.offsetTop * (1 - t) + bTo.offsetTop * t;
        const interpHeight = bFrom.offsetHeight * (1 - t) + bTo.offsetHeight * t;

        setPillGeometry({
          left: Math.round(interpLeft),
          top: Math.round(interpTop),
          width: Math.round(interpWidth),
          height: Math.round(interpHeight),
        });
      }
    } else {
      syncPillToButton(activeIndex);
    }
  }, [dragProgress, activeIndex, syncPillToButton]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (!isDraggingRef.current && (!dragProgress || !dragProgress.isDragging)) {
        syncPillToButton(activeIndex);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [activeIndex, syncPillToButton, dragProgress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const currentBtn = buttonRefs.current[activeIndex];
    if (!currentBtn) return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startLeftRef.current = currentBtn.offsetLeft;
    startIndexRef.current = activeIndex;
    startCenterRef.current = currentBtn.offsetLeft + currentBtn.offsetWidth / 2;
    currentHoverModeRef.current = currentMode;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const delta = e.clientX - startXRef.current;

    // Threshold to prevent swallowing simple clicks
    if (!hasDraggedRef.current && Math.abs(delta) > 5) {
      hasDraggedRef.current = true;
      isDraggingRef.current = true;
      setIsDragging(true);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }

    if (hasDraggedRef.current) {
      const btns = buttonRefs.current;
      const firstBtn = btns[0];
      const lastBtn = btns[MODES.length - 1];
      const currentBtn = btns[startIndexRef.current] || firstBtn;
      if (!firstBtn || !lastBtn || !currentBtn) return;

      // 1. Compute button centers
      const centers: number[] = [];
      for (let i = 0; i < MODES.length; i++) {
        const b = btns[i];
        if (b) {
          centers.push(b.offsetLeft + b.offsetWidth / 2);
        } else {
          centers.push(0);
        }
      }

      const startCenter = startCenterRef.current || (currentBtn.offsetLeft + currentBtn.offsetWidth / 2);
      const targetCenter = startCenter + delta;
      const minCenter = centers[0];
      const maxCenter = centers[MODES.length - 1];
      const clampedCenter = Math.max(minCenter, Math.min(maxCenter, targetCenter));

      // 2. Find continuous segment position p in [0, MODES.length - 1]
      let p = 0;
      if (clampedCenter <= minCenter) {
        p = 0;
      } else if (clampedCenter >= maxCenter) {
        p = MODES.length - 1;
      } else {
        for (let i = 0; i < MODES.length - 1; i++) {
          if (clampedCenter >= centers[i] && clampedCenter <= centers[i + 1]) {
            const segDist = centers[i + 1] - centers[i];
            const t = segDist > 0 ? (clampedCenter - centers[i]) / segDist : 0;
            p = i + t;
            break;
          }
        }
      }

      // 3. Continuous geometric interpolation of left, right, width, top, height
      const fromIdx = Math.floor(p);
      const toIdx = Math.min(MODES.length - 1, fromIdx + 1);
      const t = p - fromIdx;

      const bFrom = btns[fromIdx] || currentBtn;
      const bTo = btns[toIdx] || currentBtn;

      const fromLeft = bFrom.offsetLeft;
      const fromRight = bFrom.offsetLeft + bFrom.offsetWidth;
      const toLeft = bTo.offsetLeft;
      const toRight = bTo.offsetLeft + bTo.offsetWidth;

      const interpLeft = fromLeft * (1 - t) + toLeft * t;
      const interpRight = fromRight * (1 - t) + toRight * t;
      const interpWidth = interpRight - interpLeft;
      const interpTop = bFrom.offsetTop * (1 - t) + bTo.offsetTop * t;
      const interpHeight = bFrom.offsetHeight * (1 - t) + bTo.offsetHeight * t;

      const closestIdx = Math.max(0, Math.min(MODES.length - 1, Math.round(p)));
      currentHoverModeRef.current = MODES[closestIdx].id;

      setDragP(p);
      setPillGeometry({
        left: Math.round(interpLeft),
        top: Math.round(interpTop),
        width: Math.round(interpWidth),
        height: Math.round(interpHeight),
      });

      if (onDragProgress) {
        onDragProgress({
          activeIndex: startIndexRef.current,
          offsetFraction: p - startIndexRef.current,
          isDragging: true,
        });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    setDragP(null);

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      isDraggingRef.current = false;
      setIsDragging(false);

      const targetMode = currentHoverModeRef.current;
      const finalIdx = MODES.findIndex(m => m.id === targetMode);
      const safeFinalIdx = finalIdx >= 0 ? finalIdx : startIndexRef.current;

      if (onDragProgress) {
        onDragProgress({
          activeIndex: safeFinalIdx,
          offsetFraction: 0,
          isDragging: false,
        });
      }

      if (targetMode !== currentMode) {
        onSelectMode(targetMode);
      } else {
        syncPillToButton(safeFinalIdx);
      }
    } else {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  const handleButtonClick = (modeId: StudyMode, index: number) => {
    if (hasDraggedRef.current) return;
    setDragP(null);
    onSelectMode(modeId);
    syncPillToButton(index);
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
      onPointerCancel={handlePointerUp}
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
              <div className="relative inline-flex items-center justify-center">
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {/* SRS Due Badge: sobreposto no cantinho do ícone */}
                {mode.id === 'srs' && srsDueCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 py-0.5 text-[8.5px] font-bold rounded-full bg-accent text-accent-contrast border border-border/20 leading-none min-w-[15px] h-[15px] flex items-center justify-center shadow-xs whitespace-nowrap pointer-events-none z-20">
                    {srsDueCount > 99 ? '99+' : srsDueCount}
                  </span>
                )}
                {/* Error Notebook Count Badge: sobreposto no cantinho do ícone */}
                {mode.id === 'error_notebook' && errorCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 px-1 py-0.5 text-[8.5px] font-bold rounded-full bg-danger-bg text-danger border border-danger-border leading-none min-w-[15px] h-[15px] flex items-center justify-center shadow-xs whitespace-nowrap pointer-events-none z-20">
                    {errorCount > 99 ? '99+' : errorCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium leading-tight mt-0.5 tracking-tight truncate max-w-full">
                {mode.label}
              </span>
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
            <div className="relative inline-flex items-center justify-center">
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {/* SRS Due Badge: sobreposto no cantinho do ícone */}
              {mode.id === 'srs' && srsDueCount > 0 && (
                <span 
                  className="absolute -top-1.5 -right-2 px-1 py-0.5 text-[8.5px] font-bold rounded-full bg-accent text-accent-contrast leading-none min-w-[14px] h-[14px] flex items-center justify-center shadow-xs whitespace-nowrap pointer-events-none z-20" 
                  title={`${srsDueCount} questões para fixação pendente`}
                >
                  {srsDueCount > 99 ? '99+' : srsDueCount}
                </span>
              )}
              {/* Error Notebook Count Badge: sobreposto no cantinho do ícone */}
              {mode.id === 'error_notebook' && errorCount > 0 && (
                <span 
                  className="absolute -top-1.5 -right-2 px-1 py-0.5 text-[8.5px] font-bold rounded-full bg-danger-bg text-danger border border-danger-border leading-none min-w-[14px] h-[14px] flex items-center justify-center shadow-xs whitespace-nowrap pointer-events-none z-20" 
                  title={`${errorCount} questões no caderno de erros`}
                >
                  {errorCount > 99 ? '99+' : errorCount}
                </span>
              )}
            </div>
            <span className="truncate">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};
