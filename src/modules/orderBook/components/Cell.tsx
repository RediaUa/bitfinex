import { FC, memo } from 'react'
import { StyleSheet, View, Text } from 'react-native'

interface CellProps {
  count: number
  amount: number
  isReversed?: boolean
}

const formatAmount = (amount?: number) => amount && Math.abs(amount).toFixed(4)

const Cell: FC<CellProps> = ({ count, amount, isReversed }) => {
  return ( 
    <View style={[styles.cell, isReversed && styles.reversedCell]}>
      <Text style={styles.text}>{count}</Text>
      <Text style={styles.text}>{formatAmount(amount)}</Text>
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