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
      artifact_history: {
        Row: {
          action: string
          artifact_id: string
          changes: Json
          edited_at: string
          edited_by: string | null
          id: string
          notes: string | null
        }
        Insert: {
          action: string
          artifact_id: string
          changes?: Json
          edited_at?: string
          edited_by?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          action?: string
          artifact_id?: string
          changes?: Json
          edited_at?: string
          edited_by?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      artifacts: {
        Row: {
          accession_number: string
          acquisition_date: string
          acquisition_method: string
          category: string
          condition: string
          conservation_notes: string | null
          created_at: string
          created_by: string | null
          culture: string
          depth: number | null
          description: string
          estimated_value: number | null
          exhibition_history: string[] | null
          height: number | null
          id: string
          image_url: string | null
          last_edited_by: string | null
          location: string
          material: string
          period: string
          provenance: string
          tags: string[] | null
          title: string
          updated_at: string
          vitrine_image_url: string | null
          weight: number | null
          width: number | null
        }
        Insert: {
          accession_number: string
          acquisition_date: string
          acquisition_method: string
          category: string
          condition: string
          conservation_notes?: string | null
          created_at?: string
          created_by?: string | null
          culture: string
          depth?: number | null
          description: string
          estimated_value?: number | null
          exhibition_history?: string[] | null
          height?: number | null
          id?: string
          image_url?: string | null
          last_edited_by?: string | null
          location: string
          material: string
          period: string
          provenance: string
          tags?: string[] | null
          title: string
          updated_at?: string
          vitrine_image_url?: string | null
          weight?: number | null
          width?: number | null
        }
        Update: {
          accession_number?: string
          acquisition_date?: string
          acquisition_method?: string
          category?: string
          condition?: string
          conservation_notes?: string | null
          created_at?: string
          created_by?: string | null
          culture?: string
          depth?: number | null
          description?: string
          estimated_value?: number | null
          exhibition_history?: string[] | null
          height?: number | null
          id?: string
          image_url?: string | null
          last_edited_by?: string | null
          location?: string
          material?: string
          period?: string
          provenance?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          vitrine_image_url?: string | null
          weight?: number | null
          width?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          id: string
          is_active: boolean
          last_login: string | null
          name: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          name: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean
          last_login?: string | null
          name?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          artifact_id: string
          artifact_title: string
          attachments: string[] | null
          content: string
          created_at: string
          created_by: string | null
          findings: string | null
          id: string
          priority: string
          recommendations: string | null
          report_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          artifact_id: string
          artifact_title: string
          attachments?: string[] | null
          content: string
          created_at?: string
          created_by?: string | null
          findings?: string | null
          id?: string
          priority: string
          recommendations?: string | null
          report_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status: string
          title: string
          updated_at?: string
        }
        Update: {
          artifact_id?: string
          artifact_title?: string
          attachments?: string[] | null
          content?: string
          created_at?: string
          created_by?: string | null
          findings?: string | null
          id?: string
          priority?: string
          recommendations?: string | null
          report_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          advanced_features: boolean
          audit_logging: boolean
          auto_save: boolean
          created_at: string
          email_notifications: boolean
          id: string
          language_preference: string
          session_timeout: boolean
          theme_preference: string | null
          two_factor_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          advanced_features?: boolean
          audit_logging?: boolean
          auto_save?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          language_preference?: string
          session_timeout?: boolean
          theme_preference?: string | null
          two_factor_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          advanced_features?: boolean
          audit_logging?: boolean
          auto_save?: boolean
          created_at?: string
          email_notifications?: boolean
          id?: string
          language_preference?: string
          session_timeout?: boolean
          theme_preference?: string | null
          two_factor_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
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
