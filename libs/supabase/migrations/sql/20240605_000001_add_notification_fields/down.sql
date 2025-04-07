-- Rollback Migration: 20240605_000001_add_notification_fields
-- Description: Remove notification settings fields from users table

-- Drop the index first
DROP INDEX IF EXISTS public.idx_users_last_notified_at;

-- Remove columns from users table
ALTER TABLE public.users
DROP COLUMN IF EXISTS notification_email,
DROP COLUMN IF EXISTS notification_push,
DROP COLUMN IF EXISTS last_notified_at;

-- Update timestamps
UPDATE public.users SET updated_at = NOW(); 