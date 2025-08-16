// Prediction Mode Types (additive)

export type PredictionMethod = 'KO/TKO' | 'Submission' | 'Decision' | 'DQ' | 'Draw';
export type PredictionRound = 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'GTD';

export interface PredictionPick {
  fight_id: string;
  selected_fighter_id: string;
  prediction: {
    method: PredictionMethod;
    round: PredictionRound;
  };
  free_text?: string;
  is_captain?: boolean;
  coins?: {
    stake: number; // 0 allowed
    bet_type: 'winner' | 'winner_method' | 'winner_method_round';
  };
  points_earned?: number; // set after scoring
}

export interface PredictionLeagueSettings {
  lock_policy: 'main_card_minus_15m';
  allow_captain: boolean; // true
  captain_multiplier: number; // 1.25
  show_lineups_after: 'lock' | 'first_fight';
  season_aggregation?: {
    enabled: boolean;
    best_n?: number; // e.g., 8
  };
}

export interface PredictionLeague {
  id: string;
  name: string;
  type: 'global' | 'public' | 'private';
  event_id: string;
  mode: 'main_card_prediction';
  settings: PredictionLeagueSettings;
  scoring_rules_id?: string; // optional reference to a rules doc
  join_code?: string; // for private leagues
  total_entries: number;
  status: 'open' | 'locked' | 'scoring' | 'completed';
  created_at?: any;
  created_by?: string;
  updated_at?: any;
}

export interface PredictionEntry {
  id: string; // entry_userid_eventid or firestore id
  user_id: string;
  league_id: string;
  event_id: string;
  picks: PredictionPick[]; // one per main-card fight
  captain_fighter_id?: string; // optional convenience
  is_locked: boolean;
  locked_at?: any;
  edit_count: number;
  submitted_at: any; // first submission timestamp
  total_points: number;
  rank?: number;
  percentile?: number;
  created_at?: any;
  updated_at?: any;
}

export interface PredictionScoringRules {
  prediction: {
    winner: number; // 10
    method: number; // 5
    round: number; // 3
    close_round: number; // 1
    decision_gtd: number; // 3
  };
  performance: {
    weights: {
      knockdown: number; // 2
      sig_strike: number; // 0.05
      takedown: number; // 1
      control_minute: number; // 1
      submission_attempt: number; // 1
      reversal: number; // 1
    };
    subcaps: {
      knockdown: number; // 4
      sig_strike: number; // 3
      takedown: number; // 3
      control: number; // 3
      submission_attempt: number; // 3
      reversal: number; // 2
    };
    fight_caps: { three_round: number; five_round: number }; // 8 / 10
    lose_multiplier: number; // 0.5
  };
  early_finish: { R1: number; R2: number; R3: number; championship_R4_R5: number };
  rarity_multipliers: { S: number; A: number; B: number; Decision: number };
  underdog_bands: Array<{ min_plus: number; max_plus: number | null; multiplier: number }>;
  context: {
    title_fight_win: number;
    short_notice_win: number;
    missed_weight: number;
    dq_loss: number;
    no_contest_participation: number;
  };
  captain_multiplier: number; // 1.25
  coins_payouts: { winner: number; winner_method: number; winner_method_round: number };
} 