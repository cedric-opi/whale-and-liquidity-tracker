import { NextResponse } from "next/server"
import { getIngestionManager } from "@/lib/blockchain/ingestion-manager"

// API endpoint to stop the ingestion system
export async function POST() {
  try {
    const manager = getIngestionManager()
    manager.stopAll()

    return NextResponse.json({
      success: true,
      message: "Blockchain ingestion stopped for all chains",
    })
  } catch (error) {
    console.error("[v0] Error stopping ingestion:", error)
    return NextResponse.json({ success: false, error: "Failed to stop ingestion" }, { status: 500 })
  }
}
