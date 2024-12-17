'use client';

import { useState, useEffect, useCallback } from 'react';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
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
          // Allow formats: (123) 456-7890, 123-456-7890, 1234567890
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
  };

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce((name: string, value: string) => {
      const fieldErrors = validateField(name, value);
      setValidationErrors(prev => ({
        ...prev,
        [name]: fieldErrors[name]
      }));
    }, 500),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Trigger debounced validation
    debouncedValidate(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Immediate validation on blur
    const fieldErrors = validateField(name, formData[name as keyof typeof formData]);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name]
    }));
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits (plus optional leading 1)
    const truncatedDigits = digitsOnly.startsWith('1') 
      ? digitsOnly.slice(0, 11)  // +1 plus 10 digits
      : digitsOnly.slice(0, 10); // just 10 digits
    
    // Format the number
    let formattedNumber = truncatedDigits;
    if (truncatedDigits.length > 0) {
      // If starts with 1, format as +1 (XXX) XXX-XXXX
      if (truncatedDigits.startsWith('1')) {
        const areaCode = truncatedDigits.slice(1, 4);
        const middle = truncatedDigits.slice(4, 7);
        const last = truncatedDigits.slice(7, 11);
        formattedNumber = `+1 ${areaCode && `(${areaCode}`}${areaCode && middle && ')'} ${middle}${middle && last && '-'}${last}`;
      }
      // Otherwise format as (XXX) XXX-XXXX
      else {
        const areaCode = truncatedDigits.slice(0, 3);
        const middle = truncatedDigits.slice(3, 6);
        const last = truncatedDigits.slice(6, 10);
        formattedNumber = `${areaCode && `(${areaCode}`}${areaCode && middle && ')'} ${middle}${middle && last && '-'}${last}`;
      }
    }

    setFormData(prev => ({
      ...prev,
      phone: formattedNumber,
    }));
    
    // Trigger validation
    debouncedValidate('phone', formattedNumber);
  };

  const validateForm = () => {
    let allErrors: Record<string, string> = {};
    
    // Validate all fields
    Object.entries(formData).forEach(([name, value]) => {
      const fieldErrors = validateField(name, value);
      if (fieldErrors[name]) {
        allErrors[name] = fieldErrors[name];
      }
    });
    
    // Mark all fields as touched when submitting
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      message: true,
    });
    
    setValidationErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      setError('Please fix the errors in the form before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://contact.rockvilletollandsda.church/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        }),
      });
    
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit form');
      }
      
      setSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
      });
      setTouched({});
      setValidationErrors({});
      
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('There was an error submitting your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          <div className="relative px-6 pb-20 pt-24 sm:pt-32 lg:static lg:px-8 lg:py-48">
            <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-lg">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Get in touch</h1>
              <p className="text-lg text-gray-600 mb-8">
                Get in touch with us, submit a prayer request, or sign up for Bible studies. We'd love to hear from you!
              </p>
              <dl className="mt-10 space-y-4 text-base leading-7 text-gray-600">
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Address</span>
                    <EnvelopeIcon className="h-7 w-6 text-gray-400" aria-hidden="true" />
                  </dt>
                  <dd>
                    9 Hartford Turnpike<br />
                    Tolland, CT 06084<br />
                    <a href="mailto:info@rockvilletollandsda.org" className="hover:text-blue-600">
                      info@rockvilletollandsda.org
                    </a>
                  </dd>
                </div>
                <div className="flex gap-x-4">
                  <dt className="flex-none">
                    <span className="sr-only">Phone</span>
                    <PhoneIcon className="h-7 w-6 text-gray-400" aria-hidden="true" />
                  </dt>
                  <dd>
                    <a className="hover:text-gray-900" href="tel:+1 (860) 875-0450">
                      +1 (860) 875-0450
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="px-6 pb-24 pt-20 sm:pb-32 lg:px-8 lg:py-48">
            <div className="mx-auto max-w-xl lg:mr-0 lg:max-w-lg">
              {submitted && (
                <div className="mb-6 rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Thank you for your message! We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        There were errors with your submission
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    First name
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                        touched.firstName && validationErrors.firstName ? 'ring-red-300' : 'ring-gray-300'
                      } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                    />
                    {touched.firstName && validationErrors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Last name
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                        touched.lastName && validationErrors.lastName ? 'ring-red-300' : 'ring-gray-300'
                      } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                    />
                    {touched.lastName && validationErrors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Email
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                        touched.email && validationErrors.email ? 'ring-red-300' : 'ring-gray-300'
                      } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                    />
                    {touched.email && validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Phone number
                  </label>
                  <div className="mt-2.5">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      placeholder="(123) 456-7890"
                      value={formData.phone}
                      onChange={handlePhoneInput}
                      onBlur={handleBlur}
                      className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                        touched.phone && validationErrors.phone ? 'ring-red-300' : 'ring-gray-300'
                      } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                    />
                    {touched.phone && validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold leading-6 text-gray-900"
                  >
                    Message
                  </label>
                  <div className="mt-2.5">
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                        touched.message && validationErrors.message ? 'ring-red-300' : 'ring-gray-300'
                      } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                    />
                    {touched.message && validationErrors.message && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.message}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
