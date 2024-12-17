'use client';

import { useEffect, useState } from 'react';
import { sermonService, type Sermon } from '@/services/SermonService';

interface LatestSermonProps {
  showViewMore?: boolean;
}

export default function LatestSermon({ showViewMore = true }: LatestSermonProps) {
  const [sermon, setSermon] = useState<Sermon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatestSermon() {
      try {
        const latestSermon = await sermonService.getLatestSermon();
        setSermon(latestSermon);
      } catch (err) {
        setError('Failed to load the latest sermon');
        console.error('Error loading sermon:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLatestSermon();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!sermon) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No sermons available at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{sermon.title}</h2>
        <p className="text-gray-600 mb-4">
          Speaker: {sermon.speaker}<br />
          Date: {sermon.date}
        </p>
        {sermon.description && (
          <p className="text-gray-700 mb-4">{sermon.description}</p>
        )}
        {sermon.video_url && (
          <div className="aspect-w-16 aspect-h-9 mb-4">
            <video 
              className="w-full rounded-lg"
              controls
              preload="metadata"
            >
              <source src={`https://api.rockvilletollandsda.church${sermon.video_url}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        {showViewMore && (
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/sermons'}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
            >
              View More Sermons
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
