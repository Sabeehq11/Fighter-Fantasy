'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Event, Fight, Fighter } from '@/types';
import { getEvent, getFightsByEvent, getFighters } from '@/services/dataService';
import { format } from 'date-fns';

interface FightWithFighters extends Fight {
  fighterA?: Fighter;
  fighterB?: Fighter;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [fights, setFights] = useState<FightWithFighters[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      
      // Load event
      const eventData = await getEvent(eventId);
      if (!eventData) {
        router.push('/events');
        return;
      }
      setEvent(eventData);

      // Load fights
      const fightsData = await getFightsByEvent(eventId);
      
      // Load all fighters
      const allFighters = await getFighters();
      const fighterMap = new Map(allFighters.map(f => [f.id, f]));

      // Map fighters to fights
      const fightsWithFighters: FightWithFighters[] = fightsData.map(fight => ({
        ...fight,
        fighterA: fighterMap.get(fight.fighter_a_id),
        fighterB: fighterMap.get(fight.fighter_b_id)
      }));

      // Sort fights by bout order
      fightsWithFighters.sort((a, b) => b.bout_order - a.bout_order);

      setFights(fightsWithFighters);
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading event details...</div>
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

  // Separate fights by card position
  // For events with proper fight IDs in arrays, use those
  // Otherwise, separate by bout order (main card typically has higher bout orders)
  let mainCard: FightWithFighters[] = [];
  let prelims: FightWithFighters[] = [];
  let earlyPrelims: FightWithFighters[] = [];
  
  if (event.main_card && event.main_card.length > 0) {
    mainCard = fights.filter(f => event.main_card.includes(f.id));
    prelims = fights.filter(f => event.prelims.includes(f.id));
    earlyPrelims = fights.filter(f => event.early_prelims.includes(f.id));
    
    // If no matches found, use all fights and separate by type
    if (mainCard.length === 0 && prelims.length === 0) {
      // Use naming convention or bout order to separate
      mainCard = fights.filter(f => 
        f.id.includes('_prelim_') === false && 
        f.id.includes('_early_') === false
      );
      prelims = fights.filter(f => 
        f.id.includes('_prelim_') && 
        f.id.includes('_early_') === false
      );
      earlyPrelims = fights.filter(f => f.id.includes('_early_'));
    }
  } else {
    // No fight arrays defined, show all fights as main card
    mainCard = fights;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-red-900/20 to-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
              <p className="text-xl text-gray-300">
                {format(new Date(event.date_utc), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-gray-400 mt-2">
                {event.venue.name} • {event.venue.city}, {event.venue.state || event.venue.country}
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                event.type === 'PPV' 
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/50' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {event.type}
              </span>
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                  event.status === 'upcoming' 
                    ? 'bg-green-600/20 text-green-400 border border-green-600/50'
                    : event.status === 'completed'
                    ? 'bg-gray-600/20 text-gray-400 border border-gray-600/50'
                    : 'bg-red-600/20 text-red-400 border border-red-600/50'
                }`}>
                  {event.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {event.status === 'upcoming' && (
            <div className="flex gap-4">
              <Link
                href={`/fantasy/team-builder/${event.id}`}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Build Fantasy Team
              </Link>
              <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                Set Reminder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Info */}
      <div className="bg-gray-900 border-y border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-gray-400">Main Card:</span>
              <span className="ml-2 text-white">
                {format(new Date(event.broadcast.main_card_time_utc), 'h:mm a')}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Prelims:</span>
              <span className="ml-2 text-white">
                {format(new Date(event.broadcast.prelims_time_utc), 'h:mm a')}
              </span>
            </div>
            {event.broadcast.early_prelims_time_utc && (
              <div>
                <span className="text-gray-400">Early Prelims:</span>
                <span className="ml-2 text-white">
                  {format(new Date(event.broadcast.early_prelims_time_utc), 'h:mm a')}
                </span>
              </div>
            )}
            <div className="ml-auto">
              <span className="text-gray-400">Watch on:</span>
              <span className="ml-2 text-white">
                {event.broadcast.networks.join(', ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fight Card */}
      <div className="container mx-auto px-4 py-8">
        {/* Main Card */}
        {mainCard.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-red-400">Main Card</h2>
            <div className="space-y-4">
              {mainCard.map((fight) => (
                <FightCard key={fight.id} fight={fight} />
              ))}
            </div>
          </section>
        )}

        {/* Prelims */}
        {prelims.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-300">Preliminary Card</h2>
            <div className="space-y-4">
              {prelims.map((fight) => (
                <FightCard key={fight.id} fight={fight} />
              ))}
            </div>
          </section>
        )}

        {/* Early Prelims */}
        {earlyPrelims.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-400">Early Prelims</h2>
            <div className="space-y-4">
              {earlyPrelims.map((fight) => (
                <FightCard key={fight.id} fight={fight} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function FightCard({ fight }: { fight: FightWithFighters }) {
  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover:border-gray-700 transition-colors">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          {fight.is_title_fight && (
            <span className="bg-yellow-600/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded border border-yellow-600/50">
              {fight.is_interim_title ? 'INTERIM TITLE' : 'TITLE FIGHT'}
            </span>
          )}
          {fight.is_main_event && (
            <span className="bg-red-600/20 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-600/50">
              MAIN EVENT
            </span>
          )}
          {fight.is_co_main && (
            <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-2 py-1 rounded border border-blue-600/50">
              CO-MAIN
            </span>
          )}
        </div>
        <div className="text-sm text-gray-400">
          {fight.scheduled_rounds} Rounds • {fight.weight_class}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Fighter A */}
        <div className="text-center md:text-right">
          {fight.fighterA ? (
            <Link href={`/fighters/${fight.fighterA.id}`} className="hover:text-red-400 transition-colors">
              <div className="font-bold text-lg">{fight.fighterA.name}</div>
              {fight.fighterA.nickname && (
                <div className="text-sm text-gray-400">"{fight.fighterA.nickname}"</div>
              )}
              <div className="text-sm text-gray-500 mt-1">
                {fight.fighterA.record.wins}-{fight.fighterA.record.losses}-{fight.fighterA.record.draws}
              </div>
              {fight.fighterA.ranking && (
                <div className="text-xs text-yellow-400 mt-1">#{fight.fighterA.ranking}</div>
              )}
            </Link>
          ) : (
            <div className="text-gray-500">Fighter TBA</div>
          )}
        </div>

        {/* VS */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-500">VS</div>
          {fight.odds && (
            <div className="text-xs text-gray-400 mt-2">
              <div>{fight.fighterA && `${fight.odds.fighter_a > 0 ? '+' : ''}${fight.odds.fighter_a}`}</div>
              <div>{fight.fighterB && `${fight.odds.fighter_b > 0 ? '+' : ''}${fight.odds.fighter_b}`}</div>
            </div>
          )}
        </div>

        {/* Fighter B */}
        <div className="text-center md:text-left">
          {fight.fighterB ? (
            <Link href={`/fighters/${fight.fighterB.id}`} className="hover:text-red-400 transition-colors">
              <div className="font-bold text-lg">{fight.fighterB.name}</div>
              {fight.fighterB.nickname && (
                <div className="text-sm text-gray-400">"{fight.fighterB.nickname}"</div>
              )}
              <div className="text-sm text-gray-500 mt-1">
                {fight.fighterB.record.wins}-{fight.fighterB.record.losses}-{fight.fighterB.record.draws}
              </div>
              {fight.fighterB.ranking && (
                <div className="text-xs text-yellow-400 mt-1">#{fight.fighterB.ranking}</div>
              )}
            </Link>
          ) : (
            <div className="text-gray-500">Fighter TBA</div>
          )}
        </div>
      </div>

      {/* Result (if completed) */}
      {fight.status === 'completed' && fight.result && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="text-center text-sm">
            <span className="text-gray-400">Winner: </span>
            <span className="text-green-400 font-bold">
              {fight.result.winner_id === fight.fighter_a_id ? fight.fighterA?.name : fight.fighterB?.name}
            </span>
            <span className="text-gray-400 ml-2">
              via {fight.result.method} • Round {fight.result.round}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 