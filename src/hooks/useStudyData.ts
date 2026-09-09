import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Question, 
  QuestionDatabase,
  StudyMode,
  FilterState, 
  SRSItem, 
  SRSRating, 
  UserAnswerRecord, 
  UserBookmark, 
  SimuladoResult, 
  UserStatistics 
} from '../types/question';
import { initialQuestionBank } from '../data/question_bank';
import { LocalStorageManager, defaultStatistics } from '../lib/storage';
import { FastSearchEngine } from '../lib/searchEngine';
import { calculateNextSRS, isItemDueForReview } from '../lib/srsEngine';
import { buildTwinMap, getQuestionContentHash, countUniqueQuestions } from '../lib/duplicateEngine';

interface UseStudyDataOptions {
  currentMode: StudyMode;
}

export function useStudyData({ currentMode }: UseStudyDataOptions) {
  // 1. Core Data State
  const [databases, setDatabases] = useState<QuestionDatabase[]>(() => {
    return LocalStorageManager.getDatabases(initialQuestionBank.question_bank);
  });

  const questions = useMemo(() => {
    return LocalStorageManager.getAllQuestions(databases);
  }, [databases]);

  const [answers, setAnswers] = useState<Record<number, UserAnswerRecord[]>>(() => LocalStorageManager.getAnswers());
  const [srsItems, setSRSItems] = useState<Record<number, SRSItem>>(() => LocalStorageManager.getSRSItems());
  const [bookmarks, setBookmarks] = useState<Record<number, UserBookmark>>(() => LocalStorageManager.getBookmarks());
  const [strikes, setStrikes] = useState<Record<number, string[]>>(() => LocalStorageManager.getOptionStrikes());
  const [stats, setStats] = useState<UserStatistics>(() => LocalStorageManager.getStatistics());
  const [unansweredTimes, setUnansweredTimes] = useState<Record<number, number>>({});

  // 2. Filters State
  const [filters, setFilters] = useState<FilterState>({
    database_id: 'all',
    subject: 'all',
    exam_board: 'all',
    year: 'all',
    topic: 'all',
    status: 'all',
    searchQuery: '',
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 3. High-performance Search Engine Instance
  const searchEngine = useMemo(() => {
    return new FastSearchEngine(questions);
  }, [questions]);

  // 4. Derived Twin Map for duplicate questions
  const twinMap = useMemo(() => {
    return buildTwinMap(questions);
  }, [questions]);

  // 5. Derived Map of latest answers per question
  const lastAnswerMap = useMemo(() => {
    const rawMap: Record<number, UserAnswerRecord> = {};
    const hashToAnswerMap = new Map<string, UserAnswerRecord>();

    for (const [qidStr, recordList] of Object.entries(answers) as [string, UserAnswerRecord[]][]) {
      const qid = Number(qidStr);
      if (recordList && recordList.length > 0) {
        const latest = recordList[recordList.length - 1];
        if (latest.content_hash) {
          hashToAnswerMap.set(latest.content_hash, latest);
        }
        rawMap[qid] = latest;
      }
    }

    const verifiedMap: Record<number, UserAnswerRecord> = {};
    for (const q of questions) {
      const qHash = getQuestionContentHash(q);
      const answerByHash = hashToAnswerMap.get(qHash);
      if (answerByHash) {
        verifiedMap[q.sequence_id] = { ...answerByHash, question_id: q.sequence_id };
      } else if (rawMap[q.sequence_id]) {
        const directAns = rawMap[q.sequence_id];
        if (directAns.content_hash) {
          if (directAns.content_hash === qHash) {
            verifiedMap[q.sequence_id] = directAns;
          }
        } else {
          const qDb = q.database_id || 'default_main';
          const ansDb = directAns.database_id || 'default_main';
          if (qDb === ansDb) {
            verifiedMap[q.sequence_id] = directAns;
          }
        }
      }
    }

    return verifiedMap;
  }, [answers, questions]);

  // 6. Compute Filtered Question Indices via Inverted Index
  const matchedIndices = useMemo(() => {
    return searchEngine.filter(filters, srsItems, bookmarks, lastAnswerMap);
  }, [searchEngine, filters, srsItems, bookmarks, lastAnswerMap]);

  // 7. Filtered Questions Array
  const filteredQuestions = useMemo(() => {
    return matchedIndices.map(idx => questions[idx]);
  }, [matchedIndices, questions]);

  // 8. Compute Facet Counts for Filter Sidebar
  const { subjectCounts, statusCounts } = useMemo(() => {
    return searchEngine.getFacetCounts(filters, srsItems, bookmarks, lastAnswerMap);
  }, [searchEngine, filters, lastAnswerMap, bookmarks, srsItems]);

  // 9. Clamp Current Index safely
  useEffect(() => {
    if (currentIndex >= filteredQuestions.length && filteredQuestions.length > 0) {
      setCurrentIndex(filteredQuestions.length - 1);
    }
  }, [filteredQuestions.length, currentIndex]);

  const currentQuestion: Question | undefined = filteredQuestions[currentIndex];

  // 10. Handler: Answer Submission
  const handleAnswer = useCallback((
    letter: string, 
    timeSpentSeconds: number, 
    answeredStrikes?: string[], 
    targetQuestionOverride?: Question,
    eliminatedOptionsTimestamp?: number
  ) => {
    const q = targetQuestionOverride || currentQuestion;
    if (!q) return;

    const isCorrect = letter === q.resolution.deduced_answer;
    const earnedXP = isCorrect ? 15 : 5;
    const twinIds = twinMap.get(q.sequence_id) || [q.sequence_id];
    const strikesToSave = answeredStrikes !== undefined ? answeredStrikes : (strikes[q.sequence_id] || []);
    const now = Date.now();
    const strikeMoment = eliminatedOptionsTimestamp ?? now;

    const record: UserAnswerRecord = {
      question_id: q.sequence_id,
      content_hash: getQuestionContentHash(q),
      database_id: q.database_id || 'default_main',
      selected_letter: letter,
      is_correct: isCorrect,
      timestamp: now,
      time_spent_seconds: timeSpentSeconds,
      mode: currentMode === 'practice' ? 'practice' : 'error_notebook',
      eliminated_options: strikesToSave,
      eliminated_options_timestamp: strikeMoment,
    };

    const updatedAnswers = LocalStorageManager.saveAnswer(record, twinIds);
    setAnswers(updatedAnswers);

    const updatedStats = LocalStorageManager.addXP(earnedXP, isCorrect, q.metadata.subject);
    setStats(updatedStats);

    const existingSRS = srsItems[q.sequence_id];
    const defaultRating: SRSRating = isCorrect ? 2 : 1;
    const updatedSRS = calculateNextSRS(existingSRS, defaultRating, q.sequence_id);
    const newSRSItems = LocalStorageManager.saveSRSItem(updatedSRS, twinIds);
    setSRSItems(newSRSItems);
  }, [currentQuestion, currentMode, srsItems, twinMap, strikes]);

  // 11. Handler: Rate SRS manually
  const handleRateSRS = useCallback((rating: SRSRating, targetQuestionOverride?: Question) => {
    const q = targetQuestionOverride || currentQuestion;
    if (!q) return;
    const twinIds = twinMap.get(q.sequence_id) || [q.sequence_id];
    const existingSRS = srsItems[q.sequence_id];
    const updated = calculateNextSRS(existingSRS, rating, q.sequence_id);
    const newSRSItems = LocalStorageManager.saveSRSItem(updated, twinIds);
    setSRSItems(newSRSItems);
  }, [currentQuestion, srsItems, twinMap]);

  // 12. Handler: Toggle Bookmark
  const handleToggleBookmark = useCallback((targetQuestionOverride?: Question) => {
    const isValidQuestion = Boolean(
      targetQuestionOverride && 
      typeof (targetQuestionOverride as any).sequence_id === 'number'
    );
    const q = isValidQuestion ? targetQuestionOverride : currentQuestion;
    if (!q || typeof q.sequence_id !== 'number') return;

    const twinIds = twinMap.get(q.sequence_id) || [q.sequence_id];
    const newBookmarks = LocalStorageManager.toggleBookmark(q.sequence_id, '', [], twinIds);
    setBookmarks(newBookmarks);
  }, [currentQuestion, twinMap]);

  // 13. Handler: Save Personal Note
  const handleSaveNote = useCallback((note: string, targetQuestionId?: number) => {
    const qid = targetQuestionId ?? currentQuestion?.sequence_id;
    if (!qid) return;
    const twinIds = twinMap.get(qid) || [qid];
    const newBookmarks = LocalStorageManager.updateBookmarkNote(qid, note, twinIds);
    setBookmarks(newBookmarks);
  }, [currentQuestion, twinMap]);

  // 14. Handler: Option Strike
  const handleToggleStrike = useCallback((letter: string, targetQuestionId?: number) => {
    const qid = targetQuestionId ?? currentQuestion?.sequence_id;
    if (!qid) return;
    const twinIds = twinMap.get(qid) || [qid];
    const newStrikes = LocalStorageManager.toggleOptionStrike(qid, letter, twinIds);
    setStrikes(newStrikes);
  }, [currentQuestion, twinMap]);

  // 15. Handler: Set All Strikes for question
  const handleSetStrikes = useCallback((letters: string[]) => {
    if (!currentQuestion) return;
    const twinIds = twinMap.get(currentQuestion.sequence_id) || [currentQuestion.sequence_id];
    const newStrikes = LocalStorageManager.setOptionStrikes(currentQuestion.sequence_id, letters, twinIds);
    setStrikes(newStrikes);
  }, [currentQuestion, twinMap]);

  // 16. Error count & SRS due count for badges
  const errorCount = useMemo(() => {
    const wrongHashes = new Set<string>();
    for (const q of questions) {
      const last = lastAnswerMap[q.sequence_id];
      if (last && !last.is_correct) {
        wrongHashes.add(getQuestionContentHash(q));
      }
    }
    return wrongHashes.size;
  }, [questions, lastAnswerMap]);

  const srsDueCount = useMemo(() => {
    const dueHashes = new Set<string>();
    for (const q of questions) {
      if (isItemDueForReview(srsItems[q.sequence_id])) {
        dueHashes.add(getQuestionContentHash(q));
      }
    }
    return dueHashes.size;
  }, [questions, srsItems]);

  const activePoolQuestions = useMemo(() => {
    if (filters.database_id === 'all') return questions;
    return questions.filter(q => (q.database_id || 'default_main') === filters.database_id);
  }, [questions, filters.database_id]);

  const totalPoolUniqueQuestions = useMemo(() => {
    return countUniqueQuestions(activePoolQuestions);
  }, [activePoolQuestions]);

  const hasActiveFilters = 
    filters.database_id !== 'all' ||
    filters.subject !== 'all' || 
    filters.exam_board !== 'all' || 
    filters.year !== 'all' || 
    filters.topic !== 'all' || 
    filters.status !== 'all' || 
    filters.searchQuery.trim() !== '';

  // 17. Database actions
  const handleSelectDatabase = useCallback((dbId: string | 'all') => {
    setFilters(prev => ({ ...prev, database_id: dbId }));
    setCurrentIndex(0);
  }, []);

  const handleAddDatabase = useCallback((
    newDb: { name: string; filename?: string; questions: Question[] }, 
    activateImmediately: boolean
  ) => {
    const { updatedDatabases, newDatabaseId } = LocalStorageManager.addDatabase(newDb, databases);
    setDatabases(updatedDatabases);
    if (activateImmediately) {
      setFilters(prev => ({ ...prev, database_id: newDatabaseId }));
    }
    setCurrentIndex(0);
  }, [databases]);

  const handleRenameDatabase = useCallback((id: string, newName: string) => {
    const updated = LocalStorageManager.renameDatabase(id, newName, databases);
    setDatabases(updated);
  }, [databases]);

  const handleDeleteDatabase = useCallback((id: string) => {
    const updated = LocalStorageManager.deleteDatabase(id, databases);
    setDatabases(updated);
    if (filters.database_id === id) {
      setFilters(prev => ({ ...prev, database_id: 'all' }));
    }
    setCurrentIndex(0);
  }, [databases, filters.database_id]);

  const handleRestoreDefaultDatabases = useCallback(() => {
    const defaultDb: QuestionDatabase = {
      id: 'default_main',
      name: 'Principal',
      questions: initialQuestionBank.question_bank.map(q => ({
        ...q,
        database_id: 'default_main',
        database_name: 'Principal',
      })),
      created_at: Date.now(),
      is_default: true,
    };
    LocalStorageManager.saveDatabases([defaultDb]);
    setDatabases([defaultDb]);
    setFilters(prev => ({ ...prev, database_id: 'all' }));
    setCurrentIndex(0);
  }, []);

  // 18. Simulado and SRS view helpers
  const handleRecordSimuladoResult = useCallback((result: SimuladoResult) => {
    LocalStorageManager.saveSimulado(result);
    for (const [qidStr, ans] of Object.entries(result.answers) as [string, { selected: string; correct: string; is_correct: boolean }][]) {
      if (!ans.selected) continue;
      const qid = Number(qidStr);
      const twinIds = twinMap.get(qid) || [qid];
      const record: UserAnswerRecord = {
        question_id: qid,
        selected_letter: ans.selected,
        is_correct: ans.is_correct,
        timestamp: Date.now(),
        time_spent_seconds: Math.round(result.time_spent_seconds / Math.max(1, result.total_questions)),
        mode: 'simulado',
      };
      LocalStorageManager.saveAnswer(record, twinIds);
    }
    setAnswers(LocalStorageManager.getAnswers());
    const updatedStats = LocalStorageManager.addXP(
      result.correct_count * 20, 
      result.score_percentage >= 70, 
      'Simulados'
    );
    setStats(updatedStats);
  }, [twinMap]);

  const handleSaveSRSFromView = useCallback((item: SRSItem) => {
    const twinIds = twinMap.get(item.question_id) || [item.question_id];
    const updated = LocalStorageManager.saveSRSItem(item, twinIds);
    setSRSItems(updated);
  }, [twinMap]);

  const handleRecordSRSAnswer = useCallback((record: UserAnswerRecord) => {
    const twinIds = twinMap.get(record.question_id) || [record.question_id];
    const updated = LocalStorageManager.saveAnswer(record, twinIds);
    setAnswers(updated);
    const isCorrect = record.is_correct;
    const q = questions.find(item => item.sequence_id === record.question_id);
    if (q) {
      const updatedStats = LocalStorageManager.addXP(isCorrect ? 20 : 5, isCorrect, q.metadata.subject);
      setStats(updatedStats);
    }
  }, [twinMap, questions]);

  const handleResetAllProgress = useCallback(() => {
    LocalStorageManager.resetAllProgress();
    setAnswers({});
    setSRSItems({});
    setBookmarks({});
    setStrikes({});
    setStats(defaultStatistics);
    setUnansweredTimes({});
  }, []);

  const handleUpdateElapsedSeconds = useCallback((sequenceId: number, secs: number) => {
    setUnansweredTimes(prev => {
      if (prev[sequenceId] === secs) return prev;
      return { ...prev, [sequenceId]: secs };
    });
  }, []);

  const handleUpdateDailyGoalXP = useCallback((newGoal: number) => {
    const updated = LocalStorageManager.setDailyGoalXP(newGoal);
    setStats(updated);
  }, []);

  return {
    databases,
    setDatabases,
    questions,
    answers,
    srsItems,
    bookmarks,
    strikes,
    stats,
    unansweredTimes,
    filters,
    setFilters,
    currentIndex,
    setCurrentIndex,
    searchEngine,
    twinMap,
    lastAnswerMap,
    matchedIndices,
    filteredQuestions,
    currentQuestion,
    subjectCounts,
    statusCounts,
    errorCount,
    srsDueCount,
    activePoolQuestions,
    totalPoolUniqueQuestions,
    hasActiveFilters,
    handleAnswer,
    handleRateSRS,
    handleToggleBookmark,
    handleSaveNote,
    handleToggleStrike,
    handleSetStrikes,
    handleSelectDatabase,
    handleAddDatabase,
    handleRenameDatabase,
    handleDeleteDatabase,
    handleRestoreDefaultDatabases,
    handleRecordSimuladoResult,
    handleSaveSRSFromView,
    handleRecordSRSAnswer,
    handleResetAllProgress,
    handleUpdateElapsedSeconds,
    handleUpdateDailyGoalXP,
  };
}
