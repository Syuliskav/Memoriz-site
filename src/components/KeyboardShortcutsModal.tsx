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
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl relative my-auto max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Atalhos de Teclado</h3>
              <p className="text-xs text-slate-500">Navegação rápida sem usar o mouse</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-700 dark:text-slate-300 font-medium">{sc.desc}</span>
              <kbd className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px] rounded border border-slate-200 dark:border-slate-700">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            id="dismiss-shortcuts-modal-btn"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-medium rounded transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
