// File: src/config/paddle.ts

/**
 * =================================================================================
 * PADDLE PRODUCT & PRICE ID CONFIGURATION
 * =================================================================================
 * This file serves as the single source of truth for all Paddle Price IDs used
 * in the application. Centralizing them here prevents typos and makes it easier
 * to manage products.
 *
 * IMPORTANT:
 * 1.  Ensure that the values you enter here are the correct PRICE IDs from your
 *     Paddle Dashboard (e.g., "pri_...")
 * 2.  All Price IDs MUST come from the same environment (either all Sandbox or all Live).
 *     Mixing them will cause payment errors.
 * 3.  These IDs are safe to be public (`NEXT_PUBLIC_`).
 * =================================================================================
 */

export const paddlePriceIds = {
  // Individual Lessons
  freeTrial: "price_free_trial", // This is a placeholder; free trials don't have a price ID
  quickPractice: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_PRICE_ID,
  comprehensiveLesson: process.env.NEXT_PUBLIC_PADDLE_COMPREHENSIVE_LESSON_PRICE_ID,

  // Group Lessons
  quickGroupConversation: process.env.NEXT_PUBLIC_PADDLE_QUICK_GROUP_CONVERSATION_PRICE_ID,
  immersiveConversationPractice: process.env.NEXT_PUBLIC_PADDLE_IMMERSIVE_CONVERSATION_PRICE_ID,

  // Packages
  quickPracticeBundle: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_BUNDLE_PRICE_ID,
  learningIntensive: process.env.NEXT_PUBLIC_PADDLE_LEARNING_INTENSIVE_PRICE_ID,
  starterBundle: process.env.NEXT_PUBLIC_PADDLE_STARTER_BUNDLE_PRICE_ID,
  foundationPack: process.env.NEXT_PUBLIC_PADDLE_FOUNDATION_PACK_PRICE_ID,
};

// A mapping from the URL query parameter or internal identifier to the Price ID
export const lessonTypeToPriceIdMap: { [key: string]: string | undefined } = {
  'free-trial': paddlePriceIds.freeTrial,
  'quick-practice': paddlePriceIds.quickPractice,
  'comprehensive-lesson': paddlePriceIds.comprehensiveLesson,
  'quick-group-conversation': paddlePriceIds.quickGroupConversation,
  'immersive-conversation-practice': paddlePriceIds.immersiveConversationPractice,
  'quick-practice-bundle': paddlePriceIds.quickPracticeBundle,
  'learning-intensive': paddlePriceIds.learningIntensive,
  'starter-bundle': paddlePriceIds.starterBundle,
  'foundation-pack': paddlePriceIds.foundationPack,
};
