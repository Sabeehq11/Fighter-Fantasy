'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface LeagueSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'created' | 'joined';
  leagueName: string;
  joinCode?: string;
  onViewLeague?: () => void;
}

export default function LeagueSuccessModal({ 
  isOpen, 
  onClose, 
  type,
  leagueName,
  joinCode,
  onViewLeague
}: LeagueSuccessModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (joinCode) {
      navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (joinCode && typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Join my Fighter Fantasy League!`,
        text: `Join my league "${leagueName}" on Fighter Fantasy! Use code: ${joinCode}`,
        url: window.location.origin
      }).catch(console.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black rounded-xl border border-gray-800 shadow-2xl w-full max-w-md overflow-hidden">
        {/* Logo Pattern Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex gap-8">
                <Image
                  src="/Photos/Logos/UFC.png"
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'brightness(2) invert(1)',
                  }}
                />
                <Image
                  src="/Photos/Logos/Venom.png"
                  alt=""
                  width={40}
                  height={40}
                  className="object-contain"
                  style={{
                    filter: 'brightness(2) invert(1)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {type === 'created' ? 'League Created!' : 'Successfully Joined!'}
        </h2>

        {/* League Name */}
        <p className="text-gray-400 text-center mb-6">
          {type === 'created' ? `Your league "${leagueName}" has been created.` : `You've joined "${leagueName}"!`}
        </p>

          {/* Join Code Section (for created private leagues) */}
          {type === 'created' && joinCode && (
            <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
              <p className="text-sm text-gray-400 mb-3 text-center">
                Share this code with your friends:
              </p>
              
              <div className="bg-black rounded-lg p-4 mb-3 border border-green-500/50">
                <div className="text-3xl font-bold text-green-400 text-center tracking-wider drop-shadow-lg">
                  {joinCode}
                </div>
              </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyCode}
                className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Code
                  </>
                )}
              </button>
              
              {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
                  </svg>
                  Share
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">
              Friends can join using this code in the "Join League" section
            </p>
          </div>
        )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold transition-colors"
            >
              Close
            </button>
            {onViewLeague && (
              <button
                onClick={onViewLeague}
                className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-black rounded-lg font-bold transition-colors shadow-xl"
              >
                View League
              </button>
            )}
        </div>
        </div>
      </div>
    </div>
  );
} 