import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit';
import { State, OrderBookData, Options, OrderBookItem } from './types'
import { DEFAULT_OPTIONS } from './constants'
import { getUpdatedOrderBook } from './utils'

const initialState: State = {
  isConnected: false,
  chanId: null,
  options: DEFAULT_OPTIONS, 
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
    updateOptions: (state, action: PayloadAction<Partial<Options>>) => {
      state.options = { ...state.options, ...action.payload  }
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
export const initUpdateOptions = createAction<Partial<Options>>('orderBook/initUpdateOptions');

export const { connect, disconnect, setSnapshot, setChannel, updateSnapshot, updateOptions } = orderBookSlice.actions;
export const orderBookReducer = orderBookSlice.reducer;