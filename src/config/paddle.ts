
// File: src/config/paddle.ts

/**
 * =================================================================================
 * PADDLE PRICE ID CONFIGURATION
 * =================================================================================
 * This file serves as the single source of truth for all Paddle Price IDs used in
 * the application. This setup supports the client-side token checkout flow.
 *
 * It is highly recommended to store these IDs in environment variables for security
 * and flexibility, but they are hardcoded here with fallbacks for simplicity in this
 * starter kit.
 *
 * !!! ACTION REQUIRED !!!
 * 1.  You MUST replace the placeholder Price IDs (pri_...) with your own Price IDs
 *     from your Paddle SANDBOX Dashboard.
 * 2.  Go to your Paddle Sandbox Dashboard -> Catalog -> Products. Click a product,
 *     and you will find the Price ID in the "Prices" section.
 * 3.  For a production environment, you would use your LIVE Price IDs and set them
 *     as environment variables.
 * =================================================================================
 */
export const paddlePriceIds = {
    freeTrial: "price_free_trial", // This is a placeholder for logic, not a real Paddle ID
    quickPractice: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_PRICE_ID || "pri_01k42rzjr37b3gbnm57gy73q0n",
    comprehensiveLesson: process.env.NEXT_PUBLIC_PADDLE_COMPREHENSIVE_LESSON_PRICE_ID || "pri_01k42s7crjg5qaqybyk5ysytzh",
    quickGroupConversation: process.env.NEXT_PUBLIC_PADDLE_QUICK_GROUP_CONVERSATION_PRICE_ID || "pri_01k42sbb9nyg3k7ndn2ngn7vsb",
    immersiveConversationPractice: process.env.NEXT_PUBLIC_PADDLE_IMMERSIVE_CONVERSATION_PRICE_ID || "pri_01k42sdr84bmrpv6edh0qzjxwq",
    quickPracticeBundle: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_BUNDLE_PRICE_ID || "pri_01k42shrqkf5ysnx2t92wg087y",
    learningIntensive: process.env.NEXT_PUBLIC_PADDLE_LEARNING_INTENSIVE_PRICE_ID || "pri_01k42skf5mnag80gqgkkxwsq1k",
    starterBundle: process.env.NEXT_PUBLIC_PADDLE_STARTER_BUNDLE_PRICE_ID || "pri_01k42snac1aqw30bqsx3y694gq",
    foundationPack: process.env.NEXT_PUBLIC_PADDLE_FOUNDATION_PACK_PRICE_ID || "pri_01k42sptq9716bknset0x62ep1",
  };
  
  // This is the older configuration for Hosted Checkouts. It is kept here for reference
  // but is not used in the current client-side token checkout flow.
  const sandboxLinks = {
    quickPractice: "https://sandbox-pay.paddle.io/hsc_01k44w6c7pdzwtdm84hrp5khfb_b798p8bckht11y136gtgrza3dgf1v41f",
  };
  
  const liveLinks = {
    quickPractice: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
  };
  
  export const paddleHostedLinks =
    process.env.NODE_ENV === 'production' ? liveLinks : sandboxLinks;
  
