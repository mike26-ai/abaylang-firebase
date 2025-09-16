// File: src/config/paddle.ts

/**
 * =================================================================================
 * PADDLE HOSTED CHECKOUT CONFIGURATION
 * =================================================================================
 * This file serves as the single source of truth for all Paddle Hosted Checkout
 * links used in the application. This is the simplest and most robust way to
 * integrate Paddle payments.
 *
 * It is highly recommended to store these links in environment variables for security
 * and flexibility, but they are hardcoded here with fallbacks for simplicity in this
 * starter kit.
 *
 * !!! ACTION REQUIRED !!!
 * 1.  You MUST replace the placeholder links (https://sandbox-pay.paddle.com/...)
 *     with your own "Hosted Checkout" links from your Paddle SANDBOX Dashboard.
 * 2.  Go to your Paddle Sandbox Dashboard -> Catalog -> Products. Click a product,
 *     and in the "Prices" section, click the three dots (...) and select
 *     "Share checkout". Copy the "Default" checkout link.
 * 3.  For a production environment, you would use your LIVE links and set them
 *     as environment variables.
 * =================================================================================
 */
export const paddleHostedLinks = {
    freeTrial: "", // This is a placeholder for logic, not a real Paddle link
    quickPractice: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_LINK || "https://amharic-connect.sandboxed.paddle.com/checkout/buy/a292634e-8dae-48a3-a71c-5d15c81f0217",
    comprehensiveLesson: process.env.NEXT_PUBLIC_PADDLE_COMPREHENSIVE_LESSON_LINK || "https://amharic-connect.sandboxed.paddle.com/checkout/buy/588f63c8-028a-4c28-98e3-0c15985834f8",
    quickGroupConversation: process.env.NEXT_PUBLIC_PADDLE_QUICK_GROUP_CONVERSATION_LINK || "https://amharic-connect.sandboxed.paddle.com/checkout/buy/0717387b-40b4-4e2b-a010-94268e37d55f",
    immersiveConversationPractice: process.env.NEXT_PUBLIC_PADDLE_IMMERSIVE_CONVERSATION_LINK || "https://amharic-connect.sandboxed.paddle.com/checkout/buy/d11e582e-9a2c-4b5c-b17c-179339e88b6c",
    quickPracticeBundle: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_BUNDLE_LINK || "https://amharic-connect.sandboxed.paddle.com/checkout/buy/2b0b1a0d-2101-4f4b-8e10-189f7f02d4b9",
    learningIntensive: process.env.NEXT_PUBLIC_PADDLE_LEARNING_INTENSIVE_LINK || "https://amharic-connect.sandboxed.paddle.com/checkout/buy/8e1a7b8e-3c22-4a00-b8c7-2c9339e88b6c",
    starterBundle: process.env.NEXT_PUBLIC_PADDLE_STARTER_BUNDLE_LINK || "https://amharic-connect.sandboxed.paddle.com/checkout/buy/6d8e2a8b-2a2b-4e1a-9f8a-8d7b105a30f7b",
    foundationPack: process.env.NEXT_PUBLIC_PADDLE_FOUNDATION_PACK_LINK || "https://amharic-connect.sandboxed.paddle.com/checkout/buy/b0a9b8c-5a6b-4e3a-9e8a-8d7b105a30f7b",
  };
  

  // This is the older configuration for Price IDs used with API-driven checkouts. 
  // It is deprecated for this flow but kept for reference.
  export const paddlePriceIds = {
    freeTrial: "price_free_trial", 
    quickPractice: "pri_01k42rzjr37b3gbnm57gy73q0n",
    comprehensiveLesson: "pri_01k42s7crjg5qaqybyk5ysytzh",
    quickGroupConversation: "pri_01k42sbb9nyg3k7ndn2ngn7vsb",
    immersiveConversationPractice: "pri_01k42sdr84bmrpv6edh0qzjxwq",
    quickPracticeBundle: "pri_01k42shrqkf5ysnx2t92wg087y",
    learningIntensive: "pri_01k42skf5mnag80gqgkkxwsq1k",
    starterBundle: "pri_01k42snac1aqw30bqsx3y694gq",
    foundationPack: "pri_01k42sptq9716bknset0x62ep1",
  };
