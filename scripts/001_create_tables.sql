-- Create whale_events table to store all blockchain whale and liquidity events
CREATE TABLE IF NOT EXISTS whale_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'whale_transfer', 'liquidity_add', 'liquidity_remove', 'large_swap'
  blockchain VARCHAR(20) NOT NULL, -- 'ethereum', 'bsc', 'polygon', 'solana', etc.
  transaction_hash VARCHAR(255) NOT NULL UNIQUE,
  block_number BIGINT NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  
  -- Address information
  from_address VARCHAR(255),
  to_address VARCHAR(255),
  contract_address VARCHAR(255),
  
  -- Token information
  token_symbol VARCHAR(20),
  token_address VARCHAR(255),
  
  -- Amount information
  amount_raw VARCHAR(100), -- Store as string to handle large numbers
  amount_decimal DECIMAL(36, 18),
  usd_value DECIMAL(20, 2) NOT NULL,
  
  -- Additional metadata
  protocol VARCHAR(50), -- 'uniswap', 'pancakeswap', 'raydium', etc.
  metadata JSONB, -- Store additional event-specific data
  
  -- Notification tracking
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_whale_events_blockchain ON whale_events(blockchain);
CREATE INDEX IF NOT EXISTS idx_whale_events_event_type ON whale_events(event_type);
CREATE INDEX IF NOT EXISTS idx_whale_events_timestamp ON whale_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whale_events_usd_value ON whale_events(usd_value DESC);
CREATE INDEX IF NOT EXISTS idx_whale_events_notification ON whale_events(notification_sent, timestamp);
CREATE INDEX IF NOT EXISTS idx_whale_events_tx_hash ON whale_events(transaction_hash);

-- Create notification_subscriptions table
CREATE TABLE IF NOT EXISTS notification_subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255),
  webhook_url VARCHAR(500),
  
  -- Filter preferences
  min_usd_value DECIMAL(20, 2) DEFAULT 100000, -- Minimum USD value to trigger notification
  blockchains TEXT[], -- Array of blockchains to monitor
  event_types TEXT[], -- Array of event types to monitor
  
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_whale_events_updated_at BEFORE UPDATE ON whale_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_subscriptions_updated_at BEFORE UPDATE ON notification_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
