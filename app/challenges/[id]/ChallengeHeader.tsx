'use client';

import Link from "next/link";
import ShareJoinLink from "@/components/ShareJoinLink";
import JoinChallengeButton from "@/components/JoinChallengeButton";

interface ChallengeHeaderProps {
  challengeId: string;
  title: string;
  creatorName: string;
  isCreator: boolean;
  hasJoined: boolean;
  status: string;
  statusColorClass: string;
}

export default function ChallengeHeader({
  challengeId,
  title,
  creatorName,
  isCreator,
  hasJoined,
  status,
  statusColorClass,
}: ChallengeHeaderProps) {
  return (
    <>
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
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Created by {creatorName} {isCreator ? "(you)" : ""}
              </p>
            </div>
            <div className="flex gap-3">
              <ShareJoinLink challengeId={challengeId} />
              {isCreator && !hasJoined && status === 'active' && (
                <JoinChallengeButton challengeId={challengeId} />
              )}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColorClass}`}
          >
            {status}
          </span>
        </div>
      </div>
    </>
  );
} 