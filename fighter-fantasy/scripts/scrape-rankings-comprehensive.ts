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

console.log('🔥 UFC Rankings & Fighters Comprehensive Scraper Started!\n');
console.log('This will scrape ALL UFC rankings and fighter data from the official website.\n');

// Define all UFC divisions
const UFC_DIVISIONS = [
  { name: 'Heavyweight', weightLimit: 265, gender: 'male' },
  { name: 'Light Heavyweight', weightLimit: 205, gender: 'male' },
  { name: 'Middleweight', weightLimit: 185, gender: 'male' },
  { name: 'Welterweight', weightLimit: 170, gender: 'male' },
  { name: 'Lightweight', weightLimit: 155, gender: 'male' },
  { name: 'Featherweight', weightLimit: 145, gender: 'male' },
  { name: 'Bantamweight', weightLimit: 135, gender: 'male' },
  { name: 'Flyweight', weightLimit: 125, gender: 'male' },
  { name: "Women's Strawweight", weightLimit: 115, gender: 'female' },
  { name: "Women's Flyweight", weightLimit: 125, gender: 'female' },
  { name: "Women's Bantamweight", weightLimit: 135, gender: 'female' },
  { name: "Women's Featherweight", weightLimit: 145, gender: 'female' }
];

interface FighterInfo {
  id: string;
  name: string;
  nickname?: string;
  division: string;
  ranking?: number;
  isChampion: boolean;
  record: {
    wins: number;
    losses: number;
    draws: number;
    no_contests: number;
  };
  height_inches?: number;
  reach_inches?: number;
  weight_lbs?: number;
  stance?: string;
  age?: number;
  date_of_birth?: string;
  nationality?: string;
  hometown?: string;
  profile_image_url?: string;
  finishes?: {
    ko_tko: number;
    submissions: number;
    decisions: number;
  };
  stats?: {
    sig_strikes_per_min: number;
    sig_strike_accuracy: number;
    sig_strikes_absorbed_per_min: number;
    sig_strike_defense: number;
    takedown_avg: number;
    takedown_accuracy: number;
    takedown_defense: number;
    sub_attempts_per_15: number;
  };
  isActive: boolean;
}

interface DivisionRanking {
  division: string;
  champion: FighterInfo | null;
  rankings: FighterInfo[];
}

async function clearExistingData() {
  console.log('🗑️  Clearing existing fighter and ranking data...');
  
  try {
    // Clear fighters collection
    const fightersSnapshot = await db.collection('fighters').get();
    const fightersBatch = db.batch();
    fightersSnapshot.docs.forEach(doc => {
      fightersBatch.delete(doc.ref);
    });
    await fightersBatch.commit();
    console.log(`  ✅ Deleted ${fightersSnapshot.size} existing fighters`);
    
    // Clear rankings collection
    const rankingsSnapshot = await db.collection('rankings').get();
    const rankingsBatch = db.batch();
    rankingsSnapshot.docs.forEach(doc => {
      rankingsBatch.delete(doc.ref);
    });
    await rankingsBatch.commit();
    console.log(`  ✅ Deleted ${rankingsSnapshot.size} existing rankings\n`);
    
  } catch (error) {
    console.error('❌ Error clearing existing data:', error);
  }
}

async function scrapeRankingsPage() {
  console.log('🏆 Scraping UFC Rankings from https://www.ufc.com/rankings');
  console.log('Please wait...\n');
  
  try {
    const rankingsPage = await firecrawl.scrapeUrl('https://www.ufc.com/rankings', {
      formats: ['markdown', 'html'],
      waitFor: 3000,
      onlyMainContent: false
    });

    if (!rankingsPage.success) {
      throw new Error('Failed to scrape rankings page');
    }

    console.log('✅ Rankings page scraped successfully!');
    console.log(`📄 Content length: ${rankingsPage.html?.length || 0} characters\n`);
    
    return rankingsPage;
  } catch (error: any) {
    console.error('❌ Error scraping rankings:', error.message);
    throw error;
  }
}

async function scrapeFighterProfile(fighterUrl: string, retries = 3): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`  🔍 Scraping fighter: ${fighterUrl} (attempt ${attempt})`);
      
      const fighterPage = await firecrawl.scrapeUrl(fighterUrl, {
        formats: ['markdown', 'html'],
        waitFor: 2000,
        onlyMainContent: false
      });

      if (!fighterPage.success) {
        throw new Error('Failed to scrape fighter page');
      }

      return fighterPage;
    } catch (error: any) {
      console.log(`    ⚠️ Attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) {
        console.log(`    ❌ Failed to scrape after ${retries} attempts`);
        return null;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return null;
}

function parseRankingsFromHTML(html: string): Map<string, DivisionRanking> {
  const divisionsMap = new Map<string, DivisionRanking>();
  
  // Initialize all divisions
  UFC_DIVISIONS.forEach(div => {
    divisionsMap.set(div.name, {
      division: div.name,
      champion: null,
      rankings: []
    });
  });

  // This is a simplified parser - you would need to parse the actual HTML structure
  // The real implementation would use a proper HTML parser like cheerio
  console.log('📊 Parsing rankings from HTML...');
  
  // Look for division sections in the HTML
  UFC_DIVISIONS.forEach(division => {
    const divisionPattern = new RegExp(`${division.name}[\\s\\S]*?(?=(?:Women's |Men's )?(?:Heavyweight|Light Heavyweight|Middleweight|Welterweight|Lightweight|Featherweight|Bantamweight|Flyweight|Strawweight)|$)`, 'gi');
    const divisionContent = html.match(divisionPattern)?.[0] || '';
    
    if (divisionContent) {
      // Extract champion (C or Champion indicator)
      const championPattern = /(?:Champion|C\s*[:\-\s]+)([A-Za-z\s\-']+?)(?:\n|\r|<)/i;
      const championMatch = divisionContent.match(championPattern);
      
      if (championMatch) {
        const championName = championMatch[1].trim();
        const divRanking = divisionsMap.get(division.name);
        if (divRanking) {
          divRanking.champion = {
            id: `fighter_${championName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
            name: championName,
            division: division.name,
            isChampion: true,
            isActive: true,
            record: { wins: 0, losses: 0, draws: 0, no_contests: 0 }
          };
        }
      }
      
      // Extract ranked fighters (1-15)
      for (let rank = 1; rank <= 15; rank++) {
        const rankPattern = new RegExp(`${rank}[\\s\\.\\)\\-]+([A-Za-z\\s\\-']+?)(?:\n|\r|<|\\d)`, 'i');
        const rankMatch = divisionContent.match(rankPattern);
        
        if (rankMatch) {
          const fighterName = rankMatch[1].trim();
          const divRanking = divisionsMap.get(division.name);
          if (divRanking) {
            divRanking.rankings.push({
              id: `fighter_${fighterName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
              name: fighterName,
              division: division.name,
              ranking: rank,
              isChampion: false,
              isActive: true,
              record: { wins: 0, losses: 0, draws: 0, no_contests: 0 }
            });
          }
        }
      }
    }
  });
  
  // Log what we found
  divisionsMap.forEach((ranking, division) => {
    const championName = ranking.champion?.name || 'No champion';
    const rankedCount = ranking.rankings.length;
    console.log(`  ${division}: Champion: ${championName}, Ranked: ${rankedCount} fighters`);
  });
  
  return divisionsMap;
}

function parseFighterProfileFromHTML(html: string, markdown: string, basicInfo: FighterInfo): FighterInfo {
  const fighter = { ...basicInfo };
  
  // Parse record (e.g., "20-5-0")
  const recordPattern = /(\d+)\s*-\s*(\d+)(?:\s*-\s*(\d+))?(?:\s*(?:\(|,\s*)(\d+)\s*NC)?/;
  const recordMatch = (html + markdown).match(recordPattern);
  if (recordMatch) {
    fighter.record = {
      wins: parseInt(recordMatch[1]) || 0,
      losses: parseInt(recordMatch[2]) || 0,
      draws: parseInt(recordMatch[3]) || 0,
      no_contests: parseInt(recordMatch[4]) || 0
    };
  }
  
  // Parse nickname
  const nicknamePattern = /"([^"]+)"/;
  const nicknameMatch = (html + markdown).match(nicknamePattern);
  if (nicknameMatch) {
    fighter.nickname = nicknameMatch[1];
  }
  
  // Parse height (e.g., "5'11"" or "180 cm")
  const heightPattern = /(\d+)'(\d+)"|(\d+)\s*cm/i;
  const heightMatch = (html + markdown).match(heightPattern);
  if (heightMatch) {
    if (heightMatch[1] && heightMatch[2]) {
      fighter.height_inches = parseInt(heightMatch[1]) * 12 + parseInt(heightMatch[2]);
    } else if (heightMatch[3]) {
      fighter.height_inches = Math.round(parseInt(heightMatch[3]) / 2.54);
    }
  }
  
  // Parse reach (e.g., "72"" or "183 cm")
  const reachPattern = /reach[:\s]+(\d+)(?:"|'')|reach[:\s]+(\d+)\s*cm/i;
  const reachMatch = (html + markdown).match(reachPattern);
  if (reachMatch) {
    if (reachMatch[1]) {
      fighter.reach_inches = parseInt(reachMatch[1]);
    } else if (reachMatch[2]) {
      fighter.reach_inches = Math.round(parseInt(reachMatch[2]) / 2.54);
    }
  }
  
  // Parse weight
  const weightPattern = /(\d+)\s*lbs?|(\d+)\s*kg/i;
  const weightMatch = (html + markdown).match(weightPattern);
  if (weightMatch) {
    if (weightMatch[1]) {
      fighter.weight_lbs = parseInt(weightMatch[1]);
    } else if (weightMatch[2]) {
      fighter.weight_lbs = Math.round(parseInt(weightMatch[2]) * 2.205);
    }
  }
  
  // Parse stance
  const stancePattern = /stance[:\s]+(orthodox|southpaw|switch)/i;
  const stanceMatch = (html + markdown).match(stancePattern);
  if (stanceMatch) {
    fighter.stance = stanceMatch[1].charAt(0).toUpperCase() + stanceMatch[1].slice(1);
  }
  
  // Parse age and DOB
  const agePattern = /age[:\s]+(\d+)/i;
  const ageMatch = (html + markdown).match(agePattern);
  if (ageMatch) {
    fighter.age = parseInt(ageMatch[1]);
  }
  
  const dobPattern = /(?:born|dob|date of birth)[:\s]+([A-Za-z]+\s+\d+,?\s+\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/i;
  const dobMatch = (html + markdown).match(dobPattern);
  if (dobMatch) {
    fighter.date_of_birth = dobMatch[1];
  }
  
  // Parse nationality/hometown
  const nationalityPattern = /(?:from|nationality|country)[:\s]+([A-Za-z\s]+?)(?:\n|,|<)/i;
  const nationalityMatch = (html + markdown).match(nationalityPattern);
  if (nationalityMatch) {
    fighter.nationality = nationalityMatch[1].trim();
  }
  
  // Parse profile image URL
  const imagePattern = /(?:src|href)="([^"]*(?:fighter|athlete)[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/i;
  const imageMatch = html.match(imagePattern);
  if (imageMatch) {
    fighter.profile_image_url = imageMatch[1];
    // Ensure it's a full URL
    if (!fighter.profile_image_url.startsWith('http')) {
      fighter.profile_image_url = `https://www.ufc.com${fighter.profile_image_url}`;
    }
  }
  
  // Parse finish statistics
  const koPattern = /(?:ko|tko|knockouts?)[:\s]+(\d+)/i;
  const koMatch = (html + markdown).match(koPattern);
  const subPattern = /(?:submissions?|subs?)[:\s]+(\d+)/i;
  const subMatch = (html + markdown).match(subPattern);
  const decPattern = /(?:decisions?|dec)[:\s]+(\d+)/i;
  const decMatch = (html + markdown).match(decPattern);
  
  fighter.finishes = {
    ko_tko: koMatch ? parseInt(koMatch[1]) : 0,
    submissions: subMatch ? parseInt(subMatch[1]) : 0,
    decisions: decMatch ? parseInt(decMatch[1]) : 0
  };
  
  // Parse advanced stats
  const sigStrikesPattern = /sig\.\s*str(?:ikes?)?\s*(?:landed\s*)?per\s*min[:\s]+([0-9.]+)/i;
  const sigStrikesMatch = (html + markdown).match(sigStrikesPattern);
  const sigAccuracyPattern = /sig\.\s*str(?:ikes?)?\s*acc(?:uracy)?[:\s]+([0-9.]+)%?/i;
  const sigAccuracyMatch = (html + markdown).match(sigAccuracyPattern);
  const takedownPattern = /takedowns?\s*(?:landed\s*)?per\s*15[:\s]+([0-9.]+)/i;
  const takedownMatch = (html + markdown).match(takedownPattern);
  
  fighter.stats = {
    sig_strikes_per_min: sigStrikesMatch ? parseFloat(sigStrikesMatch[1]) : 0,
    sig_strike_accuracy: sigAccuracyMatch ? parseFloat(sigAccuracyMatch[1]) : 0,
    sig_strikes_absorbed_per_min: 0,
    sig_strike_defense: 0,
    takedown_avg: takedownMatch ? parseFloat(takedownMatch[1]) : 0,
    takedown_accuracy: 0,
    takedown_defense: 0,
    sub_attempts_per_15: 0
  };
  
  return fighter;
}

async function saveFightersToFirebase(fighters: FighterInfo[]) {
  console.log(`\n💾 Saving ${fighters.length} fighters to Firebase...`);
  
  const batch = db.batch();
  let count = 0;
  
  for (const fighter of fighters) {
    const fighterRef = db.collection('fighters').doc(fighter.id);
    batch.set(fighterRef, {
      ...fighter,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    count++;
    if (count % 10 === 0) {
      console.log(`  ✅ Processed ${count} fighters...`);
    }
  }
  
  await batch.commit();
  console.log(`✅ Saved all ${fighters.length} fighters to Firebase!\n`);
}

async function saveRankingsToFirebase(rankings: Map<string, DivisionRanking>) {
  console.log(`💾 Saving rankings for ${rankings.size} divisions to Firebase...`);
  
  const batch = db.batch();
  
  rankings.forEach((divisionRanking, divisionName) => {
    const rankingId = `ranking_${divisionName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const rankingRef = db.collection('rankings').doc(rankingId);
    
    batch.set(rankingRef, {
      id: rankingId,
      division: divisionName,
      champion_id: divisionRanking.champion?.id || null,
      rankings: divisionRanking.rankings.map(f => ({
        fighter_id: f.id,
        rank: f.ranking
      })),
      last_updated: admin.firestore.FieldValue.serverTimestamp(),
      next_update: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  });
  
  await batch.commit();
  console.log(`✅ Saved rankings for all ${rankings.size} divisions!\n`);
}

// MAIN FUNCTION
async function main() {
  console.log('==================================================');
  console.log('     UFC RANKINGS COMPREHENSIVE SCRAPER          ');
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
    // Step 1: Clear existing data
    await clearExistingData();
    
    // Step 2: Scrape the rankings page
    const rankingsPageData = await scrapeRankingsPage();
    
    // Step 3: Parse rankings to get all fighters
    const rankings = parseRankingsFromHTML(rankingsPageData.html || '');
    
    // Step 4: Collect all unique fighters
    const allFighters: FighterInfo[] = [];
    const fighterUrls = new Map<string, string>();
    
    rankings.forEach(divisionRanking => {
      if (divisionRanking.champion) {
        allFighters.push(divisionRanking.champion);
        const fighterSlug = divisionRanking.champion.name.toLowerCase().replace(/\s+/g, '-');
        fighterUrls.set(divisionRanking.champion.id, `https://www.ufc.com/athlete/${fighterSlug}`);
      }
      divisionRanking.rankings.forEach(fighter => {
        allFighters.push(fighter);
        const fighterSlug = fighter.name.toLowerCase().replace(/\s+/g, '-');
        fighterUrls.set(fighter.id, `https://www.ufc.com/athlete/${fighterSlug}`);
      });
    });
    
    console.log(`\n📊 Found ${allFighters.length} total fighters across all divisions\n`);
    
    // Step 5: Scrape individual fighter profiles for detailed info
    console.log('👊 Scraping individual fighter profiles for detailed information...\n');
    console.log('(This may take several minutes due to rate limiting)\n');
    
    const detailedFighters: FighterInfo[] = [];
    let processedCount = 0;
    const totalFighters = allFighters.length;
    
    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < allFighters.length; i += batchSize) {
      const batch = allFighters.slice(i, Math.min(i + batchSize, allFighters.length));
      const batchPromises = batch.map(async (fighter) => {
        const url = fighterUrls.get(fighter.id);
        if (url) {
          const profileData = await scrapeFighterProfile(url);
          if (profileData && profileData.success) {
            const detailedFighter = parseFighterProfileFromHTML(
              profileData.html || '',
              profileData.markdown || '',
              fighter
            );
            processedCount++;
            console.log(`  ✅ [${processedCount}/${totalFighters}] ${fighter.name} - ${fighter.division}`);
            return detailedFighter;
          }
        }
        processedCount++;
        console.log(`  ⚠️ [${processedCount}/${totalFighters}] ${fighter.name} - Using basic info only`);
        return fighter;
      });
      
      const batchResults = await Promise.all(batchPromises);
      detailedFighters.push(...batchResults);
      
      // Add delay between batches to avoid rate limiting
      if (i + batchSize < allFighters.length) {
        console.log(`  ⏳ Waiting before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Step 6: Save all fighters to Firebase
    await saveFightersToFirebase(detailedFighters);
    
    // Step 7: Save rankings to Firebase
    await saveRankingsToFirebase(rankings);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('==================================================');
    console.log('                SCRAPING COMPLETE!                ');
    console.log('==================================================\n');
    console.log('📊 Summary:');
    console.log(`  • Divisions processed: ${rankings.size}`);
    console.log(`  • Total fighters scraped: ${detailedFighters.length}`);
    console.log(`  • Champions: ${Array.from(rankings.values()).filter(r => r.champion).length}`);
    console.log(`  • Time taken: ${duration} seconds\n`);
    
    console.log('🎉 Your app now has comprehensive UFC rankings data!');
    console.log('🚀 The fighters and rankings pages will now display this data');
    console.log('📱 Visit http://localhost:3000/rankings to see the rankings!\n');
    
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