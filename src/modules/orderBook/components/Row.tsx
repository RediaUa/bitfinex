import { FC, memo, useEffect } from 'react'
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated'
import { StyleSheet, View } from 'react-native'
import Cell from './Cell'
import { ROW_HEIGHT, COLORS } from '../../constants'
import { OrderBookItemWithTotal } from '../types'

interface RowProps {
  data: OrderBookItemWithTotal
  // depth scale from 0 to 100
  depthScale: number
  isBid: boolean
}

const Row: FC<RowProps> = ({ data, isBid, depthScale }) => {  
  const animatedWidth = useSharedValue(0)
  const [price, , amount] = data

  useEffect(() => {
    animatedWidth.value = withTiming(depthScale, { duration: 300 });
  }, [depthScale])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`
  }));

  return (
    <View style={[styles.row, { flexDirection: isBid ? 'row-reverse' : 'row'}]}>
      <Animated.View style={[styles.depthScale, animatedStyle, { backgroundColor: isBid ? COLORS.green : COLORS.red }]} />
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
    position: 'absolute',
    borderWidth: 1,
    borderColor: COLORS.black
  }
})

export default memo(Row)