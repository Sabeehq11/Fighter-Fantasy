'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getFighter } from '@/services/dataService';
import { Fighter } from '@/types';

export default function FighterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [fighter, setFighter] = useState<Fighter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFighter = async () => {
      try {
        if (params.id) {
          const data = await getFighter(params.id as string);
          setFighter(data);
        }
      } catch (error) {
        console.error('Error loading fighter:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFighter();
  }, [params.id]);

  // Helper functions
  const formatHeight = (inches: number | null | undefined) => {
    if (!inches) return 'N/A';
    const feet = Math.floor(inches / 12);
    const remainingInches = inches % 12;
    return `${feet}'${remainingInches}"`;
  };

  const formatReach = (reach: number | null | undefined) => {
    if (!reach) return 'N/A';
    return `${reach}"`;
  };

  const getWinPercentage = (wins: number, losses: number) => {
    const total = wins + losses;
    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  };

  const getFinishRate = (fighter: Fighter) => {
    if (!fighter.record || !fighter.finishes) return 0;
    const totalWins = fighter.record.wins;
    if (totalWins === 0) return 0;
    const finishes = (fighter.finishes.ko_tko || 0) + (fighter.finishes.submissions || 0);
    return Math.round((finishes / totalWins) * 100);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const getDebutYear = (fighter: Fighter) => {
    if (!fighter.ufc_debut_date) return 'N/A';
    const date = new Date(fighter.ufc_debut_date);
    return date.getFullYear().toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <div className="text-white text-xl mt-4">Loading fighter profile...</div>
        </div>
      </div>
    );
  }

  if (!fighter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Fighter not found</p>
            <button 
              onClick={() => router.push('/fighters')}
              className="mt-4 bg-green-500 hover:bg-green-600 text-black px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Back to Fighters
            </button>
          </div>
        </div>
      </div>
    );
  }

  const wins = fighter.record?.wins || 0;
  const losses = fighter.record?.losses || 0;
  const draws = fighter.record?.draws || 0;
  const noContests = fighter.record?.no_contests || 0;
  const totalFights = wins + losses + draws + noContests;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-20">
        <button 
          onClick={() => router.push('/fighters')}
          className="flex items-center gap-2 bg-black/50 backdrop-blur-sm border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 px-4 py-2 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Fighters
        </button>
      </div>
      
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-emerald-600/10 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-500/5 to-emerald-500/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Fighter Info */}
            <div className="space-y-6">
              {/* Name and Title */}
              <div>
                <h1 className="text-5xl lg:text-7xl font-bold text-white mb-2">
                  {fighter.name}
                </h1>
                {fighter.nickname && (
                  <p className="text-2xl text-gray-300 italic">"{fighter.nickname}"</p>
                )}
              </div>

              {/* Division and Ranking */}
              <div className="flex items-center gap-4">
                <span className="text-xl text-green-400 font-semibold">
                  {fighter.division}
                </span>
                {fighter.isChampion && (
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    🏆 CHAMPION
                  </span>
                )}
                {fighter.ranking && !fighter.isChampion && (
                  <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                    #{fighter.ranking}
                  </span>
                )}
              </div>

              {/* Social Media Links (Placeholder) */}
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <span className="text-white">𝕏</span>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <span className="text-white">📷</span>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <span className="text-white">▶️</span>
                </button>
                <button className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                  <span className="text-white">🎵</span>
                </button>
              </div>

              {/* Fantasy Button */}
              <div className="flex gap-4">
                <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-black font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg">
                  Add to Fantasy Team
                </button>
                <button className="bg-gray-800/70 backdrop-blur hover:bg-gray-700/70 text-white font-medium py-3 px-6 rounded-lg transition-all border border-gray-700">
                  View Fight History
                </button>
              </div>
            </div>

            {/* Right Side - Fighter Image Placeholder */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Placeholder for fighter image */}
                <div className="w-80 h-96 bg-gradient-to-b from-gray-800/50 to-transparent rounded-2xl flex items-center justify-center">
                  <span className="text-gray-600 text-8xl">🥊</span>
                </div>
                {/* Decorative number */}
                {fighter.ranking && (
                  <div className="absolute -bottom-6 -right-6 text-9xl font-bold text-gray-800/30">
                    {fighter.ranking}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800/50 to-gray-900 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Fights</p>
              <p className="text-4xl font-bold text-white">{totalFights}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Wins</p>
              <p className="text-4xl font-bold text-green-400">{wins}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Losses</p>
              <p className="text-4xl font-bold text-red-400">{losses}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Win Rate</p>
              <p className="text-4xl font-bold text-yellow-400">{getWinPercentage(wins, losses)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Fighter Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Professional Record Section */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Professional Record</h2>
              
              {/* Record Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">{wins}</p>
                  <p className="text-gray-400 text-sm mt-1">Wins</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-400">{losses}</p>
                  <p className="text-gray-400 text-sm mt-1">Losses</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-400">{draws}</p>
                  <p className="text-gray-400 text-sm mt-1">Draws</p>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-gray-400">{noContests}</p>
                  <p className="text-gray-400 text-sm mt-1">No Contest</p>
                </div>
              </div>

              {/* Win Rate Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-white font-semibold">{getWinPercentage(wins, losses)}%</span>
                </div>
                <div className="bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${getWinPercentage(wins, losses)}%` }}
                  />
                </div>
              </div>

              {/* Finish Methods */}
              {fighter.finishes && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-orange-400">{fighter.finishes.ko_tko || 0}</p>
                    <p className="text-gray-400 text-sm mt-1">KO/TKO</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{fighter.finishes.submissions || 0}</p>
                    <p className="text-gray-400 text-sm mt-1">Submissions</p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">{fighter.finishes.decisions || 0}</p>
                    <p className="text-gray-400 text-sm mt-1">Decisions</p>
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <span className="text-gray-400">Finish Rate: </span>
                <span className="text-2xl font-bold text-green-400">{getFinishRate(fighter)}%</span>
              </div>
            </div>

            {/* Physical Attributes */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Physical Attributes</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Height</p>
                  <p className="text-2xl font-bold text-white">{formatHeight(fighter.height_inches)}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Reach</p>
                  <p className="text-2xl font-bold text-white">{formatReach(fighter.reach_inches)}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Weight</p>
                  <p className="text-2xl font-bold text-white">{fighter.weight_lbs || 'N/A'} lbs</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Stance</p>
                  <p className="text-2xl font-bold text-white">{fighter.stance || 'N/A'}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Age</p>
                  <p className="text-2xl font-bold text-white">{fighter.age || 'N/A'}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Total Fights</p>
                  <p className="text-2xl font-bold text-white">{totalFights}</p>
                </div>
              </div>
            </div>

            {/* Background Information */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Background</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Nationality</p>
                  <p className="text-xl font-semibold text-white">{fighter.nationality || 'N/A'}</p>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Hometown</p>
                  <p className="text-xl font-semibold text-white">{fighter.hometown || 'N/A'}</p>
                </div>
                <div className="lg:col-span-2 bg-gray-800/30 rounded-xl p-4">
                  <p className="text-gray-400 text-sm mb-2">Training Camp</p>
                  <p className="text-xl font-semibold text-white">{fighter.gym || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Additional Info */}
          <div className="space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">BORN</p>
                <p className="text-white font-semibold">{formatDate(fighter.date_of_birth)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">AGE</p>
                <p className="text-white font-semibold text-xl">{fighter.age || 'N/A'} YEARS</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">NATIONALITY</p>
                <p className="text-white font-semibold">{fighter.nationality || 'N/A'}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 rounded-xl p-4">
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">HEIGHT</p>
                <p className="text-white font-semibold text-xl">{formatHeight(fighter.height_inches)}</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">DEBUT</p>
                <p className="text-white font-semibold">{getDebutYear(fighter)}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4">
                <p className="text-gray-300 text-xs uppercase tracking-wider mb-1">REACH</p>
                <p className="text-white font-semibold text-xl">{formatReach(fighter.reach_inches)}</p>
              </div>
            </div>

            {/* Fighting Stats */}
            {fighter.stats && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Fight Stats</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Sig. Strikes/Min</span>
                      <span className="text-green-400 font-semibold">
                        {fighter.stats.sig_strikes_per_min?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full rounded-full"
                        style={{ width: `${Math.min((fighter.stats.sig_strikes_per_min || 0) * 20, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Strike Accuracy</span>
                      <span className="text-blue-400 font-semibold">
                        {fighter.stats.sig_strike_accuracy || 'N/A'}%
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${fighter.stats.sig_strike_accuracy || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Strike Defense</span>
                      <span className="text-purple-400 font-semibold">
                        {fighter.stats.sig_strike_defense || 'N/A'}%
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${fighter.stats.sig_strike_defense || 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Takedown Defense</span>
                      <span className="text-orange-400 font-semibold">
                        {fighter.stats.takedown_defense || 'N/A'}%
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-orange-500 h-full rounded-full"
                        style={{ width: `${fighter.stats.takedown_defense || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attribute Overview Placeholder */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                Attribute Overview
                <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400">Coming Soon</span>
              </h3>
              <div className="aspect-square bg-gray-800/30 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">📊</div>
                  <p className="text-gray-500 text-sm">Skill radar chart</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Fights Section (placeholder) */}
        <div className="mt-12 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Fights</h2>
          <div className="text-center py-8">
            <p className="text-gray-500">Fight history coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 