import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { orderBookReducer } from './orderBook/slice'
import { orderBookSaga } from './orderBook/saga'

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    orderBook: orderBookReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});

sagaMiddleware.run(orderBookSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;