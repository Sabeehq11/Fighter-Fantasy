import * as admin from 'firebase-admin';
import { Fighter, Event, Fight, DivisionRankings } from '../src/types';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Firebase Admin
const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;

if (!serviceAccountJson) {
  console.error('FIREBASE_ADMIN_SDK_JSON environment variable is not set');
  console.log('Please set up your Firebase credentials in .env');
  process.exit(1);
}

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
    });
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

// Seed Data
const fighters: Fighter[] = [
  {
    id: "fighter_makhachev_islam",
    name: "Islam Makhachev",
    nickname: "The Dagestani Destroyer",
    division: "Lightweight",
    height_inches: 70,
    reach_inches: 70.5,
    weight_lbs: 155,
    stance: "Orthodox",
    record: { wins: 25, losses: 1, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 5, submissions: 12, decisions: 8 },
    stats: {
      sig_strikes_per_min: 2.89,
      sig_strike_accuracy: 59,
      sig_strikes_absorbed_per_min: 1.67,
      sig_strike_defense: 65,
      takedown_avg: 3.42,
      takedown_accuracy: 64,
      takedown_defense: 87,
      sub_attempts_per_15: 1.9
    },
    isActive: true,
    isChampion: true,
    age: 32,
    date_of_birth: "1991-09-27",
    nationality: "RU",
    hometown: "Makhachkala, Dagestan, Russia",
    gym: "American Kickboxing Academy",
    ufc_debut_date: "2015-05-23",
    profile_image_url: "/images/fighters/makhachev.jpg",
    last_fight_date: "2024-06-01"
  },
  {
    id: "fighter_jones_jon",
    name: "Jon Jones",
    nickname: "Bones",
    division: "Heavyweight",
    secondaryDivision: "Light Heavyweight",
    height_inches: 76,
    reach_inches: 84.5,
    weight_lbs: 248,
    stance: "Orthodox",
    record: { wins: 27, losses: 1, draws: 0, no_contests: 1 },
    finishes: { ko_tko: 10, submissions: 7, decisions: 10 },
    stats: {
      sig_strikes_per_min: 4.29,
      sig_strike_accuracy: 57,
      sig_strikes_absorbed_per_min: 2.08,
      sig_strike_defense: 64,
      takedown_avg: 1.93,
      takedown_accuracy: 44,
      takedown_defense: 95,
      sub_attempts_per_15: 0.5
    },
    isActive: true,
    isChampion: true,
    p4p_ranking: 2,
    age: 36,
    date_of_birth: "1987-07-19",
    nationality: "US",
    hometown: "Rochester, New York, USA",
    gym: "Jackson Wink MMA",
    ufc_debut_date: "2008-08-09",
    profile_image_url: "/images/fighters/jones.jpg",
    last_fight_date: "2023-03-04"
  },
  {
    id: "fighter_oliveira_charles",
    name: "Charles Oliveira",
    nickname: "Do Bronx",
    division: "Lightweight",
    height_inches: 70,
    reach_inches: 74,
    weight_lbs: 155,
    stance: "Orthodox",
    record: { wins: 34, losses: 10, draws: 0, no_contests: 1 },
    finishes: { ko_tko: 10, submissions: 21, decisions: 3 },
    stats: {
      sig_strikes_per_min: 3.29,
      sig_strike_accuracy: 49,
      sig_strikes_absorbed_per_min: 3.12,
      sig_strike_defense: 53,
      takedown_avg: 2.31,
      takedown_accuracy: 42,
      takedown_defense: 58,
      sub_attempts_per_15: 3.2
    },
    isActive: true,
    isChampion: false,
    ranking: 2,
    age: 34,
    date_of_birth: "1989-10-17",
    nationality: "BR",
    hometown: "São Paulo, Brazil",
    gym: "Chute Boxe Diego Lima",
    ufc_debut_date: "2010-08-01",
    profile_image_url: "/images/fighters/oliveira.jpg",
    last_fight_date: "2024-04-13"
  }
];

const events: Event[] = [
  {
    id: "ufc_310",
    name: "UFC 310: Pantoja vs Asakura",
    type: "PPV",
    date_utc: "2024-12-07T03:00:00Z",
    venue: {
      name: "T-Mobile Arena",
      city: "Las Vegas",
      state: "Nevada",
      country: "USA",
      timezone: "America/Los_Angeles"
    },
    broadcast: {
      prelims_time_utc: "2024-12-07T01:00:00Z",
      main_card_time_utc: "2024-12-07T03:00:00Z",
      early_prelims_time_utc: "2024-12-06T23:00:00Z",
      networks: ["ESPN+", "PPV"]
    },
    main_card: ["fight_310_1", "fight_310_2", "fight_310_3"],
    prelims: ["fight_310_4", "fight_310_5"],
    early_prelims: [],
    status: "upcoming",
    poster_url: "/images/events/ufc_310_poster.jpg"
  },
  {
    id: "ufc_309",
    name: "UFC 309: Jones vs Miocic",
    type: "PPV",
    date_utc: "2024-11-16T03:00:00Z",
    venue: {
      name: "Madison Square Garden",
      city: "New York",
      state: "New York",
      country: "USA",
      timezone: "America/New_York"
    },
    broadcast: {
      prelims_time_utc: "2024-11-16T01:00:00Z",
      main_card_time_utc: "2024-11-16T03:00:00Z",
      early_prelims_time_utc: "2024-11-15T23:00:00Z",
      networks: ["ESPN+", "PPV"]
    },
    main_card: ["fight_309_1", "fight_309_2"],
    prelims: ["fight_309_3"],
    early_prelims: [],
    status: "completed",
    poster_url: "/images/events/ufc_309_poster.jpg"
  }
];

const fights: Fight[] = [
  {
    id: "fight_310_1",
    event_id: "ufc_310",
    fighter_a_id: "fighter_makhachev_islam",
    fighter_b_id: "fighter_oliveira_charles",
    weight_class: "Lightweight",
    is_title_fight: true,
    is_interim_title: false,
    is_main_event: true,
    is_co_main: false,
    bout_order: 5,
    scheduled_rounds: 5,
    odds: {
      fighter_a: -280,
      fighter_b: 230,
      over_under: 3.5
    },
    status: "scheduled"
  },
  {
    id: "fight_309_1",
    event_id: "ufc_309",
    fighter_a_id: "fighter_jones_jon",
    fighter_b_id: "fighter_oliveira_charles", // Placeholder for now
    weight_class: "Heavyweight",
    is_title_fight: true,
    is_interim_title: false,
    is_main_event: true,
    is_co_main: false,
    bout_order: 5,
    scheduled_rounds: 5,
    result: {
      winner_id: "fighter_jones_jon",
      method: "KO/TKO",
      round: 3,
      time_seconds: 267,
      stats: {
        "fighter_jones_jon": {
          total_strikes_landed: 78,
          total_strikes_attempted: 142,
          sig_strikes_landed: 72,
          sig_strikes_attempted: 124,
          head_strikes: 45,
          body_strikes: 18,
          leg_strikes: 9,
          distance_strikes: 58,
          clinch_strikes: 8,
          ground_strikes: 6,
          takedowns_landed: 1,
          takedowns_attempted: 3,
          submission_attempts: 0,
          reversals: 0,
          control_time_seconds: 89,
          knockdowns: 1,
          point_deductions: 0,
          warnings: 0,
          missed_weight: false
        },
        "fighter_oliveira_charles": {
          total_strikes_landed: 42,
          total_strikes_attempted: 98,
          sig_strikes_landed: 34,
          sig_strikes_attempted: 78,
          head_strikes: 22,
          body_strikes: 8,
          leg_strikes: 4,
          distance_strikes: 30,
          clinch_strikes: 3,
          ground_strikes: 1,
          takedowns_landed: 0,
          takedowns_attempted: 2,
          submission_attempts: 0,
          reversals: 0,
          control_time_seconds: 12,
          knockdowns: 0,
          point_deductions: 0,
          warnings: 0,
          missed_weight: false
        }
      },
      fight_of_the_night: false,
      performance_bonuses: ["fighter_jones_jon"]
    },
    status: "completed"
  }
];

const lightweightRankings: any = {
  id: "rankings_lightweight",
  division: "Lightweight",
  champion_id: "fighter_makhachev_islam",
  // interim_champion_id: null, // Omit if no interim champion
  rankings: [
    { rank: 1, fighter_id: "fighter_oliveira_charles", previous_rank: 2, weeks_at_rank: 2 },
    // Add more ranked fighters as needed
  ],
  last_updated: new Date().toISOString(),
  next_update: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
};

// Seed Function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');
    
    // Seed Fighters
    console.log('Adding fighters...');
    const fighterBatch = db.batch();
    for (const fighter of fighters) {
      const ref = db.collection('fighters').doc(fighter.id);
      fighterBatch.set(ref, {
        ...fighter,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    await fighterBatch.commit();
    console.log(`✅ Added ${fighters.length} fighters`);

    // Seed Events
    console.log('Adding events...');
    const eventBatch = db.batch();
    for (const event of events) {
      const ref = db.collection('events').doc(event.id);
      eventBatch.set(ref, {
        ...event,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    await eventBatch.commit();
    console.log(`✅ Added ${events.length} events`);

    // Seed Fights
    console.log('Adding fights...');
    const fightBatch = db.batch();
    for (const fight of fights) {
      const ref = db.collection('fights').doc(fight.id);
      fightBatch.set(ref, {
        ...fight,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    await fightBatch.commit();
    console.log(`✅ Added ${fights.length} fights`);

    // Seed Rankings
    console.log('Adding rankings...');
    const rankingsRef = db.collection('rankings').doc('divisions').collection('lightweight');
    await rankingsRef.doc(lightweightRankings.id).set(lightweightRankings);
    console.log('✅ Added division rankings');

    console.log('🎉 Database seeding complete!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    
    if (error?.code === 5 || error?.details?.includes('NOT_FOUND')) {
      console.log('\n📝 Possible issues:');
      console.log('1. Firestore might not be enabled in your Firebase project');
      console.log('   → Go to Firebase Console > Build > Firestore Database');
      console.log('   → Click "Create database"');
      console.log('   → Choose "Start in test mode" for now');
      console.log('   → Select a location closest to you');
      console.log('\n2. The project ID might be incorrect');
      console.log('   → Check that your service account JSON matches your project');
      console.log('\n3. Firestore API might not be enabled');
      console.log('   → Go to Google Cloud Console > APIs & Services');
      console.log('   → Enable "Cloud Firestore API"');
    }
    process.exit(1);
  }
}

// Run the seed
seedDatabase(); 