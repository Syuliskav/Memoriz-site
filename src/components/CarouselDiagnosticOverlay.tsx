import React, { useState, useEffect } from 'react';
import { CarouselDiagnosticReport, runCarouselDiagnostic } from '../lib/carouselDiagnosticProbe';
import { Activity, X, RefreshCw, Layers, Bug, Check } from 'lucide-react';

interface CarouselDiagnosticOverlayProps {
  containerWidth: number;
  carouselContainerRef: React.RefObject<HTMLDivElement | null>;
  slideRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  rightVeilRef: React.RefObject<HTMLDivElement | null>;
  currentMode: string;
}

export const CarouselDiagnosticOverlay: React.FC<CarouselDiagnosticOverlayProps> = ({
  containerWidth,
  carouselContainerRef,
  slideRefs,
  rightVeilRef,
  currentMode,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [report, setReport] = useState<CarouselDiagnosticReport | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isTestingModal, setIsTestingModal] = useState<boolean>(false);

  const handleRun = () => {
    if (carouselContainerRef.current) {
      const rep = runCarouselDiagnostic(
        containerWidth,
        carouselContainerRef.current,
        slideRefs.current,
        rightVeilRef.current
      );
      setReport(rep);
    }
  };

  useEffect(() => {
    handleRun();
  }, [containerWidth, currentMode]);

  const handleTestModalState = () => {
    setIsTestingModal(true);
    handleRun();
    setTimeout(() => {
      setIsTestingModal(false);
    }, 400);
  };

  const handleCopyJson = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Small floating diagnostic button in bottom-right corner */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 px-2.5 py-1.5 bg-surface-elevated hover:bg-surface-hover text-primary text-xs font-mono rounded-lg shadow-lg border border-border cursor-pointer select-none"
        title="Painel de Diagnóstico de Larguras do Carrossel"
      >
        <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
        <span>Diag: {containerWidth}px</span>
      </button>

      {/* Diagnostic Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-canvas/80 backdrop-blur-xs">
          <div className="bg-surface theme-bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-primary theme-text-primary">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-subtle">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-sm font-mono">
                  Diagnóstico: Larguras do Carrossel (Corte de 1-2px)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRun}
                  className="p-1.5 rounded-md hover:bg-surface border border-border text-xs flex items-center gap-1 cursor-pointer"
                  title="Atualizar medições agora"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Recalcular</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-surface border border-border cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 overflow-y-auto text-xs font-mono">
              
              {/* Global Viewport Measurements */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-subtle p-3 rounded-lg border border-border">
                <div>
                  <span className="text-muted block text-[10px]">appCalculatedWidth:</span>
                  <span className="font-bold text-sm text-accent">
                    {report?.appCalculatedContainerWidth}px
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">document.clientWidth:</span>
                  <span className="font-bold text-sm text-primary">
                    {report?.documentElementClientWidth}px
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">window.innerWidth:</span>
                  <span className="font-bold text-sm text-secondary">
                    {report?.windowInnerWidth}px
                  </span>
                </div>
                <div>
                  <span className="text-muted block text-[10px]">container.boundingRect:</span>
                  <span className="font-bold text-sm text-primary">
                    {report?.carouselContainerBoundingWidth}px
                  </span>
                </div>
              </div>

              {/* Per-Slide Measurements Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-surface-subtle border-b border-border font-semibold flex items-center justify-between">
                  <span>Medição por Página (Modo Ativo: {currentMode})</span>
                  <span className="text-[10px] text-muted">
                    DPR: {report?.devicePixelRatio}x | Scroll: {report?.htmlOverflowY}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface text-muted text-[10px] border-b border-border">
                        <th className="p-2">Página</th>
                        <th className="p-2">Slide Rect</th>
                        <th className="p-2">Conteúdo Rect</th>
                        <th className="p-2">Conteúdo Right</th>
                        <th className="p-2">Véu Esquerdo</th>
                        <th className="p-2">Sobreposição Véu</th>
                        <th className="p-2">Corte?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {report?.slides.map((s) => (
                        <tr key={s.slideIndex} className={s.hasCut ? 'bg-danger-bg/20' : ''}>
                          <td className="p-2 font-medium">
                            {s.slideIndex}. {s.slideName}
                          </td>
                          <td className="p-2">{s.slideBoundingWidth}px</td>
                          <td className="p-2">{s.contentBoundingWidth}px</td>
                          <td className="p-2">{s.contentRight}px</td>
                          <td className="p-2">{s.veilRightLeft}px</td>
                          <td className="p-2 font-semibold">
                            <span className={s.veilOverlapPx > 0 ? 'text-danger' : 'text-success'}>
                              {s.veilOverlapPx > 0 ? `+${s.veilOverlapPx}px` : `${s.veilOverlapPx}px`}
                            </span>
                          </td>
                          <td className="p-2">
                            {s.hasCut ? (
                              <span className="px-1.5 py-0.5 bg-danger-bg text-danger border border-danger-border rounded text-[10px] font-bold">
                                CORTE
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-success-bg text-success border border-success-border rounded text-[10px]">
                                OK
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal / Drawer Overflow Test */}
              <div className="bg-surface-subtle p-3 rounded-lg border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-accent" />
                    Teste de Modal / Drawer (body overflow: hidden vs normal)
                  </span>
                  <button
                    onClick={handleTestModalState}
                    className="px-2.5 py-1 bg-surface hover:bg-surface-hover border border-border rounded text-[11px] cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingModal ? 'animate-spin' : ''}`} />
                    <span>Re-executar Teste</span>
                  </button>
                </div>
                
                {report?.overflowTest && (
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-surface rounded border border-border">
                      <span className="text-muted block text-[10px]">1. Antes do Modal:</span>
                      <div>clientWidth: {report.overflowTest.beforeModal.clientWidth}px</div>
                      <div>containerRect: {report.overflowTest.beforeModal.containerBoundingWidth}px</div>
                    </div>
                    <div className="p-2 bg-surface rounded border border-border">
                      <span className="text-muted block text-[10px]">2. Durante Modal:</span>
                      <div>clientWidth: {report.overflowTest.duringModal.clientWidth}px</div>
                      <div>containerRect: {report.overflowTest.duringModal.containerBoundingWidth}px</div>
                    </div>
                    <div className="p-2 bg-surface rounded border border-border">
                      <span className="text-muted block text-[10px]">3. Após Fechar Modal:</span>
                      <div>clientWidth: {report.overflowTest.afterModal.clientWidth}px</div>
                      <div>containerRect: {report.overflowTest.afterModal.containerBoundingWidth}px</div>
                    </div>
                  </div>
                )}

                <div className="text-[11px] text-muted">
                  Alteração de overflow no body alterou largura?{' '}
                  <span className={report?.overflowTest?.bodyOverflowChangedWidth ? 'text-danger font-bold' : 'text-success font-bold'}>
                    {report?.overflowTest?.bodyOverflowChangedWidth ? 'SIM (Divergência detectada)' : 'NÃO (Estável)'}
                  </span>
                </div>
              </div>

            </div>

            {/* Footer with Copy JSON button */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface-subtle">
              <span className="text-[11px] text-muted">
                Dados salvos automaticamente em /carousel-diagnostic.json
              </span>
              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 bg-primary text-primary-contrast font-medium rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{copied ? 'Copiado!' : 'Copiar JSON Completo'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
