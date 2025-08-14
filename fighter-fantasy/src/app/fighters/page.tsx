'use client';

import { useState, useMemo } from 'react';

export default function FightersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeightClass, setSelectedWeightClass] = useState('all');
  const [showOnlyChampions, setShowOnlyChampions] = useState(false);
  const [sortBy, setSortBy] = useState('rank'); // rank, name, wins

  // Expanded fighter data with more details
  const allFighters = [
    // Heavyweights
    { id: 1, name: 'Jon Jones', weightClass: 'Heavyweight', record: '27-1-0', wins: 27, rank: 'C', country: '🇺🇸', streak: 'W5', stance: 'Orthodox', reach: 84.5, height: 76 },
    { id: 2, name: 'Stipe Miocic', weightClass: 'Heavyweight', record: '20-4-0', wins: 20, rank: '1', country: '🇺🇸', streak: 'L1', stance: 'Orthodox', reach: 80, height: 76 },
    { id: 3, name: 'Tom Aspinall', weightClass: 'Heavyweight', record: '13-3-0', wins: 13, rank: '2', country: '🇬🇧', streak: 'W1', stance: 'Orthodox', reach: 78, height: 77 },
    { id: 4, name: 'Sergei Pavlovich', weightClass: 'Heavyweight', record: '18-2-0', wins: 18, rank: '3', country: '🇷🇺', streak: 'L1', stance: 'Orthodox', reach: 84, height: 75 },
    
    // Light Heavyweights
    { id: 5, name: 'Alex Pereira', weightClass: 'Light Heavyweight', record: '10-2-0', wins: 10, rank: 'C', country: '🇧🇷', streak: 'W3', stance: 'Orthodox', reach: 79, height: 76 },
    { id: 6, name: 'Jamahal Hill', weightClass: 'Light Heavyweight', record: '12-2-0', wins: 12, rank: '1', country: '🇺🇸', streak: 'L1', stance: 'Southpaw', reach: 79, height: 76 },
    { id: 7, name: 'Jiri Prochazka', weightClass: 'Light Heavyweight', record: '30-4-1', wins: 30, rank: '2', country: '🇨🇿', streak: 'L1', stance: 'Orthodox', reach: 80, height: 75 },
    
    // Middleweights
    { id: 8, name: 'Sean Strickland', weightClass: 'Middleweight', record: '28-5-0', wins: 28, rank: 'C', country: '🇺🇸', streak: 'W2', stance: 'Orthodox', reach: 76, height: 73 },
    { id: 9, name: 'Israel Adesanya', weightClass: 'Middleweight', record: '24-3-0', wins: 24, rank: '1', country: '🇳🇬', streak: 'L1', stance: 'Orthodox', reach: 80, height: 76 },
    { id: 10, name: 'Robert Whittaker', weightClass: 'Middleweight', record: '25-7-0', wins: 25, rank: '2', country: '🇦🇺', streak: 'W1', stance: 'Orthodox', reach: 73.5, height: 72 },
    
    // Welterweights
    { id: 11, name: 'Leon Edwards', weightClass: 'Welterweight', record: '22-3-0', wins: 22, rank: 'C', country: '🇬🇧', streak: 'W2', stance: 'Southpaw', reach: 74, height: 72 },
    { id: 12, name: 'Kamaru Usman', weightClass: 'Welterweight', record: '20-3-0', wins: 20, rank: '1', country: '🇳🇬', streak: 'L2', stance: 'Orthodox', reach: 76, height: 72 },
    { id: 13, name: 'Colby Covington', weightClass: 'Welterweight', record: '17-4-0', wins: 17, rank: '2', country: '🇺🇸', streak: 'L1', stance: 'Orthodox', reach: 72, height: 71 },
    
    // Lightweights
    { id: 14, name: 'Islam Makhachev', weightClass: 'Lightweight', record: '25-1-0', wins: 25, rank: 'C', country: '🇷🇺', streak: 'W13', stance: 'Orthodox', reach: 70, height: 70 },
    { id: 15, name: 'Charles Oliveira', weightClass: 'Lightweight', record: '34-9-0', wins: 34, rank: '1', country: '🇧🇷', streak: 'L1', stance: 'Orthodox', reach: 74, height: 70 },
    { id: 16, name: 'Justin Gaethje', weightClass: 'Lightweight', record: '25-4-0', wins: 25, rank: '2', country: '🇺🇸', streak: 'W1', stance: 'Orthodox', reach: 70, height: 70 },
    { id: 17, name: 'Dustin Poirier', weightClass: 'Lightweight', record: '30-8-0', wins: 30, rank: '3', country: '🇺🇸', streak: 'W1', stance: 'Southpaw', reach: 72, height: 69 },
    
    // Featherweights
    { id: 18, name: 'Alexander Volkanovski', weightClass: 'Featherweight', record: '26-3-0', wins: 26, rank: 'C', country: '🇦🇺', streak: 'L2', stance: 'Orthodox', reach: 71.5, height: 66 },
    { id: 19, name: 'Max Holloway', weightClass: 'Featherweight', record: '25-7-0', wins: 25, rank: '1', country: '🇺🇸', streak: 'W1', stance: 'Orthodox', reach: 69, height: 71 },
    { id: 20, name: 'Yair Rodriguez', weightClass: 'Featherweight', record: '15-4-0', wins: 15, rank: '2', country: '🇲🇽', streak: 'L1', stance: 'Orthodox', reach: 71, height: 71 },
    
    // Bantamweights
    { id: 21, name: "Sean O'Malley", weightClass: 'Bantamweight', record: '17-1-0', wins: 17, rank: 'C', country: '🇺🇸', streak: 'W4', stance: 'Orthodox', reach: 72, height: 71 },
    { id: 22, name: 'Merab Dvalishvili', weightClass: 'Bantamweight', record: '17-4-0', wins: 17, rank: '1', country: '🇬🇪', streak: 'W10', stance: 'Orthodox', reach: 68, height: 66 },
    { id: 23, name: 'Cory Sandhagen', weightClass: 'Bantamweight', record: '17-4-0', wins: 17, rank: '2', country: '🇺🇸', streak: 'W3', stance: 'Orthodox', reach: 70, height: 71 },
    
    // Flyweights
    { id: 24, name: 'Alexandre Pantoja', weightClass: 'Flyweight', record: '27-5-0', wins: 27, rank: 'C', country: '🇧🇷', streak: 'W2', stance: 'Orthodox', reach: 67, height: 67 },
    { id: 25, name: 'Brandon Royval', weightClass: 'Flyweight', record: '16-6-0', wins: 16, rank: '1', country: '🇺🇸', streak: 'W1', stance: 'Southpaw', reach: 68, height: 69 },
    { id: 26, name: 'Brandon Moreno', weightClass: 'Flyweight', record: '21-7-2', wins: 21, rank: '2', country: '🇲🇽', streak: 'L2', stance: 'Orthodox', reach: 70, height: 67 },
  ];

  const weightClasses = [
    'Heavyweight',
    'Light Heavyweight', 
    'Middleweight',
    'Welterweight',
    'Lightweight',
    'Featherweight',
    'Bantamweight',
    'Flyweight'
  ];

  // Filter and sort fighters
  const filteredFighters = useMemo(() => {
    let filtered = allFighters;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Weight class filter
    if (selectedWeightClass !== 'all') {
      filtered = filtered.filter(f => f.weightClass === selectedWeightClass);
    }

    // Champions only filter
    if (showOnlyChampions) {
      filtered = filtered.filter(f => f.rank === 'C');
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === 'rank') {
        if (a.rank === 'C' && b.rank !== 'C') return -1;
        if (a.rank !== 'C' && b.rank === 'C') return 1;
        if (a.rank === 'C' && b.rank === 'C') return 0;
        return parseInt(a.rank) - parseInt(b.rank);
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'wins') {
        return b.wins - a.wins;
      }
      return 0;
    });

    return filtered;
  }, [searchTerm, selectedWeightClass, showOnlyChampions, sortBy]);

  // Group fighters by weight class
  const fightersByWeightClass = useMemo(() => {
    const grouped: { [key: string]: typeof allFighters } = {};
    
    weightClasses.forEach(wc => {
      grouped[wc] = filteredFighters.filter(f => f.weightClass === wc);
    });

    return grouped;
  }, [filteredFighters]);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
      {/* Navigation */}
      <nav style={{ background: '#111', borderBottom: '1px solid #333', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span>Fighter</span>
            <span style={{ color: '#0f0' }}>Fantasy</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
            <a href="/events" style={{ color: '#fff', textDecoration: 'none' }}>Events</a>
            <a href="/fighters" style={{ color: '#0f0', textDecoration: 'none' }}>Fighters</a>
            <a href="/rankings" style={{ color: '#fff', textDecoration: 'none' }}>Rankings</a>
            <a href="/fantasy" style={{ color: '#fff', textDecoration: 'none' }}>Fantasy</a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section style={{ padding: '60px 20px', textAlign: 'center', borderBottom: '1px solid #333' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '20px' }}>UFC FIGHTERS</h1>
        <p style={{ fontSize: '20px', color: '#999', maxWidth: '600px', margin: '0 auto' }}>
          Browse {allFighters.length} elite UFC fighters across all weight divisions
        </p>
      </section>

      {/* Filters */}
      <section style={{ padding: '30px 20px', background: '#111', borderBottom: '1px solid #333' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search fighters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '12px 20px',
                fontSize: '16px',
                background: '#222',
                border: '1px solid #444',
                borderRadius: '5px',
                color: '#fff'
              }}
            />

            {/* Weight Class Filter */}
            <select
              value={selectedWeightClass}
              onChange={(e) => setSelectedWeightClass(e.target.value)}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                background: '#222',
                border: '1px solid #444',
                borderRadius: '5px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Weight Classes</option>
              {weightClasses.map(wc => (
                <option key={wc} value={wc}>{wc}</option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                background: '#222',
                border: '1px solid #444',
                borderRadius: '5px',
                color: '#fff',
                cursor: 'pointer'
              }}
            >
              <option value="rank">Sort by Rank</option>
              <option value="name">Sort by Name</option>
              <option value="wins">Sort by Wins</option>
            </select>

            {/* Champions Toggle */}
            <button
              onClick={() => setShowOnlyChampions(!showOnlyChampions)}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                background: showOnlyChampions ? '#ffd700' : '#222',
                color: showOnlyChampions ? '#000' : '#fff',
                border: '1px solid #444',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {showOnlyChampions ? '👑 Champions Only' : 'Champions Only'}
            </button>

            {/* Results Count */}
            <div style={{ color: '#999', fontSize: '14px' }}>
              {filteredFighters.length} fighter{filteredFighters.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
      </section>

      {/* Fighters by Weight Class */}
      <section style={{ padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {selectedWeightClass === 'all' ? (
            // Show grouped by weight class
            weightClasses.map(weightClass => {
              const fighters = fightersByWeightClass[weightClass];
              if (fighters.length === 0) return null;

              return (
                <div key={weightClass} style={{ marginBottom: '60px' }}>
                  <h2 style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    marginBottom: '20px',
                    padding: '10px',
                    background: 'linear-gradient(90deg, #0f0 0%, transparent 50%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {weightClass}
                  </h2>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '20px' 
                  }}>
                    {fighters.map(fighter => (
                      <div key={fighter.id} style={{
                        background: fighter.rank === 'C' ? 'linear-gradient(135deg, #1a1a1a, #2a2a1a)' : '#111',
                        border: fighter.rank === 'C' ? '2px solid #ffd700' : '1px solid #333',
                        borderRadius: '10px',
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,255,0,0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}>
                        {/* Champion Crown */}
                        {fighter.rank === 'C' && (
                          <div style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            fontSize: '24px'
                          }}>
                            👑
                          </div>
                        )}

                        {/* Fighter Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                          <span style={{ fontSize: '28px' }}>{fighter.country}</span>
                          <span style={{
                            background: fighter.rank === 'C' ? '#ffd700' : '#333',
                            color: fighter.rank === 'C' ? '#000' : '#fff',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {fighter.rank === 'C' ? 'CHAMPION' : `#${fighter.rank}`}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' }}>{fighter.name}</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                          <div>
                            <span style={{ color: '#666' }}>Record: </span>
                            <span style={{ color: '#0f0', fontWeight: 'bold' }}>{fighter.record}</span>
                          </div>
                          <div>
                            <span style={{ color: '#666' }}>Streak: </span>
                            <span style={{ 
                              color: fighter.streak.startsWith('W') ? '#0f0' : '#f00',
                              fontWeight: 'bold'
                            }}>{fighter.streak}</span>
                          </div>
                          <div>
                            <span style={{ color: '#666' }}>Reach: </span>
                            <span>{fighter.reach}"</span>
                          </div>
                          <div>
                            <span style={{ color: '#666' }}>Stance: </span>
                            <span>{fighter.stance}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            // Show flat grid when filtered by weight class
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '20px' 
            }}>
              {filteredFighters.map(fighter => (
                <div key={fighter.id} style={{
                  background: fighter.rank === 'C' ? 'linear-gradient(135deg, #1a1a1a, #2a2a1a)' : '#111',
                  border: fighter.rank === 'C' ? '2px solid #ffd700' : '1px solid #333',
                  borderRadius: '10px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,255,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  {fighter.rank === 'C' && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      fontSize: '24px'
                    }}>
                      👑
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <span style={{ fontSize: '28px' }}>{fighter.country}</span>
                    <span style={{
                      background: fighter.rank === 'C' ? '#ffd700' : '#333',
                      color: fighter.rank === 'C' ? '#000' : '#fff',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {fighter.rank === 'C' ? 'CHAMPION' : `#${fighter.rank}`}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '10px' }}>{fighter.name}</h3>
                  <div style={{ color: '#999', marginBottom: '5px' }}>{fighter.weightClass}</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div>
                      <span style={{ color: '#666' }}>Record: </span>
                      <span style={{ color: '#0f0', fontWeight: 'bold' }}>{fighter.record}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Streak: </span>
                      <span style={{ 
                        color: fighter.streak.startsWith('W') ? '#0f0' : '#f00',
                        fontWeight: 'bold'
                      }}>{fighter.streak}</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Reach: </span>
                      <span>{fighter.reach}"</span>
                    </div>
                    <div>
                      <span style={{ color: '#666' }}>Stance: </span>
                      <span>{fighter.stance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredFighters.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#666'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🥊</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>No fighters found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
} 