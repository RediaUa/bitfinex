import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import { State, OrderBookData, PrecisionType, OrderBookItem } from './types'
import { DEFAULT_PRECISION } from './constants'
import { getUpdatedOrderBook } from './utils'

const initialState: State = {
  isConnected: false,
  chanId: null,
  precision: DEFAULT_PRECISION, 
  data: { bids: [], asks: [] },
};

const orderBookSlice = createSlice({
  name: 'orderBook',
  initialState,
  reducers: {
    connect: (state) => {
      state.isConnected = true
    },
    disconnect: (state) => {
      state.isConnected = false
    },
    setPrecision: (state, action: PayloadAction<PrecisionType>) => {
      state.precision = action.payload
    },
    setChannel: (state, action: PayloadAction<number | null>) => {
      state.chanId = action.payload
    },
    setSnapshot: (state, action: PayloadAction<OrderBookData>) => {
      state.data = action.payload
    },
    updateSnapshot: (state, action: PayloadAction<OrderBookItem[]>) => {
      state.data = getUpdatedOrderBook(action.payload, state.data)
    }
  },
});


export const initWs = createAction('orderBook/initWs');
export const destroyWs = createAction('orderBook/destroyWs');
export const initUpdatePrecision = createAction<PrecisionType>('orderBook/updatePrecision');

export const { connect, disconnect, setSnapshot, setChannel, updateSnapshot, setPrecision } = orderBookSlice.actions;
export const orderBookReducer = orderBookSlice.reducer;