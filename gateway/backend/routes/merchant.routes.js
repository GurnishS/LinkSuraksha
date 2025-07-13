import {Router } from "express";
import { initiateTransaction,inquireTransaction } from "../controllers/merchant.controller.js";
import { verifyMerchantJWT, verifyMerchantSSE } from "../middleware/merchant-auth.middleware.js";
import { addMerchant, removeMerchant } from "../utils/merchantSSESerivice.js";


const merchantRouter = Router();

merchantRouter.route("/initiate-transaction").post(verifyMerchantJWT, initiateTransaction);
merchantRouter.route("/inquire-transaction").get(verifyMerchantJWT, inquireTransaction);

// Secure SSE connection using ?token=<JWT>
merchantRouter.get("/sse", verifyMerchantSSE, (req, res) => {
  const transactionId = req.query.transactionId;
  if(!transactionId) {
    res.status(400).send("Transaction Id is required");
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write(`: connected to notification stream for ${transactionId}\n\n`);

  addMerchant(transactionId, res);

  req.on("close", () => {
    removeMerchant(transactionId);
  });
});

export default merchantRouter;