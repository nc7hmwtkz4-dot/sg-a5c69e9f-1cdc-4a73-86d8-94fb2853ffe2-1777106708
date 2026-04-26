/* eslint-disable @typescript-eslint/no-empty-object-type */
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
      car_types: {
        Row: {
          base_ratio: number | null
          gap_max_min: number | null
          gap_reco_min: number | null
          id: number
          k_multiplier_avg: number | null
          k_observation_count: number | null
          name: string
        }
        Insert: {
          base_ratio?: number | null
          gap_max_min?: number | null
          gap_reco_min?: number | null
          id?: number
          k_multiplier_avg?: number | null
          k_observation_count?: number | null
          name: string
        }
        Update: {
          base_ratio?: number | null
          gap_max_min?: number | null
          gap_reco_min?: number | null
          id?: number
          k_multiplier_avg?: number | null
          k_observation_count?: number | null
          name?: string
        }
        Relationships: []
      }
      cars: {
        Row: {
          base_price_min: number | null
          base_reputation: number | null
          brand: string
          created_at: string | null
          id: number
          model: string
          type_id: number | null
        }
        Insert: {
          base_price_min?: number | null
          base_reputation?: number | null
          brand: string
          created_at?: string | null
          id?: number
          model: string
          type_id?: number | null
        }
        Update: {
          base_price_min?: number | null
          base_reputation?: number | null
          brand?: string
          created_at?: string | null
          id?: number
          model?: string
          type_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cars_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "car_types"
            referencedColumns: ["id"]
          },
        ]
      }
      observations: {
        Row: {
          car_id: number | null
          clutch_rarity: string | null
          created_at: string | null
          engine_rarity: string | null
          id: number
          price_min_total: number
          price_x2: number | null
          rep_total: number
          suspension1_rarity: string | null
          suspension2_rarity: string | null
          tires_rarity: string | null
          transmission_rarity: string | null
          turbo1_rarity: string | null
          turbo2_rarity: string | null
          user_id: number | null
        }
        Insert: {
          car_id?: number | null
          clutch_rarity?: string | null
          created_at?: string | null
          engine_rarity?: string | null
          id?: number
          price_min_total: number
          price_x2?: number | null
          rep_total: number
          suspension1_rarity?: string | null
          suspension2_rarity?: string | null
          tires_rarity?: string | null
          transmission_rarity?: string | null
          turbo1_rarity?: string | null
          turbo2_rarity?: string | null
          user_id?: number | null
        }
        Update: {
          car_id?: number | null
          clutch_rarity?: string | null
          created_at?: string | null
          engine_rarity?: string | null
          id?: number
          price_min_total?: number
          price_x2?: number | null
          rep_total?: number
          suspension1_rarity?: string | null
          suspension2_rarity?: string | null
          tires_rarity?: string | null
          transmission_rarity?: string | null
          turbo1_rarity?: string | null
          turbo2_rarity?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "observations_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      part_weights: {
        Row: {
          bonus_price_min_avg: number | null
          bonus_price_x2_avg: number | null
          bonus_reputation_avg: number | null
          observation_count: number | null
          rarity: string
          updated_at: string | null
        }
        Insert: {
          bonus_price_min_avg?: number | null
          bonus_price_x2_avg?: number | null
          bonus_reputation_avg?: number | null
          observation_count?: number | null
          rarity: string
          updated_at?: string | null
        }
        Update: {
          bonus_price_min_avg?: number | null
          bonus_price_x2_avg?: number | null
          bonus_reputation_avg?: number | null
          observation_count?: number | null
          rarity?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      part_weights_by_type: {
        Row: {
          bonus_price_min_avg: number | null
          bonus_price_x2_avg: number | null
          bonus_reputation_avg: number | null
          car_type_id: number
          created_at: string | null
          id: number
          observation_count: number | null
          part_rarity: string
          updated_at: string | null
        }
        Insert: {
          bonus_price_min_avg?: number | null
          bonus_price_x2_avg?: number | null
          bonus_reputation_avg?: number | null
          car_type_id: number
          created_at?: string | null
          id?: number
          observation_count?: number | null
          part_rarity: string
          updated_at?: string | null
        }
        Update: {
          bonus_price_min_avg?: number | null
          bonus_price_x2_avg?: number | null
          bonus_reputation_avg?: number | null
          car_type_id?: number
          created_at?: string | null
          id?: number
          observation_count?: number | null
          part_rarity?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_weights_by_type_car_type_id_fkey"
            columns: ["car_type_id"]
            isOneToOne: false
            referencedRelation: "car_types"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      trigger_daily_summary: { Args: never; Returns: undefined }
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
