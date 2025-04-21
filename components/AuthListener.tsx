'use client';

import { createClient } from '@/libs/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useEffect } from 'react';

export default function AuthListener(): null {
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        (async () => {
          try {
            // Check if user exists in the users table
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
            .eq('id', session.user.id)
            .single();

            // If user doesn't exist, create a new record
            if (!existingUser) {
              await supabase.from('users').insert({
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
              });
            }
          } catch (error) {
            console.error('Error creating/checking user:', error);
          }
        })();
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // This component doesn't render anything
  return null;
} 