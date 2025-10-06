# Whale Tracker - Deployment Guide

## How the Real-Time System Works

### Current Architecture (Manual + Cron-Ready)

The system uses a **scan-based approach** that works in serverless environments:

1. **Manual Scanning**: Click "Scan Now" button to check blockchains immediately
2. **Automated Scanning**: Vercel Cron runs scans every 5 minutes (configurable)
3. **Database Storage**: All whale events are stored in PostgreSQL
4. **API Access**: Three REST endpoints provide filtered access to events

### Setup Instructions

#### 1. Database Setup

Run the SQL script to create tables:
\`\`\`bash
# The script is in scripts/001_create_tables.sql
# Run it via the v0 UI or your database client
\`\`\`

#### 2. Environment Variables

Required RPC endpoints (add in Vercel Project Settings):
- `ETHEREUM_RPC_URL` - Ethereum RPC (e.g., Infura, Alchemy)
- `BSC_RPC_URL` - Binance Smart Chain RPC
- `POLYGON_RPC_URL` - Polygon RPC
- `SOLANA_RPC_URL` - Solana RPC

Get free RPC URLs from:
- **Ethereum/Polygon**: [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
- **BSC**: Public endpoint `https://bsc-dataseed.binance.org`
- **Solana**: Public endpoint `https://api.mainnet-beta.solana.com`

#### 3. Deploy to Vercel

The `vercel.json` file configures automatic scanning every 5 minutes.

\`\`\`bash
# Push to GitHub and deploy via Vercel dashboard
# Or use Vercel CLI:
vercel --prod
\`\`\`

#### 4. Testing

1. Click "Scan Now" button in the UI
2. Check console logs for scan results
3. View detected whale events in the table

### Cron Schedule Configuration

Edit `vercel.json` to change scan frequency:

\`\`\`json
{
  "crons": [
    {
      "path": "/api/ingestion/scan",
      "schedule": "*/5 * * * *"  // Every 5 minutes
    }
  ]
}
\`\`\`

Common schedules:
- `*/1 * * * *` - Every 1 minute (most frequent on Vercel)
- `*/5 * * * *` - Every 5 minutes (recommended)
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour

### Upgrading to True Real-Time

For sub-second detection, you need a long-running service:

**Option 1: External Listener Service**
1. Deploy the listeners to Railway/Render/AWS
2. Use WebSockets to push events to your Next.js app
3. Store events in the same PostgreSQL database

**Option 2: Blockchain Webhooks**
1. Use services like Alchemy Notify or QuickNode
2. Configure webhooks to call your `/api/ingestion/webhook` endpoint
3. Process events as they arrive

### API Endpoints

- `POST /api/ingestion/scan` - Trigger manual scan
- `GET /api/events` - List whale events (with filters)
- `GET /api/events/:id` - Get single event details
- `GET /api/stats` - Get aggregated statistics

### Monitoring

Check Vercel logs to monitor:
- Cron execution (every 5 minutes)
- Number of events detected per scan
- Any RPC errors or rate limits

### Cost Considerations

- **Vercel Cron**: Free tier includes 100 cron executions/day
- **RPC Calls**: Free tiers usually sufficient for 5-min intervals
- **Database**: Neon free tier supports up to 10GB

### Troubleshooting

**No events detected:**
- Check RPC URLs are valid and responding
- Verify whale threshold ($100k default) isn't too high
- Check console logs for errors

**Cron not running:**
- Ensure `vercel.json` is in project root
- Redeploy after adding cron configuration
- Check Vercel dashboard > Project > Cron Jobs

**Rate limiting:**
- Reduce scan frequency in `vercel.json`
- Use paid RPC providers for higher limits
- Implement exponential backoff in scan logic
