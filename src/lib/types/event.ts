export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    imageUrl?: string;
    isPublished: boolean;
    isDeleted?: boolean;
    recurrenceType?: 'weekly' | 'monthly' | 'none';
    createdAt: Date;
    updatedAt: Date;
} 