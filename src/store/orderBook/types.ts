export type OrderBookItem = [price: number, count: number, amount: number];
export type OrderBookSnapshot = [channelId: number, OrderBookItem[]];
export type OrderBookEntity = [channelId: number, OrderBookItem]
export type OrderBookData = { asks: OrderBookItem[], bids: OrderBookItem[] }

export enum SupportedPairs {
  btc_usd = 'tBTCUSD',
  eth_usd = 'tETHUSD',
  ada_usd = 'tADAUSD',
  sol_usd = 'tSOLUSD',
  xrp_usd = 'tXRPUSD',
}

export type Options = {
  symbol: SupportedPairs,
  prec: 'P0' | 'P1' | 'P2' | 'P3' | 'P4'; // Price aggregation levels
  freq: 'F0' | 'F1'; // Update frequency F0=realtime / F1=2sec.
  len: '1' | '25' | '100' | '250';
  
}

export type State = {
  isConnected: boolean;
  chanId: number | null;
  options: Options
  data: OrderBookData
}

export enum EmitEventTypeEnum  {
  open = 'open',
  close = 'close',
  subscribe = 'subscribe',
  unsubscribe = 'unsubscribe',
  message = 'message',
}

export interface SocketEvent {
  type: EmitEventTypeEnum
  payload?: unknown
}