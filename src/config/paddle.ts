// File: src/config/paddle.ts

/**
 * =================================================================================
 * PADDLE HOSTED CHECKOUT & PRICE ID CONFIGURATION
 * =================================================================================
 * This file serves as the single source of truth for all Paddle links and IDs used
 * in the application. This new version supports the "Automated Hosted Checkout" flow.
 *
 * !!! ACTION REQUIRED !!!
 * 1.  You MUST create a "Hosted Checkout" link for each product/price in your
 *     Paddle SANDBOX Dashboard.
 * 2.  Go to your Paddle Sandbox Dashboard -> Catalog -> Products. Click a product,
 *     find the price, and click "Get payment link".
 * 3.  Paste the full URL for each checkout link into the `sandboxLinks` object below,
 *     replacing the placeholder URLs.
 * 4.  (For future) When you go live, you will do the same for your Live Dashboard
 *     and paste the URLs into the `liveLinks` object.
 * =================================================================================
 */

// --- SANDBOX LINKS ---
// Replace these with your actual Hosted Checkout URLs from the Paddle Sandbox.
const sandboxLinks = {
  quickPractice: "https://sandbox-pay.paddle.io/hsc_01k44w6c7pdzwtdm84hrp5khfb_b798p8bckht11y136gtgrza3dgf1v41f",
  comprehensiveLesson: "https://sandbox-pay.paddle.io/hsc_01k4q997qa3rgn2v1dn8rwgh1t_mcck1jw6220f8gyn6dmg3yxp0d1h2zdj",
  quickGroupConversation: "https://sandbox-pay.paddle.io/hsc_01k4q9de9pp0nehrfzza9xt4qk_tyskmgdfjpqf9gb4exbdppmfamr7yvr6",
  immersiveConversationPractice: "https://sandbox-pay.paddle.io/hsc_01k4q9g1zv2h3jwgrfyd2vxwea_a7y9n51973m2sv5pj6ex8nghyynprfd9",
  quickPracticeBundle: "https://sandbox-pay.paddle.io/hsc_01k4q9knbp3ftxekna4dk1931t_qs5nxhz8e0gxnzr26vn6wf550d87x5xk",
  learningIntensive: "https://sandbox-pay.paddle.io/hsc_01k4q9px04qc7wqcq02gs10tgy_9yxtr4jjvx6e96ajqmtn25qnr8bdt5bv",
  starterBundle: "https://sandbox-pay.paddle.io/hsc_01k4q9t9vz1f0539h7b2kfhxre_sfvbqr5ganhnxv6e5yt97dpxxc3csw38",
  foundationPack: "https://sandbox-pay.paddle.io/hsc_01k4q9wd0jsm41fpzz8v4ba30d_7e1kc61sn16kf7s4ddg465tk9fxaf5dz",
};

// --- LIVE LINKS ---
// After your site is approved by Paddle, you will create Live checkouts and paste the URLs here.
const liveLinks = {
  quickPractice: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
  comprehensiveLesson: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
  quickGroupConversation: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
  immersiveConversationPractice: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
  quickPracticeBundle: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
  learningIntensive: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
  starterBundle: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
  foundationPack: "https://YOUR_LIVE_CHECKOUT_LINK_HERE",
};

// The application will automatically use the correct set of links based on the environment.
export const paddleHostedLinks =
  process.env.NODE_ENV === 'production' ? liveLinks : sandboxLinks;


// We are keeping the Price IDs here for reference or potential future use,
// but they are NOT used in the Hosted Checkout flow.
export const paddlePriceIds = {
  freeTrial: "price_free_trial",
  quickPractice: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_PRICE_ID || "pri_YOUR_QUICK_PRACTICE_PRICE_ID",
  comprehensiveLesson: process.env.NEXT_PUBLIC_PADDLE_COMPREHENSIVE_LESSON_PRICE_ID || "pri_YOUR_COMPREHENSIVE_LESSON_PRICE_ID",
  quickGroupConversation: process.env.NEXT_PUBLIC_PADDLE_QUICK_GROUP_CONVERSATION_PRICE_ID || "pri_YOUR_QUICK_GROUP_PRICE_ID",
  immersiveConversationPractice: process.env.NEXT_PUBLIC_PADDLE_IMMERSIVE_CONVERSATION_PRICE_ID || "pri_YOUR_IMMERSIVE_GROUP_PRICE_ID",
  quickPracticeBundle: process.env.NEXT_PUBLIC_PADDLE_QUICK_PRACTICE_BUNDLE_PRICE_ID || "pri_YOUR_QUICK_PRACTICE_BUNDLE_PRICE_ID",
  learningIntensive: process.env.NEXT_PUBLIC_PADDLE_LEARNING_INTENSIVE_PRICE_ID || "pri_YOUR_LEARNING_INTENSIVE_PRICE_ID",
  starterBundle: process.env.NEXT_PUBLIC_PADDLE_STARTER_BUNDLE_PRICE_ID || "pri_YOUR_STARTER_BUNDLE_PRICE_ID",
  foundationPack: process.env.NEXT_PUBLIC_PADDLE_FOUNDATION_PACK_PRICE_ID || "pri_YOUR_FOUNDATION_PACK_PRICE_ID",
};
