'use client';

import { useEffect, useState } from 'react';
import { sermonService, type Sermon } from '@/services/SermonService';
import SermonBrowser from '@/components/sermons/SermonBrowser';

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showBrowser, setShowBrowser] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    async function fetchSermons() {
      try {
        const allSermons = await sermonService.getAllSermons();
        setSermons(allSermons);
      } catch (err) {
        setError('Failed to load sermons');
        console.error('Error loading sermons:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSermons();
  }, []);

  // Get unique tags from all sermons
  const allTags = Array.from(new Set(sermons.flatMap(sermon => sermon.tags || [])));

  // Filter sermons based on search term and selected tag
  const filteredSermons = sermons.filter(sermon => {
    const matchesSearch = searchTerm === '' || 
      sermon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sermon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || (sermon.tags && sermon.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
  };

  return (
    <div className="container mx-auto px-4 pt-20 pb-8">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">Sermons</h1>
        <p className="text-lg text-gray-600 mb-8">Browse our collection of sermons or search by title, speaker, or topic</p>
        
        {/* Search Toggle Button */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg 
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          {showSearch ? 'Hide Search' : 'Search Sermons'}
        </button>
        
        {/* Search and filter section */}
        {showSearch && (
          <div className="mt-6 flex flex-col gap-4 transition-all duration-200 ease-in-out">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sermons..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-3 pl-10 rounded-lg bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                autoFocus
              />
              <svg 
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
            {allTags.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    !selectedTag 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedTag === tag 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Sermons Browser */}
        {!isSearching && (
          <div className="mb-12">
            <SermonBrowser />
          </div>
        )}

        {/* Search Results */}
        {isSearching && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {filteredSermons.length} 
                {filteredSermons.length === 1 ? ' Sermon' : ' Sermons'} Found
              </h2>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag(null);
                  setIsSearching(false);
                }}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
                </svg>
                Back to Browser
              </button>
            </div>
            {filteredSermons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSermons.map((sermon) => (
                  <div key={sermon.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2">{sermon.title}</h2>
                      <p className="text-gray-600 mb-4">
                        Speaker: {sermon.speaker}<br />
                        Date: {sermon.date}
                      </p>
                      {sermon.description && (
                        <p className="text-gray-700 mb-4 line-clamp-2">{sermon.description}</p>
                      )}
                      {sermon.video_url && (
                        <div className="aspect-w-16 aspect-h-9">
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
                      {sermon.tags && sermon.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {sermon.tags.map(tag => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No sermons found</h3>
                <p className="mt-2 text-gray-500">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
