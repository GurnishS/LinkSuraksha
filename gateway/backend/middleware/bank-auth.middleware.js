import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifySharedJWT = asyncHandler(async (req, _, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401,"Authorization header is missing or malformed");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new ApiError(401,"Token is missing");
  }

  try {
    const decoded = jwt.verify(token, process.env.SHARED_SECRET, {
      algorithms: ["HS256"],
      issuer: process.env.BANK_ID,
      audience: process.env.GATEWAY_ID,
    });

    if (!decoded || !decoded.iat || !decoded.exp) {
      throw new ApiError(401,"Invalid token payload");
    }

    const now = Date.now();
    const iatMs = decoded.iat * 1000;
    const expMs = decoded.exp * 1000;
    const toleranceMs = Number(process.env.TIME_TOLERANCE || 60) * 1000; // default: 60s

    if (expMs < now) {
      throw new ApiError(401,"Token has expired");
    }

    if (now - iatMs > toleranceMs) {
      throw new ApiError(401,"Time tolerance exceeded");
    }

    // Attach decoded token if needed
    req.data = decoded.data || {};
    console.log("Decoded token data:", req.data);

    next();
  } catch (error) {
    throw new ApiError(401,"Invalid token: " + error.message);
  }
});
