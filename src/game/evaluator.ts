// Game Evaluation System

import { GameState, GameGrade, FinalEvaluation } from './types';
import { TARGET_BUDGET, TARGET_SCHEDULE } from './initialState';

/**
 * Calculate the final performance grade based on all metrics
 *
 * Scoring Philosophy:
 * - Balanced management scores highest
 * - Cheap risky decisions are heavily penalized
 * - Delays are penalized
 * - Profit is rewarded but not at cost of safety/quality
 */
export function calculateFinalEvaluation(state: GameState): FinalEvaluation {
  // Calculate profit (remaining budget)
  const profit = state.budget;

  // Profit Performance: How much budget remained (higher is better)
  // 100% = stayed at target budget
  // >100% = saved money (impressive!)
  // <100% = went over budget
  const profitPerformance = profit >= 0
    ? Math.min(100, (profit / TARGET_BUDGET) * 100)
    : 0; // If negative budget, performance is 0

  // Schedule Performance: How close to target schedule (lower is better)
  // 100% = finished exactly on target
  // <100% = finished early (bonus points)
  // >100% = finished late (penalty)
  const schedulePerformance = state.timeInDays <= TARGET_SCHEDULE
    ? Math.min(100, (TARGET_SCHEDULE / Math.max(state.timeInDays, 1)) * 100)
    : Math.max(0, 100 - ((state.timeInDays - TARGET_SCHEDULE) / TARGET_SCHEDULE) * 50);

  // Quality and Safety final scores
  const qualityFinal = state.qualityScore;
  const safetyFinal = state.safetyScore;

  // BALANCED MANAGEMENT SCORING
  // Calculate balance score - reward maintaining all metrics equally

  // Perfect balance: All metrics at 100
  // Imbalanced play: Some metrics very high, others very low
  const metrics = [profitPerformance, schedulePerformance, qualityFinal, safetyFinal];
  const avgMetric = metrics.reduce((a, b) => a + b, 0) / 4;

  // Calculate variance (measure of imbalance)
  const variance = metrics.reduce((sum, metric) => {
    return sum + Math.pow(metric - avgMetric, 2);
  }, 0) / 4;

  // Balance bonus: Lower variance = higher bonus
  // Maximum bonus of 10 points for perfect balance
  const balanceBonus = Math.max(0, 10 - (variance / 100));

  // PENALTY FOR EXTREME RISK-TAKING
  // If quality or safety dropped below 50, apply heavy penalty
  const riskPenalty = (qualityFinal < 50 ? 10 : 0) + (safetyFinal < 50 ? 10 : 0);

  // PENALTY FOR MAJOR DELAYS
  // If more than 30% over schedule, apply penalty
  const delayPenalty = state.timeInDays > (TARGET_SCHEDULE * 1.3)
    ? ((state.timeInDays - TARGET_SCHEDULE * 1.3) / TARGET_SCHEDULE) * 20
    : 0;

  // Calculate overall score (weighted average + balance bonus - penalties)
  const baseScore = (
    (profitPerformance * 0.25) +   // 25% weight: Profit matters
    (schedulePerformance * 0.20) + // 20% weight: Schedule matters
    (qualityFinal * 0.30) +        // 30% weight: Quality is crucial
    (safetyFinal * 0.25)           // 25% weight: Safety is crucial
  );

  const score = Math.max(0, Math.min(100,
    baseScore + balanceBonus - riskPenalty - delayPenalty
  ));

  // Determine grade based on score
  const grade: GameGrade = getGradeFromScore(score);

  return {
    grade,
    score,
    budgetPerformance: profitPerformance,
    timePerformance: schedulePerformance,
    qualityFinal,
    safetyFinal,
  };
}

/**
 * Get grade label from numerical score
 */
function getGradeFromScore(score: number): GameGrade {
  if (score >= 90) return 'Legendary Contractor';
  if (score >= 75) return 'Professional Engineer';
  if (score >= 60) return 'Average Contractor';
  if (score >= 40) return 'Risky Builder';
  return 'Failed Project';
}

/**
 * Check if game should end due to critical conditions
 */
export function checkGameOver(state: GameState): boolean {
  return state.qualityScore < 30 || state.safetyScore < 30;
}

/**
 * Get reason for game over
 */
export function getGameOverReason(state: GameState): string {
  if (state.qualityScore < 30 && state.safetyScore < 30) {
    return 'Project Shut Down: Both quality and safety below critical threshold';
  }
  if (state.qualityScore < 30) {
    return 'Project Shut Down: Quality below critical threshold';
  }
  if (state.safetyScore < 30) {
    return 'Project Shut Down: Safety below critical threshold';
  }
  return 'Project Complete';
}

/**
 * Check if a warning should be shown
 */
export function shouldShowWarning(score: number): boolean {
  return score < 70 && score >= 30;
}

/**
 * Check if score is critical
 */
export function isCritical(score: number): boolean {
  return score < 30;
}

/**
 * Calculate how much budget remains (profit or loss)
 */
export function calculateProfit(state: GameState): number {
  return state.budget;
}

/**
 * Check if player is over budget
 */
export function isOverBudget(state: GameState): boolean {
  return state.budget < 0;
}

/**
 * Check if player is behind schedule
 */
export function isBehindSchedule(state: GameState): boolean {
  return state.timeInDays > TARGET_SCHEDULE;
}

/**
 * Get schedule status message
 */
export function getScheduleStatus(state: GameState): string {
  const daysOver = state.timeInDays - TARGET_SCHEDULE;
  if (daysOver <= 0) {
    return `${Math.abs(daysOver)} days ahead`;
  } else {
    return `${daysOver} days behind`;
  }
}

/**
 * Get budget status message
 */
export function getBudgetStatus(state: GameState): string {
  if (state.budget >= TARGET_BUDGET) {
    return `${(state.budget - TARGET_BUDGET).toFixed(1)} Lakhs saved`;
  } else if (state.budget >= 0) {
    return `${(TARGET_BUDGET - state.budget).toFixed(1)} Lakhs over budget`;
  } else {
    return `${Math.abs(state.budget).toFixed(1)} Lakhs deficit`;
  }
}
