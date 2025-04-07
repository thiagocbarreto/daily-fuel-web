import fs from 'fs';
import path from 'path';
import { createClient } from './server';
import { Database } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { TABLES, MigrationInsert } from './schema';

interface Migration {
  name: string;
  filePath: string;
  timestamp: Date;
  batch?: number;
  executed?: boolean;
}

/**
 * Gets a list of all migrations from the filesystem
 */
function getMigrationFiles(): Migration[] {
  const migrationsDir = path.join(process.cwd(), 'libs', 'supabase', 'migrations', 'sql');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure sequential order by filename

  return migrationFiles.map(fileName => {
    // Parse timestamp from filename (format: YYYYMMDD_HHMMSS_name.sql)
    const timestampStr = fileName.split('_')[0];
    const year = parseInt(timestampStr.substring(0, 4));
    const month = parseInt(timestampStr.substring(4, 6)) - 1; // JS months are 0-indexed
    const day = parseInt(timestampStr.substring(6, 8));
    
    return {
      name: fileName.replace('.sql', ''),
      filePath: path.join(migrationsDir, fileName),
      timestamp: new Date(year, month, day),
    };
  });
}

/**
 * Check if the migrations table exists
 */
async function checkMigrationsTableExists(supabase: SupabaseClient<Database>): Promise<boolean> {
  try {
    // Try to select from the migrations table - if it doesn't exist, it will throw an error
    const { error } = await supabase
      .from(TABLES.MIGRATIONS)
      .select('id')
      .limit(1);
    
    // If there's no error, the table exists
    return !error;
  } catch (error) {
    // Table doesn't exist or other error
    return false;
  }
}

/**
 * Gets all previously executed migrations from the database
 */
async function getExecutedMigrations(supabase: SupabaseClient<Database>): Promise<Migration[]> {
  try {
    // Check if the migrations table exists
    const tableExists = await checkMigrationsTableExists(supabase);
    
    if (!tableExists) {
      return [];
    }

    // Get executed migrations
    const { data, error } = await supabase
      .from(TABLES.MIGRATIONS)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching executed migrations:', error);
      return [];
    }

    return data.map(row => ({
      name: row.name,
      filePath: '', // Not needed for executed migrations
      timestamp: new Date(row.migration_time),
      batch: row.batch,
      executed: true
    }));
  } catch (error) {
    console.error('Error checking migrations:', error);
    return [];
  }
}

/**
 * Determines which migrations need to be executed
 */
function getPendingMigrations(fileMigrations: Migration[], executedMigrations: Migration[]): Migration[] {
  const executedNames = new Set(executedMigrations.map(m => m.name));
  return fileMigrations.filter(migration => !executedNames.has(migration.name));
}

/**
 * Gets the next batch number (max batch + 1)
 */
function getNextBatchNumber(executedMigrations: Migration[]): number {
  if (executedMigrations.length === 0) {
    return 1;
  }
  const maxBatch = Math.max(...executedMigrations.map(m => m.batch || 0));
  return maxBatch + 1;
}

/**
 * Records a successful migration in the migrations table
 */
async function recordMigration(
  supabase: SupabaseClient<Database>, 
  migrationName: string, 
  batchNumber: number
): Promise<void> {
  const migrationData: MigrationInsert = {
    name: migrationName,
    batch: batchNumber
  };

  const { error } = await supabase
    .from(TABLES.MIGRATIONS)
    .insert(migrationData);

  if (error) {
    throw new Error(`Failed to record migration ${migrationName}: ${error.message}`);
  }
}

/**
 * Executes a single migration file
 */
async function executeMigration(
  supabase: SupabaseClient<Database>, 
  migration: Migration, 
  batchNumber: number
): Promise<void> {
  try {
    console.log(`Running migration: ${migration.name}`);
    
    // Read SQL from file
    const sql = fs.readFileSync(migration.filePath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      throw new Error(`Error executing SQL: ${error.message}`);
    }
    
    // Record the migration
    await recordMigration(supabase, migration.name, batchNumber);
    
    console.log(`✅ Successfully ran migration: ${migration.name}`);
  } catch (error) {
    console.error(`❌ Failed to run migration ${migration.name}:`, error);
    throw error;
  }
}

/**
 * Prompts the user for confirmation
 */
function promptForConfirmation(pendingMigrations: Migration[]): Promise<boolean> {
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations found.');
    return Promise.resolve(false);
  }

  console.log('\nThe following migrations will be executed:');
  console.log('------------------------------------------');
  pendingMigrations.forEach(migration => {
    console.log(`- ${migration.name}`);
  });
  console.log('------------------------------------------');

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
 * Main migration function
 */
export async function runMigrations(forceRun = false): Promise<void> {
  // Create Supabase client
  const supabase = createClient();

  // Get file migrations and executed migrations
  const fileMigrations = getMigrationFiles();
  const executedMigrations = await getExecutedMigrations(supabase);
  
  // Determine pending migrations
  const pendingMigrations = getPendingMigrations(fileMigrations, executedMigrations);
  
  if (pendingMigrations.length === 0) {
    console.log('✅ Database is up to date. No migrations to run.');
    return;
  }
  
  // Get the next batch number
  const batchNumber = getNextBatchNumber(executedMigrations);
  
  console.log(`Found ${pendingMigrations.length} pending migrations (batch ${batchNumber})`);
  
  // Ask for confirmation unless forced
  const shouldRun = forceRun || await promptForConfirmation(pendingMigrations);
  
  if (!shouldRun) {
    console.log('Migration cancelled');
    return;
  }
  
  // Execute all pending migrations
  for (const migration of pendingMigrations) {
    await executeMigration(supabase, migration, batchNumber);
  }
  
  console.log(`✅ All migrations completed successfully (batch ${batchNumber})`);
} 