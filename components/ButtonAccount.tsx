/* eslint-disable @next/next/no-img-element */
"use server";

import { createClient } from "@/libs/supabase/server";
import ButtonAccountInner from "./ButtonAccountInner";

const handleSignOut = async () => {
  "use server";
  
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = "/";
};

// A button to show user some account actions
//  1. Billing: open a Stripe Customer Portal to manage their billing (cancel subscription, update payment method, etc.).
//     You have to manually activate the Customer Portal in your Stripe Dashboard (https://dashboard.stripe.com/test/settings/billing/portal)
//     This is only available if the customer has a customerId (they made a purchase previously)
//  2. Logout: sign out and go back to homepage
// See more at https://shipfa.st/docs/components/buttonAccount
const ButtonAccount = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <ButtonAccountInner
    user={user}
    handleSignOut={handleSignOut}
  />;
};

export default ButtonAccount;
