import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";

import { currentUserProfile,deleteUserProfile } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/me").get(verifyJWT,currentUserProfile);
userRouter.route("/me").delete(verifyJWT,deleteUserProfile);


export default userRouter;