import React from 'react';

/**
 * Memoriz Semantic Design Primitives
 * 
 * Rigid base components using 100% semantic color tokens.
 * Immune to theme desync across Light, Reading, Night and Dark.
 */

// ==========================================
// 1. CARD
// ==========================================
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'inset' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}) => {
  const variantClass = {
    default: 'theme-card bg-surface border border-border text-primary shadow-xs',
    subtle: 'theme-card-subtle bg-surface-subtle border border-border-subtle text-primary',
    inset: 'bg-surface-inset border border-border-subtle text-primary',
    elevated: 'theme-surface-elevated bg-surface-elevated border border-border text-primary shadow-md',
  }[variant];

  const paddingClass = {
    none: 'p-0',
    sm: 'p-2.5 sm:p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-7',
  }[padding];

  return (
    <div
      className={`rounded-xl transition-colors ${variantClass} ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// 2. PANEL (Structural Sections & Containers)
// ==========================================
export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Panel: React.FC<PanelProps> = ({
  elevated = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`theme-surface bg-surface border border-border text-primary rounded-2xl ${
        elevated ? 'shadow-xl' : 'shadow-sm'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// ==========================================
// 3. BADGE / CHIP
// ==========================================
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'subtle' | 'success' | 'danger' | 'warning' | 'neutral';
  size?: 'xs' | 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'subtle',
  size = 'sm',
  className = '',
  children,
  ...props
}) => {
  const variantClass = {
    accent: 'bg-accent text-accent-contrast font-semibold shadow-2xs',
    subtle: 'theme-badge-subtle bg-accent-subtle text-accent-subtle-text border border-accent-subtle-border font-medium',
    success: 'bg-success-bg text-success border border-success-border font-medium',
    danger: 'bg-danger-bg text-danger border border-danger-border font-medium',
    warning: 'bg-warning-bg text-warning border border-warning-border font-medium',
    neutral: 'bg-surface-subtle text-secondary border border-border-subtle font-medium',
  }[variant];

  const sizeClass = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-sm',
    sm: 'text-xs px-2 py-0.5 rounded-md',
    md: 'text-xs sm:text-sm px-2.5 py-1 rounded-lg',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none ${sizeClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// ==========================================
// 4. PRIMARY BUTTON
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const sizeClass = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-xs sm:text-sm',
    lg: 'px-5 py-2.5 text-sm sm:text-base font-semibold',
  }[size];

  return (
    <button
      disabled={disabled}
      className={`theme-btn-accent bg-accent hover:bg-accent-hover text-accent-contrast font-semibold rounded-lg transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 disabled:opacity-50 disabled:pointer-events-none ${
        fullWidth ? 'w-full' : ''
      } ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ==========================================
// 5. SECONDARY BUTTON
// ==========================================
export const SecondaryButton: React.FC<ButtonProps> = ({
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props
}) => {
  const sizeClass = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm',
    lg: 'px-4 py-2 text-sm sm:text-base',
  }[size];

  return (
    <button
      disabled={disabled}
      className={`theme-btn-secondary bg-surface-subtle hover:bg-surface-hover text-primary border border-border font-medium rounded-lg transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:pointer-events-none ${
        fullWidth ? 'w-full' : ''
      } ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
