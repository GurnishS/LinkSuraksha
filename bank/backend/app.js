import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { httpLogger } from "./utils/logger/index.js";
import config from "./constants.js";
import { GenerateToken } from "./utils/SharedTokenHandler.js";
import { verifySharedJWT } from "./middleware/gateway-auth.middleware.js";

dotenv.config({
  path: "./.env",
});

const app = express();

app.use(httpLogger);

app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

app.route("/health").get((req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

import accountRouter from "./routes/account.routes.js";
app.use("/api/accounts", accountRouter);

import gatewayRouter from "./routes/gateway.routes.js";
app.use("/gateway", verifySharedJWT, gatewayRouter);

export default app;
