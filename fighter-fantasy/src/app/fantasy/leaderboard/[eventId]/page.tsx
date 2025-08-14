'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Event, FantasyTeam, Fighter } from '@/types';
import { getLeaderboard } from '@/services/fantasyService';
import { getEvent, getFighters } from '@/services/dataService';
import { format } from 'date-fns';
import { useAuth } from '@/lib/hooks/useAuth';

interface LeaderboardEntry extends FantasyTeam {
  fighterDetails: Map<string, Fighter>;
}

export default function LeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.eventId as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [eventId]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      
      // Load event
      const eventData = await getEvent(eventId);
      if (!eventData) {
        router.push('/fantasy');
        return;
      }
      setEvent(eventData);

      // Load leaderboard (this would need the league ID in a real app)
      const leagueId = `league_global_${eventId}`;
      const teams = await getLeaderboard(leagueId);
      
      // Load fighters for details
      const fighters = await getFighters();
      const fighterMap = new Map(fighters.map(f => [f.id, f]));
      
      // Enrich teams with fighter details
      const enrichedTeams: LeaderboardEntry[] = teams.map(team => {
        const fighterDetails = new Map<string, Fighter>();
        team.picks.forEach(pick => {
          const fighter = fighterMap.get(pick.fighter_id);
          if (fighter) {
            fighterDetails.set(pick.fighter_id, fighter);
          }
        });
        
        return {
          ...team,
          fighterDetails
        };
      });
      
      setLeaderboard(enrichedTeams);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Event not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-red-900/20 to-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
              <p className="text-xl text-gray-300">{event.name}</p>
              <p className="text-gray-400">
                {format(new Date(event.date_utc), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <Link
              href={`/events/${event.id}`}
              className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              View Event
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No teams submitted yet</p>
            <Link
              href={`/fantasy/team-builder/${eventId}`}
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Build Your Team
            </Link>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Fighters
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {leaderboard.map((team, index) => {
                  const isUserTeam = user && team.user_id === user.uid;
                  
                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-gray-800/50 cursor-pointer transition-colors ${
                        isUserTeam ? 'bg-red-900/10' : ''
                      }`}
                      onClick={() => setSelectedTeam(team)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-2xl font-bold ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-600' :
                            'text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          {index < 3 && (
                            <span className="ml-2">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {team.name}
                        </div>
                        {isUserTeam && (
                          <span className="text-xs text-red-400">Your Team</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {team.user_id.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {team.picks.slice(0, 3).map(pick => {
                            const fighter = team.fighterDetails.get(pick.fighter_id);
                            return (
                              <div
                                key={pick.fighter_id}
                                className="bg-gray-700 rounded-full px-2 py-1 text-xs border border-gray-600"
                                title={fighter?.name}
                              >
                                {fighter?.name.split(' ').pop()}
                                {pick.is_captain && ' ⭐'}
                              </div>
                            );
                          })}
                          {team.picks.length > 3 && (
                            <div className="bg-gray-700 rounded-full px-2 py-1 text-xs border border-gray-600">
                              +{team.picks.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-2xl font-bold text-white">
                          {team.total_points || 0}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Team Details Modal */}
        {selectedTeam && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTeam(null)}
          >
            <div
              className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{selectedTeam.name}</h2>
                  <p className="text-gray-400">Rank #{selectedTeam.rank}</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {selectedTeam.picks.map(pick => {
                  const fighter = selectedTeam.fighterDetails.get(pick.fighter_id);
                  return (
                    <div
                      key={pick.fighter_id}
                      className={`bg-gray-800 rounded-lg p-4 ${
                        pick.is_captain ? 'ring-2 ring-yellow-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {fighter?.name || 'Unknown Fighter'}
                            {pick.is_captain && ' ⭐'}
                          </div>
                          <div className="text-sm text-gray-400">
                            {fighter?.division} • {fighter?.record.wins}-{fighter?.record.losses}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">
                            ${pick.salary.toLocaleString()}
                          </div>
                          {pick.points !== undefined && (
                            <div className="text-lg font-bold text-green-400">
                              {pick.points.toFixed(1)} pts
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Score Breakdown */}
                      {pick.score_breakdown && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div className="text-xs text-gray-400 mb-2">Score Breakdown:</div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            {pick.score_breakdown.base_points !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Base Points:</span>
                                <span className="text-white">{pick.score_breakdown.base_points}</span>
                              </div>
                            )}
                            {pick.score_breakdown.method_bonus !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Method Bonus:</span>
                                <span className="text-white">{pick.score_breakdown.method_bonus}</span>
                              </div>
                            )}
                            {pick.score_breakdown.round_bonus !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Round Bonus:</span>
                                <span className="text-white">{pick.score_breakdown.round_bonus}</span>
                              </div>
                            )}
                            {pick.score_breakdown.performance_bonuses !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Performance:</span>
                                <span className="text-white">{pick.score_breakdown.performance_bonuses}</span>
                              </div>
                            )}
                            {pick.score_breakdown.penalties !== 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Penalties:</span>
                                <span className="text-red-400">{pick.score_breakdown.penalties}</span>
                              </div>
                            )}
                            {pick.score_breakdown.underdog_multiplier && pick.score_breakdown.underdog_multiplier > 1 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Underdog:</span>
                                <span className="text-yellow-400">{pick.score_breakdown.underdog_multiplier}x</span>
                              </div>
                            )}
                            {pick.score_breakdown.captain_multiplier && pick.score_breakdown.captain_multiplier > 1 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">Captain:</span>
                                <span className="text-yellow-400">{pick.score_breakdown.captain_multiplier}x</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Detailed breakdown if available */}
                          {pick.score_breakdown.details && pick.score_breakdown.details.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <div className="text-xs space-y-1">
                                {pick.score_breakdown.details.map((detail, idx) => (
                                  <div key={idx} className="text-gray-500">
                                    • {detail}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Points</span>
                  <span className="text-3xl font-bold text-white">
                    {selectedTeam.total_points || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 