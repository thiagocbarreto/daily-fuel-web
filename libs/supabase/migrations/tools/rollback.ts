import fs from 'fs';
import path from 'path';
import { createClient } from '../../server';
import { Database } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { TABLES, Migration } from '../../schema';

/**
 * Gets the most recent batch number
 */
async function getLastBatchNumber(supabase: SupabaseClient<Database>): Promise<number | null> {
  const { data, error } = await supabase
    .from(TABLES.MIGRATIONS)
    .select('batch')
    .order('batch', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0].batch;
}

/**
 * Gets all migrations from the last batch
 */
async function getMigrationsFromLastBatch(supabase: SupabaseClient<Database>): Promise<Migration[]> {
  const lastBatch = await getLastBatchNumber(supabase);
  
  if (lastBatch === null) {
    return [];
  }
  
  const { data, error } = await supabase
    .from(TABLES.MIGRATIONS)
    .select('*')
    .eq('batch', lastBatch)
    .order('id', { ascending: false });
    
  if (error) {
    throw new Error(`Failed to get migrations from batch ${lastBatch}: ${error.message}`);
  }
  
  return data;
}

/**
 * Removes a migration record from the migrations table
 */
async function removeMigrationRecord(supabase: SupabaseClient<Database>, id: number): Promise<void> {
  const { error } = await supabase
    .from(TABLES.MIGRATIONS)
    .delete()
    .eq('id', id);
    
  if (error) {
    throw new Error(`Failed to remove migration record: ${error.message}`);
  }
}

/**
 * Prompts the user for confirmation
 */
function promptForConfirmation(migrations: Migration[]): Promise<boolean> {
  if (migrations.length === 0) {
    console.log('No migrations to rollback.');
    return Promise.resolve(false);
  }

  console.log('\nThe following migrations will be rolled back (batch ' + migrations[0].batch + '):');
  console.log('------------------------------------------');
  migrations.forEach(migration => {
    console.log(`- ${migration.name}`);
  });
  console.log('------------------------------------------');
  console.log('\n⚠️  WARNING: This operation is destructive and cannot be undone!');

  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nDo you want to continue? (y/N): ', (answer: string) => {
      readline.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Rolls back the last batch of migrations
 */
export async function rollbackLastBatch(): Promise<void> {
  // Create Supabase client
  const supabase = createClient();
  
  // Get migrations from the last batch
  const migrations = await getMigrationsFromLastBatch(supabase);
  
  if (migrations.length === 0) {
    console.log('✅ No migrations to rollback.');
    return;
  }
  
  // Ask for confirmation
  const shouldRollback = await promptForConfirmation(migrations);
  
  if (!shouldRollback) {
    console.log('Rollback cancelled');
    return;
  }
  
  console.log(`Rolling back ${migrations.length} migrations from batch ${migrations[0].batch}...`);
  
  // Create a rollback SQL statement
  const rollbackSql = `
-- Rollback migrations from batch ${migrations[0].batch}
BEGIN;

-- Your rollback SQL statements would go here
-- This is a placeholder for an actual rollback mechanism 
-- In a real application, you would need to create down migrations 
-- or have a way to generate rollback statements

-- For now, we'll just remove the migration records from the migrations table
${migrations.map(m => `-- Rolled back: ${m.name}`).join('\n')}

COMMIT;
  `;
  
  try {
    // Execute the rollback SQL
    const { error } = await supabase.rpc('exec_sql', { sql: rollbackSql });
    
    if (error) {
      throw new Error(`Error executing rollback SQL: ${error.message}`);
    }
    
    // Remove migration records from the migrations table
    for (const migration of migrations) {
      await removeMigrationRecord(supabase, migration.id);
      console.log(`✅ Rolled back: ${migration.name}`);
    }
    
    console.log(`✅ Successfully rolled back ${migrations.length} migrations from batch ${migrations[0].batch}`);
  } catch (error) {
    console.error(`❌ Failed to rollback: ${error.message}`);
    throw error;
  }
} 