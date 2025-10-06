# API Keys Setup Guide

This guide explains what API keys you need and how to get them for free.

## Required: Blockchain RPC Providers

You need RPC endpoints to read blockchain data. Here are the best free options:

### Option 1: Alchemy (Recommended)
**Free Tier**: 300M compute units/month (plenty for this app)

1. Sign up at [alchemy.com](https://www.alchemy.com)
2. Create apps for each network:
   - Ethereum Mainnet
   - Polygon Mainnet
   - (Optional) Arbitrum, Optimism
3. Copy the HTTPS URLs

**Environment Variables:**
\`\`\`bash
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
\`\`\`

### Option 2: Infura
**Free Tier**: 100k requests/day

1. Sign up at [infura.io](https://www.infura.io)
2. Create a project
3. Enable networks: Ethereum, Polygon
4. Copy the endpoints

**Environment Variables:**
\`\`\`bash
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_PROJECT_ID
\`\`\`

### BSC (Binance Smart Chain)
**Free Public RPC:**
\`\`\`bash
BSC_RPC_URL=https://bsc-dataseed1.binance.org
\`\`\`

Or use [NodeReal](https://nodereal.io) for better reliability (free tier available).

### Solana
**Free Options:**

1. **Helius** (Recommended): [helius.dev](https://www.helius.dev)
   - 100k credits/month free
   \`\`\`bash
   SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
   \`\`\`

2. **Public RPC** (Limited):
   \`\`\`bash
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   \`\`\`

## Optional: Price Data API

### CoinGecko (Currently Used - No Key Required)
**Free Tier**: 10-30 calls/minute

The app uses CoinGecko's free API with 5-minute caching, so you don't need an API key.

**If you hit rate limits:**
- Upgrade to CoinGecko Pro: $129/month
- Or switch to CoinMarketCap API (free tier: 10k calls/month)

### Alternative: CoinMarketCap
1. Sign up at [coinmarketcap.com/api](https://coinmarketcap.com/api/)
2. Get free API key (10k calls/month)
3. Add to environment:
   \`\`\`bash
   COINMARKETCAP_API_KEY=your_key_here
   \`\`\`

## Setting Up in Vercel

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable:
   - Name: `ETHEREUM_RPC_URL`
   - Value: Your RPC endpoint
   - Environment: Production, Preview, Development
4. Redeploy your app

## Testing Your Setup

After adding the environment variables:

1. Deploy your app to Vercel
2. Open the dashboard
3. Click "Scan Now" in the Ingestion Controls
4. Check the browser console for logs
5. Events should appear in the table if whales are detected

## Cost Estimate

**Free Tier (Recommended for Testing):**
- Alchemy: Free (300M compute units/month)
- CoinGecko: Free (10-30 calls/minute)
- **Total: $0/month**

**Production (High Volume):**
- Alchemy Growth: $49/month (unlimited compute)
- CoinGecko Pro: $129/month (higher limits)
- **Total: ~$178/month**

## Troubleshooting

### "RPC endpoint not responding"
- Check if your API key is correct
- Verify the endpoint URL format
- Check if you've exceeded free tier limits

### "Price data unavailable"
- CoinGecko free tier has rate limits
- The app caches prices for 5 minutes to reduce calls
- Consider upgrading if you scan very frequently

### "No events detected"
- Whale threshold is $100k USD - large transfers are rare
- Try lowering the threshold in `lib/blockchain/evm-listener.ts`
- Check if RPC endpoints are working (view console logs)
