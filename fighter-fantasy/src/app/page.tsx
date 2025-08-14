'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/lib/hooks/useUser';
import { useState, useEffect } from 'react';

export default function Home() {
  const { logout } = useAuth();
  const { user, isAuthenticated, loading } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
      {/* Navigation */}
      <nav style={{ 
        background: '#111', 
        borderBottom: '1px solid #333',
        padding: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span>Fighter</span>
            <span style={{ color: '#0f0' }}>Fantasy</span>
          </div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="/" style={{ color: '#0f0', textDecoration: 'none' }}>Home</a>
            <a href="/events" style={{ color: '#fff', textDecoration: 'none' }}>Events</a>
            <a href="/fighters" style={{ color: '#fff', textDecoration: 'none' }}>Fighters</a>
            <a href="/rankings" style={{ color: '#fff', textDecoration: 'none' }}>Rankings</a>
            <a href="/fantasy" style={{ color: '#fff', textDecoration: 'none' }}>Fantasy</a>
            
            {/* Auth Section */}
            <div style={{ borderLeft: '1px solid #333', paddingLeft: '20px', marginLeft: '10px' }}>
              {loading ? (
                <span style={{ color: '#666' }}>Loading...</span>
              ) : isAuthenticated ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      background: 'transparent',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0f0, #00ff88)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      color: '#000'
                    }}>
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '12px', color: '#0f0' }}>Signed in as:</div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                        {user?.displayName || user?.email?.split('@')[0] || 'User'}
                      </div>
                    </div>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: '#222',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      minWidth: '200px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                      zIndex: 1000
                    }}>
                      <div style={{ padding: '12px', borderBottom: '1px solid #333' }}>
                        <div style={{ fontSize: '12px', color: '#999' }}>Email:</div>
                        <div style={{ fontSize: '13px', color: '#fff', marginTop: '2px' }}>
                          {user?.email}
                        </div>
                      </div>
                      <a 
                        href="/profile" 
                        style={{ 
                          display: 'block', 
                          padding: '12px', 
                          color: '#fff', 
                          textDecoration: 'none',
                          borderBottom: '1px solid #333'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        👤 Profile
                      </a>
                      <a 
                        href="/fantasy/my-teams" 
                        style={{ 
                          display: 'block', 
                          padding: '12px', 
                          color: '#fff', 
                          textDecoration: 'none',
                          borderBottom: '1px solid #333'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        🎮 My Teams
                      </a>
                      <button
                        onClick={handleSignOut}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'transparent',
                          border: 'none',
                          color: '#f44',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <a
                    href="/login"
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #0f0',
                      borderRadius: '5px',
                      color: '#0f0',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#0f0';
                      e.currentTarget.style.color = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#0f0';
                    }}
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    style={{
                      padding: '8px 16px',
                      background: '#0f0',
                      borderRadius: '5px',
                      color: '#000',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#00ff88';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#0f0';
                    }}
                  >
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '120px 20px', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, #111 0%, #000 100%)'
      }}>
        <h1 style={{ 
          fontSize: '72px', 
          fontWeight: 'bold', 
          marginBottom: '30px',
          background: 'linear-gradient(90deg, #fff 0%, #0f0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          FIGHTER FANTASY
        </h1>
        <p style={{ fontSize: '24px', color: '#999', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          The ultimate MMA fantasy platform. Build your dream team and compete.
        </p>
        
        {/* Show different CTA based on auth status */}
        {isAuthenticated ? (
          <div>
            <p style={{ fontSize: '18px', color: '#0f0', marginBottom: '20px' }}>
              Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
            </p>
            <a 
              href="/fantasy" 
              style={{
                display: 'inline-block',
                padding: '15px 40px',
                fontSize: '18px',
                background: '#0f0',
                color: '#000',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}
            >
              Play Fantasy Now →
            </a>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '18px', color: '#999', marginBottom: '20px' }}>
              Join thousands of MMA fans competing weekly
            </p>
            <a 
              href="/signup" 
              style={{
                display: 'inline-block',
                padding: '15px 40px',
                fontSize: '18px',
                background: '#0f0',
                color: '#000',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                marginRight: '20px'
              }}
            >
              Get Started Free →
            </a>
            <a 
              href="/login" 
              style={{
                display: 'inline-block',
                padding: '15px 40px',
                fontSize: '18px',
                background: 'transparent',
                border: '2px solid #0f0',
                color: '#0f0',
                textDecoration: 'none',
                borderRadius: '5px',
                fontWeight: 'bold'
              }}
            >
              Sign In
            </a>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 20px', background: '#111' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', marginBottom: '60px' }}>
            Why Fighter Fantasy?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div style={{ background: '#222', padding: '30px', borderRadius: '10px', border: '1px solid #333' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>🏆</div>
              <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>Compete Weekly</h3>
              <p style={{ color: '#999', lineHeight: '1.6' }}>
                Enter tournaments for every UFC event. Build your optimal lineup within the salary cap.
              </p>
            </div>
            <div style={{ background: '#222', padding: '30px', borderRadius: '10px', border: '1px solid #333' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>📊</div>
              <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>Live Scoring</h3>
              <p style={{ color: '#999', lineHeight: '1.6' }}>
                Track your team in real-time during fight night with our advanced scoring system.
              </p>
            </div>
            <div style={{ background: '#222', padding: '30px', borderRadius: '10px', border: '1px solid #333' }}>
              <div style={{ fontSize: '32px', marginBottom: '15px' }}>💰</div>
              <h3 style={{ fontSize: '24px', marginBottom: '15px' }}>Win Prizes</h3>
              <p style={{ color: '#999', lineHeight: '1.6' }}>
                Compete for glory and prizes. Top performers earn rewards and recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section style={{ padding: '80px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', marginBottom: '60px' }}>
            Upcoming Events
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#111', padding: '25px', borderRadius: '10px', border: '1px solid #333' }}>
              <div style={{ color: '#0f0', fontSize: '14px', marginBottom: '10px' }}>FEBRUARY 17, 2024</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>UFC 298</h3>
              <p style={{ color: '#999', marginBottom: '15px' }}>Volkanovski vs Topuria</p>
              <a href="/events/1" style={{ color: '#0f0', textDecoration: 'none' }}>View Event →</a>
            </div>
            <div style={{ background: '#111', padding: '25px', borderRadius: '10px', border: '1px solid #333' }}>
              <div style={{ color: '#0f0', fontSize: '14px', marginBottom: '10px' }}>FEBRUARY 24, 2024</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>UFC Fight Night</h3>
              <p style={{ color: '#999', marginBottom: '15px' }}>Moreno vs Royval 2</p>
              <a href="/events/2" style={{ color: '#0f0', textDecoration: 'none' }}>View Event →</a>
            </div>
            <div style={{ background: '#111', padding: '25px', borderRadius: '10px', border: '1px solid #333' }}>
              <div style={{ color: '#0f0', fontSize: '14px', marginBottom: '10px' }}>MARCH 9, 2024</div>
              <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>UFC 299</h3>
              <p style={{ color: '#999', marginBottom: '15px' }}>O&apos;Malley vs Vera 2</p>
              <a href="/events/3" style={{ color: '#0f0', textDecoration: 'none' }}>View Event →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', borderTop: '1px solid #333', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: '#666' }}>© 2024 Fighter Fantasy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
