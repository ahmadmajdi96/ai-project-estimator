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
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
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
          salesman_id: string | null
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
          salesman_id?: string | null
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
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "ceo" | "department_head" | "team_lead" | "employee"
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
      app_role: ["ceo", "department_head", "team_lead", "employee"],
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
      task_priority: ["low", "medium", "high", "critical"],
      task_status: ["todo", "in_progress", "review", "done", "blocked"],
    },
  },
} as const
