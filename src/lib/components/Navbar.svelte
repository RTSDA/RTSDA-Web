<script lang="ts">
  import { Menu, X } from 'lucide-svelte';
  import { page } from '$app/stores';

  let mobileMenuOpen = false;

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Ministries', href: '/ministries' },
    { name: 'Sermons', href: '/sermons' },
    { name: 'Events', href: '/events' },
    { name: 'Contact', href: '/contact' },
  ];

  const quickLinks = [
    { name: 'Online Giving', href: 'https://adventistgiving.org/donate/AN4MJG' },
    { name: 'Live Stream', href: 'https://stream.rockvilletollandsda.church' },
    { name: 'Bulletin', href: 'https://rtsda.updates.church' },
  ];
</script>

<header class="fixed inset-x-0 top-0 z-50 bg-white shadow">
  <nav class="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
    <div class="flex lg:flex-1">
      <a href="/" class="-m-1.5 p-1.5">
        <span class="sr-only">Rockville-Tolland SDA Church</span>
        <img
          class="h-12 w-auto"
          src="/images/logo.webp"
          alt="Church Logo"
          width="48"
          height="48"
        />
      </a>
    </div>
    <div class="flex lg:hidden">
      <button
        type="button"
        class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
        on:click={() => mobileMenuOpen = !mobileMenuOpen}
      >
        <span class="sr-only">Open main menu</span>
        <Menu class="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
    <div class="hidden lg:flex lg:gap-x-12">
      {#each navigation as item}
        <a
          href={item.href}
          class="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600"
          class:text-blue-600={$page.url.pathname === item.href}
        >
          {item.name}
        </a>
      {/each}
    </div>
    <div class="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
      {#each quickLinks as item}
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-500"
        >
          {item.name}
        </a>
      {/each}
    </div>
  </nav>
  <!-- Mobile menu -->
  {#if mobileMenuOpen}
    <div class="lg:hidden">
      <div 
        class="fixed inset-0 z-50 bg-black bg-opacity-25" 
        on:click={() => mobileMenuOpen = false}
        on:keydown={(e) => e.key === 'Escape' && (mobileMenuOpen = false)}
        role="button"
        tabindex="0"
      ></div>
      <div class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div class="flex items-center justify-between">
          <a href="/" class="-m-1.5 p-1.5" on:click={() => mobileMenuOpen = false}>
            <span class="sr-only">Rockville-Tolland SDA Church</span>
            <img
              class="h-8 w-auto"
              src="/images/logo.webp"
              alt="Church Logo"
              width="32"
              height="32"
            />
          </a>
          <button
            type="button"
            class="-m-2.5 rounded-md p-2.5 text-gray-700"
            on:click={() => mobileMenuOpen = false}
          >
            <span class="sr-only">Close menu</span>
            <X class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div class="mt-6 flow-root">
          <div class="-my-6 divide-y divide-gray-500/10">
            <div class="space-y-2 py-6">
              {#each navigation as item}
                <a
                  href={item.href}
                  class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                  class:text-blue-600={$page.url.pathname === item.href}
                  on:click={() => mobileMenuOpen = false}
                >
                  {item.name}
                </a>
              {/each}
            </div>
            <div class="py-6">
              {#each quickLinks as item}
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-blue-600 hover:bg-gray-50"
                  on:click={() => mobileMenuOpen = false}
                >
                  {item.name}
                </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</header> 