// Main Game Engine - Core Logic Functions (SIMPLIFIED)

import { GameState, Decision, GameOption } from './types';
import { INITIAL_GAME_STATE, QUESTIONS_PER_PHASE } from './initialState';
import { checkGameOver, getGameOverReason } from './evaluator';

/**
 * Process a player's decision and update game state
 * SIMPLIFIED: Direct impacts only, no hidden consequences
 */
export function processDecision(
  currentState: GameState,
  option: GameOption,
  questionId: number,
  optionIndex: number
): GameState {
  // Get impacts from option (with safe defaults)
  const budgetImpact = Number(option.budget_impact) || 0;
  const scheduleImpact = Number(option.schedule_impact) || 0;
  const qualityImpact = Number(option.quality_impact) || 0;
  const safetyImpact = Number(option.safety_impact) || 0;

  // Create decision record
  const decision: Decision = {
    questionId,
    optionIndex,
    budgetImpact,
    scheduleImpact,
    qualityImpact,
    safetyImpact,
    timestamp: Date.now(),
  };

  // Calculate new values (SIMPLIFIED - direct calculation only)
  const newBudget = currentState.budget - budgetImpact; // Deduct budget
  const newTime = currentState.timeInDays + scheduleImpact; // Add time
  const newQuality = Math.max(0, Math.min(100, currentState.qualityScore + qualityImpact));
  const newSafety = Math.max(0, Math.min(100, currentState.safetyScore + safetyImpact));

  // Create new state
  const newState: GameState = {
    ...currentState,
    budget: newBudget,
    timeInDays: newTime,
    qualityScore: newQuality,
    safetyScore: newSafety,
    decisions: [...currentState.decisions, decision],
    // Temporarily disable hidden flags
    hiddenFlags: {},
    incidents: [],
  };

  // Move to next question
  const nextQuestion = questionId + 1;
  newState.currentQuestion = nextQuestion;

  // Update phase if needed (10 questions per phase)
  const nextPhase = Math.ceil(nextQuestion / QUESTIONS_PER_PHASE);
  if (nextPhase <= 6) {
    newState.currentPhase = nextPhase;
  }

  // Check for immediate game over (quality < 30 OR safety < 30)
  if (checkGameOver(newState)) {
    newState.isGameOver = true;
    newState.gameOverReason = getGameOverReason(newState);
  }

  return newState;
}

/**
 * Reset game to initial state
 */
export function resetGame(): GameState {
  return { ...INITIAL_GAME_STATE };
}

/**
 * Check if game is complete (all 60 questions answered)
 */
export function isGameComplete(state: GameState): boolean {
  return state.currentQuestion > 60;
}
