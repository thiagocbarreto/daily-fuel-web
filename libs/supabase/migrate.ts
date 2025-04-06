import fs from 'fs';
import path from 'path';
import { createClient } from './server';

/**
 * Runs all SQL migrations in the migrations directory
 * This can be called from a script or an API route
 */
export async function runMigrations() {
  // Create Supabase client
  const supabase = createClient();

  // Get all migration files
  const migrationsDir = path.join(process.cwd(), 'libs', 'supabase', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure sequential order by filename

  console.log(`Found ${migrationFiles.length} migration files`);

  // Execute each migration file
  for (const file of migrationFiles) {
    try {
      console.log(`Running migration: ${file}`);
      
      // Read SQL from file
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Execute the SQL
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`Error executing migration ${file}:`, error);
        throw error;
      }
      
      console.log(`Successfully ran migration: ${file}`);
    } catch (error) {
      console.error(`Failed to run migration ${file}:`, error);
      throw error;
    }
  }

  console.log('All migrations completed successfully');
} 