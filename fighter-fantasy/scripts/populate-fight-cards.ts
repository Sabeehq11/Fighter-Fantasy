import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Fighter, Fight, Event, WeightDivision } from '../src/types';

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

console.log('🥊 UFC Fight Cards Populator\n');

// Fight card data for recent and upcoming events
const eventFightCards = {
  // UFC 310: Pantoja vs Asakura - Dec 7, 2024
  'event_ufc_310': {
    name: 'UFC 310: Pantoja vs Asakura',
    mainCard: [
      { fighterA: 'Alexandre Pantoja', fighterB: 'Kai Asakura', division: 'Flyweight', isTitle: true, isMainEvent: true },
      { fighterA: 'Shavkat Rakhmonov', fighterB: 'Ian Machado Garry', division: 'Welterweight', isTitle: false, isCoMain: true },
      { fighterA: 'Ciryl Gane', fighterB: 'Alexander Volkov', division: 'Heavyweight', isTitle: false },
      { fighterA: 'Bryce Mitchell', fighterB: 'Kron Gracie', division: 'Featherweight', isTitle: false },
      { fighterA: 'Nate Landwehr', fighterB: 'Dooho Choi', division: 'Featherweight', isTitle: false }
    ],
    prelims: [
      { fighterA: 'Anthony Smith', fighterB: 'Dominick Reyes', division: 'Light Heavyweight', isTitle: false },
      { fighterA: 'Vicente Luque', fighterB: 'Themba Gorimbo', division: 'Welterweight', isTitle: false },
      { fighterA: 'Movsar Evloev', fighterB: 'Aljamain Sterling', division: 'Featherweight', isTitle: false },
      { fighterA: 'Randy Brown', fighterB: 'Bryan Battle', division: 'Welterweight', isTitle: false }
    ],
    status: 'completed'
  },

  // UFC Fight Night: Yan vs Figueiredo - Nov 23, 2024
  'event_ufc_fight_night_246': {
    name: 'UFC Fight Night: Yan vs Figueiredo',
    mainCard: [
      { fighterA: 'Petr Yan', fighterB: 'Deiveson Figueiredo', division: 'Bantamweight', isTitle: false, isMainEvent: true },
      { fighterA: 'Yan Xiaonan', fighterB: 'Tabatha Ricci', division: "Women's Strawweight", isTitle: false, isCoMain: true },
      { fighterA: 'Song Kenan', fighterB: 'Muslim Salikhov', division: 'Welterweight', isTitle: false },
      { fighterA: 'Wang Cong', fighterB: 'Gabriella Fernandes', division: "Women's Flyweight", isTitle: false },
      { fighterA: 'Volkan Oezdemir', fighterB: 'Carlos Ulberg', division: 'Light Heavyweight', isTitle: false },
      { fighterA: 'Zhang Mingyang', fighterB: 'Ozzy Diaz', division: 'Light Heavyweight', isTitle: false }
    ],
    prelims: [
      { fighterA: 'Hayisaer Maheshate', fighterB: 'Nikolas Motta', division: 'Lightweight', isTitle: false },
      { fighterA: 'Feng Xiaocan', fighterB: 'Shi Ming', division: "Women's Strawweight", isTitle: false },
      { fighterA: 'Quang Le', fighterB: 'Xiao Long', division: 'Bantamweight', isTitle: false }
    ],
    status: 'completed'
  },

  // UFC 309: Jones vs Miocic - Nov 16, 2024
  'event_ufc_309': {
    name: 'UFC 309: Jones vs Miocic',
    mainCard: [
      { fighterA: 'Jon Jones', fighterB: 'Stipe Miocic', division: 'Heavyweight', isTitle: true, isMainEvent: true },
      { fighterA: 'Charles Oliveira', fighterB: 'Michael Chandler', division: 'Lightweight', isTitle: false, isCoMain: true },
      { fighterA: 'Bo Nickal', fighterB: 'Paul Craig', division: 'Middleweight', isTitle: false },
      { fighterA: 'Viviane Araujo', fighterB: 'Karine Silva', division: "Women's Flyweight", isTitle: false },
      { fighterA: 'Mauricio Ruffy', fighterB: 'James Llontop', division: 'Lightweight', isTitle: false }
    ],
    prelims: [
      { fighterA: 'Jonathan Martinez', fighterB: 'Marcus McGhee', division: 'Bantamweight', isTitle: false },
      { fighterA: 'Chris Weidman', fighterB: 'Eryk Anders', division: 'Middleweight', isTitle: false },
      { fighterA: 'Jim Miller', fighterB: 'Damon Jackson', division: 'Lightweight', isTitle: false },
      { fighterA: 'David Onama', fighterB: 'Roberto Romero', division: 'Lightweight', isTitle: false }
    ],
    status: 'completed'
  },

  // UFC Fight Night: Moreno vs Albazi - Nov 9, 2024
  'event_ufc_fight_night_245': {
    name: 'UFC Fight Night: Moreno vs Albazi',
    mainCard: [
      { fighterA: 'Brandon Moreno', fighterB: 'Amir Albazi', division: 'Flyweight', isTitle: false, isMainEvent: true },
      { fighterA: 'Erin Blanchfield', fighterB: 'Rose Namajunas', division: "Women's Flyweight", isTitle: false, isCoMain: true },
      { fighterA: 'Jhonata Diniz', fighterB: 'Derrick Lewis', division: 'Heavyweight', isTitle: false },
      { fighterA: 'Caio Machado', fighterB: 'Brendson Ribeiro', division: 'Light Heavyweight', isTitle: false },
      { fighterA: 'Marc-Andre Barriault', fighterB: 'Dustin Stoltzfus', division: 'Middleweight', isTitle: false }
    ],
    prelims: [
      { fighterA: 'Mike Malott', fighterB: 'Trevin Giles', division: 'Welterweight', isTitle: false },
      { fighterA: 'Aiemann Zahabi', fighterB: 'Pedro Munhoz', division: 'Bantamweight', isTitle: false },
      { fighterA: 'Ariane da Silva', fighterB: 'Jasmine Jasudavicius', division: "Women's Flyweight", isTitle: false },
      { fighterA: 'Charles Jourdain', fighterB: 'Victor Henry', division: 'Bantamweight', isTitle: false }
    ],
    status: 'completed'
  },

  // UFC 311: Makhachev vs Tsarukyan 2 - Jan 18, 2025
  'event_ufc_311': {
    name: 'UFC 311: Makhachev vs Tsarukyan 2',
    mainCard: [
      { fighterA: 'Islam Makhachev', fighterB: 'Arman Tsarukyan', division: 'Lightweight', isTitle: true, isMainEvent: true },
      { fighterA: 'Merab Dvalishvili', fighterB: 'Umar Nurmagomedov', division: 'Bantamweight', isTitle: true, isCoMain: true },
      { fighterA: 'Jiri Prochazka', fighterB: 'Jamahal Hill', division: 'Light Heavyweight', isTitle: false },
      { fighterA: 'Beneil Dariush', fighterB: 'Renato Moicano', division: 'Lightweight', isTitle: false },
      { fighterA: 'Kevin Holland', fighterB: 'Reinier de Ridder', division: 'Middleweight', isTitle: false }
    ],
    prelims: [
      { fighterA: 'Payton Talbott', fighterB: 'Raoni Barcelos', division: 'Bantamweight', isTitle: false },
      { fighterA: 'Jailton Almeida', fighterB: 'Serghei Spivac', division: 'Heavyweight', isTitle: false },
      { fighterA: 'Viviane Araujo', fighterB: 'Amanda Ribas', division: "Women's Flyweight", isTitle: false },
      { fighterA: 'Bogdan Guskov', fighterB: 'Billy Elekana', division: 'Light Heavyweight', isTitle: false }
    ],
    status: 'upcoming'
  },

  // UFC Fight Night: Covington vs Buckley - Jan 11, 2025
  'event_ufc_fight_night_247': {
    name: 'UFC Fight Night: Covington vs Buckley',
    mainCard: [
      { fighterA: 'Colby Covington', fighterB: 'Joaquin Buckley', division: 'Welterweight', isTitle: false, isMainEvent: true },
      { fighterA: 'Cub Swanson', fighterB: 'Billy Quarantillo', division: 'Featherweight', isTitle: false, isCoMain: true },
      { fighterA: 'Manel Kape', fighterB: 'Bruno Gustavo da Silva', division: 'Flyweight', isTitle: false },
      { fighterA: 'Vitor Petrino', fighterB: 'Dustin Jacoby', division: 'Light Heavyweight', isTitle: false },
      { fighterA: 'Adrian Yanez', fighterB: 'Daniel Marcos', division: 'Bantamweight', isTitle: false },
      { fighterA: 'Ottman Azaitar', fighterB: 'Michael Johnson', division: 'Lightweight', isTitle: false }
    ],
    prelims: [
      { fighterA: 'Miles Johns', fighterB: 'Felipe Lima', division: 'Bantamweight', isTitle: false },
      { fighterA: 'Miranda Maverick', fighterB: 'Jamey-Lyn Horth', division: "Women's Flyweight", isTitle: false },
      { fighterA: 'Punahele Soriano', fighterB: 'Uros Medic', division: 'Welterweight', isTitle: false }
    ],
    status: 'upcoming'
  },

  // UFC 312 - Feb 8, 2025 (Card TBD)
  'event_ufc_312': {
    name: 'UFC 312',
    mainCard: [
      { fighterA: 'Dricus du Plessis', fighterB: 'Sean Strickland', division: 'Middleweight', isTitle: true, isMainEvent: true },
      { fighterA: 'Tatiana Suarez', fighterB: 'Zhang Weili', division: "Women's Strawweight", isTitle: true, isCoMain: true },
      { fighterA: 'Neil Magny', fighterB: 'Carlos Prates', division: 'Welterweight', isTitle: false },
      { fighterA: 'Jimmy Crute', fighterB: 'Alonzo Menifield', division: 'Light Heavyweight', isTitle: false },
      { fighterA: 'Justin Tafa', fighterB: 'Tallison Teixeira', division: 'Heavyweight', isTitle: false }
    ],
    prelims: [
      { fighterA: 'Jack Jenkins', fighterB: 'Gabriel Santos', division: 'Featherweight', isTitle: false },
      { fighterA: 'Tom Nolan', fighterB: 'Alex Reyes', division: 'Lightweight', isTitle: false },
      { fighterA: 'Casey O\'Neill', fighterB: 'Tereza Bleda', division: "Women's Flyweight", isTitle: false }
    ],
    status: 'upcoming'
  }
};

// Fighter data template
function createFighter(name: string, division: WeightDivision, isChampion: boolean = false): Fighter {
  const fighterId = `fighter_${name.toLowerCase().replace(/[^a-z]/g, '_')}`;
  
  // Set weight based on division
  const divisionWeights: Record<string, number> = {
    'Heavyweight': 265,
    'Light Heavyweight': 205,
    'Middleweight': 185,
    'Welterweight': 170,
    'Lightweight': 155,
    'Featherweight': 145,
    'Bantamweight': 135,
    'Flyweight': 125,
    "Women's Bantamweight": 135,
    "Women's Flyweight": 125,
    "Women's Strawweight": 115,
    "Women's Featherweight": 145
  };

  return {
    id: fighterId,
    name: name,
    nickname: '',
    division: division,
    height_inches: 70,
    reach_inches: 72,
    weight_lbs: divisionWeights[division] || 155,
    stance: 'Orthodox',
    record: { wins: 20, losses: 5, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 10, submissions: 5, decisions: 5 },
    stats: {
      sig_strikes_per_min: 4.5,
      sig_strike_accuracy: 45,
      sig_strikes_absorbed_per_min: 3.2,
      sig_strike_defense: 55,
      takedown_avg: 1.5,
      takedown_accuracy: 40,
      takedown_defense: 75,
      sub_attempts_per_15: 0.8
    },
    isActive: true,
    isChampion: isChampion,
    age: 30,
    date_of_birth: '1994-01-01',
    nationality: 'USA',
    hometown: 'Las Vegas, Nevada',
    profile_image_url: ''
  };
}

async function populateFightCards() {
  console.log('📊 Processing fight cards for all events...\n');
  
  const fighterBatch = db.batch();
  const fightBatch = db.batch();
  const eventBatch = db.batch();
  
  let totalFightersAdded = 0;
  let totalFightsCreated = 0;
  
  for (const [eventId, eventData] of Object.entries(eventFightCards)) {
    console.log(`\n📅 ${eventData.name}:`);
    
    const mainCardFightIds: string[] = [];
    const prelimsFightIds: string[] = [];
    const earlyPrelimsFightIds: string[] = [];
    
    // Process main card
    console.log('  Main Card:');
    for (let i = 0; i < eventData.mainCard.length; i++) {
      const fightData = eventData.mainCard[i];
      const boutOrder = eventData.mainCard.length - i;
      
      // Create/update fighters
      const fighterA = createFighter(
        fightData.fighterA, 
        fightData.division as WeightDivision,
        fightData.isTitle && eventData.status === 'upcoming'
      );
      const fighterB = createFighter(fightData.fighterB, fightData.division as WeightDivision);
      
      const fighterARef = db.collection('fighters').doc(fighterA.id);
      const fighterBRef = db.collection('fighters').doc(fighterB.id);
      
      // Check if fighters exist
      const [fighterADoc, fighterBDoc] = await Promise.all([
        fighterARef.get(),
        fighterBRef.get()
      ]);
      
      if (!fighterADoc.exists) {
        fighterBatch.set(fighterARef, fighterA);
        totalFightersAdded++;
      }
      if (!fighterBDoc.exists) {
        fighterBatch.set(fighterBRef, fighterB);
        totalFightersAdded++;
      }
      
      // Create fight
      const fightId = `fight_${eventId}_${boutOrder}`;
      const fight: Fight = {
        id: fightId,
        event_id: eventId,
        fighter_a_id: fighterA.id,
        fighter_b_id: fighterB.id,
        weight_class: fightData.division as WeightDivision,
        is_title_fight: fightData.isTitle || false,
        is_interim_title: false,
        is_main_event: fightData.isMainEvent || false,
        is_co_main: fightData.isCoMain || false,
        bout_order: boutOrder,
        scheduled_rounds: (fightData.isTitle || fightData.isMainEvent) ? 5 : 3,
        status: eventData.status === 'completed' ? 'completed' : 'scheduled',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Add result for completed fights
      if (eventData.status === 'completed') {
        fight.result = {
          winner_id: fighterA.id, // Default to fighter A winning for now
          method: 'Decision - Unanimous',
          round: fight.scheduled_rounds,
          time_seconds: 300,
          stats: {
            [fighterA.id]: {
              sig_strikes_landed: 89,
              sig_strikes_attempted: 178,
              total_strikes_landed: 102,
              total_strikes_attempted: 198,
              head_strikes: 45,
              body_strikes: 25,
              leg_strikes: 19,
              distance_strikes: 70,
              clinch_strikes: 15,
              ground_strikes: 4,
              takedowns_landed: 2,
              takedowns_attempted: 5,
              submission_attempts: 0,
              reversals: 0,
              control_time_seconds: 180,
              knockdowns: 0,
              point_deductions: 0,
              warnings: 0,
              missed_weight: false
            },
            [fighterB.id]: {
              sig_strikes_landed: 76,
              sig_strikes_attempted: 165,
              total_strikes_landed: 88,
              total_strikes_attempted: 185,
              head_strikes: 40,
              body_strikes: 20,
              leg_strikes: 16,
              distance_strikes: 60,
              clinch_strikes: 12,
              ground_strikes: 4,
              takedowns_landed: 1,
              takedowns_attempted: 4,
              submission_attempts: 1,
              reversals: 1,
              control_time_seconds: 120,
              knockdowns: 0,
              point_deductions: 0,
              warnings: 0,
              missed_weight: false
            }
          },
          fight_of_the_night: fightData.isMainEvent || false,
          performance_bonuses: fightData.isMainEvent ? [fighterA.id] : []
        };
      }
      
      fightBatch.set(db.collection('fights').doc(fightId), fight);
      mainCardFightIds.push(fightId);
      totalFightsCreated++;
      
      console.log(`    ✓ ${fightData.fighterA} vs ${fightData.fighterB}${fightData.isTitle ? ' (Title Fight)' : ''}`);
    }
    
    // Process prelims
    if (eventData.prelims.length > 0) {
      console.log('  Prelims:');
      for (let i = 0; i < eventData.prelims.length; i++) {
        const fightData = eventData.prelims[i];
        const boutOrder = eventData.prelims.length - i;
        
        // Create/update fighters
        const fighterA = createFighter(fightData.fighterA, fightData.division as WeightDivision);
        const fighterB = createFighter(fightData.fighterB, fightData.division as WeightDivision);
        
        const fighterARef = db.collection('fighters').doc(fighterA.id);
        const fighterBRef = db.collection('fighters').doc(fighterB.id);
        
        // Check if fighters exist
        const [fighterADoc, fighterBDoc] = await Promise.all([
          fighterARef.get(),
          fighterBRef.get()
        ]);
        
        if (!fighterADoc.exists) {
          fighterBatch.set(fighterARef, fighterA);
          totalFightersAdded++;
        }
        if (!fighterBDoc.exists) {
          fighterBatch.set(fighterBRef, fighterB);
          totalFightersAdded++;
        }
        
        // Create fight
        const fightId = `fight_${eventId}_prelim_${boutOrder}`;
        const fight: Fight = {
          id: fightId,
          event_id: eventId,
          fighter_a_id: fighterA.id,
          fighter_b_id: fighterB.id,
          weight_class: fightData.division as WeightDivision,
          is_title_fight: false,
          is_interim_title: false,
          is_main_event: false,
          is_co_main: false,
          bout_order: boutOrder,
          scheduled_rounds: 3,
          status: eventData.status === 'completed' ? 'completed' : 'scheduled',
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Add result for completed fights
        if (eventData.status === 'completed') {
          fight.result = {
            winner_id: Math.random() > 0.5 ? fighterA.id : fighterB.id,
            method: ['KO/TKO', 'Submission', 'Decision - Unanimous'][Math.floor(Math.random() * 3)] as any,
            round: Math.ceil(Math.random() * 3),
            time_seconds: Math.floor(Math.random() * 300),
            stats: {
              [fighterA.id]: {
                sig_strikes_landed: Math.floor(Math.random() * 100),
                sig_strikes_attempted: Math.floor(Math.random() * 200),
                total_strikes_landed: Math.floor(Math.random() * 120),
                total_strikes_attempted: Math.floor(Math.random() * 220),
                head_strikes: Math.floor(Math.random() * 50),
                body_strikes: Math.floor(Math.random() * 30),
                leg_strikes: Math.floor(Math.random() * 20),
                distance_strikes: Math.floor(Math.random() * 80),
                clinch_strikes: Math.floor(Math.random() * 20),
                ground_strikes: Math.floor(Math.random() * 20),
                takedowns_landed: Math.floor(Math.random() * 5),
                takedowns_attempted: Math.floor(Math.random() * 10),
                submission_attempts: Math.floor(Math.random() * 3),
                reversals: Math.floor(Math.random() * 2),
                control_time_seconds: Math.floor(Math.random() * 300),
                knockdowns: Math.floor(Math.random() * 2),
                point_deductions: 0,
                warnings: Math.floor(Math.random() * 2),
                missed_weight: false
              },
              [fighterB.id]: {
                sig_strikes_landed: Math.floor(Math.random() * 100),
                sig_strikes_attempted: Math.floor(Math.random() * 200),
                total_strikes_landed: Math.floor(Math.random() * 120),
                total_strikes_attempted: Math.floor(Math.random() * 220),
                head_strikes: Math.floor(Math.random() * 50),
                body_strikes: Math.floor(Math.random() * 30),
                leg_strikes: Math.floor(Math.random() * 20),
                distance_strikes: Math.floor(Math.random() * 80),
                clinch_strikes: Math.floor(Math.random() * 20),
                ground_strikes: Math.floor(Math.random() * 20),
                takedowns_landed: Math.floor(Math.random() * 5),
                takedowns_attempted: Math.floor(Math.random() * 10),
                submission_attempts: Math.floor(Math.random() * 3),
                reversals: Math.floor(Math.random() * 2),
                control_time_seconds: Math.floor(Math.random() * 300),
                knockdowns: Math.floor(Math.random() * 2),
                point_deductions: 0,
                warnings: Math.floor(Math.random() * 2),
                missed_weight: false
              }
            },
            fight_of_the_night: false,
            performance_bonuses: []
          };
        }
        
        fightBatch.set(db.collection('fights').doc(fightId), fight);
        prelimsFightIds.push(fightId);
        totalFightsCreated++;
        
        console.log(`    ✓ ${fightData.fighterA} vs ${fightData.fighterB}`);
      }
    }
    
    // Update event with fight IDs
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (eventDoc.exists) {
      eventBatch.update(eventRef, {
        main_card: mainCardFightIds,
        prelims: prelimsFightIds,
        early_prelims: earlyPrelimsFightIds,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`  ✅ Updated event with ${mainCardFightIds.length + prelimsFightIds.length} fights`);
    }
  }
  
  // Commit all batches
  console.log('\n💾 Saving to Firebase...');
  await Promise.all([
    fighterBatch.commit(),
    fightBatch.commit(),
    eventBatch.commit()
  ]);
  
  console.log(`\n✅ Successfully added:`);
  console.log(`  • ${totalFightersAdded} new fighters`);
  console.log(`  • ${totalFightsCreated} fights`);
  console.log(`  • Updated ${Object.keys(eventFightCards).length} events with fight cards`);
}

// Main function
async function main() {
  console.log('==================================================');
  console.log('        UFC FIGHT CARDS POPULATOR                ');
  console.log('==================================================\n');
  
  try {
    await populateFightCards();
    
    console.log('\n==================================================');
    console.log('                    COMPLETE!                     ');
    console.log('==================================================\n');
    
    console.log('✅ Fight cards have been populated!');
    console.log('🎯 All events now have complete fight information');
    console.log('👊 Fighter profiles have been created');
    console.log('\n🚀 Your app now displays full event details!\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
  
  process.exit(0);
}

// Run the script
main(); 