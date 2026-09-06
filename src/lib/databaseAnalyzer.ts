import { Question } from '../types/question';

export interface FieldAnalysis {
  field: 'role' | 'year' | 'exam_board' | 'exam_name';
  label: string;
  topValue: string;
  count: number;
  total: number;
  percentage: number;
  passed: boolean; // true if >= 95%
  distribution: Record<string, number>;
}

export interface BankAnalysisResult {
  totalQuestions: number;
  fields: FieldAnalysis[];
  suggestedCompoundName: string;
  suggestedFilename: string;
  isDuplicateName: boolean;
  duplicateResolvedName: string;
}

/**
 * Normalizes text for comparison and display
 */
function cleanFieldValue(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Parses and analyzes question bank to identify candidate naming fields (role, year, exam_board, exam_name)
 * Applies strict >= 95% frequency threshold for each candidate part.
 */
export function analyzeQuestionBankForNaming(
  rawQuestions: any[],
  originalFilename = '',
  existingDatabaseNames: string[] = []
): BankAnalysisResult {
  const total = rawQuestions.length;
  if (total === 0) {
    return {
      totalQuestions: 0,
      fields: [],
      suggestedCompoundName: 'Novo Banco de Questões',
      suggestedFilename: originalFilename.replace(/\.json$/i, '').trim() || 'banco_questoes',
      isDuplicateName: false,
      duplicateResolvedName: 'Novo Banco de Questões',
    };
  }

  // 1. Collect frequency maps for candidate dimensions
  const roleFreq: Record<string, number> = {};
  const yearFreq: Record<string, number> = {};
  const boardFreq: Record<string, number> = {};
  const examFreq: Record<string, number> = {};

  for (const q of rawQuestions) {
    const meta = q.metadata || {};

    // Role candidate
    const role = cleanFieldValue(meta.role || q.role || q.cargo || meta.cargo);
    if (role) roleFreq[role] = (roleFreq[role] || 0) + 1;

    // Year candidate
    const year = cleanFieldValue(meta.year || q.year || q.ano || meta.ano);
    if (year) yearFreq[year] = (yearFreq[year] || 0) + 1;

    // Exam Board candidate
    const board = cleanFieldValue(meta.exam_board || meta.board || meta.banca || q.exam_board || q.banca);
    if (board) boardFreq[board] = (boardFreq[board] || 0) + 1;

    // Exam Name candidate
    const exam = cleanFieldValue(
      meta.exam_name || meta.exam || meta.concurso || meta.institution || meta.orgao || meta.cidade || q.exam_name || q.concurso
    );
    if (exam) examFreq[exam] = (examFreq[exam] || 0) + 1;
  }

  // 2. Helper to find top value and test >= 95% threshold
  const analyzeField = (
    field: 'role' | 'year' | 'exam_board' | 'exam_name',
    label: string,
    freq: Record<string, number>
  ): FieldAnalysis => {
    let topValue = '';
    let topCount = 0;

    for (const [val, count] of Object.entries(freq)) {
      if (count > topCount) {
        topCount = count;
        topValue = val;
      }
    }

    const percentage = total > 0 ? Math.round((topCount / total) * 1000) / 10 : 0;
    const passed = percentage >= 95 && !!topValue;

    return {
      field,
      label,
      topValue,
      count: topCount,
      total,
      percentage,
      passed,
      distribution: freq,
    };
  };

  const roleAnalysis = analyzeField('role', 'Área / Cargo', roleFreq);
  const yearAnalysis = analyzeField('year', 'Ano', yearFreq);
  const boardAnalysis = analyzeField('exam_board', 'Origem / Banca', boardFreq);
  const examAnalysis = analyzeField('exam_name', 'Documento / Fonte', examFreq);

  const fields = [roleAnalysis, yearAnalysis, boardAnalysis, examAnalysis];

  // 3. Assemble compound name in order: "role - year - exam_board - exam_name"
  // Only include parts that passed the >= 95% rule
  const candidateParts: string[] = [];
  if (roleAnalysis.passed && roleAnalysis.topValue) candidateParts.push(roleAnalysis.topValue);
  if (yearAnalysis.passed && yearAnalysis.topValue) candidateParts.push(yearAnalysis.topValue);
  if (boardAnalysis.passed && boardAnalysis.topValue) candidateParts.push(boardAnalysis.topValue);
  if (examAnalysis.passed && examAnalysis.topValue) candidateParts.push(examAnalysis.topValue);

  // Clean filename suggestion
  const cleanFilename = originalFilename
    ? originalFilename.replace(/\.json$/i, '').replace(/[_-]+/g, ' ').trim()
    : 'Banco de Questões';

  let compoundName = candidateParts.join(' - ');
  if (!compoundName) {
    compoundName = cleanFilename || 'Banco de Questões';
  }

  // 4. Check for duplicate collision against existing database names
  const normalizedExisting = existingDatabaseNames.map(n => n.toLowerCase().trim());
  const isDuplicate = normalizedExisting.includes(compoundName.toLowerCase().trim());

  let duplicateResolvedName = compoundName;
  if (isDuplicate) {
    let counter = 2;
    while (normalizedExisting.includes(`${compoundName.toLowerCase().trim()} (${counter})`)) {
      counter++;
    }
    duplicateResolvedName = `${compoundName} (${counter})`;
  }

  return {
    totalQuestions: total,
    fields,
    suggestedCompoundName: compoundName,
    suggestedFilename: cleanFilename,
    isDuplicateName: isDuplicate,
    duplicateResolvedName,
  };
}
