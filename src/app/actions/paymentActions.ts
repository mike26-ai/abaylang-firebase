// File: src/app/actions/paymentActions.ts
'use server';

<<<<<<< HEAD
// NOTE: This file is intentionally left empty.
// The `createPaddleCheckout` server action, which was part of the problematic
// API-driven checkout flow, has been removed.
// The application now uses a simpler and more reliable client-side redirect
// with Paddle's Hosted Checkout links, making this server action obsolete.
// This file is kept to avoid breaking potential imports, but it is recommended
// to be removed in a future cleanup.
=======
// NOTE: This file is intentionally left empty. 
// The `createPaddleCheckout` server action has been removed to fix redirection and DNS errors.
// The application now uses a direct redirect to Paddle's hosted checkout URLs,
// and this server-side payment logic is no longer needed.
>>>>>>> before-product-selection-rewrite
