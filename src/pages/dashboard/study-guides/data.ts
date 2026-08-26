export interface AdminGuide {
    id: string;
    title: string;
    category: "Study Tips" | "Exam Guides" | "Updates";
    readTime: string;
    excerpt: string;
    coverImage: string;
    content: string;
    createdAt: string;
}

export const ADMIN_GUIDES: AdminGuide[] = [
    {
        id: "uuid-1",
        title: "How to Create an Effective Study Schedule",
        category: "Study Tips",
        readTime: "5 min read",
        excerpt: "Prepare for the WAEC (West African Examinations Council) exam...",
        coverImage: "https://images.unsplash.com/photo-1616422285623-13ff0162193c",
        content: "<p>Creating an effective study schedule starts...</p>",
        createdAt: "2024-05-10"
    },
    {
        id: "uuid-2",
        title: "Why Your Sleep Schedule Matters For Exams",
        category: "Exam Guides",
        readTime: "5 min read",
        excerpt: "Prepare for the WAEC exam with comprehensive study guides...",
        coverImage: "https://images.unsplash.com/photo-1541359927273-d8c18251e70e",
        content: "<p>Sleep is a vital component of Exam preparation...</p>",
        createdAt: "2024-05-09"
    }
];
