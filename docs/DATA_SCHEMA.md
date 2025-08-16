# Fighter Fantasy - Data Schema & Example Documents

## Overview
This document provides complete data schemas and example Firestore documents for all entities in the Fighter Fantasy application.

## Example Documents

### 1. Fighters Example Documents
```json
{
  "fighters": [
    {
      "id": "fighter_makhachev_islam",
      "name": "Islam Makhachev",
      "nickname": "The Dagestani Destroyer",
      "division": "Lightweight",
      "height_inches": 70,
      "reach_inches": 70.5,
      "weight_lbs": 155,
      "stance": "Orthodox",
      "record": { "wins": 25, "losses": 1, "draws": 0, "no_contests": 0 },
      "finishes": { "ko_tko": 5, "submissions": 12, "decisions": 8 },
      "stats": {
        "sig_strikes_per_min": 2.89,
        "sig_strike_accuracy": 59,
        "sig_strikes_absorbed_per_min": 1.67,
        "sig_strike_defense": 65,
        "takedown_avg": 3.42,
        "takedown_accuracy": 64,
        "takedown_defense": 87,
        "sub_attempts_per_15": 1.9
      },
      "isActive": true,
      "isChampion": true,
      "ranking": null,
      "age": 32,
      "date_of_birth": "1991-09-27",
      "nationality": "RU",
      "hometown": "Makhachkala, Dagestan, Russia",
      "gym": "American Kickboxing Academy",
      "ufc_debut_date": "2015-05-23",
      "profile_image_url": "/images/fighters/makhachev.jpg",
      "last_fight_date": "2024-06-01"
    }
  ]
}
```

### 2. Events Example Documents
```json
{
  "events": [
    {
      "id": "ufc_310",
      "name": "UFC 310: Pantoja vs Asakura",
      "type": "PPV",
      "date_utc": "2024-12-07T03:00:00Z",
      "venue": {
        "name": "T-Mobile Arena",
        "city": "Las Vegas",
        "state": "Nevada",
        "country": "USA",
        "timezone": "America/Los_Angeles"
      },
      "broadcast": {
        "prelims_time_utc": "2024-12-07T01:00:00Z",
        "main_card_time_utc": "2024-12-07T03:00:00Z",
        "early_prelims_time_utc": "2024-12-06T23:00:00Z",
        "networks": ["ESPN+", "PPV"]
      },
      "main_card": ["fight_310_1", "fight_310_2", "fight_310_3", "fight_310_4", "fight_310_5"],
      "prelims": ["fight_310_6", "fight_310_7", "fight_310_8", "fight_310_9"],
      "early_prelims": ["fight_310_10", "fight_310_11", "fight_310_12"],
      "status": "upcoming",
      "poster_url": "/images/events/ufc_310_poster.jpg"
    }
  ]
}
```

### 3. Fights Example Documents
```json
{
  "fights": [
    {
      "id": "fight_309_1",
      "event_id": "ufc_309",
      "fighter_a_id": "fighter_jones_jon",
      "fighter_b_id": "fighter_miocic_stipe",
      "weight_class": "Heavyweight",
      "is_title_fight": true,
      "is_interim_title": false,
      "is_main_event": true,
      "is_co_main": false,
      "bout_order": 5,
      "scheduled_rounds": 5,
      "odds": { "fighter_a": -625, "fighter_b": 450 },
      "result": {
        "winner_id": "fighter_jones_jon",
        "method": "KO/TKO",
        "round": 3,
        "time_seconds": 267,
        "technique": "KO via punches",
        "narrative_tags": ["knockdown"],
        "closing_odds": { "fighter_jones_jon": -625, "fighter_miocic_stipe": 450 },
        "stats": {
          "fighter_jones_jon": {
            "total_strikes_landed": 78,
            "total_strikes_attempted": 142,
            "sig_strikes_landed": 72,
            "sig_strikes_attempted": 124,
            "head_strikes": 45,
            "body_strikes": 18,
            "leg_strikes": 9,
            "distance_strikes": 58,
            "clinch_strikes": 8,
            "ground_strikes": 6,
            "takedowns_landed": 1,
            "takedowns_attempted": 3,
            "submission_attempts": 0,
            "reversals": 0,
            "control_time_seconds": 89,
            "knockdowns": 1,
            "point_deductions": 0,
            "warnings": 0,
            "missed_weight": false
          },
          "fighter_miocic_stipe": {
            "total_strikes_landed": 42,
            "total_strikes_attempted": 98,
            "sig_strikes_landed": 34,
            "sig_strikes_attempted": 78,
            "head_strikes": 22,
            "body_strikes": 8,
            "leg_strikes": 4,
            "distance_strikes": 30,
            "clinch_strikes": 3,
            "ground_strikes": 1,
            "takedowns_landed": 0,
            "takedowns_attempted": 2,
            "submission_attempts": 0,
            "reversals": 0,
            "control_time_seconds": 12,
            "knockdowns": 0,
            "point_deductions": 0,
            "warnings": 0,
            "missed_weight": false
          }
        },
        "fight_of_the_night": false,
        "performance_bonuses": ["fighter_jones_jon"]
      },
      "status": "completed"
    }
  ]
}
```

### 4. Fantasy (Prediction Mode) Example Documents
```json
{
  "leagues": [
    {
      "id": "league_global_ufc310",
      "name": "UFC 310 Global Contest",
      "type": "global",
      "event_id": "ufc_310",
      "mode": "main_card_prediction",
      "settings": {
        "lock_policy": "main_card_minus_15m",
        "allow_captain": true,
        "captain_multiplier": 1.25,
        "show_lineups_after": "lock",
        "season_aggregation": { "enabled": true, "best_n": 8 }
      },
      "scoring": "default",
      "total_entries": 1247,
      "status": "open"
    },
    {
      "id": "league_private_abcd1234",
      "name": "Friends League",
      "type": "private",
      "event_id": "ufc_310",
      "mode": "main_card_prediction",
      "settings": {
        "lock_policy": "main_card_minus_15m",
        "allow_captain": true,
        "captain_multiplier": 1.25,
        "show_lineups_after": "first_fight"
      },
      "join_code": "8F7KQW",
      "scoring": "default",
      "total_entries": 12,
      "status": "open"
    }
  ],
  "entries": [
    {
      "id": "entry_user123_ufc310",
      "user_id": "user_123",
      "league_id": "league_global_ufc310",
      "event_id": "ufc_310",
      "picks": [
        {
          "fight_id": "fight_310_1",
          "selected_fighter_id": "fighter_pantoja_alexandre",
          "prediction": { "method": "Submission", "round": "R3" },
          "free_text": "RNC after scramble",
          "is_captain": true,
          "coins": { "stake": 25, "bet_type": "winner_method" }
        },
        {
          "fight_id": "fight_310_2",
          "selected_fighter_id": "fighter_rakhmonov_shavkat",
          "prediction": { "method": "KO/TKO", "round": "R2" }
        }
      ],
      "is_locked": false,
      "edit_count": 2,
      "submitted_at": "2024-11-28T10:30:00Z",
      "total_points": 0,
      "created_at": "2024-11-28T10:30:00Z",
      "updated_at": "2024-11-28T14:45:00Z"
    }
  ],
  "scoring_rules": {
    "default": {
      "prediction": { "winner": 10, "method": 5, "round": 3, "close_round": 1, "decision_gtd": 3 },
      "performance": {
        "weights": { "knockdown": 2, "sig_strike": 0.05, "takedown": 1, "control_minute": 1, "submission_attempt": 1, "reversal": 1 },
        "subcaps": { "knockdown": 4, "sig_strike": 3, "takedown": 3, "control": 3, "submission_attempt": 3, "reversal": 2 },
        "fight_caps": { "three_round": 8, "five_round": 10 },
        "lose_multiplier": 0.5
      },
      "early_finish": { "R1": 5, "R2": 3, "R3": 1, "championship_R4_R5": 1 },
      "rarity_multipliers": { "S": 1.3, "A": 1.15, "B": 1.05, "Decision": 1.0 },
      "underdog_bands": [
        { "min_plus": 100, "max_plus": 199, "multiplier": 1.1 },
        { "min_plus": 200, "max_plus": 399, "multiplier": 1.2 },
        { "min_plus": 400, "max_plus": null, "multiplier": 1.35 }
      ],
      "context": { "title_fight_win": 2, "short_notice_win": 2, "missed_weight": -2, "dq_loss": -5, "no_contest_participation": 1 },
      "captain_multiplier": 1.25,
      "coins_payouts": { "winner": 1.6, "winner_method": 3.0, "winner_method_round": 6.0 }
    }
  }
}
```

## Data Validation Rules

### Fighter Validation
- `id`: Must be unique, format: "fighter_lastname_firstname"
- `name`: Required, 2-100 characters
- `division`: Must be valid weight class
- `height_inches`: 60-84 inches
- `reach_inches`: 60-90 inches
- `stance`: One of: Orthodox, Southpaw, Switch
- `nationality`: Valid ISO country code
- `profile_image_url`: Valid URL or path

### Event Validation
- `id`: Unique, format: "ufc_XXX" or "ufc_fight_night_XXX"
- `date_utc`: Valid ISO datetime, must be in future for upcoming events
- `type`: One of: PPV, Fight Night, Special
- `status`: One of: upcoming, live, completed, cancelled
- Fight arrays must contain valid fight IDs

### Fight Validation
- `fighter_a_id` and `fighter_b_id`: Must exist in fighters collection
- `weight_class`: Valid division
- `scheduled_rounds`: 3 or 5
- `bout_order`: Unique within event, higher number = later in card
- If `is_title_fight` true, `scheduled_rounds` must be 5

### Fantasy Validation (Prediction Mode)
- Entry must contain exactly one pick for each main-card fight
- Cannot pick both fighters from the same fight
- Lock 15 minutes before main card (no edits after lock)
- Captain limited to one fighter per entry
- Coins stakes are optional and do not affect leaderboard points
- Scoring order: prediction base → performance overlay → early finish → context/penalties → rarity → underdog (win only) → captain

## Dev Firestore Seed Script
```typescript
// scripts/seed.ts
import * as admin from 'firebase-admin';

const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;
if (!serviceAccountJson) throw new Error('FIREBASE_ADMIN_SDK_JSON missing');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
  });
}

const db = admin.firestore();

async function seed() {
  // Load your real seed dataset from a secure source
  // and write to Firestore collections (fighters, events, fights, rankings).
  // Fantasy (prediction mode) leagues and entries can be created per upcoming event.
}

seed().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## Data Service Implementation
```typescript
// services/firestoreDataService.ts
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

export class DataService {
  async getEvents(type?: 'upcoming' | 'past') {
    const now = new Date().toISOString();
    const snap = await getDocs(query(collection(db, 'events'), orderBy('date_utc', 'desc')));
    const events = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    if (type === 'upcoming') return events.filter(e => e.date_utc > now);
    if (type === 'past') return events.filter(e => e.date_utc <= now);
    return events;
  }
}
``` 