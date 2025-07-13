import { Router } from "express";
import { registerUser,loginUser } from "../controllers/auth.controller.js";

const authRouter= Router();

//Auth
authRouter.route("/register").post(registerUser);
authRouter.route("/login").post(loginUser);

export default authRouter;
