'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/lib/hooks/useUser';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { logout } = useAuth();
  const { user, isAuthenticated, loading } = useUser();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/fighters', label: 'Fighters' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/fantasy', label: 'Fantasy' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with VENUM-style typography */}
          <Link href="/" className="flex items-center space-x-1 text-3xl font-bebas tracking-wider">
            <span className="text-white">FIGHTER</span>
            <span className="text-green-500">FANTASY</span>
          </Link>

          {/* Navigation Links + Auth */}
          <div className="flex items-center gap-6">
            {/* Nav Links with VENUM-style typography */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-bebas text-lg tracking-wider transition-colors hover:text-green-500 ${
                    pathname === item.href ? 'text-green-500' : 'text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-800">
              {loading ? (
                <span className="text-gray-500 text-sm">Loading...</span>
              ) : isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 h-auto p-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-black font-bold text-sm">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="text-left hidden sm:block">
                        <div className="text-xs text-green-500 font-barlow">Signed in as:</div>
                        <div className="text-sm font-bold text-white font-barlow">
                          {user?.displayName || user?.email?.split('@')[0] || 'User'}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium text-white font-barlow">My Account</p>
                        <p className="text-xs text-gray-400 font-barlow">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer font-barlow">
                        👤 Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/fantasy/my-teams" className="cursor-pointer font-barlow">
                        🎮 My Teams
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-400 cursor-pointer font-barlow">
                      🚪 Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bebas tracking-wider">
                      LOGIN
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-green-500 text-black hover:bg-green-600 font-bebas tracking-wider">
                      SIGN UP
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 