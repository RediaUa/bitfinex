import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/store'

import ScreenContainer from './src/core/ui/containers/ScreenContainer';
import OrderBook from './src/modules/orderBook'

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <ScreenContainer>
          <OrderBook />
        </ScreenContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
