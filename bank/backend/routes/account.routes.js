import { Router } from "express";

import {
  addAccount,
  loginAccount,
  getAccountById,
  transferFunds,
  fetchAccountTransactions,
  fetchTransactionDetailsById,
} from "../controllers/account.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const accountRouter = Router();

accountRouter.route("/").get(verifyJWT, getAccountById);

accountRouter.route("/").post(addAccount); //intensionally left unsecure
accountRouter.route("/login").post(loginAccount);

accountRouter.route("/transfer").post(verifyJWT, transferFunds);
accountRouter.route("/transactions").get(verifyJWT, fetchAccountTransactions);
accountRouter
  .route("/transactions/:id")
  .get(verifyJWT, fetchTransactionDetailsById);

export default accountRouter;
