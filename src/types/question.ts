/**
 * Technical Data Types for Question Bank and SRS System
 * Strict compliance with Documentação Técnica de Arquitetura e Dicionário de Dados
 */

export interface QuestionMetadata {
  reference_code: string;
  subject: string;
  topics: string[];
  year: number;
  exam_board: string;
  institution: string;
  exam_name: string;
  role: string;
}

export interface AssociatedContext {
  has_associated_context: boolean;
  title: string;
  source: string;
  content: string;
}

export interface QuestionStem {
  full_text: string;
}

export interface QuestionOption {
  letter: 'A' | 'B' | 'C' | 'D' | 'E' | string;
  text: string;
}

export interface QuestionResolution {
  cot_reasoning: string;
  deduced_answer: 'A' | 'B' | 'C' | 'D' | 'E' | string;
  pedagogical_explanation: string;
}

export interface Question {
  sequence_id: number;
  database_id?: string;
  database_name?: string;
  metadata: QuestionMetadata;
  associated_context: AssociatedContext;
  stem: QuestionStem;
  options: QuestionOption[];
  resolution: QuestionResolution;
}

export interface QuestionDatabase {
  id: string;
  name: string;
  filename?: string;
  questions: Question[];
  created_at: number;
  is_default?: boolean;
}

export interface QuestionBankRoot {
  question_bank: Question[];
}

// Spaced Repetition System (SRS) Types (SM-2 based)
export type SRSState = 'new' | 'learning' | 'review' | 'mastered';
export type SRSRating = 1 | 2 | 3; // 1: Difícil/Errei, 2: Bom, 3: Fácil/Excelente

export interface SRSItem {
  question_id: number;
  repetition_count: number;
  ease_factor: number; // starts at 2.5
  interval_days: number; // days until next review
  next_review_date: string; // ISO date string (YYYY-MM-DD)
  last_reviewed_date: string | null;
  state: SRSState;
  streak: number;
  consecutive_correct: number;
  total_reviews: number;
  correct_reviews: number;
}

export interface UserAnswerRecord {
  question_id: number;
  selected_letter: string;
  is_correct: boolean;
  timestamp: number;
  time_spent_seconds: number;
  mode: 'practice' | 'srs' | 'simulado' | 'error_notebook';
  eliminated_options?: string[]; // Alternativas riscadas no momento em que a questão foi respondida
}

export interface UserBookmark {
  question_id: number;
  note: string;
  tags: string[];
  created_at: number;
}

export interface SimuladoConfig {
  title: string;
  total_questions: number;
  time_limit_minutes: number;
  subjects: string[];
}

export interface SimuladoResult {
  id: string;
  date: string;
  time_spent_seconds: number;
  time_limit_seconds: number;
  total_questions: number;
  correct_count: number;
  wrong_count?: number;
  unanswered_count?: number;
  score_percentage: number;
  answers: Record<number, { selected: string; correct: string; is_correct: boolean }>;
}

export interface UserStatistics {
  total_answered: number;
  total_correct: number;
  total_wrong: number;
  streak_days: number;
  last_study_date: string;
  xp_points: number;
  daily_goal_xp: number;
  today_xp: number;
  subject_stats: Record<string, { total: number; correct: number }>;
}

export interface FilterState {
  database_id: string | 'all';
  subject: string;
  exam_board: string;
  year: number | 'all';
  topic: string;
  status: 'all' | 'unanswered' | 'correct' | 'wrong' | 'bookmarked' | 'srs_due';
  searchQuery: string;
  isRegexSearch?: boolean;
}

export type StudyMode = 'practice' | 'srs' | 'error_notebook' | 'simulado' | 'metrics' | 'database' | 'kitchen_sink';

export type ThemeMode = 'light' | 'reading' | 'night' | 'dark';

export interface UserAccount {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  targetExam: string;
  targetRole?: string;
  dailyGoalQuestions: number;
  experienceLevel: 'iniciante' | 'intermediario' | 'avancado' | 'faixa_preta';
  createdAt: string;
  lastLoginAt: string;
  isCloudSyncEnabled: boolean;
  provider: 'local' | 'google';
}
