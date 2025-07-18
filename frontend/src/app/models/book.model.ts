export interface Book {
  googleBooksId: string;
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  thumbnail?: string;
  previewLink?: string;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  isSaved?: boolean;
}