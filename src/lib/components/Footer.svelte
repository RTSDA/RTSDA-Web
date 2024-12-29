<script lang="ts">
  import { Facebook, Youtube, Music } from 'lucide-svelte';

  const navigation = {
    main: [
      { name: 'About', href: '/about' },
      { name: 'Ministries', href: '/ministries' },
      { name: 'Sermons', href: '/sermons' },
      { name: 'Events', href: '/events' },
      { name: 'Contact', href: '/contact' },
    ],
    social: [
      {
        name: 'Facebook',
        href: 'https://www.facebook.com/rockvilletollandsdachurch/',
        icon: Facebook,
      },
      {
        name: 'YouTube',
        href: 'https://www.youtube.com/@rockvilletollandsdachurch',
        icon: Youtube,
      },
      {
        name: 'Spotify',
        href: 'https://creators.spotify.com/pod/show/rockvilletollandsdachurch',
        icon: Music,
      },
    ],
  };
</script>

<footer class="bg-white">
  <div class="mx-auto max-w-7xl overflow-hidden px-6 py-20 sm:py-24 lg:px-8">
    <nav class="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
      {#each navigation.main as item}
        <div class="pb-6">
          <a href={item.href} class="text-sm leading-6 text-gray-600 hover:text-gray-900">
            {item.name}
          </a>
        </div>
      {/each}
    </nav>
    <div class="mt-10 flex justify-center space-x-10">
      {#each navigation.social as item}
        <a href={item.href} class="text-gray-400 hover:text-gray-500">
          <span class="sr-only">{item.name}</span>
          <svelte:component this={item.icon} class="h-6 w-6" />
        </a>
      {/each}
    </div>
    <p class="mt-10 text-center text-xs leading-5 text-gray-500">
      &copy; {new Date().getFullYear()} Rockville-Tolland SDA Church. All rights reserved.
    </p>
  </div>
</footer> 