import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { 
  League, 
  FantasyTeam, 
  FighterSalary, 
  TeamPick,
  Event,
  Fighter,
  Fight,
  ScoringRules
} from '@/types';

// Default scoring rules
export const DEFAULT_SCORING_RULES: ScoringRules = {
  // Base Points
  win: 100,
  loss: 25,
  draw: 50,
  no_contest: 25,
  
  // Method Bonuses
  ko_tko_bonus: 50,
  submission_bonus: 75,
  
  // Round Bonuses
  round_1_bonus: 100,
  round_2_bonus: 75,
  round_3_bonus: 50,
  
  // Performance Bonuses
  fight_of_the_night: 50,
  performance_of_the_night: 75,
  
  // Strike Bonuses
  sig_strikes_per_point: 2,
  knockdown_bonus: 25,
  
  // Grappling Bonuses
  takedown_bonus: 5,
  submission_attempt_bonus: 3,
  reversal_bonus: 10,
  control_time_per_point: 60,
  
  // Penalties
  point_deduction_penalty: -25,
  missed_weight_penalty: -50,
  
  // Underdog Multipliers
  underdog_multipliers: [
    { odds_threshold: 200, multiplier: 1.5 },
    { odds_threshold: 300, multiplier: 1.75 },
    { odds_threshold: 400, multiplier: 2.0 }
  ]
};

// ============================================
// LEAGUE FUNCTIONS
// ============================================

export async function getLeaguesByEvent(eventId: string): Promise<League[]> {
  try {
    const q = query(
      collection(db, 'leagues'),
      where('event_id', '==', eventId),
      where('status', 'in', ['open', 'locked'])
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as League));
  } catch (error: any) {
    // Check if it's a permissions error or if collection doesn't exist
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied accessing leagues. Collection might not exist yet.');
    } else {
      console.error('Error fetching leagues:', error);
    }
    return [];
  }
}

export async function getLeague(leagueId: string): Promise<League | null> {
  try {
    const docRef = doc(db, 'leagues', leagueId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as League;
    }
    return null;
  } catch (error) {
    console.error('Error fetching league:', error);
    return null;
  }
}

export async function createGlobalLeague(event: Event): Promise<League | null> {
  try {
    const leagueId = `league_global_${event.id}`;
    
    // First check if it already exists
    const existingLeague = await getLeague(leagueId);
    if (existingLeague) {
      return existingLeague;
    }
    
    // If it doesn't exist, we'll create a mock league object for now
    // In production, this would be created by an admin or backend process
    const league: League = {
      id: leagueId,
      name: `${event.name} Global Championship`,
      type: 'global',
      mode: 'weekly',
      event_id: event.id,
      settings: {
        budget: 10000,
        team_size: 5,
        max_from_same_fight: 1,
        lock_time_minutes_before: 15,
        allow_captain: true,
        captain_multiplier: 1.5,
        apply_ppv_multiplier: event.type === 'PPV',
        ppv_multiplier: 1.5
      },
      scoring_system: 'standard',
      total_entries: 0,
      max_entries: null,
      entry_fee: 0,
      prize_pool: 0,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Try to create it, but if we don't have permission, just return the mock
    try {
      await setDoc(doc(db, 'leagues', leagueId), league);
    } catch (writeError: any) {
      if (writeError?.code === 'permission-denied') {
        console.log('Using mock league - admin needs to create the actual league');
        // Return the mock league object so the UI can still work
        return league;
      }
      throw writeError;
    }
    
    return league;
  } catch (error) {
    console.error('Error creating global league:', error);
    return null;
  }
}

// ============================================
// SALARY FUNCTIONS
// ============================================

export async function getSalariesByEvent(eventId: string): Promise<FighterSalary[]> {
  try {
    const q = query(
      collection(db, 'salaries'),
      where('event_id', '==', eventId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FighterSalary));
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return [];
  }
}

export async function generateSalariesForEvent(
  eventId: string, 
  fights: Fight[], 
  fighters: Fighter[]
): Promise<FighterSalary[]> {
  try {
    const salaries: FighterSalary[] = [];
    
    for (const fighter of fighters) {
      const fight = fights.find(
        f => f.fighter_a_id === fighter.id || f.fighter_b_id === fighter.id
      );
      
      if (!fight) continue;
      
      const salary = calculateFighterSalary(fighter, fight, fights);
      const fighterId = fighter.id;
      
      const fighterSalary: FighterSalary = {
        id: `${eventId}_${fighterId}`,
        event_id: eventId,
        fighter_id: fighterId,
        salary: salary.amount,
        factors: salary.factors,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      salaries.push(fighterSalary);
      
      // Only try to save to Firestore if we're in an admin context
      // For now, we'll skip saving and just return the calculated salaries
      // This avoids permission errors when regular users access the team builder
      
      // Commented out to prevent permission errors:
      // await setDoc(
      //   doc(db, 'salaries', fighterSalary.id), 
      //   fighterSalary
      // );
    }
    
    return salaries;
  } catch (error) {
    console.error('Error generating salaries:', error);
    return [];
  }
}

function calculateFighterSalary(
  fighter: Fighter, 
  fight: Fight, 
  allFights: Fight[]
): { amount: number; factors: any } {
  let baseScore = 1000;
  const factors = {
    ranking_score: 50,
    odds_score: 50,
    recent_form_score: 50,
    popularity_score: 50
  };
  
  // Ranking factor
  if (fighter.isChampion) {
    factors.ranking_score = 100;
    baseScore += 800;
  } else if (fighter.ranking && fighter.ranking <= 5) {
    factors.ranking_score = 90;
    baseScore += 600;
  } else if (fighter.ranking && fighter.ranking <= 10) {
    factors.ranking_score = 75;
    baseScore += 400;
  } else if (fighter.ranking && fighter.ranking <= 15) {
    factors.ranking_score = 60;
    baseScore += 200;
  }
  
  // Fight importance factor
  if (fight.is_main_event) {
    baseScore += 500;
  } else if (fight.is_co_main) {
    baseScore += 300;
  } else if (fight.is_title_fight) {
    baseScore += 400;
  }
  
  // Odds factor (if available)
  if (fight.odds) {
    const fighterOdds = fight.fighter_a_id === fighter.id 
      ? fight.odds.fighter_a 
      : fight.odds.fighter_b;
    
    if (fighterOdds < -200) {
      factors.odds_score = 85;
      baseScore += 400;
    } else if (fighterOdds < -100) {
      factors.odds_score = 70;
      baseScore += 200;
    } else if (fighterOdds > 150) {
      factors.odds_score = 30;
      baseScore -= 200;
    }
  }
  
  // Win streak factor
  const recentWins = fighter.record.wins;
  const recentLosses = fighter.record.losses;
  const winRate = recentWins / (recentWins + recentLosses);
  
  if (winRate > 0.8) {
    factors.recent_form_score = 85;
    baseScore += 300;
  } else if (winRate > 0.6) {
    factors.recent_form_score = 65;
    baseScore += 100;
  }
  
  // Round to nearest 100
  const finalSalary = Math.round(baseScore / 100) * 100;
  
  // Ensure salary is within reasonable bounds
  const minSalary = 1500;
  const maxSalary = 3000;
  
  return {
    amount: Math.max(minSalary, Math.min(maxSalary, finalSalary)),
    factors
  };
}

// ============================================
// TEAM FUNCTIONS
// ============================================

export async function getUserTeams(userId: string, eventId?: string): Promise<FantasyTeam[]> {
  try {
    // Use the simplest possible query - just filter by user_id
    const q = query(
      collection(db, 'teams'),
      where('user_id', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    let teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FantasyTeam));
    
    // Filter by eventId on client side if specified
    if (eventId) {
      teams = teams.filter(team => team.event_id === eventId);
    }
    
    // Sort on client side
    teams.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Newest first
    });
    
    // Limit to 20 most recent if no eventId specified
    if (!eventId && teams.length > 20) {
      return teams.slice(0, 20);
    }
    
    return teams;
  } catch (error: any) {
    // Check if it's a permissions error or if collection doesn't exist
    if (error?.code === 'permission-denied') {
      console.warn('Permission denied accessing teams. User might not be authenticated.');
    } else if (error?.code === 'failed-precondition') {
      console.warn('Teams collection requires an index. Using empty array for now.');
      // Return empty array to prevent the app from breaking
      return [];
    } else {
      console.error('Error fetching user teams:', error);
    }
    return [];
  }
}

export async function getTeam(teamId: string): Promise<FantasyTeam | null> {
  try {
    const docRef = doc(db, 'teams', teamId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as FantasyTeam;
    }
    return null;
  } catch (error) {
    console.error('Error fetching team:', error);
    return null;
  }
}

export async function saveTeam(team: Partial<FantasyTeam>): Promise<string | null> {
  try {
    const teamId = team.id || `team_${team.user_id}_${team.event_id}_${Date.now()}`;
    const teamData = {
      ...team,
      id: teamId,
      updated_at: serverTimestamp()
    };
    
    if (!team.created_at) {
      teamData.created_at = serverTimestamp();
    }
    
    await setDoc(doc(db, 'teams', teamId), teamData);
    return teamId;
  } catch (error) {
    console.error('Error saving team:', error);
    return null;
  }
}

export async function submitTeam(teamId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'teams', teamId), {
      status: 'submitted',
      submitted_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });
    
    // Update league entry count
    const team = await getTeam(teamId);
    if (team) {
      const leagueRef = doc(db, 'leagues', team.league_id);
      const league = await getDoc(leagueRef);
      if (league.exists()) {
        await updateDoc(leagueRef, {
          total_entries: (league.data().total_entries || 0) + 1
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error submitting team:', error);
    return false;
  }
}

export async function deleteTeam(teamId: string): Promise<boolean> {
  try {
    // For now, we'll just mark it as deleted by changing status
    await updateDoc(doc(db, 'teams', teamId), {
      status: 'draft',
      updated_at: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error deleting team:', error);
    return false;
  }
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

export function validateTeam(
  picks: TeamPick[], 
  league: League, 
  fights: Fight[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check team size
  if (picks.length !== league.settings.team_size) {
    errors.push(`Team must have exactly ${league.settings.team_size} fighters`);
  }
  
  // Check budget
  const totalSalary = picks.reduce((sum, pick) => sum + pick.salary, 0);
  if (totalSalary > league.settings.budget) {
    errors.push(`Team exceeds budget of $${league.settings.budget}`);
  }
  
  // Check same fight restriction
  const fightMap = new Map<string, string[]>();
  fights.forEach(fight => {
    fightMap.set(fight.fighter_a_id, [fight.id, fight.fighter_b_id]);
    fightMap.set(fight.fighter_b_id, [fight.id, fight.fighter_a_id]);
  });
  
  const fightsUsed = new Set<string>();
  picks.forEach(pick => {
    const fightInfo = fightMap.get(pick.fighter_id);
    if (fightInfo) {
      const [fightId] = fightInfo;
      if (fightsUsed.has(fightId)) {
        errors.push('Cannot select both fighters from the same fight');
      }
      fightsUsed.add(fightId);
    }
  });
  
  // Check captain uniqueness (if applicable)
  if (league.settings.allow_captain) {
    const captainCount = picks.filter(p => p.is_captain).length;
    if (captainCount > 1) {
      errors.push('Only one fighter can be selected as captain');
    }
  }
  
  // Check for one-and-done mode fighter reuse
  if (league.mode === 'one_and_done' && league.season) {
    // This would need to check against previously used fighters in the season
    // We'll implement this when we have the full season tracking
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// LEADERBOARD FUNCTIONS
// ============================================

export async function getLeaderboard(leagueId: string): Promise<FantasyTeam[]> {
  try {
    // Simplified query - just filter by league_id and status
    const q = query(
      collection(db, 'teams'),
      where('league_id', '==', leagueId),
      where('status', 'in', ['locked', 'scored', 'submitted'])
    );
    
    const snapshot = await getDocs(q);
    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FantasyTeam));
    
    // Sort by points on client side
    teams.sort((a, b) => {
      const pointsA = a.total_points || 0;
      const pointsB = b.total_points || 0;
      return pointsB - pointsA; // Highest points first
    });
    
    // Add rank after sorting
    const rankedTeams = teams.map((team, index) => ({
      ...team,
      rank: index + 1
    }));
    
    // Return top 100
    return rankedTeams.slice(0, 100);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
} 