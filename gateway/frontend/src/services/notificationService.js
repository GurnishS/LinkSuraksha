import config from "../../../backend/constants";

export function connectToSSE(userId, onMessage) {
  const eventSource = new EventSource(`${config.GATEWAY_BACKEND_URL}/api/sse/notifications`, {
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
