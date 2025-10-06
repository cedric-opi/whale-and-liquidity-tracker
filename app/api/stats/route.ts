import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET /api/stats - Get aggregated statistics about whale events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const timeframe = searchParams.get("timeframe") || "24h" // 24h, 7d, 30d, all

    // Calculate time filter using tagged templates
    let timeCondition
    switch (timeframe) {
      case "24h":
        timeCondition = sql`timestamp >= NOW() - INTERVAL '24 hours'`
        break
      case "7d":
        timeCondition = sql`timestamp >= NOW() - INTERVAL '7 days'`
        break
      case "30d":
        timeCondition = sql`timestamp >= NOW() - INTERVAL '30 days'`
        break
      default:
        timeCondition = sql`1=1`
    }

    // Get overall statistics
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_events,
        SUM(usd_value) as total_volume_usd,
        AVG(usd_value) as avg_transaction_usd,
        MAX(usd_value) as largest_transaction_usd,
        MIN(timestamp) as first_event,
        MAX(timestamp) as latest_event
      FROM whale_events
      WHERE ${timeCondition}
    `

    // Get statistics by blockchain
    const blockchainStats = await sql`
      SELECT 
        blockchain,
        COUNT(*) as event_count,
        SUM(usd_value) as total_volume_usd,
        AVG(usd_value) as avg_transaction_usd
      FROM whale_events
      WHERE ${timeCondition}
      GROUP BY blockchain
      ORDER BY total_volume_usd DESC
    `

    // Get statistics by event type
    const eventTypeStats = await sql`
      SELECT 
        event_type,
        COUNT(*) as event_count,
        SUM(usd_value) as total_volume_usd,
        AVG(usd_value) as avg_transaction_usd
      FROM whale_events
      WHERE ${timeCondition}
      GROUP BY event_type
      ORDER BY total_volume_usd DESC
    `

    // Get top tokens by volume
    const topTokens = await sql`
      SELECT 
        token_symbol,
        token_address,
        blockchain,
        COUNT(*) as transaction_count,
        SUM(usd_value) as total_volume_usd
      FROM whale_events
      WHERE ${timeCondition} AND token_symbol IS NOT NULL
      GROUP BY token_symbol, token_address, blockchain
      ORDER BY total_volume_usd DESC
      LIMIT 10
    `

    // Get recent large transactions
    const recentLarge = await sql`
      SELECT 
        id, event_type, blockchain, transaction_hash, 
        token_symbol, usd_value, timestamp
      FROM whale_events
      WHERE ${timeCondition}
      ORDER BY usd_value DESC
      LIMIT 10
    `

    return NextResponse.json({
      success: true,
      timeframe,
      data: {
        overall: overallStats[0],
        byBlockchain: blockchainStats,
        byEventType: eventTypeStats,
        topTokens,
        recentLargeTransactions: recentLarge,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch statistics" }, { status: 500 })
  }
}
