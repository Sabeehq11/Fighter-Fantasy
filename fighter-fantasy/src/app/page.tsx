'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { dataService } from '@/services/dataService';
import { Event, Fight } from '@/types';
import CreateLeagueModal from '@/components/leagues/CreateLeagueModal';
import JoinLeagueModal from '@/components/leagues/JoinLeagueModal';
import LeagueSuccessModal from '@/components/leagues/LeagueSuccessModal';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, isAuthenticated } = useUser();
  const router = useRouter();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [mainEvents, setMainEvents] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  
  // League Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalData, setSuccessModalData] = useState<{
    type: 'created' | 'joined';
    leagueName: string;
    joinCode?: string;
    leagueId?: string;
  } | null>(null);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming events (limited to 3 for home page)
      const upcoming = await dataService.getUpcomingEvents(3);
      setUpcomingEvents(upcoming);
      
      // Fetch main event fights for each event
      const mainEventPromises = upcoming.map(async (event) => {
        const fights = await dataService.getEventFights(event.id);
        // The main event is typically the fight with the highest bout_order
        const mainFight = fights.find(f => f.is_main_event) || fights[0];
        if (mainFight) {
          // Handle both possible data structures (with names or IDs)
          const fighterAName = (mainFight as any).fighter_a_name || 'Fighter A';
          const fighterBName = (mainFight as any).fighter_b_name || 'Fighter B';
          return {
            eventId: event.id,
            mainEvent: `${fighterAName} vs ${fighterBName}`
          };
        }
        return { eventId: event.id, mainEvent: 'TBA' };
      });
      
      const mainEventResults = await Promise.all(mainEventPromises);
      const mainEventsMap: { [key: string]: string } = {};
      mainEventResults.forEach(result => {
        mainEventsMap[result.eventId] = result.mainEvent;
      });
      
      setMainEvents(mainEventsMap);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black relative">
      {/* Diagonal Logo Pattern Background - Applied to entire page */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle dark overlay - lighter at the bottom for better pattern visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/30 z-10" />
        
        {/* Diagonal pattern container - Made larger to ensure full coverage */}
        <div 
          className="absolute opacity-[0.35]"
          style={{
            // Make container much larger than viewport to ensure coverage when rotated
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            transform: 'rotate(-30deg)',
            transformOrigin: 'center',
          }}
        >
          <div 
            className="w-full h-full"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, 80px)',
              gridTemplateRows: 'repeat(auto-fill, 80px)',
              gap: '10px',
            }}
          >
            {/* Generate pattern grid - increased to 5000 for complete coverage on all screens including ultra-wide monitors */}
            {Array.from({ length: 5000 }).map((_, index) => (
              <div key={index} className="relative w-[80px] h-[80px] flex items-center justify-center">
                {index % 2 === 0 ? (
                  <Image
                    src="/Photos/Logos/UFC.png"
                    alt=""
                    width={55}
                    height={55}
                    className="object-contain"
                    style={{
                      filter: 'brightness(2.5) contrast(1.5) invert(1) sepia(1) saturate(2.5) hue-rotate(80deg) drop-shadow(0 0 10px rgba(74, 222, 128, 0.8))',
                    }}
                  />
                ) : (
                  <Image
                    src="/Photos/Logos/Venom.png"
                    alt=""
                    width={55}
                    height={55}
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
              <div className="space-y-6">
                <p className="text-lg text-green-400 mb-4 drop-shadow-lg">
                  Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋
                </p>
                <Link href="/fantasy">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg shadow-xl">
                    Play Fantasy Now →
                  </Button>
                </Link>
                
                {/* League Actions Section */}
                <div className="mt-12 space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">Compete with Friends</h3>
                    <p className="text-gray-300 text-sm drop-shadow-lg">Create or join leagues to compete against your friends</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg shadow-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span>Create Private</span>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowJoinModal(true)}
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg shadow-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 100 4h2a2 2 0 100 4h2a1 1 0 100 2 2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" clipRule="evenodd" />
                        </svg>
                        <span>Join Private</span>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowCreateModal(true)}
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg shadow-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                        <span>Create Public</span>
                      </div>
                    </Button>
                    
                    <Button 
                      onClick={() => setShowJoinModal(true)}
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-6 text-lg shadow-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <span>Browse Public</span>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="text-center">
                    <Link href="/leagues/my-leagues">
                      <button className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors font-medium drop-shadow-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        View My Leagues
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </Link>
                  </div>
                </div>
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
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl">Loading events...</div>
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="bg-gray-900/90 backdrop-blur-sm p-6 rounded-xl border border-gray-800 shadow-2xl hover:border-green-900/50 transition-all"
                  >
                    <div className="text-green-400 text-sm font-medium mb-2">
                      {formatDate(event.date_utc)}
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-white">
                      {event.name}
                    </h3>
                    <p className="text-gray-400 mb-4">
                      {mainEvents[event.id] || 'Card to be announced'}
                    </p>
                    {event.type === 'PPV' && (
                      <span className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full mb-3">
                        💰 PAY-PER-VIEW
                      </span>
                    )}
                    <Link 
                      href={`/events/${event.id}`} 
                      className="text-green-400 hover:text-green-300 transition-colors font-medium block"
                    >
                      View Event →
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No upcoming events scheduled</p>
                <Link href="/events" className="text-green-400 hover:text-green-300 mt-4 inline-block">
                  View Past Events →
                </Link>
              </div>
            )}
            
            {/* View All Events Button */}
            {upcomingEvents.length > 0 && (
              <div className="text-center mt-12">
                <Link href="/events">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-green-500 text-green-400 hover:bg-green-500 hover:text-black"
                  >
                    View All Events →
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-5 border-t border-gray-800 bg-black/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-500">© 2024 Fighter Fantasy. All rights reserved.</p>
          </div>
        </footer>
      </div>
      
      {/* League Modals */}
      {user && (
        <>
          <CreateLeagueModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            userId={user.uid}
            onSuccess={(leagueId, joinCode) => {
              setShowCreateModal(false);
              setSuccessModalData({
                type: 'created',
                leagueName: 'Your League',
                joinCode,
                leagueId
              });
              setShowSuccessModal(true);
            }}
          />
          
          <JoinLeagueModal
            isOpen={showJoinModal}
            onClose={() => setShowJoinModal(false)}
            userId={user.uid}
            onSuccess={(leagueId, leagueName) => {
              setShowJoinModal(false);
              setSuccessModalData({
                type: 'joined',
                leagueName,
                leagueId
              });
              setShowSuccessModal(true);
            }}
          />
          
          {successModalData && (
            <LeagueSuccessModal
              isOpen={showSuccessModal}
              onClose={() => {
                setShowSuccessModal(false);
                setSuccessModalData(null);
              }}
              type={successModalData.type}
              leagueName={successModalData.leagueName}
              joinCode={successModalData.joinCode}
              onViewLeague={() => {
                if (successModalData.leagueId) {
                  router.push('/leagues/my-leagues');
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
