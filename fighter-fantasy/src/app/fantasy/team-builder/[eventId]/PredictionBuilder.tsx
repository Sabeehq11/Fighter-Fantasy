"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event, Fight, Fighter } from '@/types';
import type { PredictionEntry, PredictionLeague, PredictionPick, PredictionMethod, PredictionRound } from '@/types/prediction';
import { buildEntryId, getUserPredictionEntry, upsertPredictionEntry, incrementEditCount } from '@/services/predictionService';
import { getFighter } from '@/services/dataService';

interface PredictionBuilderProps {
  userId: string;
  event: Event;
  fights: Fight[];
  league: PredictionLeague;
}

const METHOD_OPTIONS: PredictionMethod[] = ['KO/TKO', 'Submission', 'Decision', 'DQ', 'Draw'];
const ROUND_OPTIONS: PredictionRound[] = ['R1', 'R2', 'R3', 'R4', 'R5', 'GTD'];

export default function PredictionBuilder({ userId, event, fights, league }: PredictionBuilderProps) {
  const router = useRouter();
  const [entry, setEntry] = useState<PredictionEntry | null>(null);
  const [fightersById, setFightersById] = useState<Map<string, Fighter>>(new Map());
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [timeUntilLock, setTimeUntilLock] = useState<string>('');

  const mainCardFights = useMemo(() => {
    if (event.main_card && event.main_card.length > 0) {
      const setIds = new Set(event.main_card);
      return fights.filter(f => setIds.has(f.id));
    }
    return [...fights].sort((a, b) => (b.bout_order || 0) - (a.bout_order || 0)).slice(0, 5);
  }, [event.main_card, fights]);

  useEffect(() => {
    const load = async () => {
      const id = buildEntryId(userId, event.id);
      const existing = await getUserPredictionEntry(userId, league.id);
      
      // Check if entry is locked
      const now = new Date();
      const eventDate = new Date(event.date_utc);
      const lockTime = new Date(eventDate.getTime() - 15 * 60 * 1000);
      const locked = now >= lockTime || (existing && existing.is_locked) || false;
      setIsLocked(locked);
      
      const baseEntry: PredictionEntry = existing || {
        id,
        user_id: userId,
        league_id: league.id,
        event_id: event.id,
        picks: [],
        is_locked: locked,
        edit_count: 0,
        submitted_at: null as any,
        total_points: 0,
        created_at: null as any,
        updated_at: null as any,
      };
      setEntry(baseEntry);

      // Preload fighter data
      const fighterIds = new Set<string>();
      mainCardFights.forEach(f => { 
        fighterIds.add(f.fighter_a_id); 
        fighterIds.add(f.fighter_b_id); 
      });
      const entries = await Promise.all(Array.from(fighterIds).map(id => getFighter(id)));
      const m = new Map<string, Fighter>();
      entries.forEach(f => { 
        if (f) m.set(f.id, f); 
      });
      setFightersById(m);
    };
    load();
  }, [userId, event.id, league.id, mainCardFights]);

  // Lock countdown timer
  useEffect(() => {
    const updateLockStatus = () => {
      const now = new Date();
      const eventDate = new Date(event.date_utc);
      const lockTime = new Date(eventDate.getTime() - 15 * 60 * 1000);
      const locked = now >= lockTime;
      
      setIsLocked(locked || (entry?.is_locked || false));
      
      if (!locked && !entry?.is_locked) {
        const secondsRemaining = Math.floor((lockTime.getTime() - now.getTime()) / 1000);
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
        } else {
          setTimeUntilLock('LOCKED');
        }
      } else {
        setTimeUntilLock('LOCKED');
      }
    };
    
    updateLockStatus();
    const interval = setInterval(updateLockStatus, 1000);
    return () => clearInterval(interval);
  }, [event.date_utc, entry?.is_locked]);

  const getPickForFight = (fightId: string): PredictionPick | undefined => {
    return entry?.picks.find(p => p.fight_id === fightId);
  };

  const updatePick = (fightId: string, update: Partial<PredictionPick>) => {
    if (!entry || isLocked) return;
    
    const existing = getPickForFight(fightId);
    let nextPicks: PredictionPick[];
    if (existing) {
      nextPicks = entry.picks.map(p => 
        p.fight_id === fightId 
          ? { ...existing, ...update, fight_id: fightId } as PredictionPick 
          : p
      );
    } else {
      nextPicks = [...entry.picks, { 
        fight_id: fightId, 
        selected_fighter_id: '', 
        prediction: { method: 'Decision', round: 'GTD' }, 
        ...update 
      } as PredictionPick];
    }
    setEntry({ ...entry, picks: nextPicks });
  };

  const setCaptain = (fighterId: string) => {
    if (!entry || isLocked) return;
    const nextPicks = entry.picks.map(p => ({ 
      ...p, 
      is_captain: p.selected_fighter_id === fighterId 
    }));
    setEntry({ ...entry, picks: nextPicks, captain_fighter_id: fighterId });
  };

  const isComplete = useMemo(() => {
    if (!entry) return false;
    if (entry.picks.length < mainCardFights.length) return false;
    const pickedFightIds = new Set(entry.picks.map(p => p.fight_id));
    if (pickedFightIds.size !== mainCardFights.length) return false;
    return entry.picks.every(p => 
      !!p.selected_fighter_id && !!p.prediction?.method && !!p.prediction?.round
    );
  }, [entry, mainCardFights.length]);

  const handleSave = async () => {
    if (!entry || isLocked) return;
    
    try {
      setSaving(true);
      const updatedEntry = { 
        ...entry,
        edit_count: entry.created_at ? (entry.edit_count || 0) + 1 : 0
      };
      await upsertPredictionEntry(updatedEntry);
      setEntry(updatedEntry);
      alert('Predictions saved successfully!');
    } catch (error) {
      console.error('Error saving predictions:', error);
      alert('Failed to save predictions');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!entry || !isComplete || isLocked) return;
    
    try {
      setSaving(true);
      const updatedEntry = { 
        ...entry, 
        submitted_at: new Date().toISOString(),
        is_locked: true,
        edit_count: (entry.edit_count || 0) + 1
      };
      await upsertPredictionEntry(updatedEntry);
      router.push('/fantasy/my-teams');
    } catch (error) {
      console.error('Error submitting predictions:', error);
      alert('Failed to submit predictions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">🎯 Prediction Contest</h2>
        <div className="flex items-center gap-4">
          {!isLocked ? (
            <span className="text-sm text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded-full">
              ⏱️ Lock in: {timeUntilLock}
            </span>
          ) : (
            <span className="text-sm text-red-400 bg-red-900/30 px-3 py-1 rounded-full">
              🔒 LOCKED
            </span>
          )}
          {entry && entry.edit_count > 0 && (
            <span className="text-sm text-gray-400">
              Edits: {entry.edit_count}
            </span>
          )}
        </div>
      </div>

      {isLocked && (
        <div className="mb-4 bg-red-900/20 border border-red-800 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            Predictions are locked. The event has started or is about to start.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {mainCardFights.map((fight) => {
          const pick = getPickForFight(fight.id);
          const fighterA = fightersById.get(fight.fighter_a_id);
          const fighterB = fightersById.get(fight.fighter_b_id);
          const selectedId = pick?.selected_fighter_id || '';

          return (
            <div key={fight.id} className="border border-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold">Bout {fight.bout_order || ''}</div>
                {fight.is_title_fight && (
                  <span className="text-xs bg-yellow-600 text-black px-2 py-1 rounded">
                    TITLE FIGHT
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name={`fight-${fight.id}`}
                    value={fight.fighter_a_id}
                    checked={selectedId === fight.fighter_a_id}
                    onChange={() => updatePick(fight.id, { selected_fighter_id: fight.fighter_a_id })}
                    disabled={isLocked}
                    className="mr-2"
                  />
                  {fighterA?.name || 'Fighter A'}
                </label>
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name={`fight-${fight.id}`}
                    value={fight.fighter_b_id}
                    checked={selectedId === fight.fighter_b_id}
                    onChange={() => updatePick(fight.id, { selected_fighter_id: fight.fighter_b_id })}
                    disabled={isLocked}
                    className="mr-2"
                  />
                  {fighterB?.name || 'Fighter B'}
                </label>
              </div>

              {selectedId && (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <select
                      value={pick?.prediction?.method || 'Decision'}
                      onChange={(e) => updatePick(fight.id, {
                        prediction: { 
                          method: e.target.value as PredictionMethod,
                          round: pick?.prediction?.round || 'GTD'
                        }
                      })}
                      disabled={isLocked}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-1"
                    >
                      {METHOD_OPTIONS.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select
                      value={pick?.prediction?.round || 'GTD'}
                      onChange={(e) => updatePick(fight.id, {
                        prediction: { 
                          method: pick?.prediction?.method || 'Decision',
                          round: e.target.value as PredictionRound
                        }
                      })}
                      disabled={isLocked}
                      className="bg-gray-800 border border-gray-700 rounded px-3 py-1"
                    >
                      {ROUND_OPTIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={pick?.is_captain || false}
                      onChange={() => setCaptain(selectedId)}
                      disabled={isLocked}
                      className="mr-2"
                    />
                    Set Captain for this fighter (×1.25)
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          disabled={!entry || saving || isLocked}
          onClick={handleSave}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg"
        >
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button
          disabled={!isComplete || saving || isLocked}
          onClick={handleSubmit}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg"
        >
          Submit Picks
        </button>
      </div>
    </div>
  );
} 