import { SupabaseClient } from '@supabase/supabase-js';
import { TABLES, User, UserInsert, UserUpdate } from '../schema';
import { Database } from '@/types';

export class UserService {
  private client: SupabaseClient<Database>;

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.client = supabaseClient;
  }

  /**
   * Get a user by ID
   */
  async getById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from(TABLES.USERS)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: sessionData, error: sessionError } = await this.client.auth.getSession();

    if (sessionError || !sessionData.session) {
      return null;
    }

    return this.getById(sessionData.session.user.id);
  }

  /**
   * Update a user
   */
  async update(id: string, updates: UserUpdate): Promise<User | null> {
    const { data, error } = await this.client
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }

    return data;
  }

  /**
   * Update subscription status
   */
  async updateSubscription(
    id: string, 
    stripeCustomerId: string, 
    isSubscriber: boolean, 
    subscriptionStatus: string,
    currentPeriodEnd?: string
  ): Promise<User | null> {
    return this.update(id, {
      stripe_customer_id: stripeCustomerId,
      is_subscriber: isSubscriber,
      subscription_status: subscriptionStatus,
      current_period_end: currentPeriodEnd
    });
  }
} 