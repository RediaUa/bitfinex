import { StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import ScreenContainer from './src/core/ui/containers/ScreenContainer'
import store from './src/store'

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ScreenContainer>
          <Text>Order Book</Text>
        </ScreenContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
