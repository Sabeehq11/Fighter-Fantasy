'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Fighter, WeightDivision } from '@/types';
// import { dataService } from '@/services/dataService';
import { simpleDataService } from '@/services/dataService-simple';

const divisions: WeightDivision[] = [
  'Heavyweight',
  'Light Heavyweight',
  'Middleweight',
  'Welterweight',
  'Lightweight',
  'Featherweight',
  'Bantamweight',
  'Flyweight',
  "Women's Featherweight",
  "Women's Bantamweight",
  "Women's Flyweight",
  "Women's Strawweight"
];

export default function FightersPage() {
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [filteredFighters, setFilteredFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<WeightDivision | 'all'>('all');

  useEffect(() => {
    async function fetchFighters() {
      try {
        const allFighters = await simpleDataService.getAllFighters();
        setFighters(allFighters);
        setFilteredFighters(allFighters);
      } catch (error) {
        console.error('Error fetching fighters:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFighters();
  }, []);

  useEffect(() => {
    let filtered = fighters;

    // Filter by division
    if (selectedDivision !== 'all') {
      filtered = filtered.filter(f => f.division === selectedDivision);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(term) ||
        f.nickname?.toLowerCase().includes(term)
      );
    }

    setFilteredFighters(filtered);
  }, [searchTerm, selectedDivision, fighters]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-text-secondary">Loading fighters...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">UFC Fighters</h1>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search fighters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent-red text-white placeholder-text-muted"
          />

          {/* Division Filter */}
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value as WeightDivision | 'all')}
            className="px-4 py-2 bg-bg-secondary border border-border rounded-lg focus:outline-none focus:border-accent-red text-white"
          >
            <option value="all">All Divisions</option>
            {divisions.map(division => (
              <option key={division} value={division}>{division}</option>
            ))}
          </select>
        </div>

        <p className="text-text-secondary text-sm">
          Showing {filteredFighters.length} of {fighters.length} fighters
        </p>
      </div>

      {/* Fighters Grid */}
      {filteredFighters.length === 0 ? (
        <p className="text-text-secondary text-center py-8">No fighters found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFighters.map((fighter) => (
            <Link
              key={fighter.id}
              href={`/fighters/${fighter.id}`}
              className="block bg-bg-secondary border border-border rounded-lg overflow-hidden hover:border-accent-red transition-all hover:transform hover:scale-105"
            >
              <div className="p-6">
                {/* Fighter Image Placeholder */}
                <div className="w-24 h-24 mx-auto mb-4 bg-bg-tertiary rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-text-muted">
                    {fighter.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Fighter Info */}
                <h3 className="text-lg font-semibold text-center mb-1">{fighter.name}</h3>
                {fighter.nickname && (
                  <p className="text-sm text-accent-gold text-center mb-2">"{fighter.nickname}"</p>
                )}
                
                <div className="text-center space-y-1">
                  <p className="text-sm text-text-secondary">{fighter.division}</p>
                  <p className="text-lg font-semibold">
                    {fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws}
                  </p>
                  
                  {fighter.isChampion && (
                    <span className="inline-block px-2 py-1 bg-accent-gold/20 text-accent-gold text-xs font-semibold rounded">
                      CHAMPION
                    </span>
                  )}
                  {fighter.ranking && !fighter.isChampion && (
                    <span className="inline-block px-2 py-1 bg-accent-blue/20 text-accent-blue text-xs font-semibold rounded">
                      #{fighter.ranking}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 