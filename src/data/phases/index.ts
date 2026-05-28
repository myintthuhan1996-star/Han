import phase1 from './phase1.json';
import phase2 from './phase2.json';
import phase3 from './phase3.json';
import phase4 from './phase4.json';
import phase5 from './phase5.json';
import phase6 from './phase6.json';

export const phases = [phase1, phase2, phase3, phase4, phase5, phase6];

export const allQuestions = phases.flatMap(phase => phase[0].questions);

export const getPhaseById = (phaseId: number) => phases.find(p => p[0].phase_id === phaseId);

export const getQuestionById = (questionId: number) => allQuestions.find(q => q.id === questionId);
