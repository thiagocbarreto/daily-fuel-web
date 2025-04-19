'use client';

import { useFormStatus } from 'react-dom';

interface SubmitButtonProps {
  isParticipant: boolean;
  status: string;
  isAuthenticated: boolean;
}

export default function SubmitButton({ isParticipant, status, isAuthenticated }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={status !== 'active' || pending}
      className={`w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
        status === 'active' && !pending
          ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          : 'bg-gray-400 cursor-not-allowed'
      }`}
    >
      {pending ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {isParticipant ? "Redirecting..." : "Joining..."}
        </div>
      ) : isAuthenticated ? (
        isParticipant
          ? "Go to Challenge"
          : status === 'active'
            ? "Join Challenge"
            : status === 'ended'
              ? "Challenge Ended"
              : "Challenge Not Started Yet"
      ) : (
        "Sign in to Join"
      )}
    </button>
  );
} 