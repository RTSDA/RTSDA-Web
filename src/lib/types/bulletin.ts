export interface BulletinSection {
    title: string;
    content: string;
}

export interface Bulletin {
    id: string;
    title: string;
    date: Date;
    sections: BulletinSection[];
    pdfUrl?: string;
    url?: string;
    isActive: boolean;
    created: Date;
    updated: Date;
} 