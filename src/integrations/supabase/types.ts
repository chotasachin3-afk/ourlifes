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
      bingo: {
        Row: {
          created_at: string
          done: boolean
          id: string
          label: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          label: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          label?: string
        }
        Relationships: []
      }
      doodle_strokes: {
        Row: {
          color: string
          created_at: string
          id: string
          points: Json
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          points: Json
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          points?: Json
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string | null
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          sender: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          sender?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          sender?: string
        }
        Relationships: []
      }
      moods: {
        Row: {
          created_at: string
          emoji: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      music: {
        Row: {
          created_at: string
          id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          url?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          author: string | null
          body: string
          created_at: string
          id: string
        }
        Insert: {
          author?: string | null
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          author?: string | null
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          url?: string
        }
        Relationships: []
      }
      quiz: {
        Row: {
          answer: string
          created_at: string
          id: string
          options: string[]
          question: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          options?: string[]
          question: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          options?: string[]
          question?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          birthday_date: string | null
          birthday_letter: string | null
          id: string
          names: string
          photo_url: string | null
          pin: string
          start_date: string
          updated_at: string
        }
        Insert: {
          birthday_date?: string | null
          birthday_letter?: string | null
          id?: string
          names?: string
          photo_url?: string | null
          pin?: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          birthday_date?: string | null
          birthday_letter?: string | null
          id?: string
          names?: string
          photo_url?: string | null
          pin?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      tictactoe: {
        Row: {
          board: string[]
          id: string
          turn: string
          updated_at: string
        }
        Insert: {
          board?: string[]
          id?: string
          turn?: string
          updated_at?: string
        }
        Update: {
          board?: string[]
          id?: string
          turn?: string
          updated_at?: string
        }
        Relationships: []
      }
      truth_or_dare: {
        Row: {
          created_at: string
          id: string
          kind: string
          prompt: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          prompt: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          prompt?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
