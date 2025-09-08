
'use server';

// This file is being kept for potential future use but is currently not used
// by the client-side Paddle.js checkout flow. The new flow creates a booking
// with status 'awaiting-payment' and then opens the Paddle checkout on the client.
// A new server action, `confirmBookingAfterPayment` in `bookingActions.ts`, is
// called by the Paddle success callback to finalize the booking.

// This separation of concerns is a more robust pattern.
