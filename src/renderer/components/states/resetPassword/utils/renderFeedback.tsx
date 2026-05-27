import type { ReactElement } from 'react';
import type { Feedback } from '../config/resetPasswordConfig';

export function renderFeedback(feedback: Feedback | null): ReactElement | null {
  if (!feedback) return null;
  return <div className={`settings-user-feedback settings-user-feedback--${feedback.type}`}>{feedback.text}</div>;
}
