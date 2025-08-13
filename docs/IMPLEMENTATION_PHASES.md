# CageSide Companion - Implementation Phases

## Overview
This document outlines the step-by-step implementation plan for CageSide Companion, broken into manageable phases with clear acceptance criteria and time estimates.

## Phase 0: Project Setup & Infrastructure (Day 1)
**Duration**: 4-6 hours

### Tasks
1. **Initialize Next.js Project**
   ```bash
   npx create-next-app@latest cageside-companion --typescript --tailwind --app
   ```

2. **Install Core Dependencies**
   ```bash
   npm install firebase firebase-admin zustand react-query axios date-fns
   npm install -D @types/node
   ```

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
   └── data/
       └── mock/
   ```

5. **Environment Configuration**
   - Setup `.env.local` with Firebase credentials
   - Configure Vercel project
   - Setup GitHub repository

### Acceptance Criteria
- [ ] App runs locally with `npm run dev`
- [ ] Firebase Auth signup/login works
- [ ] Protected routes redirect when not authenticated
- [ ] App deploys successfully to Vercel
- [ ] TypeScript configured with strict mode
- [ ] Tailwind CSS working with dark mode support

---

## Phase 1: Mock Data & Core Pages (Days 2-3)
**Duration**: 1.5-2 days

### Tasks

#### 1.1 Create Mock Data (2 hours)
```typescript
// data/mock/fighters.json
// data/mock/events.json
// data/mock/rankings.json
// data/mock/fights.json
```

#### 1.2 Data Service Layer (3 hours)
```typescript
// services/dataService.ts
// services/mockDataLoader.ts
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
- [ ] All pages render with mock data
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

## Phase 3: Fantasy Core - Team Builder (Days 5-7)
**Duration**: 3 days

### Tasks

#### 3.1 Fantasy Data Models (3 hours)
- League schema
- Team schema
- Salary schema
- Scoring rules configuration

#### 3.2 Fantasy Hub Page (4 hours)
- `/fantasy` - Landing page
- Upcoming contests display
- Join contest CTA
- Rules explanation
- User's active teams

#### 3.3 Team Builder UI (8 hours)
- `/fantasy/team-builder/[eventId]`
- Fighter selection interface
- Budget tracker component
- Team slots (5 fighters)
- Salary display per fighter
- Auto-save functionality

#### 3.4 Team Management Logic (6 hours)
- Budget validation
- Duplicate prevention
- Same-fight restriction
- Draft saving to Firestore
- Team locking mechanism
- Time-based lock enforcement

#### 3.5 My Teams Page (3 hours)
- `/fantasy/my-teams`
- Active teams list
- Past teams with scores
- Edit draft teams
- Delete functionality

### Acceptance Criteria
- [ ] User can select event and enter team builder
- [ ] Budget tracker updates in real-time
- [ ] Cannot exceed $10,000 budget
- [ ] Cannot pick both fighters from same matchup
- [ ] Must select exactly 5 fighters
- [ ] Draft saves automatically
- [ ] Teams lock 15 minutes before event
- [ ] Locked teams cannot be edited
- [ ] My Teams page shows all user teams

---

## Phase 4: Fantasy Scoring Engine (Days 8-9)
**Duration**: 2 days

### Tasks

#### 4.1 Scoring Calculator (4 hours)
```typescript
// services/scoringEngine.ts
// utils/fantasyScoring.ts
```
- Implement all scoring rules
- Handle edge cases
- Underdog multipliers
- Penalty calculations

#### 4.2 Admin Results Import (3 hours)
- `/admin/results` - Admin only page
- JSON upload interface
- Results validation
- Batch processing

#### 4.3 Score Processing (4 hours)
- Process fight results
- Calculate points per fighter
- Update team totals
- Store score events
- Idempotent processing

#### 4.4 Leaderboard (3 hours)
- `/fantasy/leaderboard/[eventId]`
- Real-time ranking
- Score breakdown modal
- Pagination
- Search functionality

#### 4.5 Testing & Validation (2 hours)
- Unit tests for scoring logic
- Integration tests for processing
- Manual testing with various scenarios

### Acceptance Criteria
- [ ] Admin can upload results JSON
- [ ] Points calculate correctly per scoring rules
- [ ] All bonuses apply properly
- [ ] Underdog multipliers work
- [ ] Penalties deduct correctly
- [ ] Team totals update after scoring
- [ ] Leaderboard ranks correctly
- [ ] Tie-breakers work (submission time)
- [ ] Re-running scoring is idempotent

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

#### 6.1 Scraper Development (8 hours)
```javascript
// scrapers/ufcStats.js
// scrapers/espn.js
// scrapers/ufcRankings.js
```
- Fighter data scraper
- Event data scraper
- Rankings scraper
- Results scraper

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
- Migrate from mock to real data
- Verify data integrity
- Update references
- Test all features

### Acceptance Criteria
- [ ] Scrapers fetch accurate data
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
- Fantasy team creation flow
- Scoring verification
- Payment flow (if implemented)

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
- Multiple team entries
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
- 50+ fantasy teams per event
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