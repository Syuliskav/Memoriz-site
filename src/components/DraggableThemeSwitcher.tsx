import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { Sun, Moon, BookOpen, Eye } from 'lucide-react';
import { ThemeMode } from '../types/question';
import { applyInterpolatedTheme, clearInterpolatedTheme } from '../lib/themeInterpolator';

interface DraggableThemeSwitcherProps {
  theme: ThemeMode;
  onToggleTheme: (newTheme: ThemeMode) => void;
  onTriggerDevMode?: () => void;
}

interface ThemeItem {
  id: ThemeMode;
  label: string;
  icon: React.FC<{ className?: string }>;
}

export const THEMES: ThemeItem[] = [
  { id: 'light', label: 'LightTheme', icon: Sun },
  { id: 'dark', label: 'DarkTheme', icon: Moon },
  { id: 'reading', label: 'ReadingTheme', icon: BookOpen },
  { id: 'night', label: 'NightTheme', icon: Eye },
];

export const DraggableThemeSwitcher: React.FC<DraggableThemeSwitcherProps> = ({
  theme,
  onToggleTheme,
  onTriggerDevMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Physical pixel geometry derived directly from DOM button nodes (makes desynchronization mathematically impossible)
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

  // Interpolation and rAF animation frame refs
  const targetLerpRef = useRef<{ themeA: ThemeMode; themeB: ThemeMode; progress: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const closestIdxRef = useRef<number>(0);

  // Triple-click detector to activate Developer Mode
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const registerClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (onTriggerDevMode) {
        onTriggerDevMode();
      }
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 650);
    }
  };

  const activeIndex = Math.max(0, THEMES.findIndex(t => t.id === theme));

  // Mathematical DOM Layout Anchoring: Reads exact physical coordinates of active button
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

  // Update geometry on mount, theme change, and window/container resize
  useLayoutEffect(() => {
    if (!isDraggingRef.current) {
      syncPillToButton(activeIndex);
    }
  }, [activeIndex, syncPillToButton]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (!isDraggingRef.current) {
        syncPillToButton(activeIndex);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [activeIndex, syncPillToButton]);

  // Clean up any active rAF and inline style overrides on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      clearInterpolatedTheme();
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const currentBtn = buttonRefs.current[activeIndex];
    if (!currentBtn) return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startLeftRef.current = currentBtn.offsetLeft;
    closestIdxRef.current = activeIndex;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const delta = e.clientX - startXRef.current;

    // Engage drag threshold
    if (!hasDraggedRef.current && Math.abs(delta) > 3) {
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
      const firstBtn = buttonRefs.current[0];
      const lastBtn = buttonRefs.current[THEMES.length - 1];
      if (!firstBtn || !lastBtn) return;

      const minLeft = firstBtn.offsetLeft;
      const maxLeft = lastBtn.offsetLeft;
      const pillWidth = firstBtn.offsetWidth;

      // Physically clamp within the track boundaries
      const rawLeft = startLeftRef.current + delta;
      const clampedLeft = Math.max(minLeft, Math.min(maxLeft, rawLeft));

      // Move indicator pill live
      setPillGeometry(prev => prev ? { ...prev, left: clampedLeft } : null);

      // LIVE CONTINUOUS COLOR INTERPOLATION (LERP) ACROSS THE TRACK:
      // Calculate centers of all 4 theme buttons
      const btnCenters: number[] = [];
      for (let i = 0; i < THEMES.length; i++) {
        const b = buttonRefs.current[i];
        btnCenters.push(b ? b.offsetLeft + b.offsetWidth / 2 : 0);
      }

      const pillCenter = clampedLeft + pillWidth / 2;
      let themeA: ThemeMode = THEMES[0].id;
      let themeB: ThemeMode = THEMES[0].id;
      let progress = 0;
      let closestIdx = 0;

      if (pillCenter <= btnCenters[0]) {
        themeA = THEMES[0].id;
        themeB = THEMES[0].id;
        progress = 0;
        closestIdx = 0;
      } else if (pillCenter >= btnCenters[THEMES.length - 1]) {
        themeA = THEMES[THEMES.length - 1].id;
        themeB = THEMES[THEMES.length - 1].id;
        progress = 1;
        closestIdx = THEMES.length - 1;
      } else {
        for (let i = 0; i < THEMES.length - 1; i++) {
          const cA = btnCenters[i];
          const cB = btnCenters[i + 1];
          if (pillCenter >= cA && pillCenter <= cB) {
            themeA = THEMES[i].id;
            themeB = THEMES[i + 1].id;
            const span = cB - cA;
            progress = span > 0 ? (pillCenter - cA) / span : 0;
            closestIdx = progress >= 0.5 ? i + 1 : i;
            break;
          }
        }
      }

      closestIdxRef.current = closestIdx;
      targetLerpRef.current = { themeA, themeB, progress };

      // High-performance interpolation scheduled on requestAnimationFrame
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (isDraggingRef.current && targetLerpRef.current) {
            applyInterpolatedTheme(
              targetLerpRef.current.themeA,
              targetLerpRef.current.themeB,
              targetLerpRef.current.progress
            );
          }
          rafIdRef.current = null;
        });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    // Cancel pending rAF
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Remove inline CSS interpolation overrides
    clearInterpolatedTheme();

    try {
      const target = e.currentTarget as HTMLElement;
      if (target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      isDraggingRef.current = false;
      setIsDragging(false);

      // Snap to finalized discrete active theme
      const finalIdx = closestIdxRef.current;
      const finalTheme = THEMES[finalIdx]?.id || theme;
      onToggleTheme(finalTheme);
      syncPillToButton(finalIdx);
    } else {
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  const handleThemeClick = (targetTheme: ThemeMode, idx: number) => {
    registerClick();
    if (hasDraggedRef.current) return;
    onToggleTheme(targetTheme);
    syncPillToButton(idx);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex items-center p-1 rounded-lg theme-card-subtle select-none touch-none shrink-0 overflow-hidden"
      title="Clique ou arraste para alternar o tema dinamicamente em tempo real (clique 3x para modo desenvolvedor)"
    >
      {/* 
        PHYSICALLY ANCHORED SLIDING PILL INDICATOR:
        Position and dimensions are sourced directly from the button element's offsetLeft and offsetWidth.
        Desynchronization between the indicator pill and the icon/button is mathematically impossible.
      */}
      {pillGeometry && (
        <div
          className="absolute rounded-md bg-surface text-accent shadow-xs border border-border/70 pointer-events-none"
          style={{
            transform: `translate3d(${pillGeometry.left}px, ${pillGeometry.top}px, 0)`,
            width: `${pillGeometry.width}px`,
            height: `${pillGeometry.height}px`,
            transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1), width 0.22s ease',
            willChange: 'transform',
            left: 0,
            top: 0,
          }}
        />
      )}

      {/* 4 Theme Icon Buttons */}
      {THEMES.map((item, idx) => {
        const isActive = activeIndex === idx;
        const Icon = item.icon;
        const themeIconClass =
          item.id === 'light'
            ? 'theme-btn-icon-light'
            : item.id === 'dark'
            ? 'theme-btn-icon-dark'
            : item.id === 'reading'
            ? 'theme-btn-icon-reading'
            : 'theme-btn-icon-night';

        return (
          <button
            key={item.id}
            ref={el => { buttonRefs.current[idx] = el; }}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleThemeClick(item.id, idx);
            }}
            className={`relative z-10 flex items-center justify-center p-1.5 rounded-md text-xs cursor-pointer transition-all ${
              isActive
                ? 'font-bold scale-105'
                : 'opacity-70 hover:opacity-100'
            }`}
            title={item.label}
            aria-label={item.label}
          >
            <Icon className={`w-3.5 h-3.5 shrink-0 ${themeIconClass}`} />
          </button>
        );
      })}
    </div>
  );
};
