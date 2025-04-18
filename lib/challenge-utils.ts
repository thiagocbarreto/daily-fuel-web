export type ChallengeStatus = 'active' | 'completed' | 'ended';

export function getChallengeStatus(startDate: string, durationDays: number): ChallengeStatus {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + durationDays);

  if (now < start) {
    return 'active';
  } else if (now > end) {
    return 'ended';
  } else {
    return 'active';
  }
}

export function getStatusColor(status: ChallengeStatus) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'ended':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 