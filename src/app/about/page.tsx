'use client';

import Image from 'next/image';
import { ClockIcon, UsersIcon, HeartIcon } from '@heroicons/react/24/outline';

const beliefs = [
  {
    title: 'The Holy Scriptures',
    description: 'The Holy Scriptures, Old and New Testaments, are the written Word of God, given by divine inspiration.',
  },
  {
    title: 'The Trinity',
    description: 'There is one God: Father, Son, and Holy Spirit, a unity of three co-eternal Persons.',
  },
  {
    title: 'The Sabbath',
    description: 'The seventh day of the week, Saturday, is the biblical Sabbath, a day of rest and worship.',
  },
  {
    title: 'Second Coming',
    description: 'Jesus Christ will return personally and visibly in glory to redeem His people.',
  },
];

const values = [
  {
    title: 'Community',
    description: 'We foster a welcoming and supportive community where everyone can grow in faith together.',
  },
  {
    title: 'Service',
    description: 'We are committed to serving our local community and spreading God\'s love through action.',
  },
  {
    title: 'Education',
    description: 'We believe in lifelong spiritual education and growth through Bible study and fellowship.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Image
              className="mx-auto mb-8 h-48 w-auto"
              src="/images/sda-logo.webp"
              alt="Seventh-day Adventist Church Logo"
              width={200}
              height={200}
              priority
            />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">About Our Church</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The Rockville-Tolland Seventh-day Adventist Church is a vibrant community of believers dedicated to sharing God's love 
              and the three angels' messages.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <ClockIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Sabbath Services
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Join us every Saturday for worship and fellowship:</p>
                  <ul className="mt-2 ml-4 list-disc">
                    <li>Sabbath School: 9:30 AM</li>
                    <li>Divine Service: 11:00 AM</li>
                  </ul>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <UsersIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Our Community
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    We are a diverse family of believers united in Christ, offering ministries and programs for all age groups. 
                    Whether you're a long-time Adventist or just beginning your spiritual journey, you'll find a welcoming home here.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <HeartIcon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Our Mission
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    We are committed to spreading the everlasting gospel, preparing people for Jesus' soon return through 
                    education, service, and evangelism.
                  </p>
                </dd>
              </div>
            </dl>
          </div>

          <div className="mx-auto mt-16 max-w-2xl lg:mt-24">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Our Beliefs</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              As Seventh-day Adventists, we believe in the Bible as God's inspired Word and follow its teachings. 
              Our fundamental beliefs include:
            </p>
            <ul className="mt-8 space-y-4 text-gray-600">
              <li className="flex gap-x-3">
                <span className="text-blue-600">•</span>
                The seventh-day Sabbath as God's holy day of rest and worship
              </li>
              <li className="flex gap-x-3">
                <span className="text-blue-600">•</span>
                The soon return of Jesus Christ to this earth
              </li>
              <li className="flex gap-x-3">
                <span className="text-blue-600">•</span>
                The importance of healthy, wholesome living as part of our Christian witness
              </li>
              <li className="flex gap-x-3">
                <span className="text-blue-600">•</span>
                The three angels' messages of Revelation 14
              </li>
              <li className="flex gap-x-3">
                <span className="text-blue-600">•</span>
                The gift of prophecy as manifested in the ministry of Ellen G. White
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Location section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-8 text-center">Our Location</h2>
            <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://www.openstreetmap.org/export/embed.html?bbox=-72.40969549999999%2C41.86854005903991%2C-72.40569549999999%2C41.87254005903991&amp;layer=mapnik&amp;marker=41.87054005903991%2C-72.40769549999999"
                style={{ border: 0 }}
                title="Church Location Map"
              />
            </div>
            <div className="mt-6 flex flex-col items-center text-center">
              <div className="mb-4">
                <h3 className="text-base font-semibold leading-7 text-gray-900">Rockville-Tolland SDA Church</h3>
                <address className="mt-2 text-base leading-7 text-gray-600 not-italic">
                  9 Hartford Turnpike<br />
                  Tolland, CT 06084
                </address>
              </div>
              <a
                href="https://www.openstreetmap.org/?mlat=41.87054005903991&mlon=-72.40769549999999#map=18/41.87054/-72.40770"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
