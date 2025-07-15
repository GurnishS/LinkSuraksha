import dotenv from 'dotenv';

dotenv.config();

export const DB_NAME = "LinkSuraksha";

const isCodespace = process.env.CODESPACES === "true";

function replaceLocalhost(url) {
//   const localUrl = new URL(url);
//   return `https://${process.env.CODESPACE_NAME}-${localUrl.port}.app.github.dev`;
    return url
}

const config = {
  GATEWAY_BACKEND_URL: isCodespace
    ? replaceLocalhost(process.env.GATEWAY_BACKEND_URL)
    : process.env.GATEWAY_BACKEND_URL,

  GATEWAY_FRONTEND_URL: isCodespace
    ? replaceLocalhost(process.env.GATEWAY_FRONTEND_URL)
    : process.env.GATEWAY_FRONTEND_URL,

  BANK_BACKEND_URL: isCodespace
    ? replaceLocalhost(process.env.BANK_BACKEND_URL)
    : process.env.BANK_BACKEND_URL,

  BANK_FRONTEND_URL: isCodespace
    ? replaceLocalhost(process.env.BANK_FRONTEND_URL)
    : process.env.BANK_FRONTEND_URL,
};

export default config;