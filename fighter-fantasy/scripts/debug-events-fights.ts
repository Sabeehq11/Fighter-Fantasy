import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Firebase Admin
const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;

if (!serviceAccountJson) {
  console.error('FIREBASE_ADMIN_SDK_JSON environment variable is not set');
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  if (admin.apps?.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

async function debugEventsAndFights() {
  console.log('🔍 Debugging Events and Fights Connection\n');
  
  // Get all events
  const eventsSnapshot = await db.collection('events').get();
  console.log(`Found ${eventsSnapshot.size} events:\n`);
  
  for (const eventDoc of eventsSnapshot.docs) {
    const event = eventDoc.data();
    console.log(`📅 Event: ${event.name}`);
    console.log(`   ID: ${eventDoc.id}`);
    console.log(`   Status: ${event.status}`);
    console.log(`   Main Card IDs: ${event.main_card?.length || 0} fights`);
    console.log(`   Prelims IDs: ${event.prelims?.length || 0} fights`);
    
    // Check if any fights exist for this event
    const fightsSnapshot = await db.collection('fights')
      .where('event_id', '==', eventDoc.id)
      .get();
    
    console.log(`   Fights in DB with this event_id: ${fightsSnapshot.size}`);
    
    // List first few fight IDs
    if (fightsSnapshot.size > 0) {
      console.log('   Fight IDs found:');
      fightsSnapshot.docs.slice(0, 3).forEach(doc => {
        const fight = doc.data();
        console.log(`     - ${doc.id} (bout_order: ${fight.bout_order})`);
      });
    }
    
    // Check if the fight IDs in the event match actual fight documents
    if (event.main_card && event.main_card.length > 0) {
      const firstMainCardId = event.main_card[0];
      const fightDoc = await db.collection('fights').doc(firstMainCardId).get();
      console.log(`   First main card fight exists: ${fightDoc.exists}`);
      if (!fightDoc.exists) {
        console.log(`   ⚠️  Main card fight IDs don't match actual fight documents!`);
      }
    }
    
    console.log('');
  }
  
  // Also check for any orphaned fights
  console.log('\n🔍 Checking for orphaned fights...');
  const allFightsSnapshot = await db.collection('fights').get();
  console.log(`Total fights in database: ${allFightsSnapshot.size}`);
  
  const eventIds = new Set(eventsSnapshot.docs.map(doc => doc.id));
  const orphanedFights: string[] = [];
  
  allFightsSnapshot.docs.forEach(doc => {
    const fight = doc.data();
    if (!eventIds.has(fight.event_id)) {
      orphanedFights.push(`${doc.id} (event_id: ${fight.event_id})`);
    }
  });
  
  if (orphanedFights.length > 0) {
    console.log(`Found ${orphanedFights.length} orphaned fights:`);
    orphanedFights.slice(0, 5).forEach(id => console.log(`  - ${id}`));
  } else {
    console.log('No orphaned fights found.');
  }
}

// Main function
async function main() {
  console.log('==================================================');
  console.log('        EVENTS & FIGHTS DEBUG TOOL               ');
  console.log('==================================================\n');
  
  try {
    await debugEventsAndFights();
    
    console.log('\n==================================================');
    console.log('                  DEBUG COMPLETE                  ');
    console.log('==================================================\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

// Run the script
main(); 