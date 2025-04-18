'use client';

import { formatDate } from "@/lib/utils";
import { getChallengeStatus, getStatusColor, type ChallengeStatus } from "@/lib/challenge-utils";

interface ChallengeCardProps {
  title: string;
  startDate: string;
  durationDays: number;
  challengersCount: number;
  status: ChallengeStatus;
  statusColorClass: string;
}

export default function ChallengeCard({
  title,
  startDate,
  durationDays,
  challengersCount,
  status,
  statusColorClass,
}: ChallengeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColorClass}`}>
          {status}
        </span>
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
        <div className="flex items-center text-sm text-gray-500">
          <span className="font-medium">Challengers:</span>
          <span className="ml-2">{challengersCount}</span>
        </div>
      </div>
    </div>
  );
} 