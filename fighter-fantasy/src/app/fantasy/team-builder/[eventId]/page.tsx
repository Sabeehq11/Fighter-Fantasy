'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  createGlobalLeague,
  getTeam
} from '@/services/fantasyService';
import { format, differenceInMinutes, differenceInSeconds } from 'date-fns';
import Link from 'next/link';

interface FighterWithSalary extends Fighter {
  salary: number;
  fight?: Fight;
  opponent?: FighterWithSalary;  // Changed from Fighter to FighterWithSalary
}

// Add interface for fights with scraped data
interface FightWithScrapedData extends Fight {
  fighter_a_name?: string;
  fighter_b_name?: string;
  fighter_a_record?: string;
  fighter_b_record?: string;
  division?: string;
  is_championship?: boolean;
}

// Add success message state type
interface SuccessMessage {
  type: 'save' | 'submit';
  message: string;
}

import PredictionBuilder from './PredictionBuilder';

export default function TeamBuilder() {
  const [renderPrediction, setRenderPrediction] = useState<boolean>(true);

  // Temporary: render new prediction builder on top of legacy UI to preserve navigation and flow
  // We will eventually remove the legacy salary-cap UI

  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const eventId = params.eventId as string;
  
  // Check for draft ID in URL params
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

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
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);
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

      // Check for draft ID in URL
      const urlDraftId = searchParams.get('draft');

      // Load event
      const eventData = await getEvent(eventId);
      if (!eventData) {
        router.push('/fantasy');
        return;
      }
      setEvent(eventData);

      // Early render guard: if prediction mode, skip legacy salary-cap fetches
      // For now we still compute legacy leagueData below to avoid breaking downstream rendering

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
      
      // Filter out corrupted/bad data first
      const badPatterns = [
        'round', 'time', 'method', 'prelims', 'early', 'main card',
        'previous', 'canelo', 'crawford', 'september', 'august', 'chicago',
        'on august', 'in chicago', '\n'
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
      
      // Deduplicate the valid fights
      const uniqueFights = new Map<string, any>();
      
      validFights.forEach((fight: any) => {
        // Create unique key with sorted fighter names
        const fighterAName = (fight.fighter_a_name || '').toLowerCase().trim().replace(/\s+/g, ' ');
        const fighterBName = (fight.fighter_b_name || '').toLowerCase().trim().replace(/\s+/g, ' ');
        
        const fighterNames = [fighterAName, fighterBName].sort();
        const fightKey = fighterNames.join('_vs_');
        
        // Only keep the first occurrence or the one with better data
        if (!uniqueFights.has(fightKey)) {
          uniqueFights.set(fightKey, fight);
        } else {
          const existing = uniqueFights.get(fightKey);
          // Keep the one with higher bout order or main event status
          const existingScore = 
            (existing.is_main_event ? 1000 : 0) + 
            (existing.bout_order || 0) * 10 + 
            (existing.is_title_fight ? 100 : 0);
          const currentScore = 
            (fight.is_main_event ? 1000 : 0) + 
            (fight.bout_order || 0) * 10 + 
            (fight.is_title_fight ? 100 : 0);
          
          if (currentScore > existingScore) {
            uniqueFights.set(fightKey, fight);
          }
        }
      });
      
      const deduplicatedFights = Array.from(uniqueFights.values());
      console.log(`Deduplication: ${validFights.length} -> ${deduplicatedFights.length} unique fights`);
      setFights(deduplicatedFights);

      // Extract fighters from fights
      const fightersMap = new Map<string, FighterWithSalary>();
      
      deduplicatedFights.forEach((fight: any) => {
        // Extract fighter A
        if (fight.fighter_a_name) {
          const fighterId = fight.fighter_a_id || `temp_${fight.fighter_a_name.toLowerCase().replace(/\s+/g, '_')}`;
          if (!fightersMap.has(fighterId)) {
            fightersMap.set(fighterId, {
              id: fighterId,
              name: fight.fighter_a_name,
              nickname: '',
              division: fight.division || fight.weight_class || 'Welterweight',
              nationality: '',
              height_inches: 70,
              reach_inches: 70,
              weight_lbs: 170,
              stance: 'Orthodox',
              record: {
                wins: 0,
                losses: 0,
                draws: 0,
                no_contests: 0
              },
              finishes: {
                ko_tko: 0,
                submissions: 0,
                decisions: 0
              },
              stats: {
                sig_strikes_per_min: 0,
                sig_strike_accuracy: 0,
                sig_strikes_absorbed_per_min: 0,
                sig_strike_defense: 0,
                takedown_avg: 0,
                takedown_accuracy: 0,
                takedown_defense: 0,
                sub_attempts_per_15: 0
              },
              isActive: true,
              isChampion: fight.is_championship || fight.is_title_fight || false,
              ranking: undefined,
              age: 30,
              date_of_birth: '1994-01-01',
              hometown: '',
              profile_image_url: '',
              salary: 0, // Will be set later
              fight,
              opponent: undefined // Will be set later
            });
          }
        }
        
        // Extract fighter B
        if (fight.fighter_b_name) {
          const fighterId = fight.fighter_b_id || `temp_${fight.fighter_b_name.toLowerCase().replace(/\s+/g, '_')}`;
          if (!fightersMap.has(fighterId)) {
            fightersMap.set(fighterId, {
              id: fighterId,
              name: fight.fighter_b_name,
              nickname: '',
              division: fight.division || fight.weight_class || 'Welterweight',
              nationality: '',
              height_inches: 70,
              reach_inches: 70,
              weight_lbs: 170,
              stance: 'Orthodox',
              record: {
                wins: 0,
                losses: 0,
                draws: 0,
                no_contests: 0
              },
              finishes: {
                ko_tko: 0,
                submissions: 0,
                decisions: 0
              },
              stats: {
                sig_strikes_per_min: 0,
                sig_strike_accuracy: 0,
                sig_strikes_absorbed_per_min: 0,
                sig_strike_defense: 0,
                takedown_avg: 0,
                takedown_accuracy: 0,
                takedown_defense: 0,
                sub_attempts_per_15: 0
              },
              isActive: true,
              isChampion: fight.is_championship || fight.is_title_fight || false,
              ranking: undefined,
              age: 30,
              date_of_birth: '1994-01-01',
              hometown: '',
              profile_image_url: '',
              salary: 0, // Will be set later
              fight,
              opponent: undefined // Will be set later
            });
          }
        }
      });

      // Set opponents for each fighter
      deduplicatedFights.forEach((fight: any) => {
        const fighterAId = fight.fighter_a_id || `temp_${fight.fighter_a_name?.toLowerCase().replace(/\s+/g, '_')}`;
        const fighterBId = fight.fighter_b_id || `temp_${fight.fighter_b_name?.toLowerCase().replace(/\s+/g, '_')}`;
        
        const fighterA = fightersMap.get(fighterAId);
        const fighterB = fightersMap.get(fighterBId);
        
        if (fighterA && fighterB) {
          fighterA.opponent = fighterB as FighterWithSalary;
          fighterB.opponent = fighterA as FighterWithSalary;
        }
      });

      // Load or generate salaries
      let salaries = await getSalariesByEvent(eventId);
      
      if (salaries.length === 0) {
        // Generate basic salaries based on fight position
        const fightersList = Array.from(fightersMap.values());
        salaries = fightersList.map((fighter, index) => {
          let baseSalary = 3000; // Minimum base salary
          
          // Adjust salary based on fight position
          const fight: any = fighter.fight;
          if (fight) {
            if (fight.is_main_event) {
              baseSalary = 9000;
            } else if (fight.is_championship || fight.is_title_fight) {
              baseSalary = 8500;
            } else if (fight.bout_order && fight.bout_order >= 10) {
              baseSalary = 7000;
            } else if (fight.bout_order && fight.bout_order >= 5) {
              baseSalary = 5000;
            } else {
              baseSalary = 3500;
            }
          }
          
          // Add some variation (±500)
          const variation = Math.floor(Math.random() * 1000) - 500;
          const finalSalary = Math.max(1500, baseSalary + variation); // Ensure minimum of $1500
          
          return {
            id: `salary_${eventId}_${fighter.id}`,
            fighter_id: fighter.id,
            event_id: eventId,
            salary: finalSalary
          } as FighterSalary;
        });
      }

      // Map salaries to fighters
      const salaryMap = new Map(salaries.map(s => [s.fighter_id, s.salary]));
      
      // Update fighters with salaries
      const fightersWithSalary: FighterWithSalary[] = Array.from(fightersMap.values())
        .map(fighter => ({
          ...fighter,
          salary: salaryMap.get(fighter.id) || 3000 // Default to $3000 if no salary found
        }))
        .sort((a, b) => {
          // Sort by bout order (main event first)
          const boutOrderA = a.fight?.bout_order || 0;
          const boutOrderB = b.fight?.bout_order || 0;
          if (boutOrderB !== boutOrderA) {
            return boutOrderB - boutOrderA;
          }
          // If same bout order, sort by salary
          return b.salary - a.salary;
        });

      setFighters(fightersWithSalary);

      // Load existing draft if ID provided in URL
      if (urlDraftId && user) {
        const draftTeam = await getTeam(urlDraftId);
        if (draftTeam && draftTeam.user_id === user.uid && draftTeam.event_id === eventId) {
          // Load the draft team data
          setTeamName(draftTeam.name);
          setSelectedFighters(draftTeam.picks);
          setDraftId(draftTeam.id);
          setSuccessMessage({
            type: 'save',
            message: '📝 Draft loaded successfully. Continue editing your team.'
          });
          setTimeout(() => setSuccessMessage(null), 3000);
        }
      }
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
    setSuccessMessage(null);

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
        setSuccessMessage({
          type: 'save',
          message: '✅ Draft saved successfully! You can find it in "My Teams" or continue editing.'
        });
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
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
    setSuccessMessage(null);

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
          setSuccessMessage({
            type: 'submit',
            message: '🎉 Team submitted successfully! Redirecting to My Teams...'
          });
          // Redirect after showing success message
          setTimeout(() => {
            router.push('/fantasy/my-teams');
          }, 2000);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/fantasy" className="hover:text-green-500 transition-colors">Fantasy</Link>
            <span>/</span>
            <Link href="/fantasy/my-teams" className="hover:text-green-500 transition-colors">My Teams</Link>
            <span>/</span>
            <span className="text-white">Team Builder</span>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-1">
                {event.name}
              </h1>
              <p className="text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {format(new Date(event.date_utc), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                isLocked 
                  ? 'bg-red-900/30 border border-red-700' 
                  : 'bg-yellow-900/30 border border-yellow-700'
              }`}>
                {isLocked ? (
                  <>
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <div>
                      <span className="text-red-400 font-medium">LOCKED</span>
                      <p className="text-xs text-gray-400">No changes allowed</p>
                    </div>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span className="text-yellow-400 font-medium">Lock in: {timeUntilLock}</span>
                      <p className="text-xs text-gray-400">Teams lock {league?.settings.lock_time_minutes_before || 15}m before</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Team Name and Budget */}
          <div className="mt-4 grid lg:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Enter team name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 focus:bg-gray-800/70 transition-all"
              />
            </div>
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-lg p-3 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Budget</span>
                <span className={`font-bold text-lg ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ${remainingBudget.toLocaleString()} left
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    remainingBudget < 0 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : 'bg-gradient-to-r from-green-500 to-green-600'
                  }`}
                  style={{ width: `${Math.min(100, (totalSalary / (league?.settings.budget || 10000)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="mb-4 bg-red-900/20 border border-red-600/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                {errors.map((error, i) => (
                  <p key={i} className="text-sm text-red-400 mb-1">{error}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {successMessage && (
          <div className={`mb-4 rounded-lg p-4 ${
            successMessage.type === 'submit' 
              ? 'bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-600/50' 
              : 'bg-blue-900/20 border border-blue-600/50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`${successMessage.type === 'submit' ? 'text-green-400' : 'text-blue-400'}`}>
                {successMessage.type === 'submit' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                  </svg>
                )}
              </div>
              <p className={`text-sm font-medium ${
                successMessage.type === 'submit' ? 'text-green-400' : 'text-blue-400'
              }`}>
                {successMessage.message}
              </p>
            </div>
          </div>
        )}

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

            {/* Fighter List Header */}
            <div className="mb-4 bg-gray-900 rounded-lg p-3 border border-gray-800">
              <h2 className="text-lg font-bold text-white mb-2">Available Fighters</h2>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{filteredFighters.length} fighters on this card</span>
                <span>Click a fighter to add/remove from team</span>
              </div>
            </div>

            {/* Fighter List */}
            <div className="space-y-4">
              {filteredFighters.length === 0 ? (
                <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
                  <p className="text-gray-400">No fighters found matching your filters</p>
                </div>
              ) : (
                // Group fighters by fight and display as matchups
                (() => {
                  const displayedFights = new Set<string>();
                  const matchups: React.ReactElement[] = [];
                  
                  filteredFighters.forEach(fighter => {
                    // Skip if we've already displayed this fight
                    if (fighter.fight && displayedFights.has(fighter.fight.id)) return;
                    
                    const opponent = fighter.opponent;
                    if (!opponent) return;
                    
                    // Mark this fight as displayed
                    if (fighter.fight) displayedFights.add(fighter.fight.id);
                    
                    const fighterASelected = selectedFighters.some(p => p.fighter_id === fighter.id);
                    const fighterBSelected = selectedFighters.some(p => p.fighter_id === opponent.id);
                    const teamFull = selectedFighters.length >= (league?.settings.team_size || 5);
                    const canAffordFighterA = remainingBudget >= fighter.salary || fighterASelected;
                    const canAffordFighterB = remainingBudget >= opponent.salary || fighterBSelected;
                    
                    matchups.push(
                      <div key={fighter.fight?.id || fighter.id} className="bg-gradient-to-r from-gray-900 to-gray-900/95 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
                        {/* Fight Header */}
                        <div className="bg-black/40 px-4 py-3 border-b border-gray-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {fighter.fight?.is_main_event && (
                                <span className="bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 text-yellow-400 text-xs px-3 py-1 rounded-full font-bold border border-yellow-500/30">
                                  ⭐ MAIN EVENT
                                </span>
                              )}
                              {fighter.fight?.is_title_fight && (
                                <span className="bg-gradient-to-r from-purple-500/30 to-purple-600/30 text-purple-400 text-xs px-3 py-1 rounded-full font-bold border border-purple-500/30">
                                  🏆 CHAMPIONSHIP
                                </span>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500">{fighter.fight?.scheduled_rounds || 3} Rounds</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-400">{fighter.division || 'TBD'}</span>
                              </div>
                            </div>
                            {(fighterASelected || fighterBSelected) && (
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-green-400 text-sm font-medium">Fighter Selected</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Matchup */}
                        <div className="p-4">
                          <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                            {/* Fighter A */}
                            <button
                              onClick={() => !isLocked && !fighterBSelected && (fighterASelected || (!teamFull && canAffordFighterA)) && toggleFighterSelection(fighter)}
                              disabled={isLocked || fighterBSelected || (!fighterASelected && (teamFull || !canAffordFighterA))}
                              className={`
                                relative p-4 rounded-lg border-2 transition-all transform hover:scale-[1.02]
                                ${fighterASelected 
                                  ? 'bg-gradient-to-r from-green-900/40 to-green-800/40 border-green-500 shadow-lg shadow-green-500/20' 
                                  : fighterBSelected
                                  ? 'bg-gray-800/30 border-gray-700 opacity-40 cursor-not-allowed'
                                  : teamFull || !canAffordFighterA
                                  ? 'bg-gray-800/30 border-gray-700 opacity-40 cursor-not-allowed'
                                  : 'bg-gray-800/50 border-gray-700 hover:border-red-500/50 hover:bg-gray-800/70 cursor-pointer hover:shadow-md'
                                }
                              `}
                            >
                              {fighterASelected && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <div className="text-left">
                                <div className="font-bold text-white text-lg mb-1">{fighter.name}</div>
                                <div className="text-xs text-gray-500 mb-3">
                                  {typeof fighter.record === 'string' ? fighter.record : `${fighter.record.wins}-${fighter.record.losses}-${fighter.record.draws}`}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-2xl font-bold ${fighterASelected ? 'text-green-400' : 'text-green-500'}`}>
                                    ${fighter.salary.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </button>

                            {/* VS Divider */}
                            <div className="flex flex-col items-center justify-center px-4">
                              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg">
                                VS
                              </div>
                            </div>

                            {/* Fighter B */}
                            <button
                              onClick={() => !isLocked && !fighterASelected && (fighterBSelected || (!teamFull && canAffordFighterB)) && toggleFighterSelection(opponent)}
                              disabled={isLocked || fighterASelected || (!fighterBSelected && (teamFull || !canAffordFighterB))}
                              className={`
                                relative p-4 rounded-lg border-2 transition-all transform hover:scale-[1.02]
                                ${fighterBSelected 
                                  ? 'bg-gradient-to-r from-green-900/40 to-green-800/40 border-green-500 shadow-lg shadow-green-500/20' 
                                  : fighterASelected
                                  ? 'bg-gray-800/30 border-gray-700 opacity-40 cursor-not-allowed'
                                  : teamFull || !canAffordFighterB
                                  ? 'bg-gray-800/30 border-gray-700 opacity-40 cursor-not-allowed'
                                  : 'bg-gray-800/50 border-gray-700 hover:border-red-500/50 hover:bg-gray-800/70 cursor-pointer hover:shadow-md'
                                }
                              `}
                            >
                              {fighterBSelected && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <div className="text-left">
                                <div className="font-bold text-white text-lg mb-1">{opponent.name}</div>
                                <div className="text-xs text-gray-500 mb-3">
                                  {typeof opponent.record === 'string' ? opponent.record : `${opponent.record.wins}-${opponent.record.losses}-${opponent.record.draws}`}
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className={`text-2xl font-bold ${fighterBSelected ? 'text-green-400' : 'text-green-500'}`}>
                                    ${opponent.salary.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                        
                        {/* Selection Status Bar */}
                        {!fighterASelected && !fighterBSelected && (
                          <div className="bg-black/20 px-4 py-2 border-t border-gray-800">
                            {teamFull ? (
                              <div className="text-center text-xs text-yellow-400 flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Team is full - Remove a fighter to add new ones
                              </div>
                            ) : !canAffordFighterA && !canAffordFighterB ? (
                              <div className="text-center text-xs text-red-400 flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Insufficient budget for either fighter
                              </div>
                            ) : (
                              <div className="text-center text-xs text-gray-500">
                                Click a fighter to add to your team
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                  
                  return matchups.length > 0 ? matchups : (
                    <div className="bg-gray-900 rounded-lg p-8 text-center border border-gray-800">
                      <p className="text-gray-400">No matchups available</p>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* Team Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              {/* Team Header */}
              <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-t-xl p-4 border border-green-800/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Your Team</h2>
                  <span className="text-sm bg-black/30 px-3 py-1 rounded-full">
                    {selectedFighters.length}/{league?.settings.team_size || 5} Fighters
                  </span>
                </div>
              </div>

              {/* Team Content */}
              <div className="bg-gray-900/95 rounded-b-xl border-x border-b border-gray-800 p-4">
                {selectedFighters.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 opacity-20">🥊</div>
                    <p className="text-gray-400 mb-2">No fighters selected</p>
                    <p className="text-sm text-gray-500">Select fighters to build your team</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedFighters.map((pick, index) => {
                      const fighter = fighters.find(f => f.id === pick.fighter_id);
                      if (!fighter) return null;
                      
                      return (
                        <div
                          key={pick.fighter_id}
                          className="group bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                                <h4 className="font-semibold text-white">{fighter.name}</h4>
                                {pick.is_captain && (
                                  <span className="bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30 font-bold">
                                    ⭐ C
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span>{fighter.division}</span>
                                {fighter.opponent && (
                                  <>
                                    <span className="text-gray-600">vs</span>
                                    <span>{fighter.opponent.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400 font-bold">
                                ${pick.salary.toLocaleString()}
                              </span>
                              <button
                                onClick={() => toggleFighterSelection(fighter)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                                title="Remove fighter"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          {/* Captain Selection Button */}
                          {league?.settings.allow_captain && (
                            <button
                              onClick={() => toggleCaptain(pick.fighter_id)}
                              className={`
                                w-full mt-2 py-1.5 px-2 rounded-md text-xs font-medium transition-all
                                ${pick.is_captain 
                                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-md' 
                                  : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white'
                                }
                              `}
                            >
                              {pick.is_captain ? '⭐ Captain (1.5x points)' : 'Make Captain'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Prediction Mode (temporary priority render) */}
        {user && event && fights.length > 0 && renderPrediction && (
          <div className="mb-8">
            <PredictionBuilder userId={user.uid} event={event} fights={fights} league={{ id: `league_global_${event.id}`, name: `${event.name} Global Contest`, type: 'global', event_id: event.id, mode: 'main_card_prediction', settings: { lock_policy: 'main_card_minus_15m', allow_captain: true, captain_multiplier: 1.25, show_lineups_after: 'lock' }, total_entries: 0, status: 'open' } as any} />
          </div>
        )}

        {/* Budget Summary */}
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget Used</span>
                      <span className="text-white font-medium">${totalSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Remaining</span>
                      <span className={`font-bold ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        ${remainingBudget.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-800">
                      <span className="text-gray-400">Total Budget</span>
                      <span className="text-white font-medium">${(league?.settings.budget || 10000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleSaveDraft}
                    disabled={selectedFighters.length === 0 || saving || isLocked}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                      selectedFighters.length === 0 || saving || isLocked
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {saving ? 'Saving...' : draftId ? 'Update Draft' : 'Save Draft'}
                  </button>
                  
                  <button
                    onClick={handleSubmitTeam}
                    disabled={
                      selectedFighters.length !== (league?.settings.team_size || 5) || 
                      remainingBudget < 0 || 
                      saving || 
                      isLocked
                    }
                    className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                      selectedFighters.length !== (league?.settings.team_size || 5) || 
                      remainingBudget < 0 || 
                      saving || 
                      isLocked
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg'
                    }`}
                  >
                    {saving ? 'Submitting...' : 'Submit Team'}
                  </button>
                </div>

                {/* PPV Bonus Notice */}
                {event.type === 'PPV' && league?.settings.apply_ppv_multiplier && (
                  <div className="mt-4 bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 rounded-lg p-3 border border-yellow-800/30">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-lg">💰</span>
                      <div>
                        <div className="text-sm font-medium text-yellow-400">PPV Event Bonus!</div>
                        <div className="text-xs text-gray-400">All fighters get 1.5x points boost</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 