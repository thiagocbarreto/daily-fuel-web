-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create an RPC function to execute SQL (used for migrations)
CREATE OR REPLACE FUNCTION exec_sql(sql TEXT)
RETURNS VOID LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Create migrations tracking table
CREATE TABLE IF NOT EXISTS "migrations" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "batch" INTEGER NOT NULL,
  "migration_time" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "unique_migration_name" UNIQUE ("name")
);

-- Users table
-- This table extends Supabase's auth.users table with additional metadata
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "is_subscriber" BOOLEAN DEFAULT FALSE,
  "stripe_customer_id" TEXT,
  "subscription_status" TEXT,
  "current_period_end" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create a secure RLS policy for the users table
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view and update their own data" 
  ON "users" 
  FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public reads for user profiles (if needed)
CREATE POLICY "User profiles are viewable by everyone" 
  ON "users" 
  FOR SELECT 
  USING (true);

-- Challenges table
CREATE TABLE IF NOT EXISTS "challenges" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "creator_id" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "daily_goal" TEXT NOT NULL,
  "duration_days" INTEGER NOT NULL,
  "start_date" DATE NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  CONSTRAINT "duration_days_positive" CHECK (duration_days > 0)
);

-- Create a secure RLS policy for the challenges table
ALTER TABLE "challenges" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges are viewable by everyone" 
  ON "challenges" 
  FOR SELECT 
  USING (true);
CREATE POLICY "Users can create challenges if they are subscribers" 
  ON "challenges" 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = creator_id AND 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_subscriber = true)
  );
CREATE POLICY "Users can update their own challenges" 
  ON "challenges" 
  FOR UPDATE 
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own challenges" 
  ON "challenges" 
  FOR DELETE 
  USING (auth.uid() = creator_id);

-- Challenge participants table (for users who join challenges)
CREATE TABLE IF NOT EXISTS "challenge_participants" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "challenge_id" UUID NOT NULL REFERENCES "challenges"(id) ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "joined_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Ensure a user can only join a challenge once
  CONSTRAINT "unique_challenge_participant" UNIQUE ("challenge_id", "user_id")
);

-- Create a secure RLS policy for the challenge_participants table
ALTER TABLE "challenge_participants" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see who has joined challenges" 
  ON "challenge_participants" 
  FOR SELECT 
  USING (true);
CREATE POLICY "Users can join challenges" 
  ON "challenge_participants" 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave challenges they've joined" 
  ON "challenge_participants" 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Daily logs table (for tracking daily challenge completions)
CREATE TABLE IF NOT EXISTS "daily_logs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "challenge_id" UUID NOT NULL REFERENCES "challenges"(id) ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "date" DATE NOT NULL,
  
  -- Ensure a user can only log once per day per challenge
  CONSTRAINT "unique_daily_log" UNIQUE ("challenge_id", "user_id", "date")
);

-- Create a secure RLS policy for the daily_logs table
ALTER TABLE "daily_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own logs" 
  ON "daily_logs" 
  FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can log their daily progress" 
  ON "daily_logs" 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" 
  ON "daily_logs" 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" 
  ON "daily_logs" 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_challenges_creator_id" ON "challenges" ("creator_id");
CREATE INDEX IF NOT EXISTS "idx_challenge_participants_challenge_id" ON "challenge_participants" ("challenge_id");
CREATE INDEX IF NOT EXISTS "idx_challenge_participants_user_id" ON "challenge_participants" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_daily_logs_challenge_id" ON "daily_logs" ("challenge_id");
CREATE INDEX IF NOT EXISTS "idx_daily_logs_user_id" ON "daily_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_daily_logs_date" ON "daily_logs" ("date");

-- Create a function to automatically create a user record when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (new.id, new.email, new.created_at);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function whenever a user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 