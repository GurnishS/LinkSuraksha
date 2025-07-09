import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Account } from "../models/account.model.js";

export const verifySharedJWT = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "Authorization header is missing or malformed");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new ApiError(401, "Token is missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.SHARED_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.GATEWAY_ID,
      audience: process.env.BANK_ID,
    });

    if (!decoded || !decoded.iat || !decoded.exp) {
      throw new ApiError(401, "Invalid token payload");
    }

    const now = Date.now();
    const iatMs = decoded.iat * 1000;
    const expMs = decoded.exp * 1000;
    const toleranceMs = Number(process.env.TIME_TOLERANCE || 60) * 1000; // default: 60s

    if (expMs < now) {
      throw new ApiError(401, "Token has expired");
    }

    if (now - iatMs > toleranceMs) {
      throw new ApiError(401, "Time tolerance exceeded");
    }

    // Attach decoded token if needed
    req.data = decoded.data || {};
    console.log("Decoded token data:", req.data);

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid token: " + error.message);
  }
});

export const verifyAccountToken = asyncHandler(async (req, res, next) => {
  const accountToken = req.data.accountToken;
  // console.log("Account Token:", accountToken, req.data);
  if (!accountToken) {
    throw new ApiError(401, "Account token is missing");
  }
  try {
    const decoded = jwt.verify(accountToken, process.env.ACCOUNT_TOKEN_SECRET);

    if (!decoded) {
      throw new ApiError(401, "Invalid account token payload");
    }

    console.log("Decoded account token:", decoded);

    const account = await Account.findById(decoded._id).select(
      "-password -transactionPin"
    );

    if (!account) {
      throw new ApiError(404, "Account not found");
    }

    req.account = account; // Attach account to request object
    

    next();
  } catch (error) {
    console.error("Account token verification error:", error);
    throw new ApiError(401, "Invalid account token: " + error.message);
  }
});