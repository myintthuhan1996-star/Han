import { useState, useEffect } from 'react';
import { phases, allQuestions } from './data/phases';
import {
  GameState,
  processDecision,
  resetGame,
  isGameComplete,
  calculateFinalEvaluation,
  shouldShowWarning,
  isCritical,
  calculateProfit,
  isBehindSchedule,
  getScheduleStatus,
  getBudgetStatus,
  TARGET_BUDGET,
  TARGET_SCHEDULE
} from './game';
import { WARNING_THRESHOLD } from './game/initialState';

function App() {
  const [gameState, setGameState] = useState<GameState>(() => resetGame());
  const [showIncidents, setShowIncidents] = useState(false);

  const currentPhaseData = phases.find(p => p[0].phase_id === gameState.currentPhase);
  const currentQuestionData = allQuestions.find(q => q.id === gameState.currentQuestion);

  // Calculate current profit/loss
  const currentProfit = calculateProfit(gameState);
  const budgetStatus = getBudgetStatus(gameState);
  const scheduleStatus = getScheduleStatus(gameState);

  // Show incident messages when they occur
  useEffect(() => {
    const hasNewIncidents = gameState.incidents.length > 0;
    if (hasNewIncidents) {
      setShowIncidents(true);
      const timer = setTimeout(() => setShowIncidents(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState.incidents.length]);

  const handleDecision = (optionIndex: number) => {
    if (!currentQuestionData || gameState.isGameOver) return;

    const option = currentQuestionData.options[optionIndex];
    const newState = processDecision(gameState, option, currentQuestionData.id, optionIndex);
    setGameState(newState);
  };

  const handleRestart = () => {
    setGameState(resetGame());
  };

  // Metric Card Component
  const MetricCard = ({ title, value, unit, icon, color, status }: {
    title: string;
    value: number;
    unit: string;
    icon: React.ReactNode;
    color: string;
    status?: string;
  }) => (
    <div className="bg-slate-800 rounded-lg p-4 md:p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        <div className={`${color}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-bold text-white">{value.toLocaleString()}</span>
        <span className="text-slate-400 text-sm">{unit}</span>
      </div>
      {status && (
        <p className="text-xs text-slate-500 mt-1">{status}</p>
      )}
    </div>
  );

  // Progress Bar Component
  const ProgressBar = ({ value, label, color }: { value: number; label: string; color: string }) => (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs text-slate-400">{value}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
      {shouldShowWarning(value) && (
        <p className="text-xs text-orange-400 mt-1 font-medium">⚠ Warning: Below safe threshold</p>
      )}
    </div>
  );

  // Game Over Screen
  if (gameState.isGameOver && !isGameComplete(gameState)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="bg-slate-900 rounded-lg p-8 border-2 border-red-700">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-6">⛔</div>
              <h1 className="text-4xl font-bold mb-4 text-red-500">PROJECT SHUT DOWN</h1>
              <p className="text-slate-300 mb-8">{gameState.gameOverReason}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-800 rounded p-4">
                  <p className="text-slate-400 text-sm mb-1">Final Profit/Loss</p>
                  <p className={`text-2xl font-bold ${currentProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {currentProfit >= 0 ? '+' : ''}{currentProfit.toFixed(1)}L
                  </p>
                </div>
                <div className="bg-slate-800 rounded p-4">
                  <p className="text-slate-400 text-sm mb-1">Quality</p>
                  <p className={`text-2xl font-bold ${gameState.qualityScore < 30 ? 'text-red-400' : 'text-orange-400'}`}>
                    {gameState.qualityScore}%
                  </p>
                </div>
                <div className="bg-slate-800 rounded p-4">
                  <p className="text-slate-400 text-sm mb-1">Safety</p>
                  <p className={`text-2xl font-bold ${gameState.safetyScore < 30 ? 'text-red-400' : 'text-orange-400'}`}>
                    {gameState.safetyScore}%
                  </p>
                </div>
                <div className="bg-slate-800 rounded p-4">
                  <p className="text-slate-400 text-sm mb-1">Progress</p>
                  <p className="text-2xl font-bold">{gameState.currentQuestion - 1}/60</p>
                </div>
              </div>

              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Complete Screen
  if (isGameComplete(gameState)) {
    const evaluation = calculateFinalEvaluation(gameState);
    const finalProfit = calculateProfit(gameState);

    return (
      <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏆</div>
              <h1 className="text-4xl font-bold mb-2">Project Complete</h1>
              <p className="text-slate-400">Final Performance Grade</p>
              <p className={`text-5xl font-bold mt-4 ${
                evaluation.score >= 90 ? 'text-amber-400' :
                evaluation.score >= 75 ? 'text-emerald-400' :
                evaluation.score >= 60 ? 'text-blue-400' :
                evaluation.score >= 40 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {evaluation.grade}
              </p>
              <p className="text-2xl text-slate-300 mt-2">{Math.round(evaluation.score)} points</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-800 rounded p-4">
                <p className="text-slate-400 text-sm mb-1">Profit/Loss</p>
                <p className={`text-xl font-bold ${finalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {finalProfit >= 0 ? '+' : ''}{finalProfit.toFixed(1)} Lakhs
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Target: {TARGET_BUDGET}L | Final: {gameState.budget.toFixed(1)}L
                </p>
              </div>
              <div className="bg-slate-800 rounded p-4">
                <p className="text-slate-400 text-sm mb-1">Schedule Status</p>
                <p className={`text-xl font-bold ${gameState.timeInDays <= TARGET_SCHEDULE ? 'text-blue-400' : 'text-orange-400'}`}>
                  {gameState.timeInDays} / {TARGET_SCHEDULE} days
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Target: {TARGET_SCHEDULE} days | {scheduleStatus}
                </p>
              </div>
              <div className="bg-slate-800 rounded p-4">
                <p className="text-slate-400 text-sm mb-1">Quality Score</p>
                <p className="text-xl font-bold text-amber-400">{evaluation.qualityFinal}%</p>
              </div>
              <div className="bg-slate-800 rounded p-4">
                <p className="text-slate-400 text-sm mb-1">Safety Score</p>
                <p className="text-xl font-bold text-red-400">{evaluation.safetyFinal}%</p>
              </div>
            </div>

            <div className="bg-slate-800 rounded p-4 mb-8">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Performance Breakdown</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>Profit Performance: <span className="text-white">{Math.round(evaluation.budgetPerformance)}%</span></div>
                <div>Speed Performance: <span className="text-white">{Math.round(evaluation.timePerformance)}%</span></div>
                <div>Quality Maintenance: <span className="text-white">{evaluation.qualityFinal}%</span></div>
                <div>Safety Maintenance: <span className="text-white">{evaluation.safetyFinal}%</span></div>
              </div>
            </div>

            {gameState.incidents.length > 0 && (
              <div className="bg-slate-800 rounded p-4 mb-8">
                <p className="text-slate-400 text-sm mb-2">Incidents Encountered: {gameState.incidents.length}</p>
                <ul className="text-sm text-slate-300 space-y-1">
                  {gameState.incidents.map((incident, idx) => (
                    <li key={idx}>• {incident.message.split(':')[0]}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={handleRestart}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
              >
                Start New Project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Gameplay UI
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Incident Notifications */}
        {showIncidents && gameState.incidents.length > 0 && (
          <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50">
            {gameState.incidents.map((incident, idx) => (
              <div key={idx} className="bg-red-900 border border-red-700 rounded-lg p-4 mb-2 shadow-lg">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{incident.message}</p>
                    <p className="text-red-300 text-xs mt-1">
                      Budget: -{incident.budgetPenalty}L | Quality: -{incident.qualityPenalty}% | Safety: -{incident.safetyPenalty}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Construction Project Manager</h1>
              <p className="text-slate-400 text-sm mt-1">
                Phase {gameState.currentPhase}: {currentPhaseData?.[0].phase_name.split(':')[1]}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 text-sm">Scenario</span>
                <span className="text-white font-semibold ml-2">{gameState.currentQuestion}/60</span>
              </div>
            </div>
          </div>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <MetricCard
            title="Budget"
            value={parseFloat(gameState.budget.toFixed(1))}
            unit="Lakhs"
            color={currentProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}
            status={budgetStatus}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <MetricCard
            title="Time"
            value={gameState.timeInDays}
            unit="days"
            color={isBehindSchedule(gameState) ? 'text-orange-400' : 'text-blue-400'}
            status={scheduleStatus}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <MetricCard
            title="Quality"
            value={gameState.qualityScore}
            unit="%"
            color={`${isCritical(gameState.qualityScore) ? 'text-red-500' : shouldShowWarning(gameState.qualityScore) ? 'text-orange-400' : 'text-amber-400'}`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
          />
          <MetricCard
            title="Safety"
            value={gameState.safetyScore}
            unit="%"
            color={`${isCritical(gameState.safetyScore) ? 'text-red-500' : shouldShowWarning(gameState.safetyScore) ? 'text-orange-400' : 'text-red-400'}`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        {/* Target Goals Display */}
        <div className="bg-slate-900 rounded-lg p-4 border border-slate-800 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">Target Budget</p>
              <p className="text-lg font-bold text-slate-200">{TARGET_BUDGET}L</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Target Schedule</p>
              <p className="text-lg font-bold text-slate-200">{TARGET_SCHEDULE} days</p>
            </div>
          </div>
        </div>

        {/* Progress Bars with Warnings */}
        <div className="bg-slate-900 rounded-lg p-4 md:p-6 border border-slate-800 mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ProgressBar
              value={gameState.qualityScore}
              label="Quality Score"
              color={
                gameState.qualityScore < 30 ? "bg-red-500" :
                gameState.qualityScore < WARNING_THRESHOLD ? "bg-orange-500" : "bg-emerald-500"
              }
            />
            <ProgressBar
              value={gameState.safetyScore}
              label="Safety Score"
              color={
                gameState.safetyScore < 30 ? "bg-red-500" :
                gameState.safetyScore < WARNING_THRESHOLD ? "bg-orange-500" : "bg-emerald-500"
              }
            />
          </div>
        </div>

        {/* Scenario Card */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 mb-6 md:mb-8 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-slate-800 bg-slate-800/50">
            <h2 className="text-lg font-semibold text-white">Scenario #{currentQuestionData?.id}</h2>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6">
              {currentQuestionData?.scenario}
            </p>

            {/* Budget and Time Indicators */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-800/50 rounded-lg">
              <div>
                <p className="text-xs text-slate-400 mb-1">Planned Budget</p>
                <p className="text-lg font-bold text-emerald-400">₹{currentQuestionData?.planned_budget}L</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Planned Duration</p>
                <p className="text-lg font-bold text-blue-400">{currentQuestionData?.planned_days} days</p>
              </div>
            </div>

            {/* Options - NO NUMERICAL IMPACTS SHOWN */}
            <div className="space-y-3">
              {currentQuestionData?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleDecision(index)}
                  className="w-full text-left p-4 bg-slate-800 hover:bg-slate-750 border border-slate-700
                           hover:border-slate-600 rounded-lg transition-all duration-200 group"
                >
                  <p className="text-slate-200 group-hover:text-white transition-colors">
                    {option.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phase Progress */}
        <div className="hidden md:block bg-slate-900 rounded-lg p-4 border border-slate-800">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Construction Progress</h3>
          <div className="flex items-center gap-2">
            {phases.map((phase, index) => (
              <div key={phase[0].phase_id} className="flex-1">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      phase[0].phase_id < gameState.currentPhase
                        ? 'bg-emerald-500'
                        : phase[0].phase_id === gameState.currentPhase
                        ? 'bg-blue-500'
                        : 'bg-slate-700'
                    }`}
                    style={{
                      width: phase[0].phase_id < gameState.currentPhase
                        ? '100%'
                        : phase[0].phase_id === gameState.currentPhase
                        ? '50%'
                        : '0%'
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">Phase {index + 1}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
