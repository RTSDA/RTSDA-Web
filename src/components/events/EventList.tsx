import { Event } from '@/types/event';
import { EventCard } from './EventCard';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState } from 'react';

// Mock data for development
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Weekly Prayer Meeting',
    description: 'Join us for our weekly prayer meeting where we come together as a community to share our prayers and support one another.',
    startDate: Timestamp.fromDate(new Date('2024-12-18T18:30:00')),
    endDate: Timestamp.fromDate(new Date('2024-12-18T19:30:00')),
    location: 'Church Sanctuary',
    isPublished: true,
    isDeleted: false,
    recurrenceType: 'weekly',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '2',
    title: 'Sabbath School',
    description: 'Adult and children\'s Sabbath School classes studying God\'s word together.',
    startDate: Timestamp.fromDate(new Date('2024-12-21T09:15:00')),
    endDate: Timestamp.fromDate(new Date('2024-12-21T10:45:00')),
    location: 'Main Hall',
    isPublished: true,
    isDeleted: false,
    recurrenceType: 'weekly',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '3',
    title: 'Divine Service',
    description: 'Our main worship service featuring inspiring messages and uplifting music.',
    startDate: Timestamp.fromDate(new Date('2024-12-21T11:00:00')),
    endDate: Timestamp.fromDate(new Date('2024-12-21T12:30:00')),
    location: 'Church Sanctuary',
    isPublished: true,
    isDeleted: false,
    recurrenceType: 'weekly',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: '4',
    title: 'Fellowship Lunch',
    description: 'Join us for a vegetarian potluck lunch and fellowship after the Divine Service.',
    startDate: Timestamp.fromDate(new Date('2024-12-21T12:30:00')),
    endDate: Timestamp.fromDate(new Date('2024-12-21T14:00:00')),
    location: 'Fellowship Hall',
    isPublished: true,
    isDeleted: false,
    recurrenceType: 'weekly',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        if (!db) {
          console.log('Using mock data for development');
          setEvents(mockEvents);
          setLoading(false);
          return;
        }

        console.log('Fetching events from Firebase...');
        const eventsCollection = collection(db, 'events');
        const eventsQuery = query(
          eventsCollection,
          where('isPublished', '==', true),
          orderBy('startDate', 'asc'),
          orderBy('__name__', 'asc')
        );
        
        const eventSnapshot = await getDocs(eventsQuery);
        console.log('Raw Firebase data:', eventSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const eventList = eventSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Add specific image for End of Year Prayer & Praise Service
            if (data.title === 'End of Year Prayer & Praise Service') {
              data.imageUrl = '/images/NewYearPrayer.webp';
            }
            return {
              id: doc.id,
              ...data,
              startDate: data.startDate as Timestamp,
              endDate: data.endDate as Timestamp,
              createdAt: data.createdAt as Timestamp,
              updatedAt: data.updatedAt as Timestamp,
            } as Event;
          })
          .filter(event => !event.isDeleted && event.startDate.toDate() >= new Date());
        
        console.log('Processed events:', eventList);
        setEvents(eventList);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
        if (process.env.NODE_ENV === 'development') {
          console.log('Falling back to mock data');
          setEvents(mockEvents);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
