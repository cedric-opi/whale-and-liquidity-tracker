"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlayCircle, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export function IngestionControls() {
  const [isScanning, setIsScanning] = useState(false)
  const [lastScan, setLastScan] = useState<{ success: boolean; eventsFound: number; timestamp: Date } | null>(null)

  const handleScan = async () => {
    setIsScanning(true)
    try {
      const response = await fetch("/api/ingestion/scan", {
        method: "POST",
      })

      const data = await response.json()

      setLastScan({
        success: data.success,
        eventsFound: data.eventsFound || 0,
        timestamp: new Date(),
      })

      // Trigger a page refresh to show new events
      window.location.reload()
    } catch (error) {
      console.error("[v0] Scan error:", error)
      setLastScan({
        success: false,
        eventsFound: 0,
        timestamp: new Date(),
      })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Blockchain Scanner</h3>
          <p className="text-xs text-muted-foreground">
            {lastScan
              ? `Last scan: ${lastScan.timestamp.toLocaleTimeString()} - ${lastScan.eventsFound} events found`
              : "Click to scan blockchains for whale events"}
          </p>
        </div>

        <Button onClick={handleScan} disabled={isScanning} size="sm" className="gap-2">
          {isScanning ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Scan Now
            </>
          )}
        </Button>
      </div>

      {lastScan && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            {lastScan.success ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Scan completed successfully</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Scan failed - check console</span>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
