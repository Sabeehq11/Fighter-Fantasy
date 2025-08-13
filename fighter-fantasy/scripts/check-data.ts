import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const serviceAccount = process.env.FIREBASE_ADMIN_SDK_JSON;

if (!serviceAccount) {
  console.error('FIREBASE_ADMIN_SDK_JSON not found');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount))
  });
}

const db = admin.firestore();

async function checkData() {
  console.log('🔍 Checking Firestore data...\n');
  
  // Check events
  const events = await db.collection('events').get();
  console.log(`📅 Events: ${events.size} documents`);
  events.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.name} (${data.status})`);
  });
  
  // Check fighters
  const fighters = await db.collection('fighters').get();
  console.log(`\n🥊 Fighters: ${fighters.size} documents`);
  fighters.forEach(doc => {
    const data = doc.data();
    console.log(`   - ${data.name} (${data.division})`);
  });
  
  // Check fights
  const fights = await db.collection('fights').get();
  console.log(`\n⚔️  Fights: ${fights.size} documents`);
  fights.forEach(doc => {
    const data = doc.data();
    console.log(`   - Fight ${doc.id}: ${data.status}`);
  });
  
  // Check rankings
  const rankings = await db.collection('rankings').get();
  console.log(`\n🏆 Rankings: ${rankings.size} documents`);
  
  process.exit(0);
}

checkData().catch(console.error); 