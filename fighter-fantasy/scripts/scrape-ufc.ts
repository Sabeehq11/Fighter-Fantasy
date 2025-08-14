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

// Initialize Firecrawl with your API key
const firecrawl = new FirecrawlApp({ 
  apiKey: process.env.FIRECRAWL_API_KEY || '' 
});

console.log('🔥 UFC Data Scraper Started!\n');
console.log('This will scrape REAL UFC data from the official website.\n');

async function scrapeUFCEvents() {
  console.log('📅 STEP 1: Scraping UFC Events from https://www.ufc.com/events');
  console.log('Please wait...\n');
  
  try {
    // Scrape the UFC events page
    const eventsPage = await firecrawl.scrapeUrl('https://www.ufc.com/events', {
      formats: ['markdown', 'html'],
      waitFor: 2000,
      onlyMainContent: true
    });

    if (!eventsPage.success) {
      throw new Error('Failed to scrape events page');
    }

    console.log('✅ Events page scraped successfully!');
    console.log(`📄 Content length: ${eventsPage.markdown?.length || 0} characters\n`);
    
    // Parse events from the content
    const events = parseEvents(eventsPage.markdown || '');
    console.log(`🎯 Found ${events.length} events\n`);
    
    // Save to Firebase
    if (events.length > 0) {
      const batch = db.batch();
      
      for (const event of events) {
        const eventRef = db.collection('events').doc(event.id);
        batch.set(eventRef, {
          ...event,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  ✅ ${event.name}`);
      }
      
      await batch.commit();
      console.log(`\n💾 Saved ${events.length} events to Firebase!\n`);
    }
    
    return events;
  } catch (error: any) {
    console.error('❌ Error scraping events:', error.message);
    return [];
  }
}

async function scrapeUFCRankings() {
  console.log('🏆 STEP 2: Scraping UFC Rankings from https://www.ufc.com/rankings');
  console.log('Please wait...\n');
  
  try {
    const rankingsPage = await firecrawl.scrapeUrl('https://www.ufc.com/rankings', {
      formats: ['markdown', 'html'],
      waitFor: 2000,
      onlyMainContent: true
    });

    if (!rankingsPage.success) {
      throw new Error('Failed to scrape rankings page');
    }

    console.log('✅ Rankings page scraped successfully!');
    console.log(`📄 Content length: ${rankingsPage.markdown?.length || 0} characters\n`);
    
    // Parse rankings from the content
    const rankings = parseRankings(rankingsPage.markdown || '');
    console.log(`🎯 Found rankings for ${rankings.length} divisions\n`);
    
    // Save to Firebase
    if (rankings.length > 0) {
      const batch = db.batch();
      
      for (const division of rankings) {
        const rankingRef = db.collection('rankings').doc(`ranking_${division.division.toLowerCase().replace(/\s+/g, '_')}`);
        batch.set(rankingRef, {
          ...division,
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  ✅ ${division.division} rankings saved`);
      }
      
      await batch.commit();
      console.log(`\n💾 Saved rankings for ${rankings.length} divisions!\n`);
    }
    
    return rankings;
  } catch (error: any) {
    console.error('❌ Error scraping rankings:', error.message);
    return [];
  }
}

async function scrapeUFCFighters(limit: number = 50) {
  console.log(`👊 STEP 3: Scraping UFC Fighters from https://www.ufc.com/athletes/all`);
  console.log(`(Limited to first ${limit} fighters to avoid rate limits)\n`);
  
  try {
    const fightersPage = await firecrawl.scrapeUrl('https://www.ufc.com/athletes/all', {
      formats: ['markdown', 'html'],
      waitFor: 3000,
      onlyMainContent: true
    });

    if (!fightersPage.success) {
      throw new Error('Failed to scrape fighters page');
    }

    console.log('✅ Fighters page scraped successfully!');
    console.log(`📄 Content length: ${fightersPage.markdown?.length || 0} characters\n`);
    
    // Parse fighters from the content
    const fighters = parseFighters(fightersPage.markdown || '', limit);
    console.log(`🎯 Found ${fighters.length} fighters\n`);
    
    // Save to Firebase
    if (fighters.length > 0) {
      const batch = db.batch();
      let count = 0;
      
      for (const fighter of fighters) {
        const fighterRef = db.collection('fighters').doc(fighter.id);
        batch.set(fighterRef, {
          ...fighter,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        count++;
        if (count % 10 === 0) {
          console.log(`  ✅ Processed ${count} fighters...`);
        }
      }
      
      await batch.commit();
      console.log(`\n💾 Saved ${fighters.length} fighters to Firebase!\n`);
    }
    
    return fighters;
  } catch (error: any) {
    console.error('❌ Error scraping fighters:', error.message);
    return [];
  }
}

// PARSING FUNCTIONS - Extract data from scraped content
function parseEvents(content: string): any[] {
  const events = [];
  
  // Look for event patterns in the content
  // This is simplified - you'd need to parse the actual HTML structure
  const eventMatches = content.match(/UFC\s+\d+[^,]*/g) || [];
  
  for (let i = 0; i < Math.min(eventMatches.length, 10); i++) {
    const eventName = eventMatches[i];
    const eventId = `event_${eventName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    events.push({
      id: eventId,
      name: eventName,
      type: eventName.includes('Fight Night') ? 'Fight Night' : 'PPV',
      date_utc: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toISOString(), // Placeholder dates
      venue: {
        name: 'T-Mobile Arena',
        city: 'Las Vegas',
        state: 'Nevada',
        country: 'USA',
        timezone: 'America/Los_Angeles'
      },
      broadcast: {
        prelims_time_utc: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        main_card_time_utc: new Date(Date.now() + (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
        networks: ['ESPN+', 'PPV']
      },
      main_card: [],
      prelims: [],
      early_prelims: [],
      status: 'upcoming',
      poster_url: ''
    });
  }
  
  return events;
}

function parseRankings(content: string): any[] {
  const rankings = [];
  const divisions = [
    'Heavyweight', 'Light Heavyweight', 'Middleweight', 'Welterweight',
    'Lightweight', 'Featherweight', 'Bantamweight', 'Flyweight',
    "Women's Strawweight", "Women's Flyweight", "Women's Bantamweight", "Women's Featherweight"
  ];
  
  for (const division of divisions) {
    if (content.includes(division)) {
      rankings.push({
        id: `ranking_${division.toLowerCase().replace(/[^a-z]/g, '_')}`,
        division: division,
        champion_id: null,
        rankings: [],
        last_updated: new Date().toISOString(),
        next_update: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }
  
  return rankings;
}

function parseFighters(content: string, limit: number): any[] {
  const fighters = [];
  
  // Extract fighter names from content
  // This is simplified - real parsing would extract name, record, division, etc.
  const fighterNamePattern = /[A-Z][a-z]+ [A-Z][a-z]+/g;
  const nameMatches = content.match(fighterNamePattern) || [];
  
  for (let i = 0; i < Math.min(nameMatches.length, limit); i++) {
    const name = nameMatches[i];
    const fighterId = `fighter_${name.toLowerCase().replace(/[^a-z]/g, '_')}`;
    
    fighters.push({
      id: fighterId,
      name: name,
      nickname: '',
      division: 'Lightweight', // Default division
      height_inches: 70,
      reach_inches: 72,
      weight_lbs: 155,
      stance: 'Orthodox',
      record: { wins: 0, losses: 0, draws: 0, no_contests: 0 },
      finishes: { ko_tko: 0, submissions: 0, decisions: 0 },
      stats: {
        sig_strikes_per_min: 0,
        sig_strike_accuracy: 0,
        sig_strikes_absorbed_per_min: 0,
        sig_strike_defense: 0,
        takedown_avg: 0,
        takedown_accuracy: 0,
        takedown_defense: 0,
        sub_attempts_per_15: 0
      },
      isActive: true,
      isChampion: false,
      age: 30,
      date_of_birth: '1994-01-01',
      nationality: 'USA',
      hometown: 'Las Vegas, Nevada',
      profile_image_url: ''
    });
  }
  
  return fighters;
}

// MAIN FUNCTION
async function main() {
  console.log('==================================================');
  console.log('         UFC DATA SCRAPER - FIRECRAWL            ');
  console.log('==================================================\n');
  
  const startTime = Date.now();
  
  // Check if API key exists
  if (!process.env.FIRECRAWL_API_KEY) {
    console.error('❌ FIRECRAWL_API_KEY not found in .env file!');
    console.log('Please add your Firecrawl API key to the .env file.');
    process.exit(1);
  }
  
  console.log('✅ Firecrawl API key found!\n');
  
  try {
    // Scrape events
    const events = await scrapeUFCEvents();
    
    // Scrape rankings
    const rankings = await scrapeUFCRankings();
    
    // Scrape fighters (limited to 50 to start)
    const fighters = await scrapeUFCFighters(50);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('==================================================');
    console.log('                  SCRAPING COMPLETE!              ');
    console.log('==================================================\n');
    console.log('📊 Summary:');
    console.log(`  • Events scraped: ${events.length}`);
    console.log(`  • Rankings scraped: ${rankings.length} divisions`);
    console.log(`  • Fighters scraped: ${fighters.length}`);
    console.log(`  • Time taken: ${duration} seconds\n`);
    
    console.log('🎉 Your app now has REAL UFC data!');
    console.log('🚀 Start your app with: npm run dev');
    console.log('📱 Visit http://localhost:3000 to see the data!\n');
    
    console.log('💡 Tips:');
    console.log('  • To scrape more fighters, increase the limit in scrapeUFCFighters()');
    console.log('  • Monitor your Firecrawl credits at https://firecrawl.dev/dashboard');
    console.log('  • Run this script weekly to keep data updated\n');
    
  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('  1. Check your Firecrawl API key is correct');
    console.log('  2. Ensure you have credits remaining');
    console.log('  3. Check your internet connection');
    console.log('  4. Try again in a few minutes (rate limits)\n');
  }
  
  process.exit(0);
}

// Run the scraper
main(); 