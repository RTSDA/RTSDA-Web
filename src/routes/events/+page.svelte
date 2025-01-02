<script lang="ts">
  import { Motion } from 'svelte-motion';
  import EventList from '$lib/components/events/EventList.svelte';
  import { Calendar, Bell } from 'lucide-svelte';
  
  console.log('Events page loaded');
</script>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white">
  <div class="relative py-24 sm:py-32 overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 -z-10">
      <div class="absolute inset-y-0 w-full h-full bg-gradient-to-b from-blue-50 to-transparent"></div>
      <svg class="absolute left-[calc(50%-18rem)] -top-10 w-[36rem] stroke-blue-200" aria-hidden="true">
        <defs>
          <pattern id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
            <path d="M100 200V.5M.5 .5H200" fill="none" />
          </pattern>
        </defs>
        <svg x="50%" y="-1" class="overflow-visible fill-blue-50">
          <path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" stroke-width="0" />
        </svg>
        <rect width="100%" height="100%" stroke-width="0" fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" />
      </svg>
    </div>

    <div class="container-custom">
      <Motion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        class="max-w-3xl mx-auto text-center mb-20"
      >
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-8 ring-8 ring-blue-50">
          <Calendar class="w-10 h-10 text-blue-600" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-8">
          Upcoming Events
        </h1>
        <p class="text-xl text-gray-600 leading-relaxed">
          Join us for these upcoming events and activities at our church. 
          All are welcome to participate and grow in faith together.
        </p>
      </Motion>

      <Motion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <EventList />
      </Motion>

      <Motion
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        class="max-w-2xl mx-auto mt-24"
      >
        <div class="relative overflow-hidden bg-white rounded-2xl shadow-lg">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-50 via-white to-blue-50"></div>
          <div class="relative p-8 sm:p-10">
            <div class="sm:flex sm:items-center sm:justify-between">
              <div class="sm:flex-1">
                <h2 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  Stay Updated
                </h2>
                <p class="mt-3 text-lg text-gray-600">
                  Contact us to stay informed about upcoming events and church activities.
                </p>
              </div>
              <div class="mt-6 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
                <a
                  href="/contact"
                  class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200 hover:shadow-md"
                >
                  <Bell class="w-5 h-5 mr-2" />
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </Motion>
    </div>
  </div>
</div> 