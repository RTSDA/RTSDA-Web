<script lang="ts">
  import { Motion } from 'svelte-motion';
  import { ArrowRight, BookOpen, Flag, Users, Clock } from 'lucide-svelte';
  import EventList from '$lib/components/events/EventList.svelte';
</script>

<div class="animate-fade-in">
  <!-- Hero section -->
  <div class="relative min-h-screen">
    <div class="absolute inset-0">
      <img
        class="h-full w-full object-cover"
        src="/images/hero.webp"
        alt="Second Coming of Christ"
        width="1920"
        height="1080"
      />
      <div class="absolute inset-0 bg-gradient-to-br from-black/90 via-black/50 to-transparent"></div>
    </div>
    <div class="relative min-h-screen flex items-center">
      <div class="container-custom">
        <Motion
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          class="max-w-[90%] lg:max-w-[65%] xl:max-w-[55%]"
        >
          <div class="relative">
            <div class="absolute -left-4 top-0 h-20 w-1 bg-blue-500 transform -skew-y-45"></div>
            <div class="pl-6">
              <span class="inline-block text-blue-400 text-lg font-medium tracking-wider mb-4">
                WELCOME TO
              </span>
              <h1 class="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-sm mb-6">
                Rockville-Tolland
                <br />
                <span class="relative">
                  <span class="relative z-10 text-white">SDA Church</span>
                  <span class="absolute inset-x-0 bottom-2 h-3 bg-blue-500/30 -skew-x-6"></span>
                </span>
              </h1>
              <p class="text-lg md:text-xl text-gray-200 max-w-2xl leading-relaxed mb-12">
                We are a welcoming community of believers dedicated to sharing God's love 
                and message of hope. Join us for worship, fellowship, and spiritual growth.
              </p>
              <div class="flex flex-col sm:flex-row gap-4">
                <a
                  href="/about"
                  class="inline-flex items-center justify-center rounded-lg bg-white/95 backdrop-blur-sm px-8 py-4 text-base font-semibold text-gray-900 shadow-lg hover:bg-white transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  Learn More About Us
                </a>
                <a
                  href="/contact"
                  class="inline-flex items-center justify-center rounded-lg bg-blue-600/90 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </Motion>
      </div>
    </div>
  </div>

  <!-- App Download Section -->
  <section class="bg-gradient-to-b from-gray-900 to-gray-800 py-16">
    <div class="container-custom">
      <Motion
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        class="max-w-3xl mx-auto text-center"
      >
        <h2 class="text-3xl font-bold text-white mb-4">
          Stay Connected with Our Church App
        </h2>
        <p class="text-xl text-gray-300 mb-8">
          Access live services, sermons, and church updates on the go
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="https://apps.apple.com/us/app/rtsda/id6738595657"
            target="_blank"
            rel="noopener noreferrer"
            class="transform transition-transform duration-200 hover:scale-105"
          >
            <img 
              src="/images/app-store-badge.svg" 
              alt="Download on the App Store" 
              class="h-14"
            />
          </a>
          <div class="relative inline-block">
            <img
              src="/images/google-play-badge.svg"
              alt="Get it on Google Play"
              class="h-12 w-auto"
            />
            <div class="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
              Coming Soon
            </div>
          </div>
        </div>
      </Motion>
    </div>
  </section>

  <!-- Upcoming Events section -->
  <section class="bg-white py-24 sm:py-32">
    <div class="container-custom">
      <Motion
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        class="max-w-2xl mx-auto text-center"
      >
        <h2 class="heading-2 text-gray-900 mb-4">
          Upcoming Events
        </h2>
        <p class="text-xl text-gray-600">
          Join us for these upcoming events and activities at our church.
        </p>
      </Motion>
      <Motion
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        class="mx-auto mt-16"
      >
        <EventList />
      </Motion>
      <div class="mt-12 text-center">
        <a
          href="/events"
          class="button-secondary inline-flex items-center"
        >
          View all events
          <ArrowRight class="h-5 w-5 ml-2" />
        </a>
      </div>
    </div>
  </section>

  <!-- Service Times section -->
  <section class="bg-gradient-to-b from-gray-50 to-white py-24 sm:py-32">
    <div class="container-custom">
      <Motion
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        class="max-w-3xl mx-auto text-center mb-16"
      >
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
          <Clock class="w-8 h-8 text-blue-600" />
        </div>
        <h2 class="text-4xl font-bold tracking-tight text-gray-900 mb-4">
          Service Times
        </h2>
        <p class="text-xl text-gray-600 leading-relaxed">
          Join us every Saturday for worship, fellowship, and spiritual growth
        </p>
      </Motion>

      <Motion
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        class="max-w-6xl mx-auto"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Sabbath School -->
          <div class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="relative aspect-[16/9]">
              <img
                src="/images/bible.webp"
                alt="Sabbath School"
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <div class="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-flex items-center shadow-md">
                  <Clock class="h-4 w-4 text-blue-600 mr-2" />
                  <span class="text-sm font-medium text-gray-900">9:15 AM</span>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Sabbath School
              </h3>
              <p class="text-gray-600 leading-relaxed">
                Study God's Word in depth with fellow believers in our adult and children's classes
              </p>
            </div>
          </div>

          <!-- Divine Service -->
          <div class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="relative aspect-[16/9]">
              <img
                src="/images/divine-service.webp"
                alt="Divine Service"
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <div class="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-flex items-center shadow-md">
                  <Clock class="h-4 w-4 text-blue-600 mr-2" />
                  <span class="text-sm font-medium text-gray-900">11:00 AM</span>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Divine Service
              </h3>
              <p class="text-gray-600 leading-relaxed">
                Join us for praise, worship, and an inspiring message from God's Word
              </p>
            </div>
          </div>

          <!-- Prayer Meeting -->
          <div class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div class="relative aspect-[16/9]">
              <img
                src="/images/events/prayer.webp"
                alt="Prayer Meeting"
                class="absolute inset-0 w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-4 left-4 right-4">
                <div class="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-flex items-center shadow-md">
                  <Clock class="h-4 w-4 text-blue-600 mr-2" />
                  <span class="text-sm font-medium text-gray-900">Wednesday 7:00 PM</span>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                Prayer Meeting
              </h3>
              <p class="text-gray-600 leading-relaxed">
                Gather with us for midweek prayer and Bible study to deepen your spiritual walk
              </p>
            </div>
          </div>
        </div>
      </Motion>
    </div>
  </section>
</div>

<style>
  :global(.container-custom) {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  }

  :global(.heading-1) {
    @apply text-4xl font-bold tracking-tight sm:text-6xl;
  }

  :global(.heading-2) {
    @apply text-3xl font-bold tracking-tight sm:text-4xl;
  }

  :global(.button-primary) {
    @apply rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600;
  }

  :global(.button-secondary) {
    @apply rounded-md bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-100;
  }

  :global(.brand-100) {
    @apply bg-blue-100;
  }

  :global(.brand-600) {
    @apply text-blue-600;
  }
</style>
