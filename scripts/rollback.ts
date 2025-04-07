#!/usr/bin/env ts-node

/**
 * Database Rollback Script
 * 
 * Run with: npm run rollback
 * or npx ts-node scripts/rollback.ts
 * 
 * This rolls back the last batch of migrations.
 * WARNING: This operation is destructive and cannot be undone!
 */

import dotenv from 'dotenv';
import { rollbackLastBatch } from '../libs/supabase/migrations/tools/rollback';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Print header
console.log('='.repeat(50));
console.log('   DailyFuel Database Rollback Tool');
console.log('='.repeat(50));
console.log('Loading migrations...');

// Run rollback
rollbackLastBatch()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Rollback failed:', error);
    process.exit(1);
  }); 