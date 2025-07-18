import { Book } from '../models/book.model';

export const FAKE_BOOKS: Book[] = [
  {
    googleBooksId: 'fake-1',
    title: 'The Power of Now',
    subtitle: 'A Guide to Spiritual Enlightenment',
    authors: ['Eckhart Tolle'],
    publisher: 'New World Library',
    publishedDate: '2004',
    description: 'The Power of Now shows you that every minute you spend worrying about the future or regretting the past is a minute lost, because really all you have to live in is the present, the now.',
    thumbnail: 'https://books.google.com/books/content?id=iJZYBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    previewLink: 'https://books.google.com/books?id=iJZYBAAAQBAJ',
    categories: ['Self-Help', 'Spirituality', 'Philosophy'],
    averageRating: 4.2,
    ratingsCount: 1250,
    isSaved: false
  },
  {
    googleBooksId: 'fake-2',
    title: 'Atomic Habits',
    subtitle: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    authors: ['James Clear'],
    publisher: 'Avery',
    publishedDate: '2018',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies.',
    thumbnail: 'https://books.google.com/books/content?id=XfFvDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    previewLink: 'https://books.google.com/books?id=XfFvDwAAQBAJ',
    categories: ['Self-Help', 'Psychology', 'Personal Development'],
    averageRating: 4.6,
    ratingsCount: 2100,
    isSaved: false
  },
  {
    googleBooksId: 'fake-3',
    title: 'Think and Grow Rich',
    subtitle: 'The Landmark Bestseller Now Revised and Updated',
    authors: ['Napoleon Hill'],
    publisher: 'TarcherPerigee',
    publishedDate: '2005',
    description: 'Think and Grow Rich has been called the "Granddaddy of All Motivational Literature." It was the first book to boldly ask, "What makes a winner?"',
    thumbnail: 'https://books.google.com/books/content?id=9kCgCwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    previewLink: 'https://books.google.com/books?id=9kCgCwAAQBAJ',
    categories: ['Business', 'Self-Help', 'Success'],
    averageRating: 4.1,
    ratingsCount: 890,
    isSaved: false
  },
  {
    googleBooksId: 'fake-4',
    title: 'The 7 Habits of Highly Effective People',
    subtitle: 'Powerful Lessons in Personal Change',
    authors: ['Stephen R. Covey'],
    publisher: 'Free Press',
    publishedDate: '2004',
    description: 'One of the most inspiring and impactful books ever written, The 7 Habits of Highly Effective People has captivated readers for 25 years.',
    thumbnail: 'https://books.google.com/books/content?id=Jz1aBAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    previewLink: 'https://books.google.com/books?id=Jz1aBAAAQBAJ',
    categories: ['Self-Help', 'Leadership', 'Personal Development'],
    averageRating: 4.3,
    ratingsCount: 1560,
    isSaved: false
  }
]