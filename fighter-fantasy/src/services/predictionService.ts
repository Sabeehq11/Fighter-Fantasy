import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, serverTimestamp, limit, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { PredictionLeague, PredictionEntry, PredictionScoringRules } from '@/types/prediction';

const COLLECTIONS = {
  leagues: 'fantasy_leagues',
  entries: 'fantasy_entries',
  scores: 'fantasy_scores',
  config: 'fantasy_config'
};

export async function getPredictionLeague(leagueId: string): Promise<PredictionLeague | null> {
  const ref = doc(db, COLLECTIONS.leagues, leagueId);
  const snap = await getDoc(ref);
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as PredictionLeague) : null;
}

export async function getPredictionLeaguesByEvent(eventId: string): Promise<PredictionLeague[]> {
  const q = query(collection(db, COLLECTIONS.leagues), where('event_id', '==', eventId), where('mode', '==', 'main_card_prediction'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as PredictionLeague));
}

export async function upsertPredictionEntry(entry: PredictionEntry): Promise<void> {
  const ref = doc(db, COLLECTIONS.entries, entry.id);
  await setDoc(ref, {
    ...entry,
    updated_at: serverTimestamp(),
    created_at: entry.created_at || serverTimestamp()
  }, { merge: true });
}

export async function getUserPredictionEntry(userId: string, leagueId: string): Promise<PredictionEntry | null> {
  const q = query(collection(db, COLLECTIONS.entries), where('user_id', '==', userId), where('league_id', '==', leagueId), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as any) } as PredictionEntry;
}

export async function incrementEditCount(entryId: string): Promise<void> {
  const ref = doc(db, COLLECTIONS.entries, entryId);
  await updateDoc(ref, { edit_count: increment(1) });
}

export async function loadScoringRules(scoringRulesId = 'default'): Promise<PredictionScoringRules | null> {
  const ref = doc(db, COLLECTIONS.config, 'scoring_rules');
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const cfg = snap.data() as Record<string, any>;
  return (cfg[scoringRulesId] || cfg['default']) as PredictionScoringRules;
}

export async function seedDefaultPredictionLeague(league: PredictionLeague): Promise<void> {
  const ref = doc(db, COLLECTIONS.leagues, league.id);
  await setDoc(ref, { ...league, updated_at: serverTimestamp(), created_at: serverTimestamp() }, { merge: true });
}

export function buildEntryId(userId: string, eventId: string): string {
  return `entry_${userId}_${eventId}`;
} 