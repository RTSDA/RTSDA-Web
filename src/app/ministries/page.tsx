'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { sermonService, type Sermon } from '@/services/SermonService';

const ministries = [
  {
    name: 'Prayer Ministry',
    description:
      'Submit your prayer requests or join our prayer team. We believe in the power of prayer and would be honored to pray for your needs.',
    imageUrl: '/images/events/prayer.webp',
    links: [
      {
        text: 'Submit Prayer Request',
        url: '/contact'
      }
    ]
  },
  {
    name: 'Gardening Ministry',
    description:
      'Learn about sustainable gardening practices and join our community of gardeners. Watch our gardening series to learn practical tips and techniques.',
    imageUrl: '/images/garden.webp',
    links: [
      {
        text: 'Garden Video Series',
        url: 'https://www.youtube.com/playlist?list=PLtVXQJggBMd8p00o3vo5MsGizRy1Dkwca',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
          </svg>
        )
      }
    ]
  },
  {
    name: 'Bible Studies',
    description:
      'Deepen your understanding of Scripture through our Bible study programs and resources. Access free Bible study guides and tools to enhance your spiritual journey.',
    imageUrl: '/images/bible.webp',
    links: [
      {
        text: 'Request Bible Studies',
        url: '/contact'
      },
      {
        text: 'Study Guides',
        url: 'https://www.amazingfacts.org/media-library/read/c/2/t/bible-study-guides'
      },
      {
        text: 'E-Sword App',
        url: 'https://www.e-sword.net/'
      },
      {
        text: 'Bible Project App',
        url: 'https://bibleproject.com/app/'
      }
    ]
  },
  {
    name: 'Adventist Youth',
    description:
      'Join our vibrant youth community for spiritual growth, fellowship, and service opportunities.',
    imageUrl: '/images/ay.webp',
    links: [
      {
        text: 'Contact Youth Ministry',
        url: 'mailto:adventistyouthbookstore@gmail.com'
      }
    ]
  },
  {
    name: 'Health Ministry',
    description:
      'Discover resources and programs promoting physical, mental, and spiritual well-being through our health ministry.',
    imageUrl: '/images/health.webp',
    links: [
      {
        text: 'Health Resources',
        url: 'https://www.healthministries.com/articles/'
      }
    ]
  }
];

export default function MinistriesPage() {
  const [latestSermon, setLatestSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestSermon() {
      try {
        const sermon = await sermonService.getLatestSermon();
        setLatestSermon(sermon);
      } catch (err) {
        console.error('Error loading sermon:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestSermon();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Ministries</h1>

      {/* Latest Sermon Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Sermon</h2>
          <Link 
            href="/sermons" 
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            View All Sermons
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : latestSermon?.video_url ? (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <video 
                className="w-full rounded-lg"
                controls
                preload="metadata"
              >
                <source src={`https://api.rockvilletollandsda.church${latestSermon.video_url}`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{latestSermon.title}</h3>
              <p className="text-gray-600">
                Speaker: {latestSermon.speaker}<br />
                Date: {latestSermon.date}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No sermon available at this time.</p>
          </div>
        )}
      </div>

      {/* Ministries Grid */}
      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {ministries.map((ministry) => (
          <article
            key={ministry.name}
            className="flex flex-col items-start bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className={`relative w-full ${ministry.name === 'Adventist Youth' ? 'h-[400px]' : 'aspect-[4/3]'} rounded-t-2xl overflow-hidden`}>
              <Image
                src={ministry.imageUrl}
                alt={ministry.name}
                fill
                className={ministry.name === 'Adventist Youth' ? 'object-contain bg-white' : 'object-cover'}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            </div>
            <div className="flex flex-col flex-grow p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {ministry.name}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {ministry.description}
              </p>
              {ministry.name === 'Prayer Ministry' && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Every other Friday</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>6:00 PM - 8:00 PM</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Rockville Tolland SDA Church</span>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {ministry.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors duration-200"
                  >
                    {link.icon}
                    {link.text}
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
