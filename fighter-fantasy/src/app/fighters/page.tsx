'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface Fighter {
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
  profile_image_url?: string;
  nationality?: string;
  height_inches?: number;
  reach_inches?: number;
  weight_lbs?: number;
  stance?: string;
  age?: number;
  isActive: boolean;
}

const divisions = [
  'Heavyweight',
  'Light Heavyweight',
  'Middleweight',
  'Welterweight',
  'Lightweight',
  'Featherweight',
  'Bantamweight',
  'Flyweight',
  "Women's Strawweight",
  "Women's Flyweight",
  "Women's Bantamweight",
  "Women's Featherweight"
];

export default function FightersPage() {
  const fighters = [
    { id: 1, name: 'Alexander Volkanovski', weightClass: 'Featherweight', record: '26-3-0', rank: 'C', country: '🇦🇺' },
    { id: 2, name: 'Islam Makhachev', weightClass: 'Lightweight', record: '25-1-0', rank: 'C', country: '🇷🇺' },
    { id: 3, name: 'Jon Jones', weightClass: 'Heavyweight', record: '27-1-0', rank: 'C', country: '🇺🇸' },
    { id: 4, name: 'Leon Edwards', weightClass: 'Welterweight', record: '22-3-0', rank: 'C', country: '🇬🇧' },
    { id: 5, name: 'Sean Strickland', weightClass: 'Middleweight', record: '28-5-0', rank: 'C', country: '🇺🇸' },
    { id: 6, name: 'Max Holloway', weightClass: 'Featherweight', record: '25-7-0', rank: '1', country: '🇺🇸' },
    { id: 7, name: 'Charles Oliveira', weightClass: 'Lightweight', record: '34-9-0', rank: '2', country: '🇧🇷' },
    { id: 8, name: 'Kamaru Usman', weightClass: 'Welterweight', record: '20-3-0', rank: '2', country: '🇳🇬' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
      {/* Navigation */}
      <nav style={{ background: '#111', borderBottom: '1px solid #333', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span>Fighter</span>
            <span style={{ color: '#0f0' }}>Fantasy</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
            <a href="/events" style={{ color: '#fff', textDecoration: 'none' }}>Events</a>
            <a href="/fighters" style={{ color: '#0f0', textDecoration: 'none' }}>Fighters</a>
            <a href="/rankings" style={{ color: '#fff', textDecoration: 'none' }}>Rankings</a>
            <a href="/fantasy" style={{ color: '#fff', textDecoration: 'none' }}>Fantasy</a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section style={{ padding: '80px 20px', textAlign: 'center', borderBottom: '1px solid #333' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '20px' }}>FIGHTERS</h1>
        <p style={{ fontSize: '20px', color: '#999', maxWidth: '600px', margin: '0 auto' }}>
          Explore comprehensive fighter profiles, stats, and fight history.
        </p>
      </section>

      {/* Search Bar */}
      <section style={{ padding: '40px 20px', borderBottom: '1px solid #222' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <input
            type="text"
            placeholder="Search fighters..."
            style={{
              width: '100%',
              padding: '15px 20px',
              fontSize: '18px',
              background: '#111',
              border: '1px solid #333',
              borderRadius: '5px',
              color: '#fff'
            }}
          />
        </div>
      </section>

      {/* Fighters Grid */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {fighters.map(fighter => (
              <div key={fighter.id} style={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '25px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <span style={{ fontSize: '24px' }}>{fighter.country}</span>
                  <span style={{
                    background: fighter.rank === 'C' ? '#ffd700' : '#333',
                    color: fighter.rank === 'C' ? '#000' : '#fff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {fighter.rank === 'C' ? 'CHAMPION' : `#${fighter.rank}`}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>{fighter.name}</h3>
                <div style={{ color: '#999', marginBottom: '5px' }}>{fighter.weightClass}</div>
                <div style={{ fontSize: '18px', color: '#0f0' }}>{fighter.record}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 