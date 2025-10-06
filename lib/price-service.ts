// Price service to fetch token prices and normalize to USD
const COINGECKO_API = "https://api.coingecko.com/api/v3"

interface TokenPrice {
  usd: number
  usd_24h_change?: number
}

// Cache for token prices (5 minute TTL)
const priceCache = new Map<string, { price: number; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getTokenPriceUSD(tokenAddress: string, blockchain: string): Promise<number> {
  const cacheKey = `${blockchain}:${tokenAddress.toLowerCase()}`
  const cached = priceCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price
  }

  try {
    // Map blockchain names to CoinGecko platform IDs
    const platformMap: Record<string, string> = {
      ethereum: "ethereum",
      bsc: "binance-smart-chain",
      polygon: "polygon-pos",
      solana: "solana",
      arbitrum: "arbitrum-one",
      optimism: "optimistic-ethereum",
    }

    const platform = platformMap[blockchain.toLowerCase()]
    if (!platform) {
      console.warn(`[v0] Unknown blockchain: ${blockchain}`)
      return 0
    }

    const response = await fetch(
      `${COINGECKO_API}/simple/token_price/${platform}?contract_addresses=${tokenAddress}&vs_currencies=usd`,
      { next: { revalidate: 300 } }, // Cache for 5 minutes
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const price = data[tokenAddress.toLowerCase()]?.usd || 0

    // Cache the price
    priceCache.set(cacheKey, { price, timestamp: Date.now() })

    return price
  } catch (error) {
    console.error("[v0] Error fetching token price:", error)
    return 0
  }
}

// Get native token prices (ETH, BNB, MATIC, SOL)
export async function getNativeTokenPriceUSD(blockchain: string): Promise<number> {
  const tokenMap: Record<string, string> = {
    ethereum: "ethereum",
    bsc: "binancecoin",
    polygon: "matic-network",
    solana: "solana",
    arbitrum: "ethereum",
    optimism: "ethereum",
  }

  const tokenId = tokenMap[blockchain.toLowerCase()]
  if (!tokenId) return 0

  const cacheKey = `native:${blockchain}`
  const cached = priceCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price
  }

  try {
    const response = await fetch(`${COINGECKO_API}/simple/price?ids=${tokenId}&vs_currencies=usd`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const price = data[tokenId]?.usd || 0

    priceCache.set(cacheKey, { price, timestamp: Date.now() })

    return price
  } catch (error) {
    console.error("[v0] Error fetching native token price:", error)
    return 0
  }
}
