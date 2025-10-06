"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"

interface FilterState {
  blockchain: string
  eventType: string
  minUsdValue: string
}

export function EventFilters() {
  const [filters, setFilters] = useState<FilterState>({
    blockchain: "all",
    eventType: "all",
    minUsdValue: "",
  })

  const [isExpanded, setIsExpanded] = useState(false)

  const handleApplyFilters = () => {
    // Filters will be applied via URL params in the EventsTable component
    const params = new URLSearchParams()
    if (filters.blockchain !== "all") params.set("blockchain", filters.blockchain)
    if (filters.eventType !== "all") params.set("event_type", filters.eventType)
    if (filters.minUsdValue) params.set("min_usd_value", filters.minUsdValue)

    window.dispatchEvent(new CustomEvent("filters-changed", { detail: params.toString() }))
  }

  const handleReset = () => {
    setFilters({
      blockchain: "all",
      eventType: "all",
      minUsdValue: "",
    })
    window.dispatchEvent(new CustomEvent("filters-changed", { detail: "" }))
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? "Hide" : "Show"}
            </Button>
          </div>

          {isExpanded && (
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="blockchain">Blockchain</Label>
                <Select value={filters.blockchain} onValueChange={(v) => setFilters({ ...filters, blockchain: v })}>
                  <SelectTrigger id="blockchain">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Chains</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select value={filters.eventType} onValueChange={(v) => setFilters({ ...filters, eventType: v })}>
                  <SelectTrigger id="eventType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="whale_transfer">Whale Transfer</SelectItem>
                    <SelectItem value="liquidity_add">Liquidity Add</SelectItem>
                    <SelectItem value="liquidity_remove">Liquidity Remove</SelectItem>
                    <SelectItem value="large_swap">Large Swap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minUsdValue">Min USD Value</Label>
                <Input
                  id="minUsdValue"
                  type="number"
                  placeholder="100000"
                  value={filters.minUsdValue}
                  onChange={(e) => setFilters({ ...filters, minUsdValue: e.target.value })}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply
                </Button>
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
