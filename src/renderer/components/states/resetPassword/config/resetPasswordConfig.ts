export type FeedbackType = 'success' | 'error' | 'info';

export interface Feedback {
  type: FeedbackType;
  text: string;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
