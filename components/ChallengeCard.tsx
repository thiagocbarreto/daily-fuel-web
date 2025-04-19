'use client';

import { formatDate } from "@/lib/utils";
import { type ChallengeStatus } from "@/lib/challenge-utils";
import Link from "next/link";
import { useState, type MouseEvent } from "react";

interface ChallengeCardProps {
  id: string;
  title: string;
  startDate: string;
  durationDays: number;
  challengersCount?: number;
  status: ChallengeStatus;
  statusColorClass: string;
  isOwned?: boolean;
}

export default function ChallengeCard({
  id,
  title,
  startDate,
  durationDays,
  challengersCount,
  status,
  statusColorClass,
  isOwned = false,
}: ChallengeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: MouseEvent) => {
    e.preventDefault(); // Prevent the Link navigation
    try {
      const joinUrl = `${window.location.origin}/challenges/${id}/join`;
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  return (
    <Link href={`/challenges/${id}`}>
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            {isOwned && (
              <button
                onClick={handleShare}
                className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                title="Share invite link"
              >
                {copied ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                )}
              </button>
            )}
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColorClass}`}>
              {status}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">Start Date:</span>
            <span className="ml-2">{formatDate(startDate)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium">Duration:</span>
            <span className="ml-2">{durationDays} days</span>
          </div>
          {typeof challengersCount === 'number' && (
            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium">Challengers:</span>
              <span className="ml-2">{challengersCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
} 