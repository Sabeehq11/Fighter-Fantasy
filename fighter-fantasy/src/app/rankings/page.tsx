'use client';

import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function RankingsPage() {
  const rankings = {
    'Heavyweight': [
      { rank: 'C', name: 'Jon Jones', record: '27-1', country: '🇺🇸' },
      { rank: 1, name: 'Stipe Miocic', record: '20-4', country: '🇺🇸' },
      { rank: 2, name: 'Tom Aspinall', record: '13-3', country: '🇬🇧' },
      { rank: 3, name: 'Sergei Pavlovich', record: '18-2', country: '🇷🇺' },
      { rank: 4, name: 'Curtis Blaydes', record: '18-4', country: '🇺🇸' },
    ],
    'Light Heavyweight': [
      { rank: 'C', name: 'Alex Pereira', record: '10-2', country: '🇧🇷' },
      { rank: 1, name: 'Jamahal Hill', record: '12-2', country: '🇺🇸' },
      { rank: 2, name: 'Jiri Prochazka', record: '30-4', country: '🇨🇿' },
      { rank: 3, name: 'Magomed Ankalaev', record: '18-1', country: '🇷🇺' },
    ],
    'Middleweight': [
      { rank: 'C', name: 'Sean Strickland', record: '28-5', country: '🇺🇸' },
      { rank: 1, name: 'Israel Adesanya', record: '24-3', country: '🇳🇬' },
      { rank: 2, name: 'Robert Whittaker', record: '25-7', country: '🇦🇺' },
      { rank: 3, name: 'Jared Cannonier', record: '16-6', country: '🇺🇸' },
    ],
    'Welterweight': [
      { rank: 'C', name: 'Leon Edwards', record: '22-3', country: '🇬🇧' },
      { rank: 1, name: 'Kamaru Usman', record: '20-3', country: '🇳🇬' },
      { rank: 2, name: 'Colby Covington', record: '17-4', country: '🇺🇸' },
      { rank: 3, name: 'Belal Muhammad', record: '23-3', country: '🇺🇸' },
    ],
    'Lightweight': [
      { rank: 'C', name: 'Islam Makhachev', record: '25-1', country: '🇷🇺' },
      { rank: 1, name: 'Charles Oliveira', record: '34-9', country: '🇧🇷' },
      { rank: 2, name: 'Justin Gaethje', record: '25-4', country: '🇺🇸' },
      { rank: 3, name: 'Dustin Poirier', record: '30-8', country: '🇺🇸' },
    ],
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-2 text-white">Rankings</h1>
        <p className="text-gray-400 mb-8">Official UFC Rankings by Weight Division</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(rankings).map(([division, fighters]) => (
            <Card key={division} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">{division}</CardTitle>
                <CardDescription className="text-gray-400">
                  Top {fighters.length} Fighters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fighters.map((fighter, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        fighter.rank === 'C' 
                          ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-600/50' 
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${fighter.rank === 'C' 
                            ? 'bg-yellow-500 text-black' 
                            : 'bg-gray-700 text-gray-300'}
                        `}>
                          {fighter.rank === 'C' ? '👑' : fighter.rank}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{fighter.name}</span>
                            <span className="text-lg">{fighter.country}</span>
                          </div>
                          <div className="text-gray-500 text-sm">{fighter.record}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* P4P Rankings */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6 text-green-500">Pound-for-Pound</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="pt-6">
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { rank: 1, name: 'Islam Makhachev', division: 'Lightweight', country: '🇷🇺' },
                  { rank: 2, name: 'Jon Jones', division: 'Heavyweight', country: '🇺🇸' },
                  { rank: 3, name: 'Alex Pereira', division: 'Light Heavyweight', country: '🇧🇷' },
                  { rank: 4, name: 'Leon Edwards', division: 'Welterweight', country: '🇬🇧' },
                  { rank: 5, name: 'Alexander Volkanovski', division: 'Featherweight', country: '🇦🇺' },
                ].map((fighter) => (
                  <div
                    key={fighter.rank}
                    className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center font-bold">
                      {fighter.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{fighter.name}</span>
                        <span className="text-lg">{fighter.country}</span>
                      </div>
                      <div className="text-gray-500 text-sm">{fighter.division}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 