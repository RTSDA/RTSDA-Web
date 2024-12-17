import Image from 'next/image';

export function EventsHero() {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <Image
          className="h-full w-full object-cover"
          src="/images/events.webp"
          alt="Church Events"
          width={1920}
          height={600}
          priority
        />
        <div className="absolute inset-0 bg-gray-500 mix-blend-multiply" />
      </div>
      <div className="relative mx-auto max-w-7xl py-24 px-6 sm:py-32 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Church Events
        </h1>
        <p className="mt-6 max-w-3xl text-xl text-gray-100">
          Join us for worship services, prayer meetings, and community events. Everyone is welcome to
          participate in our church activities and grow together in faith.
        </p>
      </div>
    </div>
  );
}
