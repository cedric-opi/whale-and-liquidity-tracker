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

## Quick Start

### 1. Setup API Keys

**You need blockchain RPC endpoints to read blockchain data.** See [API_SETUP.md](./API_SETUP.md) for detailed instructions.

**Quick setup with Alchemy (Free):**
1. Sign up at [alchemy.com](https://www.alchemy.com)
2. Create apps for Ethereum, Polygon, BSC
3. Add to Vercel environment variables:
   - `ETHEREUM_RPC_URL`
   - `POLYGON_RPC_URL`
   - `BSC_RPC_URL`
   - `SOLANA_RPC_URL` (use [Helius](https://helius.dev) or public RPC)

### 2. Database Setup
Run the SQL migration script:
\`\`\`bash
# Execute scripts/001_create_tables.sql through Neon dashboard
# Or use the v0 script runner
\`\`\`

### 3. Deploy & Test
1. Deploy to Vercel (click "Publish" in v0)
2. Open your dashboard
3. Click "Scan Now" to manually trigger blockchain scan
4. Events will appear if whale transfers are detected

### 4. Enable Auto-Scanning (Optional)
The app includes Vercel Cron configuration to automatically scan every 5 minutes. After deploying, the cron job will run automatically.

## How It Works

### Real-Time Mechanism

The system uses **serverless-compatible polling** instead of long-running listeners:

1. **Manual Trigger**: Click "Scan Now" button to check blockchains immediately
2. **Cron Jobs**: Vercel Cron automatically scans every 5 minutes (configurable in `vercel.json`)
3. **Scan Process**: 
   - Fetches latest blocks from each blockchain
   - Detects large transfers (>$100k USD)
   - Normalizes values to USD using CoinGecko
   - Stores events in PostgreSQL
   - Triggers notifications if configured

### Why Not WebSockets?

Vercel's serverless environment has execution time limits (10-60 seconds). Long-running WebSocket connections don't work. Instead:

- **Current**: Periodic scans via Cron (5-minute intervals)
- **For true real-time**: Deploy listeners on Railway/Render and push to this API

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment strategies.

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

### Manual Blockchain Scan
\`\`\`bash
POST /api/ingestion/scan
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

## Configuration

### Whale Detection Thresholds

Edit thresholds in `lib/config.ts`:
\`\`\`typescript
whaleThreshold: 100000,      // $100k USD minimum
liquidityThreshold: 50000,   // $50k USD minimum
\`\`\`

Or set via environment variables:
- `WHALE_THRESHOLD_USD`
- `LIQUIDITY_THRESHOLD_USD`

### Scan Frequency

Edit `vercel.json` to change cron schedule:
\`\`\`json
{
  "crons": [{
    "path": "/api/ingestion/scan",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }]
}
\`\`\`

## Troubleshooting

### No events appearing?
1. Check if RPC endpoints are configured (see setup status banner)
2. Whale threshold is $100k - large transfers are rare
3. Try lowering threshold in `lib/config.ts`
4. Check browser console for errors

### "RPC endpoint not responding"?
1. Verify API keys are correct in Vercel settings
2. Check if you've exceeded free tier limits
3. Try using different RPC provider

### Price data unavailable?
- CoinGecko free tier has rate limits (10-30 calls/min)
- App caches prices for 5 minutes
- Consider upgrading to CoinGecko Pro if scanning frequently

## Development Notes

The blockchain listeners are currently implemented as polling-based placeholders. For production:

1. **EVM Chains**: Use ethers.js or viem with WebSocket providers
2. **Solana**: Use @solana/web3.js with WebSocket subscriptions
3. **Price Service**: Consider caching strategies and rate limiting
4. **Notifications**: Integrate with Resend, SendGrid, or similar for emails

## License

MIT
