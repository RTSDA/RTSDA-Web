export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location?: string;
    location_url?: string;
    image?: string;
    thumbnail?: string;
    category: EventCategory;
    isFeatured: boolean;
    reoccuring: ReoccurringType;
    created: Date;
    updated: Date;
}

export enum EventCategory {
    Service = 'Service',
    Social = 'Social',
    Ministry = 'Ministry',
    Other = 'Other'
}

export enum ReoccurringType {
    None = '',
    Daily = 'DAILY',
    Weekly = 'WEEKLY',
    Biweekly = 'BIWEEKLY',
    FirstTuesday = 'FIRST_TUESDAY'
} 