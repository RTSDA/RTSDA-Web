'use client';

import { EventsHero } from '@/components/events/EventsHero';
import { EventList } from '@/components/events/EventList';

export default function EventsPage() {
  return (
    <div>
      <EventsHero />
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <EventList />
      </div>
    </div>
  );
}
