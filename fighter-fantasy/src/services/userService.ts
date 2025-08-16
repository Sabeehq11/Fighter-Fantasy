import { db } from '@/lib/firebase/client';
import { 
  doc, 
  getDoc,
  getDocs,
  collection,
  query,
  where,
  documentId
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  favoritesFighters?: string[];
  createdAt?: any;
  updatedAt?: any;
  role?: 'user' | 'admin';
  leagues?: string[];
  owned_leagues?: string[];
}

// Get a single user profile
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { uid: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Get multiple user profiles by IDs
export async function getUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const profiles = new Map<string, UserProfile>();
  
  if (userIds.length === 0) {
    return profiles;
  }

  try {
    // Firebase has a limit of 10 for 'in' queries, so we need to batch
    const batches = [];
    for (let i = 0; i < userIds.length; i += 10) {
      const batch = userIds.slice(i, i + 10);
      batches.push(batch);
    }

    for (const batch of batches) {
      const q = query(
        collection(db, 'users'),
        where(documentId(), 'in', batch)
      );
      
      const snapshot = await getDocs(q);
      snapshot.forEach(doc => {
        const data = doc.data();
        profiles.set(doc.id, {
          uid: doc.id,
          email: data.email || null,
          displayName: data.displayName || data.email?.split('@')[0] || 'Anonymous',
          photoURL: data.photoURL || null,
          ...data
        } as UserProfile);
      });
    }

    // For any missing profiles, create placeholder entries
    userIds.forEach(userId => {
      if (!profiles.has(userId)) {
        profiles.set(userId, {
          uid: userId,
          email: null,
          displayName: 'User',
          photoURL: null
        });
      }
    });

    return profiles;
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return profiles;
  }
} 