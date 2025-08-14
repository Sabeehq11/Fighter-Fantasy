'use client';

export default function RankingsPage() {
  const divisions = [
    {
      name: 'Heavyweight',
      champion: { name: 'Jon Jones', record: '27-1-0' },
      contenders: [
        { rank: 1, name: 'Stipe Miocic', record: '20-4-0' },
        { rank: 2, name: 'Tom Aspinall', record: '13-3-0' },
        { rank: 3, name: 'Sergei Pavlovich', record: '18-2-0' },
        { rank: 4, name: 'Curtis Blaydes', record: '18-4-0' },
        { rank: 5, name: 'Ciryl Gane', record: '12-2-0' },
      ]
    },
    {
      name: 'Lightweight',
      champion: { name: 'Islam Makhachev', record: '25-1-0' },
      contenders: [
        { rank: 1, name: 'Charles Oliveira', record: '34-9-0' },
        { rank: 2, name: 'Justin Gaethje', record: '25-4-0' },
        { rank: 3, name: 'Dustin Poirier', record: '30-8-0' },
        { rank: 4, name: 'Beneil Dariush', record: '22-5-1' },
        { rank: 5, name: 'Michael Chandler', record: '23-8-0' },
      ]
    },
    {
      name: 'Featherweight',
      champion: { name: 'Alexander Volkanovski', record: '26-3-0' },
      contenders: [
        { rank: 1, name: 'Max Holloway', record: '25-7-0' },
        { rank: 2, name: 'Yair Rodriguez', record: '15-4-0' },
        { rank: 3, name: 'Brian Ortega', record: '15-3-0' },
        { rank: 4, name: 'Josh Emmett', record: '19-3-0' },
        { rank: 5, name: 'Arnold Allen', record: '19-2-0' },
      ]
    }
  ];

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
            <a href="/fighters" style={{ color: '#fff', textDecoration: 'none' }}>Fighters</a>
            <a href="/rankings" style={{ color: '#0f0', textDecoration: 'none' }}>Rankings</a>
            <a href="/fantasy" style={{ color: '#fff', textDecoration: 'none' }}>Fantasy</a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section style={{ padding: '80px 20px', textAlign: 'center', borderBottom: '1px solid #333' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '20px' }}>RANKINGS</h1>
        <p style={{ fontSize: '20px', color: '#999', maxWidth: '600px', margin: '0 auto' }}>
          Official UFC rankings across all weight divisions.
        </p>
      </section>

      {/* Rankings Grid */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            {divisions.map((division, i) => (
              <div key={i} style={{ background: '#111', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' }}>
                {/* Division Header */}
                <div style={{ background: '#0f0', padding: '20px', color: '#000' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>{division.name}</h2>
                </div>
                
                {/* Champion */}
                <div style={{ background: '#1a1a1a', padding: '20px', borderBottom: '2px solid #ffd700' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#ffd700', marginBottom: '5px' }}>CHAMPION</div>
                      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{division.champion.name}</div>
                    </div>
                    <div style={{ color: '#999' }}>{division.champion.record}</div>
                  </div>
                </div>

                {/* Contenders */}
                <div style={{ padding: '10px' }}>
                  {division.contenders.map(fighter => (
                    <div key={fighter.rank} style={{
                      padding: '15px',
                      borderBottom: '1px solid #222',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ 
                          fontSize: '24px', 
                          fontWeight: 'bold', 
                          color: '#0f0',
                          width: '30px'
                        }}>
                          {fighter.rank}
                        </span>
                        <span style={{ fontSize: '18px' }}>{fighter.name}</span>
                      </div>
                      <span style={{ color: '#666' }}>{fighter.record}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 