# Whale & Liquidity Event Tracker

A complete full-stack system for tracking whale transfers and liquidity events across EVM (Ethereum, BSC, Polygon) and Solana blockchains.

## Features

### 🔄 Real-time Ingestion
- Multi-chain support (Ethereum, BSC, Polygon, Solana)
- Automatic event detection for whale transfers and liquidity changes
- USD value normalization using CoinGecko API
- Configurable thresholds for whale detection

### 💾 PostgreSQL Storage
- Optimized schema with indexes for fast queries
- Event metadata stored as JSONB for flexibility
- Automatic timestamp tracking
- Notification status tracking

### 🔌 REST API
Three main endpoints:
1. **GET /api/events** - Fetch whale events with filtering and pagination
   - Query params: `blockchain`, `event_type`, `min_usd_value`, `max_usd_value`, `start_date`, `end_date`, `page`, `limit`
2. **GET /api/events/:id** - Get single event details
3. **GET /api/stats** - Aggregated statistics
   - Query params: `timeframe` (24h, 7d, 30d, all)

### 🔔 Notification System
- Webhook support for real-time alerts
- Email notifications (placeholder for integration)
- Configurable filters per subscription
- Background worker for automatic notification processing

### 🎨 Minimal Dashboard UI
- Real-time statistics overview
- Filterable events table with pagination
- Multi-timeframe analytics (24h, 7d, 30d)
- Blockchain and event type breakdowns
- Auto-refresh every 15-30 seconds

## Setup

### 1. Database Setup
Run the SQL migration script to create tables:
\`\`\`bash
# The script is located at scripts/001_create_tables.sql
# Execute it through your Neon dashboard or using the v0 script runner
\`\`\`

### 2. Environment Variables
The following are already configured:
- `DATABASE_URL` - Neon PostgreSQL connection string

Optional (for production):
- `ETHEREUM_RPC_URL`
- `BSC_RPC_URL`
- `POLYGON_RPC_URL`
- `SOLANA_RPC_URL`

### 3. Start Ingestion
\`\`\`bash
# Call the API endpoint to start blockchain listeners
POST /api/ingestion/start
\`\`\`

### 4. Subscribe to Notifications
\`\`\`bash
POST /api/notifications/subscribe
{
  "webhook_url": "https://your-webhook.com/endpoint",
  "min_usd_value": 100000,
  "blockchains": ["ethereum", "solana"],
  "event_types": ["whale_transfer"]
}
\`\`\`

## Architecture

\`\`\`
┌─────────────────┐
│  Blockchain     │
│  Listeners      │
│  (EVM/Solana)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Price Service  │
│  (USD Normalize)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL     │
│  (Neon)         │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────────┐
│ REST   │ │ Notification │
│ API    │ │ System       │
└───┬────┘ └──────────────┘
    │
    ▼
┌────────────────┐
│  Dashboard UI  │
└────────────────┘
\`\`\`

## Tech Stack

- **Frontend**: Next.js 15, React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Neon)
- **Blockchain**: ethers.js / @solana/web3.js (placeholders)
- **Price Data**: CoinGecko API

## API Examples

### Fetch Recent Whale Events
\`\`\`bash
GET /api/events?blockchain=ethereum&min_usd_value=500000&page=1&limit=20
\`\`\`

### Get Statistics
\`\`\`bash
GET /api/stats?timeframe=24h
\`\`\`

### Subscribe to Notifications
\`\`\`bash
POST /api/notifications/subscribe
Content-Type: application/json

{
  "webhook_url": "https://discord.com/api/webhooks/...",
  "min_usd_value": 250000,
  "blockchains": ["ethereum", "bsc"],
  "event_types": ["whale_transfer", "liquidity_remove"]
}
\`\`\`

## Development Notes

The blockchain listeners are currently implemented as polling-based placeholders. For production:

1. **EVM Chains**: Use ethers.js or viem with WebSocket providers
2. **Solana**: Use @solana/web3.js with WebSocket subscriptions
3. **Price Service**: Consider caching strategies and rate limiting
4. **Notifications**: Integrate with Resend, SendGrid, or similar for emails

## License

MIT
