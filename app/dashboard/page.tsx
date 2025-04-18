import { getChallengeStatus, getStatusColor } from "@/lib/challenge-utils";
import ButtonAccount from "@/components/ButtonAccount";
import CreateChallengeDialog from "@/components/CreateChallengeDialog";
import ChallengeCard from "@/components/ChallengeCard";
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

  // Fetch challenges created by the user
  const { data: challenges } = await supabase
    .from("challenges")
    .select(`
      *,
      challenge_participants: challenge_participants(count)
    `)
    .eq("creator_id", session?.user?.id)
    .order("start_date", { ascending: false });

  // Sort challenges by status: active first, then upcoming, then ended
  const sortedChallenges = (challenges || []).sort((a, b) => {
    const aStatus = getChallengeStatus(a.start_date, a.duration_days);
    const bStatus = getChallengeStatus(b.start_date, b.duration_days);
    
    if (aStatus === 'active' && bStatus !== 'active') return -1;
    if (bStatus === 'active' && aStatus !== 'active') return 1;
    
    // If both are active or both are not active, sort by start date
    return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
  });

  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-xl mx-auto space-y-8">
        <ButtonAccount />
        <div className="flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold">Challenges</h1>
          <CreateChallengeDialog isSubscriber={user?.is_subscriber ?? false} />
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Created by me</h2>
          {sortedChallenges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              You haven&apos;t created any challenges yet. Create your first challenge to get started!
            </p>
          ) : (
            <div className="grid gap-4">
              {sortedChallenges.map((challenge) => {
                const status = getChallengeStatus(challenge.start_date, challenge.duration_days);
                const statusColorClass = getStatusColor(status);

                return (
                  <ChallengeCard
                    key={challenge.id}
                    title={challenge.title}
                    startDate={challenge.start_date}
                    durationDays={challenge.duration_days}
                    challengersCount={challenge.challenge_participants[0]?.count ?? 0}
                    status={status}
                    statusColorClass={statusColorClass}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
