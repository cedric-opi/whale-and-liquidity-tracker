import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// Single scan of all blockchains for whale events
// This can be called manually or via Vercel Cron
export async function POST() {
  try {
    console.log("[v0] Starting blockchain scan...")
    const events = []
    const WHALE_THRESHOLD_USD = 100000 // $100k

    // Scan Ethereum
    if (process.env.ETHEREUM_RPC_URL) {
      const ethEvents = await scanEVMChain("ethereum", process.env.ETHEREUM_RPC_URL, WHALE_THRESHOLD_USD)
      events.push(...ethEvents)
    }

    // Scan BSC
    if (process.env.BSC_RPC_URL) {
      const bscEvents = await scanEVMChain("bsc", process.env.BSC_RPC_URL, WHALE_THRESHOLD_USD)
      events.push(...bscEvents)
    }

    // Scan Polygon
    if (process.env.POLYGON_RPC_URL) {
      const polygonEvents = await scanEVMChain("polygon", process.env.POLYGON_RPC_URL, WHALE_THRESHOLD_USD)
      events.push(...polygonEvents)
    }

    // Scan Solana
    if (process.env.SOLANA_RPC_URL) {
      const solanaEvents = await scanSolana(process.env.SOLANA_RPC_URL, WHALE_THRESHOLD_USD)
      events.push(...solanaEvents)
    }

    console.log(`[v0] Scan complete. Found ${events.length} whale events`)

    return NextResponse.json({
      success: true,
      eventsFound: events.length,
      events: events.slice(0, 10), // Return first 10 for preview
    })
  } catch (error) {
    console.error("[v0] Error during scan:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

async function scanEVMChain(blockchain: string, rpcUrl: string, thresholdUSD: number) {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBlockByNumber",
        params: ["latest", true],
        id: 1,
      }),
    })

    const data = await response.json()
    const block = data.result

    if (!block || !block.transactions) {
      return []
    }

    const events = []

    for (const tx of block.transactions.slice(0, 20)) {
      // Check first 20 txs
      if (!tx.value || tx.value === "0x0") continue

      const valueWei = BigInt(tx.value)
      const valueEth = Number(valueWei) / 1e18

      // Estimate USD value (simplified - in production use real price feeds)
      const estimatedUSD = valueEth * 3000 // Rough ETH price

      if (estimatedUSD >= thresholdUSD) {
        const event = {
          blockchain,
          transaction_hash: tx.hash,
          block_number: Number.parseInt(block.number, 16),
          from_address: tx.from,
          to_address: tx.to || "contract_creation",
          amount: valueEth.toString(),
          token_symbol: "ETH",
          usd_value: estimatedUSD,
          event_type: "transfer",
          timestamp: new Date(Number.parseInt(block.timestamp, 16) * 1000),
        }

        // Store in database
        await sql`
          INSERT INTO whale_events (
            blockchain, transaction_hash, block_number, from_address, to_address,
            amount, token_symbol, usd_value, event_type, timestamp
          ) VALUES (
            ${event.blockchain}, ${event.transaction_hash}, ${event.block_number},
            ${event.from_address}, ${event.to_address}, ${event.amount},
            ${event.token_symbol}, ${event.usd_value}, ${event.event_type}, ${event.timestamp}
          )
          ON CONFLICT (transaction_hash) DO NOTHING
        `

        events.push(event)
      }
    }

    return events
  } catch (error) {
    console.error(`[v0] Error scanning ${blockchain}:`, error)
    return []
  }
}

async function scanSolana(rpcUrl: string, thresholdUSD: number) {
  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getRecentBlockhash",
      }),
    })

    const data = await response.json()

    // Simplified Solana scanning - in production, use proper transaction parsing
    console.log("[v0] Solana scan completed (simplified implementation)")
    return []
  } catch (error) {
    console.error("[v0] Error scanning Solana:", error)
    return []
  }
}
