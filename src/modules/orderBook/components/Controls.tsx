import { FC, useMemo, memo, useCallback } from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { useAppSelector, useAppDispatch } from '../../../store'
import { initUpdatePrecision } from '../../../store/orderBook/slice'
import { PrecisionType as PrecisionType } from '../../../store/orderBook/types'

interface Props {}

const precisions: PrecisionType[]  = ['P0', 'P1', 'P2', 'P3', 'P4']

const Controls: FC<Props> = () => {
  const dispatch = useAppDispatch()
  const precision = useAppSelector(state => state.orderBook.precision)
  const currentIndex = useMemo(() => precisions.findIndex(prec => prec === precision), [precision])

  const handleUpdatePrecision = useCallback((precision: PrecisionType) => {
    dispatch(initUpdatePrecision(precision))
  }, [dispatch])

  const decrementPresicion = useCallback(() => {
    if (currentIndex < precisions.length - 1) {
      handleUpdatePrecision(precisions[currentIndex + 1]);
    }
  }, [dispatch, currentIndex])

  const incrementPresicion = useCallback(() => {
    if (currentIndex > 0) {
      handleUpdatePrecision(precisions[currentIndex - 1]);
    }
  }, [dispatch, currentIndex])

  const isIncrementDisabled = currentIndex === 0;
  const isDecrementDisabled = currentIndex === precisions.length - 1;

  return (
    <View style={styles.container}>
        <TouchableOpacity hitSlop={8} disabled={isDecrementDisabled} onPress={decrementPresicion}>
          <Text style={[styles.text, isDecrementDisabled && styles.disabledText]}>{'.0<-'}</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={8} disabled={isIncrementDisabled} onPress={incrementPresicion}>
          <Text style={[styles.text, isIncrementDisabled && styles.disabledText]}>{'->.00'}</Text>
        </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: '#FFFF'
  },
  disabledText: {
    color: '#546E7A'
  },
  container: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default memo(Controls)