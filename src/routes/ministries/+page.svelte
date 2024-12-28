<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { onMount } from 'svelte';
  import { Calendar, Clock, MapPin, ArrowRight, Video, ExternalLink } from 'lucide-svelte';
  import type { Sermon } from '$lib/types/sermon';
  import { sermonService } from '$lib/services/sermonService';

  type MinistryLink = {
    text: string;
    url: string;
    icon?: string;
  };

  type Ministry = {
    name: string;
    description: string;
    imageUrl: string;
    links: MinistryLink[];
  };

  const ministries: Ministry[] = [
    {
      name: 'Prayer Ministry',
      description:
        'Submit your prayer requests or join our prayer team. We believe in the power of prayer and would be honored to pray for your needs.',
      imageUrl: '/images/events/prayer.webp',
      links: [
        {
          text: 'Submit Prayer Request',
          url: '/contact'
        }
      ]
    },
    {
      name: 'Gardening Ministry',
      description:
        'Learn about sustainable gardening practices and join our community of gardeners. Watch our gardening series to learn practical tips and techniques.',
      imageUrl: '/images/garden.webp',
      links: [
        {
          text: 'Garden Video Series',
          url: 'https://www.youtube.com/playlist?list=PLtVXQJggBMd8p00o3vo5MsGizRy1Dkwca',
          icon: 'video'
        }
      ]
    },
    {
      name: 'Bible Studies',
      description:
        'Deepen your understanding of Scripture through our Bible study programs and resources. Access free Bible study guides and tools to enhance your spiritual journey.',
      imageUrl: '/images/bible.webp',
      links: [
        {
          text: 'Request Bible Studies',
          url: '/contact'
        },
        {
          text: 'Study Guides',
          url: 'https://www.amazingfacts.org/media-library/read/c/2/t/bible-study-guides'
        },
        {
          text: 'E-Sword App',
          url: 'https://www.e-sword.net/'
        },
        {
          text: 'Bible Project App',
          url: 'https://bibleproject.com/app/'
        }
      ]
    },
    {
      name: 'Adventist Youth',
      description:
        'Join our vibrant youth community for spiritual growth, fellowship, and service opportunities.',
      imageUrl: '/images/ay.webp',
      links: [
        {
          text: 'Contact Youth Ministry',
          url: 'mailto:adventistyouthbookstore@gmail.com'
        }
      ]
    },
    {
      name: 'Health Ministry',
      description:
        'Discover resources and programs promoting physical, mental, and spiritual well-being through our health ministry.',
      imageUrl: '/images/health.webp',
      links: [
        {
          text: 'Health Resources',
          url: 'https://www.healthministries.com/articles/'
        }
      ]
    }
  ];

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
    <h1 class="text-4xl font-bold text-gray-900 mb-4">Our Ministries</h1>
    <p class="text-xl text-gray-600 leading-relaxed">
      Discover the various ways you can get involved, grow spiritually, and serve in our church community.
    </p>
  </Motion>

  <!-- Latest Sermon Section -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    class="mb-12"
  >
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Latest Sermon</h2>
      <a 
        href="/sermons" 
        class="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold gap-2"
      >
        View All Sermons
        <ArrowRight class="w-5 h-5" />
      </a>
    </div>

    {#if loading}
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
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

  <!-- Ministries Grid -->
  <Motion
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.4 }}
    class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3"
  >
    {#each ministries as ministry}
      <article
        class="flex flex-col items-start bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
      >
        <div class="relative w-full {ministry.name === 'Adventist Youth' ? 'h-[400px]' : 'aspect-[4/3]'} rounded-t-2xl overflow-hidden">
          <img
            src={ministry.imageUrl}
            alt={ministry.name}
            class="{ministry.name === 'Adventist Youth' ? 'object-contain bg-white' : 'object-cover'} absolute inset-0 w-full h-full"
          />
        </div>
        <div class="flex flex-col flex-grow p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">
            {ministry.name}
          </h3>
          <p class="text-lg text-gray-600 leading-relaxed mb-6">
            {ministry.description}
          </p>
          {#if ministry.name === 'Prayer Ministry'}
            <div class="space-y-4 mb-6">
              <div class="flex items-center gap-3 text-gray-600">
                <Calendar class="h-5 w-5" />
                <span>Every other Friday</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <Clock class="h-5 w-5" />
                <span>6:00 PM - 8:00 PM</span>
              </div>
              <div class="flex items-center gap-3 text-gray-600">
                <MapPin class="h-5 w-5" />
                <span>Rockville Tolland SDA Church</span>
              </div>
            </div>
          {/if}
          <div class="flex flex-wrap gap-2">
            {#each ministry.links as link}
              <a
                href={link.url}
                target={link.url.startsWith('http') ? "_blank" : undefined}
                rel={link.url.startsWith('http') ? "noopener noreferrer" : undefined}
                class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200"
              >
                {#if link.icon === 'video'}
                  <Video class="w-5 h-5" />
                {:else if link.url.startsWith('http')}
                  <ExternalLink class="w-5 h-5" />
                {/if}
                {link.text}
              </a>
            {/each}
          </div>
        </div>
      </article>
    {/each}
  </Motion>
</div> 