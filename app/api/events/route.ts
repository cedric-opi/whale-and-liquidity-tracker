import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/events - Fetch whale events with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "50"), 100) // Max 100 per page
    const offset = (page - 1) * limit

    const blockchain = searchParams.get("blockchain")
    const eventType = searchParams.get("event_type")
    const minUsdValue = searchParams.get("min_usd_value")
    const maxUsdValue = searchParams.get("max_usd_value")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    // Build dynamic WHERE clause
    const conditions: string[] = ["1=1"]
    const params: any[] = []

    if (blockchain) {
      conditions.push(`blockchain = $${params.length + 1}`)
      params.push(blockchain)
    }

    if (eventType) {
      conditions.push(`event_type = $${params.length + 1}`)
      params.push(eventType)
    }

    if (minUsdValue) {
      conditions.push(`usd_value >= $${params.length + 1}`)
      params.push(Number.parseFloat(minUsdValue))
    }

    if (maxUsdValue) {
      conditions.push(`usd_value <= $${params.length + 1}`)
      params.push(Number.parseFloat(maxUsdValue))
    }

    if (startDate) {
      conditions.push(`timestamp >= $${params.length + 1}`)
      params.push(startDate)
    }

    if (endDate) {
      conditions.push(`timestamp <= $${params.length + 1}`)
      params.push(endDate)
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM whale_events WHERE ${conditions.join(" AND ")}`
    const countResult = await sql(countQuery, params)
    const totalCount = Number.parseInt(countResult[0].count)

    // Get paginated results
    const dataQuery = `
      SELECT 
        id, event_type, blockchain, transaction_hash, block_number, timestamp,
        from_address, to_address, contract_address, token_symbol, token_address,
        amount_raw, amount_decimal, usd_value, protocol, metadata,
        notification_sent, created_at
      FROM whale_events 
      WHERE ${conditions.join(" AND ")}
      ORDER BY timestamp DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `

    const events = await sql(dataQuery, [...params, limit, offset])

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching events:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch events" }, { status: 500 })
  }
}
