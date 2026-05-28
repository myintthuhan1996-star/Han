# Construction Simulator - Game Logic Documentation

## Project Performance Management System

### TARGET VALUES
- **Target Budget**: 1992.5 Lakhs
- **Target Schedule**: 177 Days

### CORE GAMEPLAY GOAL
This is a **management simulator**, not a quiz game. Players must:
- Finish on schedule (within 177 days)
- Keep profit remaining (budget ≥ 1992.5L)
- Maintain quality standards (≥70%)
- Maintain safety standards (≥70%)

## Core Game Systems

### 1. State Management
All game state is managed through the `GameState` interface in `src/game/types.ts`.

**Initial Values:**
- Budget: 1992.5 Lakhs (equals target)
- Time: 0 days
- Quality: 100%
- Safety: 100%

### 2. Game Flow

**Scenario Progression:**
- 60 total scenarios across 6 phases
- 10 scenarios per phase
- Player makes one decision per scenario

**Decision Processing (`processDecision` function):**
1. Apply budget impact (+/- value in thousands)
2. Apply time impact (+days)
3. Apply quality impact (+/- percentage)
4. Apply safety impact (+/- percentage)
5. Store any hidden consequence flags
6. Check for hidden consequences
7. Move to next scenario
8. Check for game over conditions

### 3. Warning System

**Quality/Safety Warnings:**
- Below 70%: Orange warning displayed
- Below 30%: Immediate game over (Project Shut Down)

### 4. Hidden Consequence System

**How it Works:**
- Certain option choices contain `hidden_flags`
- Flags are stored in game state
- Consequences trigger in later phases automatically
- Example: Poor waterproofing in Phase 3 triggers water damage in Phase 5

**Available Flags:**
- `structural_compromised` - Triggers retrofitting costs in Phase 4
- `waterproofing_failed` - Triggers water damage in Phase 5
- `safety_violations` - Triggers inspection failures in Phase 6
- `honeycomb_defects` - Triggers repair costs in Phase 3
- `bonding_failure` - Triggers structural repairs in Phase 2
- `settlement_risk` - Triggers foundation issues in Phase 3

### 5. Immediate Game Over

**Triggers:**
- Quality < 30%
- OR Safety < 30%

**Result:**
- "Project Shut Down" message
- Final statistics shown
- Game stops immediately

### 6. Final Evaluation System

**Balanced Management Scoring Philosophy:**
- **Rewards balanced decisions** - maintaining all metrics equally
- **Punishes cheap risky decisions** - heavy penalties for quality/safety < 50%
- **Punishes delays** - penalties for >30% over schedule
- **Avoids fake calculations** - all metrics based on actual performance

**Scoring Components:**

**Base Weighted Score (100 points max):**
```
Base Score = (Profit Performance × 25%) +   // Profit matters
             (Schedule Performance × 20%) +   // Speed matters
             (Quality Score × 30%) +        // Quality is crucial
             (Safety Score × 25%)            // Safety is crucial
```

**Balance Bonus (up to +10 points):**
- Measures variance across all metrics
- Lower variance = higher balance bonus
- Perfect balance (all metrics equal) = +10 points

**Risk Penalties (deductions):**
- Quality < 50%: -10 points
- Safety < 50%: -10 points
- Schedule > 30% over target: Additional -20 points

**Final Score Calculation:**
```
Final Score = Base Score + Balance Bonus - Risk Penalties
```

**Grades:**
- 90+ points: Legendary Contractor
- 75-89 points: Professional Engineer
- 60-74 points: Average Contractor
- 40-59 points: Risky Builder
- Below 40: Failed Project

**Performance Calculations:**
- **Profit Performance**: (remaining budget / target budget) × 100
  - 100% = stayed at target
  - >100% = saved money
  - <100% = over budget

- **Time Performance**: (target schedule / actual schedule) × 100
  - 100% = finished on time
  - >100% = finished early (bonus)
  - <100% = finished late (penalty)

- **Quality Final**: Ending quality percentage (0-100)
- **Safety Final**: Ending safety percentage (0-100)

## Module Structure

```
src/game/
├── types.ts            # All TypeScript interfaces
├── initialState.ts     # Initial game state and constants
├── engine.ts          # Core game logic (decision processing)
├── evaluator.ts       # Final evaluation and game over checks
├── consequences.ts    # Hidden consequence system
└── index.ts           # Module exports
```

## Data Structure

```
src/data/phases/
├── phase1.json through phase6.json  # 10 questions each
└── index.ts                          # Data access functions
```

**Question Format:**
Each question has:
- `id`: Unique question ID (1-60)
- `scenario`: The problem description
- `planned_budget`: Expected budget (K)
- `planned_days`: Expected duration
- `options`: Array of 3 choices with:
  - `text`: Option description
  - `budget_impact`: Cost change (negative = cost, positive = gain)
  - `schedule_impact`: Days added
  - `quality_impact`: Quality percentage change
  - `safety_impact`: Safety percentage change
  - `hidden_flags`: Optional consequence triggers

## Key Features

✅ Professional performance management system
✅ Target budget: 1992.5 Lakhs
✅ Target schedule: 177 days
✅ Budget tracking with real-time profit/loss display
✅ Schedule tracking with ahead/behind status
✅ Quality score with warnings
✅ Safety score with warnings
✅ Hidden consequence system (9 different flags)
✅ Immediate game over on critical failures
✅ Balanced management scoring system
✅ Final performance evaluation
✅ 5-tier grading system
✅ Incident notification system
✅ Clean, modular architecture
✅ Beginner-friendly code
✅ Type-safe with TypeScript

## Notes for Developers

1. **Management Simulator** - This is NOT a quiz game
2. **Balanced Scoring** - All metrics weighted equally
3. **Real Targets** - 1992.5L budget, 177 days schedule
4. **Profit Focus** - Remaining budget = profit
5. **Schedule Focus** - On-time completion is crucial
6. **Quality & Safety** - Both must be maintained ≥70%
7. **Modular Design** - Each system in separate file
8. **Reusable Functions** - All logic functions are pure
9. **Beginner-Friendly** - Clear comments, simple patterns
10. **Type-Safe** - All state typed with interfaces
11. **Deterministic** - Same choices = same results
12. **No Hidden Random** - All impacts defined in JSON
