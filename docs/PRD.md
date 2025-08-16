# Fighter Fantasy - Product Requirements Document

## Executive Summary
Fighter Fantasy is a web-based UFC companion application featuring real-time event tracking, comprehensive fighter profiles, division rankings, and an engaging Fantasy UFC game mode where users compete by predicting outcomes of main-card fights per event.

## Project Scope

### In Scope (MVP)
- **Platform**: Web application (responsive, mobile-friendly)
- **Core Features**: 
  - UFC event browsing with countdowns
  - Fighter profiles and statistics
  - Division rankings
  - Fantasy UFC prediction contests (Main-Card Prediction Mode)
- **Data Strategy**: Seed a dev Firestore with a real initial dataset; integrate scraped data in Phase 6
- **User Management**: Authentication and user profiles via Firebase

### Out of Scope (Future Phases)
- Native mobile applications (iOS/Android)
- Desktop Electron application
- Second screen features
- AI fight predictions
- Fight Camp Planner
- Private fantasy leagues (Phase 2)
- Live fight tracking
- Real-money wagering

## Core User Personas

### 1. Casual UFC Fan
- **Needs**: Easy access to upcoming events, fighter info, understanding of rankings
- **Goals**: Stay informed about UFC events, learn about fighters
- **Pain Points**: Information scattered across multiple sites

### 2. Fantasy Sports Enthusiast
- **Needs**: Strategic picks, clear scoring system, competitive leaderboards
- **Goals**: Win fantasy contests, optimize predictions
- **Pain Points**: Lack of UFC-specific fantasy platforms

### 3. Hardcore MMA Analyst
- **Needs**: Detailed fighter statistics, historical data, comprehensive fight records
- **Goals**: Deep analysis of fighter performance and trends
- **Pain Points**: Difficulty accessing consolidated fighter data

## Feature Specifications

### 1. Home Page - Event Hub
**Purpose**: Central dashboard for UFC events

**Features**:
- Upcoming events with countdown timers
- Event cards showing main event fighters
- Quick links to full event details
- Past events archive (last 3 months)
- Featured upcoming title fights
- Time zone conversion support

**User Actions**:
- View upcoming events
- Click to see full fight card
- Set event reminders (Phase 2)
- Filter by event type (PPV, Fight Night)

### 2. Events System

#### 2.1 Event List Page (`/events`)
- Grid/list view toggle
- Filters: Date range, event type, location
- Search by event name or fighter
- Pagination (12 events per page)

#### 2.2 Event Detail Page (`/events/[id]`)
**Main Card Section**:
- Fight matchups with fighter photos
- Weight class for each fight
- Title fight indicators
- Fighter records

**Preliminary Card Section**:
- Same format as main card
- Collapsible sections for prelims/early prelims

**Event Information**:
- Venue details and map
- Date and start times (multiple timezones)
- Broadcast information
- Event poster image

**Tale of the Tape** (per fight):
- Side-by-side fighter comparison
- Key stats: reach, height, stance, age
- Recent form (last 5 fights)
- Betting odds (when available)

### 3. Fighter System

#### 3.1 Fighters Page (`/fighters`)
**Division Organization**:
- Tab or dropdown for each weight class
- Special sections: P4P rankings, Women's divisions
- Champions highlighted at top

**Fighter Grid/List**:
- Fighter photo, name, nickname
- Record (W-L-D)
- Current ranking
- Country flag
- Active/Inactive status

**Search & Filters**:
- Name search (with autocomplete)
- Division filter
- Country filter
- Stance filter (Orthodox, Southpaw, Switch)
- Active fighters only toggle

#### 3.2 Fighter Profile Page (`/fighters/[id]`)
**Header Section**:
- Large fighter photo
- Name, nickname, country
- Division and ranking
- Record with finish breakdown
- Championship status

**Statistics Section**:
- Physical: Height, reach, leg reach, age
- Fighting style: Stance, debut date
- Performance metrics:
  - Striking accuracy
  - Takedown accuracy
  - Significant strikes per minute
  - Takedown average

**Fight History**:
- Last 10 fights (expandable to all)
- Each fight shows:
  - Opponent name
  - Event name and date
  - Result (W/L)
  - Method (KO/TKO, SUB, DEC)
  - Round and time

**Career Highlights**:
- Notable wins
- Title fights
- Performance bonuses
- Win/loss streaks

### 4. Rankings System (`/rankings`)

**Division Rankings Display**:
- Champion section (larger display)
- Top 15 contenders
- Recent ranking changes (↑↓)
- Last fight date per fighter
- Next scheduled fight (if any)

**P4P Rankings**:
- Men's P4P top 15
- Women's P4P top 15
- Cross-division comparison

**Historical Rankings** (Phase 2):
- Past champions per division
- Title defense records
- Historical ranking snapshots

### 5. Fantasy UFC System — Main-Card Prediction Mode

#### 5.1 Fantasy Hub (`/fantasy`)
**Landing Page**:
- Current/upcoming event contests
- "Enter Contest" CTA
- Global leaderboard preview
- Your active teams (entries)
- Fantasy rules overview

#### 5.2 Team Builder (`/fantasy/team-builder/[eventId]`)
**Contest Scope**:
- Per-event contest using the event’s main-card fights only
- Roster size flexes with number of main-card fights

**Picks UI (per fight)**:
- Select exactly one fighter
- Predictions: Method (KO/TKO, Submission, Decision, DQ, Draw), Round (R1–R5 or GTD)
- Optional free-text prediction
- Optional single Captain: ×1.25 multiplier on that fighter only

**Validation**:
- Cannot pick both fighters from the same fight
- Must submit one pick per main-card fight
- Auto-save draft

**Lock & Fairness**:
- Lock 15 minutes before the main card
- No edits after lock
- Lineups revealed after lock (or after first fight)
- Cancelled fight after lock: both fighters score 0, no penalty
- Fighter replacement after lock: picks on the unchanged fighter remain valid and are graded against the new opponent; picks on the replaced fighter grade as did-not-compete; coins on that pick are refunded

#### 5.3 Scoring System
**Base Prediction**:
- Winner correct: +10
- Method correct: +5
- Round correct: +3
- Close round (±1, finishes only): +1
- Decision called and fight goes distance: +3

**Performance Overlay (capped; applies to picked fighter)**:
- Weights (per fighter):
  - Knockdowns: +2 each (cap +4)
  - Significant strikes: +0.05 each (cap +3)
  - Takedowns: +1 each (cap +3)
  - Control time: +1 per full 60 sec (cap +3)
  - Submission attempts: +1 each (cap +3)
  - Reversals: +1 each (cap +2)
- Fight caps: 3-round max +8, 5-round max +10
- If pick wins: award full computed performance (capped)
- If pick loses: award 50% of computed performance (rounded down, capped)

**Finish/Early Bonuses**:
- Early finish boost (win by finish): R1 +5, R2 +3, R3 +1; Championship R4/R5 +1

**Technique Rarity Multiplier (finish only)**:
- Tier S: ×1.30; Tier A: ×1.15; Tier B: ×1.05; Decision: ×1.00

**Underdog Multiplier (win only; closing odds; skip if missing)**:
- +100 to +199 → ×1.10
- +200 to +399 → ×1.20
- +400+ → ×1.35

**Context & Penalties**:
- Title fight win: +2
- Short-notice winner (≤10 days): +2
- Missed weight: –2
- DQ loss: –5
- No contest: +1 participation only

**Captain**:
- One fighter gets ×1.25 on their final total

**Application Order**:
1) Base prediction → 2) Performance overlay → 3) Early finish boost → 4) Context/penalties → 5) Technique rarity multiplier (excludes performance) → 6) Underdog multiplier (win only; includes performance) → 7) Captain ×1.25

#### 5.4 Leagues & Contests
- League types: Global (default per event), Public, Private (invite link/code)
- A League contains multiple event contests (one per UFC event)
- Roster visibility: show opponents’ picks after lock
- Duplicate prevention per matchup

#### 5.5 Coins (Optional Side Economy)
- Stake Coins on your own pick before lock:
  - Winner (low payout)
  - Winner + Method (medium)
  - Winner + Method + Round (high)
- Payouts v1: fixed tiers (configurable); odds-based later
- Coins never affect leaderboard points; refund if fight is cancelled after lock

#### 5.6 Tie-Breakers
- 1) Fewest roster edits before lock
- 2) Earliest lineup submission

#### 5.7 Leaderboards
- Event Leaderboard: per League and Global
- Season Leaderboard (optional): sum each player’s best N event scores

### 6. User Account System

#### 6.1 Authentication
- Email/password signup
- Google OAuth
- Password reset flow
- Email verification

#### 6.2 User Profile (`/profile`)
- Avatar upload
- Display name
- Bio (optional)
- Favorite fighters
- Fantasy stats summary
- Account settings

#### 6.3 Settings
- Time zone preference
- Email notifications (Phase 2)
- Privacy settings
- Account deletion option

### 7. Admin Features

#### 7.1 Data Management (`/admin`)
- Upload scraped JSON data
- Manual fight result entry
- Fantasy scoring triggers
- User management
- Content moderation

#### 7.2 Fantasy Administration
- Lock/unlock events
- Trigger scoring calculation
- Adjust point values via rules config
- Resolve disputes

## User Flows

### Flow 1: Discovering an Event
1. User lands on home page
2. Sees upcoming event with countdown
3. Clicks on event card
4. Views full fight card
5. Clicks on fighter name
6. Explores fighter profile
7. Returns to event page
8. Sets reminder (Phase 2)

### Flow 2: Entering a Fantasy Contest
1. User navigates to Fantasy hub
2. Selects upcoming event contest
3. Enters team builder
4. Makes one pick per main-card fight (winner + method + round)
5. Optionally selects a Captain and writes free-text
6. Optionally stakes Coins on picks
7. Submission locks automatically at deadline

### Flow 3: Checking Rankings
1. User clicks Rankings nav item
2. Selects weight division
3. Views champion and top 15
4. Clicks on fighter for profile
5. Compares fighters in division

### Flow 4: Post-Event Fantasy Scoring
1. Event concludes
2. Admin uploads results (technique, odds, narrative tags)
3. System calculates points (prediction-first with performance overlay)
4. User checks leaderboard
5. Views per-fight scoring breakdown
6. Shares results (Phase 2)

## Success Metrics

### User Engagement
- Daily active users
- Events viewed per session
- Fantasy contest entry rate
- Return user rate (weekly cadence)

### Fantasy Metrics
- Entries created per event
- User retention event-to-event
- Average edits before lock
- Leaderboard participation rate

### Technical Metrics
- Page load time < 2 seconds
- Mobile responsive score > 95
- API response time < 500ms
- Zero downtime during events

## Technical Requirements

### Performance
- Lighthouse score > 90
- Mobile-first responsive design
- Offline capability for viewing (Phase 2)
- CDN for fighter images

### Browser Support
- Chrome (last 2 versions)
- Safari (last 2 versions)
- Firefox (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode support

## Monetization Strategy (Phase 2)

### Freemium Model
**Free Tier**:
- View all events and fighters
- Enter one fantasy contest per event
- Access global leaderboard

**Premium Tier** ($5/month):
- Private leagues
- Advanced statistics
- Ad-free experience
- Early access to features

### Event Pass ($1)
- Single event fantasy access
- Good for casual users

## Risk Mitigation

### Data Risks
- **Risk**: Scraping blocked by source sites
- **Mitigation**: Multiple data sources, manual fallback

### Legal Risks
- **Risk**: Copyright on fighter images
- **Mitigation**: Use official UFC API if available, or licensed images

### Technical Risks
- **Risk**: High traffic during major events
- **Mitigation**: Auto-scaling, CDN, caching strategy

### User Adoption Risks
- **Risk**: Low fantasy participation
- **Mitigation**: Simple scoring, clear UI, free entry, social hooks

## Future Roadmap

### Phase 2 (Post-MVP)
- Private fantasy leagues
- Push notifications
- Social features (following, sharing)
- Advanced fighter analytics
- Odds-based coin payouts

### Phase 3
- Mobile native apps
- Live fight tracking
- AI-powered insights
- Fighter comparison tools
- Training camp updates

### Phase 4
- Real-money wagering (compliance)
- Podcast/media integration
- Fighter AMA platform
- VIP experiences
- Merchandise store

## Appendix

### Glossary
- **KO**: Knockout
- **TKO**: Technical Knockout
- **SUB**: Submission
- **DEC**: Decision (Unanimous, Split, Majority)
- **NC**: No Contest
- **P4P**: Pound-for-Pound
- **Significant Strikes**: Power strikes that cause visible impact
- **Control Time**: Time spent in dominant position
- **Tale of the Tape**: Side-by-side fighter comparison

### Weight Divisions
1. Heavyweight (266 lbs)
2. Light Heavyweight (205 lbs)
3. Middleweight (185 lbs)
4. Welterweight (170 lbs)
5. Lightweight (155 lbs)
6. Featherweight (145 lbs)
7. Bantamweight (135 lbs)
8. Flyweight (125 lbs)
9. Women's Featherweight (145 lbs)
10. Women's Bantamweight (135 lbs)
11. Women's Flyweight (125 lbs)
12. Women's Strawweight (115 lbs) 