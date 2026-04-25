export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PaymentStatus = 'paid' | 'due' | 'late' | 'partial' | 'waived'
export type MaintenancePriority = 'low' | 'medium' | 'urgent' | 'emergency'
export type MaintenanceStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'
export type SubscriptionTier = 'starter' | 'growth' | 'pro' | 'enterprise'
export type PaymentMethod = 'ecocash' | 'payfast' | 'card' | 'cash' | 'bank_transfer'
export type MessageRole = 'user' | 'assistant'
export type ConversationChannel = 'whatsapp' | 'web'

export interface Database {
  public: {
    Tables: {
      landlords: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          email: string
          country: 'ZW' | 'ZA' | string
          subscription_tier: SubscriptionTier
          stripe_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['landlords']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['landlords']['Insert']>
      }
      properties: {
        Row: {
          id: string
          landlord_id: string
          name: string
          address: string
          city: string
          country: 'ZW' | 'ZA' | string
          total_units: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['properties']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['properties']['Insert']>
      }
      units: {
        Row: {
          id: string
          property_id: string
          unit_number: string
          rent_amount: number
          currency: 'USD' | 'ZAR'
          rent_due_day: number
          is_occupied: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['units']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['units']['Insert']>
      }
      tenants: {
        Row: {
          id: string
          user_id: string | null
          landlord_id: string
          unit_id: string
          full_name: string
          phone: string
          email: string | null
          whatsapp_id: string | null
          invite_token: string
          invite_accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      leases: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          start_date: string
          end_date: string | null
          monthly_rent: number
          currency: 'USD' | 'ZAR'
          deposit_amount: number
          document_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['leases']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['leases']['Insert']>
      }
      payments: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          landlord_id: string
          amount: number
          currency: 'USD' | 'ZAR'
          period_month: number
          period_year: number
          status: PaymentStatus
          method: PaymentMethod | null
          transaction_ref: string | null
          paid_at: string | null
          due_date: string
          rentora_fee: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      maintenance_requests: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          landlord_id: string
          title: string
          description: string
          priority: MaintenancePriority
          status: MaintenanceStatus
          photo_urls: string[]
          contractor_name: string | null
          contractor_phone: string | null
          assigned_at: string | null
          resolved_at: string | null
          ai_triage_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['maintenance_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['maintenance_requests']['Insert']>
      }
      ai_conversations: {
        Row: {
          id: string
          tenant_id: string
          landlord_id: string
          channel: ConversationChannel
          is_escalated: boolean
          escalated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_conversations']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['ai_conversations']['Insert']>
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: MessageRole
          content: string
          tool_calls: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['ai_messages']['Row'], 'id' | 'created_at'>
        Update: never
      }
      rent_reminders: {
        Row: {
          id: string
          payment_id: string
          tenant_id: string
          days_before: number
          sent_at: string
          channel: 'whatsapp' | 'email'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['rent_reminders']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
