import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Account } from "../models/account.model.js";
import { MerchantTransaction } from "../models/merchant-transaction.model.js";
import merchantTransactionStatus from "../enums/merchant-transaction-status.js";
import { ReceiverServiceAccount } from "../models/receiver-service-account.model.js";



const initiateTransaction = asyncHandler(async (req,res) => {
  const {receiverServiceAccountId,amount}=req.body;

  if (!receiverServiceAccountId || !amount) {
    throw new ApiError(400, "Receiver Service Account Id and amount are required");
  }

  const receiver = await ReceiverServiceAccount.findById(receiverServiceAccountId);
  if (!receiver) {
    throw new ApiError(404, "Receiver Service Account not found");
  }

  const newTransaction = await MerchantTransaction.create({
    receiverServiceId: receiver._id,
    amount: amount,
    status: merchantTransactionStatus.INITIATED, // Set initial status to PENDING
  });

  res.status(201).json({
    success: true,
    message: "Transaction initiated successfully",
    transactionId: newTransaction._id,
    paymentUrl: process.env.GATEWAY_FRONTEND_URL + "/merchant/" + newTransaction._id,
    transaction: newTransaction,
  });
});

const inquireTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  if (!transactionId) {
    throw new ApiError(400, "Transaction Id is required");
  }
  const transaction = await MerchantTransaction.findById(transactionId);
  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }
  res.status(200).json({
    success: true,
    message: "Transaction retrieved successfully",
    transaction: transaction,
  });
});

export { initiateTransaction, inquireTransaction };
