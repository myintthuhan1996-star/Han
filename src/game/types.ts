// Game Types and Interfaces

export interface GameOption {
  text: string;
  budget_impact: number;
  schedule_impact: number;
  quality_impact?: number;
  safety_impact?: number;
  hidden_flags?: Record<string, boolean>;
}

export interface Question {
  id: number;
  scenario: string;
  planned_budget: number;
  planned_days: number;
  options: GameOption[];
}

export interface Phase {
  phase_id: number;
  phase_name: string;
  questions: Question[];
}

export interface Decision {
  questionId: number;
  optionIndex: number;
  budgetImpact: number;
  scheduleImpact: number;
  qualityImpact: number;
  safetyImpact: number;
  timestamp: number;
}

export interface GameState {
  budget: number;
  timeInDays: number;
  qualityScore: number;
  safetyScore: number;
  currentPhase: number;
  currentQuestion: number;
  decisions: Decision[];
  hiddenFlags: Record<string, boolean>;
  isGameOver: boolean;
  gameOverReason?: string;
  incidents: Incident[];
}

export interface Incident {
  questionId: number;
  message: string;
  budgetPenalty: number;
  qualityPenalty: number;
  safetyPenalty: number;
}

export type GameGrade =
  | 'Legendary Contractor'
  | 'Professional Engineer'
  | 'Average Contractor'
  | 'Risky Builder'
  | 'Failed Project';

export interface FinalEvaluation {
  grade: GameGrade;
  score: number;
  budgetPerformance: number;
  timePerformance: number;
  qualityFinal: number;
  safetyFinal: number;
}
