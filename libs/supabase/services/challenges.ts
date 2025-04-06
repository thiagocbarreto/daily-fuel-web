import { SupabaseClient } from '@supabase/supabase-js';
import { TABLES, Challenge, ChallengeInsert, ChallengeUpdate } from '../schema';
import { Database } from '@/types';

export class ChallengeService {
  private client: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.client = supabaseClient;
  }

  /**
   * Get a challenge by ID
   */
  async getById(id: string): Promise<Challenge | null> {
    const { data, error } = await this.client
      .from(TABLES.CHALLENGES)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching challenge:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all challenges created by a user
   */
  async getByCreator(creatorId: string): Promise<Challenge[]> {
    const { data, error } = await this.client
      .from(TABLES.CHALLENGES)
      .select('*')
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching challenges by creator:', error);
      return [];
    }

    return data;
  }

  /**
   * Get all challenges a user has joined
   */
  async getJoinedByUser(userId: string): Promise<Challenge[]> {
    const { data, error } = await this.client
      .from(TABLES.CHALLENGE_PARTICIPANTS)
      .select(`
        challenge_id,
        challenge:${TABLES.CHALLENGES}(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching joined challenges:', error);
      return [];
    }

    // Extract the challenge objects from the results
    return data.map(item => item.challenge as Challenge);
  }

  /**
   * Create a new challenge
   */
  async create(challenge: ChallengeInsert): Promise<Challenge | null> {
    const { data, error } = await this.client
      .from(TABLES.CHALLENGES)
      .insert(challenge)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating challenge:', error);
      return null;
    }

    return data;
  }

  /**
   * Update a challenge
   */
  async update(id: string, updates: ChallengeUpdate): Promise<Challenge | null> {
    const { data, error } = await this.client
      .from(TABLES.CHALLENGES)
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating challenge:', error);
      return null;
    }

    return data;
  }

  /**
   * Delete a challenge
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from(TABLES.CHALLENGES)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting challenge:', error);
      return false;
    }

    return true;
  }

  /**
   * Join a challenge
   */
  async join(challengeId: string, userId: string): Promise<boolean> {
    const { error } = await this.client
      .from(TABLES.CHALLENGE_PARTICIPANTS)
      .insert({
        challenge_id: challengeId,
        user_id: userId
      });

    if (error) {
      // If it's a duplicate error (already joined), don't treat as error
      if (error.code === '23505') { // Unique constraint violation
        return true;
      }
      console.error('Error joining challenge:', error);
      return false;
    }

    return true;
  }

  /**
   * Leave a challenge
   */
  async leave(challengeId: string, userId: string): Promise<boolean> {
    const { error } = await this.client
      .from(TABLES.CHALLENGE_PARTICIPANTS)
      .delete()
      .eq('challenge_id', challengeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error leaving challenge:', error);
      return false;
    }

    return true;
  }

  /**
   * Check if a user has joined a challenge
   */
  async hasJoined(challengeId: string, userId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from(TABLES.CHALLENGE_PARTICIPANTS)
      .select('id')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      // If not found, that means user hasn't joined
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking if user joined challenge:', error);
      return false;
    }

    return !!data;
  }
} 