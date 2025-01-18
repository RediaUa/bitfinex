import { isEventObject, parseSubscribeMessage } from './utils' 

const MAX_ATTEMPS_COUNT = 5;
const WAIT_FOR_OPEN_ON_RECONNECT_TIME = 500;
const DEFAULT_WAIT_FOR_TIME = 3000;

type Messsage = string | ArrayBuffer | ArrayBufferView | Blob

type ListenerTypeToEventMap = {
  open: void;
  close: WebSocketCloseEvent;
  message: WebSocketMessageEvent;
  error: Event | Error;
  subscribe: number
  unsubscribe: number
};

type ListenerType = keyof ListenerTypeToEventMap
type ListenerCallback<Type extends ListenerType, ReturnType = void> = (event: ListenerTypeToEventMap[Type]) => ReturnType | Promise<ReturnType>

type WaitForOptions<Event = unknown> = { time: number, checkIsNeededEvent?: (event: Event) => boolean}

class WebSocketServiceBase {
  private _reconnectId: NodeJS.Timeout | null = null;
  private _shouldReconnectOnClose: boolean = true

  private url: string
  private ws: WebSocket | null = null;
  listeners: Map<ListenerType, ListenerCallback<ListenerType>[]> = new Map()
  
  constructor(url: string) {
    this.url = url;
    this.connect(url);
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
    this.ws = ws
  }

  /**
   * Attempts to restore connection
   * 
   * Resolves with `true` if it's successful, otherwise resolves with `false` after reaching max attempts
   * 
   * * The delay between attempts increases proportionally to the attempt count
   */
  reconnect = (): Promise<boolean> => new Promise((resolve) => {
    const tryToReconnect = (attemps = 1) => {
      this._reconnectId = setTimeout(() => {
        if (attemps <= MAX_ATTEMPS_COUNT) {
         this.connect(this.url)
         this.waitFor('open', { time: WAIT_FOR_OPEN_ON_RECONNECT_TIME }).then(() => {
          resolve(true)
         }).catch(() => {
          tryToReconnect(++attemps)
         })

         return 
        }

        resolve(false)
      }, WAIT_FOR_OPEN_ON_RECONNECT_TIME * attemps)
    }

    tryToReconnect()
  })

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

  send = async <TMessage extends Messsage = string> (message: TMessage) => {
    if(!this.ws || !this.isConnected) {
      const isSuccess = await this.reconnect()
      
      if (!isSuccess) {
        this.notifyEvent('error', new Error('Unable to send message: Connection is dead'))  
        return
      }
    }

    this.ws && this.ws.send(message);
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
    this.notifyEvent('open');
  };

  onClose: ListenerCallback<'close'> = async (event) => {
    if(this._shouldReconnectOnClose) {
      // if lose connection unexpectedly
      // try to restore it
      const isSuccess = await this.reconnect()
      if (isSuccess) return 

      this.notifyEvent('error', new Error('Connection is dead'))
    }

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
      }, time || DEFAULT_WAIT_FOR_TIME)


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
    return Boolean(this.ws && this.ws.readyState === WebSocket.OPEN);
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
      throw e
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
      throw e
    }

  }
}


export default WebSocketService