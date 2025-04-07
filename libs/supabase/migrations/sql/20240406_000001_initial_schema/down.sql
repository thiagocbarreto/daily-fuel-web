-- Rollback migration: 20240406_000001_initial_schema

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop indexes
DROP INDEX IF EXISTS "idx_challenges_creator_id";
DROP INDEX IF EXISTS "idx_challenge_participants_challenge_id";
DROP INDEX IF EXISTS "idx_challenge_participants_user_id";
DROP INDEX IF EXISTS "idx_daily_logs_challenge_id";
DROP INDEX IF EXISTS "idx_daily_logs_user_id";
DROP INDEX IF EXISTS "idx_daily_logs_date";

-- Drop tables (in reverse order of creation to handle dependencies)
DROP TABLE IF EXISTS "daily_logs";
DROP TABLE IF EXISTS "challenge_participants";
DROP TABLE IF EXISTS "challenges";
DROP TABLE IF EXISTS "users";
DROP TABLE IF EXISTS "migrations";

-- Drop the exec_sql function
DROP FUNCTION IF EXISTS exec_sql(TEXT);

-- Drop extensions
-- We'll leave the uuid-ossp extension as it might be used by other parts of the system 