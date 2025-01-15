import { OrderBookEntity, OrderBookItem, OrderBookSnapshot, OrderBookData } from './types'

export const isOrderBookMessage = (message: unknown): message is OrderBookEntity | OrderBookSnapshot => {
  if (Array.isArray(message) && typeof message[0] === 'number' &&  Array.isArray(message[1])) {
    return true
  }

  return false
} 

export const isSnapshot = (message: unknown): message is OrderBookSnapshot => {
  if (isOrderBookMessage(message) && Array.isArray(message[1][0])) {
    return true
  }

  return false
}

export const handleSnapshotMessage = (message: OrderBookSnapshot): OrderBookData => {
  const bids = []
  const asks = []

  for(const orderBookEntity of message[1]) {
    const [_, __, amount] = orderBookEntity
    if(amount > 0) bids.push(orderBookEntity)
    if(amount < 0) asks.push(orderBookEntity)
  }

  return { asks, bids } 
}

const updateOrderBookByKey = (state: OrderBookData, key: 'bids' | 'asks', entity: OrderBookItem) => {
  const [price, count] = entity

  if (count > 0) {
    const index = state[key].findIndex((item) => price === item[0])

    if (index === -1) {
      // create
      state[key].push(entity)
    } else {
      // update
      state[key][index] = entity
    }
  } else if (count === 0) {
    // delete
    state[key] = state[key].filter((item) => item[0] !== price);
  }

  return { ...state }
}

export const getUpdatedOrderBook = (data: OrderBookItem, orderBook: OrderBookData) => {
  const [_, __, amount] = data
  const key = amount > 0 ? 'bids' : 'asks'
  
  return updateOrderBookByKey(orderBook, key, data)

}