import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// POST /api/notifications/subscribe - Create a notification subscription
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { email, webhook_url, min_usd_value = 100000, blockchains, event_types } = body

    // Validate input
    if (!email && !webhook_url) {
      return NextResponse.json({ success: false, error: "Either email or webhook_url is required" }, { status: 400 })
    }

    // Insert subscription
    const result = await sql`
      INSERT INTO notification_subscriptions (
        email, webhook_url, min_usd_value, blockchains, event_types
      ) VALUES (
        ${email || null},
        ${webhook_url || null},
        ${min_usd_value},
        ${blockchains || null},
        ${event_types || null}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "Subscription created successfully",
    })
  } catch (error) {
    console.error("[v0] Error creating subscription:", error)
    return NextResponse.json({ success: false, error: "Failed to create subscription" }, { status: 500 })
  }
}

// GET /api/notifications/subscribe - List all subscriptions
export async function GET() {
  try {
    const subscriptions = await sql`
      SELECT * FROM notification_subscriptions
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      data: subscriptions,
    })
  } catch (error) {
    console.error("[v0] Error fetching subscriptions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}
