<script lang="ts">
  import { onMount } from 'svelte';
  import { getEvents } from '$lib/services/eventService';
  import type { Event } from '$lib/types/event';
  import EventCard from './EventCard.svelte';
  import EventModal from './EventModal.svelte';
  import { Calendar } from 'lucide-svelte';

  let events: Event[] = [];
  let loading = true;
  let error: string | null = null;
  let selectedEvent: Event | null = null;

  async function loadEvents() {
    try {
      console.log('EventList: Starting to load events');
      events = await getEvents();
      console.log('EventList: Events loaded successfully:', events);
    } catch (e) {
      console.error('EventList: Error loading events:', e);
      error = e instanceof Error ? e.message : 'Failed to load events. Please try again later.';
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    console.log('EventList: Component mounted');
    loadEvents();
  });

  function handleEventSelect(event: CustomEvent<Event>) {
    selectedEvent = event.detail;
  }

  function handleModalClose() {
    selectedEvent = null;
  }
</script>

<div class="relative">
  {#if loading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each Array(3) as _}
        <div class="animate-pulse">
          <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div class="aspect-w-16 aspect-h-9 bg-gray-200">
              <div class="absolute top-4 left-4 bg-gray-300 rounded-lg w-32 h-8"></div>
            </div>
            <div class="p-6 space-y-4">
              <div class="h-7 bg-gray-200 rounded-lg w-3/4"></div>
              <div class="space-y-2">
                <div class="h-4 bg-gray-200 rounded-lg"></div>
                <div class="h-4 bg-gray-200 rounded-lg w-5/6"></div>
                <div class="h-4 bg-gray-200 rounded-lg w-4/6"></div>
              </div>
              <div class="space-y-3 pt-4">
                <div class="flex items-center">
                  <div class="w-5 h-5 rounded-full bg-gray-200 mr-3"></div>
                  <div class="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                </div>
                <div class="flex items-center">
                  <div class="w-5 h-5 rounded-full bg-gray-200 mr-3"></div>
                  <div class="h-4 bg-gray-200 rounded-lg w-2/3"></div>
                </div>
                <div class="pt-4">
                  <div class="h-11 bg-gray-200 rounded-lg w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if error}
    <div class="max-w-2xl mx-auto">
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="flex-1 text-sm text-red-700">
            <p class="font-medium">Error loading events</p>
            <p class="mt-1">{error}</p>
          </div>
        </div>
      </div>
    </div>
  {:else if events.length === 0}
    <div class="max-w-2xl mx-auto text-center">
      <div class="bg-white rounded-2xl shadow-lg p-12">
        <div class="mx-auto w-16 h-16 text-blue-300 mb-6">
          <Calendar class="w-full h-full" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">No upcoming events</h3>
        <p class="text-gray-600 max-w-sm mx-auto">
          Check back later for new events or contact us for more information about upcoming activities.
        </p>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {#each events as event (event.id)}
        <EventCard {event} on:select={handleEventSelect} />
      {/each}
    </div>
  {/if}
</div>

<EventModal 
  event={selectedEvent} 
  on:close={handleModalClose} 
/> 