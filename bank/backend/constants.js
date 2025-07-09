export const DB_NAME = "BankDB";

import dotenv from 'dotenv';
import os from 'os';

dotenv.config();

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();
console.log("Local IP Address:", LOCAL_IP);
const MODE = process.env.MODE;

function replaceLocalhost(url) {
  return MODE === 'development' ? url.replace('localhost', LOCAL_IP) : url;
}

const config = {
  MODE,
  CORS_ORIGIN: replaceLocalhost(process.env.CORS_ORIGIN),
  GATEWAY_BACKEND_URL: replaceLocalhost(process.env.GATEWAY_BACKEND_URL),
  GATEWAY_FRONTEND_URL: replaceLocalhost(process.env.GATEWAY_FRONTEND_URL),
};

export default config;
