# CageSide Companion - Data Schema & Mock Examples

## Overview
This document provides complete data schemas and mock data examples for all entities in the CageSide Companion application.

## Mock Data Examples

### 1. Fighters Mock Data
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
      "record": {
        "wins": 25,
        "losses": 1,
        "draws": 0,
        "no_contests": 0
      },
      "finishes": {
        "ko_tko": 5,
        "submissions": 12,
        "decisions": 8
      },
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
    },
    {
      "id": "fighter_oliveira_charles",
      "name": "Charles Oliveira",
      "nickname": "Do Bronx",
      "division": "Lightweight",
      "height_inches": 70,
      "reach_inches": 74,
      "weight_lbs": 155,
      "stance": "Orthodox",
      "record": {
        "wins": 34,
        "losses": 10,
        "draws": 0,
        "no_contests": 1
      },
      "finishes": {
        "ko_tko": 10,
        "submissions": 21,
        "decisions": 3
      },
      "stats": {
        "sig_strikes_per_min": 3.29,
        "sig_strike_accuracy": 49,
        "sig_strikes_absorbed_per_min": 3.12,
        "sig_strike_defense": 53,
        "takedown_avg": 2.31,
        "takedown_accuracy": 42,
        "takedown_defense": 58,
        "sub_attempts_per_15": 3.2
      },
      "isActive": true,
      "isChampion": false,
      "ranking": 2,
      "age": 34,
      "date_of_birth": "1989-10-17",
      "nationality": "BR",
      "hometown": "São Paulo, Brazil",
      "gym": "Chute Boxe Diego Lima",
      "ufc_debut_date": "2010-08-01",
      "profile_image_url": "/images/fighters/oliveira.jpg",
      "last_fight_date": "2024-04-13"
    },
    {
      "id": "fighter_jones_jon",
      "name": "Jon Jones",
      "nickname": "Bones",
      "division": "Heavyweight",
      "secondaryDivision": "Light Heavyweight",
      "height_inches": 76,
      "reach_inches": 84.5,
      "weight_lbs": 248,
      "stance": "Orthodox",
      "record": {
        "wins": 27,
        "losses": 1,
        "draws": 0,
        "no_contests": 1
      },
      "finishes": {
        "ko_tko": 10,
        "submissions": 7,
        "decisions": 10
      },
      "stats": {
        "sig_strikes_per_min": 4.29,
        "sig_strike_accuracy": 57,
        "sig_strikes_absorbed_per_min": 2.08,
        "sig_strike_defense": 64,
        "takedown_avg": 1.93,
        "takedown_accuracy": 44,
        "takedown_defense": 95,
        "sub_attempts_per_15": 0.5
      },
      "isActive": true,
      "isChampion": true,
      "ranking": null,
      "p4p_ranking": 2,
      "age": 36,
      "date_of_birth": "1987-07-19",
      "nationality": "US",
      "hometown": "Rochester, New York, USA",
      "gym": "Jackson Wink MMA",
      "ufc_debut_date": "2008-08-09",
      "profile_image_url": "/images/fighters/jones.jpg",
      "last_fight_date": "2023-03-04"
    },
    {
      "id": "fighter_adesanya_israel",
      "name": "Israel Adesanya",
      "nickname": "The Last Stylebender",
      "division": "Middleweight",
      "height_inches": 76,
      "reach_inches": 80,
      "weight_lbs": 185,
      "stance": "Orthodox",
      "record": {
        "wins": 24,
        "losses": 3,
        "draws": 0,
        "no_contests": 0
      },
      "finishes": {
        "ko_tko": 15,
        "submissions": 0,
        "decisions": 9
      },
      "stats": {
        "sig_strikes_per_min": 4.01,
        "sig_strike_accuracy": 50,
        "sig_strikes_absorbed_per_min": 2.48,
        "sig_strike_defense": 61,
        "takedown_avg": 0.29,
        "takedown_accuracy": 42,
        "takedown_defense": 80,
        "sub_attempts_per_15": 0.0
      },
      "isActive": true,
      "isChampion": false,
      "ranking": 2,
      "p4p_ranking": 5,
      "age": 34,
      "date_of_birth": "1989-07-22",
      "nationality": "NZ",
      "hometown": "Auckland, New Zealand",
      "gym": "City Kickboxing",
      "ufc_debut_date": "2018-02-11",
      "profile_image_url": "/images/fighters/adesanya.jpg",
      "last_fight_date": "2024-08-18"
    },
    {
      "id": "fighter_shevchenko_valentina",
      "name": "Valentina Shevchenko",
      "nickname": "Bullet",
      "division": "Women's Flyweight",
      "height_inches": 65,
      "reach_inches": 67,
      "weight_lbs": 125,
      "stance": "Southpaw",
      "record": {
        "wins": 23,
        "losses": 4,
        "draws": 1,
        "no_contests": 0
      },
      "finishes": {
        "ko_tko": 8,
        "submissions": 7,
        "decisions": 8
      },
      "stats": {
        "sig_strikes_per_min": 3.29,
        "sig_strike_accuracy": 51,
        "sig_strikes_absorbed_per_min": 1.86,
        "sig_strike_defense": 60,
        "takedown_avg": 1.44,
        "takedown_accuracy": 59,
        "takedown_defense": 76,
        "sub_attempts_per_15": 0.7
      },
      "isActive": true,
      "isChampion": true,
      "ranking": null,
      "p4p_ranking": 2,
      "age": 35,
      "date_of_birth": "1988-03-07",
      "nationality": "KG",
      "hometown": "Bishkek, Kyrgyzstan",
      "gym": "Tiger Muay Thai",
      "ufc_debut_date": "2015-12-19",
      "profile_image_url": "/images/fighters/shevchenko.jpg",
      "last_fight_date": "2023-09-09"
    }
  ]
}
```

### 2. Events Mock Data
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
    },
    {
      "id": "ufc_309",
      "name": "UFC 309: Jones vs Miocic",
      "type": "PPV",
      "date_utc": "2024-11-16T03:00:00Z",
      "venue": {
        "name": "Madison Square Garden",
        "city": "New York",
        "state": "New York",
        "country": "USA",
        "timezone": "America/New_York"
      },
      "broadcast": {
        "prelims_time_utc": "2024-11-16T01:00:00Z",
        "main_card_time_utc": "2024-11-16T03:00:00Z",
        "early_prelims_time_utc": "2024-11-15T23:00:00Z",
        "networks": ["ESPN+", "PPV"]
      },
      "main_card": ["fight_309_1", "fight_309_2", "fight_309_3", "fight_309_4", "fight_309_5"],
      "prelims": ["fight_309_6", "fight_309_7", "fight_309_8", "fight_309_9"],
      "early_prelims": ["fight_309_10", "fight_309_11"],
      "status": "completed",
      "poster_url": "/images/events/ufc_309_poster.jpg"
    },
    {
      "id": "ufc_fight_night_248",
      "name": "UFC Fight Night: Yan vs Figueiredo",
      "type": "Fight Night",
      "date_utc": "2024-11-23T12:00:00Z",
      "venue": {
        "name": "Galaxy Arena",
        "city": "Macau",
        "country": "China",
        "timezone": "Asia/Macau"
      },
      "broadcast": {
        "prelims_time_utc": "2024-11-23T08:00:00Z",
        "main_card_time_utc": "2024-11-23T12:00:00Z",
        "networks": ["ESPN+"]
      },
      "main_card": ["fight_fn248_1", "fight_fn248_2", "fight_fn248_3", "fight_fn248_4", "fight_fn248_5", "fight_fn248_6"],
      "prelims": ["fight_fn248_7", "fight_fn248_8", "fight_fn248_9", "fight_fn248_10"],
      "early_prelims": [],
      "status": "completed",
      "poster_url": "/images/events/ufc_fn_248_poster.jpg"
    }
  ]
}
```

### 3. Fights Mock Data
```json
{
  "fights": [
    {
      "id": "fight_310_1",
      "event_id": "ufc_310",
      "fighter_a_id": "fighter_pantoja_alexandre",
      "fighter_b_id": "fighter_asakura_kai",
      "weight_class": "Flyweight",
      "is_title_fight": true,
      "is_interim_title": false,
      "is_main_event": true,
      "is_co_main": false,
      "bout_order": 5,
      "scheduled_rounds": 5,
      "odds": {
        "fighter_a": -280,
        "fighter_b": +230,
        "over_under": 3.5
      },
      "result": null,
      "status": "scheduled"
    },
    {
      "id": "fight_310_2",
      "event_id": "ufc_310",
      "fighter_a_id": "fighter_rakhmonov_shavkat",
      "fighter_b_id": "fighter_garry_ian",
      "weight_class": "Welterweight",
      "is_title_fight": false,
      "is_interim_title": false,
      "is_main_event": false,
      "is_co_main": true,
      "bout_order": 4,
      "scheduled_rounds": 5,
      "odds": {
        "fighter_a": -340,
        "fighter_b": +270
      },
      "result": null,
      "status": "scheduled"
    },
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
      "odds": {
        "fighter_a": -625,
        "fighter_b": +450
      },
      "result": {
        "winner_id": "fighter_jones_jon",
        "method": "KO/TKO",
        "round": 3,
        "time_seconds": 267,
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

### 4. Rankings Mock Data
```json
{
  "divisions": {
    "lightweight": {
      "id": "rankings_lightweight",
      "division": "Lightweight",
      "champion_id": "fighter_makhachev_islam",
      "interim_champion_id": null,
      "rankings": [
        {
          "rank": 1,
          "fighter_id": "fighter_tsarukyan_arman",
          "previous_rank": 1,
          "weeks_at_rank": 8
        },
        {
          "rank": 2,
          "fighter_id": "fighter_oliveira_charles",
          "previous_rank": 3,
          "weeks_at_rank": 2
        },
        {
          "rank": 3,
          "fighter_id": "fighter_gaethje_justin",
          "previous_rank": 2,
          "weeks_at_rank": 2
        },
        {
          "rank": 4,
          "fighter_id": "fighter_poirier_dustin",
          "previous_rank": 4,
          "weeks_at_rank": 12
        },
        {
          "rank": 5,
          "fighter_id": "fighter_dariush_beneil",
          "previous_rank": 5,
          "weeks_at_rank": 6
        },
        {
          "rank": 6,
          "fighter_id": "fighter_chandler_michael",
          "previous_rank": 6,
          "weeks_at_rank": 16
        },
        {
          "rank": 7,
          "fighter_id": "fighter_hooker_dan",
          "previous_rank": 8,
          "weeks_at_rank": 1
        },
        {
          "rank": 8,
          "fighter_id": "fighter_gamrot_mateusz",
          "previous_rank": 7,
          "weeks_at_rank": 1
        },
        {
          "rank": 9,
          "fighter_id": "fighter_turner_jalin",
          "previous_rank": 10,
          "weeks_at_rank": 3
        },
        {
          "rank": 10,
          "fighter_id": "fighter_fiziev_rafael",
          "previous_rank": 9,
          "weeks_at_rank": 3
        },
        {
          "rank": 11,
          "fighter_id": "fighter_green_bobby",
          "previous_rank": 11,
          "weeks_at_rank": 8
        },
        {
          "rank": 12,
          "fighter_id": "fighter_ismagulov_damir",
          "previous_rank": 13,
          "weeks_at_rank": 2
        },
        {
          "rank": 13,
          "fighter_id": "fighter_dawson_grant",
          "previous_rank": 14,
          "weeks_at_rank": 4
        },
        {
          "rank": 14,
          "fighter_id": "fighter_ferguson_tony",
          "previous_rank": 12,
          "weeks_at_rank": 1
        },
        {
          "rank": 15,
          "fighter_id": "fighter_mcgregor_conor",
          "previous_rank": null,
          "weeks_at_rank": 1
        }
      ],
      "last_updated": "2024-11-26",
      "next_update": "2024-12-03"
    },
    "heavyweight": {
      "id": "rankings_heavyweight",
      "division": "Heavyweight",
      "champion_id": "fighter_jones_jon",
      "interim_champion_id": "fighter_aspinall_tom",
      "rankings": [
        {
          "rank": 1,
          "fighter_id": "fighter_aspinall_tom",
          "previous_rank": 1,
          "weeks_at_rank": 20
        },
        {
          "rank": 2,
          "fighter_id": "fighter_gane_ciryl",
          "previous_rank": 2,
          "weeks_at_rank": 8
        },
        {
          "rank": 3,
          "fighter_id": "fighter_volkov_alexander",
          "previous_rank": 4,
          "weeks_at_rank": 1
        },
        {
          "rank": 4,
          "fighter_id": "fighter_pavlovich_sergei",
          "previous_rank": 3,
          "weeks_at_rank": 1
        },
        {
          "rank": 5,
          "fighter_id": "fighter_almeida_jailton",
          "previous_rank": 5,
          "weeks_at_rank": 4
        }
      ],
      "last_updated": "2024-11-26",
      "next_update": "2024-12-03"
    }
  },
  "p4p": {
    "mens": {
      "id": "p4p_mens",
      "type": "mens",
      "rankings": [
        {
          "rank": 1,
          "fighter_id": "fighter_makhachev_islam",
          "previous_rank": 1
        },
        {
          "rank": 2,
          "fighter_id": "fighter_jones_jon",
          "previous_rank": 3
        },
        {
          "rank": 3,
          "fighter_id": "fighter_pereira_alex",
          "previous_rank": 2
        },
        {
          "rank": 4,
          "fighter_id": "fighter_edwards_leon",
          "previous_rank": 4
        },
        {
          "rank": 5,
          "fighter_id": "fighter_adesanya_israel",
          "previous_rank": 5
        },
        {
          "rank": 6,
          "fighter_id": "fighter_omalley_sean",
          "previous_rank": 7
        },
        {
          "rank": 7,
          "fighter_id": "fighter_volkanovski_alexander",
          "previous_rank": 6
        },
        {
          "rank": 8,
          "fighter_id": "fighter_topuria_ilia",
          "previous_rank": 10
        },
        {
          "rank": 9,
          "fighter_id": "fighter_holloway_max",
          "previous_rank": 8
        },
        {
          "rank": 10,
          "fighter_id": "fighter_du_plessis_dricus",
          "previous_rank": 11
        },
        {
          "rank": 11,
          "fighter_id": "fighter_pantoja_alexandre",
          "previous_rank": 12
        },
        {
          "rank": 12,
          "fighter_id": "fighter_aspinall_tom",
          "previous_rank": 13
        },
        {
          "rank": 13,
          "fighter_id": "fighter_belal_muhammad",
          "previous_rank": 15
        },
        {
          "rank": 14,
          "fighter_id": "fighter_whittaker_robert",
          "previous_rank": 14
        },
        {
          "rank": 15,
          "fighter_id": "fighter_ankalaev_magomed",
          "previous_rank": null
        }
      ],
      "last_updated": "2024-11-26"
    },
    "womens": {
      "id": "p4p_womens",
      "type": "womens",
      "rankings": [
        {
          "rank": 1,
          "fighter_id": "fighter_zhang_weili",
          "previous_rank": 1
        },
        {
          "rank": 2,
          "fighter_id": "fighter_shevchenko_valentina",
          "previous_rank": 2
        },
        {
          "rank": 3,
          "fighter_id": "fighter_grasso_alexa",
          "previous_rank": 3
        },
        {
          "rank": 4,
          "fighter_id": "fighter_namajunas_rose",
          "previous_rank": 5
        },
        {
          "rank": 5,
          "fighter_id": "fighter_andrade_jessica",
          "previous_rank": 4
        }
      ],
      "last_updated": "2024-11-26"
    }
  }
}
```

### 5. Fantasy Mock Data
```json
{
  "leagues": [
    {
      "id": "league_global_ufc310",
      "name": "UFC 310 Global Championship",
      "type": "global",
      "event_id": "ufc_310",
      "settings": {
        "budget": 10000,
        "team_size": 5,
        "max_from_same_fight": 1,
        "lock_time_minutes_before": 15
      },
      "scoring_system": "standard",
      "total_entries": 1247,
      "max_entries": null,
      "entry_fee": 0,
      "prize_pool": 0,
      "status": "open"
    }
  ],
  "salaries": [
    {
      "id": "salary_ufc310_fighter_pantoja_alexandre",
      "event_id": "ufc_310",
      "fighter_id": "fighter_pantoja_alexandre",
      "salary": 2800,
      "factors": {
        "ranking_score": 95,
        "odds_score": 75,
        "recent_form_score": 85,
        "popularity_score": 70
      }
    },
    {
      "id": "salary_ufc310_fighter_asakura_kai",
      "event_id": "ufc_310",
      "fighter_id": "fighter_asakura_kai",
      "salary": 1800,
      "factors": {
        "ranking_score": 40,
        "odds_score": 35,
        "recent_form_score": 50,
        "popularity_score": 80
      }
    },
    {
      "id": "salary_ufc310_fighter_rakhmonov_shavkat",
      "event_id": "ufc_310",
      "fighter_id": "fighter_rakhmonov_shavkat",
      "salary": 2600,
      "factors": {
        "ranking_score": 90,
        "odds_score": 85,
        "recent_form_score": 95,
        "popularity_score": 60
      }
    },
    {
      "id": "salary_ufc310_fighter_garry_ian",
      "event_id": "ufc_310",
      "fighter_id": "fighter_garry_ian",
      "salary": 1900,
      "factors": {
        "ranking_score": 70,
        "odds_score": 40,
        "recent_form_score": 75,
        "popularity_score": 65
      }
    }
  ],
  "teams": [
    {
      "id": "team_user123_ufc310",
      "user_id": "user_123",
      "league_id": "league_global_ufc310",
      "event_id": "ufc_310",
      "name": "The Underdogs",
      "picks": [
        {
          "fighter_id": "fighter_asakura_kai",
          "salary": 1800,
          "slot": 1,
          "is_captain": false
        },
        {
          "fighter_id": "fighter_garry_ian",
          "salary": 1900,
          "slot": 2,
          "is_captain": false
        },
        {
          "fighter_id": "fighter_dvalishvili_merab",
          "salary": 2200,
          "slot": 3,
          "is_captain": false
        },
        {
          "fighter_id": "fighter_burns_gilbert",
          "salary": 2000,
          "slot": 4,
          "is_captain": false
        },
        {
          "fighter_id": "fighter_evloev_movsar",
          "salary": 2100,
          "slot": 5,
          "is_captain": false
        }
      ],
      "total_salary_used": 10000,
      "is_locked": false,
      "total_points": 0,
      "created_at": "2024-11-28T10:30:00Z",
      "updated_at": "2024-11-28T14:45:00Z"
    }
  ],
  "scoring_rules": {
    "standard": {
      "participation": 2,
      "win": 10,
      "loss": -5,
      "ko_tko_bonus": 12,
      "submission_bonus": 12,
      "decision_bonus": 6,
      "round_bonuses": {
        "1": 8,
        "2": 6,
        "3": 4,
        "4": 3,
        "5": 2
      },
      "knockdown": 3,
      "sig_strike": 0.1,
      "sig_strike_cap": 10,
      "takedown": 2,
      "control_time_per_minute": 1,
      "submission_attempt": 2,
      "sub_attempt_cap": 6,
      "title_fight_win_bonus": 5,
      "underdog_multipliers": [
        {
          "threshold": 200,
          "multiplier": 1.2
        },
        {
          "threshold": 400,
          "multiplier": 1.5
        }
      ],
      "missed_weight_penalty": -3,
      "point_deduction_penalty": -2,
      "dq_loss_penalty": -10
    }
  }
}
```

### 6. Sample Results JSON (For Admin Import)
```json
{
  "event_id": "ufc_309",
  "fights": [
    {
      "fight_id": "fight_309_1",
      "fighterA_id": "fighter_jones_jon",
      "fighterB_id": "fighter_miocic_stipe",
      "winner_id": "fighter_jones_jon",
      "method": "KO/TKO",
      "round": 3,
      "time_seconds": 267,
      "stats": {
        "fighter_jones_jon": {
          "knockdowns": 1,
          "sig_strikes": 72,
          "takedowns": 1,
          "control_seconds": 89,
          "sub_attempts": 0,
          "weight_miss": false,
          "deductions": 0
        },
        "fighter_miocic_stipe": {
          "knockdowns": 0,
          "sig_strikes": 34,
          "takedowns": 0,
          "control_seconds": 12,
          "sub_attempts": 0,
          "weight_miss": false,
          "deductions": 0
        }
      },
      "odds": {
        "fighter_jones_jon": -625,
        "fighter_miocic_stipe": 450
      },
      "bonuses": {
        "fight_of_the_night": false,
        "performance_bonus": ["fighter_jones_jon"]
      }
    },
    {
      "fight_id": "fight_309_2",
      "fighterA_id": "fighter_oliveira_charles",
      "fighterB_id": "fighter_chandler_michael",
      "winner_id": "fighter_oliveira_charles",
      "method": "Decision - Unanimous",
      "round": 5,
      "time_seconds": 300,
      "stats": {
        "fighter_oliveira_charles": {
          "knockdowns": 1,
          "sig_strikes": 134,
          "takedowns": 3,
          "control_seconds": 245,
          "sub_attempts": 2,
          "weight_miss": false,
          "deductions": 0
        },
        "fighter_chandler_michael": {
          "knockdowns": 0,
          "sig_strikes": 98,
          "takedowns": 1,
          "control_seconds": 67,
          "sub_attempts": 0,
          "weight_miss": false,
          "deductions": 0
        }
      },
      "odds": {
        "fighter_oliveira_charles": -245,
        "fighter_chandler_michael": 205
      },
      "bonuses": {
        "fight_of_the_night": true,
        "performance_bonus": []
      }
    }
  ]
}
```

## Fantasy Samples (Weekly vs One-and-Done)

```json
{
  "leagues": [
    {
      "id": "league_global_weekly_ufc310",
      "name": "Global Weekly - UFC 310",
      "type": "global",
      "mode": "salary_cap_weekly",
      "event_id": "ufc_310",
      "settings": {
        "budget": 10000,
        "team_size": 5,
        "max_from_same_fight": 1,
        "lock_time_minutes_before": 15,
        "allow_captain": true,
        "captain_multiplier": 1.5,
        "apply_ppv_multiplier": true,
        "ppv_multiplier": 1.5
      },
      "scoring_system": "standard",
      "total_entries": 0,
      "status": "open"
    },
    {
      "id": "league_global_oneanddone_ufc310",
      "name": "Global One-and-Done - UFC 310",
      "type": "global",
      "mode": "one_and_done",
      "event_id": "ufc_310",
      "settings": {
        "budget": 0,
        "team_size": 1,
        "max_from_same_fight": 1,
        "lock_time_minutes_before": 15,
        "allow_captain": false,
        "captain_multiplier": 1.5,
        "apply_ppv_multiplier": true,
        "ppv_multiplier": 1.5
      },
      "scoring_system": "standard",
      "total_entries": 0,
      "status": "open"
    }
  ],
  "teams": [
    {
      "id": "team_user123_weekly_ufc310",
      "user_id": "user_123",
      "league_id": "league_global_weekly_ufc310",
      "event_id": "ufc_310",
      "mode": "salary_cap_weekly",
      "event_date_utc": "2024-12-07T03:00:00Z",
      "picks": [
        { "fighter_id": "fighter_pantoja_alexandre", "salary": 2800, "slot": 1, "is_captain": true },
        { "fighter_id": "fighter_rakhmonov_shavkat", "salary": 2600, "slot": 2 },
        { "fighter_id": "fighter_garry_ian", "salary": 1900, "slot": 3 },
        { "fighter_id": "fighter_evloev_movsar", "salary": 2100, "slot": 4 },
        { "fighter_id": "fighter_burns_gilbert", "salary": 1600, "slot": 5 }
      ],
      "total_salary_used": 11000,
      "is_locked": false,
      "total_points": 0
    },
    {
      "id": "team_user123_oneanddone_ufc310",
      "user_id": "user_123",
      "league_id": "league_global_oneanddone_ufc310",
      "event_id": "ufc_310",
      "mode": "one_and_done",
      "event_date_utc": "2024-12-07T03:00:00Z",
      "picks": [
        { "fighter_id": "fighter_pantoja_alexandre", "salary": 0, "slot": 1 }
      ],
      "total_salary_used": 0,
      "is_locked": false,
      "total_points": 0
    }
  ],
  "admin_config": {
    "fantasy_season": {
      "id": "current",
      "name": "2025 Season A",
      "start_date_utc": "2025-01-01T00:00:00Z",
      "end_date_utc": "2025-06-30T23:59:59Z",
      "mode": "one_and_done"
    }
  }
}
```

Notes:
- Weekly uses `allow_captain: true` and honors `ppv_multiplier` when event.type is PPV.
- One-and-Done has `team_size: 1` and disallows captain; reuse enforcement is done at write-time by querying user teams in the season window for that fighter.
- `event_date_utc` and `mode` are denormalized on teams for efficient season queries.

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

### Fantasy Validation
- Team must have exactly 5 fighters
- Total salary cannot exceed budget
- Cannot have both fighters from same fight
- Teams lock 15 minutes before event start
- Points calculation must be idempotent

## Mock Data Generation Script
```javascript
// scripts/generateMockData.js
const fs = require('fs');
const path = require('path');

function generateMockData() {
  const mockData = {
    fighters: generateFighters(50),
    events: generateEvents(10),
    fights: generateFights(100),
    rankings: generateRankings(),
    fantasy: generateFantasyData()
  };
  
  // Write to data/mock directory
  Object.keys(mockData).forEach(key => {
    fs.writeFileSync(
      path.join(__dirname, '../data/mock', `${key}.json`),
      JSON.stringify(mockData[key], null, 2)
    );
  });
}

function generateFighters(count) {
  // Implementation details...
}

function generateEvents(count) {
  // Implementation details...
}

// Run the script
generateMockData();
```

## Data Service Implementation
```typescript
// services/mockDataService.ts
import fightersData from '@/data/mock/fighters.json';
import eventsData from '@/data/mock/events.json';
import fightsData from '@/data/mock/fights.json';
import rankingsData from '@/data/mock/rankings.json';

export class MockDataService {
  async getFighters(filters?: FighterFilters): Promise<Fighter[]> {
    let fighters = fightersData.fighters;
    
    if (filters?.division) {
      fighters = fighters.filter(f => f.division === filters.division);
    }
    
    if (filters?.isActive !== undefined) {
      fighters = fighters.filter(f => f.isActive === filters.isActive);
    }
    
    return fighters;
  }
  
  async getEvents(type?: 'upcoming' | 'past'): Promise<Event[]> {
    const now = new Date().toISOString();
    let events = eventsData.events;
    
    if (type === 'upcoming') {
      events = events.filter(e => e.date_utc > now);
    } else if (type === 'past') {
      events = events.filter(e => e.date_utc <= now);
    }
    
    return events.sort((a, b) => 
      new Date(b.date_utc).getTime() - new Date(a.date_utc).getTime()
    );
  }
  
  // Additional methods...
}
``` 