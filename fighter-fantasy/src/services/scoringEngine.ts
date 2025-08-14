import { 
  FightResult,
  FantasyTeam,
  TeamPick,
  ScoringBreakdown,
  Event,
  Fighter,
  Fight
} from '@/types';

// Scoring Rules Configuration
export const SCORING_RULES = {
  // Base Points
  participation: 2,
  win: 10,
  loss: -5,
  
  // Finish Bonuses
  ko_tko_bonus: 12,
  submission_bonus: 12,
  decision_bonus: 6,
  
  // Round Bonuses (for finishes)
  round_bonuses: {
    1: 8,
    2: 6,
    3: 4,
    4: 3,
    5: 2
  },
  
  // Performance Points
  knockdown: 3,
  sig_strike: 0.1,
  sig_strike_cap: 10,
  takedown: 2,
  control_time_per_minute: 1,
  submission_attempt: 2,
  submission_attempt_cap: 6,
  
  // Special Bonuses
  title_fight_win_bonus: 5,
  underdog_multipliers: [
    { odds_threshold: 200, multiplier: 1.2 },
    { odds_threshold: 400, multiplier: 1.5 }
  ],
  
  // Penalties
  missed_weight_penalty: -3,
  point_deduction_penalty: -2,
  dq_loss_penalty: -10,
  
  // Multipliers
  captain_multiplier: 1.5,
  ppv_multiplier: 1.5
};

export interface FightStats {
  significant_strikes?: number;
  knockdowns?: number;
  takedowns?: number;
  control_time_seconds?: number;
  submission_attempts?: number;
  point_deductions?: number;
  missed_weight?: boolean;
  performance_bonus?: boolean;
  fight_of_night?: boolean;
}

export interface FighterScoreResult {
  fighter_id: string;
  base_points: number;
  finish_bonus: number;
  round_bonus: number;
  performance_points: number;
  penalties: number;
  underdog_multiplier: number;
  captain_multiplier: number;
  raw_total: number;
  final_total: number;
  breakdown: {
    participation?: number;
    win?: number;
    loss?: number;
    ko_tko?: number;
    submission?: number;
    decision?: number;
    round_finish?: number;
    knockdowns?: number;
    significant_strikes?: number;
    takedowns?: number;
    control_time?: number;
    submission_attempts?: number;
    title_fight_bonus?: number;
    missed_weight?: number;
    point_deductions?: number;
    dq_loss?: number;
  };
}

export interface TeamScoreResult {
  team_id: string;
  fighter_scores: FighterScoreResult[];
  team_raw_total: number;
  ppv_multiplier: number;
  team_final_total: number;
}

/**
 * Calculate score for a single fighter based on fight result
 */
export function calculateFighterScore(
  fightResult: FightResult,
  fighter: Fighter,
  stats: FightStats,
  isCaptain: boolean = false,
  odds?: number
): FighterScoreResult {
  const breakdown: any = {};
  let basePoints = 0;
  let finishBonus = 0;
  let roundBonus = 0;
  let performancePoints = 0;
  let penalties = 0;
  
  // Base Points - Participation
  breakdown.participation = SCORING_RULES.participation;
  basePoints += breakdown.participation;
  
  // Win/Loss Points
  const isWinner = fightResult.winner_id === fighter.id;
  const isDraw = fightResult.method === 'Draw';
  const isDQ = fightResult.method?.includes('DQ');
  
  if (isDraw) {
    // No win/loss points for draw
  } else if (isWinner) {
    breakdown.win = SCORING_RULES.win;
    basePoints += breakdown.win;
  } else {
    breakdown.loss = SCORING_RULES.loss;
    basePoints += breakdown.loss;
    
    // DQ Loss additional penalty
    if (isDQ) {
      breakdown.dq_loss = SCORING_RULES.dq_loss_penalty;
      penalties += breakdown.dq_loss;
    }
  }
  
  // Finish Bonuses (only for winners)
  if (isWinner && !isDraw) {
    const method = fightResult.method?.toLowerCase() || '';
    
    if (method.includes('ko') || method.includes('tko')) {
      breakdown.ko_tko = SCORING_RULES.ko_tko_bonus;
      finishBonus += breakdown.ko_tko;
    } else if (method.includes('submission')) {
      breakdown.submission = SCORING_RULES.submission_bonus;
      finishBonus += breakdown.submission;
    } else if (method.includes('decision')) {
      breakdown.decision = SCORING_RULES.decision_bonus;
      finishBonus += breakdown.decision;
    }
    
    // Round Bonus for finishes (not decisions)
    if (!method.includes('decision') && fightResult.round) {
      const roundBonusValue = SCORING_RULES.round_bonuses[fightResult.round as keyof typeof SCORING_RULES.round_bonuses];
      if (roundBonusValue) {
        breakdown.round_finish = roundBonusValue;
        roundBonus += roundBonusValue;
      }
    }
    
    // Title Fight Bonus
    if (fightResult.is_title_fight) {
      breakdown.title_fight_bonus = SCORING_RULES.title_fight_win_bonus;
      performancePoints += breakdown.title_fight_bonus;
    }
  }
  
  // Performance Points
  if (stats.knockdowns) {
    breakdown.knockdowns = stats.knockdowns * SCORING_RULES.knockdown;
    performancePoints += breakdown.knockdowns;
  }
  
  if (stats.significant_strikes) {
    const sigStrikePoints = Math.min(
      stats.significant_strikes * SCORING_RULES.sig_strike,
      SCORING_RULES.sig_strike_cap
    );
    breakdown.significant_strikes = sigStrikePoints;
    performancePoints += sigStrikePoints;
  }
  
  if (stats.takedowns) {
    breakdown.takedowns = stats.takedowns * SCORING_RULES.takedown;
    performancePoints += breakdown.takedowns;
  }
  
  if (stats.control_time_seconds) {
    const controlMinutes = stats.control_time_seconds / 60;
    breakdown.control_time = controlMinutes * SCORING_RULES.control_time_per_minute;
    performancePoints += breakdown.control_time;
  }
  
  if (stats.submission_attempts) {
    const subAttemptPoints = Math.min(
      stats.submission_attempts * SCORING_RULES.submission_attempt,
      SCORING_RULES.submission_attempt_cap
    );
    breakdown.submission_attempts = subAttemptPoints;
    performancePoints += subAttemptPoints;
  }
  
  // Penalties
  if (stats.missed_weight) {
    breakdown.missed_weight = SCORING_RULES.missed_weight_penalty;
    penalties += breakdown.missed_weight;
  }
  
  if (stats.point_deductions) {
    breakdown.point_deductions = stats.point_deductions * SCORING_RULES.point_deduction_penalty;
    penalties += breakdown.point_deductions;
  }
  
  // Calculate raw total
  const rawTotal = basePoints + finishBonus + roundBonus + performancePoints + penalties;
  
  // Apply underdog multiplier (only for winners)
  let underdogMultiplier = 1;
  if (isWinner && odds && odds > 0) {
    for (const { odds_threshold, multiplier } of SCORING_RULES.underdog_multipliers) {
      if (odds >= odds_threshold) {
        underdogMultiplier = multiplier;
      }
    }
  }
  
  // Apply captain multiplier
  const captainMultiplier = isCaptain ? SCORING_RULES.captain_multiplier : 1;
  
  // Calculate final total: raw * underdog * captain
  const finalTotal = rawTotal * underdogMultiplier * captainMultiplier;
  
  return {
    fighter_id: fighter.id,
    base_points: basePoints,
    finish_bonus: finishBonus,
    round_bonus: roundBonus,
    performance_points: performancePoints,
    penalties,
    underdog_multiplier: underdogMultiplier,
    captain_multiplier: captainMultiplier,
    raw_total: rawTotal,
    final_total: finalTotal,
    breakdown
  };
}

/**
 * Calculate total score for a fantasy team
 */
export function calculateTeamScore(
  team: FantasyTeam,
  fighterScores: FighterScoreResult[],
  event: Event
): TeamScoreResult {
  // Sum all fighter scores
  const teamRawTotal = fighterScores.reduce((sum, score) => sum + score.final_total, 0);
  
  // Apply PPV multiplier if applicable
  const isPPV = event.type === 'PPV' || event.name?.includes('UFC');
  const ppvMultiplier = isPPV ? SCORING_RULES.ppv_multiplier : 1;
  
  const teamFinalTotal = teamRawTotal * ppvMultiplier;
  
  return {
    team_id: team.id,
    fighter_scores: fighterScores,
    team_raw_total: teamRawTotal,
    ppv_multiplier: ppvMultiplier,
    team_final_total: teamFinalTotal
  };
}

/**
 * Process fight results and calculate scores for all teams in an event
 */
export async function processFightResults(
  eventId: string,
  fightResults: FightResult[],
  teams: FantasyTeam[],
  fighters: Fighter[],
  event: Event
): Promise<TeamScoreResult[]> {
  const fighterMap = new Map(fighters.map(f => [f.id, f]));
  const resultsMap = new Map(fightResults.map(r => [r.fight_id, r]));
  const teamScores: TeamScoreResult[] = [];
  
  for (const team of teams) {
    const fighterScores: FighterScoreResult[] = [];
    
    for (const pick of team.picks) {
      const fighter = fighterMap.get(pick.fighter_id);
      if (!fighter) continue;
      
      // Find the fight result for this fighter
      const fightResult = Array.from(resultsMap.values()).find(
        r => r.winner_id === fighter.id || r.loser_id === fighter.id
      );
      
      if (!fightResult) {
        // No result yet, score as 0
        fighterScores.push({
          fighter_id: fighter.id,
          base_points: 0,
          finish_bonus: 0,
          round_bonus: 0,
          performance_points: 0,
          penalties: 0,
          underdog_multiplier: 1,
          captain_multiplier: pick.is_captain ? SCORING_RULES.captain_multiplier : 1,
          raw_total: 0,
          final_total: 0,
          breakdown: {}
        });
        continue;
      }
      
      // Get fighter stats (would come from fight result details)
      const stats: FightStats = {
        // These would be populated from actual fight statistics
        significant_strikes: 0,
        knockdowns: 0,
        takedowns: 0,
        control_time_seconds: 0,
        submission_attempts: 0,
        point_deductions: 0,
        missed_weight: false
      };
      
      // Calculate fighter score
      const fighterScore = calculateFighterScore(
        fightResult,
        fighter,
        stats,
        pick.is_captain,
        fighter.odds
      );
      
      fighterScores.push(fighterScore);
    }
    
    // Calculate team score
    const teamScore = calculateTeamScore(team, fighterScores, event);
    teamScores.push(teamScore);
  }
  
  // Sort by score
  teamScores.sort((a, b) => b.team_final_total - a.team_final_total);
  
  return teamScores;
}

/**
 * Validate fight results JSON structure
 */
export function validateFightResults(results: any[]): boolean {
  if (!Array.isArray(results)) return false;
  
  for (const result of results) {
    if (!result.fight_id || !result.winner_id || !result.loser_id) {
      return false;
    }
    if (!result.method || typeof result.round !== 'number') {
      return false;
    }
  }
  
  return true;
}

/**
 * Generate a detailed scoring breakdown for display
 */
export function generateScoringBreakdown(
  fighterScore: FighterScoreResult,
  fighter: Fighter
): ScoringBreakdown {
  const items: any[] = [];
  const breakdown = fighterScore.breakdown;
  
  // Add each scoring item
  if (breakdown.participation) {
    items.push({ label: 'Participation', points: breakdown.participation });
  }
  if (breakdown.win) {
    items.push({ label: 'Win', points: breakdown.win });
  }
  if (breakdown.loss) {
    items.push({ label: 'Loss', points: breakdown.loss });
  }
  if (breakdown.ko_tko) {
    items.push({ label: 'KO/TKO Finish', points: breakdown.ko_tko });
  }
  if (breakdown.submission) {
    items.push({ label: 'Submission Finish', points: breakdown.submission });
  }
  if (breakdown.decision) {
    items.push({ label: 'Decision Win', points: breakdown.decision });
  }
  if (breakdown.round_finish) {
    items.push({ label: 'Early Finish Bonus', points: breakdown.round_finish });
  }
  if (breakdown.knockdowns) {
    items.push({ label: 'Knockdowns', points: breakdown.knockdowns });
  }
  if (breakdown.significant_strikes) {
    items.push({ label: 'Significant Strikes', points: breakdown.significant_strikes });
  }
  if (breakdown.takedowns) {
    items.push({ label: 'Takedowns', points: breakdown.takedowns });
  }
  if (breakdown.control_time) {
    items.push({ label: 'Control Time', points: breakdown.control_time });
  }
  if (breakdown.submission_attempts) {
    items.push({ label: 'Submission Attempts', points: breakdown.submission_attempts });
  }
  if (breakdown.title_fight_bonus) {
    items.push({ label: 'Title Fight Win', points: breakdown.title_fight_bonus });
  }
  if (breakdown.missed_weight) {
    items.push({ label: 'Missed Weight', points: breakdown.missed_weight });
  }
  if (breakdown.point_deductions) {
    items.push({ label: 'Point Deductions', points: breakdown.point_deductions });
  }
  if (breakdown.dq_loss) {
    items.push({ label: 'DQ Loss', points: breakdown.dq_loss });
  }
  
  // Add multipliers
  if (fighterScore.underdog_multiplier > 1) {
    items.push({ 
      label: `Underdog Multiplier (${fighterScore.underdog_multiplier}x)`, 
      points: 0,
      isMultiplier: true 
    });
  }
  if (fighterScore.captain_multiplier > 1) {
    items.push({ 
      label: `Captain Multiplier (${fighterScore.captain_multiplier}x)`, 
      points: 0,
      isMultiplier: true 
    });
  }
  
  return {
    fighter_name: fighter.name,
    total_points: fighterScore.final_total,
    items
  };
} 