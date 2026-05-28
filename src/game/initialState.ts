// Initial Game State Configuration

import { GameState } from './types';

// Target values for project performance
import { allQuestions } from '../data/phases';

export const TARGET_BUDGET =
  allQuestions.reduce(
    (sum, q) => sum + q.planned_budget,
    0
  );

export const TARGET_SCHEDULE =
  allQuestions.reduce(
    (sum, q) => sum + q.planned_days,
    0
  );

export const INITIAL_GAME_STATE: GameState = {
  budget: TARGET_BUDGET, // Starting budget equals target budget
  timeInDays: 0, // Starting time
  qualityScore: 100, // Starting quality (0-100)
  safetyScore: 100, // Starting safety (0-100)
  currentPhase: 1, // Current construction phase (1-6)
  currentQuestion: 1, // Current scenario (1-60)
  decisions: [], // Player decision history
  hiddenFlags: {}, // Hidden consequence flags
  isGameOver: false, // Game over state
  gameOverReason: undefined,
  incidents: [], // Incident messages for player
};

// Minimum threshold before game over
export const CRITICAL_THRESHOLD = 30;

// Warning threshold
export const WARNING_THRESHOLD = 70;

// Total number of questions
export const TOTAL_QUESTIONS = 60;

// Total number of phases
export const TOTAL_PHASES = 6;

// Questions per phase
export const QUESTIONS_PER_PHASE = 10;
