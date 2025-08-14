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

async function fixEventStatuses() {
  console.log('🔧 Fixing UFC Event Statuses\n');
  console.log('==================================================\n');
  
  const eventsRef = collection(db, 'events');
  const snapshot = await eventsRef.get();
  
  console.log(`Found ${snapshot.size} events to check...\n`);
  
  const batch = db.batch();
  let updatedCount = 0;
  let skippedCount = 0;
  
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  // As of January 2025:
  // - UFC 310 (Dec 7, 2024) - completed
  // - UFC 311 (Jan 18, 2025) - upcoming
  // - UFC 312 (Feb 8, 2025) - upcoming
  // - UFC Fight Night: Covington vs Buckley (Jan 11, 2025) - upcoming
  // - UFC 319+ (August 2025 and beyond) - upcoming
  
  // Known past events (everything before Jan 11, 2025)
  const COMPLETED_EVENTS = [
    'ufc-310', 'ufc-309', 'ufc-308', 'ufc-307', 'ufc-306', 'ufc-305', 'ufc-304', 'ufc-303', 'ufc-302', 'ufc-301', 'ufc-300',
    'ufc-299', 'ufc-298', 'ufc-297', 'ufc-296', 'ufc-295', 'ufc-294', 'ufc-293', 'ufc-292', 'ufc-291', 'ufc-290',
    'ufc-fight-night-246', 'ufc-fight-night-245', 'ufc-fight-night-244', 'ufc-fight-night-243'
  ];
  
  // Known upcoming events (as of January 2025)
  const UPCOMING_EVENTS = [
    'ufc-311', 'ufc-312', 'ufc-313', 'ufc-314', 'ufc-315', 'ufc-316', 'ufc-317', 'ufc-318', 
    'ufc-319', 'ufc-320', 'ufc-321',
    'ufc-fight-night-247', 'ufc-fight-night-248', 'ufc-fight-night-249', 'ufc-fight-night-250'
  ];
  
  for (const doc of snapshot.docs) {
    const event = doc.data();
    const eventId = doc.id;
    const eventName = event.name?.toLowerCase() || '';
    
    let shouldBeStatus: string;
    let reason = '';
    
    // Check if event date is in the past
    const eventDate = event.date_utc ? new Date(event.date_utc) : null;
    
    // First, check by known event lists
    const eventSlug = eventId.replace('event_', '').replace(/_/g, '-');
    
    if (COMPLETED_EVENTS.some(e => eventSlug.includes(e))) {
      shouldBeStatus = 'completed';
      reason = 'Known past event';
    } else if (UPCOMING_EVENTS.some(e => eventSlug.includes(e))) {
      shouldBeStatus = 'upcoming';
      reason = 'Known upcoming event';
    } else if (eventDate) {
      // Fallback to date comparison
      if (eventDate < now) {
        shouldBeStatus = 'completed';
        reason = `Event date (${eventDate.toISOString().split('T')[0]}) is in the past`;
      } else {
        shouldBeStatus = 'upcoming';
        reason = `Event date (${eventDate.toISOString().split('T')[0]}) is in the future`;
      }
    } else {
      // If we can't determine, check the UFC number
      const ufcNumberMatch = eventName.match(/ufc\s*(\d+)/i);
      if (ufcNumberMatch) {
        const ufcNumber = parseInt(ufcNumberMatch[1]);
        // UFC 311 is Jan 18, 2025, so anything 310 and below is past
        if (ufcNumber <= 310) {
          shouldBeStatus = 'completed';
          reason = `UFC ${ufcNumber} is a past event (before UFC 311)`;
        } else {
          shouldBeStatus = 'upcoming';
          reason = `UFC ${ufcNumber} is an upcoming event`;
        }
      } else {
        // Can't determine, skip
        console.log(`  ⚠️  Skipping ${event.name} - cannot determine status`);
        skippedCount++;
        continue;
      }
    }
    
    // Update if status is different
    if (event.status !== shouldBeStatus) {
      batch.update(doc.ref, {
        status: shouldBeStatus,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ ${event.name}`);
      console.log(`     Status: ${event.status} → ${shouldBeStatus}`);
      console.log(`     Reason: ${reason}`);
      console.log('');
      updatedCount++;
    } else {
      console.log(`  ✓ ${event.name} - already ${shouldBeStatus}`);
    }
  }
  
  if (updatedCount > 0) {
    await batch.commit();
    console.log('\n==================================================');
    console.log(`✅ Updated ${updatedCount} events`);
    console.log(`✓ ${snapshot.size - updatedCount - skippedCount} events already had correct status`);
    if (skippedCount > 0) {
      console.log(`⚠️  Skipped ${skippedCount} events (could not determine status)`);
    }
  } else {
    console.log('\n==================================================');
    console.log('✅ All events already have correct status!');
  }
  
  // Show summary
  console.log('\n📊 Final Status Summary:');
  const updatedSnapshot = await eventsRef.get();
  let upcomingCount = 0;
  let completedCount = 0;
  let otherCount = 0;
  
  updatedSnapshot.docs.forEach((doc: any) => {
    const status = doc.data().status;
    if (status === 'upcoming') upcomingCount++;
    else if (status === 'completed') completedCount++;
    else otherCount++;
  });
  
  console.log(`   • Upcoming: ${upcomingCount} events`);
  console.log(`   • Completed: ${completedCount} events`);
  if (otherCount > 0) {
    console.log(`   • Other: ${otherCount} events`);
  }
  
  console.log('\n✨ Event statuses have been fixed!\n');
}

// Add to Firestore type
const collection = (db: any, name: string) => db.collection(name);

// Main function
async function main() {
  try {
    await fixEventStatuses();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

// Run the script
main(); 