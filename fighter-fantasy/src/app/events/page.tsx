'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Event } from '@/types';
// import { dataService } from '@/services/dataService';
import { simpleDataService } from '@/services/dataService-simple';

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        // Fetch all events and filter client-side
        const allEvents = await simpleDataService.getAllEvents();
        const upcoming = allEvents.filter(e => e.status === 'upcoming');
        const past = allEvents.filter(e => e.status === 'completed');
        
        console.log('Fetched events:', { upcoming, past, total: allEvents.length });
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-text-secondary">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">UFC Events</h1>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-accent-red">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-text-secondary">No upcoming events scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block bg-bg-secondary border border-border rounded-lg overflow-hidden hover:border-accent-red transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      event.type === 'PPV' 
                        ? 'bg-accent-gold/20 text-accent-gold' 
                        : 'bg-accent-blue/20 text-accent-blue'
                    }`}>
                      {event.type}
                    </span>
                    <span className="text-xs text-accent-green">UPCOMING</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                  <p className="text-text-secondary text-sm mb-1">
                    {formatDate(event.date_utc)}
                  </p>
                  <p className="text-text-secondary text-sm mb-3">
                    {formatTime(event.date_utc)}
                  </p>
                  <p className="text-text-muted text-sm">
                    📍 {event.venue.city}, {event.venue.country}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Past Events */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-text-secondary">Past Events</h2>
        {pastEvents.length === 0 ? (
          <p className="text-text-secondary">No past events to display.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block bg-bg-secondary/50 border border-border/50 rounded-lg overflow-hidden hover:border-accent-red/50 transition-colors opacity-75"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      event.type === 'PPV' 
                        ? 'bg-accent-gold/10 text-accent-gold/70' 
                        : 'bg-accent-blue/10 text-accent-blue/70'
                    }`}>
                      {event.type}
                    </span>
                    <span className="text-xs text-text-muted">COMPLETED</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-text-secondary">{event.name}</h3>
                  <p className="text-text-muted text-sm mb-1">
                    {formatDate(event.date_utc)}
                  </p>
                  <p className="text-text-muted text-sm">
                    📍 {event.venue.city}, {event.venue.country}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
} 