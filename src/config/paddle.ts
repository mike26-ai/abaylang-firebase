<<<<<<< HEAD
=======

>>>>>>> before-product-selection-rewrite
// File: src/config/paddle.ts

/**
 * =================================================================================
<<<<<<< HEAD
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
    quickPractice: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_LINK || "https://sandbox-pay.paddle.io/hsc_01k44w6c7pdzwtdm84hrp5khfb_b798p8bckht11y136gtgrza3dgf1v41f",
    comprehensiveLesson: process.env.NEXT_PUBLIC_PADDLE_COMPREHENSIVE_LESSON_LINK || "https://sandbox-pay.paddle.io/hsc_01k44w6c7pdzwtdm84hrp5khfb_b798p8bckht11y136gtgrza3dgf1v41f",
    quickGroupConversation: process.env.NEXT_PUBLIC_PADDLE_QUICK_GROUP_CONVERSATION_LINK || "https://sandbox-pay.paddle.io/hsc_01k4q9de9pp0nehrfzza9xt4qk_tyskmgdfjpqf9gb4exbdppmfamr7yvr6",
    immersiveConversationPractice: process.env.NEXT_PUBLIC_PADDLE_IMMERSIVE_CONVERSATION_LINK || "https://sandbox-pay.paddle.io/hsc_01k4q9g1zv2h3jwgrfyd2vxwea_a7y9n51973m2sv5pj6ex8nghyynprfd9",
    quickPracticeBundle: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_BUNDLE_LINK || "https://sandbox-pay.paddle.io/hsc_01k4q9knbp3ftxekna4dk1931t_qs5nxhz8e0gxnzr26vn6wf550d87x5xk",
    learningIntensive: process.env.NEXT_PUBLIC_PADDLE_LEARNING_INTENSIVE_LINK || "https://sandbox-pay.paddle.io/hsc_01k4q9px04qc7wqcq02gs10tgy_9yxtr4jjvx6e96ajqmtn25qnr8bdt5bv",
    starterBundle: process.env.NEXT_PUBLIC_PADDLE_STARTER_BUNDLE_LINK || "https://sandbox-pay.paddle.io/hsc_01k4q9t9vz1f0539h7b2kfhxre_sfvbqr5ganhnxv6e5yt97dpxxc3csw38",
    foundationPack: process.env.NEXT_PUBLIC_PADDLE_FOUNDATION_PACK_LINK || "https://sandbox-pay.paddle.io/hsc_01k4q9wd0jsm41fpzz8v4ba30d_7e1kc61sn16kf7s4ddg465tk9fxaf5dz",
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
=======
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
>>>>>>> before-product-selection-rewrite
