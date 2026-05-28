// Game Module Exports

export * from './types';
export * from './initialState';
export * from './engine';
export * from './evaluator';
export * from './consequences';

// Additional utility exports
export {
  calculateProfit,
  isOverBudget,
  isBehindSchedule,
  getScheduleStatus,
  getBudgetStatus
} from './evaluator';

export {
  TARGET_BUDGET,
  TARGET_SCHEDULE
} from './initialState';
