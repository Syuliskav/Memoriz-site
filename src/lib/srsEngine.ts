import { SRSItem, SRSRating, SRSState } from '../types/question';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createDefaultSRSItem(questionId: number): SRSItem {
  return {
    question_id: questionId,
    repetition_count: 0,
    ease_factor: 2.5,
    interval_days: 0,
    next_review_date: getTodayDateString(),
    last_reviewed_date: null,
    state: 'new',
    streak: 0,
    consecutive_correct: 0,
    total_reviews: 0,
    correct_reviews: 0,
  };
}

/**
 * Calculates updated SRS item parameters using SuperMemo-2 adaptive algorithm
 */
export function calculateNextSRS(currentItem: SRSItem | undefined, rating: SRSRating, questionId: number): SRSItem {
  const item: SRSItem = currentItem ? { ...currentItem } : createDefaultSRSItem(questionId);
  const today = getTodayDateString();
  
  item.total_reviews += 1;
  item.last_reviewed_date = today;

  if (rating === 1) {
    // Failed or very hard: Reset interval to 1 day and ease factor penalty
    item.repetition_count = 0;
    item.interval_days = 1;
    item.ease_factor = Math.max(1.3, item.ease_factor - 0.25);
    item.streak = 0;
    item.consecutive_correct = 0;
    item.state = 'learning';
    item.next_review_date = addDaysToDate(today, 1);
  } else {
    // Successful recall (2 = Good, 3 = Easy)
    item.correct_reviews += 1;
    item.consecutive_correct += 1;
    item.streak += 1;
    item.repetition_count += 1;

    // Calculate new interval based on SM-2 formula
    if (item.repetition_count === 1) {
      item.interval_days = rating === 3 ? 2 : 1;
    } else if (item.repetition_count === 2) {
      item.interval_days = rating === 3 ? 5 : 3;
    } else {
      const bonus = rating === 3 ? 1.2 : 1.0;
      item.interval_days = Math.max(1, Math.round(item.interval_days * item.ease_factor * bonus));
    }

    // Adjust ease factor
    if (rating === 3) {
      item.ease_factor = Math.min(3.2, item.ease_factor + 0.15);
    } else {
      item.ease_factor = Math.max(1.3, item.ease_factor - 0.05);
    }

    // Determine state
    if (item.consecutive_correct >= 5 && item.interval_days >= 14) {
      item.state = 'mastered';
    } else if (item.repetition_count >= 1) {
      item.state = 'review';
    } else {
      item.state = 'learning';
    }

    item.next_review_date = addDaysToDate(today, item.interval_days);
  }

  return item;
}

export function isItemDueForReview(item: SRSItem | undefined): boolean {
  if (!item || item.state === 'new') return false;
  const today = getTodayDateString();
  return item.next_review_date <= today;
}

export function getMasteryPercentage(item: SRSItem | undefined): number {
  if (!item || item.total_reviews === 0) return 0;
  if (item.state === 'mastered') return 100;
  
  // Weighted score based on ease factor and consecutive correct
  const score = Math.min(95, Math.round(
    (item.consecutive_correct * 18) + ((item.ease_factor - 1.3) / 1.7) * 20
  ));
  return Math.max(10, score);
}

export function getMasteryBadge(percentage: number): { label: string; color: string; bg: string } {
  if (percentage === 0) return { label: 'Novo', color: 'theme-text-muted text-muted', bg: 'bg-surface-subtle border border-border-subtle' };
  if (percentage < 35) return { label: 'Aprendiz', color: 'text-warning', bg: 'bg-warning-bg border border-warning-border' };
  if (percentage < 70) return { label: 'Praticante', color: 'text-accent-subtle-text', bg: 'bg-accent-subtle border border-accent-subtle-border' };
  if (percentage < 95) return { label: 'Especialista', color: 'text-accent', bg: 'bg-accent-subtle border border-accent-subtle-border' };
  return { label: 'Mestre ★', color: 'text-success', bg: 'bg-success-bg border border-success-border' };
}
