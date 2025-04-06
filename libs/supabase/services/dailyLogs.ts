import { SupabaseClient } from '@supabase/supabase-js';
import { TABLES, DailyLog, DailyLogInsert } from '../schema';
import { Database } from '@/types';

export class DailyLogService {
  private client: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.client = supabaseClient;
  }

  /**
   * Log a day as completed for a challenge
   */
  async logDay(challengeId: string, userId: string, date: Date): Promise<boolean> {
    // Format the date to ISO string (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
    const { error } = await this.client
      .from(TABLES.DAILY_LOGS)
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        date: formattedDate
      });

    if (error) {
      // If it's a duplicate error (already logged), don't treat as error
      if (error.code === '23505') { // Unique constraint violation
        return true;
      }
      console.error('Error logging day:', error);
      return false;
    }

    return true;
  }

  /**
   * Remove a log for a specific day
   */
  async removeLog(challengeId: string, userId: string, date: Date): Promise<boolean> {
    // Format the date to ISO string (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
    const { error } = await this.client
      .from(TABLES.DAILY_LOGS)
      .delete()
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .eq('date', formattedDate);

    if (error) {
      console.error('Error removing log:', error);
      return false;
    }

    return true;
  }

  /**
   * Get all logs for a user in a challenge
   */
  async getLogsByChallenge(challengeId: string, userId: string): Promise<DailyLog[]> {
    const { data, error } = await this.client
      .from(TABLES.DAILY_LOGS)
      .select('*')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }

    return data;
  }

  /**
   * Check if a specific day is logged
   */
  async isDayLogged(challengeId: string, userId: string, date: Date): Promise<boolean> {
    // Format the date to ISO string (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
    const { data, error } = await this.client
      .from(TABLES.DAILY_LOGS)
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .eq('date', formattedDate)
      .single();

    if (error) {
      // If not found, that means day isn't logged
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking if day is logged:', error);
      return false;
    }

    return !!data;
  }

  /**
   * Get current streak for a user in a challenge
   */
  async getCurrentStreak(challengeId: string, userId: string): Promise<number> {
    // Get all logs for this challenge
    const logs = await this.getLogsByChallenge(challengeId, userId);
    
    if (logs.length === 0) {
      return 0;
    }

    // Sort logs by date (newest first)
    const sortedDates = logs
      .map(log => new Date(log.date))
      .sort((a, b) => b.getTime() - a.getTime());

    // Get today and yesterday dates for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if the most recent log is from today or yesterday
    const mostRecentLogDate = sortedDates[0];
    const mostRecentLogDay = mostRecentLogDate.getDate();
    const mostRecentLogMonth = mostRecentLogDate.getMonth();
    const mostRecentLogYear = mostRecentLogDate.getFullYear();

    const isTodayOrYesterday = 
      (mostRecentLogDay === today.getDate() && 
       mostRecentLogMonth === today.getMonth() && 
       mostRecentLogYear === today.getFullYear()) ||
      (mostRecentLogDay === yesterday.getDate() && 
       mostRecentLogMonth === yesterday.getMonth() && 
       mostRecentLogYear === yesterday.getFullYear());

    // If most recent log is not from today or yesterday, streak is broken
    if (!isTodayOrYesterday) {
      return 0;
    }

    // Count consecutive days backward from most recent log
    let streak = 1;
    let currentDate = mostRecentLogDate;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(currentDate);
      prevDate.setDate(prevDate.getDate() - 1);
      
      const logDate = sortedDates[i];
      
      // Check if this log is from the previous day
      if (
        logDate.getDate() === prevDate.getDate() &&
        logDate.getMonth() === prevDate.getMonth() &&
        logDate.getFullYear() === prevDate.getFullYear()
      ) {
        streak++;
        currentDate = logDate;
      } else {
        // Chain broken
        break;
      }
    }

    return streak;
  }
} 