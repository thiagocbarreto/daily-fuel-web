import { createClient as createServerClient } from './server';
import { createClient as createBrowserClient } from './client';
import { createServices, DatabaseServices } from './services';

/**
 * Get database services for server-side operations
 */
export function getServerDB(): DatabaseServices {
  const supabase = createServerClient();
  return createServices(supabase);
}

/**
 * Get database services for client-side operations
 */
export function getClientDB(): DatabaseServices {
  const supabase = createBrowserClient();
  return createServices(supabase);
}

/**
 * Helper to determine if we're on the server or client
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get database services based on context (server or client)
 */
export function getDB(): DatabaseServices {
  return isServer() ? getServerDB() : getClientDB();
} 