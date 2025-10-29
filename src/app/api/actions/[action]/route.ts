
// src/app/api/actions/[action]/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { submitTestimonialAction } from "@/app/actions/testimonialActions";

// A map of server actions that can be called via this API route.
const actions: Record<string, Function> = {
  "submit-testimonial": submitTestimonialAction,
  // Add other server actions here if they need to be called from the client with headers
};

async function handler(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  const action = actions[params.action];

  if (!action) {
    return NextResponse.json({ error: "Action not found" }, { status: 404 });
  }

  try {
    // We are forwarding the request, but Next.js Server Actions automatically
    // pick up headers, so we don't need to pass them explicitly here.
    // The server action will have access to `headers()`.
    const formData = await req.formData();
    await action(formData);
    
    // Server actions that redirect will throw a special error that Next.js catches.
    // If it doesn't redirect, we can return a success response.
    // Because `submitTestimonialAction` now redirects, this success response may not be sent,
    // which is the expected behavior.
    return NextResponse.json({ success: true, message: "Action completed." });

  } catch (error: any) {
    // This will catch redirect errors from server actions and allow Next.js to handle them.
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
    }
    
    console.error(`Error executing action '${params.action}':`, error);
    return NextResponse.json(
      { success: false, error: error.message || "Server action failed." },
      { status: 500 }
    );
  }
}

export const POST = handler;
