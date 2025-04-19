<script lang="ts">
  import type { Bulletin } from '../../../lib/types/bulletin.js';
  
  export let data: { bulletin: Bulletin };
  const { bulletin } = data;
  
  function formatDate(date: Date): string {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatBulletinContent(content: string, sectionTitle: string) {
    const lines = content
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&[a-z]+;/g, '')
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 1)
      .map(line => line.replace(/\s+/g, ' '));

    // Simple processing - if it ends in a colon, it's a label
    const processedLines = lines.map(line => {
      if (line.endsWith(':')) {
        return { label: line.slice(0, -1), value: '' };
      }
      return line;
    }).filter(line => line !== '');

    return processedLines;
  }
</script>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
  <div class="container mx-auto px-4 pt-24 pb-16">
    <a 
      href="/bulletins" 
      class="group inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-12 transition-colors duration-200"
    >
      <svg class="mr-2 h-5 w-5 transform transition-transform duration-200 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Bulletins
    </a>
    
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-12">
        <p class="text-sm uppercase tracking-wider text-blue-600 font-semibold mb-3">{formatDate(bulletin.date)}</p>
        <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">{bulletin.title}</h1>
        {#if bulletin.pdfUrl}
          <div class="flex justify-center">
            <a 
              href={bulletin.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
            >
              <svg class="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </a>
          </div>
        {/if}
      </div>
      
      <div class="space-y-10">
        {#each bulletin.sections as section}
          <div class="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 transform transition-all duration-200 hover:shadow-2xl">
            <div class="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 class="text-2xl font-bold text-gray-900">{section.title}</h2>
            </div>
            <div class="px-8 py-8">
              {#if section.title === 'Scripture Reading'}
                <div class="space-y-6">
                  {#each formatBulletinContent(section.content, section.title) as line}
                    {#if typeof line === 'string' && line.match(/(?:[1-3]\s+)?(?:Corinthians|John|Peter|Timothy|Thessalonians|Samuel|Kings|Chronicles|Psalm|Acts|Daniel|Revelation|Ephesians|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Ezra|Nehemiah|Esther|Job|Proverbs|Ecclesiastes|Isaiah|Jeremiah|Lamentations|Ezekiel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|Galatians|Philippians|Colossians|Titus|Philemon|Hebrews|James|Jude)\s*\d+(?::\d+(?:-\d+)?)?/)}
                      <div class="text-xl text-gray-900 text-center mt-6 mb-8">
                        {line}
                      </div>
                    {:else if typeof line === 'string'}
                      <div class="text-lg text-gray-700 text-center">
                        {line}
                      </div>
                    {:else if typeof line === 'object' && line.label}
                      <div class="flex flex-col items-center py-2 border-b border-gray-100 last:border-0">
                        <dt class="text-lg text-gray-900 mb-2">{line.label}</dt>
                        <dd class="text-lg text-gray-700">{line.value}</dd>
                      </div>
                    {/if}
                  {/each}
                </div>
              {:else}
                <dl class="space-y-6 text-center">
                  {#each formatBulletinContent(section.content, section.title) as line}
                    {#if typeof line === 'object' && line.label}
                      <div class="flex flex-col items-center py-2 border-b border-gray-100 last:border-0">
                        <dt class="text-lg font-semibold text-gray-900 mb-2">{line.label}</dt>
                        <dd class="text-lg text-gray-700">{line.value}</dd>
                      </div>
                    {:else}
                      <div class="text-lg text-gray-700 py-2">{line}</div>
                    {/if}
                  {/each}
                </dl>
              {/if}
            </div>
          </div>
        {/each}
      </div>
      
      {#if bulletin.url}
        <div class="mt-16 text-center">
          <p class="text-gray-600">
            For more information, visit:
            <a 
              href={bulletin.url} 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-600 hover:text-blue-700 hover:underline transition-colors duration-200 font-medium"
            >
              {bulletin.url}
            </a>
          </p>
        </div>
      {/if}
    </div>
  </div>
</div>