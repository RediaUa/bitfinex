import { FC, memo, useCallback } from 'react'
import { TouchableOpacity, Text, View, StyleSheet, FlatList, ListRenderItem } from 'react-native'
import { useAppSelector, useAppDispatch } from '../../../../store'
import { initUpdateOptions } from '../../../../store/orderBook/slice'
import { SupportedPairs } from '../../../../store/orderBook/types'

export const supportedPairsArray: SupportedPairs[] = Object.values(SupportedPairs);

const labels: Record<SupportedPairs, string> = {
  [SupportedPairs.btc_usd]: 'BTC',
  [SupportedPairs.eth_usd]: 'ETH',
  [SupportedPairs.sol_usd]: 'SOL',
  [SupportedPairs.xrp_usd]: 'XRP',
  [SupportedPairs.ada_usd]: 'ADA',
 }

 const keyExtractor = (item: SupportedPairs) => item;

const Pairs: FC = () => {
  const dispatch = useAppDispatch()
  const currentPair = useAppSelector(state => state.orderBook.options.symbol)

  const handleUpdatePair = useCallback((symbol: SupportedPairs) => () =>  {
    dispatch(initUpdateOptions({ symbol }))
  }, [dispatch])


  const renderItem: ListRenderItem<SupportedPairs> = useCallback(({ item }) => {
    const isActive = currentPair === item

    return (
      <TouchableOpacity
        style={styles.item} 
        onPress={handleUpdatePair(item)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.text, isActive && styles.activePair]}>{labels[item]}</Text>
      </TouchableOpacity>
    )
  }, [currentPair, handleUpdatePair])
  
  return (
    <View style={styles.container}>
      {<FlatList<SupportedPairs>
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.contentContainer}
        data={supportedPairsArray}
        renderItem={renderItem}
      />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 16,
  },
  contentContainer: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  item: {
    paddingHorizontal: 10,
  },
  text: {
    color: '#FFFF'
  },
  activePair: {
    color: '#4CAF50'
  },
})

export default memo(Pairs)