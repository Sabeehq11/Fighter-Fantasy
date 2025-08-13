'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useUser } from '@/lib/hooks/useUser';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, userProfile, isAuthenticated, loading } = useUser();
  const { logout } = useAuth();
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/fighters', label: 'Fighters' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/fantasy', label: 'Fantasy' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === href;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
      router.push('/login'); // Go to login page after logout
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="bg-bg-secondary border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-accent-red to-accent-gold bg-clip-text text-transparent">
              Fighter Fantasy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-accent-red ${
                  isActive(item.href)
                    ? 'text-accent-red font-semibold'
                    : 'text-text-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Auth Section */}
            {!loading && (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-border">
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Profile"
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-bg-tertiary flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {userProfile?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {userProfile?.displayName || 'Profile'}
                      </span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-bg-secondary border border-border rounded-md shadow-lg py-1 z-50">
                        <Link
                          href="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/fantasy/my-teams"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                        >
                          My Teams
                        </Link>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-md transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-text-secondary hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2 px-4 transition-colors hover:bg-bg-tertiary rounded ${
                  isActive(item.href)
                    ? 'text-accent-red font-semibold'
                    : 'text-text-secondary'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Mobile Auth Section */}
            {!loading && (
              <div className="mt-4 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-4 text-text-secondary hover:bg-bg-tertiary rounded"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/fantasy/my-teams"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-4 text-text-secondary hover:bg-bg-tertiary rounded"
                    >
                      My Teams
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 px-4 text-text-secondary hover:bg-bg-tertiary rounded"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-4 text-text-secondary hover:bg-bg-tertiary rounded"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-4 text-accent hover:bg-bg-tertiary rounded"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
} 