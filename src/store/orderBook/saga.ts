import { 
  call,
  put,
  takeLatest,
  takeLeading, 
  take, select, 
  cancel, 
  fork 
} from 'redux-saga/effects';
import { eventChannel, Task, EventChannel } from 'redux-saga';
import { PayloadAction } from '@reduxjs/toolkit'
import { connect, disconnect, destroyWs, initWs, setSnapshot, updateSnapshot, setChannel, updateOptions, initUpdateOptions } from './slice'
import { isSnapshot, handleSnapshotMessage, isOrderBookMessage } from './utils'
import { PUBLIC_API } from './constants'
import { EmitEventTypeEnum, SocketEvent, OrderBookData, Options, OrderBookItem } from './types'
import { DEFAULT_OPTIONS, UPDATE_INTERVAL } from './constants'

import WebSocketService from '../../core/services/ws'

type WsServiceReturn = {
  channel: EventChannel<SocketEvent>
  wsService: WebSocketService
}

const createWSService = (): WsServiceReturn => {
  const wsService = new WebSocketService(PUBLIC_API, 'book', DEFAULT_OPTIONS);

  const channel = eventChannel<SocketEvent>((emit) => {
    wsService.addListener('open', () => emit({ type: EmitEventTypeEnum.open }));
    wsService.addListener('close', () => emit({ type: EmitEventTypeEnum.close }));
    wsService.addListener('message', (event) => {
      const payload = JSON.parse(event.data)
      emit({ type: EmitEventTypeEnum.message, payload })

    });
    wsService.addListener('subscribe', (channel) => {
      emit({ type: EmitEventTypeEnum.subscribe, payload: channel })
    });
    wsService.addListener('unsubscribe', () => {
      emit({ type: EmitEventTypeEnum.unsubscribe, payload: null })
    });

    return () => {
      wsService.disconnect();
    };
  });

  return {
    wsService,
    channel
  }
}

const watchWSServiceSaga = (channel: EventChannel<SocketEvent>) => function* () {
  let orderBookBuffer: OrderBookItem[] = []
  let updatedAt: number = Date.now()

  try {
    while(true) {
      const event: SocketEvent = yield take(channel);
  
      if (event.type === EmitEventTypeEnum.open) {
        yield put(connect());
      }
  
      if (event.type === EmitEventTypeEnum.close) {
        yield put(disconnect());
      }
     
      if (event.type === EmitEventTypeEnum.message) {
        const message = event.payload

        if (isOrderBookMessage(message)) {
          if (isSnapshot(message)) {
            const orderBook: OrderBookData = yield select(state => state.orderBook.data);
            if (!orderBook.asks.length && !orderBook.bids.length) {
              // set full snapshot if no data 
              const payload = handleSnapshotMessage(message)
              yield put(setSnapshot(payload));
            } else {
              // bunch of entites
              yield put(updateSnapshot(message[1]));
            }
          } else {
            // collect single entities to bunch
            orderBookBuffer.push(message[1])
            if (Date.now() - updatedAt > UPDATE_INTERVAL) {
              yield put(updateSnapshot(orderBookBuffer));
              orderBookBuffer = []
              updatedAt = Date.now()
            }
          }
        }
      }
  
      if(event.type === EmitEventTypeEnum.subscribe) {
        yield put(setChannel(event.payload as number))
      }

      if(event.type === EmitEventTypeEnum.unsubscribe) {
        yield put(setChannel(event.payload as null))
        yield put(setSnapshot({ bids: [], asks: [] }))
        // clear buffer
        orderBookBuffer = []
      }
    }
  } finally {
    channel.close()
  }
}

function* watchUpdateOptionsSaga(wsService: WebSocketService) {
    yield takeLeading(initUpdateOptions.type, function* (action: PayloadAction<Partial<Options>>) {
      const previousOptions: Options = yield select((state) => state.orderBook.options)
      try {
        yield put(updateOptions(action.payload))
        yield call(wsService.unsubscribe);
        yield call(wsService.subscribe, 'book', { ...previousOptions, ...action.payload });
      } catch (e) {
        // rollback options
        yield put(updateOptions(previousOptions))
        console.log('[watchUpdateOptionsSaga.catch]: ', e)
      }
    });
}

export function* orderBookSaga() {
  yield takeLatest(initWs.type, function* () {
    const { channel, wsService }: WsServiceReturn = yield call(createWSService);

    const wsTask: Task = yield fork(watchWSServiceSaga(channel))
    const watchOptionsTask: Task = yield fork(watchUpdateOptionsSaga, wsService);

    yield take(destroyWs.type)

    yield cancel(wsTask);
    yield cancel(watchOptionsTask);

    yield put(setSnapshot({ bids: [], asks: [] }))
    yield put(updateOptions(DEFAULT_OPTIONS))
    yield put(disconnect())
    yield put(setChannel(null))
  });
}
