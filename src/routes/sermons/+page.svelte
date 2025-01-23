<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { onMount } from 'svelte';
  import { Calendar, Clock, MapPin, ArrowRight, Video, ExternalLink } from 'lucide-svelte';
  import type { Sermon } from '$lib/types/sermon';
  import { sermonService } from '$lib/services/sermonService';

  let latestSermon: Sermon | null = null;
  let loading = true;
  let videoLoading = true;
  let streamUrl: string | null = null;

  function handleVideoLoad() {
    videoLoading = false;
  }

  onMount(async () => {
    try {
      latestSermon = await sermonService.getLatestSermon();
      if (latestSermon?.jellyfinId) {
        streamUrl = await sermonService.getStreamUrl(latestSermon.jellyfinId);
      }
    } catch (err) {
      console.error('Error loading sermon:', err);
    } finally {
      loading = false;
    }
  });
</script>

<div class="container mx-auto px-4 pt-20 pb-8">
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    class="max-w-3xl mx-auto text-center mb-16"
  >
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Latest Sermon</h1>
    <p class="text-xl text-gray-600 leading-relaxed">
      Watch our latest sermon and explore our sermon archive.
    </p>
  </Motion>

  <!-- Latest Sermon Section -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    class="mb-12"
  >
    <div class="flex items-center justify-end mb-6">
      <a 
        href="/sermons/archive" 
        class="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold gap-2"
      >
        View All Sermons
        <ArrowRight class="w-5 h-5" />
      </a>
    </div>

    {#if loading}
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    {:else if latestSermon?.jellyfinId}
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div class="relative aspect-w-16 aspect-h-9">
          {#if videoLoading}
            <div class="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div class="flex flex-col items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p class="text-gray-600 mt-4">Fetching Sermon...</p>
              </div>
            </div>
          {/if}
          <iframe
            src={streamUrl}
            title={latestSermon.title}
            allowfullscreen
            allow="autoplay; encrypted-media; picture-in-picture"
            class="absolute inset-0 w-full h-full border-0 {videoLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300"
            on:load={handleVideoLoad}
          ></iframe>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">{latestSermon.title}</h3>
          <p class="text-gray-600">
            Speaker: {latestSermon.speaker}<br />
            Date: {new Date(latestSermon.date).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}<br />
            {#if latestSermon.seriesName}
              Series: {latestSermon.seriesName}
            {/if}
          </p>
          {#if latestSermon.description}
            <p class="mt-4 text-gray-600">{latestSermon.description}</p>
          {/if}
        </div>
      </div>
    {:else}
      <div class="text-center py-8">
        <p class="text-gray-500">No sermon available at this time.</p>
      </div>
    {/if}
  </Motion>
</div> 