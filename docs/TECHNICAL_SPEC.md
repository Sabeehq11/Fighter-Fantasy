# Fighter Fantasy - Technical Specification

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **State/Data**: Zustand + @tanstack/react-query
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Hosting**: Vercel (Frontend), Firebase (Backend services)
- **Image Storage**: Firebase Storage or Cloudinary
- **Data Pipeline**: Firecrawl API → Transform → Firestore

### System Architecture
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js App   │────▶│  Firebase    │────▶│  Firestore  │
│   (Vercel)      │     │    Auth      │     │  Database   │
└─────────────────┘     └──────────────┘     └─────────────┘
        │                                            ▲
        │                                            │
        ▼                                            │
┌─────────────────┐                          ┌──────────────┐
│  Firebase       │                          │  Firecrawl   │
│  Storage        │                          │     API      │
└─────────────────┘                          └──────────────┘
```

## Data Models

### 1. Fighter Model
```typescript
interface Fighter {
  id: string;                    // "fighter_lastname_firstname"
  name: string;                   // Full name
  nickname?: string;              // Optional nickname
  division: WeightDivision;       // Current weight class
  secondaryDivision?: WeightDivision; // If fights in multiple
  
  // Physical Attributes
  height_inches: number;
  reach_inches: number;
  leg_reach_inches?: number;
  weight_lbs: number;             // Walking weight
  
  // Fighting Style
  stance: 'Orthodox' | 'Southpaw' | 'Switch';
  fighting_style?: string;        // e.g., "Striker", "Wrestler"
  
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
    sig_strike_accuracy: number;    // percentage
    sig_strikes_absorbed_per_min: number;
    sig_strike_defense: number;     // percentage
    takedown_avg: number;           // per 15 min
    takedown_accuracy: number;      // percentage
    takedown_defense: number;       // percentage
    sub_attempts_per_15: number;
  };
  
  // Status
  isActive: boolean;
  isChampion: boolean;
  ranking?: number;                // Current ranking in division
  p4p_ranking?: number;           // Pound-for-pound ranking
  
  // Profile
  age: number;
  date_of_birth: string;          // ISO date
  nationality: string;            // Country code
  hometown: string;
  gym?: string;
  ufc_debut_date?: string;        // ISO date
  
  // Media
  profile_image_url: string;
  hero_image_url?: string;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
  last_fight_date?: string;       // ISO date
  next_fight_id?: string;         // Reference to upcoming fight
}

type WeightDivision = 
  | 'Heavyweight'
  | 'Light Heavyweight'
  | 'Middleweight'
  | 'Welterweight'
  | 'Lightweight'
  | 'Featherweight'
  | 'Bantamweight'
  | 'Flyweight'
  | 'Women\'s Featherweight'
  | 'Women\'s Bantamweight'
  | 'Women\'s Flyweight'
  | 'Women\'s Strawweight';
```

### 2. Event Model
```typescript
interface Event {
  id: string;                     // "ufc_305" or "ufc_fight_night_248"
  name: string;                   // "UFC 305: Du Plessis vs Adesanya"
  type: 'PPV' | 'Fight Night' | 'Special';
  
  // Scheduling
  date_utc: string;               // ISO datetime
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
    networks: string[];           // ["ESPN+", "PPV"]
  };
  
  // Fights
  main_card: string[];            // Array of fight IDs
  prelims: string[];              // Array of fight IDs
  early_prelims: string[];        // Array of fight IDs
  
  // Status
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  
  // Media
  poster_url?: string;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### 3. Fight Model
```typescript
interface Fight {
  id: string;                     // "fight_eventid_order"
  event_id: string;               // Reference to Event
  
  // Fighters
  fighter_a_id: string;           // Red corner
  fighter_b_id: string;           // Blue corner
  
  // Fight Details
  weight_class: WeightDivision;
  is_title_fight: boolean;
  is_interim_title: boolean;
  is_main_event: boolean;
  is_co_main: boolean;
  bout_order: number;             // Order on the card
  scheduled_rounds: 3 | 5;
  
  // Betting (optional)
  odds?: {
    fighter_a: number;            // e.g., -150
    fighter_b: number;            // e.g., +130
    over_under?: number;          // Total rounds line
  };
  
  // Result (null if not fought yet)
  result?: {
    winner_id: string | null;     // null if draw/NC
    method: FightMethod;
    round: number;
    time_seconds: number;         // Time in the round
    technique?: string;           // e.g., "Rear-Naked Choke", "Spinning wheel-kick KO"
    narrative_tags?: string[];    // e.g., ["knockdown", "rnc_chain"]

    // Closing Odds Snapshot (for multipliers)
    closing_odds?: {
      [fighter_id: string]: number; // e.g., { fighter_a_id: -150, fighter_b_id: +130 }
    };
    
    // Performance Stats
    stats: {
      [fighter_id: string]: FightStats;
    };
    
    // Bonuses
    fight_of_the_night: boolean;
    performance_bonuses: string[]; // Fighter IDs who got POTN
  };
  
  // Status
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_contest';
  cancellation_reason?: string;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}

type FightMethod = 
  | 'KO/TKO'
  | 'Submission'
  | 'Decision - Unanimous'
  | 'Decision - Split'
  | 'Decision - Majority'
  | 'Draw'
  | 'No Contest'
  | 'DQ';

interface FightStats {
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
  weight_miss_amount?: number;    // In pounds
}
```

### 4. Rankings Model
```typescript
interface DivisionRankings {
  id: string;                     // "rankings_lightweight"
  division: WeightDivision;
  
  champion_id: string | null;     // null if vacant
  interim_champion_id?: string;
  
  rankings: RankedFighter[];       // Top 15 contenders
  
  // Metadata
  last_updated: string;           // ISO date
  next_update: string;            // ISO date (usually Tuesday)
}

interface RankedFighter {
  rank: number;                   // 1-15
  fighter_id: string;
  previous_rank?: number;         // For showing movement
  weeks_at_rank: number;
}

interface P4PRankings {
  id: string;                     // "p4p_mens" or "p4p_womens"
  type: 'mens' | 'womens';
  
  rankings: Array<{
    rank: number;                 // 1-15
    fighter_id: string;
    previous_rank?: number;
  }>;
  
  last_updated: string;
}
```

### 5. User Model
```typescript
interface User {
  id: string;                     // Firebase UID
  email: string;
  
  // Profile
  display_name: string;
  avatar_url?: string;
  bio?: string;
  
  // Preferences
  favorite_fighters: string[];    // Fighter IDs
  timezone: string;
  notifications_enabled: boolean;
  
  // Fantasy Stats
  fantasy_stats: {
    total_entries_created: number;
    total_points_earned: number;
    best_finish: number;           // Best leaderboard position
    average_points: number;
    win_rate: number;              // Percentage in top 10%
  };
  
  // Subscription
  subscription: {
    type: 'free' | 'premium' | 'event_pass';
    expires_at?: Timestamp;
    stripe_customer_id?: string;
  };
  
  // Metadata
  created_at: Timestamp;
  last_login: Timestamp;
  is_admin: boolean;
}
```

### 6. Fantasy Models
```typescript
interface FantasyLeague {
  id: string;
  name: string;
  type: 'global' | 'public' | 'private';
  event_id: string;               // Which event this is for

  // Format/Mode
  mode: 'main_card_prediction';

  // Rules
  settings: {
    lock_policy: 'main_card_minus_15m';
    allow_captain: boolean;       // true
    captain_multiplier: number;   // 1.25
    show_lineups_after: 'lock' | 'first_fight';
    season_aggregation?: {
      enabled: boolean;
      best_n?: number;            // e.g., 8
    };
  };

  // Scoring System
  scoring: ScoringRules;

  // Access
  join_code?: string;             // for private leagues

  // Participants
  total_entries: number;
  max_entries?: number;

  // Status
  status: 'open' | 'locked' | 'scoring' | 'completed';

  // Metadata
  created_at: Timestamp;
  created_by?: string;            // User ID for private leagues
}

interface FantasyEntry {
  id: string;                     // "entry_userid_eventid"
  user_id: string;
  league_id: string;
  event_id: string;

  // Composition
  picks: FantasyPick[];           // One per main-card fight
  captain_fighter_id?: string;    // Optional

  // Locking
  is_locked: boolean;
  locked_at?: Timestamp;
  edit_count: number;             // For tie-breakers
  submitted_at: Timestamp;        // First submission timestamp

  // Scoring
  total_points: number;
  rank?: number;
  percentile?: number;

  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface FantasyPick {
  fight_id: string;
  selected_fighter_id: string;
  prediction: {
    method: 'KO/TKO' | 'Submission' | 'Decision' | 'DQ' | 'Draw';
    round: 'R1' | 'R2' | 'R3' | 'R4' | 'R5' | 'GTD';
  };
  free_text?: string;
  is_captain?: boolean;
  coins?: {
    stake: number;               // 0 allowed
    bet_type: 'winner' | 'winner_method' | 'winner_method_round';
  };
  points_earned?: number;         // After scoring
}

interface ScoringRules {
  // Base Prediction
  prediction: {
    winner: number;               // 10
    method: number;               // 5
    round: number;                // 3
    close_round: number;          // 1
    decision_gtd: number;         // 3
  };

  // Performance Overlay
  performance: {
    weights: {
      knockdown: number;          // 2
      sig_strike: number;         // 0.05
      takedown: number;           // 1
      control_minute: number;     // 1
      submission_attempt: number; // 1
      reversal: number;           // 1
    };
    subcaps: {
      knockdown: number;          // 4
      sig_strike: number;         // 3
      takedown: number;           // 3
      control: number;            // 3
      submission_attempt: number; // 3
      reversal: number;           // 2
    };
    fight_caps: { three_round: number; five_round: number }; // 8 / 10
    lose_multiplier: number;      // 0.5
  };

  // Early Finish Boost
  early_finish: { R1: number; R2: number; R3: number; championship_R4_R5: number };

  // Rarity Multipliers
  rarity_multipliers: { S: number; A: number; B: number; Decision: number };

  // Underdog Bands (win-only)
  underdog_bands: Array<{ min_plus: number; max_plus: number | null; multiplier: number }>;

  // Context & Penalties
  context: {
    title_fight_win: number;
    short_notice_win: number;
    missed_weight: number;
    dq_loss: number;
    no_contest_participation: number;
  };

  // Captain
  captain_multiplier: number; // 1.25

  // Coins payouts (v1 fixed tiers)
  coins_payouts: {
    winner: number;                // e.g., 1.6
    winner_method: number;         // e.g., 3.0
    winner_method_round: number;   // e.g., 6.0
  };
}

interface FantasyScoreEvent {
  id: string;
  event_id: string;
  fight_id: string;
  fighter_id: string;

  // Raw Stats (from Fight result)
  stats: FightStats;

  // Calculated Points
  points_breakdown: {
    base: number;
    performance: number;
    early_finish: number;
    context: number;
    rarity_multiplier: number;
    underdog_multiplier: number;
    captain_multiplier: number;
  };

  total_points: number;

  // Metadata
  calculated_at: Timestamp;
}
```

## API Structure

### Data Service Layer
```typescript
// services/dataService.ts

interface DataService {
  // Events
  getUpcomingEvents(limit?: number): Promise<Event[]>;
  getPastEvents(limit?: number): Promise<Event[]>;
  getEventById(id: string): Promise<Event>;
  getEventFights(eventId: string): Promise<Fight[]>;
  
  // Fighters
  getAllFighters(filters?: FighterFilters): Promise<Fighter[]>;
  getFighterById(id: string): Promise<Fighter>;
  getFightersByDivision(division: WeightDivision): Promise<Fighter[]>;
  searchFighters(query: string): Promise<Fighter[]>;
  
  // Rankings
  getDivisionRankings(division: WeightDivision): Promise<DivisionRankings>;
  getP4PRankings(type: 'mens' | 'womens'): Promise<P4PRankings>;
  
  // Fights
  getFightById(id: string): Promise<Fight>;
  getFighterRecentFights(fighterId: string, limit?: number): Promise<Fight[]>;
  
  // Fantasy
  getFantasyLeague(leagueId: string): Promise<FantasyLeague>;
  getUserEntries(userId: string, eventId?: string): Promise<FantasyEntry[]>;
  getLeaderboard(leagueId: string): Promise<FantasyEntry[]>;
}

interface FighterFilters {
  division?: WeightDivision;
  isActive?: boolean;
  isChampion?: boolean;
  nationality?: string;
  stance?: string;
  minRanking?: number;
  maxRanking?: number;
}
```

### Firebase Collections Structure
```
firestore/
├── fighters/
│   └── {fighter_id}/
│       └── fights/
├── events/
│   └── {event_id}/
├── fights/
│   └── {fight_id}/
├── rankings/
│   ├── divisions/
│   │   └── {division_name}/
│   └── p4p/
│       └── {mens|womens}/
├── users/
│   └── {user_id}/
├── fantasy/
│   ├── leagues/
│   │   └── {league_id}/
│   ├── entries/
│   │   └── {entry_id}/
│   ├── scores/
│   │   └── {event_id}/
│   │       └── {fighter_id}/
│   └── config/
│       └── scoring_rules (singleton or per-league)
└── admin/
    ├── scraped_data/
    └── config/
```

## Authentication & Authorization

### User Roles
```typescript
enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  PREMIUM = 'premium',
  ADMIN = 'admin'
}

interface AuthContext {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}
```

### Protected Routes
```typescript
// middleware.ts
const protectedRoutes = [
  '/fantasy/team-builder',
  '/fantasy/my-teams',
  '/profile',
  '/admin'
];

const premiumRoutes = [
  '/fantasy/private-leagues',
  '/analytics'
];

const adminRoutes = [
  '/admin/*'
];
```

## State Management

### Global State Structure
```typescript
interface AppState {
  // UI State
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeModal: string | null;
  
  // Data Cache
  events: {
    upcoming: Event[];
    past: Event[];
    lastFetch: number;
  };
  
  fighters: {
    all: Fighter[];
    byDivision: Map<WeightDivision, Fighter[]>;
    lastFetch: number;
  };
  
  rankings: {
    divisions: Map<WeightDivision, DivisionRankings>;
    p4p: {
      mens: P4PRankings;
      womens: P4PRankings;
    };
    lastFetch: number;
  };
  
  // Fantasy State
  fantasy: {
    activeEntry: FantasyEntry | null;
    draftPicks: FantasyPick[];
    currentEvent: Event | null;
  };
  
  // User State
  user: {
    profile: User | null;
    entries: FantasyEntry[];
    notifications: Notification[];
  };
}
```

## Performance Optimizations

### Caching Strategy
```typescript
const CACHE_DURATIONS = {
  EVENTS: 5 * 60 * 1000,        // 5 minutes
  FIGHTERS: 60 * 60 * 1000,     // 1 hour
  RANKINGS: 24 * 60 * 60 * 1000, // 1 day
  FIGHT_RESULTS: Infinity,       // Never expires
};

// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_DURATIONS.EVENTS,
      cacheTime: CACHE_DURATIONS.FIGHTERS,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Image Optimization
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['firebasestorage.googleapis.com', 'ufc-images.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },
};

// Image component wrapper
interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
}
```

### Database Indexes
```
Required Firestore Indexes:
1. events: status ASC, date_utc DESC
2. fighters: division ASC, ranking ASC
3. fighters: isActive ASC, name ASC
4. fights: event_id ASC, bout_order ASC
5. fantasy/entries: event_id ASC, total_points DESC
6. fantasy/entries: user_id ASC, created_at DESC
7. fantasy/entries: league_id ASC, is_locked ASC, submitted_at ASC
```

## Security Considerations

### API Security
```typescript
// Cloud Function middleware
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
};

// Rate limiting
const rateLimiter = {
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 100,                     // Limit each IP to 100 requests
  message: 'Too many requests from this IP',
};
```

### Data Validation
```typescript
// Zod schemas for validation
import { z } from 'zod';

const FighterSchema = z.object({
  name: z.string().min(2).max(100),
  division: z.enum([...weightDivisions]),
  height_inches: z.number().min(60).max(84),
  reach_inches: z.number().min(60).max(90),
});

const FantasyEntrySchema = z.object({
  picks: z.array(z.object({
    fight_id: z.string(),
    selected_fighter_id: z.string(),
    prediction: z.object({
      method: z.enum(['KO/TKO', 'Submission', 'Decision', 'DQ', 'Draw']),
      round: z.enum(['R1', 'R2', 'R3', 'R4', 'R5', 'GTD']),
    }),
    free_text: z.string().optional(),
    is_captain: z.boolean().optional(),
    coins: z.object({ stake: z.number().min(0), bet_type: z.enum(['winner', 'winner_method', 'winner_method_round']) }).optional(),
  })).min(1),
});
```

## Error Handling

### Error Types
```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Not authenticated') {
    super(401, message);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Not authorized') {
    super(403, message);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
  }
}
```

### Global Error Handler
```typescript
// app/error.tsx
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Testing Strategy

### Unit Tests
```typescript
// __tests__/scoring.test.ts
describe('Fantasy Scoring Engine (Prediction Mode)', () => {
  it('awards prediction base points correctly', () => {
    // ...
  });

  it('applies performance overlay with caps', () => {
    // ...
  });

  it('applies rarity and underdog multipliers in the right order', () => {
    // ...
  });
});
```

### Integration Tests
```typescript
// __tests__/api/events.test.ts
describe('Events API', () => {
  it('returns upcoming events sorted by date', async () => {
    const response = await fetch('/api/events/upcoming');
    const events = await response.json();
    expect(response.status).toBe(200);
    expect(events.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests
```typescript
// cypress/e2e/fantasy-flow.cy.ts
describe('Fantasy Contest Entry', () => {
  it('submits valid picks for all main-card fights', () => {
    // ...
  });
});
```

## Deployment Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

FIREBASE_ADMIN_SDK_JSON=xxx
FIRECRAWL_API_KEY=xxx
SCRAPER_CRON_SECRET=xxx
```

### Vercel Configuration
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {"NODE_ENV": "production"},
  "headers": [
    {"source": "/(.*)", "headers": [
      {"key": "X-Content-Type-Options", "value": "nosniff"},
      {"key": "X-Frame-Options", "value": "DENY"}
    ]}
  ]
}
```

### Firebase Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for events, fighters, rankings, fights
    match /events/{doc=**} { allow read: if true; }
    match /fighters/{doc=**} { allow read: if true; }
    match /rankings/{doc=**} { allow read: if true; }
    match /fights/{doc=**} { allow read: if true; }

    // User data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Fantasy collections
    match /fantasy/leagues/{leagueId} { allow read: if true; }
    match /fantasy/entries/{entryId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
      allow update: if request.auth != null && request.auth.uid == resource.data.user_id && resource.data.is_locked == false;
    }
    match /fantasy/scores/{eventId}/{fighterId} { allow read: if true; }

    // Admin only
    match /admin/{document=**} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
  }
}
```

## Admin Config: Scoring Rules
```typescript
// firestore: fantasy/config/scoring_rules (or per-league document)
const DefaultScoringRules: ScoringRules = {
  prediction: { winner: 10, method: 5, round: 3, close_round: 1, decision_gtd: 3 },
  performance: {
    weights: { knockdown: 2, sig_strike: 0.05, takedown: 1, control_minute: 1, submission_attempt: 1, reversal: 1 },
    subcaps: { knockdown: 4, sig_strike: 3, takedown: 3, control: 3, submission_attempt: 3, reversal: 2 },
    fight_caps: { three_round: 8, five_round: 10 },
    lose_multiplier: 0.5,
  },
  early_finish: { R1: 5, R2: 3, R3: 1, championship_R4_R5: 1 },
  rarity_multipliers: { S: 1.3, A: 1.15, B: 1.05, Decision: 1.0 },
  underdog_bands: [
    { min_plus: 100, max_plus: 199, multiplier: 1.1 },
    { min_plus: 200, max_plus: 399, multiplier: 1.2 },
    { min_plus: 400, max_plus: null, multiplier: 1.35 },
  ],
  context: { title_fight_win: 2, short_notice_win: 2, missed_weight: -2, dq_loss: -5, no_contest_participation: 1 },
  captain_multiplier: 1.25,
  coins_payouts: { winner: 1.6, winner_method: 3.0, winner_method_round: 6.0 },
};
```

## Scoring Application Order
- Per pick: base prediction → performance overlay → early finish → context/penalties → rarity multiplier → underdog multiplier (win only) → captain multiplier
- Entry total: sum picks

## Additional Indexes
```
8. fantasy/entries: league_id ASC, is_locked ASC, edit_count ASC, submitted_at ASC
```

Notes:
- Odds optional; skip underdog multiplier if missing.
- Technique tier mapping is admin-configurable; unknown finishes default to Tier B; decisions to ×1.00.
- Season aggregation is an optional overlay (best N events). 