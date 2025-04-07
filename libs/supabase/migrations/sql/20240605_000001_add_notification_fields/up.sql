-- Migration: 20240605_000001_add_notification_fields
-- Description: Add notification settings fields to users table

-- Add notification preferences to users table
ALTER TABLE public.users 
ADD COLUMN notification_email BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN notification_push BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN last_notified_at TIMESTAMPTZ;

-- Create index on last_notified_at for efficient notification queries
CREATE INDEX idx_users_last_notified_at ON public.users(last_notified_at);

-- Update timestamps
UPDATE public.users SET updated_at = NOW(); 