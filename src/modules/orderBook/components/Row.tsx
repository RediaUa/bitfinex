import { FC, memo } from 'react'
import { StyleSheet, View } from 'react-native'
import Cell from './Cell'
import { OrderBookItem } from '../../../store/orderBook/types'

interface RowProps {
  bid: OrderBookItem
  ask: OrderBookItem
}

const getPositiveNumbers = (item: OrderBookItem) => item.map(Math.abs) as OrderBookItem

const Row: FC<RowProps> = ({ bid, ask }) => {
  return (
    <View style={styles.row}>
      <Cell isReversed data={bid} />
      <Cell data={getPositiveNumbers(ask)} />
    </View>
    )
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default memo(Row)