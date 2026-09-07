import { ThemeMode } from '../types/question';

/**
 * High-performance, Unified Theme Design Tokens
 * 
 * Provides rigid, deterministic semantic tokens across all 4 themes:
 * - light: Classic daylight slate & vibrant indigo
 * - reading: Eye-safe paper pergaminho & cinnamon amber (zero fatigue)
 * - night: True circadian zero-blue obsidian & radiant flame (zero blue light)
 * - dark: AMOLED deep slate & electric indigo
 * 
 * Any new component or graphic element using these tokens is 100% immune to
 * color swapping, clashing contrasts, or "Frankenstein" artifact states.
 */

export interface ThemeTokenSet {
  appBg: string;
  surface: string;
  surfaceSubtle: string;
  surfaceInset: string;
  surfaceElevated: string;
  surfaceHover: string;
  border: string;
  borderSubtle: string;
  borderHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
  accentSubtleBorder: string;
  accentSubtleText: string;
  accentContrast: string;
  successBg: string;
  successBorder: string;
  successText: string;
  successContrast: string;
  dangerBg: string;
  dangerBorder: string;
  dangerText: string;
  dangerContrast: string;
  warningBg: string;
  warningBorder: string;
  warningText: string;
  warningContrast: string;
}

export const THEME_DESIGN_TOKENS: Record<ThemeMode, ThemeTokenSet> = {
  light: {
    appBg: '#f1f5f9',
    surface: '#ffffff',
    surfaceSubtle: '#f8fafc',
    surfaceInset: '#f1f5f9',
    surfaceElevated: '#ffffff',
    surfaceHover: '#f1f5f9',
    border: '#e2e8f0',
    borderSubtle: '#f1f5f9',
    borderHover: '#94a3b8',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accent: '#2f7596',
    accentHover: '#26607c',
    accentSubtle: 'rgba(47, 117, 150, 0.08)',
    accentSubtleBorder: 'rgba(47, 117, 150, 0.25)',
    accentSubtleText: '#235973',
    accentContrast: '#ffffff',
    successBg: 'rgba(16, 185, 129, 0.10)',
    successBorder: 'rgba(16, 185, 129, 0.35)',
    successText: '#065f46',
    successContrast: '#ffffff',
    dangerBg: 'rgba(244, 63, 94, 0.10)',
    dangerBorder: 'rgba(244, 63, 94, 0.35)',
    dangerText: '#9f1239',
    dangerContrast: '#ffffff',
    warningBg: 'rgba(245, 158, 11, 0.10)',
    warningBorder: 'rgba(245, 158, 11, 0.35)',
    warningText: '#92400e',
    warningContrast: '#ffffff',
  },
  reading: {
    appBg: '#fbf5e8',
    surface: '#f3e9d4',
    surfaceSubtle: '#ebdcc2',
    surfaceInset: '#faf3e5',
    surfaceElevated: '#fbf5e8',
    surfaceHover: '#ebdcc2',
    border: '#dfcdb0',
    borderSubtle: '#ebdcc2',
    borderHover: '#bfa782',
    textPrimary: '#2b1d0c',
    textSecondary: '#5c4731',
    textMuted: '#856e54',
    accent: '#854d0e',
    accentHover: '#713f12',
    accentSubtle: 'rgba(133, 77, 14, 0.12)',
    accentSubtleBorder: 'rgba(133, 77, 14, 0.35)',
    accentSubtleText: '#713f12',
    accentContrast: '#ffffff',
    successBg: 'rgba(40, 90, 45, 0.12)',
    successBorder: 'rgba(40, 90, 45, 0.35)',
    successText: '#234426',
    successContrast: '#ffffff',
    dangerBg: 'rgba(160, 40, 30, 0.12)',
    dangerBorder: 'rgba(160, 40, 30, 0.35)',
    dangerText: '#6f1910',
    dangerContrast: '#ffffff',
    warningBg: 'rgba(180, 83, 9, 0.12)',
    warningBorder: 'rgba(180, 83, 9, 0.35)',
    warningText: '#78350f',
    warningContrast: '#ffffff',
  },
  night: {
    appBg: '#100300',
    surface: '#1c0600',
    surfaceSubtle: '#260900',
    surfaceInset: '#140400',
    surfaceElevated: '#260900',
    surfaceHover: '#380f00',
    border: '#5c1400',
    borderSubtle: '#3b0d00',
    borderHover: '#801c00',
    textPrimary: '#ff7733',
    textSecondary: '#d94400',
    textMuted: '#9e2e00',
    accent: '#ff2b00',
    accentHover: '#e62200',
    accentSubtle: 'rgba(255, 43, 0, 0.18)',
    accentSubtleBorder: 'rgba(255, 43, 0, 0.45)',
    accentSubtleText: '#ff4400',
    accentContrast: '#100300',
    successBg: 'rgba(200, 25, 0, 0.20)',
    successBorder: 'rgba(255, 43, 0, 0.55)',
    successText: '#ff6611',
    successContrast: '#100300',
    dangerBg: 'rgba(180, 15, 0, 0.22)',
    dangerBorder: 'rgba(255, 30, 0, 0.60)',
    dangerText: '#ff2b00',
    dangerContrast: '#100300',
    warningBg: 'rgba(255, 68, 0, 0.18)',
    warningBorder: 'rgba(255, 68, 0, 0.50)',
    warningText: '#ff6611',
    warningContrast: '#100300',
  },
  dark: {
    appBg: '#07090e',
    surface: '#0f172a',
    surfaceSubtle: '#1e293b',
    surfaceInset: '#0a0e17',
    surfaceElevated: '#1e293b',
    surfaceHover: '#283548',
    border: '#334155',
    borderSubtle: '#1e293b',
    borderHover: '#475569',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    accent: '#6366f1',
    accentHover: '#4f46e5',
    accentSubtle: 'rgba(99, 102, 241, 0.15)',
    accentSubtleBorder: 'rgba(99, 102, 241, 0.35)',
    accentSubtleText: '#a5b4fc',
    accentContrast: '#ffffff',
    successBg: 'rgba(16, 185, 129, 0.15)',
    successBorder: 'rgba(16, 185, 129, 0.35)',
    successText: '#6ee7b7',
    successContrast: '#ffffff',
    dangerBg: 'rgba(244, 63, 94, 0.15)',
    dangerBorder: 'rgba(244, 63, 94, 0.35)',
    dangerText: '#fda4af',
    dangerContrast: '#ffffff',
    warningBg: 'rgba(245, 158, 11, 0.15)',
    warningBorder: 'rgba(245, 158, 11, 0.35)',
    warningText: '#fde68a',
    warningContrast: '#ffffff',
  },
};

/**
 * Standard semantic CSS class composites for rapid, zero-error UI development.
 * Using these means you never have to specify individual colors or dark: prefixes.
 */
export const ThemeClasses = {
  // Surfaces
  card: 'theme-card',
  cardSubtle: 'theme-card-subtle',
  modal: 'theme-modal',
  input: 'theme-input',

  // Buttons
  btnAccent: 'theme-btn-accent',
  btnSecondary: 'theme-btn-secondary',
  btnGhost: 'theme-btn-ghost',

  // Badges & Chips
  badgeAccent: 'theme-badge-accent',
  badgeSubtle: 'theme-badge-subtle',
  chipActive: 'theme-chip-active',
  chipInactive: 'theme-chip-inactive',

  // Typography
  textPrimary: 'theme-text-primary',
  textSecondary: 'theme-text-secondary',
  textMuted: 'theme-text-muted',

  // Options (Questions)
  optionDefault: 'theme-option-default',
  optionSelected: 'theme-option-selected',
  optionCorrect: 'theme-option-correct',
  optionWrong: 'theme-option-wrong',
} as const;
