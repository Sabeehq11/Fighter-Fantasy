'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function Home() {
  const { user, isAuthenticated } = useUser();

  return (
    <div className="min-h-screen bg-black relative">
      {/* Diagonal Logo Pattern Background - Applied to entire page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle dark overlay - lighter at the bottom for better pattern visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/30 z-10" />
        
        {/* Diagonal pattern container */}
        <div 
          className="absolute inset-0 opacity-[0.35]"
          style={{
            transform: 'rotate(-30deg) scale(2.2)',
            transformOrigin: 'center',
          }}
        >
          <div 
            className="w-full h-full"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, 60px)',
              gridTemplateRows: 'repeat(auto-fill, 60px)',
              gap: '8px',
            }}
          >
            {/* Generate pattern grid - increased to 300 for complete corner coverage */}
            {Array.from({ length: 300 }).map((_, index) => (
              <div key={index} className="relative w-[60px] h-[60px] flex items-center justify-center">
                {index % 2 === 0 ? (
                  <Image
                    src="/Photos/Logos/UFC.png"
                    alt=""
                    width={40}
                    height={40}
                    className="object-contain"
                    style={{
                      filter: 'brightness(2.5) contrast(1.5) invert(1) sepia(1) saturate(2.5) hue-rotate(80deg) drop-shadow(0 0 10px rgba(74, 222, 128, 0.8))',
                    }}
                  />
                ) : (
                  <Image
                    src="/Photos/Logos/Venom.png"
                    alt=""
                    width={40}
                    height={40}
                    className="object-contain"
                    style={{
                      filter: 'brightness(2.5) contrast(1.5) invert(1) sepia(1) saturate(2.5) hue-rotate(80deg) drop-shadow(0 0 10px rgba(74, 222, 128, 0.8))',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Now with relative positioning to appear above background */}
      <div className="relative z-10">
        <Navigation />
        
        {/* Hero Section */}
        <section className="relative min-h-screen bg-gradient-to-b from-transparent via-black/50 to-black/70 pt-20 pb-16 overflow-hidden">
          {/* Additional overlay for hero section */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-950/30 via-transparent to-transparent" />
          
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h1 className="text-7xl lg:text-8xl font-black mb-6">
              <span className="text-white drop-shadow-2xl">FIGHTER</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent drop-shadow-2xl">
                FANTASY
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 drop-shadow-lg">
              The ultimate MMA fantasy platform. Build your dream team and compete.
            </p>

            {/* CTA Buttons */}
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-lg text-green-400 mb-4 drop-shadow-lg">
                  Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
                </p>
                <Link href="/fantasy">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg shadow-xl">
                    Play Fantasy Now →
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg shadow-xl">
                    Get Started Free →
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black px-8 py-6 text-lg backdrop-blur-sm bg-black/50 shadow-xl">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gradient-to-b from-black/70 via-gray-950/95 to-gray-950/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 text-white drop-shadow-2xl">
              Why Fighter Fantasy?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-gray-900/90 border-gray-800 backdrop-blur-sm shadow-2xl">
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

              <Card className="bg-gray-900/90 border-gray-800 backdrop-blur-sm shadow-2xl">
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

              <Card className="bg-gray-900/90 border-gray-800 backdrop-blur-sm shadow-2xl">
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

        {/* Upcoming Events */}
        <section className="py-20 px-5 bg-gradient-to-b from-gray-950/95 to-black/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-5xl font-bold text-center mb-16 text-white drop-shadow-2xl">
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-2xl hover:border-green-900/50 transition-all">
                <div className="text-green-400 text-sm font-medium mb-2">FEBRUARY 17, 2024</div>
                <h3 className="text-2xl font-bold mb-2 text-white">UFC 298</h3>
                <p className="text-gray-400 mb-4">Volkanovski vs Topuria</p>
                <Link href="/events/1" className="text-green-400 hover:text-green-300 transition-colors font-medium">
                  View Event →
                </Link>
              </div>
              <div className="bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-2xl hover:border-green-900/50 transition-all">
                <div className="text-green-400 text-sm font-medium mb-2">FEBRUARY 24, 2024</div>
                <h3 className="text-2xl font-bold mb-2 text-white">UFC Fight Night</h3>
                <p className="text-gray-400 mb-4">Moreno vs Royval 2</p>
                <Link href="/events/2" className="text-green-400 hover:text-green-300 transition-colors font-medium">
                  View Event →
                </Link>
              </div>
              <div className="bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-2xl hover:border-green-900/50 transition-all">
                <div className="text-green-400 text-sm font-medium mb-2">MARCH 9, 2024</div>
                <h3 className="text-2xl font-bold mb-2 text-white">UFC 299</h3>
                <p className="text-gray-400 mb-4">O'Malley vs Vera 2</p>
                <Link href="/events/3" className="text-green-400 hover:text-green-300 transition-colors font-medium">
                  View Event →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-5 border-t border-gray-800 bg-black/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-500">© 2024 Fighter Fantasy. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
