import { Question, QuestionDatabase, SRSItem, UserAnswerRecord, UserBookmark, SimuladoResult, UserStatistics, ThemeMode, UserAccount } from '../types/question';
import { getTodayDateString } from './srsEngine';
import { normalizeQuestionToSchemaV2 } from './schemaV2Migrator';

const STORAGE_KEYS = {
  DATABASES: 'memoriz_databases_v2',
  ACTIVE_DB: 'memoriz_active_db_v2',
  ANSWERS: 'memoriz_answers_v1',
  SRS: 'memoriz_srs_v1',
  BOOKMARKS: 'memoriz_bookmarks_v1',
  SIMULADOS: 'memoriz_simulados_v1',
  STATS: 'memoriz_stats_v1',
  CUSTOM_BANK: 'memoriz_custom_bank_v1',
  PREFS: 'memoriz_prefs_v1',
  STRIKES: 'memoriz_option_strikes_v1',
  USER_ACCOUNT: 'memoriz_user_account_v1',
  USER_PROFILES: 'memoriz_user_profiles_v1',
};

export interface UserPreferences {
  theme: ThemeMode;
  readerFontSize: number;
  readerFontFamily: 'sans' | 'serif';
  autoShowReasoning: boolean;
  soundEffects: boolean;
}

export const defaultPreferences: UserPreferences = {
  theme: 'light',
  readerFontSize: 16,
  readerFontFamily: 'serif',
  autoShowReasoning: false,
  soundEffects: true,
};

export const defaultStatistics: UserStatistics = {
  total_answered: 0,
  total_correct: 0,
  total_wrong: 0,
  streak_days: 1,
  last_study_date: getTodayDateString(),
  xp_points: 0,
  daily_goal_xp: 50,
  today_xp: 0,
  subject_stats: {},
};

export const defaultUserAccount: UserAccount = {
  id: 'user_main',
  name: 'Estudante',
  email: '',
  avatar: '🎯',
  targetExam: 'Objetivo de Estudo',
  targetRole: 'Domínio Geral',
  dailyGoalQuestions: 30,
  experienceLevel: 'intermediario',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
  isCloudSyncEnabled: false,
  provider: 'local',
};

export class LocalStorageManager {
  // Answers History
  static getAnswers(): Record<number, UserAnswerRecord[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANSWERS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveAnswer(record: UserAnswerRecord, twinQuestionIds?: number[]): Record<number, UserAnswerRecord[]> {
    const answers = this.getAnswers();
    const ids = twinQuestionIds && twinQuestionIds.length > 0 ? twinQuestionIds : [record.question_id];

    for (const qid of ids) {
      if (!answers[qid]) {
        answers[qid] = [];
      }
      answers[qid].push({
        ...record,
        question_id: qid,
      });
    }

    try {
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return answers;
  }

  // SRS Items
  static getSRSItems(): Record<number, SRSItem> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SRS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static saveSRSItem(item: SRSItem, twinQuestionIds?: number[]): Record<number, SRSItem> {
    const items = this.getSRSItems();
    const ids = twinQuestionIds && twinQuestionIds.length > 0 ? twinQuestionIds : [item.question_id];

    for (const qid of ids) {
      items[qid] = {
        ...item,
        question_id: qid,
      };
    }

    try {
      localStorage.setItem(STORAGE_KEYS.SRS, JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return items;
  }

  // Bookmarks
  static getBookmarks(): Record<number, UserBookmark> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static toggleBookmark(questionId: number, note = '', tags: string[] = [], twinQuestionIds?: number[]): Record<number, UserBookmark> {
    const bookmarks = this.getBookmarks();
    const isCurrentlyBookmarked = !!bookmarks[questionId];
    const ids = twinQuestionIds && twinQuestionIds.length > 0 ? twinQuestionIds : [questionId];

    for (const qid of ids) {
      if (isCurrentlyBookmarked) {
        delete bookmarks[qid];
      } else {
        bookmarks[qid] = {
          question_id: qid,
          note,
          tags,
          created_at: Date.now(),
        };
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return bookmarks;
  }

  static updateBookmarkNote(questionId: number, note: string, twinQuestionIds?: number[]): Record<number, UserBookmark> {
    const bookmarks = this.getBookmarks();
    const ids = twinQuestionIds && twinQuestionIds.length > 0 ? twinQuestionIds : [questionId];

    for (const qid of ids) {
      if (!bookmarks[qid]) {
        bookmarks[qid] = {
          question_id: qid,
          note,
          tags: [],
          created_at: Date.now(),
        };
      } else {
        bookmarks[qid].note = note;
      }
    }

    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return bookmarks;
  }

  // Option strikethroughs (temporary/persistent)
  static getOptionStrikes(): Record<number, string[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STRIKES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  static toggleOptionStrike(questionId: number, letter: string, twinQuestionIds?: number[]): Record<number, string[]> {
    const strikes = this.getOptionStrikes();
    const current = strikes[questionId] || [];
    const shouldRemove = current.includes(letter);
    const newLetters = shouldRemove ? current.filter(l => l !== letter) : [...current, letter];

    const ids = twinQuestionIds && twinQuestionIds.length > 0 ? twinQuestionIds : [questionId];
    for (const qid of ids) {
      strikes[qid] = [...newLetters];
    }

    try {
      localStorage.setItem(STORAGE_KEYS.STRIKES, JSON.stringify(strikes));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return strikes;
  }

  static setOptionStrikes(questionId: number, letters: string[], twinQuestionIds?: number[]): Record<number, string[]> {
    const strikes = this.getOptionStrikes();
    const ids = twinQuestionIds && twinQuestionIds.length > 0 ? twinQuestionIds : [questionId];
    for (const qid of ids) {
      strikes[qid] = [...letters];
    }

    try {
      localStorage.setItem(STORAGE_KEYS.STRIKES, JSON.stringify(strikes));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return strikes;
  }

  // User Statistics & XP
  static getStatistics(): UserStatistics {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) return defaultStatistics;
      const stats: UserStatistics = JSON.parse(data);
      
      // Ensure daily_goal_xp and today_xp have valid numbers
      if (!stats.daily_goal_xp || stats.daily_goal_xp <= 0) {
        stats.daily_goal_xp = 50;
      }
      if (typeof stats.today_xp !== 'number') {
        stats.today_xp = stats.xp_points || 0;
      }

      // Check day rollover for streak
      const today = getTodayDateString();
      if (stats.last_study_date !== today) {
        const lastDate = new Date(stats.last_study_date);
        const currDate = new Date(today);
        const diffDays = Math.round((currDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays === 1) {
          // Continuous streak
        } else if (diffDays > 1) {
          // Streak broken
          stats.streak_days = 1;
        }
        stats.today_xp = 0;
      } else {
        // If today is the study date and today_xp is 0 while xp_points > 0, heal it
        if (stats.today_xp === 0 && stats.xp_points > 0) {
          stats.today_xp = stats.xp_points;
        }
      }
      return stats;
    } catch {
      return defaultStatistics;
    }
  }

  static setDailyGoalXP(goal: number): UserStatistics {
    const stats = this.getStatistics();
    stats.daily_goal_xp = Math.max(10, Math.min(500, goal));
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return stats;
  }

  static addXP(points: number, isCorrect: boolean, subject: string): UserStatistics {
    const stats = this.getStatistics();
    const today = getTodayDateString();
    
    stats.last_study_date = today;
    stats.total_answered += 1;
    if (isCorrect) stats.total_correct += 1;
    else stats.total_wrong += 1;

    stats.xp_points += points;
    stats.today_xp += points;

    if (!stats.subject_stats[subject]) {
      stats.subject_stats[subject] = { total: 0, correct: 0 };
    }
    stats.subject_stats[subject].total += 1;
    if (isCorrect) stats.subject_stats[subject].correct += 1;

    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return stats;
  }

  // Preferences
  static getPreferences(): UserPreferences {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFS);
      if (!data) return defaultPreferences;
      const parsed = JSON.parse(data);
      let theme: ThemeMode = parsed.theme || defaultPreferences.theme;
      if ((theme as any) === 'sepia') theme = 'reading';
      if ((theme as any) === 'amber') theme = 'night';
      return { ...defaultPreferences, ...parsed, theme };
    } catch {
      return defaultPreferences;
    }
  }

  static savePreferences(prefs: Partial<UserPreferences>) {
    try {
      const current = this.getPreferences();
      const updated = { ...current, ...prefs };
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }

  // Multiple Question Databases Management
  static getDatabases(defaultQuestions: Question[] = []): QuestionDatabase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DATABASES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Check legacy custom bank
      const legacyCustom = this.getCustomBank();
      if (legacyCustom && legacyCustom.length > 0) {
        const legacyDb: QuestionDatabase = {
          id: 'custom_legacy',
          name: 'Principal',
          questions: legacyCustom.map(q => ({
            ...q,
            database_id: 'custom_legacy',
            database_name: 'Principal',
          })),
          created_at: Date.now(),
          is_default: true,
        };
        const initialList = [legacyDb];
        this.saveDatabases(initialList);
        return initialList;
      }

      // Initialize with default bank
      const defaultDb: QuestionDatabase = {
        id: 'default_main',
        name: 'Principal',
        questions: defaultQuestions.map(q => ({
          ...q,
          database_id: 'default_main',
          database_name: 'Principal',
        })),
        created_at: Date.now(),
        is_default: true,
      };
      const initialList = [defaultDb];
      this.saveDatabases(initialList);
      return initialList;
    } catch {
      return [];
    }
  }

  static saveDatabases(databases: QuestionDatabase[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.DATABASES, JSON.stringify(databases));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }

  /**
   * Adds a new database and re-indexes questions with collision-free sequence_ids
   */
  static addDatabase(
    newDb: { name: string; filename?: string; questions: Question[] },
    existingDatabases: QuestionDatabase[]
  ): { updatedDatabases: QuestionDatabase[]; newDatabaseId: string } {
    // 1. Calculate max sequence_id across existing questions
    let maxId = 0;
    for (const db of existingDatabases) {
      for (const q of db.questions) {
        if (q.sequence_id > maxId) maxId = q.sequence_id;
      }
    }

    const dbId = `db_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // 2. Normalize to Schema v2 and assign unique sequence_ids and database tags
    const normalizedQuestions: Question[] = newDb.questions.map((q) => {
      maxId++;
      const v2q = normalizeQuestionToSchemaV2(q, maxId);
      return {
        ...v2q,
        sequence_id: maxId,
        database_id: dbId,
        database_name: newDb.name,
      };
    });

    const createdDatabase: QuestionDatabase = {
      id: dbId,
      name: newDb.name,
      filename: newDb.filename,
      questions: normalizedQuestions,
      created_at: Date.now(),
      is_default: false,
    };

    const updated = [...existingDatabases, createdDatabase];
    this.saveDatabases(updated);
    return { updatedDatabases: updated, newDatabaseId: dbId };
  }

  static renameDatabase(
    id: string,
    newName: string,
    existingDatabases: QuestionDatabase[]
  ): QuestionDatabase[] {
    const updated = existingDatabases.map(db => {
      if (db.id === id) {
        return {
          ...db,
          name: newName,
          questions: db.questions.map(q => ({
            ...q,
            database_name: newName,
          })),
        };
      }
      return db;
    });
    this.saveDatabases(updated);
    return updated;
  }

  static deleteDatabase(
    id: string,
    existingDatabases: QuestionDatabase[]
  ): QuestionDatabase[] {
    const filtered = existingDatabases.filter(db => db.id !== id);
    this.saveDatabases(filtered);
    return filtered;
  }

  static getAllQuestions(databases: QuestionDatabase[]): Question[] {
    return databases.flatMap(db => db.questions);
  }

  // Custom Bank (Legacy compatibility)
  static getCustomBank(): Question[] | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_BANK);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static saveCustomBank(questions: Question[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_BANK, JSON.stringify(questions));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }

  // Simulados
  static getSimulados(): SimuladoResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SIMULADOS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveSimulado(result: SimuladoResult) {
    const list = this.getSimulados();
    list.unshift(result);
    try {
      localStorage.setItem(STORAGE_KEYS.SIMULADOS, JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
    return list;
  }

  // Full System Export & Import (100% Offline Disk Portability)
  static exportFullBackup(databases: QuestionDatabase[], questions: Question[]): string {
    const backup = {
      app: 'Memoriz Offline Questions & SRS',
      version: '2.0.0',
      exported_at: new Date().toISOString(),
      databases: databases,
      question_bank: questions,
      answers: this.getAnswers(),
      srs_items: this.getSRSItems(),
      bookmarks: this.getBookmarks(),
      statistics: this.getStatistics(),
      simulados: this.getSimulados(),
      preferences: this.getPreferences(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importFullBackup(jsonString: string): { 
    success: boolean; 
    message: string; 
    databases?: QuestionDatabase[];
    questions?: Question[];
  } {
    try {
      const data = JSON.parse(jsonString);
      if (data.databases && Array.isArray(data.databases) && data.databases.length > 0) {
        this.saveDatabases(data.databases);
        if (data.answers) localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(data.answers));
        if (data.srs_items) localStorage.setItem(STORAGE_KEYS.SRS, JSON.stringify(data.srs_items));
        if (data.bookmarks) localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
        if (data.statistics) localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.statistics));
        if (data.simulados) localStorage.setItem(STORAGE_KEYS.SIMULADOS, JSON.stringify(data.simulados));
        if (data.preferences) localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(data.preferences));

        const allQ = this.getAllQuestions(data.databases);
        return {
          success: true,
          message: `Backup restaurado com sucesso! ${data.databases.length} bancos e ${allQ.length} questões carregadas.`,
          databases: data.databases,
          questions: allQ,
        };
      } else if (data.question_bank && Array.isArray(data.question_bank)) {
        if (data.answers) localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(data.answers));
        if (data.srs_items) localStorage.setItem(STORAGE_KEYS.SRS, JSON.stringify(data.srs_items));
        if (data.bookmarks) localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data.bookmarks));
        if (data.statistics) localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(data.statistics));
        if (data.simulados) localStorage.setItem(STORAGE_KEYS.SIMULADOS, JSON.stringify(data.simulados));
        if (data.preferences) localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(data.preferences));
        
        const singleDb: QuestionDatabase = {
          id: 'imported_backup',
          name: 'Backup Importado',
          questions: data.question_bank.map((q: any) => ({
            ...q,
            database_id: 'imported_backup',
            database_name: 'Backup Importado',
          })),
          created_at: Date.now(),
        };
        this.saveDatabases([singleDb]);

        return {
          success: true,
          message: `Backup restaurado com sucesso! ${data.question_bank.length} questões carregadas.`,
          databases: [singleDb],
          questions: singleDb.questions,
        };
      } else if (Array.isArray(data)) {
        const singleDb: QuestionDatabase = {
          id: `db_${Date.now()}`,
          name: 'Banco Importado',
          questions: data.map((q: any, i: number) => ({
            ...q,
            sequence_id: q.sequence_id || i + 1,
            database_id: `db_${Date.now()}`,
            database_name: 'Banco Importado',
          })),
          created_at: Date.now(),
        };
        return {
          success: true,
          message: `Banco com ${data.length} questões importado com sucesso!`,
          databases: [singleDb],
          questions: singleDb.questions,
        };
      }
      return { success: false, message: 'Estrutura JSON inválida. Certifique-se de que contenha o nó question_bank ou databases.' };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: 'Falha ao processar arquivo JSON: ' + errorMsg };
    }
  }

  static resetAllProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.SRS);
    localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.SIMULADOS);
    localStorage.removeItem(STORAGE_KEYS.STRIKES);
  }

  // User Account & Multi-Profile System
  static getUserAccount(): UserAccount {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_ACCOUNT);
      if (data) {
        return { ...defaultUserAccount, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Error reading user account', e);
    }
    return defaultUserAccount;
  }

  static saveUserAccount(account: UserAccount): UserAccount {
    try {
      const updated = {
        ...account,
        lastLoginAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(updated));

      // Also ensure this account is updated in profiles list
      const profiles = this.getUserProfiles();
      const existingIdx = profiles.findIndex(p => p.id === updated.id);
      if (existingIdx >= 0) {
        profiles[existingIdx] = updated;
      } else {
        profiles.push(updated);
      }
      localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));

      return updated;
    } catch (e) {
      console.warn('Error saving user account', e);
      return account;
    }
  }

  static getUserProfiles(): UserAccount[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    const current = this.getUserAccount();
    return [current];
  }

  static switchUserProfile(profileId: string): UserAccount {
    const profiles = this.getUserProfiles();
    const target = profiles.find(p => p.id === profileId);
    if (target) {
      localStorage.setItem(STORAGE_KEYS.USER_ACCOUNT, JSON.stringify(target));
      return target;
    }
    return this.getUserAccount();
  }

  static deleteUserProfile(profileId: string): UserAccount[] {
    let profiles = this.getUserProfiles();
    if (profiles.length <= 1) return profiles; // cannot delete sole profile

    profiles = profiles.filter(p => p.id !== profileId);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(profiles));

    // If active profile was deleted, switch to the first remaining
    const current = this.getUserAccount();
    if (current.id === profileId) {
      this.switchUserProfile(profiles[0].id);
    }
    return profiles;
  }
}
