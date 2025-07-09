import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";

import { GenerateToken } from "../utils/SharedTokenHandler.js";

import mongoose from "mongoose";

import TransactionStatus from "../enums/transaction-status.js";
import { transactionLogger } from "../utils/logger/index.js";
import config from "../constants.js";

const getAccountInfo = asyncHandler(async (req, res) => {
  const { _id } = req.account;
  console.log("Account Id:", _id, req.account);

  if (!_id) {
    throw new ApiError(400, "Account Id is required");
  }

  const account = await Account.findById(_id).select(
    "accountNumber accountHolder customerId ifscCode userId balance"
  );

  if (!account) {
    throw new ApiError(400, "Account not found");
  }

  return res.status(200).json({
    success: true,
    message: "Account information retrieved successfully",
    data: account,
  });
});

const linkAccount = asyncHandler(async (req, res) => {
  const data = req.data.account;
  const { password, transactionPin } = req.body;
  console.log("Linking account with data:", data);

  if (!data) {
    throw new ApiError(400, "Token data is missing");
  }

  if (!password || !transactionPin) {
    throw new ApiError(400, "Password and Transaction Pin are required");
  }

  const requiredFields = [
    "_id",
    "userId",
    "customerId",
    "accountNumber",
    "accountHolder",
    "ifscCode",
  ];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new ApiError(400, `Missing field in token data: ${field}`);
    }
  }

  const account = await Account.findOne({ accountNumber: data.accountNumber });
  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  // Validate account details
  if (
    account.customerId !== data.customerId ||
    account.accountHolder !== data.accountHolder ||
    account.ifscCode !== data.ifscCode
  ) {
    throw new ApiError(400, "Account details do not match");
  }

  // Verify credentials
  const isPasswordCorrect = await account.isPasswordCorrect(password);
  const isTransactionPinCorrect = await account.isTransactionPinCorrect(
    transactionPin
  );

  if (!isPasswordCorrect || !isTransactionPinCorrect) {
    throw new ApiError(401, "Incorrect password or transaction Pin");
  }

  // Generate token
  const accountToken = account.generateAccountToken(data.userId);
  const token = GenerateToken({
    _id: data._id,
    userId: data.userId,
    accountNumber: account.accountNumber,
    customerId: account.customerId,
    accountToken: accountToken,
  });

  // Call gateway
  const response = await fetch(
    `${config.GATEWAY_BACKEND_URL}/bank/confirm-link`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Gateway response error:", await response.text());
    throw new ApiError(500, "Failed to link account with gateway");
  }

  // Save accountToken to DB

  account.userId = data.userId;
  account.accountToken = accountToken;
  await account.save();

  res.status(200).json({
    success: true,
    message: "Account linked successfully",
    data: {
      accountNumber: account.accountNumber,
      customerId: account.customerId,
      accountToken,
    },
  });
});

const transferFunds = asyncHandler(async (req, res) => {
  const { senderTxId } = req.data;
  const account = req.account;

  if (!senderTxId || !account?._id) {
    const validationErrors = {
      senderTxId: !senderTxId ? "Missing sender transaction Id" : null,
      accountId: !account?._id ? "Missing account Id" : null,
    };

    transactionLogger.logValidationFailure(null, validationErrors, req);
    throw new ApiError(400, "Missing senderTxId or account");
  }

  // Step 1: Confirm with Gateway
  const token = GenerateToken({ senderTxId });
  const confirmResponse = await fetch(
    `${config.GATEWAY_BACKEND_URL}/bank/confirm-transfer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!confirmResponse.ok) {
    const errText = await confirmResponse.text();

    transactionLogger.logTransactionRejected(
      null,
      "GATEWAY_CONFIRMATION_FAILED",
      {
        senderTxId,
        //<------check---------->
        statusCode: confirmResponse.status,
        responseText: errText,
        userId: account.customerId,
      },
      req
    );
    throw new ApiError(400, `Failed to confirm with gateway: ${errText}`);
  }

  let gatewayData = null;
  gatewayData = await confirmResponse.json();
  const { toAccountNumber, amount, note, fromAccountNumber } =
    gatewayData || {};

  if (!toAccountNumber || !amount || !fromAccountNumber) {
    const validationErrors = {
      toAccountNumber: !toAccountNumber
        ? "Missing recipient account number"
        : null,
      amount: !amount ? "Missing transaction amount" : null,
      fromAccountNumber: !fromAccountNumber
        ? "Missing sender account number"
        : null,
    };

    transactionLogger.logValidationFailure(null, validationErrors, req);
    throw new ApiError(400, "Invalid confirmation data from gateway");
  }

  // Step 2: Local Transfer
  const session = await mongoose.startSession();
  session.startTransaction();

  let startTime = Date.now();
  let transactionId = null;
  try {
    const fromAccount = await Account.findOne({
      accountNumber: fromAccountNumber,
    }).session(session);
    const toAccount = await Account.findOne({
      accountNumber: toAccountNumber,
    }).session(session);

    if (!fromAccount || !toAccount) {
      const details = {
        senderFound: !!fromAccount,
        receiverFound: !!toAccount,
        //<------check--------->
        userId: account.customerId,
        fromAccountNumber,
        toAccountNumber,
      };

      transactionLogger.logTransactionRejected(
        null,
        "ACCOUNT_NOT_FOUND",
        details,
        req
      );
      throw new ApiError(404, "Account not found");
    }

    if (fromAccount.balance < amount) {
      transactionLogger.logTransactionRejected(
        null,
        "INSUFFICIENT_FUNDS",
        {
          //<------------check---------->
          userId: account.customerId,
          requestedAmount: amount,
          availableBalance: fromAccount.balance,
          fromAccountNumber,
        },
        req
      );
      throw new ApiError(400, "Insufficient funds");
    }

    // Debit and Credit
    fromAccount.balance -= amount;
    toAccount.balance += amount;

    await fromAccount.save({ session });
    await toAccount.save({ session });

    //
    // no transaction id to update status
    //

    // Record Transaction
    const transaction = await Transaction.create(
      [
        {
          fromAccountNumber,
          toAccountNumber,
          amount,
          note,
          status: TransactionStatus.COMPLETED,
        },
      ],
      { session }
    );

    transactionId = transaction[0]._id;

    //<---------check------------>
    transactionLogger.logTransactionCreated(
      transactionId,
      fromAccount.customerId || fromAccountNumber,
      toAccount.customerId || toAccountNumber,
      amount,
      req
    );

    await session.commitTransaction();
    transactionLogger.logTransactionProcessed(
      transactionId,
      TransactionStatus.COMPLETED,
      Date.now() - startTime,
      req
    );
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Funds transferred successfully",
      data: transaction[0],
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    if (transactionId) {
      transactionLogger.logTransactionProcessed(
        transactionId,
        TransactionStatus.FAILED,
        Date.now() - startTime,
        req
      );
    } else {
      // Log general error if no transaction was created
      const context = {
        senderTxId,
        //<---------check---------->
        gatewayData,
        userId: account.customerId,
      };

      transactionLogger.logTransactionError(null, err, context, req);
    }

    throw new ApiError(500, `Transaction failed: ${err.message}`);
  }
});

export { getAccountInfo, linkAccount, transferFunds };
