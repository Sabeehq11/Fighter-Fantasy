import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
);

initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
});

const db = getFirestore();

async function seedLeagues() {
  console.log('Seeding leagues...');

  // Get all events
  const eventsSnapshot = await db.collection('events').get();
  const events = eventsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as any[]; // Type as any[] for now since we're in a script

  console.log(`Found ${events.length} events`);

  // Create a global league for each upcoming event
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  
  for (const event of upcomingEvents) {
    const leagueId = `league_global_${event.id}`;
    
    // Check if league already exists
    const existingLeague = await db.collection('leagues').doc(leagueId).get();
    if (existingLeague.exists) {
      console.log(`League ${leagueId} already exists, skipping...`);
      continue;
    }

    const league = {
      id: leagueId,
      name: `${event.name} Global Championship`,
      type: 'global',
      mode: 'weekly',
      event_id: event.id,
      settings: {
        budget: 10000,
        team_size: 5,
        max_from_same_fight: 1,
        lock_time_minutes_before: 15,
        allow_captain: true,
        captain_multiplier: 1.5,
        apply_ppv_multiplier: event.type === 'PPV',
        ppv_multiplier: 1.5
      },
      scoring_system: 'standard',
      total_entries: 0,
      max_entries: null,
      entry_fee: 0,
      prize_pool: 0,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.collection('leagues').doc(leagueId).set(league);
    console.log(`Created league: ${league.name}`);
  }

  console.log('League seeding complete!');
}

// Run the seed function
seedLeagues()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error seeding leagues:', error);
    process.exit(1);
  }); 