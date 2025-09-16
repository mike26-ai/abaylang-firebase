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
    quickPractice: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_LINK || "https://sandbox-pay.paddle.com/checkout/448a3355-873c-4c31-8c44-bf83f5c12891",
    comprehensiveLesson: process.env.NEXT_PUBLIC_PADDLE_COMPREHENSIVE_LESSON_LINK || "https://sandbox-pay.paddle.com/checkout/014f4a3e-6a5d-4f0e-8d07-2c93315a6b7b",
    quickGroupConversation: process.env.NEXT_PUBLIC_PADDLE_QUICK_GROUP_CONVERSATION_LINK || "https://sandbox-pay.paddle.com/checkout/19932ad8-33e3-4710-a29e-4c7b809a7a6c",
    immersiveConversationPractice: process.env.NEXT_PUBLIC_PADDLE_IMMERSIVE_CONVERSATION_LINK || "https://sandbox-pay.paddle.com/checkout/f2e5114c-473d-4c3e-a82f-2c35c24e6c98",
    quickPracticeBundle: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_BUNDLE_LINK || "https://sandbox-pay.paddle.com/checkout/c96d9f8f-c073-4f91-9c1c-967a780b4321",
    learningIntensive: process.env.NEXT_PUBLIC_PADDLE_LEARNING_INTENSIVE_LINK || "https://sandbox-pay.paddle.com/checkout/15da6f8f-3ed4-4f96-932f-410a8d9b5432",
    starterBundle: process.env.NEXT_PUBLIC_PADDLE_STARTER_BUNDLE_LINK || "https://sandbox-pay.paddle.com/checkout/8f8e8a8d-28e4-4c80-8796-78b105a30f7b",
    foundationPack: process.env.NEXT_PUBLIC_PADDLE_FOUNDATION_PACK_LINK || "https://sandbox-pay.paddle.com/checkout/8b0a9b8c-5a6b-4e3a-9e8a-8d7b105a30f7b",
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
