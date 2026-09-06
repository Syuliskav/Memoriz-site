import { ThemeMode } from '../types/question';

export type RGBA = [number, number, number, number];

/**
 * Numeric RGBA definitions for all theme semantic variables.
 * Allows smooth, high-performance mathematical linear interpolation (lerp) during drag.
 */
export const THEME_COLOR_VARS: Record<string, Record<ThemeMode, RGBA>> = {
  '--theme-app-bg': {
    light: [241, 245, 249, 1],
    dark: [7, 9, 14, 1],
    reading: [251, 245, 232, 1],
    night: [16, 3, 0, 1],
  },
  '--theme-surface': {
    light: [255, 255, 255, 1],
    dark: [15, 23, 42, 1],
    reading: [243, 233, 212, 1],
    night: [28, 6, 0, 1],
  },
  '--theme-surface-subtle': {
    light: [248, 250, 252, 1],
    dark: [30, 41, 59, 1],
    reading: [235, 220, 194, 1],
    night: [38, 9, 0, 1],
  },
  '--theme-surface-inset': {
    light: [241, 245, 249, 1],
    dark: [10, 14, 23, 1],
    reading: [250, 243, 229, 1],
    night: [20, 4, 0, 1],
  },
  '--theme-surface-elevated': {
    light: [255, 255, 255, 1],
    dark: [30, 41, 59, 1],
    reading: [251, 245, 232, 1],
    night: [38, 9, 0, 1],
  },
  '--theme-surface-hover': {
    light: [241, 245, 249, 1],
    dark: [40, 53, 72, 1],
    reading: [235, 220, 194, 1],
    night: [56, 15, 0, 1],
  },
  '--theme-border': {
    light: [226, 232, 240, 1],
    dark: [51, 65, 85, 1],
    reading: [223, 205, 176, 1],
    night: [92, 20, 0, 1],
  },
  '--theme-border-subtle': {
    light: [241, 245, 249, 1],
    dark: [30, 41, 59, 1],
    reading: [235, 220, 194, 1],
    night: [59, 13, 0, 1],
  },
  '--theme-border-hover': {
    light: [148, 163, 184, 1],
    dark: [71, 85, 105, 1],
    reading: [191, 167, 130, 1],
    night: [128, 28, 0, 1],
  },
  '--theme-text-primary': {
    light: [15, 23, 42, 1],
    dark: [248, 250, 252, 1],
    reading: [43, 29, 12, 1],
    night: [255, 119, 51, 1],
  },
  '--theme-text-secondary': {
    light: [71, 85, 105, 1],
    dark: [148, 163, 184, 1],
    reading: [92, 71, 49, 1],
    night: [217, 68, 0, 1],
  },
  '--theme-text-muted': {
    light: [148, 163, 184, 1],
    dark: [100, 116, 139, 1],
    reading: [133, 110, 84, 1],
    night: [158, 46, 0, 1],
  },
  '--theme-accent': {
    light: [79, 70, 229, 1],
    dark: [99, 102, 241, 1],
    reading: [133, 77, 14, 1],
    night: [255, 43, 0, 1],
  },
  '--theme-accent-hover': {
    light: [67, 56, 202, 1],
    dark: [79, 70, 229, 1],
    reading: [113, 63, 18, 1],
    night: [230, 34, 0, 1],
  },
  '--theme-accent-subtle': {
    light: [79, 70, 229, 0.08],
    dark: [99, 102, 241, 0.15],
    reading: [133, 77, 14, 0.14],
    night: [255, 43, 0, 0.18],
  },
  '--theme-accent-subtle-border': {
    light: [79, 70, 229, 0.25],
    dark: [99, 102, 241, 0.35],
    reading: [133, 77, 14, 0.35],
    night: [255, 43, 0, 0.45],
  },
  '--theme-accent-subtle-text': {
    light: [67, 56, 202, 1],
    dark: [165, 180, 252, 1],
    reading: [113, 63, 18, 1],
    night: [255, 68, 0, 1],
  },
  '--theme-accent-contrast': {
    light: [255, 255, 255, 1],
    dark: [255, 255, 255, 1],
    reading: [255, 255, 255, 1],
    night: [16, 3, 0, 1],
  },
  '--theme-success-contrast': {
    light: [255, 255, 255, 1],
    dark: [255, 255, 255, 1],
    reading: [255, 255, 255, 1],
    night: [16, 3, 0, 1],
  },
  '--theme-danger-contrast': {
    light: [255, 255, 255, 1],
    dark: [255, 255, 255, 1],
    reading: [255, 255, 255, 1],
    night: [16, 3, 0, 1],
  },
  '--theme-warning-contrast': {
    light: [255, 255, 255, 1],
    dark: [255, 255, 255, 1],
    reading: [255, 255, 255, 1],
    night: [16, 3, 0, 1],
  },
  '--theme-success-bg': {
    light: [16, 185, 129, 0.10],
    dark: [16, 185, 129, 0.15],
    reading: [40, 90, 45, 0.12],
    night: [200, 25, 0, 0.20],
  },
  '--theme-success-border': {
    light: [16, 185, 129, 0.35],
    dark: [16, 185, 129, 0.35],
    reading: [40, 90, 45, 0.35],
    night: [255, 43, 0, 0.55],
  },
  '--theme-success-text': {
    light: [6, 95, 70, 1],
    dark: [110, 231, 183, 1],
    reading: [35, 68, 38, 1],
    night: [255, 102, 17, 1],
  },
  '--theme-danger': {
    light: [225, 29, 72, 1],
    dark: [239, 68, 68, 1],
    reading: [185, 28, 28, 1],
    night: [255, 43, 0, 1],
  },
  '--theme-danger-bg': {
    light: [225, 29, 72, 0.10],
    dark: [239, 68, 68, 0.18],
    reading: [160, 40, 30, 0.12],
    night: [180, 15, 0, 0.22],
  },
  '--theme-danger-border': {
    light: [225, 29, 72, 0.35],
    dark: [239, 68, 68, 0.45],
    reading: [160, 40, 30, 0.35],
    night: [255, 30, 0, 0.60],
  },
  '--theme-danger-text': {
    light: [159, 18, 57, 1],
    dark: [248, 113, 113, 1],
    reading: [111, 25, 16, 1],
    night: [255, 43, 0, 1],
  },
  '--theme-warning-bg': {
    light: [245, 158, 11, 0.10],
    dark: [245, 158, 11, 0.15],
    reading: [180, 83, 9, 0.12],
    night: [255, 68, 0, 0.18],
  },
  '--theme-warning-border': {
    light: [245, 158, 11, 0.35],
    dark: [245, 158, 11, 0.35],
    reading: [180, 83, 9, 0.35],
    night: [255, 68, 0, 0.50],
  },
  '--theme-warning-text': {
    light: [146, 64, 14, 1],
    dark: [253, 230, 138, 1],
    reading: [120, 53, 15, 1],
    night: [255, 102, 17, 1],
  },
  '--xp-track-bg': {
    light: [226, 232, 240, 1],
    dark: [30, 41, 59, 1],
    reading: [235, 220, 194, 1],
    night: [38, 9, 0, 1],
  },
  '--xp-track-border': {
    light: [203, 213, 225, 1],
    dark: [51, 65, 85, 1],
    reading: [223, 205, 176, 1],
    night: [92, 20, 0, 1],
  },
  '--xp-fill-bg': {
    light: [79, 70, 229, 0.22],
    dark: [99, 102, 241, 0.35],
    reading: [133, 77, 14, 0.28],
    night: [255, 43, 0, 0.35],
  },
  '--xp-fill-border': {
    light: [79, 70, 229, 1],
    dark: [129, 140, 248, 1],
    reading: [133, 77, 14, 1],
    night: [255, 43, 0, 1],
  },
  '--xp-header-pill-bg': {
    light: [241, 245, 249, 1],
    dark: [30, 41, 59, 1],
    reading: [235, 220, 194, 1],
    night: [28, 6, 0, 1],
  },
  '--xp-header-pill-border': {
    light: [226, 232, 240, 1],
    dark: [51, 65, 85, 1],
    reading: [223, 205, 176, 1],
    night: [92, 20, 0, 1],
  },
  '--xp-streak-text': {
    light: [30, 41, 59, 1],
    dark: [226, 232, 240, 1],
    reading: [43, 29, 12, 1],
    night: [255, 119, 51, 1],
  },
  '--xp-flame-color': {
    light: [245, 158, 11, 1],
    dark: [245, 158, 11, 1],
    reading: [180, 83, 9, 1],
    night: [255, 43, 0, 1],
  },
  '--xp-badge-text': {
    light: [67, 56, 202, 1],
    dark: [129, 140, 248, 1],
    reading: [133, 77, 14, 1],
    night: [255, 85, 0, 1],
  },
  '--xp-badge-icon': {
    light: [79, 70, 229, 1],
    dark: [99, 102, 241, 1],
    reading: [180, 83, 9, 1],
    night: [255, 43, 0, 1],
  },
};

/**
 * Linearly interpolates two RGBA color tuples with parameter t in [0, 1].
 */
export function lerpRGBA(c1: RGBA, c2: RGBA, t: number): string {
  const clampedT = Math.max(0, Math.min(1, t));
  const r = Math.round(c1[0] * (1 - clampedT) + c2[0] * clampedT);
  const g = Math.round(c1[1] * (1 - clampedT) + c2[1] * clampedT);
  const b = Math.round(c1[2] * (1 - clampedT) + c2[2] * clampedT);
  const a = c1[3] * (1 - clampedT) + c2[3] * clampedT;

  if (a >= 0.999) {
    return `rgb(${r}, ${g}, ${b})`;
  }
  return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
}

/**
 * Applies interpolated theme CSS variables directly to document.documentElement.style.
 */
export function applyInterpolatedTheme(themeA: ThemeMode, themeB: ThemeMode, progress: number): void {
  const root = document.documentElement;
  const clamped = Math.max(0, Math.min(1, progress));

  for (const [varName, values] of Object.entries(THEME_COLOR_VARS)) {
    const colA = values[themeA] || values.light;
    const colB = values[themeB] || values.dark;
    const interpolated = lerpRGBA(colA, colB, clamped);
    root.style.setProperty(varName, interpolated);
  }
}

/**
 * Removes all temporary inline CSS variable overrides from document.documentElement.style.
 */
export function clearInterpolatedTheme(): void {
  const root = document.documentElement;
  for (const varName of Object.keys(THEME_COLOR_VARS)) {
    root.style.removeProperty(varName);
  }
}
