// Weight Divisions
export type WeightDivision = 
  | 'Heavyweight'
  | 'Light Heavyweight'
  | 'Middleweight'
  | 'Welterweight'
  | 'Lightweight'
  | 'Featherweight'
  | 'Bantamweight'
  | 'Flyweight'
  | "Women's Featherweight"
  | "Women's Bantamweight"
  | "Women's Flyweight"
  | "Women's Strawweight";

// Fighter Model
export interface Fighter {
  id: string;
  name: string;
  nickname?: string;
  division: WeightDivision;
  secondaryDivision?: WeightDivision;
  
  // Physical Attributes
  height_inches: number;
  reach_inches: number;
  leg_reach_inches?: number;
  weight_lbs: number;
  
  // Fighting Style
  stance: 'Orthodox' | 'Southpaw' | 'Switch';
  fighting_style?: string;
  
  // Career Stats
  record: {
    wins: number;
    losses: number;
    draws: number;
    no_contests: number;
  };
  
  finishes: {
    ko_tko: number;
    submissions: number;
    decisions: number;
  };
  
  // Performance Metrics
  stats: {
    sig_strikes_per_min: number;
    sig_strike_accuracy: number;
    sig_strikes_absorbed_per_min: number;
    sig_strike_defense: number;
    takedown_avg: number;
    takedown_accuracy: number;
    takedown_defense: number;
    sub_attempts_per_15: number;
  };
  
  // Status
  isActive: boolean;
  isChampion: boolean;
  ranking?: number;
  p4p_ranking?: number;
  
  // Profile
  age: number;
  date_of_birth: string;
  nationality: string;
  hometown: string;
  gym?: string;
  ufc_debut_date?: string;
  
  // Media
  profile_image_url: string;
  hero_image_url?: string;
  
  // Betting
  odds?: number;  // Current betting odds
  
  // Metadata
  created_at?: any;
  updated_at?: any;
  last_fight_date?: string;
  next_fight_id?: string;
}

// Event Model
export interface Event {
  id: string;
  name: string;
  type: 'PPV' | 'Fight Night' | 'Special';
  
  // Scheduling
  date_utc: string;
  venue: {
    name: string;
    city: string;
    state?: string;
    country: string;
    timezone: string;
  };
  
  // Broadcast Info
  broadcast: {
    prelims_time_utc: string;
    main_card_time_utc: string;
    early_prelims_time_utc?: string;
    networks: string[];
  };
  
  // Fights
  main_card: string[];
  prelims: string[];
  early_prelims: string[];
  
  // Status
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  
  // Media
  poster_url?: string;
  
  // Metadata
  created_at?: any;
  updated_at?: any;
}

// Fight Model
export interface Fight {
  id: string;
  event_id: string;
  
  // Fighters
  fighter_a_id: string;
  fighter_b_id: string;
  
  // Fight Details
  weight_class: WeightDivision;
  is_title_fight: boolean;
  is_interim_title: boolean;
  is_main_event: boolean;
  is_co_main: boolean;
  bout_order: number;
  scheduled_rounds: 3 | 5;
  
  // Betting (optional)
  odds?: {
    fighter_a: number;
    fighter_b: number;
    over_under?: number;
  };
  
  // Result
  result?: {
    winner_id: string | null;
    method: FightMethod;
    round: number;
    time_seconds: number;
    stats: {
      [fighter_id: string]: FightStats;
    };
    fight_of_the_night: boolean;
    performance_bonuses: string[];
  };
  
  // Status
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_contest';
  cancellation_reason?: string;
  
  // Metadata
  created_at?: any;
  updated_at?: any;
}

export type FightMethod = 
  | 'KO/TKO'
  | 'Submission'
  | 'Decision - Unanimous'
  | 'Decision - Split'
  | 'Decision - Majority'
  | 'Draw'
  | 'No Contest'
  | 'DQ';

export interface FightStats {
  // Striking
  total_strikes_landed: number;
  total_strikes_attempted: number;
  sig_strikes_landed: number;
  sig_strikes_attempted: number;
  head_strikes: number;
  body_strikes: number;
  leg_strikes: number;
  distance_strikes: number;
  clinch_strikes: number;
  ground_strikes: number;
  
  // Grappling
  takedowns_landed: number;
  takedowns_attempted: number;
  submission_attempts: number;
  reversals: number;
  control_time_seconds: number;
  
  // Damage
  knockdowns: number;
  
  // Fouls
  point_deductions: number;
  warnings: number;
  
  // Other
  missed_weight: boolean;
  weight_miss_amount?: number;
}

// Rankings Models
export interface DivisionRankings {
  id: string;
  division: WeightDivision;
  champion_id: string | null;
  interim_champion_id?: string;
  rankings: RankedFighter[];
  last_updated: string;
  next_update: string;
}

export interface RankedFighter {
  rank: number;
  fighter_id: string;
  previous_rank?: number;
  weeks_at_rank: number;
}

export interface P4PRankings {
  id: string;
  type: 'mens' | 'womens';
  rankings: Array<{
    rank: number;
    fighter_id: string;
    previous_rank?: number;
  }>;
  last_updated: string;
}

// ============================================
// FANTASY MODELS
// ============================================

// League Model
export interface League {
  id: string;
  name: string;
  type: 'global' | 'private';
  mode: 'weekly' | 'one_and_done';
  event_id: string;
  
  // League Settings
  settings: {
    budget: number;                    // e.g., 10000
    team_size: number;                  // 5 for weekly, 1 for one-and-done
    max_from_same_fight: number;        // Usually 1
    lock_time_minutes_before: number;   // e.g., 15
    allow_captain: boolean;             // true for weekly, false for one-and-done
    captain_multiplier: number;         // 1.5
    apply_ppv_multiplier: boolean;      // true for PPV events
    ppv_multiplier: number;            // 1.5
  };
  
  // League Info
  scoring_system: 'standard';
  total_entries: number;
  max_entries: number | null;
  entry_fee: number;
  prize_pool: number;
  
  // Status
  status: 'draft' | 'open' | 'locked' | 'scoring' | 'completed';
  
  // Season (for one-and-done)
  season?: {
    start_date: string;
    end_date: string;
    name: string;
  };
  
  // Metadata
  created_at?: any;
  updated_at?: any;
  created_by?: string;
}

// Fighter Salary Model
export interface FighterSalary {
  id: string;
  event_id: string;
  fighter_id: string;
  salary: number;
  
  // Factors that determine salary
  factors?: {
    ranking_score: number;
    odds_score: number;
    recent_form_score: number;
    popularity_score: number;
  };
  
  // Metadata
  created_at?: any;
  updated_at?: any;
}

// Fantasy Team Model
export interface FantasyTeam {
  id: string;
  user_id: string;
  league_id: string;
  event_id: string;
  mode: 'weekly' | 'one_and_done';  // Denormalized for easier queries
  event_date_utc: string;            // Denormalized for season queries
  
  // Team Info
  name: string;
  
  // Team Picks
  picks: TeamPick[];
  
  // Budget
  total_salary: number;
  remaining_budget: number;
  
  // Scoring
  total_points?: number;
  rank?: number;
  
  // Status
  status: 'draft' | 'submitted' | 'locked' | 'scored';
  locked_at?: string;
  
  // Metadata
  created_at?: any;
  updated_at?: any;
  submitted_at?: string;
}

// Team Pick Model
export interface TeamPick {
  fighter_id: string;
  salary: number;
  slot: number;
  is_captain: boolean;
  
  // Populated after scoring
  points?: number;
  score_breakdown?: ScoreBreakdown;
}

// Score Breakdown Model
export interface ScoreBreakdown {
  base_points: number;
  method_bonus: number;
  round_bonus: number;
  performance_bonuses: number;
  penalties: number;
  
  // Multipliers
  underdog_multiplier?: number;
  captain_multiplier?: number;
  
  // Final
  subtotal: number;
  final_points: number;
  
  // Details
  details: string[];
}

// Scoring Breakdown Model (for detailed display)
export interface ScoringBreakdown {
  fighter_name: string;
  total_points: number;
  items: Array<{
    label: string;
    points: number;
    isMultiplier?: boolean;
  }>;
}

// Scoring Rules Configuration
export interface ScoringRules {
  // Base Points
  win: number;                        // 100
  loss: number;                        // 25
  draw: number;                        // 50
  no_contest: number;                  // 25
  
  // Method Bonuses
  ko_tko_bonus: number;               // 50
  submission_bonus: number;            // 75
  
  // Round Bonuses (early finish)
  round_1_bonus: number;               // 100
  round_2_bonus: number;               // 75
  round_3_bonus: number;               // 50
  
  // Performance Bonuses
  fight_of_the_night: number;         // 50
  performance_of_the_night: number;   // 75
  
  // Strike Bonuses
  sig_strikes_per_point: number;      // 2 sig strikes = 1 point
  knockdown_bonus: number;            // 25
  
  // Grappling Bonuses
  takedown_bonus: number;             // 5
  submission_attempt_bonus: number;   // 3
  reversal_bonus: number;             // 10
  control_time_per_point: number;     // 60 seconds = 1 point
  
  // Penalties
  point_deduction_penalty: number;    // -25
  missed_weight_penalty: number;      // -50
  
  // Underdog Multipliers
  underdog_multipliers: {
    odds_threshold: number;           // e.g., +200
    multiplier: number;               // e.g., 1.5
  }[];
}

// User Fantasy Stats
export interface UserFantasyStats {
  user_id: string;
  
  // Overall Stats
  total_teams: number;
  total_points: number;
  average_points: number;
  best_score: number;
  worst_score: number;
  
  // Rankings
  global_rank?: number;
  percentile?: number;
  
  // Achievements
  tournament_wins: number;
  top_10_finishes: number;
  perfect_teams: number;
  
  // One-and-Done Stats
  one_and_done?: {
    current_streak: number;
    best_streak: number;
    fighters_used: string[];
    season_points: number;
    season_rank?: number;
  };
  
  // Metadata
  updated_at?: any;
}

// Contest/Tournament Model (for future use)
export interface Contest {
  id: string;
  name: string;
  type: 'guaranteed' | 'multiplier' | 'head_to_head' | 'league';
  event_id: string;
  
  // Entry Requirements
  entry_fee: number;
  max_entries: number;
  entries_per_user: number;
  
  // Prize Structure
  prize_pool: number;
  guaranteed_prize_pool?: number;
  payout_structure: PayoutTier[];
  
  // Status
  status: 'open' | 'locked' | 'completed' | 'cancelled';
  current_entries: number;
  
  // Metadata
  created_at?: any;
  starts_at: string;
  locks_at: string;
}

export interface PayoutTier {
  min_rank: number;
  max_rank: number;
  prize: number;
  percentage?: number;
} 

// Fight Result Model
export interface FightResult {
  id?: string;
  fight_id: string;
  event_id: string;
  
  // Result Details
  winner_id: string;
  loser_id: string;
  method: FightMethod | string;
  round: number;
  time_seconds?: number;
  
  // Fight Details
  is_title_fight?: boolean;
  is_main_event?: boolean;
  weight_class?: WeightDivision;
  
  // Performance Bonuses
  fight_of_the_night?: boolean;
  performance_bonuses?: string[];  // Fighter IDs who received bonuses
  
  // Fighter Stats (detailed stats for each fighter)
  fighter_stats?: {
    [fighter_id: string]: FightStats;
  };
  
  // Metadata
  completed_at?: string;
  updated_at?: any;
} 