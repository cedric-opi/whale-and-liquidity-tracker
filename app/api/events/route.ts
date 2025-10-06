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

    // Build dynamic WHERE conditions using tagged templates
    let whereConditions = sql`1=1`

    if (blockchain) {
      whereConditions = sql`${whereConditions} AND blockchain = ${blockchain}`
    }

    if (eventType) {
      whereConditions = sql`${whereConditions} AND event_type = ${eventType}`
    }

    if (minUsdValue) {
      whereConditions = sql`${whereConditions} AND usd_value >= ${Number.parseFloat(minUsdValue)}`
    }

    if (maxUsdValue) {
      whereConditions = sql`${whereConditions} AND usd_value <= ${Number.parseFloat(maxUsdValue)}`
    }

    if (startDate) {
      whereConditions = sql`${whereConditions} AND timestamp >= ${startDate}`
    }

    if (endDate) {
      whereConditions = sql`${whereConditions} AND timestamp <= ${endDate}`
    }

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as count 
      FROM whale_events 
      WHERE ${whereConditions}
    `
    const totalCount = Number.parseInt(countResult[0].count)

    // Get paginated results
    const events = await sql`
      SELECT 
        id, event_type, blockchain, transaction_hash, block_number, timestamp,
        from_address, to_address, contract_address, token_symbol, token_address,
        amount_raw, amount_decimal, usd_value, protocol, metadata,
        notification_sent, created_at
      FROM whale_events 
      WHERE ${whereConditions}
      ORDER BY timestamp DESC
      LIMIT ${limit} OFFSET ${offset}
    `

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
