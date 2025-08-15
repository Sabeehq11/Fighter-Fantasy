'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@/lib/hooks/useUser';
import { dataService } from '@/services/dataService';
import { Event } from '@/types';

export default function FantasyPage() {
  const { isAuthenticated } = useUser();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      // Fetch upcoming events
      const upcoming = await dataService.getUpcomingEvents(5);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Calculate contest details based on event type
  const getContestDetails = (event: Event) => {
    const isPPV = event.type === 'PPV';
    return {
      prizePool: isPPV ? '$15,000' : '$5,000',
      entryFee: isPPV ? '$20' : '$10',
      entries: isPPV ? '3,456' : '1,234', // These could be fetched from a contests collection later
    };
  };

  const myTeams = [
    { id: 1, event: 'UFC 297', score: 342, rank: 12, winnings: '$50' },
    { id: 2, event: 'UFC 296', score: 289, rank: 45, winnings: '$0' },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
          <h1 className="text-5xl font-bold mb-4 text-white">Fighter Fantasy</h1>
          <p className="text-xl text-gray-300 mb-6">
            Build your dream team. Compete for prizes. Dominate the octagon.
          </p>
          {isAuthenticated ? (
            upcomingEvents.length > 0 ? (
              <Link href={`/fantasy/team-builder/${upcomingEvents[0].id}`}>
                <Button className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 text-lg">
                  Build Your Team →
                </Button>
              </Link>
            ) : (
              <Button disabled className="bg-gray-600 text-gray-300 font-bold px-6 py-3 text-lg cursor-not-allowed">
                No Events Available
              </Button>
            )
          ) : (
            <Link href="/signup">
              <Button className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 text-lg">
                Sign Up to Play →
              </Button>
            </Link>
          )}
        </div>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="text-3xl mb-3">📋</div>
                <CardTitle className="text-xl text-white">1. Build Your Team</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Select fighters within the salary cap. Balance stars with value picks.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="text-3xl mb-3">🥊</div>
                <CardTitle className="text-xl text-white">2. Score Points</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Earn points for strikes, takedowns, finishes, and fight outcomes.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="text-3xl mb-3">🏆</div>
                <CardTitle className="text-xl text-white">3. Win Prizes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Climb the leaderboard and win cash prizes based on your team's performance.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Upcoming Contests */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-green-500">Upcoming Contests</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-white text-lg">Loading contests...</div>
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-4">
              {upcomingEvents.map(event => {
                const contestDetails = getContestDetails(event);
                return (
                  <Card key={event.id} className="bg-gray-900 border-gray-800 hover:border-green-500 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{event.name}</h3>
                          <div className="flex gap-6 text-sm">
                            <span className="text-gray-400">
                              📅 {formatDate(event.date_utc)}
                            </span>
                            <span className="text-green-500 font-semibold">
                              💰 {contestDetails.prizePool} Prize Pool
                            </span>
                            <span className="text-gray-400">
                              👥 {contestDetails.entries} entries
                            </span>
                            {event.type === 'PPV' && (
                              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full text-xs">
                                PPV EVENT
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs text-gray-500">Entry Fee</div>
                            <div className="text-lg font-bold text-white">{contestDetails.entryFee}</div>
                          </div>
                          <Link href={`/fantasy/team-builder/${event.id}`}>
                            <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                              Enter Contest
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400 text-lg">No upcoming contests available</p>
                <p className="text-gray-500 mt-2">Check back soon for new UFC events!</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* My Recent Teams */}
        {isAuthenticated && myTeams.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-6 text-white">My Recent Teams</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {myTeams.map(team => (
                <Card key={team.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">{team.event}</CardTitle>
                    <CardDescription className="text-gray-400">
                      Final Score: {team.score} points
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-gray-500">Final Rank</div>
                        <div className="text-2xl font-bold text-white">#{team.rank}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Winnings</div>
                        <div className="text-2xl font-bold text-green-500">{team.winnings}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/fantasy/my-teams">
                <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
                  View All My Teams →
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* Scoring System */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-white">Scoring System</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-green-500 mb-3">Fight Outcomes</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win by KO/TKO/SUB</span>
                      <span className="text-white font-mono">+100 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win by Decision</span>
                      <span className="text-white font-mono">+75 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">First Round Finish</span>
                      <span className="text-white font-mono">+50 pts</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-500 mb-3">In-Fight Actions</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Significant Strike</span>
                      <span className="text-white font-mono">+0.5 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Takedown</span>
                      <span className="text-white font-mono">+5 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Knockdown</span>
                      <span className="text-white font-mono">+20 pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
} 