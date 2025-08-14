export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
      {/* Navigation */}
      <nav style={{ 
        background: '#111', 
        borderBottom: '1px solid #333',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span>Fighter</span>
            <span style={{ color: '#0f0' }}>Fantasy</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
            <a href="/events" style={{ color: '#fff', textDecoration: 'none' }}>Events</a>
            <a href="/fighters" style={{ color: '#fff', textDecoration: 'none' }}>Fighters</a>
            <a href="/fantasy" style={{ color: '#fff', textDecoration: 'none' }}>Fantasy</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '100px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '72px', fontWeight: 'bold', marginBottom: '20px' }}>
          <div>FIGHTER</div>
          <div style={{ color: '#0f0' }}>FANTASY</div>
        </h1>
        <p style={{ fontSize: '20px', color: '#999', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          The ultimate MMA companion platform. Track fights, analyze stats, and compete in fantasy leagues.
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button style={{
            background: '#0f0',
            color: '#000',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Get Started
          </button>
          <button style={{
            background: '#333',
            color: '#fff',
            padding: '15px 30px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 20px', background: '#111' }}>
        <h2 style={{ fontSize: '48px', textAlign: 'center', marginBottom: '60px' }}>Features</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            { title: 'Championship Tracking', desc: 'Real-time UFC championship updates' },
            { title: 'Fantasy Leagues', desc: 'Create and compete in custom leagues' },
            { title: 'Live Statistics', desc: 'Advanced fighter analytics' },
            { title: 'Fighter Profiles', desc: 'Comprehensive fighter data' }
          ].map((feature, i) => (
            <div key={i} style={{ 
              background: '#222', 
              padding: '30px',
              borderRadius: '10px',
              border: '1px solid #333'
            }}>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>{feature.title}</h3>
              <p style={{ color: '#999' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Events */}
      <section style={{ padding: '80px 20px' }}>
        <h2 style={{ fontSize: '48px', marginBottom: '60px' }}>Upcoming Events</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            { title: 'UFC 298', date: 'Feb 17, 2024', main: 'Volkanovski vs Topuria' },
            { title: 'UFC Fight Night', date: 'Feb 24, 2024', main: 'Moreno vs Royval 2' },
            { title: 'UFC 299', date: 'Mar 9, 2024', main: 'O\'Malley vs Vera 2' }
          ].map((event, i) => (
            <div key={i} style={{ 
              background: '#111', 
              padding: '30px',
              borderRadius: '10px',
              border: '1px solid #333'
            }}>
              <div style={{ color: '#999', marginBottom: '10px' }}>{event.date}</div>
              <h3 style={{ fontSize: '28px', marginBottom: '10px' }}>{event.title}</h3>
              <p style={{ color: '#999', marginBottom: '20px' }}>{event.main}</p>
              <a href="#" style={{ color: '#0f0', textDecoration: 'none' }}>View Details →</a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '40px 20px', 
        background: '#111',
        borderTop: '1px solid #333',
        textAlign: 'center',
        color: '#999'
      }}>
        <p>© 2024 Fighter Fantasy. All rights reserved.</p>
      </footer>
    </div>
  );
}
