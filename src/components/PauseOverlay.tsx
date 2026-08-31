import React, { useEffect } from 'react';
import { Play } from 'lucide-react';

interface PauseOverlayProps {
  isOpen: boolean;
  onResume: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  isOpen,
  onResume,
}) => {
  // Prevent background scrolling while paused
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="pause-screen-overlay"
      onClick={onResume}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm transition-opacity duration-150 cursor-pointer select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Tela de Pausa"
    >
      <div 
        className="flex flex-col items-center text-center space-y-4 max-w-xs"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-medium tracking-tight text-white/90">
          Pausado
        </h2>

        <button
          type="button"
          onClick={onResume}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-medium text-sm transition-colors cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Continuar</span>
        </button>

        <p className="text-xs text-white/50">
          Pressione <kbd className="font-mono text-white/75 bg-white/10 px-1.5 py-0.5 rounded text-[11px]">Espaço</kbd> ou clique para retomar
        </p>
      </div>
    </div>
  );
};

