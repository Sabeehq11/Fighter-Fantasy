'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { FantasyTeam, Event, Fighter, League, Fight } from '@/types';
import { getUserTeams, deleteTeam, getLeague } from '@/services/fantasyService';
import { getEvents, getFighters, getFightsByEvent } from '@/services/dataService';
import { format, differenceInSeconds } from 'date-fns';
import { toDate } from '@/lib/utils';
import type { PredictionEntry, PredictionLeague } from '@/types/prediction';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { getPredictionLeague } from '@/services/predictionService';

interface TeamWithDetails extends FantasyTeam {
  event?: Event;
  league?: League;
  fighterDetails?: Map<string, Fighter>;
  lockTime?: Date;
  isLocked?: boolean;
  timeUntilLock?: string;
}

interface PredictionEntryWithDetails extends PredictionEntry {
  event?: Event;
  league?: PredictionLeague | null;
  fights?: Fight[];
  fighterDetails?: Map<string, Fighter>;
  lockTime?: Date;
  isLocked?: boolean;
  timeUntilLock?: string;
}

export default function MyTeamsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [teams, setTeams] = useState<TeamWithDetails[]>([]);
  const [predictionEntries, setPredictionEntries] = useState<PredictionEntryWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'draft' | 'submitted' | 'scored'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'salary' | 'prediction'>('all');

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
      
      // Load both legacy teams and prediction entries in parallel
      const [userTeams, predictionEntriesData] = await Promise.all([
        getUserTeams(user.uid),
        loadPredictionEntries(user.uid)
      ]);
      
      // Load all events and fighters for reference
      const [events, fighters] = await Promise.all([
        getEvents(),
        getFighters()
      ]);
      
      const eventMap = new Map(events.map(e => [e.id, e]));
      const fighterMap = new Map(fighters.map(f => [f.id, f]));
      
      // Enrich legacy teams with event and fighter details
      const enrichedTeams: TeamWithDetails[] = await Promise.all(
        userTeams.map(async (team) => {
          const league = team.league_id ? await getLeague(team.league_id) : null;
          const event = eventMap.get(team.event_id);
          const fighterDetails = new Map<string, Fighter>();
          
          team.picks.forEach(pick => {
            const fighter = fighterMap.get(pick.fighter_id);
            if (fighter) {
              fighterDetails.set(pick.fighter_id, fighter);
            }
          });
          
          // Calculate lock time
          let lockTime: Date | undefined;
          let isLocked = false;
          if (event && league) {
            const eventDate = new Date(event.date_utc);
            const lockMinutes = league.settings.lock_time_minutes_before || 15;
            lockTime = new Date(eventDate.getTime() - lockMinutes * 60 * 1000);
            isLocked = new Date() >= lockTime || team.status === 'locked' || team.status === 'scored';
          }
          
          return {
            ...team,
            event,
            league: league || undefined,
            fighterDetails,
            lockTime,
            isLocked
          };
        })
      );
      
      // Enrich prediction entries with details
      const enrichedPredictions: PredictionEntryWithDetails[] = await Promise.all(
        predictionEntriesData.map(async (entry) => {
          const event = eventMap.get(entry.event_id);
          const league = entry.league_id ? await getPredictionLeague(entry.league_id) : null;
          const fights = event ? await getFightsByEvent(event.id) : [];
          const fighterDetails = new Map<string, Fighter>();
          
          // Get fighter details for each pick
          entry.picks.forEach(pick => {
            const fighter = fighterMap.get(pick.selected_fighter_id);
            if (fighter) {
              fighterDetails.set(pick.selected_fighter_id, fighter);
            }
          });
          
          // Calculate lock time
          let lockTime: Date | undefined;
          let isLocked = false;
          if (event && league) {
            const eventDate = new Date(event.date_utc);
            const lockMinutes = 15; // Default 15 minutes before main card
            lockTime = new Date(eventDate.getTime() - lockMinutes * 60 * 1000);
            isLocked = new Date() >= lockTime || entry.is_locked;
          }
          
          return {
            ...entry,
            event,
            league: league || null,
            fights,
            fighterDetails,
            lockTime,
            isLocked
          };
        })
      );
      
      // Sort by creation date (newest first)
      enrichedTeams.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      
      enrichedPredictions.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      
      setTeams(enrichedTeams);
      setPredictionEntries(enrichedPredictions);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPredictionEntries = async (userId: string): Promise<PredictionEntry[]> => {
    try {
      const q = query(
        collection(db, 'fantasy_entries'),
        where('user_id', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PredictionEntry));
    } catch (error) {
      console.error('Error loading prediction entries:', error);
      return [];
    }
  };

  // Add countdown timer update effect
  useEffect(() => {
    if (teams.length === 0) return;

    const updateCountdowns = () => {
      setTeams(prevTeams => 
        prevTeams.map(team => {
          if (!team.lockTime || team.isLocked) return team;

          const now = new Date();
          const locked = now >= team.lockTime;
          
          if (!locked) {
            const secondsRemaining = differenceInSeconds(team.lockTime, now);
            if (secondsRemaining > 0) {
              const hours = Math.floor(secondsRemaining / 3600);
              const minutes = Math.floor((secondsRemaining % 3600) / 60);
              const seconds = secondsRemaining % 60;

              let timeUntilLock = '';
              if (hours > 24) {
                const days = Math.floor(hours / 24);
                timeUntilLock = `${days}d ${hours % 24}h`;
              } else if (hours > 0) {
                timeUntilLock = `${hours}h ${minutes}m`;
              } else if (minutes > 0) {
                timeUntilLock = `${minutes}m ${seconds}s`;
              } else {
                timeUntilLock = `${seconds}s`;
              }

              return { ...team, timeUntilLock, isLocked: false };
            }
          }
          
          return { ...team, isLocked: true, timeUntilLock: 'LOCKED' };
        })
      );
    };

    // Initial update
    updateCountdowns();

    // Update every second
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [teams.length]);

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

  // Filter teams based on view mode
  const displayTeams = viewMode === 'prediction' ? [] : (viewMode === 'salary' ? teams : teams);
  const displayPredictions = viewMode === 'salary' ? [] : (viewMode === 'prediction' ? predictionEntries : predictionEntries);
  
  const filteredTeams = displayTeams.filter(team => {
    if (filter === 'all') return true;
    return team.status === filter;
  });
  
  const filteredPredictions = displayPredictions.filter(entry => {
    if (filter === 'all') return true;
    if (filter === 'draft') return !entry.is_locked && !entry.submitted_at;
    if (filter === 'submitted') return entry.is_locked || entry.submitted_at;
    if (filter === 'scored') return entry.total_points > 0;
    return false;
  });

  // Group teams by status
  const draftTeams = teams.filter(t => t.status === 'draft');
  const submittedTeams = teams.filter(t => t.status === 'submitted' || t.status === 'locked');
  const scoredTeams = teams.filter(t => t.status === 'scored');
  
  // Group predictions by status
  const draftPredictions = predictionEntries.filter(e => !e.is_locked && !e.submitted_at);
  const submittedPredictions = predictionEntries.filter(e => e.is_locked || e.submitted_at);
  const scoredPredictions = predictionEntries.filter(e => e.total_points > 0);

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
          {/* Navigation Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/fantasy" className="hover:text-white transition-colors">
              Fantasy
            </Link>
            <span>/</span>
            <span className="text-white">My Teams</span>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-4">My Fantasy Teams</h1>
              <p className="text-gray-300">
                Manage your fantasy teams and track your performance
              </p>
            </div>
            <Link href="/fantasy">
              <button className="bg-green-500 hover:bg-green-600 text-black font-bold px-6 py-3 rounded-lg transition-colors">
                Create New Team
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-900 rounded-lg p-1 inline-flex">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'all'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All Entries
          </button>
          <button
            onClick={() => setViewMode('prediction')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'prediction'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Predictions
          </button>
          <button
            onClick={() => setViewMode('salary')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              viewMode === 'salary'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Salary Cap (Legacy)
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-white">
              {viewMode === 'salary' ? teams.length : viewMode === 'prediction' ? predictionEntries.length : teams.length + predictionEntries.length}
            </div>
            <div className="text-sm text-gray-400">Total Entries</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-yellow-400">
              {viewMode === 'salary' ? draftTeams.length : viewMode === 'prediction' ? draftPredictions.length : draftTeams.length + draftPredictions.length}
            </div>
            <div className="text-sm text-gray-400">Draft Entries</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-green-400">
              {viewMode === 'salary' ? submittedTeams.length : viewMode === 'prediction' ? submittedPredictions.length : submittedTeams.length + submittedPredictions.length}
            </div>
            <div className="text-sm text-gray-400">Active Entries</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <div className="text-3xl font-bold text-blue-400">
              {viewMode === 'salary' ? scoredTeams.length : viewMode === 'prediction' ? scoredPredictions.length : scoredTeams.length + scoredPredictions.length}
            </div>
            <div className="text-sm text-gray-400">Scored Entries</div>
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

        {/* Teams/Entries List */}
        {filteredTeams.length === 0 && filteredPredictions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't created any entries yet"
                : `No ${filter} entries found`}
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
            {/* Display Prediction Entries */}
            {viewMode !== 'salary' && filteredPredictions.map(entry => (
              <div
                key={entry.id}
                className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {entry.event?.name || 'Prediction Entry'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {entry.event && format(new Date(entry.event.date_utc), 'MMM d, yyyy')}
                        </span>
                        <span className="text-purple-400 font-medium">
                          🎯 Prediction Mode
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {entry.isLocked ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-800">
                          {entry.timeUntilLock ? `Lock in ${entry.timeUntilLock}` : 'Draft'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Prediction Picks Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    {entry.picks.slice(0, 4).map((pick, idx) => {
                      const fighter = entry.fighterDetails?.get(pick.selected_fighter_id);
                      return (
                        <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">
                              {fighter?.name || 'Unknown Fighter'}
                              {pick.is_captain && <span className="ml-2 text-yellow-400">⭐</span>}
                            </span>
                            <span className="text-xs text-gray-400">
                              {pick.prediction?.method} {pick.prediction?.round}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {entry.picks.length > 4 && (
                      <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-center text-gray-400">
                        +{entry.picks.length - 4} more picks
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    {!entry.isLocked && (
                      <Link
                        href={`/fantasy/team-builder/${entry.event_id}?entry=${entry.id}`}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-center"
                      >
                        Edit Predictions
                      </Link>
                    )}
                    {entry.total_points > 0 && (
                      <div className="flex-1 bg-blue-900/30 text-blue-400 font-medium py-2 px-4 rounded-lg text-center border border-blue-800">
                        {entry.total_points} Points
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Display Salary Cap Teams */}
            {viewMode !== 'prediction' && filteredTeams.map(team => (
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
                      
                      {/* Lock Status */}
                      {(team.status === 'draft' || team.status === 'submitted') && team.timeUntilLock && (
                        <div className={`mt-2 text-sm ${team.isLocked ? 'text-red-400' : 'text-yellow-400'}`}>
                          {team.isLocked ? '🔒 Locked' : `⏱️ ${team.timeUntilLock}`}
                        </div>
                      )}
                      
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
                        {!team.isLocked ? (
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
                        ) : (
                          <div className="text-sm text-red-400 py-2">
                            ⚠️ Team locked - Event starting soon
                          </div>
                        )}
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
                      Created: {(() => {
                        const date = toDate(team.created_at);
                        return date ? format(date, 'MMM d, yyyy h:mm a') : 'Unknown';
                      })()}
                    </div>
                    {team.submitted_at && (
                      <div>
                        Submitted: {(() => {
                          const date = toDate(team.submitted_at);
                          return date ? format(date, 'MMM d, yyyy h:mm a') : 'Unknown';
                        })()}
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