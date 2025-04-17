import ButtonAccount from "@/components/ButtonAccount";
import CreateChallengeDialog from "@/components/CreateChallengeDialog";
import { createClient } from "@/libs/supabase/server";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: user } = await supabase
    .from("users")
    .select("is_subscriber")
    .eq("id", session?.user?.id)
    .single();

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Challenges</h1>
          <CreateChallengeDialog isSubscriber={user?.is_subscriber ?? false} />
        </div>
      </section>
    </main>
  );
}
