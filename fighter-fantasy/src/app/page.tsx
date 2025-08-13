import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-accent-red to-accent-gold bg-clip-text text-transparent">
            Fighter Fantasy
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            The Ultimate UFC Companion & Fantasy Platform
          </p>

          {/* Quick Actions */}
          <div className="flex gap-4 justify-center mt-8">
            <Link 
              href="/events" 
              className="px-6 py-3 bg-accent-red text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              View Events
            </Link>
            <Link 
              href="/fighters" 
              className="px-6 py-3 bg-bg-secondary border border-accent-gold text-accent-gold rounded-lg hover:bg-accent-gold hover:text-black transition-colors font-semibold"
            >
              Browse Fighters
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <Link href="/events" className="bg-bg-secondary border border-border rounded-lg p-6 hover:border-accent-red transition-colors cursor-pointer hover:transform hover:scale-105 transform transition-transform">
              <div className="text-accent-red text-4xl mb-4">🥊</div>
              <h2 className="text-xl font-semibold mb-2">Events</h2>
              <p className="text-text-secondary">Track upcoming UFC events with live countdowns</p>
            </Link>
            
            <Link href="/rankings" className="bg-bg-secondary border border-border rounded-lg p-6 hover:border-accent-gold transition-colors cursor-pointer hover:transform hover:scale-105 transform transition-transform">
              <div className="text-accent-gold text-4xl mb-4">🏆</div>
              <h2 className="text-xl font-semibold mb-2">Rankings</h2>
              <p className="text-text-secondary">View current champions and division rankings</p>
            </Link>
            
            <Link href="/fantasy" className="bg-bg-secondary border border-border rounded-lg p-6 hover:border-accent-green transition-colors cursor-pointer hover:transform hover:scale-105 transform transition-transform">
              <div className="text-accent-green text-4xl mb-4">🎮</div>
              <h2 className="text-xl font-semibold mb-2">Fantasy</h2>
              <p className="text-text-secondary">Build your dream team and compete for glory</p>
            </Link>
          </div>
          
                  <div className="mt-16 text-text-muted">
          <p>Phase 0: Project Setup ✅</p>
          <p>Phase 1: Core Pages & Data ✅</p>
          <p className="text-sm mt-2">Ready for Phase 2: Authentication</p>
        </div>
        </div>
      </div>
    </main>
  );
}
