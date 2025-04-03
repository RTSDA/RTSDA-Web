<script lang="ts">
  import type { Bulletin } from '../../lib/types/bulletin.js';
  
  export let data: { bulletins: Bulletin[] };
  const { bulletins } = data;
  
  function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="bg-white">
  <div class="container mx-auto px-4 pt-20 pb-8">
    <h1 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Church Bulletins</h1>
    <p class="mt-4 text-lg text-gray-500">
      Browse our weekly church bulletins to stay updated with announcements and events.
    </p>
    
    {#if bulletins.length === 0}
      <div class="mt-8 bg-yellow-50 p-4 rounded-md">
        <p class="text-yellow-700">No bulletins available at this time.</p>
      </div>
    {:else}
      <div class="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {#each bulletins as bulletin}
          <div class="bg-white shadow rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div class="p-6">
              <p class="text-sm text-gray-500 mb-2">{formatDate(bulletin.date)}</p>
              <h3 class="text-xl font-semibold text-gray-900 mb-4">{bulletin.title}</h3>
              <div class="flex gap-2">
                {#if bulletin.pdfUrl}
                  <a 
                    href={bulletin.pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Download PDF
                  </a>
                {/if}
                <a 
                  href={`/bulletins/${bulletin.id}`}
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div> 