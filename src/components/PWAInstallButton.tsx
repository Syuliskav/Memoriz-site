import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner';
  onInstalledOrDismissed?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  onInstalledOrDismissed
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed and running standalone, suppress UI
  if (isInstalled) {
    return null;
  }

  // Handle click based on platform
  const handleClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed && onInstalledOrDismissed) {
        onInstalledOrDismissed();
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // For desktop / non-triggered mobile, show helpful prompt modal
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          id="pwa-install-header-btn"
          onClick={handleClick}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold theme-badge-accent hover:opacity-90 transition-all cursor-pointer shadow-xs"
          title="Instalar Memoriz como App no celular ou PC"
          aria-label="Instalar Aplicativo"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden sm:inline">Instalar App</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          id="pwa-install-sidebar-btn"
          onClick={handleClick}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold theme-badge-accent hover:opacity-95 transition-all cursor-pointer shadow-xs text-left"
          title="Instalar Memoriz na tela inicial (Modo Standalone)"
        >
          <div className="p-1 rounded-md bg-white/20 dark:bg-black/20 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-tight">Instalar Aplicativo</p>
            <p className="text-[10px] opacity-80 truncate">Tela cheia sem barra de navegador</p>
          </div>
          <Download className="w-3.5 h-3.5 shrink-0" />
        </button>
      )}

      {/* Modal with instructions (particularly for iOS Safari or instructions) */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowIOSModal(false)}
        >
          <div 
            className="theme-modal w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
                  M
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Instalar Memoriz (PWA)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modo tela cheia nativo (standalone)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Steps */}
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              {isIOS ? (
                <>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    No <strong>Safari (iPhone / iPad)</strong>, siga estes 3 passos simples:
                  </p>
                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Toque no botão de <strong>Compartilhar</strong>{' '}
                        <Share className="inline w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mx-0.5" /> na barra inferior do Safari.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Role a lista e toque em{' '}
                        <strong>Adicionar à Tela de Início</strong>{' '}
                        <PlusSquare className="inline w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mx-0.5" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Toque em <strong>Adicionar</strong> no topo direito. O app será criado na sua tela com ícone dedicado e abrirá sem a barra do navegador.
                      </span>
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    No <strong>Chrome / Android / Edge</strong>:
                  </p>
                  <ol className="space-y-2.5 pl-1">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Abra o menu do navegador (<strong>três pontinhos</strong> no canto superior direito).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Confirme a instalação para ter acesso offline rápido e visual de aplicativo nativo.
                      </span>
                    </li>
                  </ol>
                </>
              )}
            </div>

            {/* Features check */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> Funcionamento Offline
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> Sem barra de URL
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" /> Acesso Instantâneo
              </span>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl font-semibold theme-btn-accent text-xs cursor-pointer"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
