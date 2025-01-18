import { useMemo, useCallback, memo } from 'react'
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native'
import { useAppSelector, useAppDispatch } from '../../../../store'
import { initUpdateOptions } from '../../../../store/orderBook/slice'
import { Options } from '../../../../store/orderBook/types'

type PrecisionType = Options['prec']
const PRECISIONS: Options['prec'][]  = ['P0', 'P1', 'P2', 'P3', 'P4']

const Precision = () => {
  const dispatch = useAppDispatch()
  const precision = useAppSelector(state => state.orderBook.options.prec)
  const currentIndex = useMemo(() => PRECISIONS.findIndex(prec => prec === precision), [precision])

  const handleUpdatePrecision = useCallback((prec: PrecisionType) => {
    dispatch(initUpdateOptions({ prec }))
  }, [dispatch])

  const decrementPresicion = useCallback(() => {
    if (currentIndex < PRECISIONS.length - 1) {
      handleUpdatePrecision(PRECISIONS[currentIndex + 1]);
    }
  }, [dispatch, currentIndex])

  const incrementPresicion = useCallback(() => {
    if (currentIndex > 0) {
      handleUpdatePrecision(PRECISIONS[currentIndex - 1]);
    }
  }, [dispatch, currentIndex])

  const isIncrementDisabled = currentIndex === 0;
  const isDecrementDisabled = currentIndex === PRECISIONS.length - 1;
  
  return (
    <>
      <View style={styles.precision}>
        <TouchableOpacity hitSlop={8} disabled={isDecrementDisabled} onPress={decrementPresicion}>
          <Text style={[styles.text, isDecrementDisabled && styles.disabledText]}>{'.0<-'}</Text>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={8} disabled={isIncrementDisabled} onPress={incrementPresicion}>
          <Text style={[styles.text, isIncrementDisabled && styles.disabledText]}>{'->.00'}</Text>
        </TouchableOpacity>
    </View>
    </>
  )
}

const styles = StyleSheet.create({
  text: {
    color: '#FFFF'
  },
  disabledText: {
    color: '#546E7A'
  },
  precision: {
    width: 80,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default memo(Precision)