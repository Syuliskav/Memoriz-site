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

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let bank: Question[] = [];
        if (parsed.question_bank && Array.isArray(parsed.question_bank)) {
          bank = parsed.question_bank;
        } else if (Array.isArray(parsed)) {
          bank = parsed;
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          bank = parsed.questions;
        } else {
          throw new Error('O JSON precisa conter a chave "question_bank" com array de questões conforme o esquema.');
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
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3.5 sm:pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 gap-2">
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

        {/* Feedback Alert */}
        {feedback && (
          <div 
            className={`mt-4 p-3 rounded-lg flex items-start gap-2.5 text-xs shrink-0 ${
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

        {/* Modal Body */}
        <div className="mt-5 space-y-6 text-xs flex-1">
          
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
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
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
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <FolderOpen className="w-3 h-3" />
                        <span>Usar nome do arquivo</span>
                      </button>
                    )}
                    {stagedUpload.analysis.suggestedCompoundName !== stagedUpload.chosenName && (
                      <button
                        type="button"
                        onClick={() => setStagedUpload({ ...stagedUpload, chosenName: stagedUpload.analysis.suggestedCompoundName })}
                        className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
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

              {/* Staged Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/60">
                <button
                  type="button"
                  onClick={() => setStagedUpload(null)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Bancos de Questões Registrados
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Selecione um banco individual para filtrar ou filtre todos harmonicamente
                </p>
              </div>

              {/* Badges & Upload Button - placed below text on mobile as requested */}
              <div className="flex items-center gap-2 pt-1 sm:pt-0">
                <span className="px-2 py-1.5 rounded-lg text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
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
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Adicionar Prova / JSON</span>
                </button>
              </div>
            </div>

            {/* Quick "Todos os Bancos" Selection Banner */}
            <div 
              onClick={() => onSelectDatabase('all')}
              className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer transition-all ${
                activeDatabaseId === 'all'
                  ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-950 dark:text-indigo-200'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <Layers className={`w-4 h-4 mt-0.5 sm:mt-0 shrink-0 ${activeDatabaseId === 'all' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                <div className="min-w-0">
                  <span className="font-semibold text-xs block">
                    Todos os Bancos Integrados (Unificado)
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Pesquise e resolva simultaneamente questões de todos os {databases.length} bancos
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-6.5 sm:pl-0">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  {totalAllQuestions} questões
                </span>
                {activeDatabaseId === 'all' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white">
                    Ativo
                  </span>
                )}
              </div>
            </div>

            {/* Individual Databases Table */}
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
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded"
                              title="Salvar nome"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingDbId(null)}
                              className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
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

                          {databases.length > 1 && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Tem certeza que deseja excluir o banco "${db.name}" (${db.questions.length} questões)?`)) {
                                  onDeleteDatabase(db.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                              title="Excluir banco de questões"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
              <span className="text-slate-400 text-[11px]">Deseja restaurar apenas as questões originais padrão?</span>
              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja restaurar o banco padrão original de 142 questões?')) {
                    onRestoreDefault();
                    setFeedback({
                      type: 'success',
                      message: 'Banco padrão original restaurado com sucesso.',
                    });
                  }
                }}
                className="flex items-center gap-1 text-slate-500 hover:text-rose-600 text-xs transition-colors self-start sm:self-auto cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Restaurar Banco Inicial</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
