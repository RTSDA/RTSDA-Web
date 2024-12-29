<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { Calendar, Clock, MapPin, Video, ExternalLink } from 'lucide-svelte';

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
        'Join one of our many prayer groups or submit your prayer requests. We have multiple opportunities for prayer throughout the week: Daily Prayer Group, Wednesday Prayer Group, BiWeekly Prayer Group, and Monthly Prayer Group.',
      imageUrl: '/images/events/prayer.webp',
      links: [
        {
          text: 'Contact Prayer Ministry',
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
</script>

<div class="px-4 pt-20 pb-8">
  <div class="max-w-7xl mx-auto">
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

    <!-- Ministries Grid -->
    <Motion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each ministries as ministry}
          <article
            class="flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div class="relative w-full aspect-[4/3] rounded-t-2xl overflow-hidden">
              <img
                src={ministry.imageUrl}
                alt={ministry.name}
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
            </div>
            <div class="flex flex-col flex-grow p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-3">
                {ministry.name}
              </h3>
              <p class="text-gray-600 mb-6 flex-grow">
                {ministry.description}
              </p>
              {#if ministry.name === 'Prayer Ministry'}
                <div class="space-y-3 mb-6">
                  <div class="flex items-center gap-2 text-gray-600">
                    <Calendar class="h-5 w-5 flex-shrink-0" />
                    <span>Daily, Weekly, BiWeekly, and Monthly Groups</span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <Clock class="h-5 w-5 flex-shrink-0" />
                    <span>Various Times Available</span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <MapPin class="h-5 w-5 flex-shrink-0" />
                    <span>In Person & Online</span>
                  </div>
                </div>
              {/if}
              <div class="flex flex-wrap gap-2 mt-auto">
                {#each ministry.links as link}
                  <a
                    href={link.url}
                    target={link.url.startsWith('http') ? "_blank" : undefined}
                    rel={link.url.startsWith('http') ? "noopener noreferrer" : undefined}
                    class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    {#if link.icon === 'video'}
                      <Video class="h-4 w-4" />
                    {:else if link.url.startsWith('http')}
                      <ExternalLink class="h-4 w-4" />
                    {/if}
                    {link.text}
                  </a>
                {/each}
              </div>
            </div>
          </article>
        {/each}
      </div>
    </Motion>
  </div>
</div> 