export const avatarUri = "/avatar.png";

const isCodespace = import.meta.env.VITE_CODESPACES === "true";

const config = {
  GATEWAY_BACKEND_URL: isCodespace
    ? "/gateway-backend"
    : import.meta.env.VITE_GATEWAY_BACKEND_URL,

  GATEWAY_FRONTEND_URL: isCodespace
    ? "/gateway-frontend"
    : import.meta.env.VITE_GATEWAY_FRONTEND_URL,

  BANK_BACKEND_URL: isCodespace
    ? "/bank-backend"
    : import.meta.env.VITE_BANK_BACKEND_URL,

  BANK_FRONTEND_URL: isCodespace
    ? "/bank-frontend"
    : import.meta.env.VITE_BANK_FRONTEND_URL,
};

export default config;