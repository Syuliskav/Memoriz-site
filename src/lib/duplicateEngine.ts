import { Question } from '../types/question';

/**
 * Normalizes text content for hashing:
 * - Trims whitespace and collapses multiple whitespace/newlines to single space
 * - Lowercases for case-insensitive matching
 * - Strips trailing punctuation differences if any
 */
export function normalizeContentString(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\r\n/g, ' ')
    .replace(/[\n\r\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Computes a deterministic content hash/fingerprint for a Question.
 * Questions with identical stem, options (letters + text), context content, and answer
 * will have the exact same hash across different databases and sequence_ids.
 */
export function getQuestionContentHash(q: Question): string {
  if (!q) return '';

  // 1. Stem text
  const stem = normalizeContentString(q.stem?.full_text || '');

  // 2. Context content if present
  const context = normalizeContentString(q.associated_context?.content || '');

  // 3. Options sorted and normalized
  const options = (q.options || [])
    .map(opt => `${(opt.letter || '').toLowerCase()}:${normalizeContentString(opt.text || '')}`)
    .sort()
    .join('||');

  // 4. Correct answer
  const answer = (q.resolution?.deduced_answer || '').toLowerCase().trim();

  return `${context}§§§${stem}§§§${options}§§§${answer}`;
}

/**
 * Builds a fast lookup map mapping every question sequence_id to all twin/duplicate sequence_ids
 * (including itself) found in the provided question pool.
 */
export function buildTwinMap(questions: Question[]): Map<number, number[]> {
  const hashToSeqIds = new Map<string, number[]>();
  const seqIdToHash = new Map<number, string>();

  for (const q of questions) {
    const hash = getQuestionContentHash(q);
    seqIdToHash.set(q.sequence_id, hash);

    const existing = hashToSeqIds.get(hash);
    if (existing) {
      existing.push(q.sequence_id);
    } else {
      hashToSeqIds.set(hash, [q.sequence_id]);
    }
  }

  const twinMap = new Map<number, number[]>();
  for (const q of questions) {
    const hash = seqIdToHash.get(q.sequence_id);
    if (hash) {
      twinMap.set(q.sequence_id, hashToSeqIds.get(hash) || [q.sequence_id]);
    } else {
      twinMap.set(q.sequence_id, [q.sequence_id]);
    }
  }

  return twinMap;
}

/**
 * Deduplicates an array of questions, preserving only the first occurrence of each unique question.
 */
export function deduplicateQuestions(questions: Question[]): Question[] {
  const seenHashes = new Set<string>();
  const result: Question[] = [];

  for (const q of questions) {
    const hash = getQuestionContentHash(q);
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      result.push(q);
    }
  }

  return result;
}

/**
 * Returns the count of unique questions in a question array.
 */
export function countUniqueQuestions(questions: Question[]): number {
  const seenHashes = new Set<string>();
  for (const q of questions) {
    seenHashes.add(getQuestionContentHash(q));
  }
  return seenHashes.size;
}
