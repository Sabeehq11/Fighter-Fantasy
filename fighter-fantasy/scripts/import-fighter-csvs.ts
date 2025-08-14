import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Initialize Firebase Admin
const serviceAccountJson = process.env.FIREBASE_ADMIN_SDK_JSON;
if (!serviceAccountJson) {
  console.error('FIREBASE_ADMIN_SDK_JSON not set');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
  });
}

const db = admin.firestore();

// Type for CSV row
interface FighterCSVRow {
  name: string;
  nickname?: string;
  ranking?: string;
  is_champion?: string;
  wins: string;
  losses: string;
  draws: string;
  no_contests?: string;
  height?: string;
  reach?: string;
  weight?: string;
  stance?: string;
  age?: string;
  nationality?: string;
  hometown?: string;
  gym?: string;
  ko_tko?: string;
  submissions?: string;
  decisions?: string;
}

interface P4PCSVRow {
  Rank: string;
  Men_PFP?: string;
  Women_PFP?: string;
}

// Division mappings - matching your CSV file names
const DIVISION_MAPPINGS: Record<string, string> = {
  // Men's divisions
  'Heavyweight UFC - Sheet1.csv': 'Heavyweight',
  'Light Heavyweight UFC - Sheet1.csv': 'Light Heavyweight',
  'Middleweight UFC - Sheet1.csv': 'Middleweight',
  'Welterweight UFC - Sheet1.csv': 'Welterweight',
  'LightWeight UFC - Sheet1.csv': 'Lightweight',
  'Featherweight UFC - Sheet1.csv': 'Featherweight',
  'BantamnWeight UFC - Sheet1.csv': 'Bantamweight',
  'Flyweight UFC - Sheet1.csv': 'Flyweight',
  // Women's divisions
  "Women's Strawweight UFC - Sheet1.csv": "Women's Strawweight",
  "Women's Flyweight UFC - Sheet1.csv": "Women's Flyweight",
  "Women's Bantamweight UFC - Sheet1.csv": "Women's Bantamweight"
};

// Helper to convert height string (5'10") to inches
function heightToInches(height: string): number | null {
  if (!height || height === '?') return null;
  const match = height.match(/(\d+)'(\d+)"/);
  if (match) {
    return parseInt(match[1]) * 12 + parseInt(match[2]);
  }
  return null;
}

// Helper to parse reach
function parseReach(reach: string): number | null {
  if (!reach || reach === '?') return null;
  const parsed = parseFloat(reach);
  return isNaN(parsed) ? null : parsed;
}

async function importFightersFromCSV(csvPath: string, divisionName: string) {
  console.log(`\n📊 Importing ${divisionName}...`);
  
  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️  File not found: ${csvPath}`);
    return { updated: 0, created: 0 };
  }
  
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  // Clean up any trailing commas in the CSV content
  const cleanedContent = csvContent.replace(/,+\s*$/gm, '');
  
  const records = parse(cleanedContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true
  }) as FighterCSVRow[];

  let updated = 0;
  let created = 0;
  const batch = db.batch();

  for (const row of records) {
    // Generate fighter ID - using consistent format
    const nameParts = row.name.toLowerCase().split(' ');
    const fighterId = `fighter_${nameParts[nameParts.length - 1]}_${nameParts[0]}`;
    
    // Build fighter data
    const fighterData: any = {
      id: fighterId,
      name: row.name,
      division: divisionName,
      isActive: true,
    };

    // Add optional fields
    if (row.nickname && row.nickname.trim()) {
      fighterData.nickname = row.nickname;
    }
    
    // Handle champion status and ranking
    fighterData.isChampion = row.is_champion === 'TRUE' || row.is_champion === 'true';
    if (row.ranking) {
      // If ranking is 0 and they're champion, set ranking to null
      fighterData.ranking = (row.ranking === '0' && fighterData.isChampion) ? null : parseInt(row.ranking);
    }
    
    // Record
    fighterData.record = {
      wins: parseInt(row.wins) || 0,
      losses: parseInt(row.losses) || 0,
      draws: parseInt(row.draws) || 0,
      no_contests: parseInt(row.no_contests || '0') || 0
    };
    
    // Physical attributes
    if (row.height) fighterData.height_inches = heightToInches(row.height);
    if (row.reach) fighterData.reach_inches = parseReach(row.reach);
    if (row.weight) fighterData.weight_lbs = parseInt(row.weight);
    if (row.stance) fighterData.stance = row.stance;
    
    // Bio info
    if (row.age) fighterData.age = parseInt(row.age);
    if (row.nationality) fighterData.nationality = row.nationality;
    if (row.hometown) fighterData.hometown = row.hometown;
    if (row.gym) fighterData.gym = row.gym;
    
    // Finishes
    fighterData.finishes = {
      ko_tko: parseInt(row.ko_tko || '0') || 0,
      submissions: parseInt(row.submissions || '0') || 0,
      decisions: parseInt(row.decisions || '0') || 0
    };

    // Check if fighter exists
    const fighterRef = db.collection('fighters').doc(fighterId);
    const fighterDoc = await fighterRef.get();
    
    if (fighterDoc.exists) {
      // Update existing (merge to preserve stats)
      batch.set(fighterRef, fighterData, { merge: true });
      updated++;
    } else {
      // Create new
      fighterData.stats = null;
      fighterData.profile_image_url = null;
      batch.set(fighterRef, fighterData);
      created++;
    }
  }

  await batch.commit();
  console.log(`✅ ${divisionName}: Updated ${updated}, Created ${created}`);
  
  return { updated, created };
}

async function importPFPRankings() {
  console.log('\n🏆 Importing P4P Rankings...');
  
  const pfpPath = path.join(process.cwd(), 'data', 'csv', 'PFP', 'PFP UFC Men_Women - Sheet1.csv');
  
  if (!fs.existsSync(pfpPath)) {
    console.log('⚠️  P4P file not found');
    return;
  }
  
  const csvContent = fs.readFileSync(pfpPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as P4PCSVRow[];

  const mensP4P: any[] = [];
  const womensP4P: any[] = [];

  for (const row of records) {
    const rank = parseInt(row.Rank);
    
    if (row.Men_PFP) {
      const nameParts = row.Men_PFP.toLowerCase().split(' ');
      const fighterId = `fighter_${nameParts[nameParts.length - 1]}_${nameParts[0]}`;
      mensP4P.push({ rank, fighter_id: fighterId, name: row.Men_PFP });
    }
    
    if (row.Women_PFP) {
      const nameParts = row.Women_PFP.toLowerCase().split(' ');
      const fighterId = `fighter_${nameParts[nameParts.length - 1]}_${nameParts[0]}`;
      womensP4P.push({ rank, fighter_id: fighterId, name: row.Women_PFP });
    }
  }

  // Store P4P rankings
  const batch = db.batch();
  
  batch.set(db.collection('rankings').doc('p4p_mens'), {
    type: 'mens',
    rankings: mensP4P,
    last_updated: new Date().toISOString()
  });
  
  batch.set(db.collection('rankings').doc('p4p_womens'), {
    type: 'womens',
    rankings: womensP4P,
    last_updated: new Date().toISOString()
  });
  
  await batch.commit();
  console.log(`✅ P4P Rankings imported: ${mensP4P.length} men, ${womensP4P.length} women`);
}

async function importAllFighters() {
  console.log('🚀 Starting Fighter CSV Import (August 2025 Data)');
  console.log('================================================\n');
  
  let totalUpdated = 0;
  let totalCreated = 0;
  
  // Import Men's divisions
  console.log('👨 Importing Men\'s Divisions:');
  const menPath = path.join(process.cwd(), 'data', 'csv', 'Men');
  const menFiles = fs.readdirSync(menPath).filter(f => f.endsWith('.csv'));
  
  for (const file of menFiles) {
    const divisionName = DIVISION_MAPPINGS[file];
    if (divisionName) {
      const result = await importFightersFromCSV(
        path.join(menPath, file),
        divisionName
      );
      totalUpdated += result.updated;
      totalCreated += result.created;
    }
  }
  
  // Import Women's divisions
  console.log('\n👩 Importing Women\'s Divisions:');
  const womenPath = path.join(process.cwd(), 'data', 'csv', 'Women');
  const womenFiles = fs.readdirSync(womenPath).filter(f => f.endsWith('.csv'));
  
  for (const file of womenFiles) {
    const divisionName = DIVISION_MAPPINGS[file];
    if (divisionName) {
      const result = await importFightersFromCSV(
        path.join(womenPath, file),
        divisionName
      );
      totalUpdated += result.updated;
      totalCreated += result.created;
    }
  }
  
  // Import P4P rankings
  await importPFPRankings();
  
  console.log('\n================================================');
  console.log(`✨ Import Complete!`);
  console.log(`📊 Total: ${totalUpdated} updated, ${totalCreated} created`);
  console.log('🎯 August 2025 fighter data successfully imported!');
}

// Run the import
importAllFighters()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  }); 