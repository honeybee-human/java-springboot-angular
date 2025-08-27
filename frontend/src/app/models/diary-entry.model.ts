import { Book } from './book.model';

export interface DiaryEntry {
  id?: number;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  associatedBook?: Book;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum Mood {
  VERY_HAPPY = 'VERY_HAPPY',
  HAPPY = 'HAPPY',
  NEUTRAL = 'NEUTRAL',
  SAD = 'SAD',
  VERY_SAD = 'VERY_SAD',
  ANGRY = 'ANGRY',
  ANXIOUS = 'ANXIOUS',
  EXCITED = 'EXCITED',
  GRATEFUL = 'GRATEFUL',
  PEACEFUL = 'PEACEFUL'
}

export interface MoodDisplayInfo {
  emoji: string;
  description: string;
}

export const MoodDisplay: Record<Mood, MoodDisplayInfo> = {
  [Mood.VERY_HAPPY]: { emoji: '😄', description: 'Very Happy' },
  [Mood.HAPPY]: { emoji: '😊', description: 'Happy' },
  [Mood.NEUTRAL]: { emoji: '😐', description: 'Neutral' },
  [Mood.SAD]: { emoji: '😢', description: 'Sad' },
  [Mood.VERY_SAD]: { emoji: '😭', description: 'Very Sad' },
  [Mood.ANGRY]: { emoji: '😠', description: 'Angry' },
  [Mood.ANXIOUS]: { emoji: '😰', description: 'Anxious' },
  [Mood.EXCITED]: { emoji: '🤩', description: 'Excited' },
  [Mood.GRATEFUL]: { emoji: '🙏', description: 'Grateful' },
  [Mood.PEACEFUL]: { emoji: '😌', description: 'Peaceful' }
};