'use client';

import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EventsPage() {
  const events = [
    { id: 1, title: 'UFC 298', date: 'Feb 17, 2024', mainEvent: 'Volkanovski vs Topuria', fights: 12, status: 'upcoming' },
    { id: 2, title: 'UFC Fight Night', date: 'Feb 24, 2024', mainEvent: 'Moreno vs Royval 2', fights: 11, status: 'upcoming' },
    { id: 3, title: 'UFC 299', date: 'Mar 9, 2024', mainEvent: "O'Malley vs Vera 2", fights: 13, status: 'upcoming' },
    { id: 4, title: 'UFC 297', date: 'Jan 20, 2024', mainEvent: 'Strickland vs Du Plessis', fights: 12, status: 'completed' },
    { id: 5, title: 'UFC 296', date: 'Dec 16, 2023', mainEvent: 'Edwards vs Covington', fights: 13, status: 'completed' },
  ];

  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const pastEvents = events.filter(e => e.status === 'completed');

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold mb-8 text-white">Events</h1>
        
        {/* Upcoming Events */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-green-500">Upcoming Events</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map(event => (
              <Card key={event.id} className="bg-gray-900 border-gray-800 hover:border-green-500 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-green-500 text-sm font-semibold">{event.date}</span>
                    <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs">
                      {event.fights} Fights
                    </span>
                  </div>
                  <CardTitle className="text-2xl text-white">{event.title}</CardTitle>
                  <CardDescription className="text-gray-400">{event.mainEvent}</CardDescription>
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
        </section>

        {/* Past Events */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-400">Past Events</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map(event => (
              <Card key={event.id} className="bg-gray-900 border-gray-800 opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-500 text-sm">{event.date}</span>
                    <span className="bg-gray-800 text-gray-500 px-2 py-1 rounded text-xs">
                      Completed
                    </span>
                  </div>
                  <CardTitle className="text-xl text-gray-300">{event.title}</CardTitle>
                  <CardDescription className="text-gray-500">{event.mainEvent}</CardDescription>
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
        </section>
      </div>
    </div>
  );
} 