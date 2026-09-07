import React, { useState, useRef } from 'react';
import { 
  FileJson, 
  Trash2, 
  Edit2, 
  Download, 
  Check, 
  X 
} from 'lucide-react';
import { QuestionDatabase } from '../types/question';
import { LiveSwitch } from './ui/LiveSwitch';

interface DatabaseRowProps {
  db: QuestionDatabase;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  setEditingName: (name: string) => void;
  onSaveRename: (id: string) => void;
  onCancelRename: () => void;
  onStartRename: (db: QuestionDatabase) => void;
  onExport: (db: QuestionDatabase) => void;
  onSelect: () => void;
  onTriggerDelete: (db: QuestionDatabase) => void;
}

/**
 * DatabaseRow - Linha do banco com:
 * 1. "Interruptor Vivo" posicionado na extrema direita (no lugar da antiga lixeira).
 * 2. "Arrasto para deletar": deslizar a linha horizontalmente (mouse ou toque)
 *    revela a camada de exclusão e, ao soltar após o limiar, aciona a exclusão do banco
 *    (exatamente como funciona o gesto de riscar/eliminar nas questões).
 */
export const DatabaseRow: React.FC<DatabaseRowProps> = ({
  db,
  isActive,
  isEditing,
  editingName,
  setEditingName,
  onSaveRename,
  onCancelRename,
  onStartRename,
  onExport,
  onSelect,
  onTriggerDelete,
}) => {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const touchStateRef = useRef<{
    startX: number;
    startY: number;
    hasMovedHorizontal: boolean;
    hasSwiped: boolean;
  } | null>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return;
    const target = e.target as HTMLElement;
    // Não iniciar arraste de exclusão se o usuário interagiu com botões, inputs ou o interruptor
    if (target.closest('button') || target.closest('input') || target.closest('[role="switch"]')) {
      return;
    }
    if (e.button !== 0) return;

    touchStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      hasMovedHorizontal: false,
      hasSwiped: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!touchStateRef.current) return;
    const diffX = e.clientX - touchStateRef.current.startX;
    const diffY = e.clientY - touchStateRef.current.startY;

    if (!touchStateRef.current.hasMovedHorizontal) {
      if (Math.abs(diffX) > 6 && Math.abs(diffX) > Math.abs(diffY)) {
        touchStateRef.current.hasMovedHorizontal = true;
        setIsDragging(true);
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // pointer capture opcional
        }
      } else if (Math.abs(diffY) > 8) {
        touchStateRef.current = null;
        return;
      }
    }

    if (touchStateRef.current?.hasMovedHorizontal) {
      // Arraste horizontal limitado a 100px para ambos os lados
      const clampedX = Math.max(-110, Math.min(110, diffX));
      setDragOffset(clampedX);
      touchStateRef.current.hasSwiped = Math.abs(clampedX) >= 50;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = touchStateRef.current;
    touchStateRef.current = null;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignora
    }

    if (state?.hasSwiped) {
      onTriggerDelete(db);
    }
    setDragOffset(0);
  };

  const handlePointerCancel = () => {
    touchStateRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <div className="relative overflow-hidden rounded-lg select-none">
      {/* Camada de fundo de exclusão (revelada durante o arrasto) */}
      <div
        className={`absolute inset-0 bg-danger-bg border border-danger-border rounded-lg flex items-center px-4 transition-opacity duration-150 ${
          Math.abs(dragOffset) > 6 ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } ${
          dragOffset < 0 ? 'justify-end' : 'justify-start'
        }`}
      >
        <div className="flex items-center gap-2 text-danger font-medium text-xs">
          <Trash2 className={`w-4 h-4 ${Math.abs(dragOffset) >= 50 ? 'scale-125' : ''} transition-transform`} />
          <span>{Math.abs(dragOffset) >= 50 ? 'Solte para excluir banco' : 'Arrastar para excluir'}</span>
        </div>
      </div>

      {/* Cartão do Banco em primeiro plano com suporte a arrasto para deletar */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translateX(${dragOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className={`relative p-3 rounded-lg border transition-colors touch-pan-y ${
          isActive
            ? 'bg-accent-subtle border-accent/40'
            : 'bg-surface border-border hover:border-border-strong'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
            <FileJson className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${isActive ? 'text-accent' : 'text-muted'}`} />

            {isEditing ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveRename(db.id);
                    if (e.key === 'Escape') onCancelRename();
                  }}
                  className="px-2 py-1 theme-input rounded text-xs text-primary flex-1"
                  autoFocus
                />
                <button
                  onClick={() => onSaveRename(db.id)}
                  className="p-1 text-success hover:bg-success-bg rounded cursor-pointer"
                  title="Salvar nome"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onCancelRename}
                  className="p-1 text-muted hover:bg-surface-subtle rounded cursor-pointer"
                  title="Cancelar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-xs text-primary truncate max-w-[200px] sm:max-w-xs">
                    {db.name}
                  </span>
                  {db.is_default && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-surface-subtle text-muted border border-border">
                      Padrão
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted flex items-center gap-2 mt-0.5">
                  <span className="font-mono">{db.questions.length} questões</span>
                  {db.filename && <span className="truncate max-w-[140px] sm:max-w-[180px]">({db.filename})</span>}
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação por Banco */}
          {!isEditing && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pl-6.5 sm:pl-0">
              <button
                type="button"
                onClick={() => onStartRename(db)}
                className="p-1.5 text-muted hover:text-primary hover:bg-surface-subtle rounded transition-colors cursor-pointer"
                title="Renomear banco"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => onExport(db)}
                className="p-1.5 text-muted hover:text-primary hover:bg-surface-subtle rounded transition-colors cursor-pointer"
                title="Exportar JSON deste banco"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Interruptor Vivo no lugar da lixeira (alinhado à extrema direita) */}
              <LiveSwitch
                id={`switch-db-${db.id}`}
                checked={isActive}
                onChange={onSelect}
                title={isActive ? `Banco "${db.name}" ativo (clique ou arraste para unificar)` : `Filtrar apenas questões de "${db.name}"`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
