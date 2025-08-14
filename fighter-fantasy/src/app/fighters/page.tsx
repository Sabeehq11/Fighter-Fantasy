'use client';

import Navigation from '@/components/Navigation';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FightersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWeightClass, setSelectedWeightClass] = useState('all');
  const [sortBy, setSortBy] = useState('rank');
  const [showChampions, setShowChampions] = useState(false);

  const fighters = [
    { id: 1, name: 'Islam Makhachev', weightClass: 'Lightweight', rank: 'C', record: '25-1', salary: 11500, height: "5'10\"", reach: '70.5"', stance: 'Orthodox', streak: 'W13' },
    { id: 2, name: 'Jon Jones', weightClass: 'Heavyweight', rank: 'C', record: '27-1', salary: 12000, height: "6'4\"", reach: '84.5"', stance: 'Orthodox', streak: 'W1' },
    { id: 3, name: 'Alex Pereira', weightClass: 'Light Heavyweight', rank: 'C', record: '11-2', salary: 11000, height: "6'4\"", reach: '79"', stance: 'Orthodox', streak: 'W3' },
    { id: 4, name: 'Sean Strickland', weightClass: 'Middleweight', rank: 'C', record: '29-6', salary: 10500, height: "6'1\"", reach: '76"', stance: 'Orthodox', streak: 'L1' },
    { id: 5, name: 'Khamzat Chimaev', weightClass: 'Welterweight', rank: 3, record: '13-0', salary: 9500, height: "6'2\"", reach: '75"', stance: 'Orthodox', streak: 'W13' },
    { id: 6, name: 'Charles Oliveira', weightClass: 'Lightweight', rank: 1, record: '34-10', salary: 9000, height: "5'10\"", reach: '74"', stance: 'Orthodox', streak: 'W1' },
    { id: 7, name: 'Max Holloway', weightClass: 'Featherweight', rank: 2, record: '26-7', salary: 8500, height: "5'11\"", reach: '69"', stance: 'Orthodox', streak: 'W3' },
    { id: 8, name: 'Amanda Nunes', weightClass: "Women's Bantamweight", rank: 'C', record: '23-5', salary: 10000, height: "5'8\"", reach: '69"', stance: 'Orthodox', streak: 'RETIRED' },
    { id: 9, name: 'Dustin Poirier', weightClass: 'Lightweight', rank: 3, record: '30-8', salary: 8000, height: "5'9\"", reach: '72"', stance: 'Southpaw', streak: 'L1' },
    { id: 10, name: 'Israel Adesanya', weightClass: 'Middleweight', rank: 1, record: '24-3', salary: 9500, height: "6'4\"", reach: '80"', stance: 'Orthodox', streak: 'L1' },
  ];

  const weightClasses = [
    'all',
    'Heavyweight',
    'Light Heavyweight', 
    'Middleweight',
    'Welterweight',
    'Lightweight',
    'Featherweight',
    'Bantamweight',
    "Women's Bantamweight",
    "Women's Strawweight"
  ];

  const filteredFighters = useMemo(() => {
    let filtered = fighters;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by weight class
    if (selectedWeightClass !== 'all') {
      filtered = filtered.filter(f => f.weightClass === selectedWeightClass);
    }

    // Filter champions
    if (showChampions) {
      filtered = filtered.filter(f => f.rank === 'C');
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'rank') {
        if (a.rank === 'C' && b.rank !== 'C') return -1;
        if (a.rank !== 'C' && b.rank === 'C') return 1;
        if (typeof a.rank === 'number' && typeof b.rank === 'number') {
          return a.rank - b.rank;
        }
        return 0;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'wins') {
        const aWins = parseInt(a.record.split('-')[0]);
        const bWins = parseInt(b.record.split('-')[0]);
        return bWins - aWins;
      }
      return 0;
    });

    return filtered;
  }, [searchTerm, selectedWeightClass, sortBy, showChampions]);

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
                placeholder="Search by name..."
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
                    {fighter.rank === 'C' ? (
                      <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                        CHAMPION
                      </span>
                    ) : (
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                        #{fighter.rank}
                      </span>
                    )}
                  </div>
                  <span className="text-green-500 font-bold">${fighter.salary}</span>
                </div>
                <CardTitle className="text-xl text-white">{fighter.name}</CardTitle>
                <CardDescription className="text-gray-400">{fighter.weightClass}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Record:</span>
                    <span className="text-white ml-2">{fighter.record}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Streak:</span>
                    <span className={`ml-2 font-semibold ${
                      fighter.streak.startsWith('W') ? 'text-green-500' : 
                      fighter.streak.startsWith('L') ? 'text-red-500' : 'text-gray-400'
                    }`}>
                      {fighter.streak}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Height:</span>
                    <span className="text-white ml-2">{fighter.height}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reach:</span>
                    <span className="text-white ml-2">{fighter.reach}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Stance:</span>
                    <span className="text-white ml-2">{fighter.stance}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold" size="sm">
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