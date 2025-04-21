import { getChallengeStatus, getStatusColor } from "@/lib/challenge-utils";
import { createClient } from "@/libs/supabase/server";
import { notFound, redirect } from "next/navigation";
import { addMinutes, format } from "date-fns";
import Link from "next/link";
import config from "@/config";
import ShareJoinLink from "@/components/ShareJoinLink";
import UserProgressCalendar from "@/components/UserProgressCalendar";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface DailyLog {
  id: string;
  user_id: string;
  challenge_id: string;
  date: string;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Participant {
  user: User;
}

export default async function ChallengePage({
  params,
}: {
  params: { id: string };
}) {
      
  const tzOffset = Number(cookies().get('tzOffset')?.value || '0');
  console.log('------> tzOffset', tzOffset);
  
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(config.auth.loginUrl);
  }

  // Fetch challenge details
  const { data: challenge } = await supabase
    .from("challenges")
    .select(`
      *,
      creator:users!challenges_creator_id_fkey(name)
    `)
    .eq("id", params.id)
    .single();

  if (!challenge) {
    notFound();
  }

  // Fetch participants with user details
  const { data: participants } = await supabase
    .from("challenge_participants")
    .select(`
      user:users (
        id,
        name,
        email
      )
    `)
    .eq("challenge_id", params.id) as { data: Participant[] };

  // Fetch all daily logs for this challenge
  const { data: dailyLogs } = await supabase
    .from("daily_logs")
    .select(`
      id,
      date,
      user_id,
      created_at
    `)
    .eq("challenge_id", params.id)
    .order('date', { ascending: true });

  // Fetch participant count
  const { data: participantCount } = await supabase
    .from("challenge_participants")
    .select("count")
    .eq("challenge_id", params.id)
    .single();

  const status = getChallengeStatus(challenge.start_date, challenge.duration_days);
  const statusColorClass = getStatusColor(status);
  
  // Calculate end date
  let startDate = new Date(challenge.start_date);
  console.log('------> startDate raw', startDate);
  let endDate = new Date(startDate);
  startDate = addMinutes(startDate, tzOffset);
  endDate.setDate(endDate.getDate() + challenge.duration_days - 1);
  endDate = addMinutes(endDate, tzOffset);

  console.log('------> startDate', startDate);

  // Format dates with day of the week
  const formattedStartDate = format(startDate, "EEEE, MMMM d, yyyy");
  const formattedEndDate = format(endDate, "EEEE, MMMM d, yyyy");

  // Check if current user is the creator
  const isCreator = challenge.creator_id === session.user.id;

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
            <div className="space-y-3">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Created by {challenge.creator.name} {isCreator ? "(you)" : ""}
                </p>
              </div>
              <ShareJoinLink challengeId={params.id} />
            </div>
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
                    {participantCount?.count ?? 0} participant{participantCount?.count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-xl font-semibold mb-6">Progress</h2>
          <div className="grid gap-6">
            {participants && participants.length > 0 ? (
              participants.map((participant) => {
                // Filter logs for this participant
                const userLogs = dailyLogs?.filter(
                  log => log.user_id === participant.user.id
                ) || [];

                return (
                  <UserProgressCalendar
                    key={participant.user.id}
                    startDate={startDate}
                    durationDays={challenge.duration_days}
                    dailyLogs={userLogs}
                    userName={participant.user.name}
                    authUserId={participant.user.id === session.user.id ? participant.user.id : undefined}
                    challengeId={params.id}
                    tzOffset={tzOffset}
                  />
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No participants yet</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 