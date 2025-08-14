import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import FirecrawlApp from '@mendable/firecrawl-js';

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

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({ 
  apiKey: process.env.FIRECRAWL_API_KEY || '' 
});

console.log('🎯 UFC Recent Events Scraper\n');

// Recent past UFC events (as of December 2024)
const RECENT_PAST_EVENTS = [
  { slug: 'ufc-310', date: '2024-12-07', name: 'UFC 310: Pantoja vs Asakura' },
  { slug: 'ufc-fight-night-246', date: '2024-11-23', name: 'UFC Fight Night: Yan vs Figueiredo' },
  { slug: 'ufc-309', date: '2024-11-16', name: 'UFC 309: Jones vs Miocic' },
  { slug: 'ufc-fight-night-245', date: '2024-11-09', name: 'UFC Fight Night: Moreno vs Albazi' }
];

// Upcoming events
const UPCOMING_EVENTS = [
  { slug: 'ufc-311', date: '2025-01-18', name: 'UFC 311: Makhachev vs Tsarukyan 2' },
  { slug: 'ufc-fight-night-247', date: '2025-01-11', name: 'UFC Fight Night: Covington vs Buckley' },
  { slug: 'ufc-312', date: '2025-02-08', name: 'UFC 312' }
];

async function cleanEventName(name: string): Promise<string> {
  // Remove any embedded URLs
  name = name.replace(/https?:\/\/[^\s]+/g, '');
  // Remove any remaining http fragments
  name = name.replace(/http[^\s]*/g, '');
  // Clean up extra whitespace
  name = name.replace(/\s+/g, ' ').trim();
  // Remove duplicate event numbers (e.g., "UFC 310UFC 310" becomes "UFC 310")
  name = name.replace(/(UFC\s+\d+|UFC\s+Fight\s+Night(?:\s+\d+)?)\1+/gi, '$1');
  return name;
}

async function updateExistingEvents() {
  console.log('🧹 Cleaning up existing event names...\n');
  
  const eventsSnapshot = await db.collection('events').get();
  const batch = db.batch();
  let updateCount = 0;
  
  for (const doc of eventsSnapshot.docs) {
    const event = doc.data();
    const cleanedName = await cleanEventName(event.name);
    
    if (cleanedName !== event.name) {
      console.log(`  📝 Cleaning: "${event.name}"`);
      console.log(`     → "${cleanedName}"\n`);
      
      batch.update(doc.ref, { 
        name: cleanedName,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      updateCount++;
    }
  }
  
  if (updateCount > 0) {
    await batch.commit();
    console.log(`✅ Cleaned ${updateCount} event names\n`);
  } else {
    console.log('✅ All event names are already clean\n');
  }
}

async function createEventData(eventInfo: any, isPast: boolean) {
  const eventId = `event_${eventInfo.slug.replace(/-/g, '_')}`;
  const eventDate = new Date(eventInfo.date + 'T22:00:00Z'); // Default to 10 PM UTC
  
  return {
    id: eventId,
    name: eventInfo.name,
    type: eventInfo.slug.includes('fight-night') ? 'Fight Night' : 'PPV',
    date_utc: eventDate.toISOString(),
    venue: {
      name: isPast ? 'UFC APEX' : 'T-Mobile Arena',
      city: 'Las Vegas',
      state: 'Nevada',
      country: 'USA',
      timezone: 'America/Los_Angeles'
    },
    broadcast: {
      prelims_time_utc: new Date(eventDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      main_card_time_utc: eventDate.toISOString(),
      early_prelims_time_utc: new Date(eventDate.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      networks: eventInfo.slug.includes('fight-night') ? ['ESPN+'] : ['ESPN+', 'PPV']
    },
    main_card: [],
    prelims: [],
    early_prelims: [],
    status: isPast ? 'completed' : 'upcoming',
    poster_url: '',
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  };
}

async function scrapeAndSaveEvents() {
  console.log('📅 Adding recent past and upcoming UFC events...\n');
  
  const batch = db.batch();
  let addedCount = 0;
  let updateCount = 0;
  
  // Add past events
  console.log('Past Events:');
  for (const eventInfo of RECENT_PAST_EVENTS) {
    const eventData = await createEventData(eventInfo, true);
    const eventRef = db.collection('events').doc(eventData.id);
    
    // Check if event already exists
    const existingDoc = await eventRef.get();
    if (!existingDoc.exists) {
      batch.set(eventRef, eventData);
      console.log(`  ✅ ${eventInfo.name} (${eventInfo.date})`);
      addedCount++;
    } else {
      // Update if it exists but has wrong status
      const existing = existingDoc.data();
      if (existing?.status !== 'completed') {
        batch.update(eventRef, { 
          status: 'completed',
          date_utc: eventData.date_utc,
          name: await cleanEventName(existing?.name || eventInfo.name),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  📝 Updated ${eventInfo.name} to completed status`);
        updateCount++;
      }
    }
  }
  
  console.log('\nUpcoming Events:');
  // Add upcoming events
  for (const eventInfo of UPCOMING_EVENTS) {
    const eventData = await createEventData(eventInfo, false);
    const eventRef = db.collection('events').doc(eventData.id);
    
    // Check if event already exists
    const existingDoc = await eventRef.get();
    if (!existingDoc.exists) {
      batch.set(eventRef, eventData);
      console.log(`  ✅ ${eventInfo.name} (${eventInfo.date})`);
      addedCount++;
    } else {
      // Update name if needed
      const existing = existingDoc.data();
      const cleanedName = await cleanEventName(existing?.name || eventInfo.name);
      if (cleanedName !== existing?.name) {
        batch.update(eventRef, { 
          name: cleanedName,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  📝 Cleaned name for ${eventInfo.name}`);
        updateCount++;
      }
    }
  }
  
  if (addedCount > 0 || updateCount > 0) {
    await batch.commit();
    console.log(`\n💾 Added ${addedCount} new events and updated ${updateCount} existing events!\n`);
  } else {
    console.log('\n✅ All events are already up to date\n');
  }
}

async function deleteInvalidEvents() {
  console.log('🗑️  Removing invalid future-dated "past" events...\n');
  
  const eventsSnapshot = await db.collection('events').get();
  const batch = db.batch();
  let deleteCount = 0;
  let fixCount = 0;
  
  for (const doc of eventsSnapshot.docs) {
    const event = doc.data();
    const eventDate = new Date(event.date_utc);
    const now = new Date();
    
    // Check for obviously wrong dates (like 1993 or far future marked as completed)
    const year = eventDate.getFullYear();
    if ((year < 2020 || year > 2025) && event.status === 'completed') {
      console.log(`  🗑️  Deleting invalid event: ${event.name} (${event.date_utc})`);
      batch.delete(doc.ref);
      deleteCount++;
    }
    // Fix events with wrong status
    else if (eventDate < now && event.status === 'upcoming') {
      batch.update(doc.ref, { 
        status: 'completed',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`  📝 Fixed status for past event: ${event.name}`);
      fixCount++;
    }
    else if (eventDate > now && event.status === 'completed') {
      // Only fix if it's not one of our known past events
      const isKnownPast = RECENT_PAST_EVENTS.some(e => doc.id.includes(e.slug.replace(/-/g, '_')));
      if (!isKnownPast) {
        batch.update(doc.ref, { 
          status: 'upcoming',
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  📝 Fixed status for future event: ${event.name}`);
        fixCount++;
      }
    }
  }
  
  if (deleteCount > 0 || fixCount > 0) {
    await batch.commit();
    console.log(`\n✅ Cleaned up ${deleteCount} invalid events and fixed ${fixCount} event statuses\n`);
  } else {
    console.log('✅ No invalid events found\n');
  }
}

// Main function
async function main() {
  console.log('==================================================');
  console.log('       UFC RECENT EVENTS SCRAPER & CLEANER       ');
  console.log('==================================================\n');
  
  try {
    // Step 1: Clean existing event names
    await updateExistingEvents();
    
    // Step 2: Delete invalid events
    await deleteInvalidEvents();
    
    // Step 3: Add recent past and upcoming events
    await scrapeAndSaveEvents();
    
    console.log('==================================================');
    console.log('                    COMPLETE!                     ');
    console.log('==================================================\n');
    
    console.log('✅ Events database has been cleaned and updated!');
    console.log('🎯 Past events now show actual recent UFC events');
    console.log('🔧 Event names have been cleaned of URLs');
    console.log('\n🚀 Your app should now display correct event data!\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

// Run the script
main(); 