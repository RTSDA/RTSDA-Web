<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { ArrowRight, BookOpen, Flag, Users, Clock, Smartphone, Download } from 'lucide-svelte';
	import EventList from '$lib/components/events/EventList.svelte';
	import { androidAppService } from '$lib/services/androidAppService';
	import type { PageData } from './$types';

	export let data: PageData;

	$: androidApp = data.androidApp;
	$: apkUrl = androidApp ? androidAppService.getApkUrl(androidApp) : null;

	async function downloadApk() {
		if (!apkUrl || !androidApp) return;
		
		try {
			// Fetch the APK
			const response = await fetch(apkUrl);
			const blob = await response.blob();
			
			// Create a new blob with the correct MIME type
			const apkBlob = new Blob([blob], { type: 'application/vnd.android.package-archive' });
			
			// Create download link
			const url = URL.createObjectURL(apkBlob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `rtsda-${androidApp.version_name}.apk`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Failed to download APK:', error);
		}
	}
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
			<div
				class="absolute inset-0 bg-gradient-to-br from-black/90 via-black/50 to-transparent"
			></div>
		</div>
		<div class="relative flex min-h-screen items-center">
			<div class="container-custom">
				<Motion
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					class="max-w-[90%] lg:max-w-[65%] xl:max-w-[55%]"
				>
					<div class="relative">
						<div class="-skew-y-45 absolute -left-4 top-0 h-20 w-1 transform bg-blue-500"></div>
						<div class="pl-6">
							<span class="mb-4 inline-block text-lg font-medium tracking-wider text-blue-400">
								WELCOME TO
							</span>
							<h1
								class="mb-6 text-4xl font-bold tracking-tight text-white drop-shadow-sm md:text-5xl lg:text-7xl"
							>
								Rockville-Tolland
								<br />
								<span class="relative">
									<span class="relative z-10 text-white">SDA Church</span>
									<span class="absolute inset-x-0 bottom-2 h-3 -skew-x-6 bg-blue-500/30"></span>
								</span>
							</h1>
							<p class="mb-12 max-w-2xl text-lg leading-relaxed text-gray-200 md:text-xl">
								We are a welcoming community of believers dedicated to sharing God's love and
								message of hope. Join us for worship, fellowship, and spiritual growth.
							</p>
							<div class="flex flex-col gap-4 sm:flex-row">
								<a
									href="/about"
									class="inline-flex items-center justify-center rounded-lg bg-white/95 px-8 py-4 text-base font-semibold text-gray-900 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white hover:shadow-xl"
								>
									Learn More About Us
								</a>
								<a
									href="/contact"
									class="inline-flex items-center justify-center rounded-lg bg-blue-600/90 px-8 py-4 text-base font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-blue-600 hover:shadow-xl"
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
				class="mx-auto max-w-3xl text-center"
			>
				<h2 class="mb-4 text-3xl font-bold text-white">Stay Connected with Our Church App</h2>
				<p class="mb-8 text-xl text-gray-300">
					Access live services, sermons, and church updates on the go
				</p>
				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<a
						href="https://apps.apple.com/us/app/rtsda/id6738595657"
						target="_blank"
						rel="noopener noreferrer"
						class="transform transition-transform duration-200 hover:scale-105"
					>
						<img src="/images/app-store-badge.svg" alt="Download on the App Store" class="h-14" />
					</a>
					{#if androidApp && apkUrl}
						<button
							on:click={downloadApk}
							title={`Download RTSDA Android App v${androidApp.version_name}`}
							class="transform transition-transform duration-200 hover:scale-105 inline-block"
						>
							<div class="bg-black text-white rounded-lg px-5 py-2.5 h-14 flex items-center gap-3 min-w-[160px]">
								<svg viewBox="0 0 24 24" class="h-8 w-8 fill-[#3DDC84]">
									<path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>
								</svg>
								<div class="text-left flex-1">
									<div class="text-xs">DOWNLOAD APK</div>
									<div class="text-xl font-medium -mt-0.5">Android</div>
								</div>
							</div>
						</button>
					{:else}
						<div class="inline-block opacity-50 cursor-not-allowed">
							<div class="bg-black text-white rounded-lg px-5 py-2.5 h-14 flex items-center gap-3 min-w-[160px]">
								<svg viewBox="0 0 24 24" class="h-8 w-8 fill-[#3DDC84]">
									<path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85a.637.637 0 0 0-.83.22l-1.88 3.24a11.463 11.463 0 0 0-8.94 0L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>
								</svg>
								<div class="text-left flex-1">
									<div class="text-xs">COMING SOON</div>
									<div class="text-xl font-medium -mt-0.5">Android</div>
								</div>
							</div>
						</div>
					{/if}
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
				class="mx-auto max-w-2xl text-center"
			>
				<h2 class="heading-2 mb-4 text-gray-900">Upcoming Events</h2>
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
				<a href="/events" class="button-secondary inline-flex items-center">
					View all events
					<ArrowRight class="ml-2 h-5 w-5" />
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
				class="mx-auto mb-16 max-w-3xl text-center"
			>
				<div
					class="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"
				>
					<Clock class="h-8 w-8 text-blue-600" />
				</div>
				<h2 class="mb-4 text-4xl font-bold tracking-tight text-gray-900">Service Times</h2>
				<p class="text-xl leading-relaxed text-gray-600">
					Join us every Saturday for worship, fellowship, and spiritual growth
				</p>
			</Motion>

			<Motion
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.6, delay: 0.2 }}
				class="mx-auto max-w-6xl"
			>
				<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
					<!-- Sabbath School -->
					<div
						class="group transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div class="relative aspect-[16/9]">
							<img
								src="/images/bible.webp"
								alt="Sabbath School"
								class="absolute inset-0 h-full w-full object-cover"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
							<div class="absolute bottom-4 left-4 right-4">
								<div
									class="inline-flex items-center rounded-lg bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm"
								>
									<Clock class="mr-2 h-4 w-4 text-blue-600" />
									<span class="text-sm font-medium text-gray-900">9:15 AM</span>
								</div>
							</div>
						</div>

						<div class="p-6">
							<h3
								class="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600"
							>
								Sabbath School
							</h3>
							<p class="leading-relaxed text-gray-600">
								Study God's Word in depth with fellow believers in our adult and children's classes
							</p>
						</div>
					</div>

					<!-- Divine Service -->
					<div
						class="group transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div class="relative aspect-[16/9]">
							<img
								src="/images/divine-service.webp"
								alt="Divine Service"
								class="absolute inset-0 h-full w-full object-cover"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
							<div class="absolute bottom-4 left-4 right-4">
								<div
									class="inline-flex items-center rounded-lg bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm"
								>
									<Clock class="mr-2 h-4 w-4 text-blue-600" />
									<span class="text-sm font-medium text-gray-900">11:00 AM</span>
								</div>
							</div>
						</div>

						<div class="p-6">
							<h3
								class="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600"
							>
								Divine Service
							</h3>
							<p class="leading-relaxed text-gray-600">
								Join us for praise, worship, and an inspiring message from God's Word
							</p>
						</div>
					</div>

					<!-- Prayer Meeting -->
					<div
						class="group transform overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
					>
						<div class="relative aspect-[16/9]">
							<img
								src="/images/events/prayer.webp"
								alt="Prayer Meeting"
								class="absolute inset-0 h-full w-full object-cover"
							/>
							<div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
							<div class="absolute bottom-4 left-4 right-4">
								<div
									class="inline-flex items-center rounded-lg bg-white/95 px-3 py-1.5 shadow-md backdrop-blur-sm"
								>
									<Clock class="mr-2 h-4 w-4 text-blue-600" />
									<span class="text-sm font-medium text-gray-900">Wednesday 7:00 PM</span>
								</div>
							</div>
						</div>

						<div class="p-6">
							<h3
								class="mb-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600"
							>
								Prayer Meeting
							</h3>
							<p class="leading-relaxed text-gray-600">
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
		@apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
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
