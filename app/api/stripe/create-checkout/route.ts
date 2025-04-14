import { createCheckout } from "@/libs/stripe";
import { createClient } from "@/libs/supabase/server";
import { TABLES, User } from "@/libs/supabase/schema";
import { NextRequest, NextResponse } from "next/server";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req: NextRequest) {
  // Validate request method
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  // Validate required fields with detailed error messages
  if (!body.priceId) {
    return NextResponse.json(
      { error: "Price ID is required" },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: "Success and cancel URLs are required" },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  // Validate mode is one of the allowed values
  if (body.mode !== 'payment' && body.mode !== 'subscription') {
    return NextResponse.json(
      { error: "Mode must be either 'payment' or 'subscription'" },
      { status: 400 }
    );
  }

  // Validate URLs are from our own domain to prevent open redirects
  const { successUrl, cancelUrl } = body;
  try {
    const successUrlObj = new URL(successUrl);
    const cancelUrlObj = new URL(cancelUrl);
    const requestHost = req.headers.get('host');
    
    // Simple host validation - this should be enhanced for production
    if (!requestHost) {
      return NextResponse.json(
        { error: "Invalid request host" },
        { status: 400 }
      );
    }
    
    // Verify URLs are for the same host or approved domains
    if (successUrlObj.host !== requestHost && cancelUrlObj.host !== requestHost) {
      return NextResponse.json(
        { error: "URLs must be from the same domain" },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid URLs provided" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user: authUser },
      error: authError
    } = await supabase.auth.getUser();

    // if (authError || !user) {
    //   return NextResponse.json(
    //     { error: "Authentication required" },
    //     { status: 401 }
    //   );
    // }

    const { priceId, mode } = body;

    // Get user data
    let existingUser: User | undefined;
    if (authUser) {
      const { data, error: userError } = await supabase
        .from(TABLES.USERS)
        .select("*")
        .eq("id", authUser?.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return NextResponse.json(
          { error: "Error fetching user data" },
          { status: 500 }
        );
      }

      existingUser = data;
    }

    // Create checkout session with validated parameters
    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      clientReferenceId: existingUser?.id,
      user: {
        email: existingUser?.email,
        customerId: existingUser?.stripe_customer_id,
      },
      // If you send coupons from the frontend, you can pass it here
      // couponId: body.couponId,
    });

    if (!stripeSessionURL) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error("Stripe checkout error:", e?.message);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
