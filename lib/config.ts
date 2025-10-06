// Configuration for blockchain listeners and thresholds

export const config = {
  // Whale detection thresholds (in USD)
  whaleThreshold: Number.parseInt(process.env.WHALE_THRESHOLD_USD || "100000"),
  liquidityThreshold: Number.parseInt(process.env.LIQUIDITY_THRESHOLD_USD || "50000"),

  // Blockchain RPC endpoints
  rpcEndpoints: {
    ethereum: process.env.ETHEREUM_RPC_URL || "",
    bsc: process.env.BSC_RPC_URL || "",
    polygon: process.env.POLYGON_RPC_URL || "",
    solana: process.env.SOLANA_RPC_URL || "",
  },

  // Price API configuration
  priceApi: {
    provider: "coingecko", // or 'coinmarketcap'
    coinGeckoApiKey: process.env.COINGECKO_API_KEY, // Optional for free tier
    coinMarketCapApiKey: process.env.COINMARKETCAP_API_KEY,
  },

  // Polling intervals (in milliseconds)
  polling: {
    evm: 12000, // 12 seconds (approximate block time)
    solana: 400, // 400ms (Solana block time)
  },

  // Cache settings
  cache: {
    priceTTL: 5 * 60 * 1000, // 5 minutes
  },
} as const

// Validate required configuration
export function validateConfig() {
  const missing: string[] = []

  if (!config.rpcEndpoints.ethereum) missing.push("ETHEREUM_RPC_URL")
  if (!config.rpcEndpoints.bsc) missing.push("BSC_RPC_URL")
  if (!config.rpcEndpoints.polygon) missing.push("POLYGON_RPC_URL")
  if (!config.rpcEndpoints.solana) missing.push("SOLANA_RPC_URL")

  if (missing.length > 0) {
    console.warn(`[v0] Missing environment variables: ${missing.join(", ")}`)
    console.warn("[v0] Some blockchains will not be monitored. See API_SETUP.md for setup instructions.")
  }

  return missing.length === 0
}
