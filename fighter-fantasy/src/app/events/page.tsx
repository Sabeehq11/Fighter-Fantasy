'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { dataService } from '@/services/dataService';
import { Event, Fight } from '@/types';

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainEvents, setMainEvents] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      // Fetch upcoming and past events
      const [upcoming, past] = await Promise.all([
        dataService.getUpcomingEvents(9),
        dataService.getPastEvents(9)
      ]);
      
      setUpcomingEvents(upcoming);
      setPastEvents(past);
      
      // Fetch main event fights for each event
      const allEvents = [...upcoming, ...past];
      const mainEventPromises = allEvents.map(async (event) => {
        const fights = await dataService.getEventFights(event.id);
        // The main event is typically the fight with the highest bout_order
        const mainFight = fights.find(f => f.is_main_event) || fights[0];
        if (mainFight) {
          // Handle both possible data structures (with names or IDs)
          const fighterAName = (mainFight as any).fighter_a_name || 'Fighter A';
          const fighterBName = (mainFight as any).fighter_b_name || 'Fighter B';
          return {
            eventId: event.id,
            mainEvent: `${fighterAName} vs ${fighterBName}`
          };
        }
        return { eventId: event.id, mainEvent: '' };
      });
      
      const mainEventResults = await Promise.all(mainEventPromises);
      const mainEventsMap: { [key: string]: string } = {};
      mainEventResults.forEach(result => {
        mainEventsMap[result.eventId] = result.mainEvent;
      });
      
      setMainEvents(mainEventsMap);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getTotalFights = (event: Event) => {
    const mainCardCount = event.main_card?.length || 0;
    const prelimsCount = event.prelims?.length || 0;
    const earlyPrelimsCount = event.early_prelims?.length || 0;
    return mainCardCount + prelimsCount + earlyPrelimsCount;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold mb-8 text-white">Events</h1>
          <div className="flex justify-center items-center h-64">
            <div className="text-white text-xl">Loading events...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 text-white">UFC Events</h1>
        
        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-green-500">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-400">No upcoming events at the moment.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map(event => (
                <Card key={event.id} className="bg-gray-900 border-gray-800 hover:border-green-500 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-green-500 text-sm font-semibold">
                        {formatDate(event.date_utc)}
                      </span>
                      <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs">
                        {getTotalFights(event)} Fights
                      </span>
                    </div>
                    <CardTitle className="text-2xl text-white">{event.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {mainEvents[event.id] || 'Main Event TBD'}
                    </CardDescription>
                    {event.venue && (
                      <p className="text-gray-500 text-sm mt-2">
                        📍 {event.venue.city}{event.venue.state ? `, ${event.venue.state}` : ''}, {event.venue.country}
                      </p>
                    )}
                    {event.type === 'PPV' && (
                      <span className="inline-block mt-2 bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded text-xs">
                        PAY-PER-VIEW
                      </span>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Link href={`/events/${event.id}`} className="flex-1">
                        <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold">
                          View Event
                        </Button>
                      </Link>
                      <Link href={`/fantasy/team-builder/${event.id}`} className="flex-1">
                        <Button variant="outline" className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-black">
                          Build Team
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Past Events */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-400">Past Events</h2>
          {pastEvents.length === 0 ? (
            <p className="text-gray-400">No past events to display.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.map(event => (
                <Card key={event.id} className="bg-gray-900 border-gray-800 opacity-75">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-500 text-sm">
                        {formatDate(event.date_utc)}
                      </span>
                      <span className="bg-gray-800 text-gray-500 px-2 py-1 rounded text-xs">
                        Completed
                      </span>
                    </div>
                    <CardTitle className="text-xl text-gray-300">{event.name}</CardTitle>
                    <CardDescription className="text-gray-500">
                      {mainEvents[event.id] || 'Results Available'}
                    </CardDescription>
                    {event.venue && (
                      <p className="text-gray-600 text-sm mt-2">
                        📍 {event.venue.city}{event.venue.state ? `, ${event.venue.state}` : ''}, {event.venue.country}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link href={`/events/${event.id}`}>
                      <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                        View Results
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 