import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

interface Fighter {
  id: string;
  name: string;
  division: string;
  ranking?: number;
  isChampion?: boolean;
  wins: number;
  losses: number;
  draws: number;
}

interface Fight {
  id: string;
  event_id: string;
  fighter_a_id: string;
  fighter_b_id: string;
  fighter_a_odds?: number;
  fighter_b_odds?: number;
}

interface FighterSalary {
  id: string;
  event_id: string;
  fighter_id: string;
  salary: number;
  factors: any;
  created_at: any;
  updated_at: any;
}

function calculateFighterSalary(
  fighter: Fighter, 
  fight: Fight
): { amount: number; factors: any } {
  let baseScore = 1000;
  const factors = {
    ranking_score: 50,
    odds_score: 50,
    recent_form_score: 50,
    popularity_score: 50
  };
  
  // Ranking factor
  if (fighter.isChampion) {
    factors.ranking_score = 100;
    baseScore += 800;
  } else if (fighter.ranking && fighter.ranking <= 5) {
    factors.ranking_score = 90;
    baseScore += 600;
  } else if (fighter.ranking && fighter.ranking <= 10) {
    factors.ranking_score = 75;
    baseScore += 400;
  } else if (fighter.ranking && fighter.ranking <= 15) {
    factors.ranking_score = 60;
    baseScore += 200;
  }
  
  // Odds factor (if available)
  const isUnderdog = fight.fighter_a_id === fighter.id 
    ? (fight.fighter_a_odds || 0) > (fight.fighter_b_odds || 0)
    : (fight.fighter_b_odds || 0) > (fight.fighter_a_odds || 0);
    
  if (isUnderdog) {
    factors.odds_score = 30;
    baseScore -= 200;
  } else {
    factors.odds_score = 70;
    baseScore += 300;
  }
  
  // Recent form
  const totalFights = fighter.wins + fighter.losses + fighter.draws;
  const winRate = totalFights > 0 ? fighter.wins / totalFights : 0.5;
  
  if (winRate > 0.7) {
    factors.recent_form_score = 80;
    baseScore += 400;
  } else if (winRate > 0.5) {
    factors.recent_form_score = 60;
    baseScore += 200;
  } else {
    factors.recent_form_score = 40;
  }
  
  // Popularity (simplified - would use more metrics in production)
  if (fighter.isChampion || (fighter.ranking && fighter.ranking <= 3)) {
    factors.popularity_score = 90;
    baseScore += 300;
  } else if (fighter.ranking && fighter.ranking <= 10) {
    factors.popularity_score = 70;
    baseScore += 150;
  }
  
  // Round to nearest 100
  const finalSalary = Math.round(baseScore / 100) * 100;
  
  // Ensure within bounds
  const salary = Math.max(1000, Math.min(4000, finalSalary));
  
  return { amount: salary, factors };
}

async function seedSalariesForEvent(eventId: string) {
  try {
    console.log(`Seeding salaries for event ${eventId}...`);
    
    // Get fights for this event
    const fightsSnapshot = await db.collection('fights')
      .where('event_id', '==', eventId)
      .get();
    
    const fights: Fight[] = fightsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Fight));
    
    console.log(`Found ${fights.length} fights`);
    
    // Get all fighters in this event
    const fighterIds = new Set<string>();
    fights.forEach(fight => {
      fighterIds.add(fight.fighter_a_id);
      fighterIds.add(fight.fighter_b_id);
    });
    
    // Get fighter details
    const fightersSnapshot = await db.collection('fighters')
      .where('__name__', 'in', Array.from(fighterIds))
      .get();
    
    const fighters: Fighter[] = fightersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Fighter));
    
    console.log(`Found ${fighters.length} fighters`);
    
    // Generate and save salaries
    const batch = db.batch();
    let count = 0;
    
    for (const fighter of fighters) {
      const fight = fights.find(
        f => f.fighter_a_id === fighter.id || f.fighter_b_id === fighter.id
      );
      
      if (!fight) continue;
      
      const salary = calculateFighterSalary(fighter, fight);
      
      const salaryDoc: FighterSalary = {
        id: `${eventId}_${fighter.id}`,
        event_id: eventId,
        fighter_id: fighter.id,
        salary: salary.amount,
        factors: salary.factors,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const docRef = db.collection('salaries').doc(salaryDoc.id);
      batch.set(docRef, salaryDoc);
      count++;
      
      console.log(`  - ${fighter.name}: $${salary.amount}`);
    }
    
    await batch.commit();
    console.log(`✅ Created ${count} salary records for event ${eventId}`);
    
  } catch (error) {
    console.error(`Error seeding salaries for event ${eventId}:`, error);
  }
}

async function seedAllEventSalaries() {
  try {
    // Get all upcoming events
    const eventsSnapshot = await db.collection('events')
      .where('date', '>=', new Date())
      .limit(5) // Seed next 5 events
      .get();
    
    console.log(`Found ${eventsSnapshot.size} upcoming events`);
    
    for (const eventDoc of eventsSnapshot.docs) {
      await seedSalariesForEvent(eventDoc.id);
    }
    
    console.log('✅ All salaries seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding salaries:', error);
    process.exit(1);
  }
}

// Run the seeding
seedAllEventSalaries(); 