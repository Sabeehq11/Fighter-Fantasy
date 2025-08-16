# Fighter Fantasy - Implementation Phases

## Overview
This document outlines the step-by-step implementation plan for Fighter Fantasy, broken into manageable phases with clear acceptance criteria and time estimates.

## Phase 0: Project Setup & Infrastructure (Day 1)
**Duration**: 4-6 hours

### Tasks
1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest fighter-fantasy --typescript --tailwind --app
   ```

2. **Install Core Dependencies**
   ```bash
   npm install firebase firebase-admin zustand @tanstack/react-query axios date-fns
   npm install -D @types/node
   ```
   
   Note: UI components (Card, Button, Badge, etc.) will be built custom or use shadcn/ui during Phase 1

3. **Setup Firebase Project**
- Create Firebase project in console
- Enable Authentication (Email/Password + Google)
- Create Firestore database
- Generate service account key
- Configure security rules

4. **Project Structure**
```
src/
├── app/
│   ├── (auth)/
│   ├── (main)/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   └── features/
├── lib/
│   ├── firebase/
│   ├── utils/
│   └── hooks/
├── services/
├── store/
├── types/
└── scripts/
    └── seed.ts
```

5. **Environment Configuration**
- Setup `.env.local` with Firebase credentials
- Configure Vercel project
- Setup GitHub repository

### Acceptance Criteria
- [ ] App runs locally with `npm run dev`
- [ ] App deploys successfully to Vercel
- [ ] TypeScript configured with strict mode
- [ ] Tailwind CSS working with dark mode support

---

## Phase 1: Dev Firestore Seed & Core Pages (Days 2-3)
**Duration**: 1.5-2 days

### Tasks

#### 1.1 Seed Dev Firestore (2 hours)
```bash
# scripts/seed.ts - seeds Firestore dev project using env creds
```
- Seed initial fighters, events, fights, rankings into dev Firestore
- No local JSON mocks; use Firestore as the source

#### 1.2 Data Service Layer (3 hours)
```typescript
// services/dataService.ts
// services/firestore.ts
```

#### 1.3 Layout Components (2 hours)
- Navigation bar with links
- Footer
- Page container
- Loading states
- Error boundaries

#### 1.4 Home Page (3 hours)
- Event countdown cards
- Upcoming events grid
- Past events section
- Quick stats dashboard

#### 1.5 Events Pages (4 hours)
- `/events` - List view with filters
- `/events/[id]` - Event detail with fight card
- Fight matchup cards
- Tale of the tape component

#### 1.6 Fighters Pages (4 hours)
- `/fighters` - Grid view with search/filters
- `/fighters/[id]` - Fighter profile
- Division tabs
- Fighter stats visualization

#### 1.7 Rankings Page (2 hours)
- `/rankings` - Division selector
- Champion showcase
- Top 15 list with movement indicators

### Acceptance Criteria
- [ ] All pages render using Firestore dev dataset
- [ ] Search functionality works on fighters page
- [ ] Filter by division works
- [ ] Event countdown shows correct time
- [ ] Fighter profiles show complete information
- [ ] Rankings display champion and top 15
- [ ] Mobile responsive on all pages
- [ ] Dark theme consistent throughout

---

## Phase 2: Authentication & User System (Day 4)
**Duration**: 1 day

### Tasks

#### 2.1 Auth Context & Hooks (2 hours)
```typescript
// contexts/AuthContext.tsx
// hooks/useAuth.ts
// hooks/useUser.ts
```

#### 2.2 Auth Pages (3 hours)
- `/login` - Email/password and Google OAuth
- `/signup` - Registration with validation
- `/forgot-password` - Password reset flow
- Email verification handling

#### 2.3 User Profile (2 hours)
- `/profile` - User profile page
- Edit profile form
- Avatar upload
- Favorite fighters selection

#### 2.4 Protected Routes (1 hour)
- Middleware for route protection
- Role-based access control
- Redirect logic

### Acceptance Criteria
- [ ] Users can sign up with email/password
- [ ] Google OAuth works
- [ ] Password reset emails sent
- [ ] Profile updates save to Firestore
- [ ] Protected routes require authentication
- [ ] User session persists on refresh
- [ ] Logout clears session properly

---

## Phase 3: Fantasy Core - Prediction Contest (Days 5-7)
**Duration**: 3 days

### Tasks

#### 3.1 Fantasy Data Models (3 hours)
- League schema (global/public/private, main_card_prediction)
- Entry schema (picks per main-card fight, captain, lock fields)
- Scoring rules configuration (admin-configurable)

#### 3.2 Fantasy Hub Page (4 hours)
- `/fantasy` - Landing page
- Upcoming contests display
- Join contest CTA
- Rules explanation
- User's active teams (entries)

#### 3.3 Team Builder UI (8 hours)
- `/fantasy/team-builder/[eventId]` (builder)
- Picks list: select fighter + method + round per fight
- Captain selection (×1.25) for exactly one fighter (optional)
- Free-text prediction field per fight (optional)
- Auto-save functionality

#### 3.4 Entry Management Logic (6 hours)
- One pick per main-card fight enforcement
- Duplicate-prevention per matchup
- Lock policy: 15 minutes before main card
- Lineup visibility: after lock or after first fight (config)
- Edit count tracking (for tie-breakers)
- Submission timestamp tracking

#### 3.5 My Teams Page (3 hours)
- `/fantasy/my-teams` (shows entries)
- Active teams list
- Past teams (entries) with scores
- Edit draft entries before lock
- Delete draft entries

### Acceptance Criteria
- [ ] User can select event and enter builder
- [ ] Must make one pick per main-card fight
- [ ] Cannot pick both fighters from same matchup
- [ ] Draft saves automatically
- [ ] Entries lock 15 minutes before main card
- [ ] Locked entries cannot be edited
- [ ] My Teams page shows all user entries
- [ ] Captain can be assigned to exactly one fighter and reflected in draft state

---

## Phase 4: Fantasy Scoring Engine (Days 8-9)
**Duration**: 2 days

### Tasks

#### 4.1 Scoring Calculator (4 hours)
```typescript
// services/scoringEngine.ts
// utils/fantasyScoring.ts
```
- Implement prediction base points
- Implement performance overlay (weights, subcaps, fight caps, lose multiplier)
- Early finish boost
- Rarity multipliers
- Underdog multipliers (win-only; skip if odds missing)
- Context & penalties
- Captain multiplier (×1.25)
- Application order per spec

#### 4.2 Admin Results Import (3 hours)
- `/admin/results` - Admin only page
- JSON upload interface
- Include technique, narrative tags, closing odds snapshot
- Results validation
- Batch processing

#### 4.3 Score Processing (4 hours)
- Process fight results
- Calculate points per pick
- Update entry totals
- Store score events
- Idempotent processing

#### 4.4 Leaderboard (3 hours)
- `/fantasy/leaderboard/[eventId]`
- Real-time ranking
- Per-pick accuracy breakdown modal
- Pagination
- Search functionality

#### 4.5 Season Overlay (optional) (4 hours)
- Best-N aggregation configuration per league
- Season leaderboard: aggregate user totals across window
- Tie-breakers (season): highest single-event score, then earliest total reached

#### 4.6 Testing & Validation (2 hours)
- Unit tests for scoring logic
- Integration tests for processing
- Manual testing with various scenarios

### Acceptance Criteria
- [ ] Admin can upload results JSON
- [ ] Points calculate correctly per scoring rules
- [ ] All boosts/multipliers apply in correct order
- [ ] Underdog multipliers work (win-only)
- [ ] Penalties deduct correctly
- [ ] Entry totals update after scoring
- [ ] Leaderboard ranks correctly
- [ ] Event tie-breakers work (fewest edits → earliest submission)
- [ ] Re-running scoring is idempotent
- [ ] Accuracy breakdown shows components in order

---

## Phase 5: Polish & Performance (Days 10-11)
**Duration**: 2 days

### Tasks

#### 5.1 UI/UX Polish (6 hours)
- Loading skeletons
- Smooth transitions
- Hover effects
- Empty states
- Error messages
- Success notifications

#### 5.2 Performance Optimization (4 hours)
- Image lazy loading
- Code splitting
- Bundle optimization
- Caching strategy
- Database queries optimization

#### 5.3 Mobile Optimization (3 hours)
- Touch interactions
- Swipe gestures
- Mobile navigation
- Responsive tables
- Form optimizations

#### 5.4 SEO & Meta Tags (2 hours)
- Dynamic meta tags
- Open Graph tags
- Structured data
- Sitemap generation
- Robots.txt

#### 5.5 Analytics Setup (1 hour)
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring

### Acceptance Criteria
- [ ] Lighthouse score > 90
- [ ] All images optimized
- [ ] No layout shifts
- [ ] Smooth animations (60fps)
- [ ] Mobile gestures work
- [ ] SEO tags present on all pages
- [ ] Analytics tracking key events
- [ ] Error reporting configured

---

## Phase 6: Data Integration (Days 12-14)
**Duration**: 2-3 days

### Tasks

#### 6.1 Firecrawl Integration (8 hours)
```typescript
// services/firecrawl.ts
// transforms/ufcStats.ts
// transforms/espn.ts
// transforms/ufcRankings.ts
```
- Configure Firecrawl API client
- Fighter data extraction & transform
- Event data extraction & transform
- Rankings extraction & transform
- Results extraction & transform

#### 6.2 Data Pipeline (4 hours)
- Data validation
- Deduplication logic
- ID generation
- Error handling
- Retry mechanism

#### 6.3 Admin Sync Interface (3 hours)
- `/admin/data-sync`
- Manual sync triggers
- Preview changes
- Rollback capability
- Sync status monitoring

#### 6.4 Automated Updates (3 hours)
- Cloud Functions setup
- Scheduled scraping
- Change detection
- Notification system

#### 6.5 Data Migration (2 hours)
- Migrate seeded dev dataset to scraper-backed Firestore data
- Verify data integrity
- Update references
- Test all features

### Acceptance Criteria
- [ ] Firecrawl extracts accurate data
- [ ] Data validates against schema
- [ ] No duplicate entries created
- [ ] Admin can trigger manual sync
- [ ] Preview shows what will change
- [ ] Automated updates run on schedule
- [ ] All features work with real data
- [ ] Historical data preserved

---

## Phase 7: Testing & Launch Prep (Day 15)
**Duration**: 1 day

### Tasks

#### 7.1 End-to-End Testing (3 hours)
- Complete user flow testing
- Fantasy contest entry flow
- Scoring verification

#### 7.2 Cross-Browser Testing (2 hours)
- Chrome
- Safari
- Firefox
- Edge
- Mobile browsers

#### 7.3 Load Testing (1 hour)
- Simulate concurrent users
- Database stress test
- API rate limiting

#### 7.4 Security Audit (2 hours)
- Authentication flows
- Data access permissions
- Input validation
- XSS prevention

#### 7.5 Documentation (2 hours)
- User guide
- Admin guide
- API documentation
- Deployment guide

### Acceptance Criteria
- [ ] All user flows work end-to-end
- [ ] No console errors in production
- [ ] Works on all major browsers
- [ ] Handles 100+ concurrent users
- [ ] Security best practices followed
- [ ] Documentation complete
- [ ] Backup and recovery tested

---

## Optional Phase 8: Monetization (2 days)
**Duration**: 1-2 days (if needed)

### Tasks

#### 8.1 Stripe Integration (4 hours)
- Setup Stripe account
- Payment processing
- Webhook handling
- Subscription management

#### 8.2 Premium Features (3 hours)
- Gate premium content
- Multiple contest entries per event (if enabled)
- Advanced statistics
- Ad removal

#### 8.3 Billing Pages (3 hours)
- Pricing page
- Checkout flow
- Billing management
- Invoice history

### Acceptance Criteria
- [ ] Payment processing works
- [ ] Subscriptions auto-renew
- [ ] Premium features unlock after payment
- [ ] Billing history accessible
- [ ] Refund process documented

---

## Daily Development Workflow

### Morning (First 2 hours)
1. Review previous day's work
2. Check for any production issues
3. Plan day's tasks
4. Update project board

### Development (4-6 hours)
1. Work on current phase tasks
2. Commit frequently with clear messages
3. Test as you build
4. Document any decisions or changes

### Evening (Last hour)
1. Deploy to staging
2. Run tests
3. Update progress tracker
4. Prepare for next day

---

## Risk Mitigation Strategies

### Technical Risks
| Risk | Mitigation |
|------|------------|
| Firebase quota exceeded | Implement caching, optimize queries |
| Scraping blocked | Multiple data sources, manual fallback |
| Performance issues | Progressive loading, pagination |
| Data inconsistency | Validation layers, audit logs |

### Timeline Risks
| Risk | Mitigation |
|------|------------|
| Feature creep | Strict MVP scope, defer nice-to-haves |
| Technical debt | Regular refactoring sessions |
| Testing delays | Test as you build, automated tests |
| Deployment issues | Staging environment, rollback plan |

---

## Success Metrics

### Technical Metrics
- Page load time < 2s
- API response time < 500ms
- 99.9% uptime
- Zero critical bugs in production

### User Metrics
- User registration rate > 10%
- Fantasy participation > 30% of users
- Return user rate > 50%
- Average session > 5 minutes

### Business Metrics
- 100+ active users in first month
- 50+ fantasy entries per event
- Premium conversion > 5%
- User satisfaction > 4/5

---

## Post-Launch Roadmap

### Month 1
- Bug fixes and stability
- User feedback collection
- Performance optimization
- Content updates

### Month 2
- Private leagues
- Social features
- Mobile app planning
- Advanced analytics

### Month 3
- Mobile app development
- AI predictions
- Live scoring
- Partnership discussions

---

## Resources & References

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- Figma for design
- Linear for project management
- GitHub for version control
- Vercel for deployment
- Firebase Console for backend

### Support
- Discord community
- Stack Overflow
- GitHub Issues
- Firebase Support 