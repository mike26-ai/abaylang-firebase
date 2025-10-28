
// File: src/config/creditMapping.ts

/**
 * Maps a package product ID (the credit type) to the individual lesson
 * product ID that can be booked with that credit.
 */
export const creditToLessonMap: Record<string, string> = {
  'quick-practice-bundle': 'quick-practice',
  'learning-intensive': 'comprehensive-lesson',
  'starter-bundle': 'quick-practice',
  'foundation-pack': 'comprehensive-lesson',
  // Add other mappings here if new packages are created
};
