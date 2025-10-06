import { NextResponse } from "next/server"
import { getNotificationService } from "@/lib/notification-service"

// POST /api/notifications/test - Test notification system
export async function POST() {
  try {
    const service = getNotificationService()

    // Create a test event
    const testEvent = {
      id: 0,
      event_type: "whale_transfer" as const,
      blockchain: "ethereum",
      transaction_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      block_number: 12345678,
      timestamp: new Date(),
      from_address: "0xabcdef1234567890abcdef1234567890abcdef12",
      to_address: "0x1234567890abcdef1234567890abcdef12345678",
      token_symbol: "USDT",
      token_address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      amount_raw: "500000000000",
      amount_decimal: 500000,
      usd_value: 500000,
      protocol: null,
      metadata: null,
      notification_sent: false,
      notification_sent_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    }

    await service.processEventNotifications(testEvent)

    return NextResponse.json({
      success: true,
      message: "Test notifications sent",
    })
  } catch (error) {
    console.error("[v0] Error sending test notification:", error)
    return NextResponse.json({ success: false, error: "Failed to send test notification" }, { status: 500 })
  }
}
