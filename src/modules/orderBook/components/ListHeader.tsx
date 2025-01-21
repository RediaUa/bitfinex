import { FC, memo } from 'react'
import { StyleSheet, View, Text } from 'react-native'

import { COLORS } from '../../constants'

const Row: FC = () => {
  return (
    <View style={[styles.mainRow]}>
        <View style={styles.row}>
          <Text style={styles.text}>Amount</Text>
          <Text style={styles.text}>Price</Text>
        </View>
      <View style={styles.row}>
        <Text style={styles.text}>Price</Text>
        <Text style={styles.text}>Amount</Text>
      </View>
    </View>)
}

export default memo(Row)

const styles = StyleSheet.create({
  mainRow: {
    paddingVertical: 8,
    flexDirection: 'row',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  text: {
    color: COLORS.grey
  }
})