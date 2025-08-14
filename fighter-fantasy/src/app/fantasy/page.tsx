'use client';

export default function FantasyPage() {
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
            <a href="/rankings" style={{ color: '#fff', textDecoration: 'none' }}>Rankings</a>
            <a href="/fantasy" style={{ color: '#0f0', textDecoration: 'none' }}>Fantasy</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ 
        padding: '100px 20px', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0f0 0%, #000 100%)',
        color: '#000'
      }}>
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: '20px' }}>FANTASY MMA</h1>
        <p style={{ fontSize: '24px', marginBottom: '40px' }}>
          Build your ultimate fight team and compete for glory
        </p>
        <button style={{
          background: '#000',
          color: '#0f0',
          padding: '20px 40px',
          border: '2px solid #000',
          borderRadius: '5px',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          CREATE YOUR TEAM
        </button>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 20px', background: '#111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', textAlign: 'center', marginBottom: '60px' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#0f0',
                marginBottom: '20px'
              }}>1</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Pick Your Fighters</h3>
              <p style={{ color: '#999' }}>Select 6 fighters within your budget</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#0f0',
                marginBottom: '20px'
              }}>2</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Make Predictions</h3>
              <p style={{ color: '#999' }}>Predict fight outcomes and methods</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#0f0',
                marginBottom: '20px'
              }}>3</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Score Points</h3>
              <p style={{ color: '#999' }}>Earn points based on fight results</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: '#0f0',
                marginBottom: '20px'
              }}>4</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Win Prizes</h3>
              <p style={{ color: '#999' }}>Compete for weekly and event prizes</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Contests */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', marginBottom: '40px' }}>Upcoming Contests</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{
              background: '#111',
              border: '2px solid #0f0',
              borderRadius: '10px',
              padding: '30px',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>UFC 298 Fantasy Contest</h3>
                <p style={{ color: '#999' }}>Feb 17, 2024 • Volkanovski vs Topuria</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f0' }}>$10,000</div>
                <div style={{ color: '#999' }}>Prize Pool</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button style={{
                  background: '#0f0',
                  color: '#000',
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}>
                  ENTER NOW
                </button>
              </div>
            </div>

            <div style={{
              background: '#111',
              border: '1px solid #333',
              borderRadius: '10px',
              padding: '30px',
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              gap: '20px',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>UFC Fight Night Contest</h3>
                <p style={{ color: '#999' }}>Feb 24, 2024 • Moreno vs Royval 2</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f0' }}>$5,000</div>
                <div style={{ color: '#999' }}>Prize Pool</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button style={{
                  background: '#333',
                  color: '#fff',
                  padding: '15px 30px',
                  border: '1px solid #555',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}>
                  ENTER NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 20px', background: '#111', textAlign: 'center' }}>
        <h2 style={{ fontSize: '48px', marginBottom: '20px' }}>Ready to Play?</h2>
        <p style={{ fontSize: '20px', color: '#999', marginBottom: '40px' }}>
          Join thousands of MMA fans in the ultimate fantasy experience
        </p>
        <button style={{
          background: '#0f0',
          color: '#000',
          padding: '20px 40px',
          border: 'none',
          borderRadius: '5px',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          START PLAYING NOW
        </button>
      </section>
    </div>
  );
} 