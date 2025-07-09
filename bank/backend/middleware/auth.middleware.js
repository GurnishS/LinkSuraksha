import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {Account} from "../models/account.model.js";
export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const authorizationHeader = req.header("Authorization");
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized request");
    }
    const token = authorizationHeader.replace("Bearer ", "");
    if (!token || token === "undefined") {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decodedToken.exp * 1000 < Date.now()) {
      throw new ApiError(401, "Access token has expired");
    }
    const account = await Account.findById(decodedToken?._id).select(
      "accountNumber accountHolder customerId"
    );
    if (!account) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.account = account;
    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});