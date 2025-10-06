"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { fetchEvents, type EventsResponse } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink } from "lucide-react"

export function EventsTable() {
  const [data, setData] = useState<EventsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState("")

  useEffect(() => {
    async function loadEvents() {
      setLoading(true)
      const params = new URLSearchParams(filters)
      const result = await fetchEvents({
        page,
        limit: 20,
        blockchain: params.get("blockchain") || undefined,
        event_type: params.get("event_type") || undefined,
        min_usd_value: params.get("min_usd_value") ? Number(params.get("min_usd_value")) : undefined,
      })
      setData(result)
      setLoading(false)
    }

    loadEvents()

    // Listen for filter changes
    const handleFiltersChanged = (e: Event) => {
      const customEvent = e as CustomEvent
      setFilters(customEvent.detail)
      setPage(1)
    }

    window.addEventListener("filters-changed", handleFiltersChanged)

    // Refresh every 15 seconds
    const interval = setInterval(loadEvents, 15000)

    return () => {
      window.removeEventListener("filters-changed", handleFiltersChanged)
      clearInterval(interval)
    }
  }, [page, filters])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatAddress = (address?: string) => {
    if (!address) return "—"
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const getBlockchainColor = (blockchain: string) => {
    const colors: Record<string, string> = {
      ethereum: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      bsc: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      polygon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      solana: "bg-green-500/10 text-green-600 dark:text-green-400",
    }
    return colors[blockchain] || "bg-gray-500/10 text-gray-600 dark:text-gray-400"
  }

  const getExplorerUrl = (blockchain: string, txHash: string) => {
    const explorers: Record<string, string> = {
      ethereum: `https://etherscan.io/tx/${txHash}`,
      bsc: `https://bscscan.com/tx/${txHash}`,
      polygon: `https://polygonscan.com/tx/${txHash}`,
      solana: `https://solscan.io/tx/${txHash}`,
    }
    return explorers[blockchain] || "#"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading events...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data?.success || data.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Events Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No whale events match your current filters. Try adjusting the filters or check back later.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Events ({data.pagination.total.toLocaleString()})</CardTitle>
          <div className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Chain</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead className="text-right">USD Value</TableHead>
                <TableHead className="text-right">TX</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{formatTimestamp(event.timestamp)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {event.event_type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBlockchainColor(event.blockchain)}>{event.blockchain.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{event.token_symbol || "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatAddress(event.from_address)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatAddress(event.to_address)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(event.usd_value)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={getExplorerUrl(event.blockchain, event.transaction_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
          </div>
          <Button variant="outline" disabled={page >= data.pagination.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
