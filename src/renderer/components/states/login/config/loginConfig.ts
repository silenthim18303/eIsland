export const STANDALONE_WINDOW_MODE_STORE_KEY = 'standalone-window-mode';
export const LEGACY_COUNTDOWN_WINDOW_MODE_STORE_KEY = 'countdown-window-mode';

export type FeedbackType = 'success' | 'error' | 'info';

export interface Feedback {
  type: FeedbackType;
  text: string;
}

export interface LoginStepUpData {
  requireEmailVerification?: boolean;
  maskedEmail?: string;
  verificationEmail?: string;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
