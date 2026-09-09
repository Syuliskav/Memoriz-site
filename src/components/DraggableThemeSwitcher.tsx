import React, { useRef, useEffect } from 'react';
import { Sun, Moon, BookOpen, Eye } from 'lucide-react';
import { ThemeMode } from '../types/question';
import { applyInterpolatedTheme, clearInterpolatedTheme } from '../lib/themeInterpolator';
import { useTrackSnapDrag } from '../hooks/usePointerDrag';

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

  // Interpolation and rAF animation frame refs
  const targetLerpRef = useRef<{ themeA: ThemeMode; themeB: ThemeMode; progress: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);

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

  const {
    isDragging,
    pillGeometry,
    syncGeometry,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useTrackSnapDrag({
    itemCount: THEMES.length,
    activeIndex,
    containerRef,
    getItemElement: (idx) => buttonRefs.current[idx],
    dragThreshold: 3,
    useContinuousInterpolation: true,
    onDragMove: (info) => {
      const themeA = THEMES[info.fromIndex]?.id || THEMES[0].id;
      const themeB = THEMES[info.toIndex]?.id || THEMES[0].id;
      targetLerpRef.current = { themeA, themeB, progress: info.segmentProgress };

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (targetLerpRef.current) {
            applyInterpolatedTheme(
              targetLerpRef.current.themeA,
              targetLerpRef.current.themeB,
              targetLerpRef.current.progress
            );
          }
          rafIdRef.current = null;
        });
      }
    },
    onSnap: (finalIdx) => {
      const finalTheme = THEMES[finalIdx]?.id || theme;
      onToggleTheme(finalTheme);
      syncGeometry(finalIdx);
    },
    onDragEnd: () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      clearInterpolatedTheme();
    },
  });

  // Clean up any active rAF and inline style overrides on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      clearInterpolatedTheme();
    };
  }, []);

  const handleThemeClick = (targetTheme: ThemeMode, idx: number) => {
    registerClick();
    if (isDragging) return;
    onToggleTheme(targetTheme);
    syncGeometry(idx);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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
