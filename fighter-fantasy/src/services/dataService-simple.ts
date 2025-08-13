import { 
  collection, 
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Fighter, Event, Fight } from '@/types';

class SimpleDataService {
  // Get ALL events without filtering
  async getAllEvents(): Promise<Event[]> {
    try {
      console.log('Fetching ALL events from Firestore (no filters)...');
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);
      console.log(`Found ${snapshot.size} total events`);
      const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      
      // Client-side filtering
      const upcoming = events.filter(e => e.status === 'upcoming');
      const past = events.filter(e => e.status === 'completed');
      
      console.log(`Filtered: ${upcoming.length} upcoming, ${past.length} past`);
      
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }
  
  // Get ALL fighters without filtering
  async getAllFighters(): Promise<Fighter[]> {
    try {
      console.log('Fetching ALL fighters from Firestore (no filters)...');
      const fightersRef = collection(db, 'fighters');
      const snapshot = await getDocs(fightersRef);
      console.log(`Found ${snapshot.size} total fighters`);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Fighter));
    } catch (error) {
      console.error('Error fetching fighters:', error);
      return [];
    }
  }
}

export const simpleDataService = new SimpleDataService(); 