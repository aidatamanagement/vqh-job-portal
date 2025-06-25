export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendly_settings: {
        Row: {
          api_token: string
          created_at: string
          default_event_type_uri: string | null
          id: string
          organization_uri: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_token: string
          created_at?: string
          default_event_type_uri?: string | null
          id?: string
          organization_uri: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_token?: string
          created_at?: string
          default_event_type_uri?: string | null
          id?: string
          organization_uri?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          brevo_message_id: string | null
          created_at: string
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string
          subject: string
          template_slug: string
          variables_used: Json | null
        }
        Insert: {
          brevo_message_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string
          subject: string
          template_slug: string
          variables_used?: Json | null
        }
        Update: {
          brevo_message_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          subject?: string
          template_slug?: string
          variables_used?: Json | null
        }
        Relationships: []
      }
      email_settings: {
        Row: {
          admin_emails: string[]
          created_at: string
          enable_auto_responses: boolean
          enable_notifications: boolean
          id: string
          updated_at: string
        }
        Insert: {
          admin_emails?: string[]
          created_at?: string
          enable_auto_responses?: boolean
          enable_notifications?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          admin_emails?: string[]
          created_at?: string
          enable_auto_responses?: boolean
          enable_notifications?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_body: string
          id: string
          is_active: boolean | null
          name: string
          slug: string
          subject: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          created_at?: string
          html_body: string
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          subject: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          created_at?: string
          html_body?: string
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          subject?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      interviews: {
        Row: {
          application_id: string
          calendly_event_id: string
          calendly_event_uri: string
          candidate_email: string
          created_at: string
          id: string
          interviewer_email: string | null
          meeting_url: string | null
          scheduled_time: string
          status: string
          updated_at: string
        }
        Insert: {
          application_id: string
          calendly_event_id: string
          calendly_event_uri: string
          candidate_email: string
          created_at?: string
          id?: string
          interviewer_email?: string | null
          meeting_url?: string | null
          scheduled_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          calendly_event_id?: string
          calendly_event_uri?: string
          candidate_email?: string
          created_at?: string
          id?: string
          interviewer_email?: string | null
          meeting_url?: string | null
          scheduled_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          additional_docs_urls: string[] | null
          applied_position: string
          city_state: string | null
          cover_letter: string | null
          created_at: string | null
          earliest_start_date: string | null
          email: string
          first_name: string
          id: string
          job_id: string
          last_name: string
          phone: string | null
          status: string | null
          tracking_token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          additional_docs_urls?: string[] | null
          applied_position: string
          city_state?: string | null
          cover_letter?: string | null
          created_at?: string | null
          earliest_start_date?: string | null
          email: string
          first_name: string
          id?: string
          job_id: string
          last_name: string
          phone?: string | null
          status?: string | null
          tracking_token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          additional_docs_urls?: string[] | null
          applied_position?: string
          city_state?: string | null
          cover_letter?: string | null
          created_at?: string | null
          earliest_start_date?: string | null
          email?: string
          first_name?: string
          id?: string
          job_id?: string
          last_name?: string
          phone?: string | null
          status?: string | null
          tracking_token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_facilities: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      job_locations: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      job_positions: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_deadline: string | null
          created_at: string | null
          created_by: string | null
          description: string
          facilities: string[] | null
          id: string
          is_active: boolean | null
          is_urgent: boolean | null
          location: string
          position: string
          title: string
          updated_at: string | null
        }
        Insert: {
          application_deadline?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          facilities?: string[] | null
          id?: string
          is_active?: boolean | null
          is_urgent?: boolean | null
          location: string
          position: string
          title: string
          updated_at?: string | null
        }
        Update: {
          application_deadline?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          facilities?: string[] | null
          id?: string
          is_active?: boolean | null
          is_urgent?: boolean | null
          location?: string
          position?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_name: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          admin_name?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_name?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      salespeople: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          region: string
          role: string
          status: string
          updated_at: string
          visits_this_month: number | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          region: string
          role: string
          status?: string
          updated_at?: string
          visits_this_month?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          region?: string
          role?: string
          status?: string
          updated_at?: string
          visits_this_month?: number | null
        }
        Relationships: []
      }
      status_history: {
        Row: {
          application_id: string
          changed_at: string
          changed_by: string | null
          id: string
          new_status: string
          notes: string | null
          previous_status: string
          transition_valid: boolean
        }
        Insert: {
          application_id: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status: string
          notes?: string | null
          previous_status: string
          transition_valid?: boolean
        }
        Update: {
          application_id?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_status?: string
          notes?: string | null
          previous_status?: string
          transition_valid?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      training_videos: {
        Row: {
          category: string
          created_at: string
          description: string | null
          duration: string | null
          id: string
          role: string
          tag: string
          title: string
          type: string
          updated_at: string
          url: string
          view_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          role: string
          tag: string
          title: string
          type: string
          updated_at?: string
          url: string
          view_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          role?: string
          tag?: string
          title?: string
          type?: string
          updated_at?: string
          url?: string
          view_count?: number | null
        }
        Relationships: []
      }
      visit_logs: {
        Row: {
          created_at: string
          id: string
          location_name: string
          notes: string | null
          salesperson_id: string | null
          salesperson_name: string
          status: string
          strength: string
          updated_at: string
          visit_date: string
          visit_time: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_name: string
          notes?: string | null
          salesperson_id?: string | null
          salesperson_name: string
          status: string
          strength: string
          updated_at?: string
          visit_date: string
          visit_time: string
        }
        Update: {
          created_at?: string
          id?: string
          location_name?: string
          notes?: string | null
          salesperson_id?: string | null
          salesperson_name?: string
          status?: string
          strength?: string
          updated_at?: string
          visit_date?: string
          visit_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_logs_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: {
          admin_email: string
          admin_password: string
          admin_name?: string
        }
        Returns: Json
      }
      get_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          admin_name: string
          role: string
          created_at: string
        }[]
      }
      validate_status_transition: {
        Args: { current_status: string; new_status: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
