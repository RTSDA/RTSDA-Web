<script lang="ts">
	import { Motion } from 'svelte-motion';
	import { Mail, Phone, MapPin } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { debounce } from '$lib/utils/debounce';
	import { page } from '$app/stores';

	let formData = {
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		message: ''
	};

	let submitted = false;
	let error = '';
	let isSubmitting = false;
	let validationErrors: Record<string, string> = {};
	let touched: Record<string, boolean> = {};

	// Compute the email address based on the current domain
	$: emailAddress = (() => {
		const hostname = $page.url.hostname;
		const domainParts = hostname.split('.');
		const extension = domainParts[domainParts.length - 1];
		return `info@rockvilletollandsda.${extension}`;
	})();

	function validateField(name: string, value: string): Record<string, string> {
		const errors: Record<string, string> = {};

		switch (name) {
			case 'firstName':
				if (!value.trim()) errors.firstName = 'First name is required';
				break;
			case 'lastName':
				if (!value.trim()) errors.lastName = 'Last name is required';
				break;
			case 'email':
				if (!value.trim()) {
					errors.email = 'Email is required';
				} else {
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(value)) {
						errors.email = 'Please enter a valid email address';
					}
				}
				break;
			case 'phone':
				if (value) {
					const phoneRegex = /^(\+1\s?)?((\([0-9]{3}\))|[0-9]{3})[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/;
					if (!phoneRegex.test(value)) {
						errors.phone = 'Please enter a valid US phone number';
					}
				}
				break;
			case 'message':
				if (!value.trim()) errors.message = 'Message is required';
				break;
		}

		return errors;
	}

	const debouncedValidate = debounce((name: string, value: string) => {
		const fieldErrors = validateField(name, value);
		validationErrors = { ...validationErrors, [name]: fieldErrors[name] };
	}, 500);

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		const { name, value } = target;
		formData = { ...formData, [name]: value };
		debouncedValidate(name, value);
	}

	function handleBlur(e: FocusEvent) {
		const target = e.target as HTMLInputElement | HTMLTextAreaElement;
		const { name } = target;
		touched = { ...touched, [name]: true };

		const fieldErrors = validateField(name, formData[name as keyof typeof formData]);
		validationErrors = { ...validationErrors, [name]: fieldErrors[name] };
	}

	function handlePhoneInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const value = target.value;
		// Remove all non-digits
		const digitsOnly = value.replace(/\D/g, '');
		// Limit to 10 digits (plus optional leading 1)
		const truncatedDigits = digitsOnly.startsWith('1')
			? digitsOnly.slice(0, 11) // +1 plus 10 digits
			: digitsOnly.slice(0, 10); // just 10 digits

		// Format the number
		let formattedNumber = truncatedDigits;
		if (truncatedDigits.length > 0) {
			if (truncatedDigits.startsWith('1')) {
				const areaCode = truncatedDigits.slice(1, 4);
				const middle = truncatedDigits.slice(4, 7);
				const last = truncatedDigits.slice(7, 11);

				// Only add parentheses if we have all 10 digits
				if (truncatedDigits.length >= 11) {
					formattedNumber = `+1 (${areaCode}) ${middle}${middle && last && '-'}${last}`;
				} else {
					formattedNumber = `+1 ${areaCode}${areaCode && middle && ' '}${middle}${middle && last && '-'}${last}`;
				}
			} else {
				const areaCode = truncatedDigits.slice(0, 3);
				const middle = truncatedDigits.slice(3, 6);
				const last = truncatedDigits.slice(6, 10);

				// Only add parentheses if we have all 10 digits
				if (truncatedDigits.length === 10) {
					formattedNumber = `(${areaCode}) ${middle}${middle && last && '-'}${last}`;
				} else {
					formattedNumber = `${areaCode}${areaCode && middle && ' '}${middle}${middle && last && '-'}${last}`;
				}
			}
		}

		formData = { ...formData, phone: formattedNumber };
		debouncedValidate('phone', formattedNumber);
	}

	function validateForm(): boolean {
		let allErrors: Record<string, string> = {};

		Object.entries(formData).forEach(([name, value]) => {
			const fieldErrors = validateField(name, value);
			if (fieldErrors[name]) {
				allErrors[name] = fieldErrors[name];
			}
		});

		touched = {
			firstName: true,
			lastName: true,
			email: true,
			phone: true,
			message: true
		};

		validationErrors = allErrors;
		return Object.keys(allErrors).length === 0;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		if (!validateForm()) {
			error = 'Please fix the errors in the form before submitting.';
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('https://contact.rockvilletollandsda.church/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					first_name: formData.firstName,
					last_name: formData.lastName,
					email: formData.email,
					phone: formData.phone,
					message: formData.message
				})
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to submit form');
			}

			submitted = true;
			formData = {
				firstName: '',
				lastName: '',
				email: '',
				phone: '',
				message: ''
			};
			touched = {};
			validationErrors = {};
		} catch (err) {
			console.error('Error submitting form:', err);
			error = 'There was an error submitting your message. Please try again.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="bg-white">
	<div class="relative isolate bg-gradient-to-b from-blue-100/20">
		<div class="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
			<div class="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
				<div class="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
					<h1 class="text-3xl font-bold tracking-tight text-gray-900">Get in touch</h1>
					<p class="mb-8 text-lg text-gray-600">
						Get in touch with us, submit a prayer request, or sign up for Bible studies. We'd love
						to hear from you!
					</p>
					<dl class="mt-10 space-y-4 text-base leading-7 text-gray-600">
						<div class="flex gap-x-4">
							<dt class="flex-none">
								<span class="sr-only">Address</span>
								<MapPin class="h-7 w-6 text-gray-400" aria-hidden="true" />
							</dt>
							<dd>
								9 Hartford Turnpike<br />
								PO Box 309<br />
								Tolland, CT 06084<br />
								<a href="mailto:{emailAddress}" class="hover:text-blue-600">
									{emailAddress}
								</a>
							</dd>
						</div>
						<div class="flex gap-x-4">
							<dt class="flex-none">
								<span class="sr-only">Phone</span>
								<Phone class="h-7 w-6 text-gray-400" aria-hidden="true" />
							</dt>
							<dd>
								<a class="hover:text-gray-900" href="tel:+1 (860) 875-0450"> +1 (860) 875-0450 </a>
							</dd>
						</div>
					</dl>
				</div>
			</div>

			<form on:submit={handleSubmit} class="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
				<div class="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
					{#if submitted}
						<div class="mb-6 rounded-md bg-green-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<p class="text-sm font-medium text-green-800">
										Thank you for your message! We'll get back to you soon.
									</p>
								</div>
							</div>
						</div>
					{/if}

					{#if error}
						<div class="mb-6 rounded-md bg-red-50 p-4">
							<div class="flex">
								<div class="flex-shrink-0">
									<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
										<path
											fill-rule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
								<div class="ml-3">
									<h3 class="text-sm font-medium text-red-800">
										There were errors with your submission
									</h3>
									<div class="mt-2 text-sm text-red-700">
										<p>{error}</p>
									</div>
								</div>
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
						<!-- First Name -->
						<div>
							<label for="firstName" class="block text-sm font-semibold leading-6 text-gray-900">
								First name
							</label>
							<div class="mt-2.5">
								<input
									type="text"
									name="firstName"
									id="firstName"
									autocomplete="given-name"
									bind:value={formData.firstName}
									on:input={handleChange}
									on:blur={handleBlur}
									class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset {touched.firstName &&
									validationErrors.firstName
										? 'ring-red-300'
										: 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
								/>
								{#if touched.firstName && validationErrors.firstName}
									<p class="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
								{/if}
							</div>
						</div>

						<!-- Last Name -->
						<div>
							<label for="lastName" class="block text-sm font-semibold leading-6 text-gray-900">
								Last name
							</label>
							<div class="mt-2.5">
								<input
									type="text"
									name="lastName"
									id="lastName"
									autocomplete="family-name"
									bind:value={formData.lastName}
									on:input={handleChange}
									on:blur={handleBlur}
									class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset {touched.lastName &&
									validationErrors.lastName
										? 'ring-red-300'
										: 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
								/>
								{#if touched.lastName && validationErrors.lastName}
									<p class="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
								{/if}
							</div>
						</div>

						<!-- Email -->
						<div class="sm:col-span-2">
							<label for="email" class="block text-sm font-semibold leading-6 text-gray-900">
								Email
							</label>
							<div class="mt-2.5">
								<input
									type="email"
									name="email"
									id="email"
									autocomplete="email"
									bind:value={formData.email}
									on:input={handleChange}
									on:blur={handleBlur}
									class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset {touched.email &&
									validationErrors.email
										? 'ring-red-300'
										: 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
								/>
								{#if touched.email && validationErrors.email}
									<p class="mt-1 text-sm text-red-600">{validationErrors.email}</p>
								{/if}
							</div>
						</div>

						<!-- Phone -->
						<div class="sm:col-span-2">
							<label for="phone" class="block text-sm font-semibold leading-6 text-gray-900">
								Phone number
							</label>
							<div class="mt-2.5">
								<input
									type="tel"
									name="phone"
									id="phone"
									autocomplete="tel"
									placeholder="(123) 456-7890"
									bind:value={formData.phone}
									on:input={handlePhoneInput}
									on:blur={handleBlur}
									class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset {touched.phone &&
									validationErrors.phone
										? 'ring-red-300'
										: 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
								/>
								{#if touched.phone && validationErrors.phone}
									<p class="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
								{/if}
							</div>
						</div>

						<!-- Message -->
						<div class="sm:col-span-2">
							<label for="message" class="block text-sm font-semibold leading-6 text-gray-900">
								Message
							</label>
							<div class="mt-2.5">
								<textarea
									name="message"
									id="message"
									rows="4"
									bind:value={formData.message}
									on:input={handleChange}
									on:blur={handleBlur}
									class="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset {touched.message &&
									validationErrors.message
										? 'ring-red-300'
										: 'ring-gray-300'} placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
								></textarea>
								{#if touched.message && validationErrors.message}
									<p class="mt-1 text-sm text-red-600">{validationErrors.message}</p>
								{/if}
							</div>
						</div>
					</div>

					<div class="mt-8 flex justify-end">
						<button
							type="submit"
							disabled={isSubmitting}
							class="rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? 'Sending...' : 'Send message'}
						</button>
					</div>
				</div>
			</form>
		</div>
	</div>
</div>
