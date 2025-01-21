import { FC, memo } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { formatPrice, formatAmount } from '../utils' 
import { COLORS } from '../../constants'

interface CellProps {
  price: number
  amount: number
  isReversed?: boolean
}

const Cell: FC<CellProps> = ({ price, amount, isReversed }) => {
  return ( 
    <View style={[styles.cell, isReversed && styles.reversedCell]}>
      {price && <Text style={styles.text}>{formatPrice(price)}</Text>}
      {amount && <Text style={styles.text}>{formatAmount(amount)}</Text>}
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
    color: COLORS.white
  }
})

export default memo(Cell)