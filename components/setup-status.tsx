"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"

interface ConfigStatus {
  ethereum: boolean
  bsc: boolean
  polygon: boolean
  solana: boolean
  database: boolean
}

export function SetupStatus() {
  const [status, setStatus] = useState<ConfigStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSetup()
  }, [])

  async function checkSetup() {
    try {
      const response = await fetch("/api/setup/status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("[v0] Error checking setup:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  if (!status) {
    return null
  }

  const allConfigured = Object.values(status).every((v) => v)

  if (allConfigured) {
    return null // Don't show if everything is configured
  }

  return (
    <Card className="border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-2">Setup Required</h3>
          <p className="text-sm text-amber-800 mb-3">
            Some API keys are missing. Add them in your Vercel project settings to enable all features.
          </p>
          <div className="space-y-2">
            <StatusItem label="Ethereum RPC" configured={status.ethereum} />
            <StatusItem label="BSC RPC" configured={status.bsc} />
            <StatusItem label="Polygon RPC" configured={status.polygon} />
            <StatusItem label="Solana RPC" configured={status.solana} />
            <StatusItem label="Database" configured={status.database} />
          </div>
          <a
            href="/API_SETUP.md"
            target="_blank"
            className="text-sm text-amber-700 hover:text-amber-900 underline mt-3 inline-block"
            rel="noreferrer"
          >
            View setup guide →
          </a>
        </div>
      </div>
    </Card>
  )
}

function StatusItem({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {configured ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
      <span className={configured ? "text-green-900" : "text-red-900"}>{label}</span>
    </div>
  )
}
