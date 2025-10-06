import { sql } from "@/lib/db"
import type { WhaleEvent } from "@/lib/db"

interface NotificationPayload {
  event: WhaleEvent
  message: string
}

export class NotificationService {
  // Send webhook notification
  async sendWebhook(webhookUrl: string, payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "WhaleTracker/1.0",
        },
        body: JSON.stringify({
          type: "whale_event",
          timestamp: new Date().toISOString(),
          event: {
            id: payload.event.id,
            type: payload.event.event_type,
            blockchain: payload.event.blockchain,
            transaction_hash: payload.event.transaction_hash,
            usd_value: payload.event.usd_value,
            token_symbol: payload.event.token_symbol,
            from_address: payload.event.from_address,
            to_address: payload.event.to_address,
            timestamp: payload.event.timestamp,
          },
          message: payload.message,
        }),
      })

      if (!response.ok) {
        console.error(`[v0] Webhook failed: ${response.status} ${response.statusText}`)
        return false
      }

      console.log(`[v0] Webhook sent successfully to ${webhookUrl}`)
      return true
    } catch (error) {
      console.error("[v0] Error sending webhook:", error)
      return false
    }
  }

  // Send email notification (placeholder - would integrate with email service)
  async sendEmail(email: string, payload: NotificationPayload): Promise<boolean> {
    try {
      // In production, integrate with services like:
      // - Resend
      // - SendGrid
      // - AWS SES
      // - Postmark

      console.log(`[v0] Email notification would be sent to ${email}`)
      console.log(`[v0] Subject: Whale Alert - ${payload.event.blockchain.toUpperCase()}`)
      console.log(`[v0] Message: ${payload.message}`)

      // Simulate email sending
      return true
    } catch (error) {
      console.error("[v0] Error sending email:", error)
      return false
    }
  }

  // Process notifications for a whale event
  async processEventNotifications(event: WhaleEvent): Promise<void> {
    try {
      // Get active subscriptions that match this event
      const subscriptions = await sql`
        SELECT * FROM notification_subscriptions
        WHERE active = true
        AND min_usd_value <= ${event.usd_value}
        AND (
          blockchains IS NULL 
          OR ${event.blockchain} = ANY(blockchains)
        )
        AND (
          event_types IS NULL 
          OR ${event.event_type} = ANY(event_types)
        )
      `

      if (subscriptions.length === 0) {
        console.log(`[v0] No matching subscriptions for event ${event.id}`)
        return
      }

      // Create notification message
      const message = this.formatEventMessage(event)
      const payload: NotificationPayload = { event, message }

      // Send notifications to all matching subscriptions
      const notificationPromises = subscriptions.map(async (sub) => {
        if (sub.webhook_url) {
          await this.sendWebhook(sub.webhook_url, payload)
        }
        if (sub.email) {
          await this.sendEmail(sub.email, payload)
        }
      })

      await Promise.all(notificationPromises)

      // Mark event as notified
      await sql`
        UPDATE whale_events 
        SET notification_sent = true, notification_sent_at = NOW()
        WHERE id = ${event.id}
      `

      console.log(`[v0] Sent ${subscriptions.length} notifications for event ${event.id}`)
    } catch (error) {
      console.error("[v0] Error processing notifications:", error)
    }
  }

  // Format event into human-readable message
  private formatEventMessage(event: WhaleEvent): string {
    const usdFormatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(event.usd_value)

    const eventTypeMap: Record<string, string> = {
      whale_transfer: "Whale Transfer",
      liquidity_add: "Liquidity Added",
      liquidity_remove: "Liquidity Removed",
      large_swap: "Large Swap",
    }

    const eventTypeName = eventTypeMap[event.event_type] || event.event_type

    let message = `🐋 ${eventTypeName} detected on ${event.blockchain.toUpperCase()}\n`
    message += `💰 Value: ${usdFormatted}\n`

    if (event.token_symbol) {
      message += `🪙 Token: ${event.token_symbol}\n`
    }

    if (event.from_address) {
      message += `📤 From: ${event.from_address.slice(0, 10)}...${event.from_address.slice(-8)}\n`
    }

    if (event.to_address) {
      message += `📥 To: ${event.to_address.slice(0, 10)}...${event.to_address.slice(-8)}\n`
    }

    message += `🔗 TX: ${event.transaction_hash}`

    return message
  }

  // Background job to check for events needing notifications
  async checkPendingNotifications(): Promise<void> {
    try {
      // Get events that haven't been notified yet
      const pendingEvents = await sql`
        SELECT * FROM whale_events
        WHERE notification_sent = false
        AND timestamp >= NOW() - INTERVAL '1 hour'
        ORDER BY timestamp DESC
        LIMIT 100
      `

      console.log(`[v0] Found ${pendingEvents.length} pending notifications`)

      for (const event of pendingEvents) {
        await this.processEventNotifications(event as WhaleEvent)
      }
    } catch (error) {
      console.error("[v0] Error checking pending notifications:", error)
    }
  }
}

// Singleton instance
let notificationService: NotificationService | null = null

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService()
  }
  return notificationService
}

// Start background notification checker
export function startNotificationWorker() {
  const service = getNotificationService()

  // Check every 30 seconds
  setInterval(() => {
    service.checkPendingNotifications()
  }, 30 * 1000)

  console.log("[v0] Notification worker started")
}
