import React, { useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Prevent background scrolling when modal is open
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

  const shortcuts = [
    { key: 'Espaço', desc: 'Pausar / Retomar cronômetro e tela com blur' },
    { key: 'A, B, C, D, E', desc: 'Selecionar alternativa da questão' },
    { key: 'Enter', desc: 'Confirmar resposta selecionada' },
    { key: '→ (Seta Direita)', desc: 'Avançar para a próxima questão' },
    { key: '← (Seta Esquerda)', desc: 'Voltar para a questão anterior' },
    { key: 'M', desc: 'Favoritar / Marcar questão para revisão' },
    { key: 'G', desc: 'Exibir ou ocultar gabarito e resolução comentada' },
    { key: 'Ctrl + B', desc: 'Abrir / Fechar menu principal e filtros' },
    { key: 'Botão Direito', desc: 'Riscar / Eliminar alternativa descartada' },
    { key: 'Esc', desc: 'Fechar modais, pausa e painéis flutuantes' },
  ];

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div 
        id="shortcuts-modal-card"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl relative my-auto max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100">Atalhos de Teclado</h3>
              <p className="text-xs text-slate-500">Navegação rápida sem usar o mouse</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto overflow-x-hidden space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60 flex-1">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-3">
              <span className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{sc.desc}</span>
              <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] rounded border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex justify-end shrink-0">
          <button
            id="dismiss-shortcuts-modal-btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
