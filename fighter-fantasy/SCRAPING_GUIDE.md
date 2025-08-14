# UFC Rankings Scraping Guide

## Overview
This guide explains how to scrape UFC rankings and fighter data from the official UFC website.

## Prerequisites

1. **Firecrawl API Key**: You need a Firecrawl API key. Get one from [Firecrawl](https://firecrawl.dev/)
2. **Firebase Admin SDK**: You need Firebase Admin credentials configured in your `.env` file
3. **Node.js**: Make sure you have Node.js installed

## Setup

1. Add your Firecrawl API key to the `.env` file:
```
FIRECRAWL_API_KEY=your_api_key_here
```

2. Ensure your Firebase Admin SDK JSON is configured in `.env`:
```
FIREBASE_ADMIN_SDK_JSON={"type":"service_account",...}
```

## Running the Scraper

### Option 1: Scrape Rankings Only (Recommended)
This script will:
- Clear existing fighter and ranking data
- Scrape all UFC divisions from the rankings page
- Get champions and top 15 ranked fighters
- Fetch detailed fighter profiles including images, records, and stats

```bash
cd fighter-fantasy
npm run scrape-rankings
```

### Option 2: Basic UFC Scraping
The basic scraper with limited data:
```bash
npm run scrape-ufc
```

## What Gets Scraped

The comprehensive rankings scraper collects:

### Fighter Data
- Name and nickname
- Division and ranking
- Champion status
- Fight record (wins, losses, draws, no contests)
- Profile image URL
- Physical stats (height, reach, weight, stance)
- Nationality and hometown
- Age and date of birth
- Fight statistics (if available)

### Rankings Data
- All 12 UFC divisions (8 men's, 4 women's)
- Current champion for each division
- Top 15 ranked fighters per division

## Important Notes

1. **Rate Limiting**: The scraper processes fighters in batches of 5 with delays to avoid rate limiting
2. **API Credits**: Each fighter profile scrape uses Firecrawl credits. Monitor your usage at [Firecrawl Dashboard](https://firecrawl.dev/dashboard)
3. **Processing Time**: Scraping all rankings and fighter profiles takes several minutes (typically 5-10 minutes)
4. **Data Freshness**: Run the scraper weekly to keep data up-to-date with UFC's official rankings

## Viewing the Data

After scraping, you can view the data at:
- Rankings: http://localhost:3000/rankings
- Fighters: http://localhost:3000/fighters

Start the development server:
```bash
npm run dev
```

## Troubleshooting

### Common Issues

1. **Missing API Key**
   - Error: `FIRECRAWL_API_KEY not found`
   - Solution: Add your Firecrawl API key to `.env`

2. **Rate Limiting**
   - Error: `429 Too Many Requests`
   - Solution: Wait a few minutes and try again

3. **No Credits**
   - Error: `Insufficient credits`
   - Solution: Check your Firecrawl dashboard and add credits

4. **Firebase Connection**
   - Error: `Error initializing Firebase Admin`
   - Solution: Check your Firebase Admin SDK JSON in `.env`

## Data Structure

### Fighters Collection
```javascript
{
  id: "fighter_name_here",
  name: "Fighter Name",
  nickname: "The Nickname",
  division: "Lightweight",
  ranking: 5,
  isChampion: false,
  record: {
    wins: 20,
    losses: 5,
    draws: 0,
    no_contests: 0
  },
  profile_image_url: "https://www.ufc.com/...",
  // ... additional fields
}
```

### Rankings Collection
```javascript
{
  id: "ranking_lightweight",
  division: "Lightweight",
  champion_id: "fighter_champion_name",
  rankings: [
    { fighter_id: "fighter_1", rank: 1 },
    { fighter_id: "fighter_2", rank: 2 },
    // ... up to rank 15
  ],
  last_updated: timestamp
}
``` 