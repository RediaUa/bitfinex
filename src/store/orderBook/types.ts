export type OrderBookItem = [price: number, count: number, amount: number];
export type OrderBookSnapshot = [channelId: number, OrderBookItem[]];
export type OrderBookEntity = [channelId: number, OrderBookItem]
export type OrderBookData = { asks: OrderBookItem[], bids: OrderBookItem[] }
export type PrecisionType = 'P0' | 'P1' | 'P2' | 'P3' | 'P4'

export type State = {
  isConnected: boolean;
  chanId: number | null;
  precision: PrecisionType
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