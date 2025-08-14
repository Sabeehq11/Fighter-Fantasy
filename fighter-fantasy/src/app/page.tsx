'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const { user, isAuthenticated } = useUser();

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-b from-black via-gray-950 to-black pt-20 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/20 via-black to-black" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-7xl lg:text-8xl font-black mb-6">
            <span className="text-white">FIGHTER</span>
            <br />
            <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              FANTASY
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
            The ultimate MMA fantasy platform. Build your dream team and compete.
          </p>

          {/* CTA Buttons */}
          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-green-500 mb-4">
                Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
              </p>
              <Link href="/fantasy">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg">
                  Play Fantasy Now →
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg">
                  Get Started Free →
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black px-8 py-6 text-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-white">
            Why Fighter Fantasy?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="text-4xl mb-4">🏆</div>
                <CardTitle className="text-2xl text-white">Compete Weekly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Enter tournaments for every UFC event. Build your optimal lineup within the salary cap.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="text-4xl mb-4">📊</div>
                <CardTitle className="text-2xl text-white">Live Scoring</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Track your team in real-time during fight night with our advanced scoring system.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="text-4xl mb-4">💰</div>
                <CardTitle className="text-2xl text-white">Win Prizes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Compete for glory and prizes. Top performers earn rewards and recognition.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events - Keep inline styles for now */}
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
