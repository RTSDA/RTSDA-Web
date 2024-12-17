'use client';

import Image from 'next/image';
import Link from 'next/link';
import { EventList } from '@/components/events/EventList';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0">
          <Image
            className="h-full w-full object-cover"
            src="/images/hero.webp"
            alt="Second Coming of Christ"
            width={1920}
            height={1080}
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 to-gray-900/50" />
        </div>
        <div className="relative container-custom min-h-screen flex items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="heading-1 text-white drop-shadow-lg mb-8">
              Welcome to Rockville-Tolland SDA Church
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto drop-shadow-lg mb-12">
              We are a welcoming community of believers dedicated to sharing God's love and message of hope.
              Join us for worship, fellowship, and spiritual growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/about"
                className="button-secondary bg-white/95 text-gray-900 hover:bg-white mt-4"
              >
                Learn More About Us
              </Link>
              <Link
                href="/contact"
                className="button-primary mt-4"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Upcoming Events section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="heading-2 text-gray-900 mb-4">
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600">
              Join us for these upcoming events and activities at our church.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16"
          >
            <EventList />
          </motion.div>
          <div className="mt-12 text-center">
            <Link
              href="/events"
              className="button-secondary inline-flex items-center"
            >
              View all events
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Service Times section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="container-custom">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="heading-2 text-gray-900 mb-4">
              Service Times
            </h2>
            <p className="text-xl text-gray-600">
              Join us for worship and fellowship every Saturday
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Service Time Cards */}
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
              <div className="flex-grow space-y-4">
                <div className="rounded-full bg-brand-100 p-3 w-12 h-12 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Sabbath School
                </h3>
                <p className="text-lg font-medium text-brand-600">
                  Saturday at 9:15 AM
                </p>
                <p className="text-gray-600">
                  Study God's Word in depth with fellow believers in our adult and children's classes
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
              <div className="flex-grow space-y-4">
                <div className="rounded-full bg-brand-100 p-3 w-12 h-12 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Divine Service
                </h3>
                <p className="text-lg font-medium text-brand-600">
                  Saturday at 11:00 AM
                </p>
                <p className="text-gray-600">
                  Join us for praise, worship, and an inspiring message from God's Word
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col h-full">
              <div className="flex-grow space-y-4">
                <div className="rounded-full bg-brand-100 p-3 w-12 h-12 flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Fellowship Lunch
                </h3>
                <p className="text-lg font-medium text-brand-600">
                  Saturday after Service
                </p>
                <p className="text-gray-600">
                  Stay for a delicious vegetarian meal and fellowship with our church family
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
