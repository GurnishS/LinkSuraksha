import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { GenerateToken } from "./utils/SharedTokenHandler.js";
import { verifySharedJWT } from "./middleware/bank-auth.middleware.js";

dotenv.config({
  path: "./.env",
});

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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

import authRouter from "./routes/auth.routes.js";
app.use("/api/auth", authRouter);

import userRouter from "./routes/user.routes.js";
app.use("/api/users", userRouter);

import bankRouter from "./routes/bank.routes.js";
app.use("/bank", verifySharedJWT, bankRouter);

import accountRouter from "./routes/account.routes.js";
app.use("/api/accounts", accountRouter);

import merchantRouter from "./routes/merchant.routes.js";
app.use("/merchant", merchantRouter);

import sseRouter from "./routes/sse.routes.js";
app.use("/api/sse", sseRouter);

export default app;
