import { Event } from '@/types/event';
import { CalendarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

interface EventCardProps {
  event: Event;
}

const getEventImage = (event: Event) => {
  // If event has a custom image, use it
  if (event.imageUrl) {
    return event.imageUrl;
  }

  // Special case for End of Year Prayer & Praise Service
  if (event.title === 'End of Year Praise & Prayer Service') {
    return '/images/NewYearPrayer.webp';
  }

  // Default images based on event title/description keywords
  const title = event.title.toLowerCase();
  const description = event.description.toLowerCase();
  
  if (title.includes('communion') || description.includes('communion')) {
    return '/images/events/communion.webp';
  }
  if (title.includes('prayer') || description.includes('prayer')) {
    return '/images/events/prayer.webp';
  }
  if (title.includes('sabbath school') || description.includes('sabbath school')) {
    return '/images/events/sabbath-school.webp';
  }
  if (title.includes('fellowship') || title.includes('potluck') || 
      description.includes('fellowship') || description.includes('potluck')) {
    return '/images/events/fellowship.webp';
  }
  if (title.includes('divine service') || title.includes('worship service') ||
      description.includes('divine service') || description.includes('worship service')) {
    return '/images/events/worship.webp';
  }

  // Default event image
  return '/images/events/default.webp';
};

export function EventCard({ event }: EventCardProps) {
  const formatDate = (timestamp: any) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (timestamp: any) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getGoogleCalendarUrl = () => {
    const start = event.startDate.toDate();
    const end = event.endDate.toDate();
    
    const formatGoogleDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      details: event.description,
      location: event.location,
      dates: `${formatGoogleDate(start)}/${formatGoogleDate(end)}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
      <div className="flex-shrink-0 relative h-48">
        <Image
          className="h-48 w-full object-cover"
          src={getEventImage(event)}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between bg-white p-6">
        <div className="flex-1">
          <div className="mt-2">
            <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
            <p className="mt-3 text-base text-gray-500">{event.description}</p>
          </div>
          <div className="mt-6 flex items-center text-sm text-gray-500">
            <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            {formatDate(event.startDate)}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            {formatTime(event.startDate)} - {formatTime(event.endDate)}
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
            {event.location}
          </div>
          <div className="mt-4">
            <a
              href={getGoogleCalendarUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add to Google Calendar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
