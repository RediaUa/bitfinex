export const isEventObject = (data: unknown): data is { event: string } => {
  return typeof data === 'object' && data !== null && 'event' in data;
};

const hasData = (data: unknown): data is { data: string } => {
  return typeof data === 'object' && data !== null && 'data' in data;
}

export const parseSubscribeMessage = (event: unknown) => {
  return hasData(event) && JSON.parse(event.data);
}