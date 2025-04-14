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
  // Validate request method
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  }

  // Validate Stripe webhook secret exists
  if (!webhookSecret) {
    console.error('Missing Stripe webhook secret');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = headers().get("stripe-signature");

  // Validate signature exists
  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    );
  }

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
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created
        // Grant subscriber status to create challenges
        const stripeObject = event.data.object as Stripe.Checkout.Session;

        // Validate required fields
        if (!stripeObject.id) {
          console.error('Missing session ID');
          return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 });
        }

        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        
        // Validate critical data
        if (!customerId || !priceId) {
          console.error('Missing customerId or priceId');
          break;
        }
        
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);
        if (!plan) {
          console.error('Unknown price ID');
          break;
        }

        // Retrieve customer details with error handling
        let customer;
        try {
          const customerResponse = await stripe.customers.retrieve(customerId as string);
          if (customerResponse.deleted) {
            console.error('Customer was deleted');
            break;
          }
          
          // Cast to Customer type (now that we've verified it's not deleted)
          customer = customerResponse as Stripe.Customer;
        } catch (error) {
          console.error('Error retrieving customer:', error.message);
          break;
        }
        
        // Validate customer email
        if (!customer.email) {
          console.error('Customer has no email');
          break;
        }

        let user;
        if (!userId) {
          // Check if user already exists by email
          const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", customer.email)
            .single();
          
          if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error finding user by email:', userError);
            break;
          }
          
          if (existingUser) {
            user = existingUser;
          } else {
            // Create a new user using supabase auth admin
            try {
              const { data, error } = await supabase.auth.admin.createUser({
                email: customer.email as string,
              });
              
              if (error) {
                console.error('Error creating user:', error);
                break;
              }

              user = data?.user;
              
              // Create user record
              if (user) {
                const { error: insertError } = await supabase
                  .from("users")
                  .insert({
                    id: user.id,
                    email: customer.email,
                    name: customer.name || "",
                  });
                  
                if (insertError) {
                  console.error('Error inserting user record:', insertError);
                  break;
                }
              }
            } catch (error) {
              console.error('Error in user creation flow:', error.message);
              break;
            }
          }
        } else {
          // Find user by ID
          const { data: existingUser, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", userId)
            .single();
            
          if (userError) {
            console.error('Error finding user by ID:', userError);
            break;
          }

          user = existingUser;
        }

        if (!user) {
          console.error('No user found or created');
          break;
        }

        // Get subscription details to set current_period_end
        let currentPeriodEnd: string | null = null;
        const subscriptionId = stripeObject.subscription;
        
        if (subscriptionId && typeof subscriptionId === 'string') {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
          } catch (error) {
            console.error('Error retrieving subscription:', error.message);
            // Continue with null currentPeriodEnd
          }
        }

        // Update user with subscription details
        const { error: updateError } = await supabase
          .from("users")
          .update({
            stripe_customer_id: customerId,
            price_id: priceId,
            is_subscriber: true,
            subscription_status: "active",
            current_period_end: currentPeriodEnd
          })
          .eq("id", user.id);
          
        if (updateError) {
          console.error('Error updating user subscription status:', updateError);
        }

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan
        const stripeObject = event.data.object as Stripe.Subscription;
        
        // Validate customer ID
        if (!stripeObject.customer) {
          console.error('Missing customer ID in subscription update');
          break;
        }
        
        // Update the subscription end date
        const currentPeriodEnd = new Date(stripeObject.current_period_end * 1000).toISOString();
        
        const { error: updateError } = await supabase
          .from("users")
          .update({
            subscription_status: stripeObject.status,
            current_period_end: currentPeriodEnd
          })
          .eq("stripe_customer_id", stripeObject.customer as string);
          
        if (updateError) {
          console.error('Error updating subscription status:', updateError);
        }
        
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // Revoke ability to create challenges
        const stripeObject = event.data.object as Stripe.Subscription;

        // Validate customer ID
        if (!stripeObject.customer) {
          console.error('Missing customer ID in subscription deletion');
          break;
        }

        const { error: updateError } = await supabase
          .from("users")
          .update({ 
            is_subscriber: false,
            subscription_status: "canceled"
          })
          .eq("stripe_customer_id", stripeObject.customer as string);
          
        if (updateError) {
          console.error('Error updating subscription status to canceled:', updateError);
        }
        
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (recurring payment for subscription)
        const stripeObject = event.data.object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0]?.price?.id;
        const customerId = stripeObject.customer;

        if (!priceId || !customerId) {
          console.error('Missing priceId or customerId in paid invoice');
          break;
        }

        // Find user where stripe_customer_id equals the customerId
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("stripe_customer_id", customerId)
          .single();

        if (userError) {
          console.error('Error finding user for paid invoice:', userError);
          break;
        }

        if (!user) {
          console.error('No user found for customer:', customerId);
          break;
        }

        // Make sure the invoice is for the same plan the user subscribed to
        if (user.price_id !== priceId) {
          console.error(`Price ID mismatch: user ${user.price_id} vs invoice ${priceId}`);
          break;
        }

        // If there's a subscription, update the current_period_end
        const subscriptionId = stripeObject.subscription;
        if (subscriptionId && typeof subscriptionId === 'string') {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
            
            // Update subscription status
            const { error: updateError } = await supabase
              .from("users")
              .update({ 
                is_subscriber: true,
                subscription_status: "active",
                current_period_end: currentPeriodEnd
              })
              .eq("stripe_customer_id", customerId);
              
            if (updateError) {
              console.error('Error updating user after invoice payment:', updateError);
            }
          } catch (error) {
            console.error('Error retrieving subscription details:', error.message);
          }
        }

        break;
      }

      case "invoice.payment_failed": {
        // A payment failed, mark subscription as past_due
        const stripeObject = event.data.object as Stripe.Invoice;
        
        if (!stripeObject.customer) {
          console.error('Missing customer ID in failed invoice');
          break;
        }
        
        const { error: updateError } = await supabase
          .from("users")
          .update({ 
            subscription_status: "past_due" 
          })
          .eq("stripe_customer_id", stripeObject.customer as string);
          
        if (updateError) {
          console.error('Error updating subscription status to past_due:', updateError);
        }
        
        // The subscription will be canceled automatically by Stripe after retries
        // We'll receive a "customer.subscription.deleted" event when that happens
        break;
      }

      default:
        // Unhandled event type
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (e) {
    console.error("Stripe webhook error:", e.message);
    return NextResponse.json(
      { error: 'Internal server error processing webhook' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
