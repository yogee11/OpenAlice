/**
 * Manager-level wire types — summaries / aggregations that the UTA
 * service exposes for Alice's SDK to consume. These predate UTA-split
 * (they used to live in `domain/trading/uta-manager.ts`) but were
 * lifted to the shared protocol package so both processes type-check
 * against the same shapes.
 */

import type { AccountCapabilities, BrokerHealth, BrokerHealthInfo } from './broker.js'
import type { ContractDescription } from '@traderalice/ibkr'

export interface UTASummary {
  id: string
  label: string
  capabilities: AccountCapabilities
  health: BrokerHealthInfo
}

export interface AggregatedEquity {
  totalEquity: string
  totalCash: string
  totalUnrealizedPnL: string
  totalRealizedPnL: string
  /** Present when one or more accounts used fallback FX rates. */
  fxWarnings?: string[]
  accounts: Array<{
    id: string
    label: string
    baseCurrency: string
    equity: string
    cash: string
    unrealizedPnL: string
    health: BrokerHealth
  }>
}

export interface ContractSearchResult {
  accountId: string
  results: ContractDescription[]
}
