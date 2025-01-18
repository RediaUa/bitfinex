import { SupportedPairs, Options } from './types'

export const PUBLIC_API = 'wss://api-pub.bitfinex.com/ws/2'
export const UPDATE_INTERVAL = 500

export const DEFAULT_OPTIONS: Options = { symbol: SupportedPairs.btc_usd, prec: 'P0', freq: 'F0', len: '25' }