# Fighter Fantasy - UI Components & Page Layouts

## Design System

### Color Palette
```css
/* Dark Theme (Primary) */
--bg-primary: #0a0a0a;        /* Main background */
--bg-secondary: #1a1a1a;      /* Card backgrounds */
--bg-tertiary: #2a2a2a;       /* Elevated surfaces */

--text-primary: #ffffff;       /* Main text */
--text-secondary: #a0a0a0;    /* Secondary text */
--text-muted: #707070;        /* Muted text */

--accent-red: #dc2626;        /* UFC Red */
--accent-gold: #fbbf24;       /* Championship Gold */
--accent-green: #10b981;      /* Success/Win */
--accent-blue: #3b82f6;       /* Links/Info */

--border: #333333;            /* Borders */
--border-light: #262626;      /* Subtle borders */
```

### Typography
```css
/* Font Stack */
--font-heading: 'Bebas Neue', 'Impact', sans-serif;
--font-body: 'Inter', 'Roboto', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */
```

### Spacing System
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   ├── SearchBar
│   │   └── UserMenu
│   ├── Main (Router Outlet)
│   └── Footer
│
├── Pages
│   ├── HomePage
│   │   ├── HeroSection
│   │   ├── EventCountdown
│   │   ├── UpcomingEvents
│   │   └── QuickStats
│   │
│   ├── EventsPage
│   │   ├── EventFilters
│   │   ├── EventGrid
│   │   └── EventCard
│   │
│   ├── EventDetailPage
│   │   ├── EventHeader
│   │   ├── FightCard
│   │   │   ├── MainCard
│   │   │   ├── Prelims
│   │   │   └── EarlyPrelims
│   │   └── FightMatchup
│   │
│   ├── FightersPage
│   │   ├── DivisionTabs
│   │   ├── FighterFilters
│   │   ├── FighterGrid
│   │   └── FighterCard
│   │
│   ├── FighterProfilePage
│   │   ├── FighterHero
│   │   ├── FighterStats
│   │   ├── FightHistory
│   │   └── CareerHighlights
│   │
│   ├── RankingsPage
│   │   ├── DivisionSelector
│   │   ├── ChampionCard
│   │   └── RankingsList
│   │
│   ├── FantasyHub
│   │   ├── FantasyHero
│   │   ├── ActiveContests
│   │   ├── MyTeams
│   │   └── Leaderboard
│   │
│   └── TeamBuilder
│       ├── EventSelector
│       ├── BudgetTracker
│       ├── FighterSelector
│       ├── TeamRoster
│       └── SaveControls
│
└── SharedComponents
    ├── Card
    ├── Button
    ├── Modal
    ├── Skeleton
    ├── Countdown
    ├── Avatar
    ├── Badge
    └── Toast
```

## Page Layouts

### 1. Home Page Layout
```tsx
// components/pages/HomePage.tsx
<div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary">
  {/* Hero Section */}
  <section className="relative h-[70vh] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 to-transparent z-10" />
    <img src="/hero-bg.jpg" className="absolute inset-0 w-full h-full object-cover" />
    <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-heading text-white mb-4">
          NEXT FIGHT NIGHT
        </h1>
        <EventCountdown eventId="ufc_310" />
        <Button size="lg" className="mt-6">
          View Full Card
        </Button>
      </div>
    </div>
  </section>

  {/* Upcoming Events */}
  <section className="container mx-auto px-4 py-12">
    <h2 className="text-3xl font-heading mb-8">Upcoming Events</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  </section>

  {/* Quick Stats Dashboard */}
  <section className="bg-bg-secondary py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Active Fighters" value="642" icon="users" />
        <StatCard title="Events This Year" value="42" icon="calendar" />
        <StatCard title="Title Fights" value="18" icon="trophy" />
        <StatCard title="Fantasy Players" value="12.5K" icon="gamepad" />
      </div>
    </div>
  </section>
</div>
```

### 2. Event Detail Page Layout
```tsx
// components/pages/EventDetailPage.tsx
<div className="min-h-screen bg-bg-primary">
  {/* Event Header */}
  <div className="bg-gradient-to-r from-accent-red to-accent-red/50 py-8">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-heading text-white mb-2">
            {event.name}
          </h1>
          <div className="flex items-center gap-4 text-white/80">
            <span>{formatDate(event.date)}</span>
            <span>•</span>
            <span>{event.venue.name}</span>
          </div>
        </div>
        <EventCountdown compact eventId={event.id} />
      </div>
    </div>
  </div>

  {/* Fight Card Tabs */}
  <div className="container mx-auto px-4 py-8">
    <Tabs defaultValue="main-card">
      <TabsList>
        <TabsTrigger value="main-card">Main Card</TabsTrigger>
        <TabsTrigger value="prelims">Prelims</TabsTrigger>
        <TabsTrigger value="early-prelims">Early Prelims</TabsTrigger>
      </TabsList>

      <TabsContent value="main-card">
        <div className="space-y-4 mt-6">
          {mainCardFights.map(fight => (
            <FightMatchup key={fight.id} fight={fight} featured />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  </div>
</div>
```

### 3. Fighter Profile Layout
```tsx
// components/pages/FighterProfilePage.tsx
<div className="min-h-screen bg-bg-primary">
  {/* Fighter Hero */}
  <div className="relative h-[400px] overflow-hidden">
    <img 
      src={fighter.hero_image_url} 
      className="absolute inset-0 w-full h-full object-cover opacity-30"
    />
    <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
      <div className="flex items-end gap-8">
        <img 
          src={fighter.profile_image_url}
          className="w-32 h-32 rounded-full border-4 border-accent-red"
        />
        <div>
          <h1 className="text-5xl font-heading text-white">
            {fighter.name}
          </h1>
          <p className="text-xl text-accent-gold">{fighter.nickname}</p>
          <div className="flex items-center gap-4 mt-2">
            <Badge variant="champion">Champion</Badge>
            <span className="text-white/60">{fighter.division}</span>
            <span className="text-white/60">{fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Stats Grid */}
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Physical Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Attributes</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <StatRow label="Height" value={`${fighter.height_inches}"`} />
            <StatRow label="Reach" value={`${fighter.reach_inches}"`} />
            <StatRow label="Stance" value={fighter.stance} />
            <StatRow label="Age" value={fighter.age} />
          </dl>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Fight Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <StatRow label="Sig. Strikes/Min" value={fighter.stats.sig_strikes_per_min} />
            <StatRow label="Strike Accuracy" value={`${fighter.stats.sig_strike_accuracy}%`} />
            <StatRow label="Takedown Avg" value={fighter.stats.takedown_avg} />
            <StatRow label="Takedown Defense" value={`${fighter.stats.takedown_defense}%`} />
          </dl>
        </CardContent>
      </Card>

      {/* Record Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Record Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <ProgressBar label="KO/TKO" value={fighter.finishes.ko_tko} max={fighter.record.wins} />
            <ProgressBar label="Submission" value={fighter.finishes.submissions} max={fighter.record.wins} />
            <ProgressBar label="Decision" value={fighter.finishes.decisions} max={fighter.record.wins} />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Fight History */}
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Fight History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {fightHistory.map(fight => (
            <FightHistoryRow key={fight.id} fight={fight} />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
</div>
```

### 4. Fantasy Team Builder Layout
```tsx
// components/pages/TeamBuilder.tsx
<div className="min-h-screen bg-bg-primary">
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Fighter Selection (Left - 2 cols) */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Your Fighters</CardTitle>
            <CardDescription>Choose 5 fighters for UFC {event.number}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="All Fights" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fights</SelectItem>
                  <SelectItem value="main">Main Card</SelectItem>
                  <SelectItem value="prelims">Prelims</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Search fighters..." />
            </div>

            {/* Fighter List */}
            <div className="space-y-2">
              {availableFighters.map(fighter => (
                <FighterSelectionCard
                  key={fighter.id}
                  fighter={fighter}
                  salary={salaries[fighter.id]}
                  onSelect={handleSelect}
                  isSelected={isSelected(fighter.id)}
                  isDisabled={isDisabled(fighter.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Roster (Right - 1 col) */}
      <div className="space-y-6">
        {/* Budget Tracker */}
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Remaining</span>
                <span className={remainingBudget < 0 ? 'text-red-500' : 'text-green-500'}>
                  ${remainingBudget.toLocaleString()}
                </span>
              </div>
              <Progress value={(10000 - remainingBudget) / 100} />
              <div className="text-sm text-muted">
                ${usedBudget.toLocaleString()} of $10,000 used
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Team */}
        <Card>
          <CardHeader>
            <CardTitle>Your Team ({selectedFighters.length}/5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(slot => {
                const fighter = selectedFighters[slot - 1];
                return (
                  <TeamSlot
                    key={slot}
                    slot={slot}
                    fighter={fighter}
                    onRemove={handleRemove}
                  />
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              <Button 
                className="w-full" 
                disabled={selectedFighters.length !== 5 || remainingBudget < 0}
              >
                Save Team
              </Button>
              <Button variant="outline" className="w-full">
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lock Timer */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Team Lock Time</AlertTitle>
          <AlertDescription>
            Teams lock 15 minutes before the first fight
            <div className="mt-2 font-mono text-lg">
              <Countdown to={lockTime} />
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  </div>
</div>
```

## Core Components

### 1. EventCard Component
```tsx
interface EventCardProps {
  event: Event;
  featured?: boolean;
}

export function EventCard({ event, featured }: EventCardProps) {
  return (
    <Card className={cn(
      "group hover:border-accent-red transition-all cursor-pointer",
      featured && "col-span-full lg:col-span-2"
    )}>
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={event.poster_url} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <div className="absolute top-4 right-4">
          <Badge variant={event.type === 'PPV' ? 'premium' : 'default'}>
            {event.type}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-xl font-heading mb-2">{event.name}</h3>
        <div className="flex items-center justify-between text-sm text-muted">
          <span>{formatDate(event.date_utc)}</span>
          <span>{event.venue.city}</span>
        </div>
        {featured && (
          <div className="mt-4">
            <Countdown to={event.date_utc} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 2. FightMatchup Component
```tsx
interface FightMatchupProps {
  fight: Fight;
  featured?: boolean;
}

export function FightMatchup({ fight, featured }: FightMatchupProps) {
  return (
    <Card className={cn(
      "overflow-hidden",
      featured && "border-accent-gold"
    )}>
      <CardContent className="p-0">
        <div className="grid grid-cols-3 items-center p-6">
          {/* Fighter A */}
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-2">
              <AvatarImage src={fighterA.profile_image_url} />
            </Avatar>
            <h4 className="font-semibold">{fighterA.name}</h4>
            <p className="text-sm text-muted">
              {fighterA.record.wins}-{fighterA.record.losses}
            </p>
            {fight.odds && (
              <Badge variant="outline" className="mt-2">
                {fight.odds.fighter_a > 0 ? '+' : ''}{fight.odds.fighter_a}
              </Badge>
            )}
          </div>

          {/* VS */}
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-red mb-2">VS</div>
            <Badge variant={fight.is_title_fight ? 'championship' : 'default'}>
              {fight.weight_class}
            </Badge>
            {fight.is_title_fight && (
              <p className="text-xs text-accent-gold mt-1">Title Fight</p>
            )}
          </div>

          {/* Fighter B */}
          <div className="text-center">
            <Avatar className="w-20 h-20 mx-auto mb-2">
              <AvatarImage src={fighterB.profile_image_url} />
            </Avatar>
            <h4 className="font-semibold">{fighterB.name}</h4>
            <p className="text-sm text-muted">
              {fighterB.record.wins}-{fighterB.record.losses}
            </p>
            {fight.odds && (
              <Badge variant="outline" className="mt-2">
                {fight.odds.fighter_b > 0 ? '+' : ''}{fight.odds.fighter_b}
              </Badge>
            )}
          </div>
        </div>

        {/* Result (if completed) */}
        {fight.result && (
          <div className="bg-bg-tertiary px-6 py-3 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-accent-green">
                Winner: {getWinnerName(fight.result.winner_id)}
              </span>
              <span className="text-muted">
                {fight.result.method} • R{fight.result.round}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. FighterCard Component
```tsx
interface FighterCardProps {
  fighter: Fighter;
  onClick?: () => void;
}

export function FighterCard({ fighter, onClick }: FighterCardProps) {
  return (
    <Card 
      className="group hover:border-accent-red transition-all cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={fighter.profile_image_url} />
            <AvatarFallback>{fighter.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-semibold group-hover:text-accent-red transition-colors">
              {fighter.name}
            </h4>
            <p className="text-sm text-muted">{fighter.nickname}</p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span>{fighter.record.wins}-{fighter.record.losses}</span>
              {fighter.isChampion && (
                <Badge variant="championship" className="text-xs">C</Badge>
              )}
              {fighter.ranking && (
                <span className="text-muted">#{fighter.ranking}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <img 
              src={`/flags/${fighter.nationality}.svg`} 
              className="w-6 h-4 ml-auto mb-1"
            />
            <p className="text-xs text-muted">{fighter.division}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 4. Countdown Component
```tsx
interface CountdownProps {
  to: string;
  compact?: boolean;
}

export function Countdown({ to, compact }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(to));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(to));
    }, 1000);
    return () => clearInterval(timer);
  }, [to]);

  if (compact) {
    return (
      <div className="text-2xl font-mono font-bold text-accent-red">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-mono font-bold text-white bg-bg-tertiary rounded-lg px-3 py-2">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}
```

### 5. BudgetTracker Component
```tsx
interface BudgetTrackerProps {
  used: number;
  total: number;
}

export function BudgetTracker({ used, total }: BudgetTrackerProps) {
  const remaining = total - used;
  const percentage = (used / total) * 100;
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Budget</span>
        <span className={cn(
          "text-lg font-bold",
          remaining < 0 ? "text-red-500" : "text-green-500"
        )}>
          ${remaining.toLocaleString()}
        </span>
      </div>
      
      <div className="relative h-3 bg-bg-tertiary rounded-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-y-0 left-0 transition-all",
            percentage > 100 ? "bg-red-500" : percentage > 80 ? "bg-yellow-500" : "bg-green-500"
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted">
        <span>${used.toLocaleString()} used</span>
        <span>${total.toLocaleString()} total</span>
      </div>
    </div>
  );
}
```

## Responsive Breakpoints

```css
/* Tailwind Breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

## Animation Classes

```css
/* Custom animations */
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

.animate-pulse-slow {
  animation: pulse 3s ease-in-out infinite;
}
```

## Loading States

```tsx
// Skeleton Loading Component
export function FighterCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading Grid
export function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <FighterCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

## Empty States

```tsx
export function EmptyState({ 
  title, 
  description, 
  action 
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto mb-4 text-muted">
        <EmptyIcon />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}
```

## Mobile Navigation

```tsx
export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button
        className="lg:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MenuIcon />
      </button>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-[280px]">
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-lg font-semibold">
              Home
            </Link>
            <Link href="/events" className="text-lg font-semibold">
              Events
            </Link>
            <Link href="/fighters" className="text-lg font-semibold">
              Fighters
            </Link>
            <Link href="/rankings" className="text-lg font-semibold">
              Rankings
            </Link>
            <Link href="/fantasy" className="text-lg font-semibold">
              Fantasy
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
``` 

## Fantasy UI Additions

### Captain Toggle (Weekly)
```tsx
// In FighterSelectionCard or TeamSlot
<Button
  variant={isCaptain ? 'champion' : 'outline'}
  onClick={() => onToggleCaptain(fighter.id)}
  disabled={isCaptain ? false : hasCaptainAlready}
>
  {isCaptain ? 'Captain (1.5x)' : 'Set Captain'}
</Button>
```

Rules:
- Exactly one Captain per team when `allow_captain` is true.
- Visual badge on the Captain in roster and scoreboard.

### One-and-Done Pick UI
```tsx
// Simple single-pick UI for season overlay
<div className="space-y-4">
  <DivisionFilter />
  <FighterSearch />
  <FighterGrid onPick={(fighter) => setPick(fighter)} />
  <Button disabled={!pick} onClick={saveOneAndDone}>Submit Pick</Button>
  <p className="text-xs text-muted">You cannot pick this fighter again this season.</p>
</div>
```

### Season Leaderboard
```tsx
// /fantasy/season
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Rank</TableHead>
      <TableHead>User</TableHead>
      <TableHead>Events Played</TableHead>
      <TableHead>Total Points</TableHead>
      <TableHead>Best Event</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {rows.map(r => (
      <TableRow key={r.userId}>
        <TableCell>{r.rank}</TableCell>
        <TableCell><UserCell userId={r.userId} /></TableCell>
        <TableCell>{r.eventsPlayed}</TableCell>
        <TableCell>{r.totalPoints}</TableCell>
        <TableCell>{r.bestEvent.points} (UFC {r.bestEvent.name})</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

Notes:
- Surface season name and dates from `admin/config/fantasy_season`.
- Link each row to the user’s season page with per-event picks. 