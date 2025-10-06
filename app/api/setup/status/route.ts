import { NextResponse } from "next/server"
import { config } from "@/lib/config"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Check RPC endpoints
    const ethereum = !!config.rpcEndpoints.ethereum
    const bsc = !!config.rpcEndpoints.bsc
    const polygon = !!config.rpcEndpoints.polygon
    const solana = !!config.rpcEndpoints.solana

    // Check database connection
    let database = false
    try {
      await sql`SELECT 1`
      database = true
    } catch (error) {
      console.error("[v0] Database check failed:", error)
    }

    return NextResponse.json({
      ethereum,
      bsc,
      polygon,
      solana,
      database,
    })
  } catch (error) {
    console.error("[v0] Error checking setup status:", error)
    return NextResponse.json({ error: "Failed to check setup status" }, { status: 500 })
  }
}
