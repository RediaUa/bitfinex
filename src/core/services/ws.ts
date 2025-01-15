import { isEventObject, parseSubscribeMessage } from './utils' 

const MAX_ATTEMPS_COUNT = 5;
const BASE_RECONNECT_INTERVAL = 1000;
const WAIT_FOR_TIME = 3000;

type Messsage = string | ArrayBuffer | ArrayBufferView | Blob

type ListenerTypeToEventMap = {
  open: void;
  close: WebSocketCloseEvent;
  message: WebSocketMessageEvent;
  error: Event;
  subscribe: number
  unsubscribe: number
};

type ListenerType = keyof ListenerTypeToEventMap
type ListenerCallback<Type extends ListenerType, ReturnType = void> = (event: ListenerTypeToEventMap[Type]) => ReturnType

type WaitForOptions<Event = unknown> = { time: number, checkIsNeededEvent?: (event: Event) => boolean}

class WebSocketServiceBase {
  private _reconnectId: NodeJS.Timeout | null = null;
  private _shouldReconnectOnClose: boolean = true
  private _isConnected: boolean = false;

  private url: string
  private ws: WebSocket | null = null;
  listeners: Map<ListenerType, ListenerCallback<ListenerType>[]> = new Map()
  
  constructor(url: string) {
    this.url = url;
    this.ws = this.connect(url);
  }

  addListener = <Type extends ListenerType>(type: Type, listener: ListenerCallback<Type>): number => {
    let listeners = this.listeners.get(type)
    const callback = listener as ListenerCallback<ListenerType>
    
    if (listeners) {
      listeners.push(callback);
    } else {
      listeners = [callback];
      this.listeners.set(type, listeners);
    }
    
    return listeners.length - 1;
  }

  removeListeners = (type: ListenerType, index: number) => {
    this.listeners.get(type)?.splice(index, 1);
  }
  
  resetListeners = () => {
    this.listeners.clear();
    this.listeners = new Map([
      ['open', []],
      ['close', []],
      ['message', []],
      ['error', []]
    ])
  }

  connect = (url: string) => {
    console.log('ws connect to: ', url)
    const ws = new WebSocket(url);

    ws.onopen = this.onOpen;
    ws.onclose = this.onClose;
    ws.onmessage = this.onMessage;
    ws.onerror = this.onError;

    return ws
  }

  reconnect = () => {
    // TODO maybe reject if unsucesfull
    const tryToReconnect = (attemps = 1) => {
 
      this._reconnectId = setTimeout(() => {
        if (attemps <= MAX_ATTEMPS_COUNT) {
          this.ws = this.connect(this.url)

          if (!this._isConnected) {
            tryToReconnect(++attemps)
          }
        }
      }, BASE_RECONNECT_INTERVAL * attemps)
    }

    tryToReconnect()
  }

  stopReconnect = () => {
    if (this._reconnectId) {
      clearTimeout(this._reconnectId)
      this._reconnectId = null
    }

    this._shouldReconnectOnClose = false
  }

  disconnect = async () => {
    try {
      if(this.ws) {
        this._shouldReconnectOnClose = false;

        this.ws.close();
        await this.waitFor('close')

        this.ws = null;
        this.resetListeners();
      }
    } catch(e) {
      console.log('failed disconnect')
    }
  }

  send = <TMessage extends Messsage = string>(message: TMessage) => {
    if(this.ws && this.isConnected) {
      this.ws.send(message);
    }
  }

  notifyEvent = (type: ListenerType, event?: ListenerTypeToEventMap[ListenerType]) => {
    for(const listener of this.listeners.get(type) || []) {
      listener(event);
    }
  }

  onOpen = () => {
    if (this._reconnectId) {
      this.stopReconnect()
    }

    this._isConnected = true;
    this.notifyEvent('open');
  };

  onClose: ListenerCallback<'close'> = (event) => {
    if(this._shouldReconnectOnClose) {
      // if lose connection unexpectedly
      // try to restore it
      this.reconnect();
      return 
    }

    this._isConnected = false;
    this.notifyEvent('close', event);
    console.log('ws closed')
  }

  onMessage: ListenerCallback<'message'> = (event) => { 
    this.notifyEvent('message', event);
  }

  onError: ListenerCallback<'error'> = (event) => {
    this.notifyEvent('error', event);
  }

  waitFor = (type: ListenerType, { time, checkIsNeededEvent }: Partial<WaitForOptions> = {}) => {
    let listenerId: number;

    return new Promise<ListenerTypeToEventMap[ListenerType] | Error>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Can not catch event!'))
      }, time || WAIT_FOR_TIME)


      listenerId = this.addListener(type, (event) => {
        if(checkIsNeededEvent ? checkIsNeededEvent(event) : true){
          clearTimeout(timeoutId)
          resolve(event)
        }
      })
    }).finally(() => {
      this.removeListeners(type, listenerId)
    })  
  }

  get isConnected(): boolean {
    return this._isConnected && Boolean(this.ws?.readyState === WebSocket.OPEN);
  }
}
class WebSocketService extends WebSocketServiceBase {
  private chanId: number | null = null
  constructor(url: string, channel: string, data: Record<string, string>) {
    super(url);
    this.addListener('open', () => this.subscribe(channel, data));
  }

  subscribe = async (channel: string, data: Record<string, string>): Promise<void> => {
    const subscribeMsg = JSON.stringify({ 
      event: 'subscribe', 
      channel, 
      ...data
    })

    this.send(subscribeMsg);

    try {
      const event = await this.waitFor('message', { checkIsNeededEvent: (event) => {
        const data = parseSubscribeMessage(event)
        const isSubscribed = isEventObject(data) && data.event === 'subscribed'

        return Boolean(isSubscribed)
      }})

      const data = parseSubscribeMessage(event)

      this.notifyEvent('subscribe', data.chanId)
      this.chanId = data.chanId
      console.log('subscribed to ', channel, data.chanId)
    } catch (e) {
      console.log('Failed subscribe to ', channel)
    }
  }

  unsubscribe = async () => {
    const unsubscribeMsg = JSON.stringify({ 
      event: 'unsubscribe', 
      chanId: this.chanId, 
    })

    this.send(unsubscribeMsg)

    try {
      const event = await this.waitFor('message', { checkIsNeededEvent: (event) => {
        const data = parseSubscribeMessage(event)
        const isUnsubscribed = isEventObject(data) && data.event === 'unsubscribed'

        return Boolean(isUnsubscribed)
      }})

      const data = parseSubscribeMessage(event)

      this.notifyEvent('unsubscribe', data.chanId)
      this.chanId = null
      console.log('unsubscribed from ', data.chanId)
    } catch (e) {
      console.log('Failed unsubscribe from ', this.chanId)
    }

  }
}


export default WebSocketService