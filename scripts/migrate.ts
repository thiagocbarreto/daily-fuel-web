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

// Print header
console.log('='.repeat(50));
console.log('   DailyFuel Database Migration Tool');
console.log('='.repeat(50));
console.log('Loading migrations...');

// Run all migrations
runMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }); 