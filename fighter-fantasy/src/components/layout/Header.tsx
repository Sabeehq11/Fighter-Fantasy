'use client';

import { useState } from 'react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-bg-primary/80 backdrop-blur-xl border-b border-border">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fighters, events, or stats..."
                className="w-full pl-10 pr-4 py-2.5 bg-bg-tertiary border border-border rounded-xl text-white placeholder-text-muted focus:outline-none focus:border-accent-purple focus:ring-1 focus:ring-accent-purple/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4 ml-8">
            {/* Quick Actions */}
            <button className="p-2.5 hover:bg-bg-tertiary rounded-lg transition-colors group">
              <svg className="w-5 h-5 text-text-secondary group-hover:text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 hover:bg-bg-tertiary rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-text-secondary group-hover:text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-red rounded-full"></span>
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Notifications</h3>
                      <button className="text-xs text-accent-purple hover:text-accent-violet">Mark all as read</button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {[
                      { title: 'Contest Started', desc: 'UFC 310 GPP is now live', time: '5 min ago', unread: true },
                      { title: 'Lineup Set', desc: 'Your lineup for UFC 309 is confirmed', time: '2 hours ago', unread: true },
                      { title: 'Contest Won!', desc: 'You placed #127 in UFC 308 GPP', time: '1 day ago', unread: false },
                    ].map((notif, i) => (
                      <div key={i} className={`p-4 border-b border-border/50 hover:bg-bg-tertiary/50 transition-colors cursor-pointer ${notif.unread ? 'bg-accent-purple/5' : ''}`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-accent-purple' : 'bg-transparent'}`}></div>
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{notif.title}</div>
                            <div className="text-text-muted text-xs mt-0.5">{notif.desc}</div>
                            <div className="text-text-muted text-xs mt-1">{notif.time}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-bg-tertiary/50 text-center">
                    <button className="text-accent-purple text-sm font-medium hover:text-accent-violet">View all notifications</button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3 pl-4 border-l border-border">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">John Doe</div>
                <div className="text-xs text-text-muted">Premium</div>
              </div>
              <button className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg hover:shadow-accent-purple/30 transition-all">
                JD
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 