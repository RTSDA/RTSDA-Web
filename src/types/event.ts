import { Timestamp } from 'firebase/firestore';

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  location: string;
  locationUrl?: string;
  isPublished: boolean;
  isDeleted: boolean;
  recurrenceType: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  imageUrl?: string;
}
