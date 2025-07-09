import BaseLogger from "./base-logger.js";

class TransactionLogger extends BaseLogger {
  constructor() {
    super("transaction");
  }

  // Log transaction creation
  logTransactionCreated(
    transactionId,
    fromUserId,
    toUserId,
    amount,
    req = null
  ) {
    const logData = {
      event: "TRANSACTION_CREATED",
      transactionId, // Unique transaction identifier
      fromUserId, // Sender's user Id
      toUserId, // Recipient's user Id
      amount, // Transaction amount
      ip: req?.ip,
    };

    this.info(logData, "Transaction created");

    if (req?.log) {
      req.log.info(logData, "Transaction created");
    }
  }

  // Log transaction processing completion
  logTransactionProcessed(transactionId, status, processingTime, req = null) {
    const logData = {
      event: "TRANSACTION_PROCESSED",
      transactionId,
      status, // Final status (completed, failed, etc.)
      processingTime, // Time taken to process in milliseconds
      ip: req?.ip,
    };

    this.info(logData, "Transaction processed");

    if (req?.log) {
      req.log.info(logData, "Transaction processed");
    }
  }

  // Log transaction status updates
  logTransactionStatusUpdate(transactionId, oldStatus, newStatus, req = null) {
    const logData = {
      event: "TRANSACTION_STATUS_UPDATE",
      transactionId,
      oldStatus, // Previous status
      newStatus, // New status
      ip: req?.ip,
    };

    this.info(logData, "Transaction status updated");

    if (req?.log) {
      req.log.info(logData, "Transaction status updated");
    }
  }

  logTransactionError(transactionId, error, context = {}, req = null) {
    const logData = {
      event: "TRANSACTION_ERROR",
      transactionId,
      errorCode: error.code || "UNKNOWN_ERROR",
      errorMessage: error.message,
      context, // Additional context about the transaction
      ip: req?.ip,
      userId: context.userId || null,
    };

    this.error(logData, `Transaction error: ${error.message}`);

    if (req?.log) {
      req.log.error(logData, `Transaction error: ${error.message}`);
    }
  }

  logTransactionRejected(transactionId, reason, details = {}, req = null) {
    const logData = {
      event: "TRANSACTION_REJECTED",
      transactionId,
      reason, // e.g., INSUFFICIENT_FUNDS
      details,
      ip: req?.ip,
      userId: details.userId || null,
    };

    this.warn(logData, `Transaction rejected: ${reason}`);

    if (req?.log) {
      req.log.warn(logData, `Transaction rejected: ${reason}`);
    }
  }

  logValidationFailure(transactionId, validationErrors, req = null) {
    const logData = {
      event: "TRANSACTION_VALIDATION_FAILED",
      transactionId,
      validationErrors,
      ip: req?.ip,
    };

    this.warn(logData, "Transaction validation failed");

    if (req?.log) {
      req.log.warn(logData, "Transaction validation failed");
    }
  }
}

export default TransactionLogger;
