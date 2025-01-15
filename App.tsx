import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ScreenContainer from './src/core/ui/containers/ScreenContainer'

export default function App() {
  return (
    <SafeAreaProvider>
      <ScreenContainer>
        <Text>Order Book</Text>
      </ScreenContainer>
    </SafeAreaProvider>
  );
}
