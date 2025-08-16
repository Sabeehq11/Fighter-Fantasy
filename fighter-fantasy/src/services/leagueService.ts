import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { League, Event } from '@/types';

// Generate a unique 6-character join code
function generateJoinCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new private league
export async function createPrivateLeague(
  userId: string,
  eventId: string,
  leagueData: {
    name: string;
    description?: string;
    maxEntries?: number;
    entryFee?: number;
    settings?: Partial<League['settings']>;
  }
): Promise<{ success: boolean; leagueId?: string; joinCode?: string; error?: string }> {
  try {
    const leagueId = `league_private_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const joinCode = generateJoinCode();

    const defaultSettings: League['settings'] = {
      budget: 10000,
      team_size: 5,
      max_from_same_fight: 1,
      lock_time_minutes_before: 15,
      allow_captain: true,
      captain_multiplier: 1.5,
      apply_ppv_multiplier: false,
      ppv_multiplier: 1.5,
      ...leagueData.settings
    };

    const league: any = {
      id: leagueId,
      name: leagueData.name,
      type: 'private',
      mode: 'weekly',
      event_id: eventId,
      settings: defaultSettings,
      scoring_system: 'standard',
      total_entries: 1,
      max_entries: leagueData.maxEntries || null,
      entry_fee: leagueData.entryFee || 0,
      prize_pool: 0,
      status: 'open',
      created_by: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      // Private league specific fields
      join_code: joinCode,
      members: [userId],
      admins: [userId],
      invited_users: [],
      is_public_joinable: false
    };

    // Only add description if it exists
    if (leagueData.description && leagueData.description.trim()) {
      league.description = leagueData.description;
    }

    await setDoc(doc(db, 'leagues', leagueId), league);

    // Also add to user's leagues
    await updateDoc(doc(db, 'users', userId), {
      leagues: arrayUnion(leagueId),
      owned_leagues: arrayUnion(leagueId)
    }).catch(() => {
      // If user doc doesn't exist, create it
      setDoc(doc(db, 'users', userId), {
        leagues: [leagueId],
        owned_leagues: [leagueId]
      }, { merge: true });
    });

    return { 
      success: true, 
      leagueId, 
      joinCode 
    };
  } catch (error) {
    console.error('Error creating private league:', error);
    return { 
      success: false, 
      error: 'Failed to create league' 
    };
  }
}

// Create a new public league
export async function createPublicLeague(
  userId: string,
  eventId: string,
  leagueData: {
    name: string;
    description?: string;
    maxEntries?: number;
    entryFee?: number;
    settings?: Partial<League['settings']>;
  }
): Promise<{ success: boolean; leagueId?: string; error?: string }> {
  try {
    const leagueId = `league_public_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const defaultSettings: League['settings'] = {
      budget: 10000,
      team_size: 5,
      max_from_same_fight: 1,
      lock_time_minutes_before: 15,
      allow_captain: true,
      captain_multiplier: 1.5,
      apply_ppv_multiplier: false,
      ppv_multiplier: 1.5,
      ...leagueData.settings
    };

    const league: any = {
      id: leagueId,
      name: leagueData.name,
      type: 'public',
      mode: 'weekly',
      event_id: eventId,
      settings: defaultSettings,
      scoring_system: 'standard',
      total_entries: 1,
      max_entries: leagueData.maxEntries || null,
      entry_fee: leagueData.entryFee || 0,
      prize_pool: 0,
      status: 'open',
      created_by: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      // Public league specific fields
      members: [userId],
      admins: [userId],
      is_featured: false,
      is_public_joinable: true
    };

    // Only add description if it exists
    if (leagueData.description && leagueData.description.trim()) {
      league.description = leagueData.description;
    }

    await setDoc(doc(db, 'leagues', leagueId), league);

    // Also add to user's leagues
    await updateDoc(doc(db, 'users', userId), {
      leagues: arrayUnion(leagueId),
      owned_leagues: arrayUnion(leagueId)
    }).catch(() => {
      // If user doc doesn't exist, create it
      setDoc(doc(db, 'users', userId), {
        leagues: [leagueId],
        owned_leagues: [leagueId]
      }, { merge: true });
    });

    return { 
      success: true, 
      leagueId 
    };
  } catch (error) {
    console.error('Error creating public league:', error);
    return { 
      success: false, 
      error: 'Failed to create league' 
    };
  }
}

// Join a private league using join code
export async function joinPrivateLeague(
  userId: string,
  joinCode: string
): Promise<{ success: boolean; leagueId?: string; leagueName?: string; error?: string }> {
  try {
    // Find league with this join code
    const leaguesRef = collection(db, 'leagues');
    const q = query(
      leaguesRef, 
      where('join_code', '==', joinCode.toUpperCase()),
      where('status', '==', 'open')
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { 
        success: false, 
        error: 'Invalid join code or league is closed' 
      };
    }

    const leagueDoc = snapshot.docs[0];
    const league = leagueDoc.data() as League;

    // Check if user is already a member
    if (league.members?.includes(userId)) {
      return { 
        success: false, 
        error: 'You are already a member of this league' 
      };
    }

    // Check if league is full
    if (league.max_entries && league.members && league.members.length >= league.max_entries) {
      return { 
        success: false, 
        error: 'This league is full' 
      };
    }

    // Add user to league
    await updateDoc(doc(db, 'leagues', league.id), {
      members: arrayUnion(userId),
      total_entries: increment(1),
      updated_at: serverTimestamp()
    });

    // Add league to user's leagues
    await updateDoc(doc(db, 'users', userId), {
      leagues: arrayUnion(league.id)
    }).catch(() => {
      // If user doc doesn't exist, create it
      setDoc(doc(db, 'users', userId), {
        leagues: [league.id]
      }, { merge: true });
    });

    return { 
      success: true, 
      leagueId: league.id,
      leagueName: league.name 
    };
  } catch (error) {
    console.error('Error joining private league:', error);
    return { 
      success: false, 
      error: 'Failed to join league' 
    };
  }
}

// Join a public league
export async function joinPublicLeague(
  userId: string,
  leagueId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const leagueRef = doc(db, 'leagues', leagueId);
    const leagueDoc = await getDoc(leagueRef);

    if (!leagueDoc.exists()) {
      return { 
        success: false, 
        error: 'League not found' 
      };
    }

    const league = leagueDoc.data() as League;

    // Check if league is public and joinable
    if (league.type !== 'public' || !league.is_public_joinable) {
      return { 
        success: false, 
        error: 'This league is not open for public joining' 
      };
    }

    // Check if user is already a member
    if (league.members?.includes(userId)) {
      return { 
        success: false, 
        error: 'You are already a member of this league' 
      };
    }

    // Check if league is full
    if (league.max_entries && league.members && league.members.length >= league.max_entries) {
      return { 
        success: false, 
        error: 'This league is full' 
      };
    }

    // Add user to league
    await updateDoc(leagueRef, {
      members: arrayUnion(userId),
      total_entries: increment(1),
      updated_at: serverTimestamp()
    });

    // Add league to user's leagues
    await updateDoc(doc(db, 'users', userId), {
      leagues: arrayUnion(leagueId)
    }).catch(() => {
      // If user doc doesn't exist, create it
      setDoc(doc(db, 'users', userId), {
        leagues: [leagueId]
      }, { merge: true });
    });

    return { success: true };
  } catch (error) {
    console.error('Error joining public league:', error);
    return { 
      success: false, 
      error: 'Failed to join league' 
    };
  }
}

// Get public leagues for an event
export async function getPublicLeagues(
  eventId: string,
  limitCount: number = 10
): Promise<League[]> {
  try {
    const leaguesRef = collection(db, 'leagues');
    
    // Simplified query while index is building
    // We'll filter and sort in memory temporarily
    const q = query(
      leaguesRef,
      where('type', '==', 'public'),
      where('is_public_joinable', '==', true),
      limit(limitCount * 3) // Get more to filter in memory
    );

    const snapshot = await getDocs(q);
    
    // Filter and sort in memory
    const leagues = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as League))
      .filter(league => 
        league.event_id === eventId && 
        league.status === 'open'
      )
      .sort((a, b) => (b.total_entries || 0) - (a.total_entries || 0))
      .slice(0, limitCount);
    
    return leagues;
  } catch (error) {
    console.error('Error fetching public leagues:', error);
    // If the simplified query also fails, try an even simpler one
    try {
      const q = query(
        collection(db, 'leagues'),
        where('type', '==', 'public'),
        limit(limitCount * 3)
      );
      
      const snapshot = await getDocs(q);
      const leagues = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as League))
        .filter(league => 
          league.event_id === eventId && 
          league.status === 'open' &&
          league.is_public_joinable === true
        )
        .sort((a, b) => (b.total_entries || 0) - (a.total_entries || 0))
        .slice(0, limitCount);
      
      return leagues;
    } catch (fallbackError) {
      console.error('Error with fallback query:', fallbackError);
      return [];
    }
  }
}

// Get user's leagues
export async function getUserLeagues(userId: string): Promise<League[]> {
  try {
    // First get user document to find their leagues
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists() || !userDoc.data().leagues) {
      return [];
    }

    const leagueIds = userDoc.data().leagues as string[];
    
    if (leagueIds.length === 0) {
      return [];
    }

    // Fetch all leagues the user is part of
    const leagues: League[] = [];
    for (const leagueId of leagueIds) {
      const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
      if (leagueDoc.exists()) {
        leagues.push({ id: leagueDoc.id, ...leagueDoc.data() } as League);
      }
    }

    return leagues;
  } catch (error) {
    console.error('Error fetching user leagues:', error);
    return [];
  }
}

// Leave a league
export async function leaveLeague(
  userId: string,
  leagueId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const leagueRef = doc(db, 'leagues', leagueId);
    const leagueDoc = await getDoc(leagueRef);

    if (!leagueDoc.exists()) {
      return { 
        success: false, 
        error: 'League not found' 
      };
    }

    const league = leagueDoc.data() as League;

    // Check if user is the owner
    if (league.created_by === userId) {
      return { 
        success: false, 
        error: 'League owner cannot leave the league. Delete the league instead.' 
      };
    }

    // Remove user from league
    await updateDoc(leagueRef, {
      members: arrayRemove(userId),
      total_entries: increment(-1),
      updated_at: serverTimestamp()
    });

    // Remove league from user's leagues
    await updateDoc(doc(db, 'users', userId), {
      leagues: arrayRemove(leagueId)
    });

    return { success: true };
  } catch (error) {
    console.error('Error leaving league:', error);
    return { 
      success: false, 
      error: 'Failed to leave league' 
    };
  }
}

// Delete a league (owner only)
export async function deleteLeague(
  userId: string,
  leagueId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const leagueRef = doc(db, 'leagues', leagueId);
    const leagueDoc = await getDoc(leagueRef);

    if (!leagueDoc.exists()) {
      return { 
        success: false, 
        error: 'League not found' 
      };
    }

    const league = leagueDoc.data() as League;

    // Check if user is the owner
    if (league.created_by !== userId) {
      return { 
        success: false, 
        error: 'Only the league owner can delete the league' 
      };
    }

    // Update league status to deleted instead of actually deleting
    await updateDoc(leagueRef, {
      status: 'deleted',
      deleted_at: serverTimestamp(),
      updated_at: serverTimestamp()
    });

    // Remove league from all members
    if (league.members) {
      for (const memberId of league.members) {
        await updateDoc(doc(db, 'users', memberId), {
          leagues: arrayRemove(leagueId)
        }).catch(() => {
          // User doc might not exist
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting league:', error);
    return { 
      success: false, 
      error: 'Failed to delete league' 
    };
  }
}

// Get league details
export async function getLeagueDetails(leagueId: string): Promise<League | null> {
  try {
    const leagueDoc = await getDoc(doc(db, 'leagues', leagueId));
    
    if (!leagueDoc.exists()) {
      return null;
    }

    return { id: leagueDoc.id, ...leagueDoc.data() } as League;
  } catch (error) {
    console.error('Error fetching league details:', error);
    return null;
  }
}

// Search public leagues by name
export async function searchPublicLeagues(
  searchTerm: string,
  eventId?: string
): Promise<League[]> {
  try {
    const leaguesRef = collection(db, 'leagues');
    let q;

    if (eventId) {
      q = query(
        leaguesRef,
        where('type', '==', 'public'),
        where('event_id', '==', eventId),
        where('is_public_joinable', '==', true),
        where('status', '==', 'open'),
        orderBy('name'),
        limit(20)
      );
    } else {
      q = query(
        leaguesRef,
        where('type', '==', 'public'),
        where('is_public_joinable', '==', true),
        where('status', '==', 'open'),
        orderBy('name'),
        limit(20)
      );
    }

    const snapshot = await getDocs(q);
    const leagues = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as League));

    // Client-side filter by search term
    return leagues.filter(league => 
      league.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      league.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching public leagues:', error);
    return [];
  }
} 