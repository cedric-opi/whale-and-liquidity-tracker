import { NextResponse } from "next/server"
import { getIngestionManager } from "@/lib/blockchain/ingestion-manager"

// API endpoint to start the ingestion system
export async function POST() {
  try {
    const manager = getIngestionManager()
    manager.startAll()

    return NextResponse.json({
      success: true,
      message: "Blockchain ingestion started for all chains",
    })
  } catch (error) {
    console.error("[v0] Error starting ingestion:", error)
    return NextResponse.json({ success: false, error: "Failed to start ingestion" }, { status: 500 })
  }
}
