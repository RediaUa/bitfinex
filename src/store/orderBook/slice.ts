import { createSlice } from '@reduxjs/toolkit';
import { State } from './types'

const initialState: State = {
  isConnected: false,
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
  },
});

export const { connect, disconnect } = orderBookSlice.actions;
export const orderBookReducer = orderBookSlice.reducer;