import { Account } from "../models/account.model.js";
import { User } from "../models/user.model.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import accountStatus from "../enums/account-status.js";

import { GenerateToken } from "../utils/SharedTokenHandler.js";
import { ReceiverServiceAccount } from "../models/receiver-service-account.model.js";
import { SenderServiceAccount } from "../models/sender-service-account.model.js";
import senderTransactionStatus from "../enums/sender-transaction-status.js";
import { response } from "express";
import { sendNotification } from "../utils/sseService.js";

import { MerchantTransaction } from "../models/merchant-transaction.model.js";
import mongoose, { Mongoose } from "mongoose";
import merchantTransactionStatus from "../enums/merchant-transaction-status.js";
import { sendMerchantNotification } from "../utils/merchantSSESerivice.js";
import config from "../constants.js";

const fetchAccountInfo = async (accountToken) => {
  try {
    if (!accountToken) {
      console.warn("Account token is missing.");
      throw new ApiError(400, "Account token is missing.");
    }

    const token = GenerateToken({
      accountToken,
    });

    const response = await fetch(`${config.BANK_BACKEND_URL}/gateway/account`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(
        "Failed to fetch account info:",
        response.status,
        response.statusText
      );
      throw new ApiError(500, "Failed to fetch account info");
    }
    console.log("Account info fetched successfully for token:", accountToken);
    return await response.json();
  } catch (error) {
    console.error("Error fetching account info:", error);
    throw new ApiError(500, "Error fetching account info: " + error.message);
  }
};

const getLinkedAccounts = asyncHandler(async (req, res) => {
  try {
    const { _id } = req.user;

    const linkedAccounts = await Account.find({ userId: _id }).select(
      "-gatewayPin"
    );

    if (!linkedAccounts || linkedAccounts.length === 0) {
      throw new ApiError(404, "No linked accounts found");
    }

    // Split verified and non-verified accounts
    const verifiedAccounts = linkedAccounts.filter(
      (account) => account.status === accountStatus.VERIFIED
    );
    const nonVerifiedAccounts = linkedAccounts.filter(
      (account) => account.status != accountStatus.VERIFIED
    );

    // Fetch info for verified accounts
    const accountPromises = verifiedAccounts.map(async (account) => {
      console.log("Fetching account info for:", account.accountNumber);

      if (!account.accountToken) {
        console.warn(
          "Account token is missing for account:",
          account.accountNumber
        );
        throw new ApiError(
          400,
          "Account token is missing for account: " + account.accountNumber
        );
      }
      const accountInfo = await fetchAccountInfo(account.accountToken);

      return {
        ...account.toObject(),
        balance: accountInfo?.data?.balance ?? 0, // Add only balance
      };
    });

    const verifiedAccountsWithInfo = await Promise.all(accountPromises);

    //fetch receiver service account for verified accounts
    const receiverAccounts = await ReceiverServiceAccount.find({
      toAccountNumber: {
        $in: verifiedAccounts.map((acc) => acc.accountNumber),
      },
    });

    // Add receiverServiceAccount to each verified account
    verifiedAccountsWithInfo.forEach((account) => {
      const receiverAccount = receiverAccounts.find(
        (rec) => rec.toAccountNumber === account.accountNumber
      );
      if (receiverAccount) {
        account.receiverServiceAccount = receiverAccount._id;
        account.displayName = receiverAccount.displayName;
      }
    });

    // Convert non-verified accounts to plain objects (no accountInfo added)
    const nonVerifiedPlain = nonVerifiedAccounts.map((account) =>
      account.toObject()
    );

    // Merge both verified+info and non-verified accounts
    const allAccounts = [...verifiedAccountsWithInfo, ...nonVerifiedPlain];

    res.status(200).json({
      success: true,
      accounts: allAccounts,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server Error",
    });
  }
});

const unlinkAccount = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { accountId } = req.body;
  if (!accountId) {
    throw new ApiError(400, "Account Id is required.");
  }
  const account = await Account.findById(accountId);
  if (!account) {
    throw new ApiError(404, "Account not found.");
  }
  if (account.userId.toString() != _id.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to unlink this account."
    );
  }
  if (account.status === accountStatus.VERIFIED && account.accountToken) {
    // If the account is verified, we can unlink it
    account.status = accountStatus.UNLINKED;
    account.accountToken = null; // Clear the account token
    await account.save();
    return res.status(200).json({
      success: true,
      message: "Account unlinked successfully.",
    });
  } else {
    throw new ApiError(400, "Account is not linked.");
  }
});

const deleteLinkedAccount = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { accountId } = req.body;
  if (!accountId) {
    throw new ApiError(400, "Account Id is required.");
  }
  const account = await Account.findById(accountId);
  if (!account) {
    throw new ApiError(404, "Account not found.");
  }

  if (account.userId.toString() != _id.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to delete this account."
    );
  }

  //Delete receiverServiceAccount
  const deletedRecieverAccount = await ReceiverServiceAccount.find({
    toAccountNumber: account.accountNumber,
  });
  if (deletedRecieverAccount.length > 0) {
    const deleteReceiverAccount = await ReceiverServiceAccount.deleteMany({
      toAccountNumber: account.accountNumber,
    });
    if (!deleteReceiverAccount) {
      throw new ApiError(400, "Failed to delete receiver service account.");
    }
  }

  const deletedAccount = await Account.findByIdAndDelete(accountId);
  if (!deletedAccount) {
    throw new ApiError(400, "Failed to delete account from DB");
  }

  res.status(200).json({
    success: true,
    message: "Account deleted successfully.",
  });
});

const linkAccount = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { accountNumber, accountHolder, customerId, ifscCode, gatewayPin } =
    req.body;

  if (
    !accountHolder ||
    !accountNumber ||
    !customerId ||
    !ifscCode ||
    !gatewayPin
  ) {
    throw new ApiError(400, "All fields are required.");
  }

  const existingAccount = await Account.findOne({ accountNumber });

  if (existingAccount) {
    if (
      existingAccount.status == accountStatus.VERIFIED &&
      existingAccount.accountToken
    ) {
      throw new ApiError(400, "Account already linked.");
    } else {
      if (Date.now() - new Date(existingAccount.updatedAt).getTime() < 60000) {
        // 60 seconds in milliseconds
        throw new ApiError(
          400,
          "Please wait before requesting new redirect link."
        );
      } else {
        // Update fields if they don't match
        let hasChanges = false;

        if (existingAccount.userId.toString() != _id.toString()) {
          existingAccount.userId = _id;
          hasChanges = true;
        }

        if (existingAccount.customerId != customerId) {
          existingAccount.customerId = customerId;
          hasChanges = true;
        }
        if (existingAccount.accountHolder != accountHolder) {
          existingAccount.accountHolder = accountHolder;
          hasChanges = true;
        }
        if (existingAccount.ifscCode != ifscCode) {
          existingAccount.ifscCode = ifscCode;
          hasChanges = true;
        }
        if (existingAccount.gatewayPin != gatewayPin) {
          existingAccount.gatewayPin = gatewayPin;
          hasChanges = true;
        }

        // Save changes and update modifiedAt
        if (hasChanges) {
          await existingAccount.save();
        }

        const token = GenerateToken({
          _id: existingAccount._id,
          customerId: existingAccount.customerId,
          ifscCode: existingAccount.ifscCode,
          accountHolder: existingAccount.accountHolder,
          accountNumber: existingAccount.accountNumber,
          userId: _id,
        });

        return res.status(200).json({
          success: true,
          account: {
            _id: existingAccount._id,
            userId: existingAccount.userId,
            accountNumber: existingAccount.accountNumber,
            accountHolder: existingAccount.accountHolder,
            customerId: existingAccount.customerId,
            ifscCode: existingAccount.ifscCode,
          },
          redirect: `bank-frontend/link/${existingAccount.customerId}/${token}`,
        });
      }
    }
  }

  const newAccount = await Account.create({
    userId: _id,
    accountNumber,
    accountHolder,
    customerId,
    ifscCode,
    gatewayPin,
  });

  if (!newAccount) {
    throw new ApiError(500, "Failed to link account.");
  }

  // Exclude sensitive fields manually
  const account = {
    _id: newAccount._id,
    userId: newAccount.userId,
    accountNumber: newAccount.accountNumber,
    accountHolder: newAccount.accountHolder,
    customerId: newAccount.customerId,
    ifscCode: newAccount.ifscCode,
  };

  const token = GenerateToken({ account });

  res.status(201).json({
    success: true,
    account,
    redirect: `bank-frontend/link/${customerId}/${token}`,
  });
});

const updateDisplayName = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { receiverServiceAccountId, displayName } = req.body;
  if (!receiverServiceAccountId || !displayName) {
    throw new ApiError(
      400,
      "Receiver Service Account Id and display name are required."
    );
  }
  const receiverAccount = await ReceiverServiceAccount.findById(
    receiverServiceAccountId
  );
  if (!receiverAccount) {
    throw new ApiError(404, "Receiver Service Account not found.");
  }
  if (receiverAccount.userId.toString() !== _id.toString()) {
    throw new ApiError(
      403,
      "You do not have permission to update this account."
    );
  }
  // Update display name
  receiverAccount.displayName = displayName;
  await receiverAccount.save();
  res.status(200).json({
    success: true,
    message: "Display name updated successfully.",
    data: receiverAccount,
  });
});

const transferFunds = asyncHandler(async (req, res) => {
  const { transferType } = req.body;
  const { fromAccountId, note, gatewayPin, transactionId, amount } = req.body;

  if (!fromAccountId || !amount || !gatewayPin) {
    throw new ApiError(400, "Missing required fields.");
  }
  var transaction;

  var toAccount = null;
  if (transferType == "service") {
    const { receiverServiceAccount } = req.body;
    if (!receiverServiceAccount) {
      throw new ApiError(400, "Receiver Id is required.");
    }

    if (transactionId) {
      if (!mongoose.Types.ObjectId.isValid) {
        throw new ApiError(400, "Invalid Transaction Id format");
      }
      transaction = await MerchantTransaction.findById(transactionId);
      if (
        !transaction ||
        !transaction.status ||
        transaction.status != merchantTransactionStatus.INITIATED
      ) {
        throw new ApiError(400, "Invalid Transaction.");
      }
      if (transaction.amount != amount) {
        throw new ApiError(
          400,
          "Amount do not match with that of transaction."
        );
      }
      if (transaction.amount != amount) {
        throw new ApiError(
          400,
          "Amount do not match with that of transaction."
        );
      }
      if (transaction.receiverServiceId != receiverServiceAccount) {
        throw new ApiError(
          400,
          "Receiver do not match with that of transaction."
        );
      }
    }

    //get toAccountNumber from receiver
    const receiver = await ReceiverServiceAccount.findById(
      receiverServiceAccount
    );
    if (!receiver || !receiver.toAccountNumber) {
      throw new ApiError(400, "Receiver Id is invalid.");
    }
    toAccount = receiver.toAccountNumber;
  } else if (transferType == "account") {
    const { toAccountNumber } = req.body;
    if (transactionId) {
      throw new ApiError(400, "Invalid Transfer Request");
    }
    if (!toAccountNumber) {
      throw new ApiError(400, "To account number is required.");
    }
    toAccount = toAccountNumber;
  }

  // Step 1: Validate sender account
  const senderAccount = await Account.findById(fromAccountId);
  if (
    !senderAccount ||
    !senderAccount.accountToken ||
    senderAccount.status != accountStatus.VERIFIED
  ) {
    throw new ApiError(400, "Sender account is not linked or invalid.");
  }

  // Check if gatewayPin matches
  const isGatewayPinCorrect = await senderAccount.isGatewayPinCorrect(
    gatewayPin
  );
  if (!isGatewayPinCorrect) {
    throw new ApiError(403, "Invalid gateway Pin.");
  }

  // Step 2: Validate balance
  const senderAccountInfo = await fetchAccountInfo(senderAccount.accountToken);
  if (!senderAccountInfo?.data || senderAccountInfo.data.balance < amount) {
    throw new ApiError(400, "Insufficient balance.");
  }

  // Step 3: Record the transaction as INITIATED
  const senderTx = await SenderServiceAccount.create({
    userId: senderAccount.userId,
    fromAccountNumber: senderAccount.accountNumber,
    toAccountNumber: toAccount,
    amount,
    note,
    status: senderTransactionStatus.INITIATED,
  });

  // Step 4: Request sender bank to transfer to LinkSuraksha account
  const debitToken = GenerateToken({
    accountToken: senderAccount.accountToken,
    senderTxId: senderTx._id,
  });

  const debitResponse = await fetch(
    `${config.BANK_BACKEND_URL}/gateway/transfer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${debitToken}`,
      },
    }
  );

  const debitResult = await debitResponse.json();
  if (!debitResponse.ok || !debitResult.success) {
    senderTx.status = senderTransactionStatus.REFUNDED;
    console.error(debitResponse.status, debitResponse.statusText);
    await senderTx.save();
    throw new ApiError(500, "Debit failed from sender’s bank.");
  }

  // Update transaction status to DEBITED
  senderTx.status = senderTransactionStatus.DEBITED;
  await senderTx.save();

  // Step 5: Transfer from LinkSuraksha to receiver
  const creditToken = GenerateToken({
    accountToken: process.env.LINKSURAKSHA_ACCOUNT_TOKEN,
    senderTxId: senderTx._id,
  });

  const creditResponse = await fetch(
    `${config.BANK_BACKEND_URL}/gateway/transfer`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creditToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  const creditResult = await creditResponse.json();
  if (!creditResponse.ok || !creditResult.success) {
    // Attempt to refund to sender (future enhancement)
    senderTx.status = senderTransactionStatus.REFUNDED;
    await senderTx.save();
    throw new ApiError(500, "Credit to receiver failed from LinkSuraksha.");
  }

  // Step 6: Mark as Credited
  senderTx.status = senderTransactionStatus.CREDITED;
  await senderTx.save();

  try {
    //Send notification to reciever
    const receiverAccount = await ReceiverServiceAccount.findOne({
      toAccountNumber: toAccount,
    });

    if (receiverAccount) {
      sendNotification(receiverAccount.userId.toString(), {
        type: "TRANSFER_COMPLETED",
        message: `You have received a transfer of ${amount} from ${senderTx._id}.`,
      });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
  }

  try {
    if (transaction) {
      transaction.status = merchantTransactionStatus.COMPLETED;
      await transaction.save();
      sendMerchantNotification(transaction._id.toString(), {
        type: "COMPLETED",
        message: `You have received a transfer of ${amount} from ${senderTx._id}.`,
      });
    }
  } catch (err) {
    console.log("Something went wrong while updating Transaction.");
  }

  //Step 7: Mark as Completed
  senderTx.status = senderTransactionStatus.COMPLETED;
  await senderTx.save();

  return res.status(200).json({
    success: true,
    message: "Transfer completed successfully.",
    transactionId: senderTx._id,
  });
});

const fetchTransactions = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const userAccountNumbersDocs = await Account.find({
    userId: _id,
    status: accountStatus.VERIFIED,
  }).select("accountNumber");

  if (!userAccountNumbersDocs || userAccountNumbersDocs.length === 0) {
    throw new ApiError(404, "No linked accounts found.");
  }

  const userAccountNumbers = userAccountNumbersDocs.map(
    (doc) => doc.accountNumber
  );

  const transactionsSent = await SenderServiceAccount.find({ userId: _id })
    .sort({ createdAt: -1 })
    .select("-accountToken");

  const transactionsReceived = await SenderServiceAccount.find({
    toAccountNumber: { $in: userAccountNumbers },
  })
    .sort({ createdAt: -1 })
    .select("-userId -fromAccountNumber");

  if (
    (!transactionsSent || transactionsSent.length === 0) &&
    (!transactionsReceived || transactionsReceived.length === 0)
  ) {
    throw new ApiError(404, "No transactions found.");
  }

  transactionsReceived.map((transaction) => {
    transaction.fromAccountNumber = process.env.LINKSURAKSHA_ACCOUNT_NUMBER;
    return transaction;
  });

  res.status(200).json({
    success: true,
    transactions: {
      sent: transactionsSent,
      received: transactionsReceived,
    },
  });
});

const verifyReceiverId = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate receiverId
  if (!id) {
    throw new ApiError(400, "Receiver Id is required.");
  }

  // Check if receiver exists
  const receiverAccount = await ReceiverServiceAccount.findById(id);
  if (!receiverAccount) {
    throw new ApiError(404, "Receiver account not found.");
  }

  res.status(200).json({
    success: true,
    message: "Receiver Id is valid.",
    account: {
      _id: receiverAccount._id,
      displayName: receiverAccount.displayName,
    },
  });
});

const toggleMerchantStatus = asyncHandler(async (req, res) => {
  const { accountId } = req.body;
  if (!accountId) {
    throw new ApiError(400, "Account Id is required");
  }

  const account = await Account.findById(accountId);
  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  account.isMerchant = !account.isMerchant;

  //Delete api keys
  if (account.isMerchant) {
    account.apiKeys = [];
  }

  await account.save();

  res.status(200).json({
    success: true,
    message: `Merchant status updated to ${
      account.isMerchant ? "active" : "inactive"
    }`,
    data: {
      isMerchant: account.isMerchant,
    },
  });
});

const generateMerchantAPIKey = asyncHandler(async (req, res) => {
  const { accountId, name } = req.body;
  if (!accountId || !name) {
    throw new ApiError(400, "Account Id and name are required");
  }

  const account = await Account.findById(accountId);
  if (!account || !account.isMerchant) {
    throw new ApiError(404, "Merchant account not found");
  }

  // Generate a random and unique API key (you can use a more secure method in production)
  const apiKey =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now();

  const apiSecret =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now();

  // Save the API key to the account (you may want to store it in a separate collection)
  account.apiKeys.push({ name: name, key: apiKey, secret: apiSecret });
  await account.save();

  res.status(200).json({
    success: true,
    message: "API key generated successfully",
    apiKey: {
      key: apiKey,
      secret: apiSecret,
    },
  });
});

const deleteMerchantAPIKey = asyncHandler(async (req, res) => {
  const { accountId, apiKey } = req.body;
  if (!accountId || !apiKey) {
    throw new ApiError(400, "Account Id and API key are required");
  }

  const account = await Account.findById(accountId);
  if (!account || !account.isMerchant) {
    throw new ApiError(404, "Merchant account not found");
  }

  // Remove the API key from the account
  account.apiKeys = account.apiKeys.filter((key) => key.key !== apiKey);
  await account.save();

  res.status(200).json({
    success: true,
    message: "API key deleted successfully",
  });
});

const fetchMerchantTransaction = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  console.log("Fetching transaction with Id:", transactionId);

  if (!transactionId) {
    throw new ApiError(400, "Transaction Id is required");
  }

  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new ApiError(400, "Invalid Transaction Id format");
  }

  const transaction = await MerchantTransaction.findById(transactionId);

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  if (transaction.status != merchantTransactionStatus.INITIATED) {
    throw new ApiError(
      400,
      "You can only inquire about initiated transactions"
    );
  }

  res.status(200).json({
    success: true,
    transaction,
  });
});

export {
  getLinkedAccounts,
  linkAccount,
  unlinkAccount,
  deleteLinkedAccount,
  transferFunds,
  fetchTransactions,
  verifyReceiverId,
  updateDisplayName,
  toggleMerchantStatus,
  generateMerchantAPIKey,
  deleteMerchantAPIKey,
  fetchMerchantTransaction,
};
