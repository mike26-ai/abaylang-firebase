
// File: src/config/paddle.ts

/**
 * =================================================================================
 * PADDLE API & CHECKOUT LINK CONFIGURATION
 * =================================================================================
 * This file is the single source of truth for all Paddle-related IDs and links.
 * 
 * ---
 * !!! ACTION REQUIRED: SET UP YOUR PRODUCT PRICE IDS !!!
 * ---
 * 1. Go to your Paddle Sandbox Dashboard: https://sandbox-vendors.paddle.com/
 * 2. Navigate to: Catalog -> Products.
 * 3. For EACH product you sell (e.g., "Quick Practice", "Learning Intensive"), click on it.
 * 4. In the "Prices" section, find the price you want to use.
 * 5. Click the "Copy ID" button next to the price. The ID should start with "pri_".
 * 6. Paste the ID into the corresponding value in the `paddlePriceIds` object below, replacing the placeholder.
 * 7. Repeat for all products you want to sell.
 * =================================================================================
 */

// [CURRENTLY USED] For the server-side, API-driven checkout flow.
// Kept here for future reference if you decide to upgrade the payment system.
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

// [DEPRECATED] This is no longer used. The system now uses the paddlePriceIds object above to generate checkouts.
export const paddleHostedLinks = {
  quick_practice: "DEPRECATED",
  comprehensive_lesson: "DEPRECATED",
  // ... and so on
};
