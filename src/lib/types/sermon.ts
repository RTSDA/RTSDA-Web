export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  jellyfinId?: string;
  description?: string;
  thumbnailUrl?: string;
  seriesName?: string;
  type: 'sermons' | 'livestreams';
} 