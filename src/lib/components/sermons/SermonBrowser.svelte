<script lang="ts">
  import { onMount } from 'svelte';
  import type { Sermon } from '$lib/types/sermon';
  import { sermonService, type MediaType } from '$lib/services/sermonService';
  import { ChevronDown, ChevronUp } from 'lucide-svelte';

  export let type: MediaType = 'sermons';
  
  let loading = true;
  let error: string | null = null;
  let organizedSermons: Record<string, Record<string, Sermon[]>> = {};
  let expandedYears: Set<string> = new Set();
  let expandedMonths: Set<string> = new Set();
  let selectedSermon: Sermon | null = null;
  let videoLoading = true;
  let streamUrl: string | null = null;

  function toggleYear(year: string) {
    if (expandedYears.has(year)) {
      expandedYears.delete(year);
    } else {
      expandedYears.add(year);
    }
    expandedYears = expandedYears; // Trigger reactivity
  }

  function toggleMonth(monthKey: string) {
    if (expandedMonths.has(monthKey)) {
      expandedMonths.delete(monthKey);
    } else {
      expandedMonths.add(monthKey);
    }
    expandedMonths = expandedMonths; // Trigger reactivity
  }

  async function selectSermon(sermon: Sermon) {
    selectedSermon = sermon;
    videoLoading = true;
    if (sermon.jellyfinId) {
      streamUrl = await sermonService.getStreamUrl(sermon.jellyfinId);
    }
  }

  function handleVideoLoad() {
    videoLoading = false;
  }

  async function loadSermons() {
    try {
      loading = true;
      error = null;
      sermonService.setType(type);
      organizedSermons = await sermonService.getSermonsByYearAndMonth();
      
      // Only expand the most recent year by default
      const years = Object.keys(organizedSermons).sort((a, b) => Number(b) - Number(a));
      if (years.length > 0) {
        // Clear any existing expanded years/months
        expandedYears.clear();
        expandedMonths.clear();
        
        // Only expand the most recent year
        const mostRecentYear = years[0];
        expandedYears.add(mostRecentYear);
        
        // Get months for the most recent year and sort them in reverse chronological order
        const monthOrder = [
          'December', 'November', 'October', 'September', 'August', 'July',
          'June', 'May', 'April', 'March', 'February', 'January'
        ];
        const months = Object.keys(organizedSermons[mostRecentYear])
          .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
        
        if (months.length > 0) {
          // Only expand the most recent month
          const mostRecentMonth = months[0];
          expandedMonths.add(`${mostRecentYear}-${mostRecentMonth}`);
          
          const sermons = organizedSermons[mostRecentYear][mostRecentMonth];
          if (sermons.length > 0) {
            await selectSermon(sermons[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error loading sermons:', err);
      error = 'Failed to load sermons. Please try again later.';
    } finally {
      loading = false;
    }
  }

  $: {
    type; // Watch for type changes
    loadSermons();
  }
</script>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <!-- Sermon Browser -->
  <div class="lg:col-span-1 bg-white rounded-2xl shadow-lg overflow-hidden">
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">Browse {type === 'sermons' ? 'Sermons' : 'Livestreams'}</h3>
    </div>
    
    {#if loading}
      <div class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if error}
      <div class="p-4 text-red-600">{error}</div>
    {:else}
      <div class="divide-y divide-gray-200">
        {#each Object.entries(organizedSermons).reverse() as [year, months]}
          <div class="overflow-hidden">
            <button
              class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              on:click={() => toggleYear(year)}
            >
              <span class="font-medium text-gray-900">{year}</span>
              {#if expandedYears.has(year)}
                <ChevronUp class="h-5 w-5 text-gray-500" />
              {:else}
                <ChevronDown class="h-5 w-5 text-gray-500" />
              {/if}
            </button>
            
            {#if expandedYears.has(year)}
              <div class="bg-gray-50">
                {#each Object.entries(months).reverse() as [month, sermons]}
                  <div class="border-t border-gray-200">
                    <button
                      class="w-full px-6 py-2 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      on:click={() => toggleMonth(`${year}-${month}`)}
                    >
                      <span class="text-sm font-medium text-gray-700">{month}</span>
                      {#if expandedMonths.has(`${year}-${month}`)}
                        <ChevronUp class="h-4 w-4 text-gray-500" />
                      {:else}
                        <ChevronDown class="h-4 w-4 text-gray-500" />
                      {/if}
                    </button>
                    
                    {#if expandedMonths.has(`${year}-${month}`)}
                      <div class="border-t border-gray-200">
                        {#each sermons as sermon}
                          <button
                            class="w-full px-8 py-2 text-left hover:bg-gray-100 transition-colors {selectedSermon?.id === sermon.id ? 'bg-blue-50' : ''}"
                            on:click={() => selectSermon(sermon)}
                          >
                            <h4 class="text-sm font-medium text-gray-900 truncate">{sermon.title}</h4>
                            <p class="text-xs text-gray-500 mt-1">
                              {new Date(sermon.date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Video Player -->
  <div class="lg:col-span-2">
    {#if selectedSermon}
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="relative aspect-[16/9]">
          {#if videoLoading}
            <div class="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p class="text-gray-600 mt-4">Fetching {type === 'sermons' ? 'Sermon' : 'Video'}...</p>
              </div>
            </div>
          {/if}
          <video
            src={streamUrl}
            class="absolute inset-0 w-full h-full {videoLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300"
            controls
            playsinline
            webkit-playsinline
            preload="auto"
            x-webkit-airplay="allow"
            autoplay={false}
            crossorigin="anonymous"
            on:loadeddata={handleVideoLoad}
          >
            <track kind="captions" />
          </video>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{selectedSermon.title}</h3>
          <p class="text-gray-600">
            Speaker: {selectedSermon.speaker}<br />
            Date: {new Date(selectedSermon.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            {#if selectedSermon.seriesName}
              <br />Series: {selectedSermon.seriesName}
            {/if}
          </p>
          {#if selectedSermon.description}
            <p class="mt-4 text-gray-600">{selectedSermon.description}</p>
          {/if}
        </div>
      </div>
    {:else}
      <div class="bg-white rounded-2xl shadow-lg p-8 text-center">
        <p class="text-gray-600">Select a {type === 'sermons' ? 'sermon' : 'video'} to watch</p>
      </div>
    {/if}
  </div>
</div> 