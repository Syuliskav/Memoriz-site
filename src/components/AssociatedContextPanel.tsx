import React, { useState } from 'react';
import { ZoomIn, ZoomOut, ExternalLink, FileText } from 'lucide-react';
import { AssociatedContext } from '../types/question';

interface AssociatedContextPanelProps {
  context: AssociatedContext;
}

export const AssociatedContextPanel: React.FC<AssociatedContextPanelProps> = ({ context }) => {
  const [fontSize, setFontSize] = useState<number>(15);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif'>('serif');

  if (!context || !context.has_associated_context) {
    return null;
  }

  // Extrai URL limpa se o texto da fonte contiver um link (ex: "https://www.bbc.com/... .adaptado" ou "www.bbc.com...")
  const extractCleanUrl = (sourceText: string): string | null => {
    if (!sourceText) return null;
    
    // Procura por padrão de URL no texto da fonte
    const urlMatch = sourceText.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/i);
    if (!urlMatch) return null;

    let url = urlMatch[0];

    // Remove sufixos como ".adaptado", "(adaptado)", ", adaptado", pontuações finais, etc.
    url = url.replace(/[\.\,\;\:\)\(\]\[]*adaptado[\.\,\;\:\)\(\]\[]*/gi, '');
    url = url.replace(/[\.\,\;\:\)\(\]\[]+$/, '');

    // Se começar com www ou domínio sem protocolo, adiciona https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  const cleanUrl = context.source ? extractCleanUrl(context.source) : null;

  return (
    <div className="h-full flex flex-col theme-card border border-border rounded-xl overflow-hidden shadow-xs">
      {/* Header Bar with Reading Controls */}
      <div className="px-4 py-2.5 bg-surface-subtle border-b border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted" />
          <span className="text-xs font-semibold tracking-wide text-secondary theme-text-secondary uppercase">
            Texto de Apoio
          </span>
        </div>

        {/* Font & Zoom Controls */}
        <div className="flex items-center gap-1 bg-surface px-2 py-0.5 rounded-md border border-border">
          <button
            onClick={() => setFontFamily(f => (f === 'serif' ? 'sans' : 'serif'))}
            className="px-1.5 py-0.5 text-xs font-medium rounded text-secondary theme-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
            title="Alternar fonte Serif / Sans"
          >
            {fontFamily === 'serif' ? 'Serif' : 'Sans'}
          </button>
          <div className="w-[1px] h-3 bg-border" />
          <button
            onClick={() => setFontSize(s => Math.max(12, s - 1))}
            className="p-1 text-muted hover:text-primary transition-colors cursor-pointer"
            title="Diminuir fonte (A-)"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[11px] font-mono text-secondary theme-text-secondary w-4 text-center">{fontSize}</span>
          <button
            onClick={() => setFontSize(s => Math.min(24, s + 1))}
            className="p-1 text-muted hover:text-primary transition-colors cursor-pointer"
            title="Aumentar fonte (A+)"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content Area with Independent Scroll */}
      <div 
        className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3"
      >
        {context.title && (
          <h3 className="font-semibold text-base sm:text-lg text-primary theme-text-primary leading-snug">
            {context.title}
          </h3>
        )}

        {context.source && (
          <div className="flex items-center gap-1.5 text-xs text-muted theme-text-muted italic pb-2 border-b border-border">
            {cleanUrl ? (
              <div className="flex items-center gap-1.5">
                <a
                  href={cleanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 -ml-1 rounded-md text-accent hover:text-accent-hover hover:bg-accent-subtle transition-colors cursor-pointer shrink-0 inline-flex items-center justify-center"
                  title="Abrir link original da fonte em nova aba"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="select-text text-muted theme-text-muted">Fonte: {context.source}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="select-text text-muted theme-text-muted">Fonte: {context.source}</span>
              </div>
            )}
          </div>
        )}

        {/* Text body with whitespace and paragraphs preserved */}
        <div
          className={`text-primary theme-text-primary leading-relaxed ${
            fontFamily === 'serif' ? 'font-serif' : 'font-sans'
          }`}
          style={{ fontSize: `${fontSize}px`, whiteSpace: 'pre-line' }}
        >
          {context.content}
        </div>
      </div>
    </div>
  );
};
