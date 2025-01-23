<script lang="ts">
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<div class="min-h-screen flex flex-col">
	<Navbar />
	<main class="flex-grow pt-16">
		<slot />
	</main>
	<Footer />
</div>
