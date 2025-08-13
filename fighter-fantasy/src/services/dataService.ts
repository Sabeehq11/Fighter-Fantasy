import { 
  collection, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where, 
  orderBy, 
  limit,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Fighter, Event, Fight, DivisionRankings, WeightDivision } from '@/types';

class DataService {
  // Events
  async getUpcomingEvents(limitCount: number = 10): Promise<Event[]> {
    try {
      console.log('Fetching upcoming events from Firestore...');
      const eventsRef = collection(db, 'events');
      // Simple query without ordering to avoid composite index
      const q = query(
        eventsRef,
        where('status', '==', 'upcoming')
      );
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.size} upcoming events`);
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      
      // Sort and limit on client side
      events.sort((a, b) => new Date(a.date_utc).getTime() - new Date(b.date_utc).getTime());
      
      return events.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return [];
    }
  }

  async getPastEvents(limitCount: number = 10): Promise<Event[]> {
    try {
      console.log('Fetching past events from Firestore...');
      const eventsRef = collection(db, 'events');
      // Simple query without ordering to avoid composite index
      const q = query(
        eventsRef,
        where('status', '==', 'completed')
      );
      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.size} past events`);
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      
      // Sort and limit on client side
      events.sort((a, b) => new Date(b.date_utc).getTime() - new Date(a.date_utc).getTime());
      
      return events.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching past events:', error);
      return [];
    }
  }
  
  async getEvents(): Promise<Event[]> {
    try {
      console.log('Fetching all events from Firestore...');
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);
      console.log(`Found ${snapshot.size} total events`);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    try {
      const eventDoc = await getDoc(doc(db, 'events', id));
      if (eventDoc.exists()) {
        return { id: eventDoc.id, ...eventDoc.data() } as Event;
      }
      return null;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  async getEventFights(eventId: string): Promise<Fight[]> {
    try {
      const fightsRef = collection(db, 'fights');
      // Simple query without ordering to avoid composite index
      const q = query(
        fightsRef,
        where('event_id', '==', eventId)
      );
      const snapshot = await getDocs(q);
      const fights = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fight));
      
      // Sort by bout_order on the client side
      fights.sort((a, b) => (b.bout_order || 0) - (a.bout_order || 0));
      
      return fights;
    } catch (error) {
      console.error('Error fetching event fights:', error);
      return [];
    }
  }

  // Fighters
  async getAllFighters(): Promise<Fighter[]> {
    try {
      const fightersRef = collection(db, 'fighters');
      const q = query(fightersRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fighter));
    } catch (error) {
      console.error('Error fetching fighters:', error);
      return [];
    }
  }

  async getFighterById(id: string): Promise<Fighter | null> {
    try {
      const fighterDoc = await getDoc(doc(db, 'fighters', id));
      if (fighterDoc.exists()) {
        return { id: fighterDoc.id, ...fighterDoc.data() } as Fighter;
      }
      return null;
    } catch (error) {
      console.error('Error fetching fighter:', error);
      return null;
    }
  }

  async getFightersByDivision(division: WeightDivision): Promise<Fighter[]> {
    try {
      const fightersRef = collection(db, 'fighters');
      // Simplified query - just filter by division
      const q = query(
        fightersRef,
        where('division', '==', division)
      );
      const snapshot = await getDocs(q);
      const fighters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fighter));
      
      // Filter active fighters and sort by ranking on client side
      const activeFighters = fighters.filter(f => f.isActive);
      activeFighters.sort((a, b) => {
        // Champions first
        if (a.isChampion && !b.isChampion) return -1;
        if (!a.isChampion && b.isChampion) return 1;
        
        // Then by ranking (null rankings go to the end)
        if (a.ranking === null || a.ranking === undefined) return 1;
        if (b.ranking === null || b.ranking === undefined) return -1;
        return a.ranking - b.ranking;
      });
      
      return activeFighters;
    } catch (error) {
      console.error('Error fetching fighters by division:', error);
      return [];
    }
  }

  async searchFighters(searchTerm: string): Promise<Fighter[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // For now, we'll fetch all and filter client-side
      // In production, you'd want to use Algolia or similar
      const fighters = await this.getAllFighters();
      const term = searchTerm.toLowerCase();
      return fighters.filter(f => 
        f.name.toLowerCase().includes(term) ||
        f.nickname?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching fighters:', error);
      return [];
    }
  }

  // Fights
  async getFightById(id: string): Promise<Fight | null> {
    try {
      const fightDoc = await getDoc(doc(db, 'fights', id));
      if (fightDoc.exists()) {
        return { id: fightDoc.id, ...fightDoc.data() } as Fight;
      }
      return null;
    } catch (error) {
      console.error('Error fetching fight:', error);
      return null;
    }
  }

  async getFighterRecentFights(fighterId: string, limitCount: number = 5): Promise<Fight[]> {
    try {
      const fightsRef = collection(db, 'fights');
      // We need to query for fights where the fighter is either fighter_a or fighter_b
      // Firestore doesn't support OR queries directly, so we'll do two queries
      const q1 = query(
        fightsRef,
        where('fighter_a_id', '==', fighterId),
        where('status', '==', 'completed'),
        limit(limitCount)
      );
      const q2 = query(
        fightsRef,
        where('fighter_b_id', '==', fighterId),
        where('status', '==', 'completed'),
        limit(limitCount)
      );
      
      const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      const fights = [
        ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fight)),
        ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fight))
      ];
      
      // Sort by event date (would need to join with events in production)
      return fights.slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching fighter recent fights:', error);
      return [];
    }
  }

  // Rankings
  async getDivisionRankings(division: WeightDivision): Promise<DivisionRankings | null> {
    try {
      // Rankings are stored in a subcollection structure
      const divisionName = division.toLowerCase().replace(/\s+/g, '_');
      const rankingDoc = await getDoc(
        doc(db, 'rankings', 'divisions', divisionName, `rankings_${divisionName}`)
      );
      
      if (rankingDoc.exists()) {
        return rankingDoc.data() as DivisionRankings;
      }
      return null;
    } catch (error) {
      console.error('Error fetching division rankings:', error);
      return null;
    }
  }
}

// Export singleton instance
export const dataService = new DataService();

// Export commonly used functions
export const getUpcomingEvents = dataService.getUpcomingEvents.bind(dataService);
export const getPastEvents = dataService.getPastEvents.bind(dataService);
export const getEvents = dataService.getEvents.bind(dataService);
export const getEvent = dataService.getEventById.bind(dataService);
export const getFighters = dataService.getAllFighters.bind(dataService);
export const getFighter = dataService.getFighterById.bind(dataService);
export const getFightsByEvent = dataService.getEventFights.bind(dataService);
export const getFight = dataService.getFightById.bind(dataService);
export const getDivisionRankings = dataService.getDivisionRankings.bind(dataService); 