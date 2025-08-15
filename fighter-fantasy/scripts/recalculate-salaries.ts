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

interface Fighter {
  id: string;
  name: string;
  isChampion?: boolean;
  ranking?: number;
  p4p_ranking?: number;
  nickname?: string;
  record: {
    wins: number;
    losses: number;
  };
  finishes?: {
    ko_tko?: number;
    submissions?: number;
  };
}

interface Fight {
  id: string;
  fighter_a_id: string;
  fighter_b_id: string;
  is_main_event?: boolean;
  is_co_main?: boolean;
  is_title_fight?: boolean;
  bout_order?: number;
  odds?: {
    fighter_a: number;
    fighter_b: number;
  };
}

interface Event {
  id: string;
  name: string;
  date_utc: string;
  status: string;
}

function calculateFighterSalary(
  fighter: Fighter, 
  fight: Fight
): { amount: number; factors: any } {
  // Base salary starts at $5,000
  let baseScore = 5000;
  
  const factors = {
    ranking_score: 0,
    odds_score: 0,
    recent_form_score: 0,
    popularity_score: 0,
    fight_position_score: 0
  };
  
  // 1. RANKING FACTOR (up to +$3,500)
  if (fighter.isChampion) {
    factors.ranking_score = 100;
    baseScore += 3500;
  } else if (fighter.ranking) {
    if (fighter.ranking === 1) {
      factors.ranking_score = 95;
      baseScore += 3000;
    } else if (fighter.ranking <= 3) {
      factors.ranking_score = 85;
      baseScore += 2500;
    } else if (fighter.ranking <= 5) {
      factors.ranking_score = 75;
      baseScore += 2000;
    } else if (fighter.ranking <= 10) {
      factors.ranking_score = 60;
      baseScore += 1200;
    } else if (fighter.ranking <= 15) {
      factors.ranking_score = 45;
      baseScore += 700;
    } else {
      factors.ranking_score = 25;
      baseScore += 300;
    }
  } else {
    factors.ranking_score = 15;
    baseScore += 0;
  }
  
  // 2. FIGHT POSITION FACTOR (up to +$1,500)
  if (fight.is_main_event) {
    factors.fight_position_score = 100;
    baseScore += 1500;
  } else if (fight.is_co_main) {
    factors.fight_position_score = 75;
    baseScore += 1000;
  } else if (fight.is_title_fight) {
    factors.fight_position_score = 90;
    baseScore += 1300;
  } else {
    const cardPosition = fight.bout_order || 1;
    if (cardPosition >= 10) {
      factors.fight_position_score = 50;
      baseScore += 600;
    } else if (cardPosition >= 5) {
      factors.fight_position_score = 30;
      baseScore += 300;
    } else {
      factors.fight_position_score = 15;
      baseScore += 100;
    }
  }
  
  // 3. BETTING ODDS FACTOR (up to ±$1,500)
  if (fight.odds) {
    const fighterOdds = fight.fighter_a_id === fighter.id 
      ? fight.odds.fighter_a 
      : fight.odds.fighter_b;
    
    if (fighterOdds <= -300) {
      factors.odds_score = 95;
      baseScore += 1500;
    } else if (fighterOdds <= -200) {
      factors.odds_score = 80;
      baseScore += 1000;
    } else if (fighterOdds <= -150) {
      factors.odds_score = 65;
      baseScore += 600;
    } else if (fighterOdds <= -100) {
      factors.odds_score = 55;
      baseScore += 300;
    } else if (fighterOdds < 100) {
      factors.odds_score = 50;
      baseScore += 0;
    } else if (fighterOdds < 150) {
      factors.odds_score = 40;
      baseScore -= 300;
    } else if (fighterOdds < 200) {
      factors.odds_score = 30;
      baseScore -= 600;
    } else if (fighterOdds < 300) {
      factors.odds_score = 20;
      baseScore -= 1000;
    } else {
      factors.odds_score = 10;
      baseScore -= 1500;
    }
  } else {
    factors.odds_score = 50;
  }
  
  // 4. RECENT FORM FACTOR (up to +$1,000)
  const totalFights = fighter.record.wins + fighter.record.losses;
  if (totalFights > 0) {
    const winRate = fighter.record.wins / totalFights;
    const finishes = (fighter.finishes?.ko_tko || 0) + (fighter.finishes?.submissions || 0);
    const finishRate = fighter.record.wins > 0 ? finishes / fighter.record.wins : 0;
    
    if (winRate >= 0.85) {
      factors.recent_form_score = 90;
      baseScore += 800;
    } else if (winRate >= 0.75) {
      factors.recent_form_score = 75;
      baseScore += 600;
    } else if (winRate >= 0.65) {
      factors.recent_form_score = 60;
      baseScore += 400;
    } else if (winRate >= 0.50) {
      factors.recent_form_score = 45;
      baseScore += 200;
    } else if (winRate >= 0.35) {
      factors.recent_form_score = 30;
      baseScore += 0;
    } else {
      factors.recent_form_score = 15;
      baseScore -= 300;
    }
    
    if (finishRate >= 0.7) {
      baseScore += 500;
      factors.recent_form_score += 10;
    } else if (finishRate >= 0.5) {
      baseScore += 250;
      factors.recent_form_score += 5;
    }
  }
  
  // 5. POPULARITY/NAME VALUE FACTOR (up to +$500)
  if (fighter.isChampion || fighter.p4p_ranking) {
    factors.popularity_score = 100;
    baseScore += 500;
  } else if (fighter.ranking && fighter.ranking <= 5) {
    factors.popularity_score = 70;
    baseScore += 300;
  } else if (fighter.nickname && fighter.record.wins >= 10) {
    factors.popularity_score = 50;
    baseScore += 200;
  } else {
    factors.popularity_score = 25;
    baseScore += 50;
  }
  
  // Round to nearest $100
  let finalSalary = Math.round(baseScore / 100) * 100;
  
  // Ensure salary is within reasonable bounds
  const minSalary = 3500;
  const maxSalary = 12000;
  finalSalary = Math.max(minSalary, Math.min(maxSalary, finalSalary));
  
  return {
    amount: finalSalary,
    factors
  };
}

async function recalculateSalaries() {
  console.log('🎯 Starting salary recalculation...\n');

  try {
    // Get all upcoming events
    const eventsSnapshot = await db.collection('events')
      .where('status', '==', 'upcoming')
      .get();
    
    console.log(`Found ${eventsSnapshot.size} upcoming events\n`);

    for (const eventDoc of eventsSnapshot.docs) {
      const event = { id: eventDoc.id, ...eventDoc.data() } as Event;
      console.log(`\n📅 Processing: ${event.name}`);
      console.log(`   Date: ${new Date(event.date_utc).toLocaleDateString()}`);

      // Get all fights for this event
      const fightsSnapshot = await db.collection('fights')
        .where('event_id', '==', event.id)
        .get();
      
      const fights = fightsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Fight));
      
      console.log(`   Found ${fights.length} fights`);

      // Process each fight
      let salariesUpdated = 0;
      const batch = db.batch();

      for (const fight of fights) {
        // Get both fighters
        const fighterIds = [fight.fighter_a_id, fight.fighter_b_id];
        
        for (const fighterId of fighterIds) {
          const fighterDoc = await db.collection('fighters').doc(fighterId).get();
          
          if (fighterDoc.exists) {
            const fighter = { id: fighterDoc.id, ...fighterDoc.data() } as Fighter;
            
            // Calculate new salary
            const salaryData = calculateFighterSalary(fighter, fight);
            
            // Prepare salary document
            const salaryId = `${event.id}_${fighter.id}`;
            const salaryRef = db.collection('salaries').doc(salaryId);
            
            batch.set(salaryRef, {
              event_id: event.id,
              fighter_id: fighter.id,
              salary: salaryData.amount,
              factors: salaryData.factors,
              updated_at: new Date(),
              algorithm_version: 2
            }, { merge: true });
            
            salariesUpdated++;
            
            // Log notable salaries
            if (fighter.isChampion || fight.is_main_event || fighter.ranking && fighter.ranking <= 5) {
              console.log(`   💰 ${fighter.name}: $${salaryData.amount.toLocaleString()}`);
              if (fighter.isChampion) console.log(`      (Champion)`);
              if (fight.is_main_event) console.log(`      (Main Event)`);
              if (fighter.ranking) console.log(`      (Rank #${fighter.ranking})`);
            }
          }
        }
      }

      // Commit the batch
      await batch.commit();
      console.log(`   ✅ Updated ${salariesUpdated} salaries`);
    }

    console.log('\n✨ Salary recalculation complete!');
    console.log('\nSalary ranges:');
    console.log('  • Minimum: $3,500 (unranked early prelim fighters)');
    console.log('  • Maximum: $12,000 (champions in main events)');
    console.log('  • Average: ~$6,500-7,500 (mid-card ranked fighters)');

  } catch (error) {
    console.error('❌ Error recalculating salaries:', error);
  }
}

// Run the script
recalculateSalaries().then(() => {
  console.log('\n👋 Done!');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
}); 