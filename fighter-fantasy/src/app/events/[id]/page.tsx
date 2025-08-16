'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Event, Fight, Fighter } from '@/types';
import { getEvent, getFightsByEvent, getFighters } from '@/services/dataService';
import { format } from 'date-fns';

// Extended interface to handle both scraped data (with names) and proper data (with IDs)
interface FightWithFighters extends Fight {
  fighterA?: Fighter;
  fighterB?: Fighter;
  // Fields from scraped data
  fighter_a_name?: string;
  fighter_b_name?: string;
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
      
      // Filter out corrupted/bad data first
      const badPatterns = [
        'round', 'time', 'method', 'prelims', 'early', 'main card',
        'previous', 'canelo', 'crawford', 'september', 'august', 'chicago',
        'on august', 'in chicago', 'on august', 'in chicago', '\n'
      ];
      
      const validFights = fightsData.filter((fight: any) => {
        const fighterA = (fight.fighter_a_name || '').toLowerCase();
        const fighterB = (fight.fighter_b_name || '').toLowerCase();
        
        // Check if fighter names contain bad patterns
        const hasBadData = badPatterns.some(pattern => 
          fighterA.includes(pattern) || fighterB.includes(pattern)
        );
        
        // Also check if fighter names are missing or too short
        const hasValidNames = 
          fight.fighter_a_name && fight.fighter_b_name &&
          fight.fighter_a_name.length > 2 && fight.fighter_b_name.length > 2;
        
        return !hasBadData && hasValidNames;
      });
      
      console.log(`Filtered fights: ${fightsData.length} -> ${validFights.length} valid fights`);
      
      // Load all fighters to try matching by name or ID
      const allFighters = await getFighters();
      const fighterMapById = new Map(allFighters.map(f => [f.id, f]));
      const fighterMapByName = new Map(allFighters.map(f => [f.name.toLowerCase(), f]));

      // Map fighters to fights first, handling both ID-based and name-based data
      const fightsWithFighterData: FightWithFighters[] = validFights.map((fight: any) => {
        let fighterA: Fighter | undefined;
        let fighterB: Fighter | undefined;
        
        // Try to find fighters by ID first
        if (fight.fighter_a_id) {
          fighterA = fighterMapById.get(fight.fighter_a_id);
        }
        if (fight.fighter_b_id) {
          fighterB = fighterMapById.get(fight.fighter_b_id);
        }
        
        // If not found by ID, try by name (from scraped data)
        if (!fighterA && fight.fighter_a_name) {
          fighterA = fighterMapByName.get(fight.fighter_a_name.toLowerCase());
        }
        if (!fighterB && fight.fighter_b_name) {
          fighterB = fighterMapByName.get(fight.fighter_b_name.toLowerCase());
        }
        
        return {
          ...fight,
          fighterA,
          fighterB,
          // Keep the names from scraped data as fallback
          fighter_a_name: fight.fighter_a_name,
          fighter_b_name: fight.fighter_b_name
        };
      });

      // Now deduplicate based on actual fighter names
      const uniqueFights = new Map<string, FightWithFighters>();
      
      fightsWithFighterData.forEach((fight) => {
        // Get fighter names - either from Fighter objects or from scraped names
        const fighterAName = (fight.fighterA?.name || fight.fighter_a_name || '').toLowerCase().trim().replace(/\s+/g, ' ');
        const fighterBName = (fight.fighterB?.name || fight.fighter_b_name || '').toLowerCase().trim().replace(/\s+/g, ' ');
        
        // Skip if no fighter names
        if (!fighterAName || !fighterBName) {
          console.log('Skipping fight with missing names:', fight.id);
          return;
        }
        
        // Create unique key with sorted fighter names
        const fighterNames = [fighterAName, fighterBName].sort();
        const fightKey = fighterNames.join('_vs_');
        
        // Only keep the first occurrence or the one with better data
        if (!uniqueFights.has(fightKey)) {
          uniqueFights.set(fightKey, fight);
        } else {
          const existing = uniqueFights.get(fightKey)!;
          // Keep the one with higher bout order or main event status
          const existingScore = (existing.is_main_event ? 1000 : 0) + (existing.bout_order || 0) * 10 + (existing.is_title_fight ? 100 : 0);
          const currentScore = (fight.is_main_event ? 1000 : 0) + (fight.bout_order || 0) * 10 + (fight.is_title_fight ? 100 : 0);
          
          if (currentScore > existingScore) {
            uniqueFights.set(fightKey, fight);
          }
        }
      });
      
      const fightsWithFighters = Array.from(uniqueFights.values());
      console.log(`Deduplication: ${fightsWithFighterData.length} fights -> ${fightsWithFighters.length} unique fights`);

      // Sort fights by bout order
      fightsWithFighters.sort((a, b) => (b.bout_order || 0) - (a.bout_order || 0));

      setFights(fightsWithFighters);
    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <div className="text-white text-xl mt-4">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">Event not found</div>
          <Link href="/events" className="text-green-500 hover:text-green-400 underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  // Separate fights by card position
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Navigation */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/events" className="inline-flex items-center text-green-500 hover:text-green-400 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 py-12 relative">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {event.name}
                </h1>
                <div className="space-y-3">
                  <p className="text-xl text-gray-300 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {format(new Date(event.date_utc), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-400 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.venue.name} • {event.venue.city}, {event.venue.state || event.venue.country}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-2">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    event.type === 'PPV' 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30' 
                      : 'bg-gray-800/50 text-gray-300 border border-gray-700'
                  }`}>
                    {event.type === 'PPV' ? '💰 PAY-PER-VIEW' : event.type}
                  </span>
                  <span className={`inline-block px-3 py-2 rounded-full text-xs font-medium ${
                    event.status === 'upcoming' 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : event.status === 'completed'
                      ? 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                      : 'bg-red-600/20 text-red-400 border border-red-600/30'
                  }`}>
                    {event.status === 'upcoming' ? '🔴 LIVE SOON' : event.status.toUpperCase()}
                  </span>
                </div>
                
                {/* Action Buttons */}
                {event.status === 'upcoming' && (
                  <div className="flex gap-3 mt-4">
                    <Link
                      href={`/fantasy/team-builder/${event.id}`}
                      className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                      🎮 Build Fantasy Team
                    </Link>
                    <button className="bg-gray-800/70 backdrop-blur hover:bg-gray-700/70 text-white font-medium py-3 px-6 rounded-lg transition-all border border-gray-700">
                      🔔 Set Reminder
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Info */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800/50 to-gray-900 border-y border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap gap-8 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🥊 Main Card:</span>
                <span className="text-white font-semibold">
                  {format(new Date(event.broadcast.main_card_time_utc), 'h:mm a')} ET
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">🎯 Prelims:</span>
                <span className="text-white font-semibold">
                  {format(new Date(event.broadcast.prelims_time_utc), 'h:mm a')} ET
                </span>
              </div>
              {event.broadcast.early_prelims_time_utc && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">⏰ Early Prelims:</span>
                  <span className="text-white font-semibold">
                    {format(new Date(event.broadcast.early_prelims_time_utc), 'h:mm a')} ET
                  </span>
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <span className="text-gray-400">📺 Watch on:</span>
                <div className="flex gap-2">
                  {event.broadcast.networks.map((network, idx) => (
                    <span key={idx} className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-medium">
                      {network}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fight Card */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Main Card */}
          {mainCard.length > 0 && (
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-8 flex items-center">
                <span className="bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">Main Card</span>
                <span className="ml-3 text-sm text-gray-500 font-normal">({mainCard.length} Fights)</span>
              </h2>
              <div className="space-y-4">
                {mainCard.map((fight, index) => (
                  <FightCard key={fight.id} fight={fight} isMainCard={true} fightNumber={mainCard.length - index} />
                ))}
              </div>
            </section>
          )}

          {/* Prelims */}
          {prelims.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-gray-300">Preliminary Card</h2>
              <div className="space-y-4">
                {prelims.map((fight) => (
                  <FightCard key={fight.id} fight={fight} isMainCard={false} />
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
                  <FightCard key={fight.id} fight={fight} isMainCard={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function FightCard({ fight, isMainCard, fightNumber }: { fight: FightWithFighters, isMainCard: boolean, fightNumber?: number }) {
  // Get fighter names - either from Fighter objects or from scraped names
  const fighterAName = fight.fighterA?.name || fight.fighter_a_name || 'Fighter TBA';
  const fighterBName = fight.fighterB?.name || fight.fighter_b_name || 'Fighter TBA';
  
  return (
    <div className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.01] ${
      isMainCard 
        ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 hover:border-green-500/50 shadow-xl' 
        : 'bg-gray-900/50 border border-gray-800 hover:border-gray-700'
    }`}>
      {/* Fight Number Badge for Main Card */}
      {isMainCard && fightNumber && (
        <div className="absolute top-4 left-4 bg-green-500/20 text-green-400 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border border-green-500/30">
          {fightNumber}
        </div>
      )}
      
      <div className="p-6">
        {/* Fight Tags */}
        <div className="flex items-center gap-2 mb-4">
          {fight.is_title_fight && (
            <span className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/30">
              🏆 {fight.is_interim_title ? 'INTERIM TITLE' : 'CHAMPIONSHIP'}
            </span>
          )}
          {fight.is_main_event && (
            <span className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full border border-green-500/30">
              ⭐ MAIN EVENT
            </span>
          )}
          {fight.is_co_main && (
            <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
              CO-MAIN EVENT
            </span>
          )}
          <div className="ml-auto text-sm text-gray-400">
            {fight.scheduled_rounds} Rounds • {fight.weight_class}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Fighter A */}
          <div className="text-center lg:text-right">
            {fight.fighterA ? (
              <Link href={`/fighters/${fight.fighterA.id}`} className="group">
                <div className="transition-all duration-200 group-hover:text-green-400">
                  <div className="font-bold text-xl lg:text-2xl mb-1">{fighterAName}</div>
                  {fight.fighterA.nickname && (
                    <div className="text-sm text-gray-400 italic mb-2">"{fight.fighterA.nickname}"</div>
                  )}
                  <div className="flex items-center justify-center lg:justify-end gap-3">
                    <span className="text-sm text-gray-500">
                      {fight.fighterA.record.wins}-{fight.fighterA.record.losses}-{fight.fighterA.record.draws}
                    </span>
                    {fight.fighterA.ranking && (
                      <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                        #{fight.fighterA.ranking}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div>
                <div className="font-bold text-xl lg:text-2xl mb-2">{fighterAName}</div>
                <div className="text-sm text-gray-500">Record unavailable</div>
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center py-4 lg:py-0">
            <div className="relative">
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 bg-clip-text text-transparent">
                VS
              </div>
              {fight.odds && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs text-green-400">
                    {fight.odds.fighter_a > 0 ? '+' : ''}{fight.odds.fighter_a}
                  </div>
                  <div className="text-xs text-gray-400">vs</div>
                  <div className="text-xs text-green-400">
                    {fight.odds.fighter_b > 0 ? '+' : ''}{fight.odds.fighter_b}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fighter B */}
          <div className="text-center lg:text-left">
            {fight.fighterB ? (
              <Link href={`/fighters/${fight.fighterB.id}`} className="group">
                <div className="transition-all duration-200 group-hover:text-green-400">
                  <div className="font-bold text-xl lg:text-2xl mb-1">{fighterBName}</div>
                  {fight.fighterB.nickname && (
                    <div className="text-sm text-gray-400 italic mb-2">"{fight.fighterB.nickname}"</div>
                  )}
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <span className="text-sm text-gray-500">
                      {fight.fighterB.record.wins}-{fight.fighterB.record.losses}-{fight.fighterB.record.draws}
                    </span>
                    {fight.fighterB.ranking && (
                      <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded">
                        #{fight.fighterB.ranking}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ) : (
              <div>
                <div className="font-bold text-xl lg:text-2xl mb-2">{fighterBName}</div>
                <div className="text-sm text-gray-500">Record unavailable</div>
              </div>
            )}
          </div>
        </div>

        {/* Result (if completed) */}
        {fight.status === 'completed' && fight.result && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <span className="text-gray-400">Winner: </span>
              <span className="text-green-400 font-bold text-lg">
                {fight.result.winner_id === fight.fighter_a_id 
                  ? fighterAName 
                  : fighterBName}
              </span>
              <span className="text-gray-400 ml-3">
                via {fight.result.method} • Round {fight.result.round}
              </span>
              {fight.result.fight_of_the_night && (
                <span className="ml-3 bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded">
                  🔥 FOTN
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 