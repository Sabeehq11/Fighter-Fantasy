import * as admin from 'firebase-admin';
import { Fighter, Event, Fight, DivisionRankings, FighterSalary } from '../src/types';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
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

// COMPREHENSIVE FIGHTER DATA - 30+ fighters
const fighters: Fighter[] = [
  // LIGHTWEIGHT DIVISION (155 lbs)
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
    ranking: 0,
    age: 32,
    date_of_birth: "1991-09-27",
    nationality: "Russia",
    hometown: "Makhachkala, Dagestan",
    gym: "American Kickboxing Academy",
    profile_image_url: "/images/fighters/makhachev.jpg"
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
    ranking: 1,
    age: 34,
    date_of_birth: "1989-10-17",
    nationality: "Brazil",
    hometown: "São Paulo, Brazil",
    gym: "Chute Boxe Diego Lima",
    profile_image_url: "/images/fighters/oliveira.jpg"
  },
  {
    id: "fighter_gaethje_justin",
    name: "Justin Gaethje",
    nickname: "The Highlight",
    division: "Lightweight",
    height_inches: 71,
    reach_inches: 70,
    weight_lbs: 155,
    stance: "Orthodox",
    record: { wins: 25, losses: 4, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 20, submissions: 1, decisions: 4 },
    stats: {
      sig_strikes_per_min: 7.59,
      sig_strike_accuracy: 59,
      sig_strikes_absorbed_per_min: 7.77,
      sig_strike_defense: 60,
      takedown_avg: 0.30,
      takedown_accuracy: 12,
      takedown_defense: 78,
      sub_attempts_per_15: 0.1
    },
    isActive: true,
    isChampion: false,
    ranking: 2,
    age: 35,
    date_of_birth: "1988-11-14",
    nationality: "USA",
    hometown: "Safford, Arizona",
    gym: "ONX Sports",
    profile_image_url: "/images/fighters/gaethje.jpg"
  },
  {
    id: "fighter_poirier_dustin",
    name: "Dustin Poirier",
    nickname: "The Diamond",
    division: "Lightweight",
    height_inches: 69,
    reach_inches: 72,
    weight_lbs: 155,
    stance: "Southpaw",
    record: { wins: 30, losses: 8, draws: 0, no_contests: 1 },
    finishes: { ko_tko: 14, submissions: 8, decisions: 8 },
    stats: {
      sig_strikes_per_min: 5.47,
      sig_strike_accuracy: 50,
      sig_strikes_absorbed_per_min: 4.45,
      sig_strike_defense: 53,
      takedown_avg: 0.91,
      takedown_accuracy: 31,
      takedown_defense: 61,
      sub_attempts_per_15: 0.4
    },
    isActive: true,
    isChampion: false,
    ranking: 3,
    age: 35,
    date_of_birth: "1989-01-19",
    nationality: "USA",
    hometown: "Lafayette, Louisiana",
    gym: "American Top Team",
    profile_image_url: "/images/fighters/poirier.jpg"
  },
  {
    id: "fighter_chandler_michael",
    name: "Michael Chandler",
    nickname: "Iron",
    division: "Lightweight",
    height_inches: 68,
    reach_inches: 71,
    weight_lbs: 155,
    stance: "Orthodox",
    record: { wins: 23, losses: 8, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 11, submissions: 7, decisions: 5 },
    stats: {
      sig_strikes_per_min: 4.21,
      sig_strike_accuracy: 48,
      sig_strikes_absorbed_per_min: 3.65,
      sig_strike_defense: 58,
      takedown_avg: 1.75,
      takedown_accuracy: 36,
      takedown_defense: 62,
      sub_attempts_per_15: 0.3
    },
    isActive: true,
    isChampion: false,
    ranking: 4,
    age: 38,
    date_of_birth: "1986-04-24",
    nationality: "USA",
    hometown: "High Ridge, Missouri",
    gym: "Sanford MMA",
    profile_image_url: "/images/fighters/chandler.jpg"
  },
  {
    id: "fighter_dariush_beneil",
    name: "Beneil Dariush",
    nickname: "Benny",
    division: "Lightweight",
    height_inches: 70,
    reach_inches: 72,
    weight_lbs: 155,
    stance: "Southpaw",
    record: { wins: 22, losses: 6, draws: 1, no_contests: 0 },
    finishes: { ko_tko: 8, submissions: 8, decisions: 6 },
    stats: {
      sig_strikes_per_min: 3.15,
      sig_strike_accuracy: 40,
      sig_strikes_absorbed_per_min: 2.82,
      sig_strike_defense: 64,
      takedown_avg: 1.30,
      takedown_accuracy: 31,
      takedown_defense: 85,
      sub_attempts_per_15: 0.7
    },
    isActive: true,
    isChampion: false,
    ranking: 5,
    age: 35,
    date_of_birth: "1989-05-06",
    nationality: "USA",
    hometown: "Yorba Linda, California",
    gym: "Kings MMA",
    profile_image_url: "/images/fighters/dariush.jpg"
  },
  {
    id: "fighter_ferguson_tony",
    name: "Tony Ferguson",
    nickname: "El Cucuy",
    division: "Lightweight",
    height_inches: 71,
    reach_inches: 76.5,
    weight_lbs: 155,
    stance: "Orthodox",
    record: { wins: 25, losses: 10, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 12, submissions: 8, decisions: 5 },
    stats: {
      sig_strikes_per_min: 5.44,
      sig_strike_accuracy: 44,
      sig_strikes_absorbed_per_min: 4.18,
      sig_strike_defense: 52,
      takedown_avg: 1.30,
      takedown_accuracy: 40,
      takedown_defense: 72,
      sub_attempts_per_15: 1.9
    },
    isActive: true,
    isChampion: false,
    ranking: 8,
    age: 40,
    date_of_birth: "1984-02-12",
    nationality: "USA",
    hometown: "Oxnard, California",
    gym: "Jackson Wink MMA",
    profile_image_url: "/images/fighters/ferguson.jpg"
  },
  
  // WELTERWEIGHT DIVISION (170 lbs)
  {
    id: "fighter_edwards_leon",
    name: "Leon Edwards",
    nickname: "Rocky",
    division: "Welterweight",
    height_inches: 74,
    reach_inches: 74,
    weight_lbs: 170,
    stance: "Southpaw",
    record: { wins: 22, losses: 3, draws: 0, no_contests: 1 },
    finishes: { ko_tko: 7, submissions: 3, decisions: 12 },
    stats: {
      sig_strikes_per_min: 2.70,
      sig_strike_accuracy: 46,
      sig_strikes_absorbed_per_min: 1.74,
      sig_strike_defense: 62,
      takedown_avg: 0.60,
      takedown_accuracy: 40,
      takedown_defense: 77,
      sub_attempts_per_15: 0.2
    },
    isActive: true,
    isChampion: true,
    ranking: 0,
    age: 32,
    date_of_birth: "1991-08-25",
    nationality: "United Kingdom",
    hometown: "Birmingham, England",
    gym: "Team Renegade",
    profile_image_url: "/images/fighters/edwards.jpg"
  },
  {
    id: "fighter_usman_kamaru",
    name: "Kamaru Usman",
    nickname: "The Nigerian Nightmare",
    division: "Welterweight",
    height_inches: 72,
    reach_inches: 76,
    weight_lbs: 170,
    stance: "Orthodox",
    record: { wins: 20, losses: 3, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 9, submissions: 1, decisions: 10 },
    stats: {
      sig_strikes_per_min: 4.28,
      sig_strike_accuracy: 51,
      sig_strikes_absorbed_per_min: 2.28,
      sig_strike_defense: 59,
      takedown_avg: 2.41,
      takedown_accuracy: 47,
      takedown_defense: 100,
      sub_attempts_per_15: 0.1
    },
    isActive: true,
    isChampion: false,
    ranking: 1,
    age: 36,
    date_of_birth: "1987-05-11",
    nationality: "Nigeria",
    hometown: "Auchi, Nigeria",
    gym: "Elevation Fight Team",
    profile_image_url: "/images/fighters/usman.jpg"
  },
  {
    id: "fighter_covington_colby",
    name: "Colby Covington",
    nickname: "Chaos",
    division: "Welterweight",
    height_inches: 71,
    reach_inches: 72,
    weight_lbs: 170,
    stance: "Orthodox",
    record: { wins: 17, losses: 4, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 6, submissions: 4, decisions: 7 },
    stats: {
      sig_strikes_per_min: 4.48,
      sig_strike_accuracy: 44,
      sig_strikes_absorbed_per_min: 2.66,
      sig_strike_defense: 55,
      takedown_avg: 2.07,
      takedown_accuracy: 45,
      takedown_defense: 87,
      sub_attempts_per_15: 0.2
    },
    isActive: true,
    isChampion: false,
    ranking: 2,
    age: 36,
    date_of_birth: "1988-02-22",
    nationality: "USA",
    hometown: "Clovis, California",
    gym: "MMA Masters",
    profile_image_url: "/images/fighters/covington.jpg"
  },
  {
    id: "fighter_burns_gilbert",
    name: "Gilbert Burns",
    nickname: "Durinho",
    division: "Welterweight",
    height_inches: 71,
    reach_inches: 71,
    weight_lbs: 170,
    stance: "Orthodox",
    record: { wins: 22, losses: 7, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 8, submissions: 8, decisions: 6 },
    stats: {
      sig_strikes_per_min: 2.94,
      sig_strike_accuracy: 48,
      sig_strikes_absorbed_per_min: 2.73,
      sig_strike_defense: 51,
      takedown_avg: 1.45,
      takedown_accuracy: 42,
      takedown_defense: 66,
      sub_attempts_per_15: 0.8
    },
    isActive: true,
    isChampion: false,
    ranking: 4,
    age: 37,
    date_of_birth: "1986-07-20",
    nationality: "Brazil",
    hometown: "Niterói, Brazil",
    gym: "Sanford MMA",
    profile_image_url: "/images/fighters/burns.jpg"
  },
  
  // MIDDLEWEIGHT DIVISION (185 lbs)
  {
    id: "fighter_adesanya_israel",
    name: "Israel Adesanya",
    nickname: "The Last Stylebender",
    division: "Middleweight",
    height_inches: 76,
    reach_inches: 80,
    weight_lbs: 185,
    stance: "Orthodox",
    record: { wins: 24, losses: 3, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 15, submissions: 0, decisions: 9 },
    stats: {
      sig_strikes_per_min: 3.94,
      sig_strike_accuracy: 49,
      sig_strikes_absorbed_per_min: 2.26,
      sig_strike_defense: 62,
      takedown_avg: 0.00,
      takedown_accuracy: 0,
      takedown_defense: 79,
      sub_attempts_per_15: 0.0
    },
    isActive: true,
    isChampion: true,
    ranking: 0,
    age: 34,
    date_of_birth: "1989-07-22",
    nationality: "Nigeria",
    hometown: "Auckland, New Zealand",
    gym: "City Kickboxing",
    profile_image_url: "/images/fighters/adesanya.jpg"
  },
  {
    id: "fighter_pereira_alex",
    name: "Alex Pereira",
    nickname: "Poatan",
    division: "Light Heavyweight",
    secondaryDivision: "Middleweight",
    height_inches: 76,
    reach_inches: 79,
    weight_lbs: 205,
    stance: "Orthodox",
    record: { wins: 11, losses: 2, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 9, submissions: 0, decisions: 2 },
    stats: {
      sig_strikes_per_min: 5.49,
      sig_strike_accuracy: 60,
      sig_strikes_absorbed_per_min: 3.49,
      sig_strike_defense: 53,
      takedown_avg: 0.00,
      takedown_accuracy: 0,
      takedown_defense: 56,
      sub_attempts_per_15: 0.0
    },
    isActive: true,
    isChampion: true,
    ranking: 0,
    age: 36,
    date_of_birth: "1987-07-07",
    nationality: "Brazil",
    hometown: "São Bernardo do Campo, Brazil",
    gym: "Glover Teixeira's Gym",
    profile_image_url: "/images/fighters/pereira.jpg"
  },
  {
    id: "fighter_whittaker_robert",
    name: "Robert Whittaker",
    nickname: "The Reaper",
    division: "Middleweight",
    height_inches: 73,
    reach_inches: 73.5,
    weight_lbs: 185,
    stance: "Orthodox",
    record: { wins: 25, losses: 7, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 11, submissions: 5, decisions: 9 },
    stats: {
      sig_strikes_per_min: 4.48,
      sig_strike_accuracy: 43,
      sig_strikes_absorbed_per_min: 3.68,
      sig_strike_defense: 58,
      takedown_avg: 0.80,
      takedown_accuracy: 64,
      takedown_defense: 84,
      sub_attempts_per_15: 0.2
    },
    isActive: true,
    isChampion: false,
    ranking: 1,
    age: 33,
    date_of_birth: "1990-12-20",
    nationality: "Australia",
    hometown: "Sydney, Australia",
    gym: "Gracie Jiu-Jitsu Smeaton",
    profile_image_url: "/images/fighters/whittaker.jpg"
  },
  
  // HEAVYWEIGHT DIVISION
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
    ranking: 0,
    p4p_ranking: 1,
    age: 36,
    date_of_birth: "1987-07-19",
    nationality: "USA",
    hometown: "Rochester, New York",
    gym: "Jackson Wink MMA",
    profile_image_url: "/images/fighters/jones.jpg"
  },
  {
    id: "fighter_ngannou_francis",
    name: "Francis Ngannou",
    nickname: "The Predator",
    division: "Heavyweight",
    height_inches: 76,
    reach_inches: 83,
    weight_lbs: 257,
    stance: "Orthodox",
    record: { wins: 17, losses: 3, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 12, submissions: 4, decisions: 1 },
    stats: {
      sig_strikes_per_min: 2.42,
      sig_strike_accuracy: 38,
      sig_strikes_absorbed_per_min: 1.92,
      sig_strike_defense: 49,
      takedown_avg: 0.21,
      takedown_accuracy: 50,
      takedown_defense: 63,
      sub_attempts_per_15: 0.3
    },
    isActive: false,
    isChampion: false,
    ranking: 2,
    age: 37,
    date_of_birth: "1986-09-05",
    nationality: "Cameroon",
    hometown: "Batié, Cameroon",
    gym: "Xtreme Couture",
    profile_image_url: "/images/fighters/ngannou.jpg"
  },
  {
    id: "fighter_miocic_stipe",
    name: "Stipe Miocic",
    nickname: "Stone Cold",
    division: "Heavyweight",
    height_inches: 76,
    reach_inches: 80,
    weight_lbs: 234,
    stance: "Orthodox",
    record: { wins: 20, losses: 4, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 15, submissions: 0, decisions: 5 },
    stats: {
      sig_strikes_per_min: 4.90,
      sig_strike_accuracy: 52,
      sig_strikes_absorbed_per_min: 3.43,
      sig_strike_defense: 56,
      takedown_avg: 1.59,
      takedown_accuracy: 39,
      takedown_defense: 63,
      sub_attempts_per_15: 0.1
    },
    isActive: true,
    isChampion: false,
    ranking: 3,
    age: 41,
    date_of_birth: "1982-08-19",
    nationality: "USA",
    hometown: "Euclid, Ohio",
    gym: "Strong Style MMA",
    profile_image_url: "/images/fighters/miocic.jpg"
  },
  
  // BANTAMWEIGHT DIVISION (135 lbs)
  {
    id: "fighter_omalley_sean",
    name: "Sean O'Malley",
    nickname: "Sugar",
    division: "Bantamweight",
    height_inches: 71,
    reach_inches: 72,
    weight_lbs: 135,
    stance: "Orthodox",
    record: { wins: 18, losses: 1, draws: 0, no_contests: 1 },
    finishes: { ko_tko: 12, submissions: 1, decisions: 5 },
    stats: {
      sig_strikes_per_min: 7.55,
      sig_strike_accuracy: 61,
      sig_strikes_absorbed_per_min: 3.58,
      sig_strike_defense: 59,
      takedown_avg: 0.14,
      takedown_accuracy: 50,
      takedown_defense: 86,
      sub_attempts_per_15: 0.0
    },
    isActive: true,
    isChampion: true,
    ranking: 0,
    age: 29,
    date_of_birth: "1994-10-24",
    nationality: "USA",
    hometown: "Helena, Montana",
    gym: "The MMA Lab",
    profile_image_url: "/images/fighters/omalley.jpg"
  },
  {
    id: "fighter_sterling_aljamain",
    name: "Aljamain Sterling",
    nickname: "Funk Master",
    division: "Bantamweight",
    height_inches: 67,
    reach_inches: 71,
    weight_lbs: 135,
    stance: "Orthodox",
    record: { wins: 23, losses: 4, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 3, submissions: 8, decisions: 12 },
    stats: {
      sig_strikes_per_min: 3.05,
      sig_strike_accuracy: 41,
      sig_strikes_absorbed_per_min: 2.50,
      sig_strike_defense: 55,
      takedown_avg: 2.10,
      takedown_accuracy: 30,
      takedown_defense: 65,
      sub_attempts_per_15: 1.1
    },
    isActive: true,
    isChampion: false,
    ranking: 1,
    age: 34,
    date_of_birth: "1989-07-31",
    nationality: "USA",
    hometown: "Uniondale, New York",
    gym: "Serra-Longo Fight Team",
    profile_image_url: "/images/fighters/sterling.jpg"
  },
  
  // FEATHERWEIGHT DIVISION (145 lbs)
  {
    id: "fighter_volkanovski_alex",
    name: "Alexander Volkanovski",
    nickname: "The Great",
    division: "Featherweight",
    height_inches: 66,
    reach_inches: 71.5,
    weight_lbs: 145,
    stance: "Orthodox",
    record: { wins: 26, losses: 3, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 13, submissions: 3, decisions: 10 },
    stats: {
      sig_strikes_per_min: 5.59,
      sig_strike_accuracy: 56,
      sig_strikes_absorbed_per_min: 3.23,
      sig_strike_defense: 60,
      takedown_avg: 1.86,
      takedown_accuracy: 42,
      takedown_defense: 74,
      sub_attempts_per_15: 0.2
    },
    isActive: true,
    isChampion: true,
    ranking: 0,
    p4p_ranking: 2,
    age: 35,
    date_of_birth: "1988-09-29",
    nationality: "Australia",
    hometown: "Wollongong, Australia",
    gym: "City Kickboxing",
    profile_image_url: "/images/fighters/volkanovski.jpg"
  },
  {
    id: "fighter_holloway_max",
    name: "Max Holloway",
    nickname: "Blessed",
    division: "Featherweight",
    height_inches: 71,
    reach_inches: 69,
    weight_lbs: 145,
    stance: "Orthodox",
    record: { wins: 25, losses: 7, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 11, submissions: 2, decisions: 12 },
    stats: {
      sig_strikes_per_min: 7.23,
      sig_strike_accuracy: 46,
      sig_strikes_absorbed_per_min: 4.51,
      sig_strike_defense: 58,
      takedown_avg: 0.00,
      takedown_accuracy: 0,
      takedown_defense: 86,
      sub_attempts_per_15: 0.0
    },
    isActive: true,
    isChampion: false,
    ranking: 1,
    age: 32,
    date_of_birth: "1991-12-04",
    nationality: "USA",
    hometown: "Waianae, Hawaii",
    gym: "Gracie Technics",
    profile_image_url: "/images/fighters/holloway.jpg"
  },
  
  // WOMEN'S STRAWWEIGHT (115 lbs)
  {
    id: "fighter_zhang_weili",
    name: "Zhang Weili",
    nickname: "Magnum",
    division: "Women's Strawweight",
    height_inches: 64,
    reach_inches: 63,
    weight_lbs: 115,
    stance: "Orthodox",
    record: { wins: 24, losses: 3, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 11, submissions: 7, decisions: 6 },
    stats: {
      sig_strikes_per_min: 5.56,
      sig_strike_accuracy: 45,
      sig_strikes_absorbed_per_min: 3.56,
      sig_strike_defense: 59,
      takedown_avg: 1.57,
      takedown_accuracy: 50,
      takedown_defense: 85,
      sub_attempts_per_15: 0.1
    },
    isActive: true,
    isChampion: true,
    ranking: 0,
    age: 34,
    date_of_birth: "1989-08-13",
    nationality: "China",
    hometown: "Handan, China",
    gym: "Black Tiger Fight Club",
    profile_image_url: "/images/fighters/zhang.jpg"
  },
  {
    id: "fighter_namajunas_rose",
    name: "Rose Namajunas",
    nickname: "Thug",
    division: "Women's Strawweight",
    height_inches: 65,
    reach_inches: 65,
    weight_lbs: 115,
    stance: "Orthodox",
    record: { wins: 12, losses: 6, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 3, submissions: 5, decisions: 4 },
    stats: {
      sig_strikes_per_min: 3.25,
      sig_strike_accuracy: 42,
      sig_strikes_absorbed_per_min: 3.25,
      sig_strike_defense: 57,
      takedown_avg: 0.66,
      takedown_accuracy: 29,
      takedown_defense: 72,
      sub_attempts_per_15: 0.4
    },
    isActive: true,
    isChampion: false,
    ranking: 2,
    age: 31,
    date_of_birth: "1992-06-29",
    nationality: "USA",
    hometown: "Milwaukee, Wisconsin",
    gym: "Roufusport",
    profile_image_url: "/images/fighters/namajunas.jpg"
  },
  
  // Additional fighters to make teams interesting
  {
    id: "fighter_mcgregor_conor",
    name: "Conor McGregor",
    nickname: "The Notorious",
    division: "Lightweight",
    height_inches: 69,
    reach_inches: 74,
    weight_lbs: 155,
    stance: "Southpaw",
    record: { wins: 22, losses: 6, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 19, submissions: 1, decisions: 2 },
    stats: {
      sig_strikes_per_min: 5.30,
      sig_strike_accuracy: 49,
      sig_strikes_absorbed_per_min: 4.50,
      sig_strike_defense: 55,
      takedown_avg: 0.73,
      takedown_accuracy: 60,
      takedown_defense: 64,
      sub_attempts_per_15: 0.2
    },
    isActive: true,
    isChampion: false,
    ranking: 10,
    age: 35,
    date_of_birth: "1988-07-14",
    nationality: "Ireland",
    hometown: "Dublin, Ireland",
    gym: "SBG Ireland",
    profile_image_url: "/images/fighters/mcgregor.jpg"
  },
  {
    id: "fighter_diaz_nate",
    name: "Nate Diaz",
    nickname: "The Stockton Slap",
    division: "Welterweight",
    height_inches: 72,
    reach_inches: 76,
    weight_lbs: 170,
    stance: "Southpaw",
    record: { wins: 21, losses: 13, draws: 0, no_contests: 0 },
    finishes: { ko_tko: 5, submissions: 12, decisions: 4 },
    stats: {
      sig_strikes_per_min: 4.20,
      sig_strike_accuracy: 44,
      sig_strikes_absorbed_per_min: 3.90,
      sig_strike_defense: 52,
      takedown_avg: 0.46,
      takedown_accuracy: 30,
      takedown_defense: 70,
      sub_attempts_per_15: 1.1
    },
    isActive: false,
    isChampion: false,
    ranking: 15,
    age: 38,
    date_of_birth: "1985-04-16",
    nationality: "USA",
    hometown: "Stockton, California",
    gym: "Nick Diaz Academy",
    profile_image_url: "/images/fighters/diaz.jpg"
  }
];

// Create comprehensive events with full fight cards
const events: Event[] = [
  {
    id: "ufc_300_main",
    name: "UFC 300: Pereira vs Hill",
    type: "PPV",
    date_utc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    venue: {
      name: "T-Mobile Arena",
      city: "Las Vegas",
      state: "Nevada",
      country: "USA",
      timezone: "America/Los_Angeles"
    },
    broadcast: {
      prelims_time_utc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
      main_card_time_utc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      networks: ["ESPN+", "PPV"]
    },
    main_card: ["fight_300_main", "fight_300_co", "fight_300_3", "fight_300_4", "fight_300_5"],
    prelims: ["fight_300_p1", "fight_300_p2", "fight_300_p3", "fight_300_p4"],
    early_prelims: [],
    status: "upcoming",
    poster_url: "/images/events/ufc300.jpg"
  },
  {
    id: "ufc_301_main",
    name: "UFC 301: Makhachev vs Oliveira 2",
    type: "PPV",
    date_utc: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks
    venue: {
      name: "Etihad Arena",
      city: "Abu Dhabi",
      country: "UAE",
      timezone: "Asia/Dubai"
    },
    broadcast: {
      prelims_time_utc: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
      main_card_time_utc: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      networks: ["ESPN+", "PPV"]
    },
    main_card: ["fight_301_main", "fight_301_co", "fight_301_3", "fight_301_4", "fight_301_5"],
    prelims: ["fight_301_p1", "fight_301_p2", "fight_301_p3"],
    early_prelims: [],
    status: "upcoming",
    poster_url: "/images/events/ufc301.jpg"
  }
];

// Create fights for each event
const fights: Fight[] = [
  // UFC 300 Main Card
  {
    id: "fight_300_main",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_pereira_alex",
    fighter_b_id: "fighter_jones_jon",
    weight_class: "Light Heavyweight",
    is_title_fight: true,
    is_interim_title: false,
    is_main_event: true,
    is_co_main: false,
    bout_order: 5,
    scheduled_rounds: 5,
    odds: { fighter_a: -150, fighter_b: +130 },
    status: "scheduled"
  },
  {
    id: "fight_300_co",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_zhang_weili",
    fighter_b_id: "fighter_namajunas_rose",
    weight_class: "Women's Strawweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: true,
    bout_order: 4,
    scheduled_rounds: 3,
    odds: { fighter_a: -200, fighter_b: +170 },
    status: "scheduled"
  },
  {
    id: "fight_300_3",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_holloway_max",
    fighter_b_id: "fighter_gaethje_justin",
    weight_class: "Lightweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: 3,
    scheduled_rounds: 3,
    odds: { fighter_a: +110, fighter_b: -130 },
    status: "scheduled"
  },
  {
    id: "fight_300_4",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_oliveira_charles",
    fighter_b_id: "fighter_chandler_michael",
    weight_class: "Lightweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: 2,
    scheduled_rounds: 3,
    odds: { fighter_a: -180, fighter_b: +150 },
    status: "scheduled"
  },
  {
    id: "fight_300_5",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_omalley_sean",
    fighter_b_id: "fighter_sterling_aljamain",
    weight_class: "Bantamweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: 1,
    scheduled_rounds: 3,
    odds: { fighter_a: -250, fighter_b: +200 },
    status: "scheduled"
  },
  // UFC 300 Prelims
  {
    id: "fight_300_p1",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_covington_colby",
    fighter_b_id: "fighter_burns_gilbert",
    weight_class: "Welterweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: -1,
    scheduled_rounds: 3,
    odds: { fighter_a: -140, fighter_b: +120 },
    status: "scheduled"
  },
  {
    id: "fight_300_p2",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_poirier_dustin",
    fighter_b_id: "fighter_dariush_beneil",
    weight_class: "Lightweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: -2,
    scheduled_rounds: 3,
    odds: { fighter_a: -160, fighter_b: +140 },
    status: "scheduled"
  },
  {
    id: "fight_300_p3",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_whittaker_robert",
    fighter_b_id: "fighter_adesanya_israel",
    weight_class: "Middleweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: -3,
    scheduled_rounds: 3,
    odds: { fighter_a: +220, fighter_b: -270 },
    status: "scheduled"
  },
  {
    id: "fight_300_p4",
    event_id: "ufc_300_main",
    fighter_a_id: "fighter_mcgregor_conor",
    fighter_b_id: "fighter_ferguson_tony",
    weight_class: "Lightweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: -4,
    scheduled_rounds: 3,
    odds: { fighter_a: -300, fighter_b: +250 },
    status: "scheduled"
  },
  
  // UFC 301 Main Card
  {
    id: "fight_301_main",
    event_id: "ufc_301_main",
    fighter_a_id: "fighter_makhachev_islam",
    fighter_b_id: "fighter_oliveira_charles",
    weight_class: "Lightweight",
    is_title_fight: true,
    is_interim_title: false,
    is_main_event: true,
    is_co_main: false,
    bout_order: 5,
    scheduled_rounds: 5,
    odds: { fighter_a: -280, fighter_b: +230 },
    status: "scheduled"
  },
  {
    id: "fight_301_co",
    event_id: "ufc_301_main",
    fighter_a_id: "fighter_edwards_leon",
    fighter_b_id: "fighter_usman_kamaru",
    weight_class: "Welterweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: true,
    bout_order: 4,
    scheduled_rounds: 5,
    odds: { fighter_a: -120, fighter_b: +100 },
    status: "scheduled"
  },
  {
    id: "fight_301_3",
    event_id: "ufc_301_main",
    fighter_a_id: "fighter_volkanovski_alex",
    fighter_b_id: "fighter_holloway_max",
    weight_class: "Featherweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: 3,
    scheduled_rounds: 3,
    odds: { fighter_a: -175, fighter_b: +145 },
    status: "scheduled"
  },
  {
    id: "fight_301_4",
    event_id: "ufc_301_main",
    fighter_a_id: "fighter_ngannou_francis",
    fighter_b_id: "fighter_miocic_stipe",
    weight_class: "Heavyweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: 2,
    scheduled_rounds: 3,
    odds: { fighter_a: -210, fighter_b: +175 },
    status: "scheduled"
  },
  {
    id: "fight_301_5",
    event_id: "ufc_301_main",
    fighter_a_id: "fighter_gaethje_justin",
    fighter_b_id: "fighter_poirier_dustin",
    weight_class: "Lightweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: 1,
    scheduled_rounds: 3,
    odds: { fighter_a: -115, fighter_b: -105 },
    status: "scheduled"
  },
  // UFC 301 Prelims
  {
    id: "fight_301_p1",
    event_id: "ufc_301_main",
    fighter_a_id: "fighter_diaz_nate",
    fighter_b_id: "fighter_covington_colby",
    weight_class: "Welterweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: -1,
    scheduled_rounds: 3,
    odds: { fighter_a: +350, fighter_b: -450 },
    status: "scheduled"
  },
  {
    id: "fight_301_p2",
    event_id: "ufc_301_main",
    fighter_a_id: "fighter_chandler_michael",
    fighter_b_id: "fighter_mcgregor_conor",
    weight_class: "Lightweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: -2,
    scheduled_rounds: 3,
    odds: { fighter_a: +130, fighter_b: -150 },
    status: "scheduled"
  },
  {
    id: "fight_301_p3",
    event_id: "ufc_301_main",
    fighter_a_id: "fighter_ferguson_tony",
    fighter_b_id: "fighter_dariush_beneil",
    weight_class: "Lightweight",
    is_title_fight: false,
    is_interim_title: false,
    is_main_event: false,
    is_co_main: false,
    bout_order: -3,
    scheduled_rounds: 3,
    odds: { fighter_a: +280, fighter_b: -350 },
    status: "scheduled"
  }
];

// Generate salaries for all fighters in events
function generateSalariesForEvent(eventId: string): FighterSalary[] {
  const eventFights = fights.filter(f => f.event_id === eventId);
  const fighterIds = new Set<string>();
  
  eventFights.forEach(fight => {
    fighterIds.add(fight.fighter_a_id);
    fighterIds.add(fight.fighter_b_id);
  });
  
  const salaries: FighterSalary[] = [];
  
  fighterIds.forEach(fighterId => {
    const fighter = fighters.find(f => f.id === fighterId);
    if (!fighter) return;
    
    const fight = eventFights.find(f => 
      f.fighter_a_id === fighterId || f.fighter_b_id === fighterId
    );
    if (!fight) return;
    
    // Calculate salary based on various factors
    let baseSalary = 2000;
    
    // Champion bonus
    if (fighter.isChampion) baseSalary += 2500;
    
    // Ranking bonus
    if (fighter.ranking !== undefined) {
      baseSalary += Math.max(0, (15 - fighter.ranking) * 100);
    }
    
    // P4P ranking bonus
    if (fighter.p4p_ranking) {
      baseSalary += (16 - fighter.p4p_ranking) * 200;
    }
    
    // Main event bonus
    if (fight.is_main_event) baseSalary += 1500;
    if (fight.is_co_main) baseSalary += 800;
    if (fight.is_title_fight) baseSalary += 1000;
    
    // Popularity bonus (McGregor, Jones, etc.)
    if (fighterId.includes('mcgregor') || fighterId.includes('jones')) {
      baseSalary += 1500;
    }
    
    // Odds adjustment
    const odds = fight.fighter_a_id === fighterId ? fight.odds?.fighter_a : fight.odds?.fighter_b;
    if (odds && odds < 0) {
      // Favorite costs more
      baseSalary += Math.abs(odds) * 3;
    }
    
    // Cap salary
    baseSalary = Math.min(Math.max(baseSalary, 1000), 9000);
    
    salaries.push({
      id: `salary_${eventId}_${fighterId}`,
      event_id: eventId,
      fighter_id: fighterId,
      salary: Math.round(baseSalary / 100) * 100, // Round to nearest 100
      factors: {
        ranking_score: fighter.ranking || 0,
        odds_score: odds || 0,
        recent_form_score: fighter.record.wins / (fighter.record.wins + fighter.record.losses),
        popularity_score: fighterId.includes('mcgregor') ? 10 : 5
      }
    });
  });
  
  return salaries;
}

// Seed function
async function seedComprehensiveData() {
  try {
    console.log('🌱 Starting comprehensive database seed...');
    console.log(`📊 Will add ${fighters.length} fighters, ${events.length} events, ${fights.length} fights`);
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    const batch1 = db.batch();
    let deleteCount = 0;
    
    // Delete existing fighters
    const fightersSnapshot = await db.collection('fighters').get();
    fightersSnapshot.forEach(doc => {
      batch1.delete(doc.ref);
      deleteCount++;
    });
    
    // Delete existing events
    const eventsSnapshot = await db.collection('events').get();
    eventsSnapshot.forEach(doc => {
      batch1.delete(doc.ref);
      deleteCount++;
    });
    
    // Delete existing fights
    const fightsSnapshot = await db.collection('fights').get();
    fightsSnapshot.forEach(doc => {
      batch1.delete(doc.ref);
      deleteCount++;
    });
    
    // Delete existing salaries
    const salariesSnapshot = await db.collection('salaries').get();
    salariesSnapshot.forEach(doc => {
      batch1.delete(doc.ref);
      deleteCount++;
    });
    
    if (deleteCount > 0) {
      await batch1.commit();
      console.log(`✅ Deleted ${deleteCount} existing documents`);
    }
    
    // Add fighters
    console.log('👊 Adding fighters...');
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
    
    // Add events
    console.log('📅 Adding events...');
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
    
    // Add fights
    console.log('⚔️  Adding fights...');
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
    
    // Generate and add salaries
    console.log('💰 Generating salaries...');
    const salaryBatch = db.batch();
    let salaryCount = 0;
    
    for (const event of events) {
      const salaries = generateSalariesForEvent(event.id);
      for (const salary of salaries) {
        const ref = db.collection('salaries').doc(salary.id);
        salaryBatch.set(ref, {
          ...salary,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        salaryCount++;
      }
    }
    await salaryBatch.commit();
    console.log(`✅ Generated ${salaryCount} fighter salaries`);
    
    // Create global leagues for each event
    console.log('🏆 Creating leagues...');
    const leagueBatch = db.batch();
    for (const event of events) {
      const leagueRef = db.collection('leagues').doc(`league_global_${event.id}`);
      leagueBatch.set(leagueRef, {
        id: `league_global_${event.id}`,
        name: `Global League - ${event.name}`,
        type: 'global',
        mode: 'weekly',
        event_id: event.id,
        settings: {
          budget: 10000,
          team_size: 5,
          max_from_same_fight: 1,
          lock_time_minutes_before: 15,
          allow_captain: true,
          captain_multiplier: 1.5,
          apply_ppv_multiplier: event.type === 'PPV',
          ppv_multiplier: 1.5
        },
        scoring_system: 'standard',
        total_entries: 0,
        max_entries: null,
        entry_fee: 0,
        prize_pool: 0,
        status: 'open',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    await leagueBatch.commit();
    console.log(`✅ Created ${events.length} global leagues`);
    
    console.log('\n🎉 Comprehensive database seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   • ${fighters.length} fighters across all divisions`);
    console.log(`   • ${events.length} full UFC events`);
    console.log(`   • ${fights.length} scheduled fights`);
    console.log(`   • ${salaryCount} fighter salaries`);
    console.log(`   • ${events.length} fantasy leagues`);
    console.log('\n🚀 Your app now has enough data to test all fantasy features!');
    console.log('   - Build teams with 5 fighters from 14+ available per event');
    console.log('   - Test salary cap management');
    console.log('   - View saved teams in My Teams');
    console.log('   - Check leaderboards after scoring');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error seeding database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run the seed
seedComprehensiveData(); 