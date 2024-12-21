<script lang="ts">
  import type { Event } from '$lib/types/event';
  import { Calendar, Clock, MapPin } from 'lucide-svelte';

  export let event: Event;

  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  const imageMap: Record<string, string> = {
    'Prayer Meeting': '/images/events/prayer.webp',
    'Bible Study': '/images/bible.webp',
    'Youth Event': '/images/ay.webp',
    'Health Seminar': '/images/health.webp',
    'Garden Workshop': '/images/garden.webp',
    'End of Year Praise & Prayer Service': '/images/NewYearPrayer.webp',
    'Communion Service': '/images/events/communion.webp',
    'Divine Service': '/images/events/divine-service.webp',
    'Default': '/images/events.webp'
  };

  function getEventImage(event: Event): string {
    if (event.imageUrl) return event.imageUrl;
    if (event.title === 'End of Year Praise & Prayer Service') return '/images/NewYearPrayer.webp';
    if (event.title.toLowerCase().includes('divine') || 
        event.title.toLowerCase().includes('worship') || 
        event.type === 'Divine Service' ||
        event.type === 'Worship Service') return '/images/events/divine-service.webp';
    if (event.title.toLowerCase().includes('prayer')) return '/images/events/prayer.webp';
    if (event.title.toLowerCase().includes('communion')) return '/images/events/communion.webp';
    return imageMap[event.type] || imageMap['Default'];
  }
</script>

<article class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
  <div class="relative aspect-[16/9]">
    <img
      src={getEventImage(event)}
      alt={event.title}
      class="absolute inset-0 w-full h-full object-cover"
    />
    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
    <div class="absolute bottom-4 left-4 right-4">
      <div class="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-flex items-center shadow-md">
        <Calendar class="h-4 w-4 text-blue-600 mr-2" />
        <span class="text-sm font-medium text-gray-900">
          {formatDate(event.startDate)}
        </span>
      </div>
    </div>
  </div>
  
  <div class="p-6">
    <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
      {event.title}
    </h3>
    <p class="text-gray-600 mb-4 line-clamp-2">
      {event.description}
    </p>
    
    <div class="space-y-2">
      <div class="flex items-center text-gray-600">
        <Clock class="h-5 w-5 mr-2 flex-shrink-0" />
        <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
      </div>
      {#if event.location}
        <div class="flex items-center text-gray-600">
          <MapPin class="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{event.location}</span>
        </div>
      {/if}
    </div>
  </div>
</article> 