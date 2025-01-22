
import { ROW_HEIGHT } from '../constants'
import { OrderBookData, OrderBookItem } from '../../store/orderBook/types'
import { OrderBookItemWithTotal } from './types'

// use index to prevent remounting rows
export const keyExtractor = (_: OrderBookItemWithTotal, index: number) => index.toString()
export const getItemLayout = (_: ArrayLike<OrderBookItemWithTotal> | null | undefined, index: number) => {
  return {
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  };
}

const expandOrderWithTotal = (acc: OrderBookItemWithTotal[], value: OrderBookItem, index: number): OrderBookItemWithTotal[] => {
  /*
      expand order with the total for the current step
      value is calculated as a cumulative sum of the `amount` field
  */
  const prevTotal = index > 0 ? acc[index - 1][3] : 0
  const [, , amount] = value

  return [
    ...acc,
    [...value, prevTotal + amount]
  ]
}

export const prepareOrderBookData = ({ bids, asks }: OrderBookData): { data: OrderBookItemWithTotal[], maxTotal: number } => {
  // sort by price desc
  const sortedBids = [...bids].sort((a, b) => b[0] - a[0]).reduce<OrderBookItemWithTotal[]>(expandOrderWithTotal, [])

  // sort by price ask
  const sortedAsks = [...asks].sort((a, b) => a[0] - b[0]).reduce<OrderBookItemWithTotal[]>(expandOrderWithTotal, [])

  const maxBidTotal = sortedBids[sortedBids.length - 1]?.[3] || 0
  const maxAskTotal = sortedAsks[sortedAsks.length - 1]?.[3] || 0

  const data = []

  const maxLength = Math.max(sortedBids.length, sortedAsks.length)

  for(let i = 0; i < maxLength - 1; i++) {
    const bid = sortedBids[i] || []
    const ask = sortedAsks[i] || []
    
    data.push(...[bid, ask])
  }

  return { data, maxTotal: Math.max(maxBidTotal, Math.abs(maxAskTotal)) }
}

export const formatAmount = (amount: number) => {
  const value = Math.abs(amount)

  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }

  if(value < 1) {
    return value.toFixed(4); 
  }

  return value.toFixed(3);
}

export const formatPrice = (price: number) => price