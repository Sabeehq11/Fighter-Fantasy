import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../firebase-admin-key.json');
const serviceAccount = require(serviceAccountPath);

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore();

async function initializeCollections() {
  console.log('🏗️  Initializing Firestore Collections...\n');

  try {
    // 1. Initialize System Config
    console.log('📋 Setting up system configuration...');
    const configRef = db.collection('config').doc('system');
    await configRef.set({
      version: '1.0.0',
      fantasy_settings: {
        default_budget: 10000,
        default_team_size: 5,
        lock_time_minutes: 15,
        captain_multiplier: 1.5,
        ppv_multiplier: 1.5
      },
      initialized_at: new Date(),
      last_updated: new Date()
    }, { merge: true });
    console.log('✅ System config initialized');

    // 2. Check and initialize Events collection
    console.log('\n📅 Checking Events collection...');
    const eventsSnapshot = await db.collection('events').limit(1).get();
    if (eventsSnapshot.empty) {
      console.log('⚠️  Events collection is empty. Run scraping scripts to populate.');
    } else {
      console.log(`✅ Events collection exists with ${eventsSnapshot.size}+ documents`);
    }

    // 3. Check and initialize Fighters collection
    console.log('\n🥊 Checking Fighters collection...');
    const fightersSnapshot = await db.collection('fighters').limit(1).get();
    if (fightersSnapshot.empty) {
      console.log('⚠️  Fighters collection is empty. Run import scripts to populate.');
    } else {
      console.log(`✅ Fighters collection exists with ${fightersSnapshot.size}+ documents`);
    }

    // 4. Check and initialize Fights collection
    console.log('\n⚔️  Checking Fights collection...');
    const fightsSnapshot = await db.collection('fights').limit(1).get();
    if (fightsSnapshot.empty) {
      console.log('⚠️  Fights collection is empty. Run populate scripts to add fight cards.');
    } else {
      console.log(`✅ Fights collection exists with ${fightsSnapshot.size}+ documents`);
    }

    // 5. Initialize Leagues collection structure
    console.log('\n🏆 Setting up Leagues collection...');
    // Check if any leagues exist
    const leaguesSnapshot = await db.collection('leagues').limit(1).get();
    if (leaguesSnapshot.empty) {
      // Create a sample global league for testing
      const sampleLeagueRef = db.collection('leagues').doc('league_global_sample');
      await sampleLeagueRef.set({
        id: 'league_global_sample',
        name: 'Sample Global Championship',
        type: 'global',
        mode: 'weekly',
        event_id: 'sample_event',
        settings: {
          budget: 10000,
          team_size: 5,
          max_from_same_fight: 1,
          lock_time_minutes_before: 15,
          allow_captain: true,
          captain_multiplier: 1.5,
          apply_ppv_multiplier: false,
          ppv_multiplier: 1.5
        },
        scoring_system: 'standard',
        total_entries: 0,
        max_entries: null,
        entry_fee: 0,
        prize_pool: 0,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Created sample league for testing');
    } else {
      console.log(`✅ Leagues collection exists with ${leaguesSnapshot.size}+ documents`);
    }

    // 6. Initialize Salaries collection structure
    console.log('\n💰 Setting up Salaries collection...');
    const salariesSnapshot = await db.collection('salaries').limit(1).get();
    if (salariesSnapshot.empty) {
      console.log('⚠️  Salaries collection is empty. Run recalculate-salaries.ts to populate.');
    } else {
      console.log(`✅ Salaries collection exists with ${salariesSnapshot.size}+ documents`);
    }

    // 7. Initialize Teams collection structure
    console.log('\n👥 Setting up Teams collection...');
    const teamsSnapshot = await db.collection('teams').limit(1).get();
    if (teamsSnapshot.empty) {
      console.log('✅ Teams collection ready (empty - will be populated by users)');
    } else {
      console.log(`✅ Teams collection exists with ${teamsSnapshot.size}+ documents`);
    }

    // 8. Initialize Rankings collection
    console.log('\n🥇 Checking Rankings collection...');
    const rankingsSnapshot = await db.collection('rankings').limit(1).get();
    if (rankingsSnapshot.empty) {
      console.log('⚠️  Rankings collection is empty. Run scraping scripts to populate.');
    } else {
      console.log(`✅ Rankings collection exists with ${rankingsSnapshot.size}+ documents`);
    }

    // 9. Create composite indexes (these need to be created in Firebase Console)
    console.log('\n📊 Required Composite Indexes (create in Firebase Console):');
    console.log('1. events: status ASC, date_utc DESC');
    console.log('2. fights: event_id ASC, bout_order ASC');
    console.log('3. teams: event_id ASC, total_points DESC');
    console.log('4. teams: user_id ASC, created_at DESC');
    console.log('5. salaries: event_id ASC');
    console.log('6. leagues: event_id ASC, status ASC');

    // 10. Check fantasy_teams collection (legacy)
    console.log('\n🔍 Checking for legacy collections...');
    const fantasyTeamsSnapshot = await db.collection('fantasy_teams').limit(1).get();
    if (!fantasyTeamsSnapshot.empty) {
      console.log('⚠️  Found legacy fantasy_teams collection. Consider migrating to teams collection.');
    }

    console.log('\n✨ Collection initialization complete!\n');
    console.log('Next steps:');
    console.log('1. Run "npm run ts-node scripts/import-fighter-csvs.ts" to import fighters');
    console.log('2. Run "npm run ts-node scripts/scrape-recent-events.ts" to get events');
    console.log('3. Run "npm run ts-node scripts/populate-fight-cards.ts" to add fights');
    console.log('4. Run "npm run ts-node scripts/recalculate-salaries.ts" to generate salaries');
    console.log('5. Deploy Firestore rules: "firebase deploy --only firestore:rules"');

  } catch (error) {
    console.error('❌ Error initializing collections:', error);
  }
}

// Run the script
initializeCollections().then(() => {
  console.log('\n👋 Done!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 