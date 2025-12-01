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
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          performed_by: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          performed_by?: string | null
        }
        Relationships: []
      }
      ai_agent_config: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          personality: string | null
          rules: Json | null
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          personality?: string | null
          rules?: Json | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          personality?: string | null
          rules?: Json | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_decisions: {
        Row: {
          ai_analysis: Json | null
          context: string | null
          created_at: string | null
          description: string
          final_decision: string | null
          id: string
          options: Json | null
          status: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          context?: string | null
          created_at?: string | null
          description: string
          final_decision?: string | null
          id?: string
          options?: Json | null
          status?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          context?: string | null
          created_at?: string | null
          description?: string
          final_decision?: string | null
          id?: string
          options?: Json | null
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          content: string
          context: Json | null
          conversation_id: string | null
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          context?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          context?: Json | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          category: string
          context: Json | null
          created_at: string | null
          description: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          context?: Json | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          context?: Json | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
          salesman_id: string | null
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
          salesman_id?: string | null
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
          salesman_id?: string | null
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
          {
            foreignKeyName: "calendar_events_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "salesmen"
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
      client_communications: {
        Row: {
          attachments: Json | null
          client_id: string
          communication_date: string | null
          communication_type: Database["public"]["Enums"]["communication_type"]
          contact_person: string | null
          content: string | null
          created_at: string | null
          direction: string | null
          duration_minutes: number | null
          id: string
          metadata: Json | null
          salesman_id: string | null
          sentiment: string | null
          subject: string | null
        }
        Insert: {
          attachments?: Json | null
          client_id: string
          communication_date?: string | null
          communication_type: Database["public"]["Enums"]["communication_type"]
          contact_person?: string | null
          content?: string | null
          created_at?: string | null
          direction?: string | null
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          salesman_id?: string | null
          sentiment?: string | null
          subject?: string | null
        }
        Update: {
          attachments?: Json | null
          client_id?: string
          communication_date?: string | null
          communication_type?: Database["public"]["Enums"]["communication_type"]
          contact_person?: string | null
          content?: string | null
          created_at?: string | null
          direction?: string | null
          duration_minutes?: number | null
          id?: string
          metadata?: Json | null
          salesman_id?: string | null
          sentiment?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_communications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_communications_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "salesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          client_id: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          client_id: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
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
      client_products: {
        Row: {
          client_id: string
          created_at: string | null
          discount_percent: number | null
          end_date: string | null
          id: string
          notes: string | null
          product_id: string
          quantity: number | null
          start_date: string | null
          status: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          discount_percent?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity?: number | null
          start_date?: string | null
          status?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          discount_percent?: number | null
          end_date?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number | null
          start_date?: string | null
          status?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "client_products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      client_status_configs: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          value: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          value: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      client_tag_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          client_id: string
          id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          client_id: string
          id?: string
          tag_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          client_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tag_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "client_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tags: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          acquisition_cost: number | null
          client_name: string
          contact_person: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_value: number | null
          created_at: string
          deal_probability: number | null
          email: string | null
          first_contact_date: string | null
          follow_up_needed: boolean | null
          health_score: number | null
          id: string
          industry: string | null
          last_communication_type:
            | Database["public"]["Enums"]["communication_type"]
            | null
          last_contact: string | null
          last_meeting_date: string | null
          lead_source: Database["public"]["Enums"]["lead_source"] | null
          lifetime_value: number | null
          loss_reason: string | null
          meeting_notes: string | null
          notes: string | null
          phone: string | null
          revenue_to_date: number | null
          sales_stage: Database["public"]["Enums"]["sales_stage"]
          salesman_id: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          acquisition_cost?: number | null
          client_name: string
          contact_person?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_value?: number | null
          created_at?: string
          deal_probability?: number | null
          email?: string | null
          first_contact_date?: string | null
          follow_up_needed?: boolean | null
          health_score?: number | null
          id?: string
          industry?: string | null
          last_communication_type?:
            | Database["public"]["Enums"]["communication_type"]
            | null
          last_contact?: string | null
          last_meeting_date?: string | null
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          lifetime_value?: number | null
          loss_reason?: string | null
          meeting_notes?: string | null
          notes?: string | null
          phone?: string | null
          revenue_to_date?: number | null
          sales_stage?: Database["public"]["Enums"]["sales_stage"]
          salesman_id?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          acquisition_cost?: number | null
          client_name?: string
          contact_person?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_value?: number | null
          created_at?: string
          deal_probability?: number | null
          email?: string | null
          first_contact_date?: string | null
          follow_up_needed?: boolean | null
          health_score?: number | null
          id?: string
          industry?: string | null
          last_communication_type?:
            | Database["public"]["Enums"]["communication_type"]
            | null
          last_contact?: string | null
          last_meeting_date?: string | null
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          lifetime_value?: number | null
          loss_reason?: string | null
          meeting_notes?: string | null
          notes?: string | null
          phone?: string | null
          revenue_to_date?: number | null
          sales_stage?: Database["public"]["Enums"]["sales_stage"]
          salesman_id?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "salesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      company_documents: {
        Row: {
          category: string | null
          created_at: string | null
          department_id: string | null
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_active: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_active?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_documents_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      company_policies: {
        Row: {
          category: string
          content: string
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      competitor_analysis: {
        Row: {
          client_id: string | null
          competitor_id: string
          competitor_price: number | null
          competitor_strengths: string | null
          competitor_weaknesses: string | null
          created_at: string | null
          id: string
          opportunity_id: string | null
          our_advantages: string | null
          outcome: string | null
          strategy_notes: string | null
          threat_level: string | null
        }
        Insert: {
          client_id?: string | null
          competitor_id: string
          competitor_price?: number | null
          competitor_strengths?: string | null
          competitor_weaknesses?: string | null
          created_at?: string | null
          id?: string
          opportunity_id?: string | null
          our_advantages?: string | null
          outcome?: string | null
          strategy_notes?: string | null
          threat_level?: string | null
        }
        Update: {
          client_id?: string | null
          competitor_id?: string
          competitor_price?: number | null
          competitor_strengths?: string | null
          competitor_weaknesses?: string | null
          created_at?: string | null
          id?: string
          opportunity_id?: string | null
          our_advantages?: string | null
          outcome?: string | null
          strategy_notes?: string | null
          threat_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_analysis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_analysis_competitor_id_fkey"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_analysis_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      competitors: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          market_position: string | null
          name: string
          pricing_info: string | null
          strengths: string[] | null
          updated_at: string | null
          weaknesses: string[] | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          market_position?: string | null
          name: string
          pricing_info?: string | null
          strengths?: string[] | null
          updated_at?: string | null
          weaknesses?: string[] | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          market_position?: string | null
          name?: string
          pricing_info?: string | null
          strengths?: string[] | null
          updated_at?: string | null
          weaknesses?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
      component_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
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
      contract_amendments: {
        Row: {
          amendment_type: string | null
          approved_by: string | null
          client_id: string
          created_at: string | null
          description: string
          effective_date: string | null
          id: string
          new_end_date: string | null
          new_value: number | null
          previous_end_date: string | null
          previous_value: number | null
        }
        Insert: {
          amendment_type?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string | null
          description: string
          effective_date?: string | null
          id?: string
          new_end_date?: string | null
          new_value?: number | null
          previous_end_date?: string | null
          previous_value?: number | null
        }
        Update: {
          amendment_type?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string | null
          description?: string
          effective_date?: string | null
          id?: string
          new_end_date?: string | null
          new_value?: number | null
          previous_end_date?: string | null
          previous_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_amendments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
      cxo_ai_jobs: {
        Row: {
          completed_at: string | null
          conversation_id: string | null
          created_at: string | null
          error: string | null
          id: string
          input_reference: Json | null
          job_type: Database["public"]["Enums"]["cxo_ai_job_type"]
          output: Json | null
          status: Database["public"]["Enums"]["cxo_ai_job_status"] | null
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          input_reference?: Json | null
          job_type: Database["public"]["Enums"]["cxo_ai_job_type"]
          output?: Json | null
          status?: Database["public"]["Enums"]["cxo_ai_job_status"] | null
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          input_reference?: Json | null
          job_type?: Database["public"]["Enums"]["cxo_ai_job_type"]
          output?: Json | null
          status?: Database["public"]["Enums"]["cxo_ai_job_status"] | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cxo_ai_jobs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "cxo_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_ai_jobs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxo_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "cxo_users"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_connectors: {
        Row: {
          config: Json | null
          created_at: string | null
          display_name: string
          health_status: Database["public"]["Enums"]["cxo_health_status"] | null
          id: string
          is_enabled: boolean | null
          last_health_check_at: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["cxo_connector_type"]
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          display_name: string
          health_status?:
            | Database["public"]["Enums"]["cxo_health_status"]
            | null
          id?: string
          is_enabled?: boolean | null
          last_health_check_at?: string | null
          tenant_id: string
          type: Database["public"]["Enums"]["cxo_connector_type"]
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          display_name?: string
          health_status?:
            | Database["public"]["Enums"]["cxo_health_status"]
            | null
          id?: string
          is_enabled?: boolean | null
          last_health_check_at?: string | null
          tenant_id?: string
          type?: Database["public"]["Enums"]["cxo_connector_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxo_connectors_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_contacts: {
        Row: {
          attributes: Json | null
          channels: Json | null
          created_at: string | null
          external_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          primary_email: string | null
          primary_phone: string | null
          tags: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          attributes?: Json | null
          channels?: Json | null
          created_at?: string | null
          external_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          tags?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          attributes?: Json | null
          channels?: Json | null
          created_at?: string | null
          external_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          tags?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxo_contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_conversation_events: {
        Row: {
          conversation_id: string
          created_at: string | null
          created_by_user_id: string | null
          id: string
          payload: Json | null
          provider_event_id: string | null
          provider_type:
            | Database["public"]["Enums"]["cxo_connector_type"]
            | null
          tenant_id: string
          timestamp: string | null
          type: Database["public"]["Enums"]["cxo_event_type"]
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          payload?: Json | null
          provider_event_id?: string | null
          provider_type?:
            | Database["public"]["Enums"]["cxo_connector_type"]
            | null
          tenant_id: string
          timestamp?: string | null
          type: Database["public"]["Enums"]["cxo_event_type"]
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          payload?: Json | null
          provider_event_id?: string | null
          provider_type?:
            | Database["public"]["Enums"]["cxo_connector_type"]
            | null
          tenant_id?: string
          timestamp?: string | null
          type?: Database["public"]["Enums"]["cxo_event_type"]
        }
        Relationships: [
          {
            foreignKeyName: "cxo_conversation_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "cxo_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_conversation_events_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "cxo_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_conversation_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_conversations: {
        Row: {
          assigned_agent_id: string | null
          assigned_queue_id: string | null
          closed_at: string | null
          contact_id: string | null
          created_at: string | null
          external_reference: string | null
          id: string
          metadata: Json | null
          primary_channel:
            | Database["public"]["Enums"]["cxo_channel_type"]
            | null
          priority: Database["public"]["Enums"]["cxo_priority"] | null
          started_at: string | null
          status: Database["public"]["Enums"]["cxo_conversation_status"] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          assigned_queue_id?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          external_reference?: string | null
          id?: string
          metadata?: Json | null
          primary_channel?:
            | Database["public"]["Enums"]["cxo_channel_type"]
            | null
          priority?: Database["public"]["Enums"]["cxo_priority"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["cxo_conversation_status"] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          assigned_queue_id?: string | null
          closed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          external_reference?: string | null
          id?: string
          metadata?: Json | null
          primary_channel?:
            | Database["public"]["Enums"]["cxo_channel_type"]
            | null
          priority?: Database["public"]["Enums"]["cxo_priority"] | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["cxo_conversation_status"] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxo_conversations_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "cxo_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_conversations_assigned_queue_id_fkey"
            columns: ["assigned_queue_id"]
            isOneToOne: false
            referencedRelation: "cxo_queues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "cxo_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_diagnostic_bundles: {
        Row: {
          context: Json | null
          created_at: string | null
          created_by_user_id: string | null
          id: string
          logs: Json | null
          network_tests: Json | null
          tenant_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          logs?: Json | null
          network_tests?: Json | null
          tenant_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          created_by_user_id?: string | null
          id?: string
          logs?: Json | null
          network_tests?: Json | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cxo_diagnostic_bundles_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "cxo_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_diagnostic_bundles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_provider_health_checks: {
        Row: {
          checked_at: string | null
          connector_id: string
          error_code: string | null
          error_message: string | null
          id: string
          latency_ms: number | null
          status: Database["public"]["Enums"]["cxo_check_status"]
          tenant_id: string
          type: Database["public"]["Enums"]["cxo_health_check_type"]
        }
        Insert: {
          checked_at?: string | null
          connector_id: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          status: Database["public"]["Enums"]["cxo_check_status"]
          tenant_id: string
          type: Database["public"]["Enums"]["cxo_health_check_type"]
        }
        Update: {
          checked_at?: string | null
          connector_id?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          status?: Database["public"]["Enums"]["cxo_check_status"]
          tenant_id?: string
          type?: Database["public"]["Enums"]["cxo_health_check_type"]
        }
        Relationships: [
          {
            foreignKeyName: "cxo_provider_health_checks_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "cxo_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_provider_health_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_queues: {
        Row: {
          channel_types:
            | Database["public"]["Enums"]["cxo_channel_type"][]
            | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          routing_strategy:
            | Database["public"]["Enums"]["cxo_routing_strategy"]
            | null
          skills_required: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          channel_types?:
            | Database["public"]["Enums"]["cxo_channel_type"][]
            | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          routing_strategy?:
            | Database["public"]["Enums"]["cxo_routing_strategy"]
            | null
          skills_required?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          channel_types?:
            | Database["public"]["Enums"]["cxo_channel_type"][]
            | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          routing_strategy?:
            | Database["public"]["Enums"]["cxo_routing_strategy"]
            | null
          skills_required?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxo_queues_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_support_tickets: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          description: string | null
          diagnostic_bundle_id: string | null
          id: string
          related_connector_id: string | null
          related_conversation_id: string | null
          severity: Database["public"]["Enums"]["cxo_ticket_severity"] | null
          status: Database["public"]["Enums"]["cxo_ticket_status"] | null
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["cxo_ticket_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          diagnostic_bundle_id?: string | null
          id?: string
          related_connector_id?: string | null
          related_conversation_id?: string | null
          severity?: Database["public"]["Enums"]["cxo_ticket_severity"] | null
          status?: Database["public"]["Enums"]["cxo_ticket_status"] | null
          tenant_id: string
          title: string
          type: Database["public"]["Enums"]["cxo_ticket_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          description?: string | null
          diagnostic_bundle_id?: string | null
          id?: string
          related_connector_id?: string | null
          related_conversation_id?: string | null
          severity?: Database["public"]["Enums"]["cxo_ticket_severity"] | null
          status?: Database["public"]["Enums"]["cxo_ticket_status"] | null
          tenant_id?: string
          title?: string
          type?: Database["public"]["Enums"]["cxo_ticket_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxo_support_tickets_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "cxo_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_support_tickets_related_connector_id_fkey"
            columns: ["related_connector_id"]
            isOneToOne: false
            referencedRelation: "cxo_connectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_support_tickets_related_conversation_id_fkey"
            columns: ["related_conversation_id"]
            isOneToOne: false
            referencedRelation: "cxo_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_tenants: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan: string | null
          primary_region: string | null
          settings: Json | null
          slug: string
          status: Database["public"]["Enums"]["cxo_tenant_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan?: string | null
          primary_region?: string | null
          settings?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["cxo_tenant_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan?: string | null
          primary_region?: string | null
          settings?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["cxo_tenant_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cxo_users: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          language: string | null
          last_login_at: string | null
          role: Database["public"]["Enums"]["cxo_user_role"] | null
          status: Database["public"]["Enums"]["cxo_user_status"] | null
          tenant_id: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["cxo_user_role"] | null
          status?: Database["public"]["Enums"]["cxo_user_status"] | null
          tenant_id: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          language?: string | null
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["cxo_user_role"] | null
          status?: Database["public"]["Enums"]["cxo_user_status"] | null
          tenant_id?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxo_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_workflow_versions: {
        Row: {
          created_at: string | null
          created_by_user_id: string | null
          definition: Json | null
          id: string
          published_at: string | null
          status: Database["public"]["Enums"]["cxo_workflow_status"] | null
          tenant_id: string
          version_number: number | null
          workflow_id: string
        }
        Insert: {
          created_at?: string | null
          created_by_user_id?: string | null
          definition?: Json | null
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["cxo_workflow_status"] | null
          tenant_id: string
          version_number?: number | null
          workflow_id: string
        }
        Update: {
          created_at?: string | null
          created_by_user_id?: string | null
          definition?: Json | null
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["cxo_workflow_status"] | null
          tenant_id?: string
          version_number?: number | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cxo_workflow_versions_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "cxo_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_workflow_versions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cxo_workflow_versions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "cxo_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      cxo_workflows: {
        Row: {
          created_at: string | null
          current_version_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          trigger_type: Database["public"]["Enums"]["cxo_workflow_trigger"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_version_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          trigger_type: Database["public"]["Enums"]["cxo_workflow_trigger"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_version_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          trigger_type?: Database["public"]["Enums"]["cxo_workflow_trigger"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cxo_workflows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cxo_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_access: {
        Row: {
          created_at: string | null
          dashboard_name: string
          id: string
          min_role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          dashboard_name: string
          id?: string
          min_role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          dashboard_name?: string
          id?: string
          min_role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      debit_cases: {
        Row: {
          client_id: string | null
          collected_amount: number | null
          collector_id: string | null
          created_at: string | null
          current_amount: number | null
          description: string | null
          due_date: string | null
          id: string
          last_contact_date: string | null
          notes: string | null
          original_amount: number | null
          priority: string | null
          stage: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          collected_amount?: number | null
          collector_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          last_contact_date?: string | null
          notes?: string | null
          original_amount?: number | null
          priority?: string | null
          stage?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          collected_amount?: number | null
          collector_id?: string | null
          created_at?: string | null
          current_amount?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          last_contact_date?: string | null
          notes?: string | null
          original_amount?: number | null
          priority?: string | null
          stage?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debit_cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debit_cases_collector_id_fkey"
            columns: ["collector_id"]
            isOneToOne: false
            referencedRelation: "debit_collectors"
            referencedColumns: ["id"]
          },
        ]
      }
      debit_collectors: {
        Row: {
          avatar_url: string | null
          commission_rate: number | null
          created_at: string | null
          email: string | null
          hire_date: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          target_amount: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          commission_rate?: number | null
          created_at?: string | null
          email?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      debit_pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          value: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          value: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          budget: number | null
          color: string | null
          created_at: string | null
          description: string | null
          head_id: string | null
          id: string
          name: string
          parent_department_id: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name: string
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name?: string
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_certifications: {
        Row: {
          certification_name: string
          created_at: string | null
          credential_id: string | null
          employee_id: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_organization: string | null
          status: string | null
        }
        Insert: {
          certification_name: string
          created_at?: string | null
          credential_id?: string | null
          employee_id: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
          status?: string | null
        }
        Update: {
          certification_name?: string
          created_at?: string | null
          credential_id?: string | null
          employee_id?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_organization?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_certifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string | null
          department_id: string | null
          employee_code: string | null
          hire_date: string | null
          id: string
          manager_id: string | null
          position: string | null
          salary: number | null
          skills: string[] | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          employee_code?: string | null
          hire_date?: string | null
          id?: string
          manager_id?: string | null
          position?: string | null
          salary?: number | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          employee_code?: string | null
          hire_date?: string | null
          id?: string
          manager_id?: string | null
          position?: string | null
          salary?: number | null
          skills?: string[] | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_usage: {
        Row: {
          client_product_id: string
          created_at: string | null
          feature_name: string
          id: string
          last_used_at: string | null
          period_end: string | null
          period_start: string | null
          usage_count: number | null
          usage_data: Json | null
        }
        Insert: {
          client_product_id: string
          created_at?: string | null
          feature_name: string
          id?: string
          last_used_at?: string | null
          period_end?: string | null
          period_start?: string | null
          usage_count?: number | null
          usage_data?: Json | null
        }
        Update: {
          client_product_id?: string
          created_at?: string | null
          feature_name?: string
          id?: string
          last_used_at?: string | null
          period_end?: string | null
          period_start?: string | null
          usage_count?: number | null
          usage_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_usage_client_product_id_fkey"
            columns: ["client_product_id"]
            isOneToOne: false
            referencedRelation: "client_products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          issue_date: string | null
          line_items: Json | null
          notes: string | null
          opportunity_id: string | null
          paid_date: string | null
          payment_method: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          line_items?: Json | null
          notes?: string | null
          opportunity_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          issue_date?: string | null
          line_items?: Json | null
          notes?: string | null
          opportunity_id?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_definitions: {
        Row: {
          calculation_method: string | null
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          name: string
          target_value: number | null
          unit: string | null
        }
        Insert: {
          calculation_method?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          name: string
          target_value?: number | null
          unit?: string | null
        }
        Update: {
          calculation_method?: string | null
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          name?: string
          target_value?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_definitions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_records: {
        Row: {
          created_at: string | null
          department_id: string | null
          employee_id: string | null
          id: string
          kpi_id: string
          notes: string | null
          period_end: string | null
          period_start: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          employee_id?: string | null
          id?: string
          kpi_id: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          employee_id?: string | null
          id?: string
          kpi_id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_records_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_records_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_updates: {
        Row: {
          created_at: string | null
          id: string
          kpi_id: string | null
          notes: string | null
          timestamp: string | null
          updated_by_employee_id: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          kpi_id?: string | null
          notes?: string | null
          timestamp?: string | null
          updated_by_employee_id?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          kpi_id?: string | null
          notes?: string | null
          timestamp?: string | null
          updated_by_employee_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_updates_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_updates_updated_by_employee_id_fkey"
            columns: ["updated_by_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          actual_spend: number | null
          budget: number | null
          campaign_type: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          goals: Json | null
          id: string
          name: string
          start_date: string | null
          status: string | null
          target_audience: string | null
          updated_at: string | null
        }
        Insert: {
          actual_spend?: number | null
          budget?: number | null
          campaign_type?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          id?: string
          name: string
          start_date?: string | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_spend?: number | null
          budget?: number | null
          campaign_type?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          goals?: Json | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketing_interactions: {
        Row: {
          campaign_id: string | null
          client_id: string
          content_name: string | null
          content_url: string | null
          created_at: string | null
          id: string
          interaction_data: Json | null
          interaction_date: string | null
          interaction_type: string | null
        }
        Insert: {
          campaign_id?: string | null
          client_id: string
          content_name?: string | null
          content_url?: string | null
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_date?: string | null
          interaction_type?: string | null
        }
        Update: {
          campaign_id?: string | null
          client_id?: string
          content_name?: string | null
          content_url?: string | null
          created_at?: string | null
          id?: string
          interaction_data?: Json | null
          interaction_date?: string | null
          interaction_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_interactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          progress: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link_url: string | null
          message: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          message: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link_url?: string | null
          message?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          actual_close_date: string | null
          client_id: string | null
          created_at: string | null
          deal_probability: number | null
          description: string | null
          expected_close_date: string | null
          id: string
          lead_source: Database["public"]["Enums"]["lead_source"] | null
          sales_stage: string | null
          salesman_id: string | null
          status: string | null
          title: string
          updated_at: string | null
          value: number | null
          win_loss_notes: string | null
          win_loss_reason_id: string | null
        }
        Insert: {
          actual_close_date?: string | null
          client_id?: string | null
          created_at?: string | null
          deal_probability?: number | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          sales_stage?: string | null
          salesman_id?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          value?: number | null
          win_loss_notes?: string | null
          win_loss_reason_id?: string | null
        }
        Update: {
          actual_close_date?: string | null
          client_id?: string | null
          created_at?: string | null
          deal_probability?: number | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          sales_stage?: string | null
          salesman_id?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          value?: number | null
          win_loss_notes?: string | null
          win_loss_reason_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "salesmen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_win_loss_reason_id_fkey"
            columns: ["win_loss_reason_id"]
            isOneToOne: false
            referencedRelation: "win_loss_reasons"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          value: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          value: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      opportunity_stages_history: {
        Row: {
          duration_hours: number | null
          entered_at: string | null
          exited_at: string | null
          id: string
          opportunity_id: string
          stage: string
        }
        Insert: {
          duration_hours?: number | null
          entered_at?: string | null
          exited_at?: string | null
          id?: string
          opportunity_id: string
          stage: string
        }
        Update: {
          duration_hours?: number | null
          entered_at?: string | null
          exited_at?: string | null
          id?: string
          opportunity_id?: string
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_stages_history_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          mission: string | null
          name: string
          primary_color: string | null
          secondary_color: string | null
          updated_at: string | null
          vision: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          mission?: string | null
          name: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          vision?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          mission?: string | null
          name?: string
          primary_color?: string | null
          secondary_color?: string | null
          updated_at?: string | null
          vision?: string | null
        }
        Relationships: []
      }
      page_permissions: {
        Row: {
          can_access: boolean | null
          created_at: string | null
          id: string
          page_path: string
          user_id: string
        }
        Insert: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          page_path: string
          user_id: string
        }
        Update: {
          can_access?: boolean | null
          created_at?: string | null
          id?: string
          page_path?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_id: string
          created_at: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          value: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          value: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      policy_compliance: {
        Row: {
          compliance_status: string | null
          created_at: string | null
          employee_id: string
          id: string
          last_review_date: string | null
          next_review_date: string | null
          notes: string | null
          policy_id: string
          reviewed_by: string | null
          updated_at: string | null
        }
        Insert: {
          compliance_status?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          last_review_date?: string | null
          next_review_date?: string | null
          notes?: string | null
          policy_id: string
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Update: {
          compliance_status?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          last_review_date?: string | null
          next_review_date?: string | null
          notes?: string | null
          policy_id?: string
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_compliance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_compliance_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "company_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          category: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          name: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          category?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_assignments: {
        Row: {
          actual_hours: number | null
          allocation_percent: number | null
          client_id: string | null
          created_at: string | null
          employee_id: string
          end_date: string | null
          estimated_hours: number | null
          id: string
          opportunity_id: string | null
          role: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          allocation_percent?: number | null
          client_id?: string | null
          created_at?: string | null
          employee_id: string
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          opportunity_id?: string | null
          role?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          allocation_percent?: number | null
          client_id?: string | null
          created_at?: string | null
          employee_id?: string
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          opportunity_id?: string | null
          role?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      project_costs: {
        Row: {
          actual_cost: number | null
          client_id: string
          cost_type: string | null
          created_at: string | null
          description: string
          employee_id: string | null
          estimated_cost: number | null
          id: string
          incurred_date: string | null
          opportunity_id: string | null
        }
        Insert: {
          actual_cost?: number | null
          client_id: string
          cost_type?: string | null
          created_at?: string | null
          description: string
          employee_id?: string | null
          estimated_cost?: number | null
          id?: string
          incurred_date?: string | null
          opportunity_id?: string | null
        }
        Update: {
          actual_cost?: number | null
          client_id?: string
          cost_type?: string | null
          created_at?: string | null
          description?: string
          employee_id?: string | null
          estimated_cost?: number | null
          id?: string
          incurred_date?: string | null
          opportunity_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_costs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_costs_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
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
          salesman_id: string | null
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
          salesman_id?: string | null
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
          salesman_id?: string | null
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
          {
            foreignKeyName: "quotes_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "salesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          is_completed: boolean | null
          priority: string | null
          related_client_id: string | null
          related_salesman_id: string | null
          reminder_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          related_client_id?: string | null
          related_salesman_id?: string | null
          reminder_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          is_completed?: boolean | null
          priority?: string | null
          related_client_id?: string | null
          related_salesman_id?: string | null
          reminder_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_related_client_id_fkey"
            columns: ["related_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_related_salesman_id_fkey"
            columns: ["related_salesman_id"]
            isOneToOne: false
            referencedRelation: "salesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_schedule: {
        Row: {
          amount: number
          client_id: string
          client_product_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          recognition_date: string
          status: string | null
        }
        Insert: {
          amount: number
          client_id: string
          client_product_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          recognition_date: string
          status?: string | null
        }
        Update: {
          amount?: number
          client_id?: string
          client_product_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          recognition_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_schedule_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_schedule_client_product_id_fkey"
            columns: ["client_product_id"]
            isOneToOne: false
            referencedRelation: "client_products"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          end_date: string | null
          id: string
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_performance: {
        Row: {
          conversion_rate: number | null
          created_at: string
          deals_closed: number | null
          id: string
          leads_contacted: number | null
          meetings_held: number | null
          notes: string | null
          period_end: string
          period_start: string
          proposals_sent: number | null
          revenue_generated: number | null
          salesman_id: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          deals_closed?: number | null
          id?: string
          leads_contacted?: number | null
          meetings_held?: number | null
          notes?: string | null
          period_end: string
          period_start: string
          proposals_sent?: number | null
          revenue_generated?: number | null
          salesman_id: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          deals_closed?: number | null
          id?: string
          leads_contacted?: number | null
          meetings_held?: number | null
          notes?: string | null
          period_end?: string
          period_start?: string
          proposals_sent?: number | null
          revenue_generated?: number | null
          salesman_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_performance_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "salesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      salesman_documents: {
        Row: {
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          salesman_id: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          salesman_id: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          salesman_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salesman_documents_salesman_id_fkey"
            columns: ["salesman_id"]
            isOneToOne: false
            referencedRelation: "salesmen"
            referencedColumns: ["id"]
          },
        ]
      }
      salesmen: {
        Row: {
          approval_status: string | null
          avatar_url: string | null
          commission_rate: number | null
          contract_type: string | null
          created_at: string
          email: string | null
          employee_id: string | null
          hire_date: string | null
          id: string
          name: string
          phone: string | null
          rejection_reason: string | null
          social_number: string | null
          status: string | null
          target_annual: number | null
          target_monthly: number | null
          target_quarterly: number | null
          territory: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          avatar_url?: string | null
          commission_rate?: number | null
          contract_type?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          name: string
          phone?: string | null
          rejection_reason?: string | null
          social_number?: string | null
          status?: string | null
          target_annual?: number | null
          target_monthly?: number | null
          target_quarterly?: number | null
          territory?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          avatar_url?: string | null
          commission_rate?: number | null
          contract_type?: string | null
          created_at?: string
          email?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          name?: string
          phone?: string | null
          rejection_reason?: string | null
          social_number?: string | null
          status?: string | null
          target_annual?: number | null
          target_monthly?: number | null
          target_quarterly?: number | null
          territory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salesmen_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_agreements: {
        Row: {
          client_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          measurement_period: string | null
          metric_type: string
          name: string
          target_value: number
          unit: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          measurement_period?: string | null
          metric_type: string
          name: string
          target_value: number
          unit?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          measurement_period?: string | null
          metric_type?: string
          name?: string
          target_value?: number
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_agreements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_performance: {
        Row: {
          actual_value: number
          created_at: string | null
          id: string
          notes: string | null
          period_end: string
          period_start: string
          sla_id: string
          target_met: boolean | null
        }
        Insert: {
          actual_value: number
          created_at?: string | null
          id?: string
          notes?: string | null
          period_end: string
          period_start: string
          sla_id: string
          target_met?: boolean | null
        }
        Update: {
          actual_value?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          period_end?: string
          period_start?: string
          sla_id?: string
          target_met?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_performance_sla_id_fkey"
            columns: ["sla_id"]
            isOneToOne: false
            referencedRelation: "sla_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      strategic_goals: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          end_date: string | null
          id: string
          owner_employee_id: string | null
          scope: string
          start_date: string | null
          status: string | null
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          owner_employee_id?: string | null
          scope: string
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          owner_employee_id?: string | null
          scope?: string
          start_date?: string | null
          status?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategic_goals_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_goals_owner_employee_id_fkey"
            columns: ["owner_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategic_goals_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      support_agents: {
        Row: {
          avatar_url: string | null
          avg_resolution_time: number | null
          created_at: string | null
          current_tickets: number | null
          email: string | null
          id: string
          max_tickets: number | null
          name: string
          performance_score: number | null
          phone: string | null
          specialization: string | null
          status: string | null
          total_resolved: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          avg_resolution_time?: number | null
          created_at?: string | null
          current_tickets?: number | null
          email?: string | null
          id?: string
          max_tickets?: number | null
          name: string
          performance_score?: number | null
          phone?: string | null
          specialization?: string | null
          status?: string | null
          total_resolved?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          avg_resolution_time?: number | null
          created_at?: string | null
          current_tickets?: number | null
          email?: string | null
          id?: string
          max_tickets?: number | null
          name?: string
          performance_score?: number | null
          phone?: string | null
          specialization?: string | null
          status?: string | null
          total_resolved?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      support_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          value: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          value: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          client_id: string
          closed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          resolution: string | null
          resolution_time_hours: number | null
          resolved_at: string | null
          satisfaction_feedback: string | null
          satisfaction_rating: number | null
          status: string | null
          support_agent_id: string | null
          support_stage: string | null
          ticket_number: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          client_id: string
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          resolution?: string | null
          resolution_time_hours?: number | null
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          support_agent_id?: string | null
          support_stage?: string | null
          ticket_number?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          client_id?: string
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          resolution?: string | null
          resolution_time_hours?: number | null
          resolved_at?: string | null
          satisfaction_feedback?: string | null
          satisfaction_rating?: number | null
          status?: string | null
          support_agent_id?: string | null
          support_stage?: string | null
          ticket_number?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_support_agent_id_fkey"
            columns: ["support_agent_id"]
            isOneToOne: false
            referencedRelation: "support_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          sort_order: number | null
          value: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number | null
          value: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          blocked_by: string[] | null
          blocks: string[] | null
          category: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_task_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          blocked_by?: string[] | null
          blocks?: string[] | null
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          blocked_by?: string[] | null
          blocks?: string[] | null
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_task_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          id: string
          lead_id: string | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          lead_id?: string | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_invitations: {
        Row: {
          accepted: boolean | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          accepted?: boolean | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          accepted?: boolean | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      win_loss_reasons: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          reason: string
          reason_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          reason: string
          reason_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string
          reason_type?: string
        }
        Relationships: []
      }
      workflow_logs: {
        Row: {
          action_result: Json | null
          action_taken: string
          created_at: string | null
          error_message: string | null
          id: string
          status: string | null
          trigger_data: Json | null
          trigger_event: string
          workflow_rule_id: string | null
        }
        Insert: {
          action_result?: Json | null
          action_taken: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
          trigger_data?: Json | null
          trigger_event: string
          workflow_rule_id?: string | null
        }
        Update: {
          action_result?: Json | null
          action_taken?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string | null
          trigger_data?: Json | null
          trigger_event?: string
          workflow_rule_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_logs_workflow_rule_id_fkey"
            columns: ["workflow_rule_id"]
            isOneToOne: false
            referencedRelation: "workflow_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_role_level: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_level: {
        Args: {
          _min_role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "ceo"
        | "department_head"
        | "team_lead"
        | "employee"
      call_type: "incoming" | "outgoing"
      client_status: "prospect" | "active" | "inactive" | "former"
      communication_type:
        | "call"
        | "email"
        | "meeting"
        | "video_call"
        | "sms"
        | "chat"
        | "letter"
      cxo_ai_job_status: "pending" | "processing" | "completed" | "failed"
      cxo_ai_job_type:
        | "summary"
        | "sentiment"
        | "suggestion"
        | "classification"
        | "translation"
      cxo_channel_type:
        | "voice"
        | "sms"
        | "whatsapp"
        | "email"
        | "webchat"
        | "other"
      cxo_check_status: "success" | "failure"
      cxo_connector_type:
        | "ringcentral"
        | "twilio"
        | "zoom_phone"
        | "ms_teams_phone"
        | "generic_voice"
        | "sms_provider"
        | "whatsapp_provider"
        | "email_provider"
        | "webchat_provider"
      cxo_conversation_status: "open" | "pending" | "resolved" | "closed"
      cxo_event_type:
        | "voice_call_started"
        | "voice_call_ended"
        | "voice_recording_available"
        | "sms_inbound"
        | "sms_outbound"
        | "email_inbound"
        | "email_outbound"
        | "chat_message_inbound"
        | "chat_message_outbound"
        | "note_added"
        | "status_changed"
        | "tag_added"
        | "ai_summary_ready"
        | "ai_sentiment_analysis"
      cxo_health_check_type:
        | "api_ping"
        | "test_sms"
        | "test_call_metadata"
        | "webhook_latency"
      cxo_health_status: "healthy" | "degraded" | "down" | "unknown"
      cxo_priority: "low" | "normal" | "high" | "urgent"
      cxo_routing_strategy: "round_robin" | "least_busy" | "skill_based"
      cxo_tenant_status: "active" | "suspended" | "closed"
      cxo_ticket_severity: "low" | "medium" | "high" | "critical"
      cxo_ticket_status:
        | "open"
        | "investigating"
        | "waiting_for_customer"
        | "resolved"
        | "closed"
      cxo_ticket_type:
        | "bug"
        | "incident"
        | "billing_question"
        | "feature_request"
      cxo_user_role: "agent" | "supervisor" | "admin" | "billing_owner"
      cxo_user_status: "active" | "invited" | "disabled"
      cxo_workflow_status: "draft" | "published" | "archived"
      cxo_workflow_trigger:
        | "inbound_voice"
        | "inbound_sms"
        | "inbound_email"
        | "inbound_webchat"
        | "outbound_event"
        | "scheduled"
      event_type: "meeting" | "call" | "follow_up" | "task"
      lead_source:
        | "marketing_campaign"
        | "referral"
        | "inbound"
        | "outbound"
        | "trade_show"
        | "website"
        | "social_media"
        | "partner"
        | "other"
      quote_status: "draft" | "sent" | "accepted" | "rejected"
      sales_stage:
        | "pre_sales"
        | "negotiation"
        | "closing"
        | "post_sales"
        | "support"
      task_priority: "low" | "medium" | "high" | "critical"
      task_status: "todo" | "in_progress" | "review" | "done" | "blocked"
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
      app_role: [
        "super_admin",
        "ceo",
        "department_head",
        "team_lead",
        "employee",
      ],
      call_type: ["incoming", "outgoing"],
      client_status: ["prospect", "active", "inactive", "former"],
      communication_type: [
        "call",
        "email",
        "meeting",
        "video_call",
        "sms",
        "chat",
        "letter",
      ],
      cxo_ai_job_status: ["pending", "processing", "completed", "failed"],
      cxo_ai_job_type: [
        "summary",
        "sentiment",
        "suggestion",
        "classification",
        "translation",
      ],
      cxo_channel_type: [
        "voice",
        "sms",
        "whatsapp",
        "email",
        "webchat",
        "other",
      ],
      cxo_check_status: ["success", "failure"],
      cxo_connector_type: [
        "ringcentral",
        "twilio",
        "zoom_phone",
        "ms_teams_phone",
        "generic_voice",
        "sms_provider",
        "whatsapp_provider",
        "email_provider",
        "webchat_provider",
      ],
      cxo_conversation_status: ["open", "pending", "resolved", "closed"],
      cxo_event_type: [
        "voice_call_started",
        "voice_call_ended",
        "voice_recording_available",
        "sms_inbound",
        "sms_outbound",
        "email_inbound",
        "email_outbound",
        "chat_message_inbound",
        "chat_message_outbound",
        "note_added",
        "status_changed",
        "tag_added",
        "ai_summary_ready",
        "ai_sentiment_analysis",
      ],
      cxo_health_check_type: [
        "api_ping",
        "test_sms",
        "test_call_metadata",
        "webhook_latency",
      ],
      cxo_health_status: ["healthy", "degraded", "down", "unknown"],
      cxo_priority: ["low", "normal", "high", "urgent"],
      cxo_routing_strategy: ["round_robin", "least_busy", "skill_based"],
      cxo_tenant_status: ["active", "suspended", "closed"],
      cxo_ticket_severity: ["low", "medium", "high", "critical"],
      cxo_ticket_status: [
        "open",
        "investigating",
        "waiting_for_customer",
        "resolved",
        "closed",
      ],
      cxo_ticket_type: [
        "bug",
        "incident",
        "billing_question",
        "feature_request",
      ],
      cxo_user_role: ["agent", "supervisor", "admin", "billing_owner"],
      cxo_user_status: ["active", "invited", "disabled"],
      cxo_workflow_status: ["draft", "published", "archived"],
      cxo_workflow_trigger: [
        "inbound_voice",
        "inbound_sms",
        "inbound_email",
        "inbound_webchat",
        "outbound_event",
        "scheduled",
      ],
      event_type: ["meeting", "call", "follow_up", "task"],
      lead_source: [
        "marketing_campaign",
        "referral",
        "inbound",
        "outbound",
        "trade_show",
        "website",
        "social_media",
        "partner",
        "other",
      ],
      quote_status: ["draft", "sent", "accepted", "rejected"],
      sales_stage: [
        "pre_sales",
        "negotiation",
        "closing",
        "post_sales",
        "support",
      ],
      task_priority: ["low", "medium", "high", "critical"],
      task_status: ["todo", "in_progress", "review", "done", "blocked"],
    },
  },
} as const
