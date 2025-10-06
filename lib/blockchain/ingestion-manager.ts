import { EVMListener } from "./evm-listener"
import { SolanaListener } from "./solana-listener"

// Central manager for all blockchain listeners
export class IngestionManager {
  private listeners: Map<string, EVMListener | SolanaListener> = new Map()

  constructor() {
    // Initialize listeners for different blockchains
    // In production, these RPC URLs would come from environment variables
    this.initializeListeners()
  }

  private initializeListeners() {
    // EVM chains
    const evmChains = [
      { name: "ethereum", rpc: process.env.ETHEREUM_RPC_URL || "https://eth.llamarpc.com" },
      { name: "bsc", rpc: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org" },
      { name: "polygon", rpc: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com" },
    ]

    for (const chain of evmChains) {
      const listener = new EVMListener(chain.name, chain.rpc)
      this.listeners.set(chain.name, listener)
    }

    // Solana
    const solanaListener = new SolanaListener(process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com")
    this.listeners.set("solana", solanaListener)
  }

  startAll() {
    console.log("[v0] Starting all blockchain listeners...")
    for (const [chain, listener] of this.listeners) {
      listener.start()
      console.log(`[v0] Started listener for ${chain}`)
    }
  }

  stopAll() {
    console.log("[v0] Stopping all blockchain listeners...")
    for (const [chain, listener] of this.listeners) {
      listener.stop()
      console.log(`[v0] Stopped listener for ${chain}`)
    }
  }

  getListener(blockchain: string): EVMListener | SolanaListener | undefined {
    return this.listeners.get(blockchain)
  }
}

// Singleton instance
let ingestionManager: IngestionManager | null = null

export function getIngestionManager(): IngestionManager {
  if (!ingestionManager) {
    ingestionManager = new IngestionManager()
  }
  return ingestionManager
}
