import { FC, memo } from 'react'
import { View, StyleSheet } from 'react-native'

import Pairs from './Pairs'
import Precision from './Precision'

const Controls: FC = () => {
  return (
    <View style={styles.container}>
      <Pairs />
      <Precision />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
})

export default memo(Controls)