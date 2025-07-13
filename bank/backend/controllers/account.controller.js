import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

import { Account } from "../models/account.model.js";
import { Transaction } from "../models/transaction.model.js";
import mongoose from "mongoose";
import TransactionStatus from "../enums/transaction-status.js";
import { authLogger, transactionLogger } from "../utils/logger/index.js";

const addAccount = asyncHandler(async (req, res) => {
  const {
    accountNumber,
    accountHolder,
    address,
    phone,
    ifscCode,
    branchName,
    customerId,
    password,
    transactionPin,
  } = req.body;

  if (
    !accountNumber ||
    !accountHolder ||
    !address ||
    !phone ||
    !ifscCode ||
    !branchName ||
    !customerId ||
    !password ||
    !transactionPin
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingAccount = await Account.findOne({
    accountNumber: accountNumber,
  });

  if (existingAccount) {
    throw new ApiError(400, "Account with this account number already exists");
  }

  const existingAccountByCustomerId = await Account.findOne({
    customerId: customerId,
  });

  if (existingAccountByCustomerId) {
    throw new ApiError(400, "Account with this customer Id already exists");
  }

  const newAccount = new Account({
    accountNumber,
    accountHolder,
    address,
    phone,
    ifscCode,
    branchName,
    customerId,
    password,
    transactionPin,
  });

  await newAccount.save();

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    account: newAccount,
  });
});

const loginAccount = asyncHandler(async (req, res) => {
  const { customerId, password } = req.body;

  if (!customerId || !password) {
    authLogger.logLoginFailed(
      customerId,
      "Invalid password or CustomerId",
      req
    );
    throw new ApiError(400, "Customer Id and password are required");
  }

  const account = await Account.findOne({ customerId });

  const isPasswordCorrect = await account?.isPasswordCorrect(password);
  console.log("Is password correct:", account, isPasswordCorrect);

  if (!account || !isPasswordCorrect) {
    authLogger.logLoginFailed(
      customerId,
      "Invalid password or CustomerId",
      req
    );
    throw new ApiError(401, "Invalid customer Id or password");
  }

  //Generate JWT token
  const accessToken = account.generateAccessToken();

  // Save the access token in the account document
  account.accessToken = accessToken;

  await account.save();

  authLogger.logUserLogin(customerId, account.accountHolder, req);

  res.status(200).json({
    success: true,

    message: "Login successful",
    account: {
      _id: account._id,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      customerId: account.customerId,
      accessToken: accessToken,
    },
  });
});

const getAccountById = asyncHandler(async (req, res) => {
  const { _id } = req.account;

  if (!_id) {
    throw new ApiError(401, "Id is required");
  }
  const account = await Account.findById(_id).select(
    "-password -transactionPin"
  );

  if (!account) {
    throw new ApiError(404, "Account details not found.");
  }

  return res.status(200).json({
    success: true,
    message: "Account Info fetched successfully",
    account: account,
  });
});

const fetchAccountTransactions = asyncHandler(async (req, res) => {
  const { _id } = req.account;
  if (!_id) {
    throw new ApiError(401, "Id is required");
  }

  const account = await Account.findById(_id);
  if (!account) {
    throw new ApiError(404, "Account not found.");
  }

  console.log("Fetching transactions for account:", account.accountNumber);

  const transactionsReceived = await Transaction.find({
    toAccountNumber: account.accountNumber,
  });
  const transactionsSent = await Transaction.find({
    fromAccountNumber: account.accountNumber,
  });
  if (
    (!transactionsReceived || transactionsReceived.length === 0) &&
    (!transactionsSent || transactionsSent.length === 0)
  ) {
    throw new ApiError(404, "No transactions found for this account.");
  }

  return res.status(200).json({
    success: true,
    message: "Transactions fetched successfully",
    transactions: {
      received: transactionsReceived,
      sent: transactionsSent,
    },
  });
});

const fetchTransactionDetailsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { accountNumber } = req.account;
  if (!id) {
    throw new ApiError(401, "Transaction Id is required");
  }
  const transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }
  if (
    transaction.fromAccountNumber !== accountNumber &&
    transaction.toAccountNumber !== accountNumber
  ) {
    throw new ApiError(403, "You are not authorized to view this transaction");
  }
  return res.status(200).json({
    success: true,
    message: "Transaction details fetched successfully",
    transaction,
  });
});

const transferFunds = asyncHandler(async (req, res) => {
  const { toAccountNumber, ifscCode, amount, transactionPin } = req.body;
  const { _id } = req.account;

  if (!toAccountNumber || !ifscCode || !amount || !transactionPin) {
    const validationErrors = {
      toAccountNumber: !toAccountNumber
        ? "Missing recipient account number"
        : null,
      ifscCode: !ifscCode ? "Missing IFSC code" : null,
      amount: !amount ? "Missing transaction amount" : null,
      transactionPin: !transactionPin ? "Missing transaction Pin" : null,
    };

    transactionLogger.logValidationFailure(null, validationErrors, req);
    throw new ApiError(400, "All fields are required");
  }

  if (+amount <= 0) {
    transactionLogger.logValidationFailure(
      null,
      { amount: "Amount must be positive" },
      req
    );
    throw new ApiError(400, "Amount must be greater than zero");
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  let startTime;
  let transaction = null;
  try {
    const senderAccount = await Account.findById(_id).session(session);
    const recieverAccount = await Account.findOne({
      accountNumber: toAccountNumber,
      ifscCode,
    }).session(session);

    if (!senderAccount || !recieverAccount) {
      const details = {
        senderFound: !!senderAccount,
        receiverFound: !!recieverAccount,

        //check this-------------------
        userId: req.account.customerId,
      };

      transactionLogger.logTransactionRejected(
        null,
        "ACCOUNT_NOT_FOUND",
        details
      );
      throw new ApiError(404, "One or both accounts not found");
    }

    if (senderAccount.accountNumber === recieverAccount.accountNumber) {
      transactionLogger.logTransactionRejected(
        null,
        "SAME_ACCOUNT_TRANSFER",
        { userId: senderAccount.customerId },
        req
      );
      throw new ApiError(400, "Cannot transfer to same account");
    }

    const isPinCorrect = await senderAccount.isTransactionPinCorrect(
      transactionPin
    );
    if (!isPinCorrect) {
      transactionLogger.logTransactionRejected(
        null,
        "INVALID_TRANSACTION_PIN",
        { userId: senderAccount.customerId },
        req
      );
      throw new ApiError(401, "Invalid transaction Pin");
    }

    if (senderAccount.balance < +amount) {
      transactionLogger.logTransactionRejected(
        null,
        "INSUFFICIENT_FUNDS",
        {
          userId: senderAccount.customerId,
          requestedAmount: +amount,
          availableBalance: senderAccount.balance,
        },
        req
      );
      throw new ApiError(400, "Insufficient balance");
    }

    transaction = new Transaction({
      fromAccountNumber: senderAccount.accountNumber,
      toAccountNumber: recieverAccount.accountNumber,
      amount: +amount,
      status: TransactionStatus.INITIATED,
    });

    startTime = Date.now();
    transactionLogger.logTransactionCreated(
      transaction._id,
      senderAccount.customerId,
      recieverAccount.customerId,
      amount,
      req
    );

    await transaction.save({ session });

    senderAccount.balance -= +amount;
    transactionLogger.logTransactionStatusUpdate(
      transaction._id,
      TransactionStatus.INITIATED,
      TransactionStatus.DEDUCTED,
      req
    );

    recieverAccount.balance += +amount;
    transactionLogger.logTransactionStatusUpdate(
      transaction._id,
      TransactionStatus.DEDUCTED,
      TransactionStatus.CREDITED,
      req
    );

    await senderAccount.save({ session });
    await recieverAccount.save({ session });

    transaction.status = TransactionStatus.COMPLETED;
    await transaction.save({ session });

    await session.commitTransaction();

    let processingTime = Date.now() - startTime;

    transactionLogger.logTransactionProcessed(
      transaction._id,
      TransactionStatus.COMPLETED,
      processingTime,
      req
    );

    res.status(200).json({
      success: true,
      message: "Funds transferred successfully",
      transaction,
    });
  } catch (error) {
    await session.abortTransaction();

    const context = {
      senderAccountId: req.account._id,
      senderCustomerId: req.account.customerId,
      recipientAccountNumber: toAccountNumber,
      amount: amount,
      transactionId: transaction?._id,
      userId: _id,
    };

    transactionLogger.logTransactionError(
      transaction?._id,
      error,
      context,
      req
    );

    try {
      const failTx = await Transaction.findOne({
        fromAccountNumber: req.account.accountNumber,
        status: "INITIATED",
      });
      if (failTx) {
        failTx.status = TransactionStatus.FAILED;
        await failTx.save();
        const processingTime = Date.now() - startTime;

        transactionLogger.logTransactionProcessed(
          failTx._id,
          TransactionStatus.FAILED,
          processingTime,
          req
        );
      }
    } catch (err) {}
  } finally {
    session.endSession();
  }
});

export {
  addAccount,
  loginAccount,
  getAccountById,
  fetchAccountTransactions,
  transferFunds,
  fetchTransactionDetailsById,
};
