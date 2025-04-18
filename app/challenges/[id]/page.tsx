import { getChallengeStatus, getStatusColor } from "@/lib/challenge-utils";
import { createClient } from "@/libs/supabase/server";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import config from "@/config";

export const dynamic = "force-dynamic";

export default async function ChallengePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  // Fetch challenge details
  const { data: challenge } = await supabase
    .from("challenges")
    .select(`
      *,
      challenge_participants: challenge_participants(count)
    `)
    .eq("id", params.id)
    .single();

  if (!challenge) {
    notFound();
  }

  const status = getChallengeStatus(challenge.start_date, challenge.duration_days);
  const statusColorClass = getStatusColor(status);
  
  // Calculate end date
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + challenge.duration_days);

  // Format dates with day of the week
  const formattedStartDate = format(startDate, "EEEE, MMMM d, yyyy");
  const formattedEndDate = format(endDate, "EEEE, MMMM d, yyyy");

  return (
    <main className="min-h-screen p-8 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColorClass}`}
            >
              {status}
            </span>
          </div>

          <div className="space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">{challenge.description}</p>
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                  <p className="text-base text-gray-900">{formattedStartDate}</p>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                  <p className="text-base text-gray-900">{formattedEndDate}</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="text-base text-gray-900">{challenge.duration_days} days</p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Challengers</h3>
                  <p className="text-base text-gray-900">
                    {challenge.challenge_participants[0]?.count ?? 0} participants
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 