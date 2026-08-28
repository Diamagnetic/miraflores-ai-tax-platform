import { TaxReturn } from '@/types';

/**
 * Calculates a dynamic, deterministic triage priority score (0-100) for a tax return.
 * Higher score = higher urgency in CPA dashboard queue.
 */
export function calculateTriageScore(ret: TaxReturn): number {
  let score = 50;

  // 1. Deadline Proximity Factor
  const today = new Date('2026-03-01T00:00:00Z');
  const dueDate = new Date(`${ret.dueDate}T00:00:00Z`);
  const daysRemaining = Math.max(0, Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  if (daysRemaining <= 15) {
    score += 30; // Critical deadline window
  } else if (daysRemaining <= 30) {
    score += 18;
  } else if (daysRemaining <= 45) {
    score += 8;
  }

  // 2. Active Blocker Penalty / Urgency
  if (ret.isBlocked) {
    score += 15;
  }

  // 3. Status Phase Weights
  switch (ret.status) {
    case 'REVIEW':
      score += 20; // Ready for partner sign-off
      break;
    case 'PREPARATION':
      score += 12;
      break;
    case 'EXTRACTION':
      score += 8;
      break;
    case 'CLIENT_SIGN':
      score += 6;
      break;
    case 'INTAKE':
      score += 4;
      break;
    case 'E_FILED':
    case 'ACCEPTED':
      score = 10; // Completed
      break;
  }

  // 4. Open Issues Count
  score += Math.min(15, ret.openIssueCount * 4);

  // 5. High Volume / Complexity Factor
  if (ret.documentCount > 50) {
    score += 8;
  }

  return Math.min(100, Math.max(1, score));
}

export type TriageUrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export function getTriageUrgency(score: number): TriageUrgencyLevel {
  if (score >= 90) return 'CRITICAL';
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
}

export function getUrgencyBadgeStyle(urgency: TriageUrgencyLevel): {
  variant: 'destructive' | 'warning' | 'verified' | 'secondary';
  label: string;
  className: string;
} {
  switch (urgency) {
    case 'CRITICAL':
      return {
        variant: 'destructive',
        label: 'Critical Due',
        className: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
      };
    case 'HIGH':
      return {
        variant: 'warning',
        label: 'High Priority',
        className: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
      };
    case 'MEDIUM':
      return {
        variant: 'secondary',
        label: 'Normal Flow',
        className: 'bg-slate-100 text-slate-700 border-slate-200',
      };
    case 'LOW':
      return {
        variant: 'verified',
        label: 'On Track',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
  }
}
