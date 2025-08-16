import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Firebase Admin
const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;

if (!serviceAccountJson) {
  console.error('FIREBASE_ADMIN_SDK_JSON environment variable is not set');
  process.exit(1);
}

if (!getApps().length) {
  try {
    initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) });
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    process.exit(1);
  }
}

const db = getFirestore();

async function setTestSalaries() {
  try {
    console.log('Updating all fighter salaries to $1 for test event...');

    const snapshot = await db.collection('fighter_salaries')
      .where('event_id', '==', 'ufc_test_event_2025')
      .get();

    if (snapshot.empty) {
      console.log('No salaries found for test event.');
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { salary: 1 });
    });

    await batch.commit();
    console.log(`✅ Updated ${snapshot.size} salary documents to $1`);
  } catch (error) {
    console.error('❌ Error updating salaries:', error);
    process.exit(1);
  }
}

setTestSalaries().then(() => {
  console.log('✅ Done');
  process.exit(0);
}).catch(err => {
  console.error('❌ Failed:', err);
  process.exit(1);
}); 