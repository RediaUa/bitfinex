
import { OrderBookData } from '../../store/orderBook/types'
import { OrderBookListItem } from './types'

export const keyExtractor = (item: OrderBookListItem) => item.bid.join() + item.ask.join()

export const prepareOrderBookData = ({ bids, asks }: OrderBookData) => {
  // sort by price desc
  const sortedBids = [...bids].sort((a, b) => b[0] - a[0])
  // sort by price ask
  const sortedAsks = [...asks].sort((a, b) => a[0] - b[0])

  const data = []

  const maxLength = Math.max(sortedBids.length, sortedAsks.length)

  for(let i = 0; i < maxLength - 1; i++) {
    data.push({ bid: sortedBids[i] || [], ask: sortedAsks[i] || [] })
  }

  return data
}