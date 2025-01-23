{#if services}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {#each services as service}
      <div class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="relative aspect-[16/9]">
          <img
            src={service.id === 'divine-service' 
              ? '/images/divine-service.webp'
              : service.id === 'sabbath-school'
              ? '/images/bible.webp'
              : service.id === 'prayer-meeting'
              ? '/images/events/prayer.webp'
              : '/images/events.webp'
            }
            alt={service.name}
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div class="absolute bottom-4 left-4 right-4">
            <div class="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-flex items-center shadow-md">
              <Clock class="h-4 w-4 text-blue-600 mr-2" />
              <span class="text-sm font-medium text-gray-900">
                {service.time}
              </span>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {service.name}
          </h3>
          <p class="text-gray-600 mb-4">
            {service.description}
          </p>
          
          {#if service.location}
            <div class="flex items-center text-gray-600">
              <MapPin class="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{service.location}</span>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{/if}

<script lang="ts">
  import { Clock, MapPin } from 'lucide-svelte';
  import { onMount } from 'svelte';

  const services = [
    {
      id: 'sabbath-school',
      name: 'Sabbath School',
      time: '9:30 AM',
      description: 'Join us for Bible study and discussion in small groups.',
      location: 'Main Sanctuary'
    },
    {
      id: 'divine-service',
      name: 'Divine Service',
      time: '11:00 AM',
      description: 'Our main worship service featuring praise, prayer, and preaching.',
      location: 'Main Sanctuary'
    },
    {
      id: 'prayer-meeting',
      name: 'Prayer Meeting',
      time: '7:00 PM Wednesday',
      description: 'Mid-week prayer and Bible study service.',
      location: 'Fellowship Hall'
    }
  ];

  let imagesLoaded = false;

  onMount(() => {
    console.log('Component mounted');
    
    services.forEach(service => {
      console.log(`Testing image for ${service.id}`);
      fetch(service.id === 'divine-service' 
        ? '/images/divine-service.webp'
        : service.id === 'sabbath-school'
        ? '/images/bible.webp'
        : service.id === 'prayer-meeting'
        ? '/images/events/prayer.webp'
        : '/images/events.webp'
      )
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          console.log(`Image exists for ${service.id}`);
        })
        .catch(error => {
          console.error(`Image load failed for ${service.id}:`, error);
        });
    });
  });
</script> 