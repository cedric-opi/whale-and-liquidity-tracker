// Client-side API helper functions
export interface WhaleEvent {
  id: number
  event_type: string
  blockchain: string
  transaction_hash: string
  block_number: number
  timestamp: string
  from_address?: string
  to_address?: string
  token_symbol?: string
  usd_value: number
  protocol?: string
}

export interface EventsResponse {
  success: boolean
  data: WhaleEvent[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface StatsResponse {
  success: boolean
  timeframe: string
  data: {
    overall: {
      total_events: number
      total_volume_usd: number
      avg_transaction_usd: number
      largest_transaction_usd: number
    }
    byBlockchain: Array<{
      blockchain: string
      event_count: number
      total_volume_usd: number
    }>
    byEventType: Array<{
      event_type: string
      event_count: number
      total_volume_usd: number
    }>
    topTokens: Array<{
      token_symbol: string
      blockchain: string
      transaction_count: number
      total_volume_usd: number
    }>
    recentLargeTransactions: WhaleEvent[]
  }
}

export async function fetchEvents(params?: {
  page?: number
  limit?: number
  blockchain?: string
  event_type?: string
  min_usd_value?: number
}): Promise<EventsResponse> {
  const searchParams = new URLSearchParams()

  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.limit) searchParams.set("limit", params.limit.toString())
  if (params?.blockchain) searchParams.set("blockchain", params.blockchain)
  if (params?.event_type) searchParams.set("event_type", params.event_type)
  if (params?.min_usd_value) searchParams.set("min_usd_value", params.min_usd_value.toString())

  const response = await fetch(`/api/events?${searchParams.toString()}`)
  return response.json()
}

export async function fetchStats(timeframe = "24h"): Promise<StatsResponse> {
  const response = await fetch(`/api/stats?timeframe=${timeframe}`)
  return response.json()
}

export async function fetchEventById(id: number): Promise<{ success: boolean; data: WhaleEvent }> {
  const response = await fetch(`/api/events/${id}`)
  return response.json()
}
