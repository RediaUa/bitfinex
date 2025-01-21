import { FC, memo } from 'react'
import { StyleSheet, View } from 'react-native'
import Cell from './Cell'
import { ROW_HEIGHT, COLORS } from '../../constants'
import { OrderBookItemWithTotal } from '../types'

interface RowProps {
  data: OrderBookItemWithTotal
  depthScale: number
  isBid: boolean
}

const Row: FC<RowProps> = ({ data, isBid, depthScale }) => {  
  const [price, , amount] = data

  return (
    <View style={[styles.row, { flexDirection: isBid ? 'row-reverse' : 'row'}]}>
      <View style={[styles.depthScale, { width: `${depthScale}%`, backgroundColor: isBid ? COLORS.green : COLORS.red }]} />
      <Cell isReversed={isBid} price={price} amount={amount} />
    </View>
    )
}

const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative'
  },
  depthScale: {
    height: '100%',
    position: 'absolute'
  }
})

export default memo(Row)