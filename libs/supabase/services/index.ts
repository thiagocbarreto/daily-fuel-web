import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types';
import { UserService } from './users';
import { ChallengeService } from './challenges';
import { DailyLogService } from './dailyLogs';

/**
 * Creates service instances for all database operations
 */
export function createServices(supabaseClient: SupabaseClient<Database>) {
  return {
    users: new UserService(supabaseClient),
    challenges: new ChallengeService(supabaseClient),
    dailyLogs: new DailyLogService(supabaseClient),
  };
}

export type DatabaseServices = ReturnType<typeof createServices>;

// Individual service exports
export { UserService } from './users';
export { ChallengeService } from './challenges';
export { DailyLogService } from './dailyLogs'; 