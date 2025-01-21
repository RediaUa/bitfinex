import { FC, useCallback, useMemo, useEffect } from 'react'
import { Text, Button, FlatList, ListRenderItem, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import { useAppSelector, useAppDispatch } from '../../store'
import { initWs, destroyWs } from '../../store/orderBook/slice'
import Row from './components/Row'
import Header from './components/ListHeader'
import Controls from './components/Controls'
import { prepareOrderBookData, keyExtractor, getItemLayout } from './utils'
import { COLORS } from '../constants'
import { OrderBookItemWithTotal } from './types'

const renderItem: (maxTotal: number) => ListRenderItem<OrderBookItemWithTotal> = maxTotal => ({ item, index }) => {
  const [, , , total] = item
  const depthScale = total ? (Math.abs(total) / maxTotal * 100) : 0
  /* 
    render items one by one in 2 columns
     every even value is bid
     every odd is ask 
  */
  return <Row depthScale={depthScale} data={item} isBid={index % 2 === 0} />
}

const OrderBook: FC = () => {
  const dispatch = useAppDispatch()
  const isConnected = useAppSelector(state => state.orderBook.isConnected)
  const error = useAppSelector(state => state.orderBook.error)
  const channel = useAppSelector(state => state.orderBook.chanId)
  const orderBookData = useAppSelector(state => state.orderBook.data)

  useEffect(() => {
    if (!error) return

    Alert.alert('Something went wrong', error);
  }, [error])

  useEffect(() => {
    dispatch(initWs())
  }, [dispatch])

  const handleConnectBtn = useCallback(() => {
    const action = isConnected ? destroyWs : initWs
    dispatch(action())
  }, [isConnected])

  const ConnectButton = useMemo(() => {
    return (
      <Button
        title={isConnected ? 'Disconnect' : 'Connect'} 
        color={isConnected ? COLORS.red : COLORS.green}
        onPress={handleConnectBtn}
      />)
  }, [isConnected, handleConnectBtn])

  const isLoading = isConnected && !channel

  const ListFooter = useMemo(() => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={styles.text.color} />
    }

    return null
  }
  , [isLoading])

  const { data, maxTotal } = useMemo(() => prepareOrderBookData(orderBookData), [orderBookData])

  return (
    <>
      <Text style={[styles.text, { marginVertical: 6 }]}>Order Book</Text>
      {ConnectButton}
      {isConnected && (
        <>
          <Controls />
          <FlatList<OrderBookItemWithTotal>
            ListHeaderComponent={<Header />}
            ListFooterComponent={ListFooter}
            style={styles.flatList}
            contentContainerStyle={styles.contentContainer}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            renderItem={renderItem(maxTotal)}
            data={data}
            numColumns={2}
        />
      </>)}
    </>
  )
}

const styles = StyleSheet.create({
  flatList: {
    flex: 1,
    width: '100%',
  },
  button: {
    paddingVertical: 10
  },
  contentContainer: {
    padding: 16,
  },
  text: {
    color: '#FFFF'
  }
})

export default OrderBook