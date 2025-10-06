import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/events/:id - Fetch a single whale event by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = Number.parseInt(params.id)

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ success: false, error: "Invalid event ID" }, { status: 400 })
    }

    const events = await sql`
      SELECT 
        id, event_type, blockchain, transaction_hash, block_number, timestamp,
        from_address, to_address, contract_address, token_symbol, token_address,
        amount_raw, amount_decimal, usd_value, protocol, metadata,
        notification_sent, notification_sent_at, created_at, updated_at
      FROM whale_events 
      WHERE id = ${eventId}
    `

    if (events.length === 0) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: events[0],
    })
  } catch (error) {
    console.error("[v0] Error fetching event:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch event" }, { status: 500 })
  }
}
