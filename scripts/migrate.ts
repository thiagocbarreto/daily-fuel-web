#!/usr/bin/env ts-node

/**
 * Database Migration Script
 * 
 * Run with: npm run migrate
 * or npx ts-node scripts/migrate.ts
 * 
 * This runs migrations locally and should never be exposed as an API endpoint.
 */

import dotenv from 'dotenv';
import { runMigrations } from '../libs/supabase/migrate';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Run all migrations
console.log('Running database migrations...');
runMigrations()
  .then(() => {
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }); 