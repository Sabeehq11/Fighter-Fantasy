'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Event, 
  Fighter, 
  Fight, 
  League, 
  FighterSalary, 
  TeamPick,
  FantasyTeam 
} from '@/types';
import { getEvent, getFighters, getFightsByEvent } from '@/services/dataService';
import { 
  getLeague,
  getSalariesByEvent,
  generateSalariesForEvent,
  saveTeam,
  submitTeam,
  validateTeam,
  createGlobalLeague
} from '@/services/fantasyService';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';

interface FighterWithSalary extends Fighter {
  salary: number;
  fight?: Fight;
  opponent?: Fighter;
}

export default function TeamBuilder() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.eventId as string;

  // State
  const [event, setEvent] = useState<Event | null>(null);
  const [league, setLeague] = useState<League | null>(null);
  const [fighters, setFighters] = useState<FighterWithSalary[]>([]);
  const [fights, setFights] = useState<Fight[]>([]);
  const [selectedFighters, setSelectedFighters] = useState<TeamPick[]>([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('all');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [timeUntilLock, setTimeUntilLock] = useState<string>('');
  const [isLocked, setIsLocked] = useState(false);

  // Calculate budget
  const totalSalary = selectedFighters.reduce((sum, pick) => sum + pick.salary, 0);
  const remainingBudget = (league?.settings.budget || 10000) - totalSalary;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadEventData();
  }, [eventId, user]);

  const loadEventData = async () => {
    try {
      setLoading(true);

      // Load event
      const eventData = await getEvent(eventId);
      if (!eventData) {
        router.push('/fantasy');
        return;
      }
      setEvent(eventData);

      // Load or create league
      const leagueId = `league_global_${eventId}`;
      let leagueData = await getLeague(leagueId);
      
      if (!leagueData) {
        // Create global league if it doesn't exist (or use mock if no permission)
        leagueData = await createGlobalLeague(eventData);
        
        if (leagueData) {
          console.log('Using league:', leagueData.id);
        }
      }
      
      if (!leagueData) {
        console.error('Failed to load or create league');
        // Create a default league object to allow the UI to work
        leagueData = {
          id: leagueId,
          name: `${eventData.name} Global Championship`,
          type: 'global' as const,
          mode: 'weekly' as const,
          event_id: eventId,
          settings: {
            budget: 10000,
            team_size: 5,
            max_from_same_fight: 1,
            lock_time_minutes_before: 15,
            allow_captain: true,
            captain_multiplier: 1.5,
            apply_ppv_multiplier: eventData.type === 'PPV',
            ppv_multiplier: 1.5
          },
          scoring_system: 'standard' as const,
          total_entries: 0,
          max_entries: null,
          entry_fee: 0,
          prize_pool: 0,
          status: 'open' as const
        };
      }
      setLeague(leagueData);

      // Load fights
      const fightsData = await getFightsByEvent(eventId);
      setFights(fightsData);

      // Load fighters
      const allFighters = await getFighters();
      
      // Get fighters in this event
      const eventFighterIds = new Set<string>();
      fightsData.forEach(fight => {
        eventFighterIds.add(fight.fighter_a_id);
        eventFighterIds.add(fight.fighter_b_id);
      });

      // Load or generate salaries
      let salaries = await getSalariesByEvent(eventId);
      
      if (salaries.length === 0) {
        // Generate salaries if they don't exist
        const eventFighters = allFighters.filter(f => eventFighterIds.has(f.id));
        salaries = await generateSalariesForEvent(eventId, fightsData, eventFighters);
      }

      // Map salaries to fighters
      const salaryMap = new Map(salaries.map(s => [s.fighter_id, s.salary]));
      
      // Create fighter list with salaries
      const fightersWithSalary: FighterWithSalary[] = allFighters
        .filter(f => eventFighterIds.has(f.id))
        .map(fighter => {
          const fight = fightsData.find(
            f => f.fighter_a_id === fighter.id || f.fighter_b_id === fighter.id
          );
          const opponentId = fight?.fighter_a_id === fighter.id 
            ? fight.fighter_b_id 
            : fight?.fighter_a_id;
          const opponent = allFighters.find(f => f.id === opponentId);
          
          return {
            ...fighter,
            salary: salaryMap.get(fighter.id) || 2000,
            fight,
            opponent
          };
        })
        .sort((a, b) => b.salary - a.salary);

      setFighters(fightersWithSalary);
    } catch (error) {
      console.error('Error loading event data:', error);
      setErrors(['Failed to load event data']);
    } finally {
      setLoading(false);
    }
  };

  const toggleFighterSelection = useCallback((fighter: FighterWithSalary) => {
    if (isLocked) {
      setErrors(['Team builder is locked. No changes allowed.']);
      return;
    }

    setSelectedFighters(prev => {
      const isSelected = prev.some(p => p.fighter_id === fighter.id);
      
      if (isSelected) {
        // Remove fighter
        return prev.filter(p => p.fighter_id !== fighter.id);
      } else {
        // Check if we can add this fighter
        if (prev.length >= (league?.settings.team_size || 5)) {
          setErrors(['Team is full. Remove a fighter first.']);
          return prev;
        }

        // Check budget
        if (totalSalary + fighter.salary > (league?.settings.budget || 10000)) {
          setErrors(['Not enough budget for this fighter']);
          return prev;
        }

        // Check same fight restriction
        const opponentSelected = prev.some(p => p.fighter_id === fighter.opponent?.id);
        if (opponentSelected) {
          setErrors(['Cannot select both fighters from the same matchup']);
          return prev;
        }

        // Add fighter
        const newPick: TeamPick = {
          fighter_id: fighter.id,
          salary: fighter.salary,
          slot: prev.length + 1,
          is_captain: false
        };

        setErrors([]);
        return [...prev, newPick];
      }
    });
  }, [league, totalSalary, isLocked]);

  const toggleCaptain = useCallback((fighterId: string) => {
    if (!league?.settings.allow_captain) return;
    if (isLocked) {
      setErrors(['Team builder is locked. No changes allowed.']);
      return;
    }

    setSelectedFighters(prev => 
      prev.map(pick => ({
        ...pick,
        is_captain: pick.fighter_id === fighterId ? !pick.is_captain : false
      }))
    );
  }, [league, isLocked]);

  const handleSaveDraft = async () => {
    if (!user || !league || !event) return;

    if (isLocked) {
      setErrors(['Team builder is locked. No changes can be made.']);
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      const team: Partial<FantasyTeam> = {
        id: draftId || undefined,
        user_id: user.uid,
        league_id: league.id,
        event_id: eventId,
        mode: league.mode,
        event_date_utc: event.date_utc,
        name: teamName || `Team ${new Date().toLocaleDateString()}`,
        picks: selectedFighters,
        total_salary: totalSalary,
        remaining_budget: remainingBudget,
        status: 'draft'
      };

      const savedId = await saveTeam(team);
      if (savedId) {
        setDraftId(savedId);
        // Show success message
        setErrors([]);
      } else {
        setErrors(['Failed to save team']);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setErrors(['Failed to save draft']);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitTeam = async () => {
    if (!user || !league || !event) return;

    if (isLocked) {
      setErrors(['Team builder is locked. Submissions are closed.']);
      return;
    }

    // Validate team
    const validation = validateTeam(selectedFighters, league, fights);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    setErrors([]);

    try {
      // Save team first if not saved
      let teamId = draftId;
      if (!teamId) {
        const team: Partial<FantasyTeam> = {
          user_id: user.uid,
          league_id: league.id,
          event_id: eventId,
          mode: league.mode,
          event_date_utc: event.date_utc,
          name: teamName || `Team ${new Date().toLocaleDateString()}`,
          picks: selectedFighters,
          total_salary: totalSalary,
          remaining_budget: remainingBudget,
          status: 'draft'
        };

        teamId = await saveTeam(team);
      }

      if (teamId) {
        // Submit the team
        const success = await submitTeam(teamId);
        if (success) {
          router.push('/fantasy/my-teams');
        } else {
          setErrors(['Failed to submit team']);
        }
      }
    } catch (error) {
      console.error('Error submitting team:', error);
      setErrors(['Failed to submit team']);
    } finally {
      setSaving(false);
    }
  };

  // Filter fighters
  const filteredFighters = fighters.filter(fighter => {
    const matchesSearch = fighter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fighter.nickname?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = filterDivision === 'all' || fighter.division === filterDivision;
    return matchesSearch && matchesDivision;
  });

  // Get unique divisions
  const divisions = Array.from(new Set(fighters.map(f => f.division)));

  // Calculate lock time
  const lockTime = useMemo(() => {
    if (!event || !league) return null;
    const eventDate = new Date(event.date_utc);
    const lockMinutes = league.settings.lock_time_minutes_before || 15;
    return new Date(eventDate.getTime() - lockMinutes * 60 * 1000);
  }, [event, league]);

  // Check if team builder is locked
  useEffect(() => {
    if (!lockTime) return;

    const checkLockStatus = () => {
      const now = new Date();
      const locked = now >= lockTime;
      setIsLocked(locked);

      if (!locked) {
        // Calculate time remaining
        const secondsRemaining = differenceInSeconds(lockTime, now);
        if (secondsRemaining > 0) {
          const hours = Math.floor(secondsRemaining / 3600);
          const minutes = Math.floor((secondsRemaining % 3600) / 60);
          const seconds = secondsRemaining % 60;

          if (hours > 24) {
            const days = Math.floor(hours / 24);
            setTimeUntilLock(`${days}d ${hours % 24}h`);
          } else if (hours > 0) {
            setTimeUntilLock(`${hours}h ${minutes}m`);
          } else if (minutes > 0) {
            setTimeUntilLock(`${minutes}m ${seconds}s`);
          } else {
            setTimeUntilLock(`${seconds}s`);
          }
        }
      } else {
        setTimeUntilLock('LOCKED');
      }
    };

    // Check immediately
    checkLockStatus();

    // Update every second
    const interval = setInterval(checkLockStatus, 1000);
    return () => clearInterval(interval);
  }, [lockTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading team builder...</div>
      </div>
    );
  }

  if (!event || !league) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Event not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <p className="text-gray-400">
                {format(new Date(event.date_utc), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${isLocked ? 'text-red-500' : 'text-yellow-400'}`}>
                {isLocked ? (
                  <div>
                    <span className="text-lg">🔒 TEAM LOCKED</span>
                    <p className="text-xs text-gray-400">No changes allowed</p>
                  </div>
                ) : (
                  <div>
                    <span className="text-lg">⏱️ Lock in: {timeUntilLock}</span>
                    <p className="text-xs text-gray-400">Teams lock {league?.settings.lock_time_minutes_before || 15} min before event</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Name */}
          <div className="flex gap-4 items-center">
            <input
              type="text"
              placeholder="Enter team name..."
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
            />
            <div className="text-sm text-gray-400">
              {selectedFighters.length}/{league.settings.team_size} Fighters
            </div>
          </div>

          {/* Budget Bar */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Budget Used</span>
              <span className={`font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-green-400'}`}>
                ${remainingBudget.toFixed(0)} remaining
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  remainingBudget < 0 ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, (totalSalary / (league?.settings.budget || 10000)) * 100)}%` }}
              />
            </div>
          </div>

          {/* Lock Warning */}
          {isLocked && (
            <div className="mt-3 bg-red-900/50 border border-red-700 rounded-lg p-3">
              <p className="text-red-400 text-sm font-medium">
                ⚠️ Team builder is locked. The event has started or is about to start.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Fighter Selection */}
          <div className="lg:col-span-2">
            {/* Filters */}
            <div className="mb-6 flex gap-4">
              <input
                type="text"
                placeholder="Search fighters..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
              />
              <select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="all">All Divisions</option>
                {divisions.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            {/* Fighter List */}
            <div className="space-y-2">
              {filteredFighters.map(fighter => {
                const isSelected = selectedFighters.some(p => p.fighter_id === fighter.id);
                const isOpponentSelected = selectedFighters.some(p => p.fighter_id === fighter.opponent?.id);
                const canAfford = totalSalary + fighter.salary <= (league?.settings.budget || 10000);
                const isDisabled = !isSelected && (
                  isOpponentSelected || 
                  !canAfford || 
                  (selectedFighters.length >= (league?.settings.team_size || 5))
                );

                return (
                  <div
                    key={fighter.id}
                    onClick={() => !isDisabled && toggleFighterSelection(fighter)}
                    className={`
                      p-4 rounded-lg border transition-all cursor-pointer
                      ${isSelected 
                        ? 'bg-red-900/30 border-red-600' 
                        : isDisabled
                        ? 'bg-gray-900/50 border-gray-800 opacity-50 cursor-not-allowed'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-lg">{fighter.name}</h3>
                          {fighter.nickname && (
                            <span className="text-gray-400">"{fighter.nickname}"</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span>{fighter.division}</span>
                          <span>{fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws}</span>
                          {fighter.ranking && (
                            <span className="text-yellow-400">#{fighter.ranking}</span>
                          )}
                          {fighter.isChampion && (
                            <span className="text-yellow-400 font-bold">CHAMPION</span>
                          )}
                        </div>
                        {fighter.opponent && (
                          <div className="mt-2 text-sm text-gray-500">
                            vs. {fighter.opponent.name}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          ${fighter.salary.toLocaleString()}
                        </div>
                        {isOpponentSelected && (
                          <div className="text-xs text-red-400 mt-1">
                            Opponent selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-4">Your Team</h2>

              {/* Selected Fighters */}
              <div className="space-y-3 mb-6">
                {selectedFighters.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    Select fighters to build your team
                  </p>
                ) : (
                  selectedFighters.map(pick => {
                    const fighter = fighters.find(f => f.id === pick.fighter_id);
                    if (!fighter) return null;

                    return (
                      <div key={pick.fighter_id} className="bg-gray-800 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium">{fighter.name}</div>
                            <div className="text-xs text-gray-400">
                              {fighter.division} • {fighter.record.wins}-{fighter.record.losses}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${pick.salary.toLocaleString()}</div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFighterSelection(fighter);
                              }}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                        {league?.settings.allow_captain && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCaptain(pick.fighter_id);
                            }}
                            className={`
                              w-full py-1 px-2 rounded text-xs font-medium transition-colors
                              ${pick.is_captain 
                                ? 'bg-yellow-600 text-black' 
                                : 'bg-gray-700 hover:bg-gray-600'
                              }
                            `}
                          >
                            {pick.is_captain ? '⭐ Captain (1.5x)' : 'Set as Captain'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Budget Summary */}
              <div className="border-t border-gray-700 pt-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Budget Used</span>
                  <span>${totalSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Remaining</span>
                  <span className={remainingBudget < 0 ? 'text-red-400' : ''}>
                    ${remainingBudget.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total Budget</span>
                  <span>${league?.settings.budget.toLocaleString()}</span>
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-3 mb-4">
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-400">{error}</p>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={selectedFighters.length === 0 || saving || isLocked}
                  className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handleSubmitTeam}
                  disabled={
                    selectedFighters.length !== league?.settings.team_size || 
                    saving ||
                    remainingBudget < 0 ||
                    isLocked
                  }
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-800 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors"
                >
                  {saving ? 'Submitting...' : 'Submit Team'}
                </button>
              </div>

              {/* Info */}
              {league?.settings.apply_ppv_multiplier && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    🎯 PPV Event: All fighters get 1.5x points bonus!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 