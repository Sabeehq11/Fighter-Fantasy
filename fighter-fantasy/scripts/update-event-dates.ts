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

// Known UFC events with actual/estimated dates
// Context: We're in August 2025, UFC 318 just happened, UFC 319 is upcoming
const KNOWN_EVENT_DATES: { [key: string]: { date: string, name?: string, status: 'completed' | 'upcoming', venue?: any } } = {
  // Past events (2024)
  'ufc-310': { date: '2024-12-07', name: 'UFC 310: Pantoja vs Asakura', status: 'completed' },
  'ufc-309': { date: '2024-11-16', name: 'UFC 309: Jones vs Miocic', status: 'completed' },
  'ufc-308': { date: '2024-10-26', name: 'UFC 308', status: 'completed' },
  'ufc-307': { date: '2024-10-05', name: 'UFC 307', status: 'completed' },
  'ufc-306': { date: '2024-09-14', name: 'UFC 306', status: 'completed' },
  'ufc-fight-night-246': { date: '2024-11-23', name: 'UFC Fight Night: Yan vs Figueiredo', status: 'completed' },
  'ufc-fight-night-245': { date: '2024-11-09', name: 'UFC Fight Night: Moreno vs Albazi', status: 'completed' },
  
  // Past events (2025 - already happened as of August 2025)
  'ufc-311': { 
    date: '2025-01-18', 
    name: 'UFC 311: Makhachev vs Tsarukyan 2',
    status: 'completed',
    venue: {
      name: 'Intuit Dome',
      city: 'Inglewood',
      state: 'California',
      country: 'USA',
      timezone: 'America/Los_Angeles'
    }
  },
  'ufc-fight-night-247': { 
    date: '2025-01-11', 
    name: 'UFC Fight Night: Covington vs Buckley',
    status: 'completed',
    venue: {
      name: 'Amalie Arena',
      city: 'Tampa',
      state: 'Florida',
      country: 'USA',
      timezone: 'America/New_York'
    }
  },
  'ufc-312': { 
    date: '2025-02-08', 
    name: 'UFC 312',
    status: 'completed',
    venue: {
      name: 'Qudos Bank Arena',
      city: 'Sydney',
      state: 'NSW',
      country: 'Australia',
      timezone: 'Australia/Sydney'
    }
  },
  
  // More past events (2025 - already happened)
  'ufc-313': { date: '2025-03-08', name: 'UFC 313', status: 'completed' },
  'ufc-314': { date: '2025-04-12', name: 'UFC 314', status: 'completed' },
  'ufc-315': { date: '2025-05-10', name: 'UFC 315', status: 'completed' },
  'ufc-316': { date: '2025-06-14', name: 'UFC 316', status: 'completed' }, // International Fight Week
  'ufc-317': { date: '2025-07-12', name: 'UFC 317', status: 'completed' },
  'ufc-318': { date: '2025-08-09', name: 'UFC 318', status: 'completed' }, // Most recent completed PPV
  
  // Upcoming events (from August 2025 perspective)
  'ufc-319': { 
    date: '2025-08-16', 
    name: 'UFC 319: Du Plessis vs Chimaev, Live From United Center In Chicago, Illinois on August 16, 2025',
    status: 'upcoming',
    venue: {
      name: 'United Center',
      city: 'Chicago',
      state: 'Illinois',
      country: 'USA',
      timezone: 'America/Chicago'
    }
  },
  'ufc-320': { date: '2025-09-13', name: 'UFC 320', status: 'upcoming' },
  'ufc-321': { date: '2025-10-11', name: 'UFC 321', status: 'upcoming' },
  'ufc-322': { date: '2025-11-15', name: 'UFC 322', status: 'upcoming' }, // NYC Madison Square Garden likely
  'ufc-323': { date: '2025-12-13', name: 'UFC 323', status: 'upcoming' },
  
  // Fight Night events
  'ufc-fight-night-248': { date: '2025-02-15', name: 'UFC Fight Night 248', status: 'completed' },
  'ufc-fight-night-249': { date: '2025-03-22', name: 'UFC Fight Night 249', status: 'completed' },
  'ufc-fight-night-250': { date: '2025-04-05', name: 'UFC Fight Night 250', status: 'completed' },
  'ufc-fight-night-imavovvsborralho': { 
    date: '2025-08-16', 
    name: 'UFC Fight Night ImavovvsBorralho',
    status: 'upcoming'
  },
  'ufc-fight-night-september-13-2025': { 
    date: '2025-09-13', 
    name: 'UFC FIGHT NIGHT SEPTEMBER 13 2025',
    status: 'upcoming'
  },
};

async function updateEventDates() {
  console.log('📅 Updating UFC Event Dates and Statuses (August 2025 Context)\n');
  console.log('==================================================\n');
  console.log('Context: UFC 318 was the most recent PPV, UFC 319 is upcoming\n');
  
  const eventsRef = db.collection('events');
  const snapshot = await eventsRef.get();
  
  console.log(`Found ${snapshot.size} events to check...\n`);
  
  const batch = db.batch();
  let updatedCount = 0;
  
  for (const doc of snapshot.docs) {
    const event = doc.data();
    const eventId = doc.id;
    const eventSlug = eventId.replace('event_', '').replace(/_/g, '-').toLowerCase();
    
    const updates: any = {
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };
    let hasUpdates = false;
    
    // Check if we have known data for this event
    let knownData = null;
    
    // Try to find the event in our known events
    for (const [key, value] of Object.entries(KNOWN_EVENT_DATES)) {
      if (eventSlug.includes(key) || key.includes(eventSlug)) {
        knownData = value;
        break;
      }
    }
    
    if (knownData) {
      // Update date
      const newDate = new Date(knownData.date + 'T22:00:00Z'); // Default to 10 PM UTC
      const oldDate = event.date_utc ? new Date(event.date_utc) : null;
      
      if (!oldDate || Math.abs(oldDate.getTime() - newDate.getTime()) > 24 * 60 * 60 * 1000) {
        updates.date_utc = newDate.toISOString();
        
        // Update broadcast times (main card typically starts at event time)
        updates.broadcast = {
          main_card_time_utc: newDate.toISOString(),
          prelims_time_utc: new Date(newDate.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours before
          early_prelims_time_utc: new Date(newDate.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours before
          networks: event.broadcast?.networks || ['ESPN+', eventSlug.includes('fight-night') ? 'ESPN' : 'PPV']
        };
        hasUpdates = true;
      }
      
      // Update name if provided
      if (knownData.name && event.name !== knownData.name) {
        updates.name = knownData.name;
        hasUpdates = true;
      }
      
      // Update venue if provided
      if (knownData.venue) {
        updates.venue = knownData.venue;
        hasUpdates = true;
      }
      
      // Update status based on our known data
      if (event.status !== knownData.status) {
        updates.status = knownData.status;
        hasUpdates = true;
      }
      
      if (hasUpdates) {
        batch.update(doc.ref, updates);
        console.log(`  ✅ ${knownData.name || event.name}`);
        if (updates.date_utc) {
          console.log(`     Date: ${knownData.date}`);
        }
        if (updates.status) {
          console.log(`     Status: ${event.status} → ${updates.status}`);
        }
        if (updates.venue) {
          console.log(`     Venue: ${updates.venue.city}, ${updates.venue.state || updates.venue.country}`);
        }
        console.log('');
        updatedCount++;
      }
    } else {
      // For unknown events, determine status based on UFC number
      const ufcNumberMatch = event.name?.match(/UFC\s*(\d+)/i);
      if (ufcNumberMatch) {
        const ufcNumber = parseInt(ufcNumberMatch[1]);
        // UFC 318 and below are completed, 319 and above are upcoming
        const shouldBeStatus = ufcNumber <= 318 ? 'completed' : 'upcoming';
        
        if (event.status !== shouldBeStatus) {
          updates.status = shouldBeStatus;
          batch.update(doc.ref, updates);
          console.log(`  📝 ${event.name} - status updated to ${shouldBeStatus} (based on UFC number)`);
          updatedCount++;
        }
      }
    }
  }
  
  if (updatedCount > 0) {
    await batch.commit();
    console.log('\n==================================================');
    console.log(`✅ Updated ${updatedCount} events`);
  } else {
    console.log('\n==================================================');
    console.log('✅ All events already have correct dates and statuses!');
  }
  
  // Show status summary
  console.log('\n📊 Status Summary:');
  const allEvents = await eventsRef.get();
  let upcomingCount = 0;
  let completedCount = 0;
  
  allEvents.docs.forEach(doc => {
    const event = doc.data();
    if (event.status === 'upcoming') upcomingCount++;
    else if (event.status === 'completed') completedCount++;
  });
  
  console.log(`   • Completed events: ${completedCount}`);
  console.log(`   • Upcoming events: ${upcomingCount}`);
  
  // Show upcoming events
  console.log('\n📅 Next Upcoming Events:');
  const upcomingSnapshot = await eventsRef
    .where('status', '==', 'upcoming')
    .get();
  
  const upcomingEvents = upcomingSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .sort((a: any, b: any) => {
      const dateA = a.date_utc ? new Date(a.date_utc).getTime() : 0;
      const dateB = b.date_utc ? new Date(b.date_utc).getTime() : 0;
      return dateA - dateB;
    })
    .slice(0, 5);
  
  upcomingEvents.forEach((event: any) => {
    const date = event.date_utc ? new Date(event.date_utc) : null;
    const dateStr = date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBD';
    console.log(`   • ${event.name} - ${dateStr}`);
  });
  
  console.log('\n✨ Event dates and statuses have been updated!\n');
  console.log('Note: UFC 318 and earlier are marked as completed.');
  console.log('      UFC 319 and later are marked as upcoming.\n');
}

// Main function
async function main() {
  try {
    await updateEventDates();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

// Run the script
main(); 