<script lang="ts">
  import type { Event } from '$lib/types/event';
  import { Calendar, Clock, MapPin, X } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  export let event: Event | null = null;
  const dispatch = createEventDispatcher<{close: void}>();

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

  function handleClose() {
    dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if event}
  <div 
    class="fixed inset-0 z-50 overflow-y-auto"
    transition:fade={{ duration: 200 }}
  >
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
      on:click={handleClose}
    ></div>

    <!-- Modal -->
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div 
        class="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full"
        transition:scale={{ duration: 200, start: 0.95 }}
      >
        <!-- Close button -->
        <button
          class="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          on:click={handleClose}
        >
          <X class="w-6 h-6 text-gray-500" />
          <span class="sr-only">Close</span>
        </button>

        <!-- Content -->
        <div class="p-6 sm:p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
          
          <div class="space-y-4 mb-6">
            <div class="flex items-center text-gray-600">
              <Calendar class="h-5 w-5 mr-3 flex-shrink-0 text-blue-600" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div class="flex items-center text-gray-600">
              <Clock class="h-5 w-5 mr-3 flex-shrink-0 text-blue-600" />
              <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
            </div>
            {#if event.location}
              <div class="flex items-center text-gray-600">
                <MapPin class="h-5 w-5 mr-3 flex-shrink-0 text-blue-600" />
                {#if event.location_url}
                  <a 
                    href={event.location_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="hover:text-blue-600 hover:underline transition-colors"
                  >
                    {event.location}
                  </a>
                {:else if event.location}
                  <a 
                    href={`http://maps.apple.com/?q=${encodeURIComponent(event.location)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="hover:text-blue-600 hover:underline transition-colors"
                  >
                    {event.location}
                  </a>
                {/if}
              </div>
            {/if}
          </div>

          <div class="prose prose-blue max-w-none">
            <p class="text-gray-600 whitespace-pre-line">{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if} 