# CageSide Companion - Product Requirements Document

## Executive Summary
CageSide Companion is a web-based UFC companion application featuring real-time event tracking, comprehensive fighter profiles, division rankings, and an engaging Fantasy UFC game mode where users build fighter teams and compete for points based on real fight outcomes.

## Project Scope

### In Scope (MVP)
- **Platform**: Web application (responsive, mobile-friendly)
- **Core Features**: 
  - UFC event browsing with countdowns
  - Fighter profiles and statistics
  - Division rankings
  - Fantasy UFC team building and scoring
- **Data Strategy**: Mock data first, real scraped data integration later
- **User Management**: Authentication and user profiles via Firebase

### Out of Scope (Future Phases)
- Native mobile applications (iOS/Android)
- Desktop Electron application
- Second screen features
- AI fight predictions
- Fight Camp Planner
- Private fantasy leagues
- Live fight tracking
- Betting integration

## Core User Personas

### 1. Casual UFC Fan
- **Needs**: Easy access to upcoming events, fighter info, understanding of rankings
- **Goals**: Stay informed about UFC events, learn about fighters
- **Pain Points**: Information scattered across multiple sites

### 2. Fantasy Sports Enthusiast
- **Needs**: Strategic team building, clear scoring system, competitive leaderboards
- **Goals**: Win fantasy competitions, optimize team selection
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

### 5. Fantasy UFC System

#### 5.1 Fantasy Hub (`/fantasy`)
**Landing Page**:
- Current/upcoming fantasy contests
- "Create Your Team" CTA
- Global leaderboard preview
- Your active teams
- Fantasy scoring explanation

#### 5.2 Team Builder (`/fantasy/team-builder`)
**Event Selection**:
- Choose from upcoming events only
- Show event date and lock time
- Display total prize pool (if applicable)

**Fighter Selection Interface**:
- All fighters on the card with:
  - Photo and name
  - Salary/cost
  - Projected points (Phase 2)
  - Recent fantasy performance
- Budget tracker: $10,000 total
- Team slots: 5 fighters required
- Duplicate prevention
- Auto-save draft functionality

**Team Constraints**:
- Cannot pick both fighters from same matchup
- Budget limit enforcement
- Minimum 5 fighters required
- Lock time: 15 minutes before first prelim

#### 5.3 Scoring System
**Base Points**:
- Participation: +2
- Win: +10
- Loss: -5

**Finish Bonuses**:
- KO/TKO: +12
- Submission: +12
- Decision: +6

**Round Bonuses** (for finishes):
- Round 1: +8
- Round 2: +6
- Round 3: +4
- Round 4: +3
- Round 5: +2

**Performance Points**:
- Knockdown: +3 each
- Significant strikes: +0.1 each (max +10)
- Takedowns: +2 each
- Control time: +1 per 60 seconds
- Submission attempts: +2 each (max +6)

**Special Bonuses**:
- Title fight win: +5
- Underdog win multipliers:
  - +200 to +399 odds: 1.2x
  - +400 and above: 1.5x

**Penalties**:
- Missed weight: -3
- Point deduction: -2 per point
- DQ loss: -10

#### 5.4 Leaderboards (`/fantasy/leaderboard/[event-id]`)
- Real-time scoring updates
- Rank, username, team name, total points
- Expandable to see team composition
- Filter by friends (Phase 2)
- Prize distribution display

#### 5.5 My Teams (`/fantasy/my-teams`)
- Active teams (not yet scored)
- Past teams with scores
- Win/loss record
- Total points earned
- Best finish position

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
- Adjust point values
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

### Flow 2: Building a Fantasy Team
1. User navigates to Fantasy hub
2. Selects upcoming event
3. Enters team builder
4. Reviews available fighters and salaries
5. Selects 5 fighters within budget
6. Saves team as draft
7. Returns before lock time to finalize
8. Team locks automatically at deadline

### Flow 3: Checking Rankings
1. User clicks Rankings nav item
2. Selects weight division
3. Views champion and top 15
4. Clicks on fighter for profile
5. Compares fighters in division

### Flow 4: Post-Event Fantasy Scoring
1. Event concludes
2. Admin uploads results
3. System calculates points
4. User checks leaderboard
5. Views detailed scoring breakdown
6. Shares results (Phase 2)

## Success Metrics

### User Engagement
- Daily active users
- Events viewed per session
- Fantasy team creation rate
- Return user rate (weekly)

### Fantasy Metrics
- Teams created per event
- User retention event-to-event
- Average team modifications before lock
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
- Create one fantasy team per event
- Access to global leaderboard

**Premium Tier** ($5/month):
- Multiple fantasy teams per event
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
- **Mitigation**: Use official UFC API if available, or placeholder images

### Technical Risks
- **Risk**: High traffic during major events
- **Mitigation**: Auto-scaling, CDN, caching strategy

### User Adoption Risks
- **Risk**: Low fantasy participation
- **Mitigation**: Free tier, easy onboarding, clear value prop

## Future Roadmap

### Phase 2 (Post-MVP)
- Private fantasy leagues
- Push notifications
- Social features (following, sharing)
- Advanced fighter analytics
- Prediction game mode

### Phase 3
- Mobile native apps
- Live fight tracking
- AI-powered insights
- Fighter comparison tools
- Training camp updates

### Phase 4
- Betting odds integration
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