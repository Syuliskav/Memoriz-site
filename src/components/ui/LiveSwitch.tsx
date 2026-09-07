import React, { useRef, useState, useCallback } from 'react';

interface LiveSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * LiveSwitch - Interruptor Vivo
 * Suporta toque/clique direto e arrasto contínuo 1:1 acompanhando mouse ou dedo.
 * O botão (thumb) segue a posição física do cursor em tempo real com física elástica.
 */
export const LiveSwitch: React.FC<LiveSwitchProps> = ({
  checked,
  onChange,
  title,
  ariaLabel,
  disabled = false,
  id,
}) => {
  const trackWidth = 42; // largura total do trilho
  const trackHeight = 24; // altura total do trilho
  const padding = 3; // espaçamento interno
  const thumbSize = 18; // diâmetro do botão
  const maxTravel = trackWidth - padding * 2 - thumbSize; // 42 - 6 - 18 = 18px

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startCheckedRef = useRef(checked);
  const hasMovedRef = useRef(false);

  // Posição calculada do thumb (em pixels a partir da esquerda)
  const currentPos = isDragging && dragOffset !== null
    ? dragOffset
    : checked
    ? maxTravel
    : 0;

  // Fração de ativação para calcular cor do trilho durante arrasto (0 a 1)
  const activationRatio = currentPos / maxTravel;
  const isVisuallyActive = activationRatio >= 0.5;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.button !== 0) return; // apenas botão principal do mouse

    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startCheckedRef.current = checked;
    hasMovedRef.current = false;

    const initialPos = checked ? maxTravel : 0;
    setDragOffset(initialPos);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Falha silenciosa caso o navegador não suporte pointer capture
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 2) {
      hasMovedRef.current = true;
    }

    const basePos = startCheckedRef.current ? maxTravel : 0;
    const clampedPos = Math.max(0, Math.min(maxTravel, basePos + deltaX));
    setDragOffset(clampedPos);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignora
    }

    if (hasMovedRef.current && dragOffset !== null) {
      // Se arrastou, determina estado baseado em se passou da metade (50%)
      const newState = dragOffset >= maxTravel * 0.5;
      if (newState !== checked) {
        onChange(newState);
      }
    } else {
      // Se foi apenas um clique/toque sem arrasto, inverte o estado
      onChange(!checked);
    }

    setDragOffset(null);
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffset(null);
  };

  return (
    <div
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || title}
      title={title}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`relative inline-flex items-center rounded-full select-none cursor-pointer border transition-colors touch-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        isVisuallyActive
          ? 'bg-accent border-accent'
          : 'bg-surface-subtle border-border hover:border-border-strong'
      }`}
      style={{
        width: `${trackWidth}px`,
        height: `${trackHeight}px`,
        padding: `${padding}px`,
      }}
    >
      {/* Botão Vivo Deslizante (Thumb) */}
      <span
        className={`inline-block rounded-full shadow-sm pointer-events-none ${
          isDragging ? '' : 'transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
        } ${
          isVisuallyActive
            ? 'bg-surface-elevated'
            : 'bg-secondary'
        }`}
        style={{
          width: `${thumbSize}px`,
          height: `${thumbSize}px`,
          transform: `translateX(${currentPos}px)`,
        }}
      />
    </div>
  );
};
