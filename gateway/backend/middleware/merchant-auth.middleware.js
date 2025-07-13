import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ReceiverServiceAccount } from "../models/receiver-service-account.model.js";
import { Account } from "../models/account.model.js";
import mongoose from "mongoose";

export const verifyMerchantJWT = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization header is missing or malformed");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new ApiError(401, "Token is missing");
  }

  const { apiKey, receiverServiceAccountId } = req.body;
  if (!apiKey || !receiverServiceAccountId) {
    throw new ApiError(401, "API key or Service Account Id is missing");
  }
  if( !mongoose.Types.ObjectId.isValid(receiverServiceAccountId)) {
    throw new ApiError(401, "Invalid Receiver Service Account Id format");
  }
  const receiver = await ReceiverServiceAccount.findById(receiverServiceAccountId);
  if (!receiver) {
    throw new ApiError(401, "Receiver does not exist");
  }

  const receiverAccount = await Account.findOne({ accountNumber: receiver.toAccountNumber });
  if (!receiverAccount) {
    throw new ApiError(401, "Receiver account does not exist");
  }

  const filteredApi = receiverAccount.apiKeys.filter((key) => key.key === apiKey);
  if (filteredApi.length === 0) {
    throw new ApiError(401, "API key not found for this account");
  }

  const secret = filteredApi[0].secret;

  try {
    const decoded = jwt.verify(token, secret);

    if (!decoded || !decoded.iat || !decoded.exp) {
      throw new ApiError(401, "Invalid token payload");
    }

    const now = Date.now();
    const iatMs = decoded.iat * 1000;
    const expMs = decoded.exp * 1000;
    const toleranceMs = 10 * 60 * 1000; // 10 minutes

    if (expMs < now) {
      throw new ApiError(401, "Token has expired");
    }

    if (now - iatMs > toleranceMs) {
      throw new ApiError(401, "Token issued too long ago");
    }
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid token: " + error.message);
  }
});

export const verifyMerchantSSE = asyncHandler(async (req, res, next) => {
  const { token, receiverServiceAccountId, apiKey } = req.query;
  if (!token) {
    throw new ApiError(401, "Token is required for SSE connection");
  }

  if (!receiverServiceAccountId || !apiKey) {
    throw new ApiError(401, "Receiver Service Account Id and API key are required");
  }

  if (!mongoose.Types.ObjectId.isValid(receiverServiceAccountId)) {
    throw new ApiError(401, "Invalid Receiver Service Account Id format");
  }

  const receiver = await ReceiverServiceAccount.findById(receiverServiceAccountId);
  if (!receiver) {
    throw new ApiError(401, "Receiver Service Account does not exist");
  }

  const receiverAccount = await Account.findOne({accountNumber:receiver.toAccountNumber})
  if (!receiverAccount) {
    throw new ApiError(401, "Receiver account does not exist");
  }

  const filteredApi = receiverAccount.apiKeys.filter((key) => key.key === apiKey);

  if (filteredApi.length === 0) {
    throw new ApiError(401, "API key not found for this account");
  }

  const secret = filteredApi[0].secret;
  if (!secret) {
    throw new ApiError(401, "API key secret is missing");
  }

  try {
    const decoded = jwt.verify(token, secret);
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid merchant token: " + error.message);
  }
});
