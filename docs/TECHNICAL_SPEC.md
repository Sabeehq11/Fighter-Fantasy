# CageSide Companion - Technical Specification

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **State Management**: Zustand or Context API
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Hosting**: Vercel (Frontend), Firebase (Backend services)
- **Image Storage**: Firebase Storage or Cloudinary
- **Data Pipeline**: Node.js scrapers → JSON → Firestore

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
│  Firebase       │                          │   Scrapers   │
│  Storage        │                          │  (Node.js)   │
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
    total_teams_created: number;
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
  type: 'global' | 'private';
  event_id: string;               // Which event this is for
  
  // Rules
  settings: {
    budget: number;               // Total salary cap
    team_size: number;            // Number of fighters
    max_from_same_fight: number;  // Usually 1
    lock_time_minutes_before: number; // Usually 15
  };
  
  // Scoring System
  scoring_system: 'standard' | 'custom';
  custom_scoring?: ScoringRules;
  
  // Participants
  total_entries: number;
  max_entries?: number;
  entry_fee?: number;
  prize_pool?: number;
  
  // Status
  status: 'open' | 'locked' | 'scoring' | 'completed';
  
  // Metadata
  created_at: Timestamp;
  created_by?: string;            // User ID for private leagues
}

interface FantasyTeam {
  id: string;                     // "team_userid_eventid"
  user_id: string;
  league_id: string;
  event_id: string;
  
  // Team Composition
  name?: string;                  // Optional team name
  picks: FantasyPick[];
  total_salary_used: number;
  
  // Status
  is_locked: boolean;
  locked_at?: Timestamp;
  
  // Scoring
  total_points: number;
  rank?: number;
  percentile?: number;
  
  // Metadata
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface FantasyPick {
  fighter_id: string;
  salary: number;
  slot: number;                   // Position 1-5
  is_captain?: boolean;           // For 2x points modes
  points_earned?: number;         // After scoring
}

interface FantasySalary {
  id: string;                     // "salary_eventid_fighterid"
  event_id: string;
  fighter_id: string;
  salary: number;
  
  // Factors used to calculate
  factors: {
    ranking_score: number;
    odds_score: number;
    recent_form_score: number;
    popularity_score: number;
  };
  
  ownership_percentage?: number;   // After lock
}

interface ScoringRules {
  // Base Points
  participation: number;
  win: number;
  loss: number;
  
  // Method Bonuses
  ko_tko_bonus: number;
  submission_bonus: number;
  decision_bonus: number;
  
  // Round Bonuses (for finishes)
  round_bonuses: {
    [round: number]: number;
  };
  
  // Performance Points
  knockdown: number;
  sig_strike: number;
  sig_strike_cap?: number;
  takedown: number;
  control_time_per_minute: number;
  submission_attempt: number;
  sub_attempt_cap?: number;
  
  // Context Bonuses
  title_fight_win_bonus: number;
  underdog_multipliers: {
    threshold: number;            // e.g., +200
    multiplier: number;           // e.g., 1.2
  }[];
  
  // Penalties
  missed_weight_penalty: number;
  point_deduction_penalty: number;
  dq_loss_penalty: number;
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
    method_bonus: number;
    round_bonus: number;
    performance: number;
    bonuses: number;
    penalties: number;
    multipliers: number;
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
  getUserTeams(userId: string, eventId?: string): Promise<FantasyTeam[]>;
  getEventSalaries(eventId: string): Promise<FantasySalary[]>;
  getLeaderboard(leagueId: string): Promise<FantasyTeam[]>;
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
│       └── fights/           # Subcollection of fighter's fights
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
│       └── teams/            # Subcollection of user's fantasy teams
├── fantasy/
│   ├── leagues/
│   │   └── {league_id}/
│   ├── teams/
│   │   └── {team_id}/
│   ├── salaries/
│   │   └── {event_id}/
│   │       └── {fighter_id}/
│   └── scores/
│       └── {event_id}/
│           └── {fighter_id}/
└── admin/
    ├── scraped_data/         # Temporary storage for scraped JSON
    └── config/               # App configuration
```

## Authentication & Authorization

### User Roles
```typescript
enum UserRole {
  GUEST = 'guest',           // Not logged in
  USER = 'user',            // Standard user
  PREMIUM = 'premium',      // Paid subscription
  ADMIN = 'admin'           // Full access
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
    activeTeam: FantasyTeam | null;
    draftPicks: FantasyPick[];
    remainingBudget: number;
    currentEvent: Event | null;
    salaries: FantasySalary[];
  };
  
  // User State
  user: {
    profile: User | null;
    teams: FantasyTeam[];
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
5. fantasy_teams: event_id ASC, total_points DESC
6. fantasy_teams: user_id ASC, created_at DESC
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
  // ... etc
});

const FantasyTeamSchema = z.object({
  picks: z.array(FantasyPickSchema).length(5),
  total_salary_used: z.number().max(10000),
  // ... etc
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
// pages/_app.tsx or app/error.tsx
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
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
describe('Fantasy Scoring Engine', () => {
  it('calculates base points correctly', () => {
    const stats = mockFightStats;
    const points = calculatePoints(stats, scoringRules);
    expect(points.base).toBe(12); // 2 participation + 10 win
  });
  
  it('applies underdog multiplier', () => {
    const stats = { ...mockFightStats, odds: 250 };
    const points = calculatePoints(stats, scoringRules);
    expect(points.total).toBe(basePoints * 1.2);
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
    expect(events).toHaveLength(10);
    expect(events[0].date_utc < events[1].date_utc).toBe(true);
  });
});
```

### E2E Tests
```typescript
// cypress/e2e/fantasy-flow.cy.ts
describe('Fantasy Team Creation', () => {
  it('creates a valid team within budget', () => {
    cy.login('test@example.com', 'password');
    cy.visit('/fantasy');
    cy.contains('Create Team').click();
    
    // Select 5 fighters
    cy.get('[data-testid="fighter-card"]').first(5).click();
    
    // Verify budget
    cy.get('[data-testid="remaining-budget"]')
      .should('be.gte', 0);
    
    // Save team
    cy.contains('Save Team').click();
    cy.url().should('include', '/fantasy/my-teams');
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

FIREBASE_ADMIN_SDK_KEY=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx

SCRAPER_API_KEY=xxx
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
  "env": {
    "NODE_ENV": "production"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### Firebase Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for events, fighters, rankings
    match /{collection}/{document=**} {
      allow read: if collection in ['events', 'fighters', 'rankings', 'fights'];
    }
    
    // User data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fantasy teams
    match /fantasy/teams/{teamId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.user_id &&
        resource.data.is_locked == false;
    }
    
    // Admin only
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.is_admin == true;
    }
  }
}
``` 