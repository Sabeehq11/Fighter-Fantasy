'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Event, League, FantasyTeam } from '@/types';
import { getEvents } from '@/services/dataService';
import { getLeaguesByEvent, getUserTeams } from '@/services/fantasyService';
import { format } from 'date-fns';

export default function FantasyHub() {
  const { user } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [userTeams, setUserTeams] = useState<FantasyTeam[]>([]);
  const [leagues, setLeagues] = useState<Map<string, League[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFantasyData();
  }, [user]);

  const loadFantasyData = async () => {
    try {
      // Load upcoming events
      const events = await getEvents();
      const upcoming = events
        .filter((e: Event) => e.status === 'upcoming')
        .sort((a: Event, b: Event) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime())
        .slice(0, 5);
      
      setUpcomingEvents(upcoming);

      // Load leagues for each event
      const leaguesMap = new Map<string, League[]>();
      for (const event of upcoming) {
        const eventLeagues = await getLeaguesByEvent(event.id);
        if (eventLeagues.length > 0) {
          leaguesMap.set(event.id, eventLeagues);
        }
      }
      setLeagues(leaguesMap);

      // Load user teams if logged in
      if (user) {
        const teams = await getUserTeams(user.uid);
        setUserTeams(teams);
      }
    } catch (error) {
      console.error('Error loading fantasy data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading fantasy data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-red-900/20 to-black py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              UFC Fantasy League
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Build your dream team and compete for glory
            </p>
            {!user && (
              <Link
                href="/login"
                className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Sign In to Play
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Upcoming Contests */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Upcoming Contests</h2>
              <div className="space-y-4">
                {upcomingEvents.map(event => {
                  const eventLeagues = leagues.get(event.id) || [];
                  const globalLeague = eventLeagues.find(l => l.type === 'global');
                  
                  return (
                    <div
                      key={event.id}
                      className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-red-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{event.name}</h3>
                          <p className="text-gray-400">
                            {format(new Date(event.date_utc), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          event.type === 'PPV' 
                            ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50' 
                            : 'bg-gray-700 text-gray-300'
                        }`}>
                          {event.type}
                        </span>
                      </div>

                      {globalLeague && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Global Championship</span>
                            <span className="text-green-400">{globalLeague.total_entries} entries</span>
                          </div>
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <span className="text-gray-400">
                              Budget: <span className="text-white font-medium">${globalLeague.settings.budget}</span>
                            </span>
                            <span className="text-gray-400">
                              Team Size: <span className="text-white font-medium">{globalLeague.settings.team_size}</span>
                            </span>
                            {globalLeague.settings.apply_ppv_multiplier && (
                              <span className="text-yellow-400">
                                PPV 1.5x Bonus
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Link
                          href={`/fantasy/team-builder/${event.id}`}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                        >
                          Build Team
                        </Link>
                        <Link
                          href={`/events/${event.id}`}
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                        >
                          View Event
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* How to Play */}
            <section>
              <h2 className="text-3xl font-bold mb-6">How to Play</h2>
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Select an Event</h3>
                      <p className="text-gray-400">Choose from upcoming UFC events and enter the global championship</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Build Your Team</h3>
                      <p className="text-gray-400">
                        Select 5 fighters within your $10,000 budget. You can't pick both fighters from the same matchup.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Choose Your Captain</h3>
                      <p className="text-gray-400">
                        Select one fighter as your captain to earn 1.5x points. PPV events give all fighters an additional 1.5x multiplier!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">Watch & Win</h3>
                      <p className="text-gray-400">
                        Teams lock 15 minutes before the event starts. Watch your fighters compete and climb the leaderboard!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Scoring Rules */}
            <section>
              <h2 className="text-3xl font-bold mb-6">Scoring System</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <h3 className="font-bold text-red-400 mb-3">Base Points</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win</span>
                      <span className="font-medium">100 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Loss</span>
                      <span className="font-medium">25 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Draw</span>
                      <span className="font-medium">50 pts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <h3 className="font-bold text-red-400 mb-3">Method Bonuses</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">KO/TKO</span>
                      <span className="font-medium">+50 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Submission</span>
                      <span className="font-medium">+75 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Round 1 Finish</span>
                      <span className="font-medium">+100 pts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <h3 className="font-bold text-red-400 mb-3">Performance</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fight of the Night</span>
                      <span className="font-medium">+50 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Performance Bonus</span>
                      <span className="font-medium">+75 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Knockdown</span>
                      <span className="font-medium">+25 pts</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <h3 className="font-bold text-red-400 mb-3">Multipliers</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Captain</span>
                      <span className="font-medium">1.5x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">PPV Event</span>
                      <span className="font-medium">1.5x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Underdog (+200)</span>
                      <span className="font-medium">1.5x</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* User Teams */}
            {user && userTeams.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-4">Your Teams</h2>
                <div className="space-y-3">
                  {userTeams.slice(0, 5).map(team => (
                    <Link
                      key={team.id}
                      href={`/fantasy/my-teams`}
                      className="block bg-gray-900 rounded-lg p-4 border border-gray-800 hover:border-red-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{team.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          team.status === 'submitted' 
                            ? 'bg-green-600/20 text-green-400'
                            : team.status === 'scored'
                            ? 'bg-blue-600/20 text-blue-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {team.status}
                        </span>
                      </div>
                      {team.total_points !== undefined && (
                        <p className="text-2xl font-bold text-red-400">
                          {team.total_points} pts
                        </p>
                      )}
                    </Link>
                  ))}
                  {userTeams.length > 5 && (
                    <Link
                      href="/fantasy/my-teams"
                      className="block text-center text-red-400 hover:text-red-300 font-medium"
                    >
                      View all teams →
                    </Link>
                  )}
                </div>
              </section>
            )}

            {/* Quick Stats */}
            <section>
              <h2 className="text-2xl font-bold mb-4">Game Modes</h2>
              <div className="space-y-3">
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <h3 className="font-bold text-green-400 mb-2">Weekly Fantasy</h3>
                  <p className="text-sm text-gray-400">
                    Build a 5-fighter team for each event. Use captain and PPV multipliers to maximize points.
                  </p>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                  <h3 className="font-bold text-blue-400 mb-2">One & Done</h3>
                  <p className="text-sm text-gray-400">
                    Pick one fighter per event. Once used, that fighter can't be picked again this season.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Coming Soon</p>
                </div>
              </div>
            </section>

            {/* CTA */}
            {!user && (
              <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-2">Ready to compete?</h3>
                <p className="text-sm mb-4 opacity-90">
                  Join thousands of MMA fans in the ultimate fantasy experience
                </p>
                <Link
                  href="/signup"
                  className="inline-block bg-white text-red-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 