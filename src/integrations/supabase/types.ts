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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agencies: {
        Row: {
          agency_address: string | null
          agency_name: string
          company_name: string | null
          contact_number: string
          created_at: string
          email: string
          email_verified: boolean | null
          id: string
          job_expiry_date: string | null
          job_position: string | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          license_url: string | null
          location: string | null
          phone_verified: boolean | null
          responsibilities: string | null
          salary: string | null
          salary_currency: string | null
          status: Database["public"]["Enums"]["submission_status"] | null
        }
        Insert: {
          agency_address?: string | null
          agency_name: string
          company_name?: string | null
          contact_number: string
          created_at?: string
          email: string
          email_verified?: boolean | null
          id?: string
          job_expiry_date?: string | null
          job_position?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          license_url?: string | null
          location?: string | null
          phone_verified?: boolean | null
          responsibilities?: string | null
          salary?: string | null
          salary_currency?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
        }
        Update: {
          agency_address?: string | null
          agency_name?: string
          company_name?: string | null
          contact_number?: string
          created_at?: string
          email?: string
          email_verified?: boolean | null
          id?: string
          job_expiry_date?: string | null
          job_position?: string | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          license_url?: string | null
          location?: string | null
          phone_verified?: boolean | null
          responsibilities?: string | null
          salary?: string | null
          salary_currency?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          contact_number: string
          created_at: string
          details: string
          email: string
          email_verified: boolean | null
          id: string
          name: string
          phone_verified: boolean | null
          subject: string
        }
        Insert: {
          contact_number: string
          created_at?: string
          details: string
          email: string
          email_verified?: boolean | null
          id?: string
          name: string
          phone_verified?: boolean | null
          subject: string
        }
        Update: {
          contact_number?: string
          created_at?: string
          details?: string
          email?: string
          email_verified?: boolean | null
          id?: string
          name?: string
          phone_verified?: boolean | null
          subject?: string
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          alignment: string
          body_size: string
          content: string | null
          created_at: string
          hero_image_url: string | null
          id: string
          max_width: string
          position: number
          show_hero: boolean
          show_in_footer: boolean
          show_in_nav: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          alignment?: string
          body_size?: string
          content?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          max_width?: string
          position?: number
          show_hero?: boolean
          show_in_footer?: boolean
          show_in_nav?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          alignment?: string
          body_size?: string
          content?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          max_width?: string
          position?: number
          show_hero?: boolean
          show_in_footer?: boolean
          show_in_nav?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_referrers: {
        Row: {
          company_name: string | null
          contact_number: string
          created_at: string
          email: string
          email_verified: boolean | null
          id: string
          job_expiry_date: string | null
          job_position: string
          job_type: Database["public"]["Enums"]["job_type"] | null
          location: string | null
          name: string
          phone_verified: boolean | null
          responsibilities: string | null
          salary: string | null
          salary_currency: string | null
          status: Database["public"]["Enums"]["submission_status"] | null
        }
        Insert: {
          company_name?: string | null
          contact_number: string
          created_at?: string
          email: string
          email_verified?: boolean | null
          id?: string
          job_expiry_date?: string | null
          job_position: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          location?: string | null
          name: string
          phone_verified?: boolean | null
          responsibilities?: string | null
          salary?: string | null
          salary_currency?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
        }
        Update: {
          company_name?: string | null
          contact_number?: string
          created_at?: string
          email?: string
          email_verified?: boolean | null
          id?: string
          job_expiry_date?: string | null
          job_position?: string
          job_type?: Database["public"]["Enums"]["job_type"] | null
          location?: string | null
          name?: string
          phone_verified?: boolean | null
          responsibilities?: string | null
          salary?: string | null
          salary_currency?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
        }
        Relationships: []
      }
      job_seekers: {
        Row: {
          certificates_url: string | null
          contact_number: string
          cover_letter_url: string | null
          created_at: string
          current_position: string | null
          cv_url: string | null
          designation: string | null
          email: string
          email_verified: boolean | null
          expected_country: string | null
          expected_salary: string | null
          experience: string | null
          id: string
          name: string
          native_country: string | null
          passport_url: string | null
          phone_verified: boolean | null
          salary_currency: string | null
          status: Database["public"]["Enums"]["submission_status"] | null
        }
        Insert: {
          certificates_url?: string | null
          contact_number: string
          cover_letter_url?: string | null
          created_at?: string
          current_position?: string | null
          cv_url?: string | null
          designation?: string | null
          email: string
          email_verified?: boolean | null
          expected_country?: string | null
          expected_salary?: string | null
          experience?: string | null
          id?: string
          name: string
          native_country?: string | null
          passport_url?: string | null
          phone_verified?: boolean | null
          salary_currency?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
        }
        Update: {
          certificates_url?: string | null
          contact_number?: string
          cover_letter_url?: string | null
          created_at?: string
          current_position?: string | null
          cv_url?: string | null
          designation?: string | null
          email?: string
          email_verified?: boolean | null
          expected_country?: string | null
          expected_salary?: string | null
          experience?: string | null
          id?: string
          name?: string
          native_country?: string | null
          passport_url?: string | null
          phone_verified?: boolean | null
          salary_currency?: string | null
          status?: Database["public"]["Enums"]["submission_status"] | null
        }
        Relationships: []
      }
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          read_at: string | null
          recipient_email: string
          submission_id: string
          submission_type: string
          summary: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_email?: string
          submission_id: string
          submission_type: string
          summary: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_email?: string
          submission_id?: string
          submission_type?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content_type: string
          id: string
          styles: Json | null
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          content_type?: string
          id: string
          styles?: Json | null
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          content_type?: string
          id?: string
          styles?: Json | null
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      site_sections: {
        Row: {
          body: string | null
          id: string
          image_url: string | null
          key: string
          position: number
          styles: Json | null
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          body?: string | null
          id?: string
          image_url?: string | null
          key: string
          position?: number
          styles?: Json | null
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          body?: string | null
          id?: string
          image_url?: string | null
          key?: string
          position?: number
          styles?: Json | null
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vacancies: {
        Row: {
          active: boolean | null
          company_name: string | null
          created_at: string
          experience: string | null
          id: string
          industry: string | null
          is_international: boolean | null
          job_type: Database["public"]["Enums"]["job_type"] | null
          location: string | null
          position: string
          responsibilities: string | null
          salary: string | null
          salary_currency: string | null
        }
        Insert: {
          active?: boolean | null
          company_name?: string | null
          created_at?: string
          experience?: string | null
          id?: string
          industry?: string | null
          is_international?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          location?: string | null
          position: string
          responsibilities?: string | null
          salary?: string | null
          salary_currency?: string | null
        }
        Update: {
          active?: boolean | null
          company_name?: string | null
          created_at?: string
          experience?: string | null
          id?: string
          industry?: string | null
          is_international?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"] | null
          location?: string | null
          position?: string
          responsibilities?: string | null
          salary?: string | null
          salary_currency?: string | null
        }
        Relationships: []
      }
      vacancy_applications: {
        Row: {
          certificate_url: string | null
          contact_number: string
          cover_letter_url: string | null
          created_at: string
          cv_url: string | null
          email: string
          email_verified: boolean | null
          experience: string | null
          id: string
          name: string
          passport_url: string | null
          phone_verified: boolean | null
          vacancy_id: string | null
        }
        Insert: {
          certificate_url?: string | null
          contact_number: string
          cover_letter_url?: string | null
          created_at?: string
          cv_url?: string | null
          email: string
          email_verified?: boolean | null
          experience?: string | null
          id?: string
          name: string
          passport_url?: string | null
          phone_verified?: boolean | null
          vacancy_id?: string | null
        }
        Update: {
          certificate_url?: string | null
          contact_number?: string
          cover_letter_url?: string | null
          created_at?: string
          cv_url?: string | null
          email?: string
          email_verified?: boolean | null
          experience?: string | null
          id?: string
          name?: string
          passport_url?: string | null
          phone_verified?: boolean | null
          vacancy_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vacancy_applications_vacancy_id_fkey"
            columns: ["vacancy_id"]
            isOneToOne: false
            referencedRelation: "vacancies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      job_type: "full_time" | "part_time" | "freelancer" | "other"
      submission_status: "pending" | "reviewed" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "user"],
      job_type: ["full_time", "part_time", "freelancer", "other"],
      submission_status: ["pending", "reviewed", "approved", "rejected"],
    },
  },
} as const
