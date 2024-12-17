'use client';

import { useState, useEffect } from 'react';
import { sermonService, type Sermon } from '@/services/SermonService';

interface SermonBrowserProps {
  onSermonSelect?: (sermon: Sermon) => void;
}

export default function SermonBrowser({ onSermonSelect }: SermonBrowserProps) {
  const [years, setYears] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format month from "01-January" to "January"
  const formatMonth = (month: string) => {
    return month.split('-')[1] || month;
  };

  // Load initial years
  useEffect(() => {
    const loadYears = async () => {
      try {
        const years = await sermonService.fetchYears();
        setYears(years);
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (err) {
        setError('Failed to load years');
        console.error('Error loading years:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadYears();
  }, []);

  // Load months when year is selected
  useEffect(() => {
    if (!selectedYear) return;

    const loadMonths = async () => {
      try {
        setIsLoading(true);
        const months = await sermonService.fetchMonths(selectedYear);
        setMonths(months);
        if (months.length > 0) {
          setSelectedMonth(months[0]);
        }
      } catch (err) {
        setError('Failed to load months');
        console.error('Error loading months:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMonths();
  }, [selectedYear]);

  // Load sermons when month is selected
  useEffect(() => {
    if (!selectedYear || !selectedMonth) return;

    const loadSermons = async () => {
      try {
        setIsLoading(true);
        const sermons = await sermonService.fetchSermons(selectedYear, selectedMonth);
        setSermons(sermons);
      } catch (err) {
        setError('Failed to load sermons');
        console.error('Error loading sermons:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSermons();
  }, [selectedYear, selectedMonth]);

  if (isLoading && years.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">Error loading sermons</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year Selection */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-500">Select Year</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Month Selection */}
      {selectedYear && months.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">Select Month</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {months.map((month) => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedMonth === month
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatMonth(month)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sermons List */}
      <div className="space-y-4">
        {sermons.length === 0 && selectedMonth ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold mb-2">No Sermons Available</h3>
            <p className="text-gray-600">
              There are no recorded sermons for this month. Try selecting a different month.
            </p>
          </div>
        ) : (
          sermons.map((sermon) => (
            <div
              key={sermon.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => onSermonSelect?.(sermon)}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{sermon.title}</h3>
                <p className="text-gray-600 mb-4">
                  Speaker: {sermon.speaker}<br />
                  Date: {sermon.date}
                </p>
                {sermon.description && (
                  <p className="text-gray-700 mb-4">{sermon.description}</p>
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
