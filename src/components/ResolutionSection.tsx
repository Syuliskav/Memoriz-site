import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BrainCircuit, 
  FileEdit, 
  Save
} from 'lucide-react';
import { QuestionResolution, SRSRating, SRSItem } from '../types/question';

interface ResolutionSectionProps {
  resolution: QuestionResolution;
  isCorrect: boolean;
  selectedLetter: string;
  srsItem?: SRSItem;
  onRateSRS?: (rating: SRSRating) => void;
  note: string;
  onSaveNote: (note: string) => void;
}

export const ResolutionSection: React.FC<ResolutionSectionProps> = ({
  resolution,
  isCorrect,
  selectedLetter,
  note,
  onSaveNote,
}) => {
  const [showCoT, setShowCoT] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [currentNote, setCurrentNote] = useState(note);

  const cotContent = resolution.cot_reasoning || (resolution as any).chain_of_thought || (resolution as any).raciocinio || (resolution as any).passo_a_passo || (resolution as any).resolucao || '';
  const pedagogicalContent = resolution.pedagogical_explanation || (resolution as any).explanation || (resolution as any).comentario || (resolution as any).justificativa || '';
  const deducedAnswer = resolution.deduced_answer || (resolution as any).gabarito || (resolution as any).correct_answer || '';

  const handleSaveNoteClick = () => {
    onSaveNote(currentNote);
    setEditingNote(false);
  };

  return (
    <div className="mt-6 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      {/* Feedback Banner - Direct & Unambiguous */}
      <div
        id="question-feedback-banner"
        className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-xs ${
          isCorrect
            ? 'theme-feedback-success bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
            : 'theme-feedback-danger bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            {isCorrect ? (
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xs theme-feedback-icon-success">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-xs theme-feedback-icon-danger">
                <XCircle className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base theme-text-primary">
                {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
              </span>
              {isCorrect && (
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full theme-feedback-xp-pill">
                  +15 XP
                </span>
              )}
            </div>
            {!isCorrect && (
              <p className="text-xs opacity-90 leading-relaxed font-medium theme-text-secondary">
                Gabarito oficial: <span className="font-bold">Alternativa {deducedAnswer}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pedagogical Explanation */}
      {pedagogicalContent && (
        <div className="theme-card-subtle bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comentário Pedagógico</span>
          </div>
          <div className="theme-text-primary text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line">
            {pedagogicalContent}
          </div>
        </div>
      )}

      {/* Chain-of-Thought (Modo Raio-X) */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCoT(!showCoT)}
          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Raciocínio Detalhado Passo a Passo (Raio-X)</span>
          </div>
          {showCoT ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showCoT && (
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-line space-y-2">
            {cotContent ? (
              cotContent
            ) : (
              <span className="text-slate-400 italic font-sans">
                Nenhum passo a passo detalhado registrado para esta questão além do comentário pedagógico acima.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Personal Notes Section */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-2 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-medium">
            <FileEdit className="w-3.5 h-3.5 text-slate-400" />
            <span>Anotações Pessoais</span>
          </div>
          {!editingNote && (
            <button
              onClick={() => setEditingNote(true)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              {note ? 'Editar anotação' : '+ Adicionar nota'}
            </button>
          )}
        </div>

        {editingNote ? (
          <div className="space-y-2">
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Digite seus mnemônicos, pegadinhas e observações pessoais sobre esta questão..."
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setCurrentNote(note);
                  setEditingNote(false);
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNoteClick}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium cursor-pointer"
              >
                <Save className="w-3 h-3" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        ) : note ? (
          <div className="p-3 bg-blue-50/40 dark:bg-slate-800/60 border border-blue-200 dark:border-slate-700/80 rounded-lg text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            {note}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Nenhuma anotação pessoal salva para esta questão.
          </p>
        )}
      </div>
    </div>
  );
};
