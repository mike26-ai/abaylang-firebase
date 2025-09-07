// File: src/config/paddle.ts

/**
 * =================================================================================
 * PADDLE PRODUCT & PRICE ID CONFIGURATION
 * =================================================================================
 * This file serves as the single source of truth for all Paddle Price IDs used
 * in the application. Centralizing them here prevents typos and makes it easier
 * to manage products.
 *
 * !!! ACTION REQUIRED !!!
 * 1.  You MUST replace the placeholder "pri_..." values below with the real
 *     PRICE IDs from your Paddle SANDBOX Dashboard.
 * 2.  Go to your Paddle Sandbox Dashboard -> Catalog -> Products. Click a product,
 *     and in the "Prices" section, copy the ID that starts with "pri_".
 * 3.  These IDs are safe to be public. It is recommended to add them to your
 *     .env file for easy management (e.g., NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_PRICE_ID=pri_...).
 * =================================================================================
 */

export const paddlePriceIds = {
  // This is a placeholder; free trials don't need a real price ID as they don't go to checkout.
  freeTrial: "price_free_trial",

  // Individual Lessons - Replace with your actual Sandbox Price IDs
  quickPractice: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_PRICE_ID || "pri_YOUR_QUICK_PRACTICE_PRICE_ID",
  comprehensiveLesson: process.env.NEXT_PUBLIC_PADDLE_COMPREHENSIVE_LESSON_PRICE_ID || "pri_YOUR_COMPREHENSIVE_LESSON_PRICE_ID",

  // Group Lessons - Replace with your actual Sandbox Price IDs
  quickGroupConversation: process.env.NEXT_PUBLIC_PADDLE_QUICK_GROUP_CONVERSATION_PRICE_ID || "pri_YOUR_QUICK_GROUP_PRICE_ID",
  immersiveConversationPractice: process.env.NEXT_PUBLIC_PADDLE_IMMERSIVE_CONVERSATION_PRICE_ID || "pri_YOUR_IMMERSIVE_GROUP_PRICE_ID",

  // Packages - Replace with your actual Sandbox Price IDs
  quickPracticeBundle: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_BUNDLE_PRICE_ID || "pri_YOUR_QUICK_PRACTICE_BUNDLE_PRICE_ID",
  learningIntensive: process.env.NEXT_PUBLIC_PADDLE_LEARNING_INTENSIVE_PRICE_ID || "pri_YOUR_LEARNING_INTENSIVE_PRICE_ID",
  starterBundle: process.env.NEXT_PUBLIC_PADDLE_STARTER_BUNDLE_PRICE_ID || "pri_YOUR_STARTER_BUNDLE_PRICE_ID",
  foundationPack: process.env.NEXT_PUBLIC_PADDLE_FOUNDATION_PACK_PRICE_ID || "pri_YOUR_FOUNDATION_PACK_PRICE_ID",
};
