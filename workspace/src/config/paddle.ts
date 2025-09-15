// File: src/config/paddle.ts

/**
 * =================================================================================
 * PADDLE API & PRICE ID CONFIGURATION
 * =================================================================================
 * This file serves as the single source of truth for all Paddle Price IDs used
 * in the application's server-side actions. This is the required method for
 * API-driven checkouts.
 *
 * It is highly recommended to store these IDs in environment variables for security
 * and flexibility, but they are hardcoded here with fallbacks for simplicity.
 *
 * !!! ACTION REQUIRED !!!
 * 1.  You MUST replace the placeholder Price IDs (pri_...) with your own Price IDs
 *     from your Paddle SANDBOX Dashboard.
 * 2.  Go to your Paddle Sandbox Dashboard -> Catalog -> Products. Click a product,
 *     and in the "Prices" section, copy the ID that starts with "pri_".
 * 3.  For a production environment, you would use your LIVE Price IDs and set them
 *     as environment variables.
 * =================================================================================
 */
export const paddlePriceIds = {
  freeTrial: "price_free_trial", // This is a placeholder for logic, not a real Paddle ID
  quickPractice: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_ID || "pri_01k42rzjr37b3gbnm57gy73q0n",
  comprehensiveLesson: process.env.NEXT_PUBLIC_PADDLE_COMPREHENSIVE_LESSON_ID || "pri_01k42s7crjg5qaqybyk5ysytzh",
  quickGroupConversation: process.env.NEXT_PUBLIC_PADDLE_QUICK_GROUP_ID || "pri_01k42sbb9nyg3k7ndn2ngn7vsb",
  immersiveConversationPractice: process.env.NEXT_PUBLIC_PADDLE_IMMERSIVE_GROUP_ID || "pri_01k42sdr84bmrpv6edh0qzjxwq",
  quickPracticeBundle: process.env.NEXT_PUBLIC_PADDLE_QUICK_BUNDLE_ID || "pri_01k42shrqkf5ysnx2t92wg087y",
  learningIntensive: process.env.NEXT_PUBLIC_PADDLE_INTENSIVE_BUNDLE_ID || "pri_01k42skf5mnag80gqgkkxwsq1k",
  starterBundle: process.env.NEXT_PUBLIC_PADDLE_STARTER_BUNDLE_ID || "pri_01k42snac1aqw30bqsx3y694gq",
  foundationPack: process.env.NEXT_PUBLIC_PADDLE_FOUNDATION_PACK_ID || "pri_01k42sptq9716bknset0x62ep1",
};

// This is the older configuration for Hosted Checkout links.
// It is deprecated for this flow but kept for reference.
export const paddleHostedLinks = {
  // ...
};
