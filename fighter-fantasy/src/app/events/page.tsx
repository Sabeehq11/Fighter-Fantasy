'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, Trophy, ChevronRight } from 'lucide-react';
import { Event } from '@/types';
import { dataService } from '@/services/dataService';

export default function EventsPage() {
  const events = [
    { id: 1, title: 'UFC 298', date: 'Feb 17, 2024', location: 'Anaheim, CA', mainEvent: 'Volkanovski vs Topuria', status: 'upcoming' },
    { id: 2, title: 'UFC Fight Night', date: 'Feb 24, 2024', location: 'Mexico City', mainEvent: 'Moreno vs Royval 2', status: 'upcoming' },
    { id: 3, title: 'UFC 299', date: 'Mar 9, 2024', location: 'Miami, FL', mainEvent: "O'Malley vs Vera 2", status: 'upcoming' },
    { id: 4, title: 'UFC 297', date: 'Jan 20, 2024', location: 'Toronto', mainEvent: 'Strickland vs Du Plessis', status: 'past' },
    { id: 5, title: 'UFC 296', date: 'Dec 16, 2023', location: 'Las Vegas', mainEvent: 'Edwards vs Covington', status: 'past' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'system-ui' }}>
      {/* Navigation */}
      <nav style={{ background: '#111', borderBottom: '1px solid #333', padding: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            <span>Fighter</span>
            <span style={{ color: '#0f0' }}>Fantasy</span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
            <a href="/events" style={{ color: '#0f0', textDecoration: 'none' }}>Events</a>
            <a href="/fighters" style={{ color: '#fff', textDecoration: 'none' }}>Fighters</a>
            <a href="/rankings" style={{ color: '#fff', textDecoration: 'none' }}>Rankings</a>
            <a href="/fantasy" style={{ color: '#fff', textDecoration: 'none' }}>Fantasy</a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section style={{ padding: '80px 20px', textAlign: 'center', borderBottom: '1px solid #333' }}>
        <h1 style={{ fontSize: '64px', fontWeight: 'bold', marginBottom: '20px' }}>UFC EVENTS</h1>
        <p style={{ fontSize: '20px', color: '#999', maxWidth: '600px', margin: '0 auto' }}>
          Never miss a fight. Track upcoming events and relive historic moments.
        </p>
      </section>

      {/* Events List */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', marginBottom: '40px', color: '#0f0' }}>Upcoming Events</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {events.filter(e => e.status === 'upcoming').map(event => (
              <div key={event.id} style={{
                background: '#111',
                border: '1px solid #333',
                borderRadius: '10px',
                padding: '30px',
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr',
                gap: '20px',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ color: '#999', fontSize: '14px' }}>{event.date}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{event.title}</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', marginBottom: '5px' }}>{event.mainEvent}</div>
                  <div style={{ color: '#999' }}>{event.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button style={{
                    background: '#0f0',
                    color: '#000',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    View Card
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: '32px', marginTop: '60px', marginBottom: '40px', color: '#999' }}>Past Events</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {events.filter(e => e.status === 'past').map(event => (
              <div key={event.id} style={{
                background: '#0a0a0a',
                border: '1px solid #222',
                borderRadius: '10px',
                padding: '30px',
                display: 'grid',
                gridTemplateColumns: '1fr 2fr 1fr',
                gap: '20px',
                alignItems: 'center',
                opacity: 0.7
              }}>
                <div>
                  <div style={{ color: '#666', fontSize: '14px' }}>{event.date}</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{event.title}</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', marginBottom: '5px' }}>{event.mainEvent}</div>
                  <div style={{ color: '#666' }}>{event.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button style={{
                    background: '#333',
                    color: '#999',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}>
                    View Results
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 