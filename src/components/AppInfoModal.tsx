import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  RefreshCw, 
  Share, 
  PlusSquare, 
  Database, 
  HardDrive, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { APP_VERSION, APP_BUILD_ID, checkAppUpdate, forcePurgeAndReload } from '../lib/versionManager';

interface AppInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions?: number;
}

export const AppInfoModal: React.FC<AppInfoModalProps> = ({
  isOpen,
  onClose,
  totalQuestions = 0
}) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, isOnline, effectiveType, install } = usePWAInstall();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (installed) {
        setUpdateFeedback('Aplicativo instalado com sucesso!');
      }
    } else if (isIOS) {
      setShowIosGuide(true);
    } else {
      setShowIosGuide(true);
    }
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateFeedback(null);
    try {
      const result = await checkAppUpdate();
      setUpdateFeedback(result.message);
    } catch (err) {
      setUpdateFeedback('Não foi possível verificar no momento.');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleManualPurge = () => {
    if (window.confirm('Deseja limpar todos os dados de cache do navegador e recarregar o aplicativo? (Requer internet)')) {
      forcePurgeAndReload();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="theme-modal w-full max-w-lg max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-none">
                  Memoriz
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  v{APP_VERSION}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Informações do Sistema & Modo Offline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* SECTION 1: INSTALAR APLICATIVO / PWA */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/60 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-[13px]">
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Instalação do Aplicativo (PWA)
              </span>

              {isStandalone ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Instalado
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tela Cheia Nativa
                </span>
              )}
            </div>

            {isStandalone ? (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                O <strong>Memoriz</strong> já está instalado e em execução no modo aplicativo independente. Você desfruta de tela cheia sem barras de navegador, inicialização instantânea e suporte offline total.
              </p>
            ) : (
              <>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  Instale o Memoriz na sua tela inicial para utilizá-lo como um aplicativo nativo no celular, tablet ou computador. Abre sem a barra de endereço do navegador e funciona 100% offline.
                </p>

                <button
                  id="modal-pwa-install-action-btn"
                  onClick={handleInstallClick}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold theme-btn-accent text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:opacity-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Memoriz no Dispositivo</span>
                </button>
              </>
            )}

            {/* iOS / Manual Guide Box */}
            {showIosGuide && !isStandalone && (
              <div className="p-3.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {isIOS ? 'Como instalar no Safari (iPhone / iPad):' : 'Como instalar no seu navegador:'}
                </p>
                {isIOS ? (
                  <ol className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <span>Toque no ícone de <strong>Compartilhar</strong> <Share className="inline w-3 h-3 text-indigo-600 dark:text-indigo-400 mx-0.5" /> no rodapé do Safari.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <span>Role a lista e toque em <strong>Adicionar à Tela de Início</strong> <PlusSquare className="inline w-3 h-3 text-indigo-600 dark:text-indigo-400 mx-0.5" />.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
                    </li>
                  </ol>
                ) : (
                  <ol className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <span>Clique nos <strong>três pontinhos ⋮</strong> no canto superior do navegador (Chrome ou Edge).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <span>Selecione <strong>Instalar aplicativo Memoriz</strong> ou <strong>Adicionar à tela de início</strong>.</span>
                    </li>
                  </ol>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: STATUS DE REDE & CACHE OFFLINE */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 text-[13px]">
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Funcionamento Offline & Rede
              </span>

              {isOnline ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Conectado {effectiveType ? `(${effectiveType})` : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                  <WifiOff className="w-3.5 h-3.5" />
                  Modo Offline Ativo
                </span>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              O Memoriz armazena todo o código, interface e banco de questões no cache local do dispositivo. Quando você estiver sem internet, o aplicativo continuará abrindo e respondendo com máxima velocidade.
            </p>

            {/* Check Update Button & Feedback */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                id="check-pwa-update-btn"
                onClick={handleCheckUpdate}
                disabled={checkingUpdate}
                className="py-2 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 font-medium text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                <span>{checkingUpdate ? 'Verificando...' : 'Verificar Atualização'}</span>
              </button>

              <button
                onClick={handleManualPurge}
                className="py-2 px-3 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-[11px] transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-center sm:text-left"
                title="Limpa cache de arquivos e recarrega versão fresca (requer internet)"
              >
                Limpar Cache Local
              </button>
            </div>

            {updateFeedback && (
              <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-800 dark:text-indigo-200 text-xs flex items-center gap-2 animate-in fade-in">
                <Sparkles className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span>{updateFeedback}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: INFORMAÇÕES DE DADOS E BUILD */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-400">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Banco de Questões</p>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                {totalQuestions.toLocaleString('pt-BR')} questões
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400">Assinatura de Build</p>
              <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mt-1 truncate" title={APP_BUILD_ID}>
                {APP_BUILD_ID}
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" /> Memoriz • Repetição Espaçada
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg theme-btn-accent font-semibold text-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
