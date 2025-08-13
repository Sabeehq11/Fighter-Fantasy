'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { FantasyTeam, Event, Fighter, League } from '@/types';
import { getUserTeams, getTeam, deleteTeam, getLeague } from '@/services/fantasyService';
import { getEvents, getFighters } from '@/services/dataService';
import { format } from 'date-fns';

interface TeamWithDetails extends FantasyTeam {
  event?: Event;
  league?: League;
  fighterDetails?: Map<string, Fighter>;
}

export default function MyTeamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'scored'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadUserTeams();
  }, [user]);

  const loadUserTeams = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load user teams
      const userTeams = await getUserTeams(user.uid);
      
      // Load all events and fighters for reference
      const [events, fighters] = await Promise.all([
        getEvents(),
        getFighters()
      ]);
      
      const eventMap = new Map(events.map(e => [e.id, e]));
      const fighterMap = new Map(fighters.map(f => [f.id, f]));
      
      // Enrich teams with event and fighter details
      const enrichedTeams: TeamWithDetails[] = await Promise.all(
        userTeams.map(async (team) => {
          const league = team.league_id ? await getLeague(team.league_id) : null;
          const fighterDetails = new Map<string, Fighter>();
          
          team.picks.forEach(pick => {
            const fighter = fighterMap.get(pick.fighter_id);
            if (fighter) {
              fighterDetails.set(pick.fighter_id, fighter);
            }
          });
          
          return {
            ...team,
            event: eventMap.get(team.event_id),
            league: league || undefined,
            fighterDetails
          };
        })
      );
      
      // Sort by creation date (newest first)
      enrichedTeams.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      
      setTeams(enrichedTeams);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    setDeletingTeamId(teamId);
    try {
      const success = await deleteTeam(teamId);
      if (success) {
        setTeams(prev => prev.filter(t => t.id !== teamId));
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    } finally {
      setDeletingTeamId(null);
    }
  };

  // Filter teams
  const filteredTeams = teams.filter(team => {
    if (filter === 'all') return true;
    return team.status === filter;
  });

  // Group teams by status
  const draftTeams = teams.filter(t => t.status === 'draft');
  const submittedTeams = teams.filter(t => t.status === 'submitted' || t.status === 'locked');
  const scoredTeams = teams.filter(t => t.status === 'scored');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your teams...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-red-900/20 to-black py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">My Fantasy Teams</h1>
          <p className="text-gray-300">
            Manage your fantasy teams and track your performance
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-white">{teams.length}</div>
            <div className="text-sm text-gray-400">Total Teams</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-yellow-400">{draftTeams.length}</div>
            <div className="text-sm text-gray-400">Draft Teams</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-green-400">{submittedTeams.length}</div>
            <div className="text-sm text-gray-400">Active Teams</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-blue-400">{scoredTeams.length}</div>
            <div className="text-sm text-gray-400">Scored Teams</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {(['all', 'draft', 'submitted', 'scored'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 font-medium capitalize transition-colors ${
                filter === status
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {status === 'all' ? 'All Teams' : status}
            </button>
          ))}
        </div>

        {/* Teams List */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't created any teams yet"
                : `No ${filter} teams found`}
            </p>
            <Link
              href="/fantasy"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Browse Contests
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTeams.map(team => (
              <div
                key={team.id}
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
              >
                {/* Team Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{team.name}</h2>
                      {team.event && (
                        <p className="text-gray-400">
                          {team.event.name} • {format(new Date(team.event.date_utc), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        team.status === 'draft'
                          ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50'
                          : team.status === 'submitted' || team.status === 'locked'
                          ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                          : team.status === 'scored'
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                          : 'bg-gray-700 text-gray-300'
                      }`}>
                        {team.status.toUpperCase()}
                      </div>
                      {team.total_points !== undefined && team.total_points > 0 && (
                        <div className="mt-2">
                          <div className="text-2xl font-bold">{team.total_points} pts</div>
                          {team.rank && (
                            <div className="text-sm text-gray-400">Rank #{team.rank}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team Composition */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    {team.picks.map((pick, index) => {
                      const fighter = team.fighterDetails?.get(pick.fighter_id);
                      return (
                        <div
                          key={pick.fighter_id}
                          className={`bg-gray-800 rounded-lg p-3 ${
                            pick.is_captain ? 'ring-2 ring-yellow-500' : ''
                          }`}
                        >
                          <div className="text-sm font-medium">
                            {fighter?.name || 'Unknown Fighter'}
                          </div>
                          <div className="text-xs text-gray-400">
                            ${pick.salary.toLocaleString()}
                          </div>
                          {pick.is_captain && (
                            <div className="text-xs text-yellow-400 mt-1">⭐ Captain</div>
                          )}
                          {pick.points !== undefined && (
                            <div className="text-sm font-bold text-green-400 mt-1">
                              {pick.points} pts
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Budget Info */}
                  <div className="flex gap-6 text-sm text-gray-400 mb-4">
                    <div>
                      <span className="text-gray-500">Budget Used:</span>{' '}
                      <span className="text-white font-medium">
                        ${team.total_salary.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Remaining:</span>{' '}
                      <span className="text-white font-medium">
                        ${team.remaining_budget.toLocaleString()}
                      </span>
                    </div>
                    {team.league?.settings.apply_ppv_multiplier && (
                      <div className="text-yellow-400">
                        PPV 1.5x Bonus Active
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {team.status === 'draft' && team.event?.status === 'upcoming' && (
                      <>
                        <Link
                          href={`/fantasy/team-builder/${team.event_id}?teamId=${team.id}`}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          Edit Team
                        </Link>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          disabled={deletingTeamId === team.id}
                          className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          {deletingTeamId === team.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                    {(team.status === 'submitted' || team.status === 'locked' || team.status === 'scored') && (
                      <Link
                        href={`/fantasy/leaderboard/${team.event_id}`}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        View Leaderboard
                      </Link>
                    )}
                    {team.event && (
                      <Link
                        href={`/events/${team.event.id}`}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        View Event
                      </Link>
                    )}
                  </div>
                </div>

                {/* Team Metadata */}
                <div className="bg-gray-800/50 px-6 py-3 border-t border-gray-800">
                  <div className="flex justify-between text-xs text-gray-500">
                    <div>
                      Created: {team.created_at ? format(new Date(team.created_at), 'MMM d, yyyy h:mm a') : 'Unknown'}
                    </div>
                    {team.submitted_at && (
                      <div>
                        Submitted: {format(new Date(team.submitted_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 