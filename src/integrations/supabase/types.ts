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
      calculator_settings: {
        Row: {
          created_at: string
          id: string
          profit_margin: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profit_margin?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profit_margin?: number
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          client_id: string | null
          created_at: string
          end_datetime: string
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          location: string | null
          notes: string | null
          start_datetime: string
          title: string
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          end_datetime: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          location?: string | null
          notes?: string | null
          start_datetime: string
          title: string
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          end_datetime?: string
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          location?: string | null
          notes?: string | null
          start_datetime?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          assigned_to: string | null
          call_date: string
          call_duration: number | null
          call_type: Database["public"]["Enums"]["call_type"]
          client_id: string
          created_at: string
          follow_up_action: string | null
          id: string
          summary: string | null
        }
        Insert: {
          assigned_to?: string | null
          call_date?: string
          call_duration?: number | null
          call_type?: Database["public"]["Enums"]["call_type"]
          client_id: string
          created_at?: string
          follow_up_action?: string | null
          id?: string
          summary?: string | null
        }
        Update: {
          assigned_to?: string | null
          call_date?: string
          call_duration?: number | null
          call_type?: Database["public"]["Enums"]["call_type"]
          client_id?: string
          created_at?: string
          follow_up_action?: string | null
          id?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          note_text: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          note_text: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          note_text?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          client_name: string
          contact_person: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_value: number | null
          created_at: string
          email: string | null
          first_contact_date: string | null
          follow_up_needed: boolean | null
          id: string
          industry: string | null
          last_contact: string | null
          last_meeting_date: string | null
          meeting_notes: string | null
          notes: string | null
          phone: string | null
          revenue_to_date: number | null
          sales_stage: Database["public"]["Enums"]["sales_stage"]
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          client_name: string
          contact_person?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_value?: number | null
          created_at?: string
          email?: string | null
          first_contact_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          industry?: string | null
          last_contact?: string | null
          last_meeting_date?: string | null
          meeting_notes?: string | null
          notes?: string | null
          phone?: string | null
          revenue_to_date?: number | null
          sales_stage?: Database["public"]["Enums"]["sales_stage"]
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          client_name?: string
          contact_person?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_value?: number | null
          created_at?: string
          email?: string | null
          first_contact_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          industry?: string | null
          last_contact?: string | null
          last_meeting_date?: string | null
          meeting_notes?: string | null
          notes?: string | null
          phone?: string | null
          revenue_to_date?: number | null
          sales_stage?: Database["public"]["Enums"]["sales_stage"]
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      components: {
        Row: {
          base_cost: number
          base_price: number
          category: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_base: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          base_cost: number
          base_price: number
          category: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_base?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          base_cost?: number
          base_price?: number
          category?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_base?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      csv_files: {
        Row: {
          id: string
          name: string
          size: number
          uploaded_at: string
        }
        Insert: {
          id?: string
          name: string
          size: number
          uploaded_at?: string
        }
        Update: {
          id?: string
          name?: string
          size?: number
          uploaded_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          client_id: string | null
          components: Json
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          notes: string | null
          profit_margin: number | null
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number
          title: string
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_id?: string | null
          components?: Json
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          profit_margin?: number | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          title: string
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_id?: string | null
          components?: Json
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          profit_margin?: number | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number
          title?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      call_type: "incoming" | "outgoing"
      client_status: "prospect" | "active" | "inactive" | "former"
      event_type: "meeting" | "call" | "follow_up" | "task"
      quote_status: "draft" | "sent" | "accepted" | "rejected"
      sales_stage:
        | "pre_sales"
        | "negotiation"
        | "closing"
        | "post_sales"
        | "support"
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
      call_type: ["incoming", "outgoing"],
      client_status: ["prospect", "active", "inactive", "former"],
      event_type: ["meeting", "call", "follow_up", "task"],
      quote_status: ["draft", "sent", "accepted", "rejected"],
      sales_stage: [
        "pre_sales",
        "negotiation",
        "closing",
        "post_sales",
        "support",
      ],
    },
  },
} as const
