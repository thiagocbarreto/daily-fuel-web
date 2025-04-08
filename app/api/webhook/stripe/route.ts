import configFile from "@/config";
import { findCheckoutSession } from "@/libs/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is where we receive Stripe webhook events
// It updates user subscription status, allowing users to create challenges
export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = headers().get("stripe-signature");

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  try {
    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created
        // Grant subscriber status to create challenges
        const stripeObject = event.data.object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        if (!customerId || !priceId || !plan) break;

        // Retrieve customer details
        const customerResponse = await stripe.customers.retrieve(customerId as string);
        if (customerResponse.deleted) break;
        
        // Cast to Customer type (now that we've verified it's not deleted)
        const customer = customerResponse as Stripe.Customer;

        let user;
        if (!userId) {
          // Check if user already exists by email
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", customer.email)
            .single();
          
          if (existingUser) {
            user = existingUser;
          } else {
            // Create a new user using supabase auth admin
            const { data } = await supabase.auth.admin.createUser({
              email: customer.email as string,
            });

            user = data?.user;
            
            // Create user record
            if (user) {
              await supabase
                .from("users")
                .insert({
                  id: user.id,
                  email: customer.email,
                  name: customer.name || "",
                });
            }
          }
        } else {
          // Find user by ID
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();

          user = existingUser;
        }

        if (!user) break;

        // Get subscription details to set current_period_end
        let currentPeriodEnd: string | null = null;
        const subscriptionId = stripeObject.subscription;
        
        if (subscriptionId && typeof subscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        }

        // Update user with subscription details
        await supabase
          .from("users")
          .update({
            stripe_customer_id: customerId,
            price_id: priceId,
            is_subscriber: true,
            subscription_status: "active",
            current_period_end: currentPeriodEnd
          })
          .eq("id", user.id);

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan
        const stripeObject = event.data.object as Stripe.Subscription;
        
        // Update the subscription end date
        const currentPeriodEnd = new Date(stripeObject.current_period_end * 1000).toISOString();
        
        await supabase
          .from("users")
          .update({
            subscription_status: stripeObject.status,
            current_period_end: currentPeriodEnd
          })
          .eq("stripe_customer_id", stripeObject.customer as string);
        
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // Revoke ability to create challenges
        const stripeObject = event.data.object as Stripe.Subscription;

        await supabase
          .from("users")
          .update({ 
            is_subscriber: false,
            subscription_status: "canceled"
          })
          .eq("stripe_customer_id", stripeObject.customer as string);
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (recurring payment for subscription)
        const stripeObject = event.data.object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0]?.price?.id;
        const customerId = stripeObject.customer;

        if (!priceId || !customerId) break;

        // Find user where stripe_customer_id equals the customerId
        const { data: user } = await supabase
          .from("users")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single();

        if (!user) break;

        // Make sure the invoice is for the same plan the user subscribed to
        if (user.price_id !== priceId) break;

        // If there's a subscription, update the current_period_end
        const subscriptionId = stripeObject.subscription;
        if (subscriptionId && typeof subscriptionId === 'string') {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          
          // Update subscription status
          await supabase
            .from("users")
            .update({ 
              is_subscriber: true,
              subscription_status: "active",
              current_period_end: currentPeriodEnd
            })
            .eq("stripe_customer_id", customerId);
        }

        break;
      }

      case "invoice.payment_failed": {
        // A payment failed, mark subscription as past_due
        const stripeObject = event.data.object as Stripe.Invoice;
        
        if (!stripeObject.customer) break;
        
        await supabase
          .from("users")
          .update({ 
            subscription_status: "past_due" 
          })
          .eq("stripe_customer_id", stripeObject.customer as string);
        
        // The subscription will be canceled automatically by Stripe after retries
        // We'll receive a "customer.subscription.deleted" event when that happens
        break;
      }

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error("stripe error: ", e.message);
  }

  return NextResponse.json({});
}
