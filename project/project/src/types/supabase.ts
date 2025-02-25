export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'user' | 'doctor'
          created_at: string
        }
        Insert: {
          id: string
          role?: 'admin' | 'user' | 'doctor'
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'admin' | 'user' | 'doctor'
          created_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          specialization: string
          experience: number
          fee: number
          phone: string
          address: string
          status: 'pending' | 'approved' | 'blocked'
          timings: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          specialization: string
          experience: number
          fee: number
          phone: string
          address: string
          status?: 'pending' | 'approved' | 'blocked'
          timings: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          specialization?: string
          experience?: number
          fee?: number
          phone?: string
          address?: string
          status?: 'pending' | 'approved' | 'blocked'
          timings?: string[]
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          user_id: string
          doctor_id: string
          date: string
          time: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          doctor_id: string
          date: string
          time: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          doctor_id?: string
          date?: string
          time?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          seen: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          seen?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          seen?: boolean
          created_at?: string
        }
      }
    }
  }
}