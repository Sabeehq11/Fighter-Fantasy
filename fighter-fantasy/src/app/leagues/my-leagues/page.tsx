'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { League, Event } from '@/types';
import { 
  getUserLeagues, 
  leaveLeague, 
  deleteLeague,
  getLeagueDetails,
  getPublicLeagues,
  joinPublicLeague
} from '@/services/leagueService';
import { dataService } from '@/services/dataService';
import { getUserProfiles, UserProfile } from '@/services/userService';

export default function MyLeaguesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [events, setEvents] = useState<{ [key: string]: Event }>({});
  const [memberProfiles, setMemberProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-leagues' | 'find-leagues'>('my-leagues');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchUserLeagues();
    if (activeTab === 'find-leagues') {
      fetchPublicLeagues();
    }
  }, [user, activeTab]);

  const fetchUserLeagues = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userLeagues = await getUserLeagues(user.uid);
      setLeagues(userLeagues);
      
      // Fetch event details for each league
      const eventIds = [...new Set(userLeagues.map(l => l.event_id))];
      const allEvents = await dataService.getEvents();
      
      const eventsMap: { [key: string]: Event } = {};
      allEvents.forEach((event: Event) => {
        if (eventIds.includes(event.id)) {
          eventsMap[event.id] = event;
        }
      });
      setEvents(eventsMap);
      
      // Fetch member profiles for all leagues
      const allMemberIds = new Set<string>();
      userLeagues.forEach(league => {
        if (league.members) {
          league.members.forEach(memberId => allMemberIds.add(memberId));
        }
      });
      
      if (allMemberIds.size > 0) {
        const profiles = await getUserProfiles(Array.from(allMemberIds));
        setMemberProfiles(profiles);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicLeagues = async () => {
    try {
      setLoading(true);
      
      // Get all events first
      const allEvents = await dataService.getEvents();
      const eventsMap: { [key: string]: Event } = {};
      
      // Fetch public leagues for each event
      const allPublicLeagues: League[] = [];
      for (const event of allEvents) {
        eventsMap[event.id] = event;
        const eventPublicLeagues = await getPublicLeagues(event.id, 20);
        allPublicLeagues.push(...eventPublicLeagues);
      }
      
      setPublicLeagues(allPublicLeagues);
      setEvents(prev => ({ ...prev, ...eventsMap }));
      
      // Fetch member profiles for public leagues
      const allMemberIds = new Set<string>();
      allPublicLeagues.forEach(league => {
        if (league.members) {
          league.members.forEach(memberId => allMemberIds.add(memberId));
        }
      });
      
      if (allMemberIds.size > 0) {
        const profiles = await getUserProfiles(Array.from(allMemberIds));
        setMemberProfiles(prev => new Map([...prev, ...profiles]));
      }
    } catch (error) {
      console.error('Error fetching public leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveLeague = async () => {
    if (!user || !selectedLeague) return;
    
    try {
      const result = await leaveLeague(user.uid, selectedLeague.id);
      if (result.success) {
        await fetchUserLeagues();
        setShowLeaveConfirm(false);
        setSelectedLeague(null);
      } else {
        alert(result.error || 'Failed to leave league');
      }
    } catch (error) {
      console.error('Error leaving league:', error);
      alert('Failed to leave league');
    }
  };

  const handleDeleteLeague = async () => {
    if (!user || !selectedLeague) return;
    
    try {
      const result = await deleteLeague(user.uid, selectedLeague.id);
      if (result.success) {
        await fetchUserLeagues();
        setShowDeleteConfirm(false);
        setSelectedLeague(null);
      } else {
        alert(result.error || 'Failed to delete league');
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      alert('Failed to delete league');
    }
  };

  const copyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const handleJoinPublicLeague = async (leagueId: string) => {
    if (!user) return;
    
    try {
      const result = await joinPublicLeague(user.uid, leagueId);
      if (result.success) {
        // Refresh the lists
        await fetchUserLeagues();
        await fetchPublicLeagues();
        alert('Successfully joined the league!');
      } else {
        alert(result.error || 'Failed to join league');
      }
    } catch (error) {
      console.error('Error joining league:', error);
      alert('Failed to join league');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your leagues...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-green-500 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">My Leagues</span>
          </div>
          
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              My Leagues
            </h1>
            <Link href="/">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                Create New League
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('my-leagues')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'my-leagues'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Leagues
          </button>
          <button
            onClick={() => setActiveTab('find-leagues')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'find-leagues'
                ? 'text-green-500 border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Find Leagues
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'my-leagues' ? (
          leagues.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-white mb-4">No Leagues Yet</h2>
            <p className="text-gray-400 mb-8">Create or join a league to start competing!</p>
            <Link href="/">
              <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map(league => {
              const event = events[league.event_id];
              const isOwner = league.created_by === user?.uid;
              
              return (
                <div 
                  key={league.id}
                  className="bg-gray-900/90 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all"
                >
                  {/* League Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{league.name}</h3>
                        <div className="flex items-center gap-2">
                          {league.type === 'private' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                              🔒 Private
                            </span>
                          ) : league.type === 'public' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                              🌍 Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded">
                              ⭐ Global
                            </span>
                          )}
                          {isOwner && (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                              👑 Owner
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        league.status === 'open' 
                          ? 'bg-green-900/30 text-green-400'
                          : league.status === 'locked'
                          ? 'bg-red-900/30 text-red-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}>
                        {league.status.toUpperCase()}
                      </div>
                    </div>

                    {/* Event Info */}
                    {event && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-1">Event</p>
                        <p className="text-white font-medium">{event.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(event.date_utc).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* League Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Players</p>
                        <p className="text-lg font-bold text-white">
                          {league.members?.length || league.total_entries || 0}
                          {league.max_entries && `/${league.max_entries}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Entry Fee</p>
                        <p className="text-lg font-bold text-green-400">
                          ${league.entry_fee || 0}
                        </p>
                      </div>
                    </div>

                    {/* League Members */}
                    {league.members && league.members.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">Members</p>
                        <div className="flex flex-wrap gap-2">
                          {league.members.slice(0, 5).map(memberId => {
                            const profile = memberProfiles.get(memberId);
                            const isCurrentUser = memberId === user?.uid;
                            const isLeagueOwner = memberId === league.created_by;
                            
                            return (
                              <div 
                                key={memberId}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                                  isCurrentUser 
                                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                                    : 'bg-gray-800 text-gray-300'
                                }`}
                              >
                                {isLeagueOwner && <span className="text-yellow-400">👑</span>}
                                <span>{profile?.displayName || profile?.email?.split('@')[0] || 'User'}</span>
                                {isCurrentUser && <span className="text-green-400">(You)</span>}
                              </div>
                            );
                          })}
                          {league.members.length > 5 && (
                            <div className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-800 text-gray-400">
                              +{league.members.length - 5} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Join Code for Private Leagues */}
                    {league.type === 'private' && league.join_code && isOwner && (
                      <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                        <p className="text-xs text-gray-400 mb-2">Join Code</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-400 tracking-wider">
                            {league.join_code}
                          </span>
                          <button
                            onClick={() => copyJoinCode(league.join_code!)}
                            className="text-gray-400 hover:text-white transition-colors"
                            title="Copy code"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/fantasy/leaderboard/${league.event_id}`} className="flex-1">
                        <button className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors">
                          View Leaderboard
                        </button>
                      </Link>
                      
                      {isOwner ? (
                        <button
                          onClick={() => {
                            setSelectedLeague(league);
                            setShowDeleteConfirm(true);
                          }}
                          className="py-2 px-4 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      ) : league.type !== 'global' && (
                        <button
                          onClick={() => {
                            setSelectedLeague(league);
                            setShowLeaveConfirm(true);
                          }}
                          className="py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
        ) : (
          // Find Leagues Tab
          publicLeagues.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-white mb-4">No Public Leagues Available</h2>
              <p className="text-gray-400">Check back later for public leagues to join!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicLeagues.map(league => {
                const event = events[league.event_id];
                const isAlreadyMember = league.members?.includes(user?.uid || '');
                const isFull = league.max_entries && league.members && league.members.length >= league.max_entries;
                
                return (
                  <div 
                    key={league.id}
                    className="bg-gray-900/90 rounded-xl border border-gray-800 overflow-hidden hover:border-gray-700 transition-all"
                  >
                    {/* League Header */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{league.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                              🌍 Public
                            </span>
                            {league.is_featured && (
                              <span className="inline-flex items-center gap-1 text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          league.status === 'open' 
                            ? 'bg-green-900/30 text-green-400'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {league.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Description */}
                      {league.description && (
                        <p className="text-sm text-gray-400 mb-4">{league.description}</p>
                      )}

                      {/* Event Info */}
                      {event && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-400 mb-1">Event</p>
                          <p className="text-white font-medium">{event.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.date_utc).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {/* League Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-400">Players</p>
                          <p className="text-lg font-bold text-white">
                            {league.members?.length || 0}
                            {league.max_entries && `/${league.max_entries}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Entry Fee</p>
                          <p className="text-lg font-bold text-green-400">
                            ${league.entry_fee || 0}
                          </p>
                        </div>
                      </div>

                      {/* League Members Preview */}
                      {league.members && league.members.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-2">Members</p>
                          <div className="flex flex-wrap gap-2">
                            {league.members.slice(0, 3).map(memberId => {
                              const profile = memberProfiles.get(memberId);
                              return (
                                <div 
                                  key={memberId}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-800 text-gray-300"
                                >
                                  <span>{profile?.displayName || profile?.email?.split('@')[0] || 'User'}</span>
                                </div>
                              );
                            })}
                            {league.members.length > 3 && (
                              <div className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-800 text-gray-400">
                                +{league.members.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {isAlreadyMember ? (
                          <button 
                            disabled
                            className="flex-1 py-2 px-4 bg-gray-800 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                          >
                            Already Joined
                          </button>
                        ) : isFull ? (
                          <button 
                            disabled
                            className="flex-1 py-2 px-4 bg-gray-800 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                          >
                            League Full
                          </button>
                        ) : league.status !== 'open' ? (
                          <button 
                            disabled
                            className="flex-1 py-2 px-4 bg-gray-800 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed"
                          >
                            League Closed
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinPublicLeague(league.id)}
                            className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Join League
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedLeague && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete League?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{selectedLeague.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteLeague}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete League
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && selectedLeague && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLeaveConfirm(false)}
          />
          <div className="relative bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Leave League?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to leave "{selectedLeague.name}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveLeague}
                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Leave League
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 