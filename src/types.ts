export type Example = {
  id: string;
  title: string;
  role: string;
  situation: string;
  action: string;
  result: string;
  competencies: string[];
  cue: string;
  createdAt: string;
  updatedAt: string;
};

export type RecallRating = 'recalled' | 'needs-pass';

export type Session = {
  id: string;
  startedAt: string;
  completedAt: string;
  results: { exampleId: string; rating: RecallRating }[];
};

export type Preferences = {
  duration: number;
  reduceMotion: boolean;
  ttsRate: number;
};

export const defaultPreferences: Preferences = {
  duration: 90,
  reduceMotion: false,
  ttsRate: 1
};
