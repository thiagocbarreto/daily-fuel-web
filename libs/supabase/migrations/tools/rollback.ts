import { createClient } from '../../server';
import { Database } from '@/types';
import { TABLES } from '../../schema';
import fs from 'fs';
import path from 'path';
import { SupabaseClient } from '@supabase/supabase-js';
import { rollbackMigration } from '../../migrate';

interface Migration {
  id: number;
  name: string;
  batch: number;
  migration_time: string;
  folderPath: string;
  upFilePath: string;
  downFilePath: string;
  timestamp?: Date;
}

/**
 * Get all migrations from the last batch
 */
async function getMigrationsFromLastBatch(supabase: SupabaseClient<Database>): Promise<Migration[]> {
  try {
    // First, get the last batch number
    const { data: batchData, error: batchError } = await supabase
      .from(TABLES.MIGRATIONS)
      .select('batch')
      .order('batch', { ascending: false })
      .limit(1);

    if (batchError || !batchData || batchData.length === 0) {
      console.log('No migrations found');
      return [];
    }

    const lastBatch = batchData[0].batch;

    // Then, get all migrations from that batch
    const { data, error } = await supabase
      .from(TABLES.MIGRATIONS)
      .select('*')
      .eq('batch', lastBatch)
      .order('id', { ascending: false }); // Reverse order for rollback

    if (error || !data) {
      console.error('Error fetching migrations:', error);
      return [];
    }

    const migrationsDir = path.join(process.cwd(), 'libs', 'supabase', 'migrations', 'sql');

    return data.map(row => {
      const folderPath = path.join(migrationsDir, row.name);
      const upFilePath = path.join(folderPath, 'up.sql');
      const downFilePath = path.join(folderPath, 'down.sql');

      return {
        ...row,
        folderPath,
        upFilePath,
        downFilePath
      };
    });
  } catch (error) {
    console.error('Error getting last batch migrations:', error);
    return [];
  }
}

/**
 * Deletes a migration record from the database
 */
async function deleteMigrationRecord(supabase: SupabaseClient<Database>, migrationId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from(TABLES.MIGRATIONS)
      .delete()
      .eq('id', migrationId);

    if (error) {
      throw new Error(`Failed to delete migration record: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting migration record:', error);
    throw error;
  }
}

/**
 * Prompts the user for confirmation
 */
function promptForConfirmation(migrations: Migration[]): Promise<boolean> {
  if (migrations.length === 0) {
    console.log('No migrations to roll back.');
    return Promise.resolve(false);
  }

  const batchNumber = migrations[0].batch;

  console.log(`\nRolling back batch #${batchNumber} (${migrations.length} migrations):`);
  console.log('----------------------------------------------------');
  migrations.forEach(migration => {
    console.log(`- ${migration.name}`);
  });
  console.log('----------------------------------------------------');

  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\nAre you sure you want to roll back these migrations? This action cannot be undone. (y/N): ', (answer: string) => {
      readline.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Main rollback function
 */
export async function rollbackLastBatch(): Promise<void> {
  const supabase = createClient();

  // Get migrations from last batch
  const migrations = await getMigrationsFromLastBatch(supabase);

  if (migrations.length === 0) {
    console.log('No migrations to roll back.');
    return;
  }

  // Confirm rollback
  const confirmed = await promptForConfirmation(migrations);

  if (!confirmed) {
    console.log('Rollback cancelled.');
    return;
  }

  console.log('\nRolling back migrations...');

  // Execute rollbacks
  for (const migration of migrations) {
    try {
      // Verify down.sql file exists
      if (!fs.existsSync(migration.downFilePath)) {
        throw new Error(`Down SQL file not found: ${migration.downFilePath}`);
      }

      // Roll back the migration
      await rollbackMigration(supabase, {
        ...migration,
        timestamp: new Date(migration.migration_time)
      });

      // Delete the migration record
      await deleteMigrationRecord(supabase, migration.id);
      
      console.log(`✅ Migration ${migration.name} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Failed to roll back migration ${migration.name}:`, error);
      console.error('Rollback process aborted. Database may be in an inconsistent state.');
      process.exit(1);
    }
  }

  const batchNumber = migrations[0].batch;
  console.log(`\n✅ Successfully rolled back batch #${batchNumber} (${migrations.length} migrations)`);
} 