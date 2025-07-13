import { Account } from "../models/account.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import accountStatus from "../enums/account-status.js";
import { ReceiverServiceAccount } from "../models/receiver-service-account.model.js";
import { SenderServiceAccount } from "../models/sender-service-account.model.js";
import senderTransactionStatus from "../enums/sender-transaction-status.js";

const confirmLinkAccount = asyncHandler(async (req, res) => {
  const data = req.data;

  if (!data) {
    throw new ApiError(400, "Invalid request data.");
  }

  const requiredFields = [
    "accountToken",
    "accountNumber",
    "userId",
    "_id",
    "customerId",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ApiError(400, `Missing required field: ${field}`);
    }
  }

  const accountRequest = await Account.findById(data._id);

  if (!accountRequest) {
    throw new ApiError(404, "Account request not found.");
  }

  if (
    accountRequest.status !== (accountStatus.PENDING || accountStatus.UNLINKED)
  ) {
    throw new ApiError(400, "Account request is not pending or unlinked.");
  }

  if (
    accountRequest.accountNumber !== data.accountNumber ||
    accountRequest.customerId !== data.customerId
  ) {
    throw new ApiError(400, "Account number or customer Id does not match.");
  }

  // Update status and token
  accountRequest.status = accountStatus.VERIFIED;
  accountRequest.accountToken = data.accountToken;

  await accountRequest.save();

  //Also add receiver account to receive money
  // Check if the account is already linked
  const existingReceiverAccount = await ReceiverServiceAccount.findOne({
    userId: data.userId,
    toAccountNumber: data.accountNumber,
  });
  var receiverAccountId = null;
  if (existingReceiverAccount) {
    receiverAccountId = existingReceiverAccount._id;
  } else {
    // Create a new receiver service account
    const newReceiverAccount = await ReceiverServiceAccount.create({
      userId: data.userId,
      toAccountNumber: data.accountNumber,
    });
    receiverAccountId = newReceiverAccount._id;
  }

  res.status(200).json({
    success: true,
    message: "Account linked successfully.",
    account: {
      accountNumber: accountRequest.accountNumber,
      status: accountRequest.status,
      customerId: accountRequest.customerId,
    },
    receiverAccountId: receiverAccountId,
  });
});

const confirmTransfer = asyncHandler(async (req, res) => {
  const { senderTxId } = req.data;

  if (!senderTxId) {
    throw new ApiError(400, "Missing senderTxId in request");
  }

  const senderTx = await SenderServiceAccount.findById(senderTxId);

  if (!senderTx) {
    throw new ApiError(404, "Sender transaction not found");
  }

  // Acceptable states: INITIATED or DEBITED
  if (
    senderTx.status !== senderTransactionStatus.INITIATED &&
    senderTx.status !== senderTransactionStatus.DEBITED
  ) {
    throw new ApiError(
      400,
      "Transaction is not in a valid state for confirmation"
    );
  }

  // Determine the direction based on status
  let fromAccountNumber, toAccountNumber;

  if (senderTx.status === senderTransactionStatus.INITIATED) {
    fromAccountNumber = senderTx.fromAccountNumber;
    toAccountNumber = process.env.LINKSURAKSHA_ACCOUNT_NUMBER;
  } else {
    fromAccountNumber = process.env.LINKSURAKSHA_ACCOUNT_NUMBER;
    toAccountNumber = senderTx.toAccountNumber;
  }

  res.status(200).json({
    success: true,
    senderTxId: senderTx._id,
    fromAccountNumber,
    toAccountNumber,
    amount: senderTx.amount,
    note: senderTx.note,
  });
});

export { confirmLinkAccount, confirmTransfer };
