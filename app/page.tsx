import { StatsOverview } from "@/components/stats-overview"
import { EventsTable } from "@/components/events-table"
import { EventFilters } from "@/components/event-filters"
import { IngestionControls } from "@/components/ingestion-controls"
import { SetupStatus } from "@/components/setup-status"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Whale Tracker</h1>
              <p className="text-muted-foreground mt-1">Real-time blockchain whale and liquidity monitoring</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <SetupStatus />

          <IngestionControls />

          <StatsOverview />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Recent Events</h2>
            </div>

            <EventFilters />
            <EventsTable />
          </div>
        </div>
      </main>
    </div>
  )
}
