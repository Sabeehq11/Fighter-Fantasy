'use client';

import Navigation from '@/components/Navigation';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFighters } from '@/services/dataService';
import { Fighter } from '@/types';

export default function FightersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeightClass, setSelectedWeightClass] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [showChampions, setShowChampions] = useState(false);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFighters = async () => {
      try {
        const data = await getFighters();
        setFighters(data);
      } catch (error) {
        console.error('Error loading fighters:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFighters();
  }, []);

  const weightClasses = [
    'all',
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
    "Women's Bantamweight"
  ];

  const filteredFighters = useMemo(() => {
    let filtered = fighters;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.nickname && f.nickname.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by weight class
    if (selectedWeightClass !== 'all') {
      filtered = filtered.filter(f => f.division === selectedWeightClass);
    }

    // Filter champions
    if (showChampions) {
      filtered = filtered.filter(f => f.isChampion);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rank') {
        // Champions first
        if (a.isChampion && !b.isChampion) return -1;
        if (!a.isChampion && b.isChampion) return 1;
        // Then by ranking
        if (a.ranking !== null && a.ranking !== undefined && 
            b.ranking !== null && b.ranking !== undefined) {
          return a.ranking - b.ranking;
        }
        if (a.ranking === null || a.ranking === undefined) return 1;
        if (b.ranking === null || b.ranking === undefined) return -1;
        return 0;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'wins') {
        return (b.record?.wins || 0) - (a.record?.wins || 0);
      }
      return 0;
    });

    return filtered;
  }, [fighters, searchTerm, selectedWeightClass, sortBy, showChampions]);

  // Helper function to format height
  const formatHeight = (inches: number | null | undefined) => {
    if (!inches) return 'N/A';
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  // Helper function to format reach
  const formatReach = (reach: number | null | undefined) => {
    if (!reach) return 'N/A';
    return `${reach}"`;
  };

  // Helper function to determine streak (simplified)
  const getStreak = (fighter: Fighter) => {
    // This would need real fight history data
    // For now, just show record
    return `${fighter.record?.wins || 0}-${fighter.record?.losses || 0}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold mb-8 text-white">Fighters</h1>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading fighters...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 text-white">Fighters</h1>
        
        {/* Search and Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-gray-400 mb-2">Search Fighter</Label>
              <Input
                id="search"
                type="text"
                placeholder="Search by name or nickname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            {/* Weight Class Filter */}
            <div>
              <Label htmlFor="weight" className="text-gray-400 mb-2">Weight Class</Label>
              <select
                id="weight"
                value={selectedWeightClass}
                onChange={(e) => setSelectedWeightClass(e.target.value)}
                className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                {weightClasses.map(wc => (
                  <option key={wc} value={wc}>
                    {wc === 'all' ? 'All Weight Classes' : wc}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <Label htmlFor="sort" className="text-gray-400 mb-2">Sort By</Label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full h-10 px-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                <option value="rank">Rank</option>
                <option value="name">Name</option>
                <option value="wins">Wins</option>
              </select>
            </div>

            {/* Champions Toggle */}
            <div className="flex items-end">
              <Button
                variant={showChampions ? "default" : "outline"}
                onClick={() => setShowChampions(!showChampions)}
                className={showChampions 
                  ? "bg-green-500 hover:bg-green-600 text-black" 
                  : "border-green-500 text-green-500 hover:bg-green-500 hover:text-black"}
              >
                🏆 Champions Only
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-400 mb-4">
          Showing {filteredFighters.length} fighter{filteredFighters.length !== 1 ? 's' : ''}
        </p>

        {/* Fighters Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFighters.map(fighter => (
            <Card key={fighter.id} className="bg-gray-900 border-gray-800 hover:border-green-500 transition-all hover:shadow-lg hover:shadow-green-500/20">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    {fighter.isChampion ? (
                      <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                        CHAMPION
                      </span>
                    ) : fighter.ranking ? (
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        #{fighter.ranking}
                      </span>
                    ) : (
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        Unranked
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">{fighter.age ? `${fighter.age} yrs` : ''}</span>
                </div>
                <CardTitle className="text-xl text-white">
                  {fighter.name}
                  {fighter.nickname && (
                    <span className="text-sm text-gray-400 block mt-1">"{fighter.nickname}"</span>
                  )}
                </CardTitle>
                <CardDescription className="text-gray-400">{fighter.division}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Record:</span>
                    <span className="text-white ml-2">
                      {fighter.record ? `${fighter.record.wins}-${fighter.record.losses}` : 'N/A'}
                      {fighter.record?.draws ? `-${fighter.record.draws}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Finishes:</span>
                    <span className="text-white ml-2">
                      {fighter.finishes ? `${fighter.finishes.ko_tko + fighter.finishes.submissions}` : '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Height:</span>
                    <span className="text-white ml-2">{formatHeight(fighter.height_inches)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reach:</span>
                    <span className="text-white ml-2">{formatReach(fighter.reach_inches)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stance:</span>
                    <span className="text-white ml-2">{fighter.stance || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gym:</span>
                    <span className="text-white ml-2 text-xs">{fighter.gym || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Nationality:</span>
                    <span className="text-white ml-2">{fighter.nationality || 'N/A'}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={() => router.push(`/fighters/${fighter.id}`)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold" 
                    size="sm"
                  >
                    View Profile
                  </Button>
                  <Button variant="outline" className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-black" size="sm">
                    Add to Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredFighters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No fighters found matching your criteria.</p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedWeightClass('all');
                setShowChampions(false);
              }}
              className="mt-4 border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 