import { Database } from '@/types';

export type Tables = Database['public']['Tables'];
export type Row<T extends keyof Tables> = Tables[T]['Row'];
export type InsertRow<T extends keyof Tables> = Tables[T]['Insert'];
export type UpdateRow<T extends keyof Tables> = Tables[T]['Update'];

export const TABLES = {
  USERS: 'users',
  CHALLENGES: 'challenges',
  CHALLENGE_PARTICIPANTS: 'challenge_participants',
  DAILY_LOGS: 'daily_logs',
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];

// User-related types
export type User = Row<'users'>;
export type UserInsert = InsertRow<'users'>;
export type UserUpdate = UpdateRow<'users'>;

// Challenge-related types
export type Challenge = Row<'challenges'>;
export type ChallengeInsert = InsertRow<'challenges'>;
export type ChallengeUpdate = UpdateRow<'challenges'>;

// Challenge participant-related types
export type ChallengeParticipant = Row<'challenge_participants'>;
export type ChallengeParticipantInsert = InsertRow<'challenge_participants'>;
export type ChallengeParticipantUpdate = UpdateRow<'challenge_participants'>;

// Daily log-related types
export type DailyLog = Row<'daily_logs'>;
export type DailyLogInsert = InsertRow<'daily_logs'>;
export type DailyLogUpdate = UpdateRow<'daily_logs'>; 