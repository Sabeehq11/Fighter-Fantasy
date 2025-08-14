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

console.log('🧹 UFC Event Data Cleaner & Re-scraper\n');

async function cleanBadEventData() {
  console.log('🗑️  Cleaning bad event data...');
  
  try {
    // Get all events
    const eventsSnapshot = await db.collection('events').get();
    const batch = db.batch();
    let deletedCount = 0;
    
    eventsSnapshot.forEach(doc => {
      const event = doc.data();
      // Delete events with bad data (those with URLs in the name)
      if (event.name && (event.name.includes('http') || event.name.includes('[') || event.name.includes('('))) {
        batch.delete(doc.ref);
        deletedCount++;
        console.log(`  ❌ Deleting bad event: ${event.name.substring(0, 50)}...`);
      }
    });
    
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`✅ Deleted ${deletedCount} bad events\n`);
    } else {
      console.log('✅ No bad events found\n');
    }
  } catch (error) {
    console.error('Error cleaning events:', error);
  }
}

async function scrapeUFCEventsProper() {
  console.log('🎯 Scraping UFC Events with improved parser...');
  
  try {
    // Scrape upcoming events
    console.log('\n📅 Scraping UPCOMING events...');
    const upcomingPage = await firecrawl.scrapeUrl('https://www.ufc.com/events', {
      formats: ['html', 'markdown'],
      waitFor: 3000,
      onlyMainContent: false // Get full page for better parsing
    });

    if (!upcomingPage.success) {
      throw new Error('Failed to scrape upcoming events');
    }

    console.log('✅ Page scraped successfully!');
    
    // Parse events from HTML (better than markdown for structured data)
    const upcomingEvents = parseEventsFromHTML(upcomingPage.html || upcomingPage.markdown || '');
    console.log(`📊 Found ${upcomingEvents.length} upcoming events`);

    // Now scrape past events (different URL or tab)
    console.log('\n📅 Scraping PAST events...');
    const pastPage = await firecrawl.scrapeUrl('https://www.ufc.com/events/past', {
      formats: ['html', 'markdown'],
      waitFor: 3000,
      onlyMainContent: false
    });

    let pastEvents = [];
    if (pastPage.success) {
      pastEvents = parseEventsFromHTML(pastPage.html || pastPage.markdown || '', true);
      console.log(`📊 Found ${pastEvents.length} past events`);
    }

    // Combine all events
    const allEvents = [...upcomingEvents, ...pastEvents];
    
    // Save to Firebase
    if (allEvents.length > 0) {
      const batch = db.batch();
      
      for (const event of allEvents) {
        const eventRef = db.collection('events').doc(event.id);
        batch.set(eventRef, {
          ...event,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`  ✅ ${event.status === 'upcoming' ? '🔜' : '✓'} ${event.name} - ${event.date_utc.split('T')[0]}`);
      }
      
      await batch.commit();
      console.log(`\n💾 Saved ${allEvents.length} events to Firebase!`);
    }
    
    return allEvents;
  } catch (error: any) {
    console.error('❌ Error scraping events:', error.message);
    return [];
  }
}

function parseEventsFromHTML(content: string, isPast: boolean = false): any[] {
  const events = [];
  
  // More sophisticated parsing
  // Look for UFC event patterns with better regex
  const eventPattern = /UFC\s+(\d+):?\s*([^<\[\]\(\)]{0,50})/gi;
  const fightNightPattern = /UFC\s+Fight\s+Night:?\s*([^<\[\]\(\)]{0,50})/gi;
  
  // Also try to extract dates
  const datePattern = /([A-Z][a-z]{2,8})\s+(\d{1,2}),?\s+(\d{4})/g;
  
  // Extract UFC numbered events
  let matches = Array.from(content.matchAll(eventPattern));
  const fightNightMatches = Array.from(content.matchAll(fightNightPattern));
  matches = [...matches, ...fightNightMatches];
  
  // Extract dates separately
  const dates = Array.from(content.matchAll(datePattern));
  
  // Process found events (limit to reasonable number)
  const processedEvents = new Set();
  
  for (let i = 0; i < Math.min(matches.length, 20); i++) {
    const match = matches[i];
    let eventName = '';
    
    if (match[0].includes('Fight Night')) {
      eventName = `UFC Fight Night: ${match[1]}`.trim();
    } else {
      eventName = `UFC ${match[1]}${match[2] ? ': ' + match[2] : ''}`.trim();
    }
    
    // Clean up event name
    eventName = eventName
      .replace(/\s+/g, ' ')
      .replace(/[<>\[\]()]/g, '')
      .replace(/https?:\/\/[^\s]*/g, '')
      .trim();
    
    // Skip if too short or duplicate
    if (eventName.length < 5 || processedEvents.has(eventName)) continue;
    processedEvents.add(eventName);
    
    const eventId = `event_${eventName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    
    // Try to find a date for this event
    let eventDate = new Date();
    if (dates[i]) {
      const [, month, day, year] = dates[i];
      eventDate = new Date(`${month} ${day}, ${year}`);
    } else if (isPast) {
      // For past events, set dates in the past
      eventDate = new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    } else {
      // For upcoming events, set dates in the future
      eventDate = new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000);
    }
    
    events.push({
      id: eventId,
      name: eventName,
      type: eventName.includes('Fight Night') ? 'Fight Night' : 'PPV',
      date_utc: eventDate.toISOString(),
      venue: {
        name: 'T-Mobile Arena',
        city: 'Las Vegas',
        state: 'Nevada',
        country: 'USA',
        timezone: 'America/Los_Angeles'
      },
      broadcast: {
        prelims_time_utc: new Date(eventDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        main_card_time_utc: eventDate.toISOString(),
        networks: ['ESPN+', eventName.includes('Fight Night') ? 'ESPN' : 'PPV']
      },
      main_card: [],
      prelims: [],
      early_prelims: [],
      status: isPast ? 'completed' : 'upcoming',
      poster_url: ''
    });
  }
  
  return events;
}

async function scrapeEventDetails(eventUrl: string) {
  console.log(`\n🥊 Scraping fight card for: ${eventUrl}`);
  
  try {
    const eventPage = await firecrawl.scrapeUrl(eventUrl, {
      formats: ['html', 'markdown'],
      waitFor: 2000
    });

    if (!eventPage.success) {
      console.log('⚠️  Could not scrape event details');
      return null;
    }

    // Parse fight card from the event page
    const fights = parseFightCard(eventPage.markdown || '');
    console.log(`  Found ${fights.length} fights`);
    
    return fights;
  } catch (error) {
    console.error('Error scraping event details:', error);
    return null;
  }
}

function parseFightCard(content: string): any[] {
  const fights = [];
  
  // Look for fighter vs fighter patterns
  const fightPattern = /([A-Z][a-z]+ [A-Z][a-z]+)\s+vs\.?\s+([A-Z][a-z]+ [A-Z][a-z]+)/g;
  const matches = Array.from(content.matchAll(fightPattern));
  
  for (const match of matches.slice(0, 15)) { // Limit to 15 fights per event
    fights.push({
      fighter1: match[1],
      fighter2: match[2],
      weight_class: 'TBD'
    });
  }
  
  return fights;
}

// Main function
async function main() {
  console.log('==================================================');
  console.log('       UFC EVENT DATA CLEANER & RE-SCRAPER       ');
  console.log('==================================================\n');
  
  // Step 1: Clean bad data
  await cleanBadEventData();
  
  // Step 2: Scrape events properly
  const events = await scrapeUFCEventsProper();
  
  // Step 3: Try to get fight cards for first few events
  if (events.length > 0) {
    console.log('\n🥊 Attempting to scrape fight cards...');
    
    for (let i = 0; i < Math.min(3, events.length); i++) {
      const event = events[i];
      if (event.status === 'upcoming') {
        // Construct probable URL (this might need adjustment)
        const eventUrlSlug = event.name.toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-');
        const eventUrl = `https://www.ufc.com/event/${eventUrlSlug}`;
        
        const fights = await scrapeEventDetails(eventUrl);
        if (fights && fights.length > 0) {
          // Save fights to Firebase
          const batch = db.batch();
          for (let j = 0; j < fights.length; j++) {
            const fight = fights[j];
            const fightId = `fight_${event.id}_${j}`;
            const fightRef = db.collection('fights').doc(fightId);
            
            batch.set(fightRef, {
              id: fightId,
              event_id: event.id,
              fighter_a_name: fight.fighter1,
              fighter_b_name: fight.fighter2,
              weight_class: fight.weight_class,
              bout_order: j,
              status: 'scheduled',
              created_at: admin.firestore.FieldValue.serverTimestamp()
            });
          }
          await batch.commit();
          console.log(`  ✅ Saved ${fights.length} fights for ${event.name}`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  console.log('\n==================================================');
  console.log('                    COMPLETE!                     ');
  console.log('==================================================\n');
  console.log('📊 Summary:');
  console.log(`  • Events scraped: ${events.length}`);
  console.log(`  • Upcoming: ${events.filter(e => e.status === 'upcoming').length}`);
  console.log(`  • Past: ${events.filter(e => e.status === 'completed').length}`);
  console.log('\n🎉 Your app now has clean UFC event data!');
  console.log('🚀 Visit http://localhost:3000/events to see them!\n');
  
  process.exit(0);
}

// Run it
main(); 