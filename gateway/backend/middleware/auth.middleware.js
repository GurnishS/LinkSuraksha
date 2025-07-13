import jwt from "jsonwebtoken";

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import {User} from "../models/user.model.js";

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
    const user = await User.findById(decodedToken?._id).select(
      "-password -accessToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifySSEJWT = async (req, res, next) => {
  try {
    const token = req.query.token;
    if (!token || token === "undefined") {
      throw new ApiError(401, "Missing token in query");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (decoded.exp * 1000 < Date.now()) {
      throw new ApiError(401, "Token expired");
    }

    const user = await User.findById(decoded?._id).select("-password -accessToken");
    if (!user) {
      throw new ApiError(401, "Invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("SSE Auth Error:", error);
    res.status(401).end("Unauthorized SSE request");
  }
};