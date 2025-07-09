function getLocalIP() {
  // Vite doesn't allow `os` in browser; we fallback using location.hostname
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  return isLocalhost ? location.hostname : location.hostname;
}

const MODE = import.meta.env.MODE || 'production';
const localIP = getLocalIP();

function replaceLocalhost(url) {
  if (!url) return '';
  if (MODE === 'development') {
    return url.replace('localhost', localIP);
  }
  return url;
}

export const backendUri = replaceLocalhost(import.meta.env.VITE_BACKEND_URL) || `http://${localIP}:8000/api/`;
export const gatewayUri = replaceLocalhost(import.meta.env.VITE_GATEWAY_URL) || `http://${localIP}:8000/gateway/`;
export const gatewayFrontendUri = replaceLocalhost(import.meta.env.VITE_GATEWAY_FRONTEND_URL) || `http://${localIP}:5174`;
