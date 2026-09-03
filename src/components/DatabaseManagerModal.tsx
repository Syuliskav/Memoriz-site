import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileJson,
  Trash2,
  Edit2,
  Check,
  Layers,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Filter
} from 'lucide-react';
import { Question, QuestionDatabase } from '../types/question';
import { LocalStorageManager } from '../lib/storage';
import { analyzeQuestionBankForNaming, BankAnalysisResult } from '../lib/databaseAnalyzer';
import { countUniqueQuestions } from '../lib/duplicateEngine';

interface DatabaseManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  databases: QuestionDatabase[];
  activeDatabaseId: string | 'all';
  onSelectDatabase: (dbId: string | 'all') => void;
  onAddDatabase: (newDb: { name: string; filename?: string; questions: Question[] }, activateImmediately: boolean) => void;
  onRenameDatabase: (id: string, newName: string) => void;
  onDeleteDatabase: (id: string) => void;
  onRestoreDefault: () => void;
  onRestoreBackupSuccess: () => void;
}

export const DatabaseManagerModal: React.FC<DatabaseManagerModalProps> = ({
  isOpen,
  onClose,
  databases,
  activeDatabaseId,
  onSelectDatabase,
  onAddDatabase,
  onRenameDatabase,
  onDeleteDatabase,
  onRestoreDefault,
  onRestoreBackupSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Drag and Drop State
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const dragCounterRef = useRef<number>(0);

  // Staged Upload State
  const [stagedUpload, setStagedUpload] = useState<{
    file: File;
    rawQuestions: Question[];
    analysis: BankAnalysisResult;
    chosenName: string;
    activateNow: boolean;
  } | null>(null);

  // Inline rename state
  const [editingDbId, setEditingDbId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // In-app Confirmation States (Bypasses iframe window.confirm restrictions)
  const [confirmDeleteDb, setConfirmDeleteDb] = useState<QuestionDatabase | null>(null);
  const [showConfirmRestore, setShowConfirmRestore] = useState<boolean>(false);

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

  const existingNames = databases.map(d => d.name);
  const totalAllQuestions = countUniqueQuestions(databases.flatMap(d => d.questions));

  // Unified JSON file processor for both manual selection and drag-and-drop
  const processJsonFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error('Arquivo não é um JSON válido.');
        }

        // 1. Check if this is a Full System Backup
        const isFullBackup = Boolean(
          parsed.memoriz_backup_version ||
          (parsed.databases && Array.isArray(parsed.databases) && parsed.databases.length > 0 && parsed.databases[0]?.questions) ||
          (parsed.question_bank && (parsed.answers || parsed.srs_items || parsed.statistics || parsed.simulados))
        );

        if (isFullBackup) {
          const res = LocalStorageManager.importFullBackup(text);
          if (res.success) {
            setFeedback({
              type: 'success',
              message: res.message + ' Recarregando a aplicação...',
            });
            onRestoreBackupSuccess();
            setTimeout(() => {
              window.location.reload();
            }, 800);
          } else {
            setFeedback({
              type: 'error',
              message: res.message,
            });
          }
          return;
        }

        // 2. Otherwise process as a Question Bank JSON
        let bank: Question[] = [];
        if (parsed.question_bank && Array.isArray(parsed.question_bank)) {
          bank = parsed.question_bank;
        } else if (Array.isArray(parsed)) {
          bank = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          bank = parsed.questions;
        } else {
          throw new Error('O JSON precisa conter a chave "question_bank" com array de questões ou ser um arquivo de backup.');
        }

        if (bank.length === 0) {
          throw new Error('O arquivo carregado não contém questões válidas.');
        }

        // Run smart analyzer with 95% threshold
        const analysis = analyzeQuestionBankForNaming(bank, file.name, existingNames);
        const defaultChosenName = analysis.isDuplicateName
          ? analysis.duplicateResolvedName
          : analysis.suggestedCompoundName;

        setStagedUpload({
          file,
          rawQuestions: bank,
          analysis,
          chosenName: defaultChosenName,
          activateNow: true,
        });

        setFeedback(null);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setFeedback({
          type: 'error',
          message: errorMsg || 'Falha ao processar arquivo JSON.',
        });
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processJsonFile(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDraggingOver(false);
      dragCounterRef.current = 0;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processJsonFile(file);
    }
  };

  const handleConfirmStagedUpload = () => {
    if (!stagedUpload) return;
    const finalName = stagedUpload.chosenName.trim() || 'Novo Banco de Questões';

    onAddDatabase(
      {
        name: finalName,
        filename: stagedUpload.file.name,
        questions: stagedUpload.rawQuestions,
      },
      stagedUpload.activateNow
    );

    setFeedback({
      type: 'success',
      message: `Banco "${finalName}" adicionado com sucesso! (${stagedUpload.rawQuestions.length} questões)`,
    });
    setStagedUpload(null);
  };

  const handleStartRename = (db: QuestionDatabase) => {
    setEditingDbId(db.id);
    setEditingName(db.name);
  };

  const handleSaveRename = (dbId: string) => {
    if (editingName.trim()) {
      onRenameDatabase(dbId, editingName.trim());
    }
    setEditingDbId(null);
    setEditingName('');
  };

  const handleExportSingleDatabase = (db: QuestionDatabase) => {
    try {
      const data = {
        question_bank: db.questions,
        database_info: {
          id: db.id,
          name: db.name,
          total_questions: db.questions.length,
          exported_at: new Date().toISOString(),
        }
      };
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${db.name.toLowerCase().replace(/[^a-z0-9]+/gi, '_')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setFeedback({ type: 'error', message: 'Erro ao exportar banco individual.' });
    }
  };

  const handleExportFullBackup = () => {
    try {
      const allQ = databases.flatMap(d => d.questions);
      const jsonStr = LocalStorageManager.exportFullBackup(databases, allQ);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `memoriz-backup-multi-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedback({
        type: 'success',
        message: 'Backup completo de todos os bancos exportado com sucesso (.json)!',
      });
    } catch {
      setFeedback({
        type: 'error',
        message: 'Erro ao gerar arquivo de backup.',
      });
    }
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = LocalStorageManager.importFullBackup(text);
        if (res.success) {
          setFeedback({
            type: 'success',
            message: res.message + ' Recarregando...',
          });
          onRestoreBackupSuccess();
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          setFeedback({
            type: 'error',
            message: res.message,
          });
        }
      } catch {
        setFeedback({
          type: 'error',
          message: 'Arquivo de backup corrompido ou inválido.',
        });
      }
    };
    reader.readAsText(file);
    if (backupInputRef.current) backupInputRef.current.value = '';
  };

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto"
    >
      <div 
        id="database-manager-card"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl relative my-auto max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Drag & Drop Visual Overlay */}
        {isDraggingOver && (
          <div 
            id="drag-drop-modal-overlay"
            className="absolute inset-0 z-50 bg-indigo-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-400 dark:border-indigo-500 rounded-2xl animate-in fade-in duration-150 text-center pointer-events-none"
          >
            <div className="p-4 bg-indigo-600 text-white rounded-full mb-3 shadow-lg animate-bounce">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-base font-bold text-white mb-1">
              Solte o arquivo JSON ou Backup aqui
            </p>
            <p className="text-xs text-indigo-200 max-w-sm leading-relaxed">
              O Memoriz detecta automaticamente provas de concursos (JSON) ou arquivos de restauração de backup completo.
            </p>
          </div>
        )}

        {/* Modal Header (Fixed) */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-tight">
                Gerenciador de Bancos JSON
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                Gerencie múltiplos arquivos e provas de concursos de forma integrada
              </p>
            </div>
          </div>
          <button 
            id="close-db-manager-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable with containment) */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-6 text-xs flex-1">
          {/* Feedback Alert */}
          {feedback && (
            <div 
              className={`p-3 rounded-lg flex items-start gap-2.5 text-xs shrink-0 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{feedback.message}</div>
            </div>
          )}
          
          {/* SECTION A: STAGED UPLOAD & NAMING */}
          {stagedUpload ? (
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-indigo-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-indigo-950 dark:text-indigo-200">
                      Nomear Banco de Questões
                    </h4>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400">
                      {stagedUpload.rawQuestions.length} questões detectadas no arquivo <span className="font-mono font-medium">{stagedUpload.file.name}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStagedUpload(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Nome de Identificação:</span>
                  <div className="flex items-center gap-2">
                    {stagedUpload.analysis.suggestedFilename !== stagedUpload.chosenName && (
                      <button
                        type="button"
                        onClick={() => setStagedUpload({ ...stagedUpload, chosenName: stagedUpload.analysis.suggestedFilename })}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Usar nome do arquivo</span>
                      </button>
                    )}
                    {stagedUpload.analysis.suggestedCompoundName !== stagedUpload.chosenName && (
                      <button
                        type="button"
                        onClick={() => setStagedUpload({ ...stagedUpload, chosenName: stagedUpload.analysis.suggestedCompoundName })}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Usar nome sugerido</span>
                      </button>
                    )}
                  </div>
                </label>
                <input
                  type="text"
                  value={stagedUpload.chosenName}
                  onChange={(e) => setStagedUpload({ ...stagedUpload, chosenName: e.target.value })}
                  placeholder="Ex: Agente Administrativo - 2026 - IGEDUC - Altos"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              {/* Auto-activate Option */}
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={stagedUpload.activateNow}
                  onChange={(e) => setStagedUpload({ ...stagedUpload, activateNow: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Filtrar e navegar neste banco imediatamente após salvar</span>
              </label>

              {/* Staged Actions - Cancel on left, Save on right */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                <button
                  type="button"
                  onClick={() => setStagedUpload(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStagedUpload}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-xs cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Banco de Questões</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* SECTION B: LIST OF SAVED QUESTION DATABASES */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Bancos de Questões Registrados
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Selecione um banco individual para filtrar ou filtre todos harmonicamente
                </p>
              </div>

              {/* Badges & Upload Button */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0 whitespace-nowrap">
                  {databases.length} {databases.length === 1 ? 'banco' : 'bancos'} ({totalAllQuestions} q.)
                </span>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelected}
                  className="hidden"
                  id="upload-bank-input"
                />
                <button
                  id="add-json-bank-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5 shrink-0" />
                  <span>Adicionar Prova / JSON</span>
                </button>
              </div>
            </div>

            {/* In-app Delete Confirmation Banner with Cancel on the left */}
            {confirmDeleteDb && (
              <div 
                id="delete-confirmation-banner"
                className="p-3.5 bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-1 duration-150"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-rose-600 text-white rounded-md shrink-0 mt-0.5">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-rose-950 dark:text-rose-100 text-sm">
                      Excluir o banco &quot;{confirmDeleteDb.name}&quot;?
                    </p>
                    <p className="text-rose-800 dark:text-rose-300 mt-1 leading-relaxed">
                      As <strong className="font-bold text-rose-950 dark:text-rose-100">{confirmDeleteDb.questions.length} questões</strong> deste banco serão removidas do aplicativo. Esta ação não pode ser desfeita.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-rose-200/70 dark:border-rose-900/60">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteDb(null)}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    id="confirm-delete-db-action-btn"
                    onClick={() => {
                      const dbToDelete = confirmDeleteDb;
                      onDeleteDatabase(dbToDelete.id);
                      setConfirmDeleteDb(null);
                      setFeedback({
                        type: 'success',
                        message: `Banco "${dbToDelete.name}" (${dbToDelete.questions.length} questões) foi excluído com sucesso!`,
                      });
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirmar Exclusão</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick "Todos os Bancos" Selection Banner */}
            {databases.length > 0 && (
              <div 
                onClick={() => onSelectDatabase('all')}
                className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer transition-all ${
                  activeDatabaseId === 'all'
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                  <Layers className={`w-4 h-4 mt-0.5 sm:mt-0 shrink-0 ${activeDatabaseId === 'all' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <div className="min-w-0">
                    <span className={`font-semibold text-xs block ${activeDatabaseId === 'all' ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-800 dark:text-slate-200'}`}>
                      Todos os Bancos Integrados (Unificado)
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Pesquise e resolva simultaneamente questões de todos os {databases.length} bancos
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-6.5 sm:pl-0">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    {totalAllQuestions} questões
                  </span>
                  {activeDatabaseId === 'all' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                      Ativo
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Individual Databases Table or Empty State */}
            {databases.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                    Nenhum banco de questões cadastrado
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Adicione um arquivo JSON de prova ou restaure o banco padrão inicial
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Adicionar JSON
                  </button>
                  <button
                    onClick={() => {
                      onRestoreDefault();
                      setFeedback({
                        type: 'success',
                        message: 'Banco padrão original de 142 questões restaurado com sucesso.',
                      });
                    }}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Restaurar Padrão
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                {databases.map((db) => {
                  const isActive = activeDatabaseId === db.id;
                  const isEditing = editingDbId === db.id;

                  return (
                    <div
                      key={db.id}
                      className={`p-3 rounded-lg border transition-all ${
                        isActive
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-start sm:items-center gap-2.5 flex-1 min-w-0">
                          <FileJson className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                          
                          {isEditing ? (
                            <div className="flex items-center gap-1.5 flex-1">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(db.id);
                                  if (e.key === 'Escape') setEditingDbId(null);
                                }}
                                className="px-2 py-1 bg-white dark:bg-slate-800 border border-indigo-500 rounded text-xs text-slate-900 dark:text-white flex-1"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRename(db.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded cursor-pointer"
                                title="Salvar nome"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingDbId(null)}
                                className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-xs text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                                  {db.name}
                                </span>
                                {db.is_default && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                    Padrão
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="font-mono">{db.questions.length} questões</span>
                                {db.filename && <span className="truncate max-w-[140px] sm:max-w-[180px]">({db.filename})</span>}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action buttons per Database */}
                        {!isEditing && (
                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto pl-6.5 sm:pl-0">
                            {isActive ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                                Filtrado
                              </span>
                            ) : (
                              <button
                                onClick={() => onSelectDatabase(db.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
                              >
                                Filtrar
                              </button>
                            )}

                            <button
                              onClick={() => handleStartRename(db)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Renomear banco"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleExportSingleDatabase(db)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Exportar JSON deste banco"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button (available for all banks with direct in-app confirm) */}
                            <button
                              type="button"
                              id={`delete-bank-${db.id}-btn`}
                              onClick={() => setConfirmDeleteDb(db)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                              title={`Excluir banco "${db.name}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION C: BACKUP & GLOBAL TOOLS */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="font-medium text-xs text-slate-900 dark:text-slate-100">
                  Backup Completo (Todos os Bancos + Progresso)
                </span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  ref={backupInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                  id="restore-backup-input"
                />
                <button
                  onClick={() => backupInputRef.current?.click()}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium transition-colors text-center cursor-pointer"
                >
                  Restaurar Backup
                </button>
                <button
                  onClick={handleExportFullBackup}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white text-white rounded text-xs font-medium transition-colors shadow-xs text-center cursor-pointer whitespace-nowrap"
                >
                  Baixar Backup Geral
                </button>
              </div>
            </div>

            {/* Restore Default Database Section with In-app Confirmation */}
            {showConfirmRestore ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs animate-in fade-in duration-150">
                <div className="text-amber-900 dark:text-amber-200 leading-snug">
                  Substituir todos os bancos pelo <strong className="font-semibold">banco padrão original (142 questões)</strong>?
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowConfirmRestore(false)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreDefault();
                      setShowConfirmRestore(false);
                      setFeedback({
                        type: 'success',
                        message: 'Banco padrão original de 142 questões restaurado com sucesso.',
                      });
                    }}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Confirmar Restauração
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <span className="text-slate-400 text-[11px]">Deseja restaurar apenas as questões originais padrão?</span>
                <button
                  type="button"
                  onClick={() => setShowConfirmRestore(true)}
                  className="flex items-center gap-1 text-slate-500 hover:text-amber-600 text-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Restaurar Banco Inicial</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer (Fixed) */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
