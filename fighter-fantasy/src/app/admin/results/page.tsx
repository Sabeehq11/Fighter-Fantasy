'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  validateFightResults,
  processFightResults 
} from '@/services/scoringEngine';
import { getEvents, getFightsByEvent } from '@/services/dataService';
import { getTeamsByEvent, updateTeamScores } from '@/services/fantasyService';
import { Event, Fight, FightResult, FantasyTeam } from '@/types';

export default function AdminResultsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [resultsJson, setResultsJson] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [preview, setPreview] = useState<FightResult[] | null>(null);

  useEffect(() => {
    // Check if user is admin (you might want to implement proper admin check)
    if (user && user.email !== 'admin@fighterfantasy.com') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await getEvents();
      setEvents(eventsData.filter((e: Event) => e.status === 'upcoming' || e.status === 'live'));
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResultsJson(e.target.value);
    setMessage(null);
    setPreview(null);
  };

  const validateAndPreview = () => {
    try {
      const results = JSON.parse(resultsJson);
      
      if (!validateFightResults(results)) {
        setMessage({ type: 'error', text: 'Invalid results format. Check the structure.' });
        return;
      }

      setPreview(results);
      setMessage({ type: 'success', text: 'Results validated successfully! Review and submit.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Invalid JSON format' });
    }
  };

  const processResults = async () => {
    if (!selectedEvent || !preview) return;

    setProcessing(true);
    setMessage(null);

    try {
      // Get all teams for this event
      const teams = await getTeamsByEvent(selectedEvent.id);
      
      // Get all fights for this event
      const fights = await getFightsByEvent(selectedEvent.id);
      
      // Get all fighters (you might need to implement this)
      const fighterIds = new Set<string>();
      fights.forEach((fight: Fight) => {
        fighterIds.add(fight.fighter_a_id);
        fighterIds.add(fight.fighter_b_id);
      });
      
      // Process the results and calculate scores
      const teamScores = await processFightResults(
        selectedEvent.id,
        preview,
        teams,
        Array.from(fighterIds).map(id => ({ id, name: '', division: 'Lightweight' } as any)), // Simplified for now
        selectedEvent
      );

      // Update team scores in database
      await updateTeamScores(teamScores);

      setMessage({ type: 'success', text: `Successfully processed results for ${teams.length} teams!` });
      setResultsJson('');
      setPreview(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: `Error processing results: ${error.message}` });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Admin - Fight Results Import</h1>

        {/* Event Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Select Event</label>
          <select
            value={selectedEvent?.id || ''}
            onChange={(e) => {
              const event = events.find(ev => ev.id === e.target.value);
              setSelectedEvent(event || null);
            }}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 outline-none"
          >
            <option value="">Select an event...</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.date_utc).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* JSON Input */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">
            Fight Results JSON
          </label>
          <div className="text-xs text-gray-400 mb-2">
            Expected format: Array of objects with fight_id, winner_id, loser_id, method, round
          </div>
          <textarea
            value={resultsJson}
            onChange={handleJsonChange}
            className="w-full h-64 p-4 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm focus:border-blue-500 outline-none"
            placeholder={`[
  {
    "fight_id": "fight_123",
    "winner_id": "fighter_456",
    "loser_id": "fighter_789",
    "method": "KO/TKO",
    "round": 2,
    "time_seconds": 145,
    "is_title_fight": false,
    "fighter_stats": {
      "fighter_456": {
        "significant_strikes": 45,
        "knockdowns": 1,
        "takedowns": 2,
        "control_time_seconds": 180,
        "submission_attempts": 0
      },
      "fighter_789": {
        "significant_strikes": 23,
        "knockdowns": 0,
        "takedowns": 0,
        "control_time_seconds": 60,
        "submission_attempts": 1
      }
    }
  }
]`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={validateAndPreview}
            disabled={!resultsJson || !selectedEvent}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            Validate & Preview
          </button>
          
          {preview && (
            <button
              onClick={processResults}
              disabled={processing}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-semibold transition-colors"
            >
              {processing ? 'Processing...' : 'Process Results'}
            </button>
          )}
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-4 rounded-lg mb-8 ${
            message.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
          }`}>
            {message.text}
          </div>
        )}

        {/* Preview Display */}
        {preview && (
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Results Preview</h2>
            <div className="space-y-4">
              {preview.map((result, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Fight:</span> {result.fight_id}
                    </div>
                    <div>
                      <span className="text-gray-400">Method:</span> {result.method}
                    </div>
                    <div>
                      <span className="text-gray-400">Winner:</span> {result.winner_id}
                    </div>
                    <div>
                      <span className="text-gray-400">Round:</span> {result.round}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-12 bg-gray-900 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Select the event for which you're importing results</li>
            <li>Paste the fight results JSON in the correct format</li>
            <li>Click "Validate & Preview" to check the data</li>
            <li>Review the preview to ensure accuracy</li>
            <li>Click "Process Results" to calculate fantasy scores</li>
            <li>The system will automatically update all team scores and rankings</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 