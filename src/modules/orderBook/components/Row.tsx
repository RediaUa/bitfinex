import { FC, memo } from 'react'
import { StyleSheet, View } from 'react-native'
import Cell from './Cell'
import { ROW_HEIGHT } from '../../constants'
import { OrderBookItem } from '../../../store/orderBook/types'

interface RowProps {
  bid: OrderBookItem
  ask: OrderBookItem
}

const Row: FC<RowProps> = ({ bid, ask }) => {  
  return (
    <View style={styles.row}>
      <Cell isReversed count={bid[0]} amount={bid[2]} />
      <Cell count={ask[0]} amount={ask[2]} />
    </View>
    )
}

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})

export default memo(Row)