export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          is_subscriber: boolean
          stripe_customer_id: string | null
          subscription_status: string | null
          current_period_end: string | null
          created_at: string
          price_id: string | null
          timezone: string | null
        }
        Insert: {
          id: string
          name: string
          email: string
          is_subscriber?: boolean
          stripe_customer_id?: string | null
          subscription_status?: string | null
          current_period_end?: string | null
          created_at?: string
          price_id?: string | null
          timezone?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          is_subscriber?: boolean
          stripe_customer_id?: string | null
          subscription_status?: string | null
          current_period_end?: string | null
          created_at?: string
          price_id?: string | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      challenges: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          duration_days: number
          start_date: string
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          duration_days: number
          start_date: string
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          duration_days?: number
          start_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      challenge_participants: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      daily_logs: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          user_id?: string
          date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_challenge_id_fkey"
            columns: ["challenge_id"]
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_logs_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: {
        Args: {
          sql: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  // For querying system tables
  pg_catalog: {
    Tables: {
      pg_tables: {
        Row: {
          schemaname: string
          tablename: string
          tableowner: string
          tablespace: string | null
          hasindexes: boolean
          hasrules: boolean
          hastriggers: boolean
          rowsecurity: boolean
        }
        Insert: never
        Update: never
        Relationships: never
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 