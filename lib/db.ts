import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Create a singleton SQL client
export const sql = neon(process.env.DATABASE_URL)

// Types for our database models
export interface WhaleEvent {
  id: number
  event_type: "whale_transfer" | "liquidity_add" | "liquidity_remove" | "large_swap"
  blockchain: string
  transaction_hash: string
  block_number: number
  timestamp: Date
  from_address?: string
  to_address?: string
  contract_address?: string
  token_symbol?: string
  token_address?: string
  amount_raw?: string
  amount_decimal?: number
  usd_value: number
  protocol?: string
  metadata?: Record<string, any>
  notification_sent: boolean
  notification_sent_at?: Date
  created_at: Date
  updated_at: Date
}

export interface NotificationSubscription {
  id: number
  email?: string
  webhook_url?: string
  min_usd_value: number
  blockchains?: string[]
  event_types?: string[]
  active: boolean
  created_at: Date
  updated_at: Date
}
