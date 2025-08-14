'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getFighter } from '@/services/dataService';
import { Fighter } from '@/types';

export default function FighterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFighter = async () => {
      try {
        if (params.id) {
          const data = await getFighter(params.id as string);
          setFighter(data);
        }
      } catch (error) {
        console.error('Error loading fighter:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFighter();
  }, [params.id]);

  // Helper functions
  const formatHeight = (inches: number | null | undefined) => {
    if (!inches) return 'N/A';
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  const formatReach = (reach: number | null | undefined) => {
    if (!reach) return 'N/A';
    return `${reach}"`;
  };

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const getFinishRate = (fighter: Fighter) => {
    if (!fighter.record || !fighter.finishes) return 0;
    const totalWins = fighter.record.wins;
    if (totalWins === 0) return 0;
    const finishes = (fighter.finishes.ko_tko || 0) + (fighter.finishes.submissions || 0);
    return Math.round((finishes / totalWins) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading fighter profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Fighter not found</p>
            <Button 
              onClick={() => router.push('/fighters')}
              className="mt-4 bg-green-500 hover:bg-green-600 text-black"
            >
              Back to Fighters
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const wins = fighter.record?.wins || 0;
  const losses = fighter.record?.losses || 0;
  const draws = fighter.record?.draws || 0;
  const noContests = fighter.record?.no_contests || 0;
  const totalFights = wins + losses + draws + noContests;

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => router.push('/fighters')}
          variant="outline"
          className="mb-6 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
        >
          ← Back to Fighters
        </Button>

        {/* Main Profile Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column - Profile Image Placeholder */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-gray-600 text-6xl">🥊</span>
                </div>
                <div className="text-center">
                  {fighter.isChampion && (
                    <div className="mb-3">
                      <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                        🏆 CHAMPION
                      </span>
                    </div>
                  )}
                  {fighter.ranking && !fighter.isChampion && (
                    <div className="mb-3">
                      <span className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm">
                        #{fighter.ranking} Ranked
                      </span>
                    </div>
                  )}
                  <h1 className="text-3xl font-bold text-white mb-2">{fighter.name}</h1>
                  {fighter.nickname && (
                    <p className="text-gray-400 text-lg mb-2">"{fighter.nickname}"</p>
                  )}
                  <p className="text-green-500 font-semibold text-xl">{fighter.division}</p>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 space-y-2">
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold">
                    Add to Fantasy Team
                  </Button>
                  <Button variant="outline" className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
                    View Fight History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Fighter Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Record Overview */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Professional Record</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">{wins}</p>
                    <p className="text-gray-400 text-sm">Wins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-500">{losses}</p>
                    <p className="text-gray-400 text-sm">Losses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-500">{draws}</p>
                    <p className="text-gray-400 text-sm">Draws</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-500">{noContests}</p>
                    <p className="text-gray-400 text-sm">No Contest</p>
                  </div>
                </div>

                {/* Win Percentage Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-white font-semibold">{getWinPercentage(wins, losses)}%</span>
                  </div>
                  <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${getWinPercentage(wins, losses)}%` }}
                    />
                  </div>
                </div>

                {/* Finish Breakdown */}
                {fighter.finishes && (
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                    <div>
                      <p className="text-2xl font-bold text-orange-500">{fighter.finishes.ko_tko || 0}</p>
                      <p className="text-gray-400 text-sm">KO/TKO</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-500">{fighter.finishes.submissions || 0}</p>
                      <p className="text-gray-400 text-sm">Submissions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-500">{fighter.finishes.decisions || 0}</p>
                      <p className="text-gray-400 text-sm">Decisions</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <span className="text-gray-400 text-sm">Finish Rate: </span>
                  <span className="text-green-500 font-semibold">{getFinishRate(fighter)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Physical Attributes */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Physical Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Height</p>
                    <p className="text-white text-xl font-semibold">{formatHeight(fighter.height_inches)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Reach</p>
                    <p className="text-white text-xl font-semibold">{formatReach(fighter.reach_inches)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Weight</p>
                    <p className="text-white text-xl font-semibold">{fighter.weight_lbs || 'N/A'} lbs</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Stance</p>
                    <p className="text-white text-xl font-semibold">{fighter.stance || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Age</p>
                    <p className="text-white text-xl font-semibold">{fighter.age || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Fights</p>
                    <p className="text-white text-xl font-semibold">{totalFights}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Background Information */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Background</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Nationality</p>
                    <p className="text-white text-lg">{fighter.nationality || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Hometown</p>
                    <p className="text-white text-lg">{fighter.hometown || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-400 text-sm mb-1">Training Camp</p>
                    <p className="text-white text-lg">{fighter.gym || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fighting Stats (if available) */}
            {fighter.stats && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Fighting Statistics</CardTitle>
                  <CardDescription className="text-gray-400">Per 15 minutes averages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-green-500 font-semibold mb-3">Offense</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-400 text-sm">Sig. Strikes per Min</p>
                          <p className="text-white text-lg font-semibold">
                            {fighter.stats.sig_strikes_per_min?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Strike Accuracy</p>
                          <p className="text-white text-lg font-semibold">
                            {fighter.stats.sig_strike_accuracy || 'N/A'}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Takedown Avg</p>
                          <p className="text-white text-lg font-semibold">
                            {fighter.stats.takedown_avg?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Submission Attempts</p>
                          <p className="text-white text-lg font-semibold">
                            {fighter.stats.sub_attempts_per_15?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-blue-500 font-semibold mb-3">Defense</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-400 text-sm">Strikes Absorbed per Min</p>
                          <p className="text-white text-lg font-semibold">
                            {fighter.stats.sig_strikes_absorbed_per_min?.toFixed(2) || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Strike Defense</p>
                          <p className="text-white text-lg font-semibold">
                            {fighter.stats.sig_strike_defense || 'N/A'}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Takedown Defense</p>
                          <p className="text-white text-lg font-semibold">
                            {fighter.stats.takedown_defense || 'N/A'}%
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Takedown Accuracy</p>
                          <p className="text-white text-lg font-semibold">
                            {fighter.stats.takedown_accuracy || 'N/A'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 