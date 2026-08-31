import { Question, FilterState, SRSItem, UserBookmark } from '../types/question';
import { isItemDueForReview } from './srsEngine';
import { getQuestionContentHash } from './duplicateEngine';

/**
 * Normalizes text: removes diacritics/accents, lowercases, and strips punctuation
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Ultra-fast Inverted Index and Filter Engine using Uint32Array buffers
 * Designed to handle 10,000+ questions with sub-millisecond filtering and minimal GC churn.
 */
export class FastSearchEngine {
  private questions: Question[] = [];
  private tokenIndex = new Map<string, Uint32Array>();
  private databaseIndex = new Map<string, Uint32Array>();
  private subjectIndex = new Map<string, Uint32Array>();
  private examBoardIndex = new Map<string, Uint32Array>();
  private yearIndex = new Map<number, Uint32Array>();
  private topicIndex = new Map<string, Uint32Array>();
  
  // Content hash per question index for instant selection deduplication
  private contentHashes: string[] = [];

  // Flat normalized text cache per question index for fast substring search fallback
  private normalizedTexts: string[] = [];

  // Raw original text cache per question index for case/diacritic-sensitive and regex matching
  private rawTexts: string[] = [];

  // Available facets cached
  public subjects: string[] = [];
  public examBoards: string[] = [];
  public years: number[] = [];
  public topics: string[] = [];

  constructor(questions: Question[]) {
    this.rebuildIndex(questions);
  }

  public rebuildIndex(questions: Question[]) {
    this.questions = questions;
    this.tokenIndex.clear();
    this.databaseIndex.clear();
    this.subjectIndex.clear();
    this.examBoardIndex.clear();
    this.yearIndex.clear();
    this.topicIndex.clear();
    this.normalizedTexts = new Array(questions.length);
    this.rawTexts = new Array(questions.length);
    this.contentHashes = new Array(questions.length);

    const tempTokenMap = new Map<string, number[]>();
    const tempDbMap = new Map<string, number[]>();
    const tempSubjectMap = new Map<string, number[]>();
    const tempBoardMap = new Map<string, number[]>();
    const tempYearMap = new Map<number, number[]>();
    const tempTopicMap = new Map<string, number[]>();

    const subjectSet = new Set<string>();
    const boardSet = new Set<string>();
    const yearSet = new Set<number>();
    const topicSet = new Set<string>();

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const dbId = q.database_id || 'default_main';
      const sub = q.metadata.subject || 'Geral';
      const board = q.metadata.exam_board || 'Outra';
      const yr = q.metadata.year || 2024;

      this.contentHashes[i] = getQuestionContentHash(q);

      subjectSet.add(sub);
      boardSet.add(board);
      yearSet.add(yr);

      // Add to database map
      if (!tempDbMap.has(dbId)) tempDbMap.set(dbId, []);
      tempDbMap.get(dbId)!.push(i);

      // Add to subject map
      if (!tempSubjectMap.has(sub)) tempSubjectMap.set(sub, []);
      tempSubjectMap.get(sub)!.push(i);

      // Add to board map
      if (!tempBoardMap.has(board)) tempBoardMap.set(board, []);
      tempBoardMap.get(board)!.push(i);

      // Add to year map
      if (!tempYearMap.has(yr)) tempYearMap.set(yr, []);
      tempYearMap.get(yr)!.push(i);

      // Add topics
      if (Array.isArray(q.metadata.topics)) {
        for (const topic of q.metadata.topics) {
          if (topic) {
            topicSet.add(topic);
            if (!tempTopicMap.has(topic)) tempTopicMap.set(topic, []);
            tempTopicMap.get(topic)!.push(i);
          }
        }
      }

      // Build searchable text
      const searchableContent = [
        q.sequence_id.toString(),
        q.database_name || '',
        q.metadata.reference_code || '',
        q.metadata.subject || '',
        q.metadata.exam_board || '',
        q.metadata.institution || '',
        q.metadata.role || '',
        ...(q.metadata.topics || []),
        q.stem?.full_text || '',
        q.associated_context?.title || '',
        q.associated_context?.content || '',
        ...(q.options || []).map(o => `${o.letter}: ${o.text}`),
        q.resolution?.pedagogical_explanation || '',
      ].join('\n');

      this.rawTexts[i] = searchableContent;
      const norm = normalizeText(searchableContent);
      this.normalizedTexts[i] = norm;

      // Extract unique words (length >= 2)
      const words = norm.split(/[\s,.;:!?()[\]{}'"`/\\-]+/);
      const uniqueWords = new Set<string>();
      for (const w of words) {
        if (w.length >= 2) {
          uniqueWords.add(w);
        }
      }

      for (const w of uniqueWords) {
        if (!tempTokenMap.has(w)) tempTokenMap.set(w, []);
        tempTokenMap.get(w)!.push(i);
      }
    }

    // Convert temporary number[] to static typed buffers Uint32Array for memory efficiency
    for (const [key, list] of tempDbMap.entries()) {
      this.databaseIndex.set(key, new Uint32Array(list));
    }
    for (const [key, list] of tempSubjectMap.entries()) {
      this.subjectIndex.set(key, new Uint32Array(list));
    }
    for (const [key, list] of tempBoardMap.entries()) {
      this.examBoardIndex.set(key, new Uint32Array(list));
    }
    for (const [key, list] of tempYearMap.entries()) {
      this.yearIndex.set(key, new Uint32Array(list));
    }
    for (const [key, list] of tempTopicMap.entries()) {
      this.topicIndex.set(key, new Uint32Array(list));
    }
    for (const [key, list] of tempTokenMap.entries()) {
      this.tokenIndex.set(key, new Uint32Array(list));
    }

    this.subjects = Array.from(subjectSet).sort();
    this.examBoards = Array.from(boardSet).sort();
    this.years = Array.from(yearSet).sort((a, b) => b - a);
    this.topics = Array.from(topicSet).sort();
  }

  /**
   * Fast bitwise-based multi-filter matching
   */
  public filter(
    filters: FilterState,
    srsMap: Record<number, SRSItem>,
    bookmarksMap: Record<number, UserBookmark>,
    lastAnswerMap: Record<number, { is_correct: boolean }>
  ): number[] {
    const total = this.questions.length;
    if (total === 0) return [];

    // Use a Uint8Array bitmask to mark matching question indices without creating intermediate object garbage
    const matched = new Uint8Array(total);
    matched.fill(1); // Start with all true

    // 0. Database filter
    if (filters.database_id && filters.database_id !== 'all') {
      const indices = this.databaseIndex.get(filters.database_id);
      if (!indices) return [];
      const dbMask = new Uint8Array(total);
      for (let i = 0; i < indices.length; i++) dbMask[indices[i]] = 1;
      for (let i = 0; i < total; i++) matched[i] &= dbMask[i];
    }

    // 1. Subject filter
    if (filters.subject && filters.subject !== 'all') {
      const indices = this.subjectIndex.get(filters.subject);
      if (!indices) return [];
      const subMask = new Uint8Array(total);
      for (let i = 0; i < indices.length; i++) subMask[indices[i]] = 1;
      for (let i = 0; i < total; i++) matched[i] &= subMask[i];
    }

    // 2. Exam board filter
    if (filters.exam_board && filters.exam_board !== 'all') {
      const indices = this.examBoardIndex.get(filters.exam_board);
      if (!indices) return [];
      const boardMask = new Uint8Array(total);
      for (let i = 0; i < indices.length; i++) boardMask[indices[i]] = 1;
      for (let i = 0; i < total; i++) matched[i] &= boardMask[i];
    }

    // 3. Year filter
    if (filters.year && filters.year !== 'all') {
      const indices = this.yearIndex.get(filters.year);
      if (!indices) return [];
      const yearMask = new Uint8Array(total);
      for (let i = 0; i < indices.length; i++) yearMask[indices[i]] = 1;
      for (let i = 0; i < total; i++) matched[i] &= yearMask[i];
    }

    // 4. Topic filter
    if (filters.topic && filters.topic !== 'all') {
      const indices = this.topicIndex.get(filters.topic);
      if (!indices) return [];
      const topicMask = new Uint8Array(total);
      for (let i = 0; i < indices.length; i++) topicMask[indices[i]] = 1;
      for (let i = 0; i < total; i++) matched[i] &= topicMask[i];
    }

    // 5. Status filter
    if (filters.status && filters.status !== 'all') {
      for (let i = 0; i < total; i++) {
        if (!matched[i]) continue;
        const q = this.questions[i];
        const lastAnswer = lastAnswerMap[q.sequence_id];
        const srs = srsMap[q.sequence_id];
        const isBookmarked = !!bookmarksMap[q.sequence_id];

        let pass = false;
        switch (filters.status) {
          case 'unanswered':
            pass = !lastAnswer;
            break;
          case 'correct':
            pass = !!lastAnswer && lastAnswer.is_correct;
            break;
          case 'wrong':
            pass = !!lastAnswer && !lastAnswer.is_correct;
            break;
          case 'bookmarked':
            pass = isBookmarked;
            break;
          case 'srs_due':
            pass = isItemDueForReview(srs);
            break;
        }

        if (!pass) matched[i] = 0;
      }
    }

    // 6. Text / Regex Query Filter
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const rawQuery = filters.searchQuery.trim();
      let isRegex = !!filters.isRegexSearch;
      let regexPattern = rawQuery;
      let regexFlags = 'i';

      // Auto-detect slash-enclosed regex like /pattern/ or /pattern/i if not already explicitly toggled
      if (!isRegex && rawQuery.startsWith('/') && rawQuery.lastIndexOf('/') > 0) {
        const lastSlash = rawQuery.lastIndexOf('/');
        const innerPattern = rawQuery.slice(1, lastSlash);
        const innerFlags = rawQuery.slice(lastSlash + 1);
        if (innerPattern.length > 0) {
          isRegex = true;
          regexPattern = innerPattern;
          if (innerFlags) regexFlags = innerFlags;
        }
      }

      if (isRegex) {
        try {
          const finalFlags = regexFlags.includes('i') ? regexFlags : regexFlags + 'i';
          const rx = new RegExp(regexPattern, finalFlags);
          for (let i = 0; i < total; i++) {
            if (!matched[i]) continue;
            // Match against raw text (with accents/case) or normalized text
            const matchesRaw = rx.test(this.rawTexts[i]);
            const matchesNorm = rx.test(this.normalizedTexts[i]);
            if (!matchesRaw && !matchesNorm) {
              matched[i] = 0;
            }
          }
        } catch {
          // Incomplete / invalid regex syntax during user typing: match nothing
          for (let i = 0; i < total; i++) {
            matched[i] = 0;
          }
        }
      } else {
        const queryNorm = normalizeText(rawQuery);
        const queryTokens = queryNorm.split(/[\s,.;:!?()[\]{}'"`/\\-]+/).filter(t => t.length > 0);

        for (let i = 0; i < total; i++) {
          if (!matched[i]) continue;
          const norm = this.normalizedTexts[i];
          let allTokensMatch = true;

          for (const token of queryTokens) {
            if (!norm.includes(token)) {
              allTokensMatch = false;
              break;
            }
          }

          if (!allTokensMatch) {
            matched[i] = 0;
          }
        }
      }
    }

    // Collect matching question indices (guaranteeing exact duplicate questions never appear in the same filter selection)
    const result: number[] = [];
    const seenHashes = new Set<string>();
    for (let i = 0; i < total; i++) {
      if (matched[i] === 1) {
        const hash = this.contentHashes[i];
        if (!seenHashes.has(hash)) {
          seenHashes.add(hash);
          result.push(i);
        }
      }
    }

    return result;
  }

  /**
   * Computes counts for each facet quickly and accurately, respecting disjunctive faceting
   * (so selecting one subject doesn't zero out the counts of other subjects)
   * and deduplicating twin questions across databases.
   */
  public getFacetCounts(
    filters: FilterState,
    srsMap: Record<number, SRSItem>,
    bookmarksMap: Record<number, UserBookmark>,
    lastAnswerMap: Record<number, { is_correct: boolean }>
  ) {
    const subjectCounts: Record<string, number> = {};
    const statusCounts = {
      all: 0,
      unanswered: 0,
      correct: 0,
      wrong: 0,
      bookmarked: 0,
      srs_due: 0,
    };

    // 1. Calculate subject counts without the subject constraint,
    // so every subject displays its available matching question count accurately.
    const subjectMatches = this.filter(
      { ...filters, subject: 'all' },
      srsMap,
      bookmarksMap,
      lastAnswerMap
    );

    for (const idx of subjectMatches) {
      const q = this.questions[idx];
      const s = q.metadata.subject;
      subjectCounts[s] = (subjectCounts[s] || 0) + 1;
    }

    // 2. Calculate status counts without the status constraint
    const statusMatches = this.filter(
      { ...filters, status: 'all' },
      srsMap,
      bookmarksMap,
      lastAnswerMap
    );

    for (const idx of statusMatches) {
      const q = this.questions[idx];
      const last = lastAnswerMap[q.sequence_id];
      const isBookmarked = !!bookmarksMap[q.sequence_id];
      const isDue = isItemDueForReview(srsMap[q.sequence_id]);

      statusCounts.all++;
      if (!last) statusCounts.unanswered++;
      else if (last.is_correct) statusCounts.correct++;
      else statusCounts.wrong++;

      if (isBookmarked) statusCounts.bookmarked++;
      if (isDue) statusCounts.srs_due++;
    }

    return { subjectCounts, statusCounts };
  }
}
