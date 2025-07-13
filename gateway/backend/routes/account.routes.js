import { Router } from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";

import {updateDisplayName, getLinkedAccounts,linkAccount ,unlinkAccount,fetchMerchantTransaction ,deleteLinkedAccount,transferFunds,fetchTransactions,verifyReceiverId} from "../controllers/account.controller.js";
import {toggleMerchantStatus ,generateMerchantAPIKey,deleteMerchantAPIKey} from "../controllers/account.controller.js";

const accountRouter = Router();

accountRouter.route("/").get(verifyJWT,getLinkedAccounts);
accountRouter.route("/link").post(verifyJWT,linkAccount);
accountRouter.route("/link").delete(verifyJWT,deleteLinkedAccount);
accountRouter.route("/unlink").post(verifyJWT,unlinkAccount);
accountRouter.route("/transfer").post(verifyJWT,transferFunds);
accountRouter.route("/transactions").get(verifyJWT,fetchTransactions);
accountRouter.route("/receiver/:id").get(verifyJWT,verifyReceiverId);
accountRouter.route("/display-name").post(verifyJWT,updateDisplayName);

accountRouter.route("/inquire-transaction/:transactionId").get(verifyJWT,fetchMerchantTransaction);

//merchant routes
accountRouter.route("/merchant/toggle").post(verifyJWT,toggleMerchantStatus);
accountRouter.route("/merchant/api-key").post(verifyJWT,generateMerchantAPIKey);
accountRouter.route("/merchant/api-key").delete(verifyJWT,deleteMerchantAPIKey);

export default accountRouter;