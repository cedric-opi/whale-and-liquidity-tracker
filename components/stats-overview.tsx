"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchStats, type StatsResponse } from "@/lib/api-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function StatsOverview() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      setLoading(true)
      const data = await fetchStats(timeframe)
      setStats(data)
      setLoading(false)
    }

    loadStats()
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [timeframe])

  if (loading || !stats?.success) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { overall } = stats.data

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Overview</h2>
        <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7d</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(Number(overall.total_events))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(Number(overall.total_volume_usd || 0))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(Number(overall.avg_transaction_usd || 0))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Largest Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(Number(overall.largest_transaction_usd || 0))}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Blockchain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.data.byBlockchain.map((chain) => (
                <div key={chain.blockchain} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-medium capitalize">{chain.blockchain}</div>
                    <div className="text-sm text-muted-foreground">({formatNumber(Number(chain.event_count))})</div>
                  </div>
                  <div className="font-semibold">{formatCurrency(Number(chain.total_volume_usd))}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Event Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.data.byEventType.map((type) => (
                <div key={type.event_type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="font-medium capitalize">{type.event_type.replace("_", " ")}</div>
                    <div className="text-sm text-muted-foreground">({formatNumber(Number(type.event_count))})</div>
                  </div>
                  <div className="font-semibold">{formatCurrency(Number(type.total_volume_usd))}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
