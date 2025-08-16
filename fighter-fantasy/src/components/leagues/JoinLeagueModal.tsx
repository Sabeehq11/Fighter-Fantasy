'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { League, Event } from '@/types';
import { 
  joinPrivateLeague, 
  joinPublicLeague, 
  getPublicLeagues,
  searchPublicLeagues 
} from '@/services/leagueService';
import { dataService } from '@/services/dataService';

interface JoinLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: (leagueId: string, leagueName: string) => void;
}

export default function JoinLeagueModal({ 
  isOpen, 
  onClose, 
  userId,
  onSuccess 
}: JoinLeagueModalProps) {
  const [joinType, setJoinType] = useState<'private' | 'public'>('private');
  const [joinCode, setJoinCode] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [publicLeagues, setPublicLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUpcomingEvents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (joinType === 'public' && selectedEventId) {
      fetchPublicLeagues();
    }
  }, [joinType, selectedEventId]);

  const fetchUpcomingEvents = async () => {
    try {
      const upcomingEvents = await dataService.getUpcomingEvents(20);
      setEvents(upcomingEvents);
      if (upcomingEvents.length > 0) {
        setSelectedEventId(upcomingEvents[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchPublicLeagues = async () => {
    if (!selectedEventId) return;
    
    setSearching(true);
    try {
      const leagues = searchTerm 
        ? await searchPublicLeagues(searchTerm, selectedEventId)
        : await getPublicLeagues(selectedEventId);
      setPublicLeagues(leagues);
    } catch (error) {
      console.error('Error fetching public leagues:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleJoinPrivate = async () => {
    if (!joinCode.trim()) {
      setError('Please enter a join code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await joinPrivateLeague(userId, joinCode.toUpperCase());
      if (result.success && result.leagueId && result.leagueName) {
        onSuccess?.(result.leagueId, result.leagueName);
        handleClose();
      } else {
        setError(result.error || 'Failed to join league');
      }
    } catch (error) {
      console.error('Error joining private league:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPublic = async (leagueId: string, leagueName: string) => {
    setLoading(true);
    setError('');

    try {
      const result = await joinPublicLeague(userId, leagueId);
      if (result.success) {
        onSuccess?.(leagueId, leagueName);
        handleClose();
      } else {
        setError(result.error || 'Failed to join league');
      }
    } catch (error) {
      console.error('Error joining public league:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setJoinCode('');
    setSearchTerm('');
    setError('');
    setPublicLeagues([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black rounded-xl border border-gray-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Logo Pattern Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex gap-8">
                <Image
                  src="/Photos/Logos/UFC.png"
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'brightness(2) invert(1)',
                  }}
                />
                <Image
                  src="/Photos/Logos/Venom.png"
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'brightness(2) invert(1)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-800">
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Join a League</h2>
              <p className="text-sm text-gray-400 mt-1">Enter a code or browse public leagues</p>
            </div>
            <div className="flex gap-2 opacity-30">
              <Image
                src="/Photos/Logos/UFC.png"
                alt=""
                width={30}
                height={30}
                className="object-contain"
                style={{
                  filter: 'brightness(2) invert(1) sepia(1) saturate(2) hue-rotate(80deg)',
                }}
              />
              <Image
                src="/Photos/Logos/Venom.png"
                alt=""
                width={30}
                height={30}
                className="object-contain"
                style={{
                  filter: 'brightness(2) invert(1) sepia(1) saturate(2) hue-rotate(80deg)',
                }}
              />
            </div>
          </div>
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Join Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-900 rounded-lg border border-gray-800 mb-6">
            <button
              onClick={() => setJoinType('private')}
              className={`flex-1 py-2.5 px-4 rounded-md font-bold transition-all ${
                joinType === 'private'
                  ? 'bg-green-500 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>🔒</span>
                <span>Private League</span>
              </div>
            </button>
            <button
              onClick={() => setJoinType('public')}
              className={`flex-1 py-2.5 px-4 rounded-md font-bold transition-all ${
                joinType === 'public'
                  ? 'bg-green-500 text-black shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span>🌍</span>
                <span>Public League</span>
              </div>
            </button>
          </div>

          {/* Join Type Description */}
          <div className="rounded-lg p-3 bg-gray-900 border border-gray-800 mb-6">
            <p className="text-sm text-gray-400">
              {joinType === 'private' 
                ? '🔒 Enter the 6-character code shared by your league creator.'
                : '🌍 Browse and join public leagues for your selected event.'}
            </p>
          </div>

          {/* Private League Join */}
          {joinType === 'private' ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Enter Join Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full bg-gray-900 border-2 border-gray-800 rounded-lg px-6 py-6 text-green-400 text-center text-3xl font-bold tracking-[0.3em] placeholder-gray-600 focus:outline-none focus:border-green-500 focus:bg-gray-900/80 transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Ask your friend for their league's join code
                </p>
              </div>

            {error && (
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinPrivate}
                  className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-black rounded-lg font-bold transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !joinCode.trim()}
                >
                  {loading ? 'Joining...' : 'Join League'}
                </button>
              </div>
          </div>
        ) : (
          /* Public League Browse */
          <div className="space-y-4">
            {/* Event Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-green-500"
              >
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {new Date(event.date_utc).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Search Leagues
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && fetchPublicLeagues()}
                  placeholder="Search by name..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={fetchPublicLeagues}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* Public Leagues List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searching ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Searching leagues...</p>
                </div>
              ) : publicLeagues.length > 0 ? (
                publicLeagues.map(league => (
                  <div 
                    key={league.id}
                    className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{league.name}</h3>
                        {league.description && (
                          <p className="text-sm text-gray-400 mt-1">{league.description}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-gray-400">
                          {league.members?.length || 0}/{league.max_entries || '∞'} players
                        </p>
                        {league.entry_fee > 0 && (
                          <p className="text-sm text-green-400 mt-1">
                            Entry: ${league.entry_fee}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Created by {league.created_by?.slice(0, 8)}...</span>
                      </div>
                      <button
                        onClick={() => handleJoinPublic(league.id, league.name)}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No public leagues found</p>
                  <p className="text-sm text-gray-500 mt-2">Try searching or create your own!</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
} 