import { FC, memo } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { OrderBookItem } from '../../../store/orderBook/types'

interface CellProps {
  data: OrderBookItem
  isReversed?: boolean
}

const roundAmount = (amount?: number) => amount && amount.toFixed(4)

const Cell: FC<CellProps> = ({ data, isReversed }) => {
  return ( 
    <View style={[styles.cell, isReversed && styles.reversedCell]}>
      <Text style={styles.text}>{data[0]}</Text>
      <Text style={styles.text}>{roundAmount(data[2])}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  reversedCell: {
    flexDirection: 'row-reverse',
    paddingRight: 12,
  },
  text: {
    color: '#FFFF'
  }
})

export default memo(Cell)