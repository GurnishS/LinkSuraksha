import { backendUri } from "../constants.js";

export function connectToSSE(userId, onMessage) {
  const eventSource = new EventSource(`${backendUri}sse/notifications`, {
    withCredentials: false,
  });

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data.message);
  };

  eventSource.onerror = (err) => {
    console.error('SSE error:', err);
    eventSource.close();
  };

  return eventSource;
}
