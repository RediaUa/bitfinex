import { OrderBookItem } from '../../store/orderBook/types'

export type OrderBookItemWithTotal = [...OrderBookItem, total: number];