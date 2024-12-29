<script lang="ts">
  import { Motion } from 'svelte-motion';
  import SermonBrowser from '$lib/components/sermons/SermonBrowser.svelte';
  import type { MediaType } from '$lib/services/sermonService';

  let currentType: MediaType = 'sermons';
</script>

<div class="container mx-auto px-4 pt-20 pb-8">
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    class="max-w-3xl mx-auto text-center mb-16"
  >
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Sermon Archive</h1>
    <p class="text-xl text-gray-600 leading-relaxed">
      Browse and watch our past sermons to grow in your spiritual journey.
    </p>
  </Motion>

  <!-- Type Toggle -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    class="max-w-md mx-auto mb-12"
  >
    <div class="bg-white rounded-lg p-1 shadow-sm">
      <div class="grid grid-cols-2 gap-1">
        <button
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors {currentType === 'sermons' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-gray-900'}"
          on:click={() => currentType = 'sermons'}
        >
          Sermons
        </button>
        <button
          class="px-4 py-2 text-sm font-medium rounded-md transition-colors {currentType === 'livestreams' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-gray-900'}"
          on:click={() => currentType = 'livestreams'}
        >
          Live Streams
        </button>
      </div>
    </div>
  </Motion>

  <!-- Sermon Browser -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
  >
    <SermonBrowser type={currentType} />
  </Motion>
</div> 