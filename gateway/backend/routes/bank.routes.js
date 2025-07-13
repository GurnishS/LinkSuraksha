import {Router } from "express";

import {confirmLinkAccount,confirmTransfer} from "../controllers/bank.controller.js";

const bankRouter = Router();

bankRouter.route("/confirm-link").post(confirmLinkAccount);
bankRouter.route("/confirm-transfer").post(confirmTransfer);

export default bankRouter;