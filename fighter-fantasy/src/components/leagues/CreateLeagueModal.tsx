'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Event } from '@/types';
import { createPrivateLeague, createPublicLeague } from '@/services/leagueService';
import { dataService } from '@/services/dataService';

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: (leagueId: string, joinCode?: string) => void;
}

export default function CreateLeagueModal({ 
  isOpen, 
  onClose, 
  userId,
  onSuccess 
}: CreateLeagueModalProps) {
  const [leagueType, setLeagueType] = useState<'private' | 'public'>('private');
  const [leagueName, setLeagueName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [maxEntries, setMaxEntries] = useState<number | ''>('');
  const [entryFee, setEntryFee] = useState<number>(0);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUpcomingEvents();
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leagueName.trim()) {
      setError('League name is required');
      return;
    }

    if (!selectedEventId) {
      setError('Please select an event');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const leagueData: any = {
        name: leagueName,
        entryFee: entryFee || 0
      };

      // Only add optional fields if they have values
      if (description && description.trim()) {
        leagueData.description = description;
      }
      if (maxEntries) {
        leagueData.maxEntries = Number(maxEntries);
      }

      if (leagueType === 'private') {
        const result = await createPrivateLeague(userId, selectedEventId, leagueData);
        if (result.success && result.leagueId) {
          onSuccess?.(result.leagueId, result.joinCode);
          handleClose();
        } else {
          setError(result.error || 'Failed to create league');
        }
      } else {
        const result = await createPublicLeague(userId, selectedEventId, leagueData);
        if (result.success && result.leagueId) {
          onSuccess?.(result.leagueId);
          handleClose();
        } else {
          setError(result.error || 'Failed to create league');
        }
      }
    } catch (error) {
      console.error('Error creating league:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLeagueName('');
    setDescription('');
    setMaxEntries('');
    setEntryFee(0);
    setError('');
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
      <div className="relative bg-black rounded-xl border border-gray-800 shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Logo Pattern Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8">
            {Array.from({ length: 20 }).map((_, i) => (
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
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Create New League</h2>
              <p className="text-sm text-gray-400 mt-1">Set up your competition</p>
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
        
        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* League Type Toggle */}
            <div className="relative">
              <div className="flex gap-2 p-1 bg-gray-900 rounded-lg border border-gray-800">
                <button
                  type="button"
                  onClick={() => setLeagueType('private')}
                  className={`flex-1 py-2.5 px-4 rounded-md font-bold transition-all ${
                    leagueType === 'private'
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
                  type="button"
                  onClick={() => setLeagueType('public')}
                  className={`flex-1 py-2.5 px-4 rounded-md font-bold transition-all ${
                    leagueType === 'public'
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
            </div>

            {/* League Type Description */}
            <div className="rounded-lg p-3 bg-gray-900 border border-gray-800">
              <p className="text-sm text-gray-400">
                {leagueType === 'private' 
                  ? '🔒 Create a private competition for your friends. You\'ll get a unique code to share.'
                  : '🌍 Create a public league that anyone can discover and join.'}
              </p>
            </div>

            {/* Event Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:bg-gray-800/70 transition-all"
                required
              >
                <option value="">Choose an event...</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} - {new Date(event.date_utc).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* League Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                League Name
              </label>
              <input
                type="text"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="e.g., Weekend Warriors"
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:bg-gray-800/70 transition-all"
                required
              />
            </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others about your league..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Max Entries */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Max Players (Optional)
            </label>
            <input
              type="number"
              value={maxEntries}
              onChange={(e) => setMaxEntries(e.target.value ? Number(e.target.value) : '')}
              placeholder="Leave empty for unlimited"
              min="2"
              max="100"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Entry Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Entry Fee (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                placeholder="0"
                min="0"
                step="1"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">For friendly competition only</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-black rounded-lg font-bold transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create League'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 