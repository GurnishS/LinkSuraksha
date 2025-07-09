import {Router } from "express";

const gatewayRouter = Router();
import { verifyAccountToken } from "../middleware/gateway-auth.middleware.js";

import { linkAccount,getAccountInfo,transferFunds } from "../controllers/gateway.controller.js";

gatewayRouter.route("/link").post(linkAccount);
gatewayRouter.route("/account").post(verifyAccountToken,getAccountInfo);
gatewayRouter.route("/transfer").post(verifyAccountToken, transferFunds);

export default gatewayRouter;