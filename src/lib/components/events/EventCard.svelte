<script lang="ts">
  import type { Event } from '$lib/types/event';
  import { Calendar, Clock, MapPin } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let event: Event;
  const dispatch = createEventDispatcher<{select: Event}>();

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
    'Divine Service': '/images/divine-service.webp',
    'Prophecies of Daniel and Revelation': '/images/daniel.webp',
    'Church Officer Training': '/images/training.webp',
    'Default': '/images/hero.webp'
  };

  function getEventImage(event: Event): string {
    console.log('Event Title:', event.title);
    console.log('Event Image URL:', event.image);
    
    if (event.image) {
      console.log('Using PocketBase image:', event.image);
      return event.image;
    }
    
    console.log('Using default image');
    return '/images/hero.webp';
  }

  function handleClick() {
    dispatch('select', event);
  }
</script>

<article 
  class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
  on:click={handleClick}
  on:keydown={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
>
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
          {#if event.location_url}
            <a 
              href={event.location_url} 
              target="_blank" 
              rel="noopener noreferrer"
              class="hover:text-blue-600 hover:underline transition-colors"
              on:click|stopPropagation
            >
              {event.location}
            </a>
          {:else if event.location}
            <a 
              href={`http://maps.apple.com/?q=${encodeURIComponent(event.location)}`}
              target="_blank" 
              rel="noopener noreferrer"
              class="hover:text-blue-600 hover:underline transition-colors"
              on:click|stopPropagation
            >
              {event.location}
            </a>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</article> 