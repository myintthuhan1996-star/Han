// Hidden Consequences System

import { GameState, Incident } from './types';

/**
 * Define hidden consequence rules
 * Maps flags to specific consequences that trigger later
 */
interface ConsequenceRule {
  flag: string;
  triggerPhase: number; // Phase when consequence triggers
  budgetPenalty: number;
  qualityPenalty: number;
  safetyPenalty: number;
  message: string;
}

const CONSEQUENCE_RULES: ConsequenceRule[] = [
  // Foundation issues discovered later
  {
    flag: 'structural_compromised',
    triggerPhase: 4,
    budgetPenalty: 150,
    qualityPenalty: 25,
    safetyPenalty: 20,
    message: 'CRITICAL: Structural integrity issues discovered during MEP installation. Expensive retrofitting required.',
  },
  // Settlement risks manifest
  {
    flag: 'settlement_risk',
    triggerPhase: 3,
    budgetPenalty: 80,
    qualityPenalty: 20,
    safetyPenalty: 10,
    message: 'WARNING: Foundation settlement detected. Additional reinforcement and repairs needed.',
  },
  // Waterproofing failure consequences
  {
    flag: 'waterproofing_failed',
    triggerPhase: 5,
    budgetPenalty: 60,
    qualityPenalty: 15,
    safetyPenalty: 5,
    message: 'ALERT: Water leakage discovered in critical areas. Waterproofing failure requires emergency repairs.',
  },
  // Defects in concrete discovered
  {
    flag: 'honeycomb_defects',
    triggerPhase: 3,
    budgetPenalty: 45,
    qualityPenalty: 12,
    safetyPenalty: 5,
    message: 'DEFECT FOUND: Honeycomb voids discovered in foundation concrete. Repair work required.',
  },
  // Bonding failure consequences
  {
    flag: 'bonding_failure',
    triggerPhase: 2,
    budgetPenalty: 55,
    qualityPenalty: 18,
    safetyPenalty: 8,
    message: 'BONDING FAILURE: Poor concrete-reinforcement bond detected. Quality repair required.',
  },
  // Worker injury leads to inspection
  {
    flag: 'worker_injury',
    triggerPhase: 2,
    budgetPenalty: 25,
    qualityPenalty: 0,
    safetyPenalty: 15,
    message: 'SAFETY INSPECTION: Workplace injury reported. Random safety audit triggered.',
  },
  // Safety violations escalate
  {
    flag: 'safety_violations',
    triggerPhase: 6,
    budgetPenalty: 200,
    qualityPenalty: 0,
    safetyPenalty: 30,
    message: 'VIOLATION: Multiple safety violations detected during final inspection. Heavy fines and corrections required.',
  },
  // Neighbor disputes escalate
  {
    flag: 'neighbor_dispute',
    triggerPhase: 6,
    budgetPenalty: 100,
    qualityPenalty: 5,
    safetyPenalty: 0,
    message: 'LEGAL ISSUE: Neighbor complaint escalated. Settlement and additional work required.',
  },
  // Foundation quality issues
  {
    flag: 'foundation_quality_issues',
    triggerPhase: 4,
    budgetPenalty: 70,
    qualityPenalty: 15,
    safetyPenalty: 10,
    message: 'QUALITY ALERT: Foundation quality issues discovered during structural inspection.',
  },
];

/**
 * Check for hidden consequences based on current phase and flags
 */
export function checkHiddenConsequences(state: GameState): Incident[] {
  const incidents: Incident[] = [];

  for (const rule of CONSEQUENCE_RULES) {
    // Check if flag exists and we've reached the trigger phase
    if (state.hiddenFlags[rule.flag] && state.currentPhase >= rule.triggerPhase) {
      // Prevent same consequence from firing multiple times
      if (!state.incidents.some(inc => inc.message === rule.message)) {
        incidents.push({
          questionId: state.currentQuestion,
          message: rule.message,
          budgetPenalty: rule.budgetPenalty,
          qualityPenalty: rule.qualityPenalty,
          safetyPenalty: rule.safetyPenalty,
        });
      }
    }
  }

  return incidents;
}

/**
 * Apply incident penalties to game state
 */
export function applyIncident(state: GameState, incident: Incident): GameState {
  return {
    ...state,
    budget: state.budget - incident.budgetPenalty,
    qualityScore: Math.max(0, state.qualityScore - incident.qualityPenalty),
    safetyScore: Math.max(0, state.safetyScore - incident.safetyPenalty),
    incidents: [...state.incidents, incident],
  };
}
