import { NextResponse, NextRequest } from 'next/server';
import { runMigrations } from '@/libs/supabase/migrate';

// IMPORTANT: This route should be protected in production!
// Only keep this accessible during development or use proper authentication
export async function POST(req: NextRequest) {
  // Check if this is a development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    await runMigrations();
    return NextResponse.json({ success: true, message: 'Migrations completed successfully' });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed', details: error.message },
      { status: 500 }
    );
  }
} 