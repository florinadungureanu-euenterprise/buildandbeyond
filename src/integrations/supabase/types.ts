export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      event_submissions: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          id: string
          location: string
          organizer: string | null
          status: string
          submitted_by: string
          tags: string[] | null
          title: string
          type: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          location: string
          organizer?: string | null
          status?: string
          submitted_by: string
          tags?: string[] | null
          title: string
          type?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          location?: string
          organizer?: string | null
          status?: string
          submitted_by?: string
          tags?: string[] | null
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: []
      }
      forum_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string | null
          reply_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string | null
          reply_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          industry: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          id?: string
          industry?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          industry?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_reply_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_reply_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_reply_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_parent_reply_id_fkey"
            columns: ["parent_reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_submissions: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string
          description: string | null
          email: string
          geographic_coverage: string | null
          id: string
          investment_range: string | null
          pricing_model: string | null
          services_offered: string | null
          status: string
          target_stages: string | null
          type: string
          website: string | null
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string
          description?: string | null
          email: string
          geographic_coverage?: string | null
          id?: string
          investment_range?: string | null
          pricing_model?: string | null
          services_offered?: string | null
          status?: string
          target_stages?: string | null
          type: string
          website?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string
          description?: string | null
          email?: string
          geographic_coverage?: string | null
          id?: string
          investment_range?: string | null
          pricing_model?: string | null
          services_offered?: string | null
          status?: string
          target_stages?: string | null
          type?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          linkedin_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          linkedin_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          linkedin_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposal_requests: {
        Row: {
          created_at: string
          generated_modules: Json | null
          id: string
          notes: string | null
          onboarding_answers: Json | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_modules?: Json | null
          id?: string
          notes?: string | null
          onboarding_answers?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_modules?: Json | null
          id?: string
          notes?: string | null
          onboarding_answers?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      scraped_tools: {
        Row: {
          category: string
          cost_savings: string | null
          created_at: string
          description: string | null
          efficiency_gain: string | null
          features: string[] | null
          id: string
          name: string
          pricing: string | null
          relevant_stages: string[] | null
          scraped_at: string
          source: string | null
          time_savings: string | null
          url: string | null
          use_cases: string[] | null
        }
        Insert: {
          category?: string
          cost_savings?: string | null
          created_at?: string
          description?: string | null
          efficiency_gain?: string | null
          features?: string[] | null
          id?: string
          name: string
          pricing?: string | null
          relevant_stages?: string[] | null
          scraped_at?: string
          source?: string | null
          time_savings?: string | null
          url?: string | null
          use_cases?: string[] | null
        }
        Update: {
          category?: string
          cost_savings?: string | null
          created_at?: string
          description?: string | null
          efficiency_gain?: string | null
          features?: string[] | null
          id?: string
          name?: string
          pricing?: string | null
          relevant_stages?: string[] | null
          scraped_at?: string
          source?: string | null
          time_savings?: string | null
          url?: string | null
          use_cases?: string[] | null
        }
        Relationships: []
      }
      uploaded_documents: {
        Row: {
          content: string | null
          created_at: string
          id: string
          name: string
          size: number
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          name: string
          size: number
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          name?: string
          size?: number
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_data: {
        Row: {
          applications: Json | null
          applied_applications: string[] | null
          applied_funding_routes: string[] | null
          created_at: string
          funding_data: Json | null
          milestones: Json | null
          onboarding_profile: Json | null
          passport: Json | null
          subscribed_tools: string[] | null
          team_members: Json | null
          tool_activation_count: number | null
          updated_at: string
          user_id: string
          user_inputs: Json | null
          validation: Json | null
        }
        Insert: {
          applications?: Json | null
          applied_applications?: string[] | null
          applied_funding_routes?: string[] | null
          created_at?: string
          funding_data?: Json | null
          milestones?: Json | null
          onboarding_profile?: Json | null
          passport?: Json | null
          subscribed_tools?: string[] | null
          team_members?: Json | null
          tool_activation_count?: number | null
          updated_at?: string
          user_id: string
          user_inputs?: Json | null
          validation?: Json | null
        }
        Update: {
          applications?: Json | null
          applied_applications?: string[] | null
          applied_funding_routes?: string[] | null
          created_at?: string
          funding_data?: Json | null
          milestones?: Json | null
          onboarding_profile?: Json | null
          passport?: Json | null
          subscribed_tools?: string[] | null
          team_members?: Json | null
          tool_activation_count?: number | null
          updated_at?: string
          user_id?: string
          user_inputs?: Json | null
          validation?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
