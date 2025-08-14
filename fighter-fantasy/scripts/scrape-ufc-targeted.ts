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

// Initialize Firecrawl
const firecrawl = new FirecrawlApp({ 
  apiKey: process.env.FIRECRAWL_API_KEY || '' 
});

console.log('🎯 UFC Targeted Event Scraper\n');

// Known upcoming UFC events (we'll update these manually or via scraping)
const KNOWN_UPCOMING_EVENTS = [
  'ufc-319',
  'ufc-320', 
  'ufc-321',
  'ufc-fight-night-249',
  'ufc-fight-night-250'
];

async function clearAllEvents() {
  console.log('🗑️  Clearing all existing events...');
  const eventsSnapshot = await db.collection('events').get();
  const batch = db.batch();
  
  eventsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`✅ Cleared ${eventsSnapshot.size} events\n`);
}

async function scrapeSpecificEvent(eventSlug: string) {
  const eventUrl = `https://www.ufc.com/event/${eventSlug}`;
  console.log(`📋 Scraping: ${eventUrl}`);
  
  try {
    const page = await firecrawl.scrapeUrl(eventUrl, {
      formats: ['markdown', 'html'],
      waitFor: 3000,
      onlyMainContent: true
    });

    if (!page.success) {
      console.log(`  ⚠️  Could not scrape ${eventSlug}`);
      return null;
    }

    const content = page.markdown || '';
    
    // Extract event details from the page
    const eventData = parseEventPage(content, eventSlug);
    
    if (eventData) {
      console.log(`  ✅ Found: ${eventData.name}`);
      return eventData;
    }
    
    return null;
  } catch (error) {
    console.error(`  ❌ Error scraping ${eventSlug}:`, error);
    return null;
  }
}

function parseEventPage(content: string, slug: string): any {
  // Extract event name (usually in title or h1)
  let eventName = '';
  
  // Try to find UFC XXX pattern
  const titleMatch = content.match(/UFC\s+(\d+|Fight Night):?\s*([^\n\[]*)/i);
  if (titleMatch) {
    eventName = titleMatch[0].trim()
      .replace(/[\[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 100); // Limit length
  } else {
    // Fallback to slug
    eventName = slug.replace(/-/g, ' ').toUpperCase();
  }
  
  // Extract date
  let eventDate = new Date();
  const dateMatch = content.match(/([A-Z][a-z]{2,8})\s+(\d{1,2}),?\s+(\d{4})/);
  if (dateMatch) {
    eventDate = new Date(`${dateMatch[1]} ${dateMatch[2]}, ${dateMatch[3]}`);
  } else {
    // Try another date format
    const altDateMatch = content.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (altDateMatch) {
      eventDate = new Date(`${altDateMatch[1]}/${altDateMatch[2]}/${altDateMatch[3]}`);
    } else {
      // Default to next Saturday
      eventDate = getNextSaturday();
    }
  }
  
  // Extract location
  let location = { city: 'Las Vegas', state: 'Nevada', country: 'USA' };
  const locationMatch = content.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),\s+([A-Z]{2}|[A-Z][a-z]+)/);
  if (locationMatch) {
    location.city = locationMatch[1];
    location.state = locationMatch[2];
  }
  
  // Extract fights
  const fights = extractFights(content);
  
  return {
    id: `event_${slug.replace(/-/g, '_')}`,
    name: eventName,
    type: slug.includes('fight-night') ? 'Fight Night' : 'PPV',
    date_utc: eventDate.toISOString(),
    venue: {
      name: 'TBD',
      city: location.city,
      state: location.state,
      country: location.country,
      timezone: 'America/Los_Angeles'
    },
    broadcast: {
      prelims_time_utc: new Date(eventDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      main_card_time_utc: eventDate.toISOString(),
      networks: ['ESPN+', slug.includes('fight-night') ? 'ESPN' : 'PPV']
    },
    main_card: fights.slice(0, 5).map(f => f.id),
    prelims: fights.slice(5, 10).map(f => f.id),
    early_prelims: fights.slice(10).map(f => f.id),
    status: eventDate > new Date() ? 'upcoming' : 'completed',
    poster_url: '',
    fights: fights // Include fight data
  };
}

function extractFights(content: string): any[] {
  const fights = [];
  
  // Look for "vs" patterns - more specific regex
  const fightPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+vs?\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  const matches = Array.from(content.matchAll(fightPattern));
  
  // Also look for weight class mentions
  const weightClasses = ['Heavyweight', 'Light Heavyweight', 'Middleweight', 'Welterweight', 
                         'Lightweight', 'Featherweight', 'Bantamweight', 'Flyweight', 
                         "Women's Strawweight", "Women's Flyweight", "Women's Bantamweight"];
  
  for (let i = 0; i < Math.min(matches.length, 15); i++) {
    const match = matches[i];
    
    // Skip if names are too short or contain unwanted words
    if (match[1].length < 3 || match[2].length < 3) continue;
    if (match[1].includes('View') || match[2].includes('View')) continue;
    if (match[1].includes('Watch') || match[2].includes('Watch')) continue;
    
    // Try to find weight class
    let weightClass = 'TBD';
    for (const wc of weightClasses) {
      if (content.includes(wc) && content.indexOf(wc) < content.indexOf(match[0]) + 100) {
        weightClass = wc;
        break;
      }
    }
    
    fights.push({
      id: `fight_${i}`,
      fighter1: match[1].trim(),
      fighter2: match[2].trim(),
      weight_class: weightClass,
      is_main_event: i === 0,
      is_title_fight: content.includes('Title') && i === 0
    });
  }
  
  return fights;
}

function getNextSaturday(): Date {
  const today = new Date();
  const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  return nextSaturday;
}

async function scrapeMainEventsPage() {
  console.log('📅 Scraping main events page for better data...\n');
  
  try {
    const page = await firecrawl.scrapeUrl('https://www.ufc.com/events', {
      formats: ['markdown', 'html'],
      waitFor: 3000,
      onlyMainContent: true
    });

    if (!page.success) {
      console.log('⚠️  Could not scrape main events page');
      return [];
    }

    // Extract event URLs from the page
    const content = page.markdown || '';
    const eventUrls: string[] = [];
    
    // Look for event links
    const linkPattern = /\/event\/(ufc-[\w-]+|ufc-fight-night-[\w-]+)/gi;
    const matches = Array.from(content.matchAll(linkPattern));
    
    for (const match of matches) {
      const slug = match[1];
      if (!eventUrls.includes(slug)) {
        eventUrls.push(slug);
      }
    }
    
    console.log(`Found ${eventUrls.length} event links\n`);
    return eventUrls.slice(0, 10); // Limit to 10 to avoid too many requests
    
  } catch (error) {
    console.error('Error scraping main page:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('==================================================');
  console.log('         UFC TARGETED EVENT SCRAPER              ');
  console.log('==================================================\n');
  
  // Step 1: Clear all events
  await clearAllEvents();
  
  // Step 2: Get event slugs from main page
  const eventSlugs = await scrapeMainEventsPage();
  
  // Add known events if not found
  for (const slug of KNOWN_UPCOMING_EVENTS) {
    if (!eventSlugs.includes(slug)) {
      eventSlugs.push(slug);
    }
  }
  
  // Step 3: Scrape each event
  const events = [];
  console.log(`🎯 Scraping ${eventSlugs.length} individual event pages...\n`);
  
  for (const slug of eventSlugs) {
    const eventData = await scrapeSpecificEvent(slug);
    if (eventData) {
      events.push(eventData);
      
      // Save to Firebase immediately
      const batch = db.batch();
      
      // Save event
      const eventRef = db.collection('events').doc(eventData.id);
      const { fights, ...eventWithoutFights } = eventData;
      batch.set(eventRef, {
        ...eventWithoutFights,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Save fights
      if (fights && fights.length > 0) {
        for (let i = 0; i < fights.length; i++) {
          const fight = fights[i];
          const fightId = `${eventData.id}_fight_${i}`;
          const fightRef = db.collection('fights').doc(fightId);
          
          batch.set(fightRef, {
            id: fightId,
            event_id: eventData.id,
            fighter_a_name: fight.fighter1,
            fighter_b_name: fight.fighter2,
            weight_class: fight.weight_class,
            is_main_event: fight.is_main_event,
            is_title_fight: fight.is_title_fight,
            bout_order: fights.length - i, // Main event has highest order
            scheduled_rounds: fight.is_main_event ? 5 : 3,
            status: 'scheduled',
            created_at: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      await batch.commit();
      console.log(`  💾 Saved ${eventData.name} with ${fights?.length || 0} fights\n`);
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('==================================================');
  console.log('                    COMPLETE!                     ');
  console.log('==================================================\n');
  console.log('📊 Summary:');
  console.log(`  • Events scraped: ${events.length}`);
  console.log(`  • Upcoming: ${events.filter(e => e.status === 'upcoming').length}`);
  console.log(`  • Past: ${events.filter(e => e.status === 'completed').length}`);
  console.log('\n🎉 Your app now has targeted UFC event data!');
  console.log('🚀 Visit http://localhost:3000/events to see them!\n');
  
  process.exit(0);
}

// Run it
main(); 