'use server'

import { getChallengeStatus, getStatusColor } from "@/lib/challenge-utils";
import { createClient } from "@/libs/supabase/server";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import config from "@/config";
import SubmitButton from "./SubmitButton";

export default async function ChallengeJoinPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch minimal challenge details
  const { data: challenge } = await supabase
    .from("challenges")
    .select(`
      id,
      creator_id,
      title,
      description,
      start_date,
      duration_days
    `)
    .eq("id", params.id)
    .single();

  if (!challenge) {
    notFound();
  }

  // Fetch participant count
  const { data: participantCount } = await supabase
    .from("challenge_participants")
    .select("count")
    .eq("challenge_id", params.id)
    .single();

  // Check if authenticated user is already a participant
  const { data: challengeWithUserParticipant } = await supabase
    .from("challenges")
    .select(`
      challenge_participants!inner(user_id)
    `)
    .eq("id", params.id)
    .eq("challenge_participants.user_id", user?.id)
    .single();

  const status = getChallengeStatus(challenge.start_date, challenge.duration_days);
  const statusColorClass = getStatusColor(status);

  console.log("Challenge status:", status);

  // If user is authenticated, check if they're already a participant
  const isParticipant = challengeWithUserParticipant?.challenge_participants.some(
    (p: any) => p.user_id === user?.id
  );

  // Format dates
  const startDate = new Date(challenge.start_date);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + challenge.duration_days);
  const formattedStartDate = format(startDate, "MMMM d, yyyy");

  async function handleJoinAction() {
    "use server";
    
    const supabase = createClient();
    
    // If not authenticated, redirect to sign in
    if (!user?.id) {
      // Store the return URL in the URL parameters
      const returnUrl = `/challenges/${challenge.id}/join`;
      redirect(`${config.auth.loginUrl}?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  
    // Insert participant record and redirect to challenge page
    if (!isParticipant) {
      await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challenge.id,
        user_id: user?.id,
      });
      redirect(`/challenges/${challenge.id}`);
    }
  
    redirect(`/challenges/${challenge.id}`);
  }

  return (
    <main className="min-h-screen p-8 flex flex-col bg-gray-50">
      <div className="flex-1">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{challenge.title}</h1>
                {/* <p className="text-sm text-gray-500 mt-1">
                  Created by {challenge.creator.name} {isCreator ? "(you)" : ""}
                </p> */}
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

              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Start Date:</span>
                  <span className="ml-2">{formattedStartDate}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Duration:</span>
                  <span className="ml-2">{challenge.duration_days} days</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Current Participants:</span>
                  <span className="ml-2">{participantCount?.count ?? 0}</span>
                </div>
              </div>

              <form action={handleJoinAction}>
                <SubmitButton 
                  isParticipant={isParticipant}
                  status={status}
                  isAuthenticated={!!user}
                />
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="pt-8 pb-4">
        <div className="text-center text-sm text-gray-500">
          <a 
            href="/"
            className="hover:text-gray-700 transition-colors inline-flex items-center gap-1"
          >
            Made in{" "}
            <span className="font-semibold">
              DailyFuel
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3 h-3"
            >
              <path
                fillRule="evenodd"
                d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                clipRule="evenodd"
              />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
} 