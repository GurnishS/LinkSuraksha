import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import { initiateTransaction } from "../utils/merchantHandler";

const LinkSurakshaQR = ({
  amount,
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentPending,
  className = "",
  qrSize = 256,
  showAmount = true,
  showTransactionId = true,
  showStatus = true,
  statusMessages = {
    initiating: "Initiating payment...",
    initiated: "Scan QR code to pay",
    completed: "✅ Payment completed successfully!",
    failed: "❌ Payment failed",
    error: "❌ Error occurred. Please try again.",
  },
  buttonText = "Generate Payment QR",
  buttonClassName = "",
  statusClassName = "",
  amountClassName = "",
  transactionIdClassName = "",
  autoInitiate = false,
  onTransactionInitiated,
}) => {
  const [qrCodeTransactionId, setQrCodeTransactionId] = useState("");
  const [status, setStatus] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eventSource, setEventSource] = useState(null);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Auto-initiate transaction if autoInitiate is true
  useEffect(() => {
    if (autoInitiate && amount > 0) {
      handleInitiatePayment();
    }
  }, [autoInitiate, amount]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  const generateQRCode = (transactionId) => {
    const qrData = {
      transactionId: transactionId,
      url: `/merchant/${transactionId}`,
      gateway: "LinkSuraksha",
    };
    return JSON.stringify(qrData);
  };

  const handleStatusUpdate = (newStatus) => {
    setStatus(newStatus);

    if (newStatus.includes("completed")) {
      setIsPaymentComplete(true);
      if (onPaymentSuccess) {
        onPaymentSuccess({ transactionId, amount, paymentUrl });
      }
    } else if (newStatus.includes("failed")) {
      if (onPaymentFailure) {
        onPaymentFailure({ transactionId, amount, error: newStatus });
      }
    } else if (newStatus.includes("pending")) {
      if (onPaymentPending) {
        onPaymentPending({ transactionId, amount });
      }
    }
  };

  const handleInitiatePayment = async () => {
    if (!amount || amount <= 0) {
      setStatus("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    setStatus(statusMessages.initiating);
    setIsPaymentComplete(false);

    try {
      const result = await initiateTransaction(amount, handleStatusUpdate);

      setTransactionId(result.transactionId);
      setPaymentUrl(result.paymentUrl);
      setEventSource(result.eventSource);

      setStatus(statusMessages.initiated);

      // Generate QR code
      setQrCodeTransactionId(result.transactionId);
      

      setIsLoading(false);

      if (onTransactionInitiated) {
        onTransactionInitiated({
          transactionId: result.transactionId,
          paymentUrl: result.paymentUrl,
          amount,
        });
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setStatus(statusMessages.error + ": " + error.message);
      setIsLoading(false);

      if (onPaymentFailure) {
        onPaymentFailure({ amount, error: error.message });
      }
    }
  };

  const resetPayment = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
    }
    setQrCodeTransactionId("");
    setStatus("");
    setTransactionId("");
    setPaymentUrl("");
    setIsPaymentComplete(false);
    setIsLoading(false);
  };

  return (
    <div className={`linksuraksha-qr ${className}`}>
      {showAmount && amount > 0 && (
        <div className={`amount-display ${amountClassName}`}>
          <h3>Amount: ₹{amount}</h3>
        </div>
      )}

      {!autoInitiate && !qrCodeTransactionId && (
        <button
          onClick={handleInitiatePayment}
          disabled={isLoading || !amount || amount <= 0}
          className={`initiate-payment-btn ${buttonClassName}`}
        >
          {isLoading ? "Generating..." : buttonText}
        </button>
      )}

      {showTransactionId && transactionId && (
        <div className={`transaction-id ${transactionIdClassName}`}>
          <p>
            <strong>Transaction Id:</strong> {transactionId}
          </p>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700"
          >
            Payment Link
          </a>
        </div>
      )}

      {qrCodeTransactionId && !isPaymentComplete && (
        <div className="flex-col items-center justify-center qr-code-container">
          <QRCode
            id="qr-code"
            size={qrSize}
            value={generateQRCode(qrCodeTransactionId)}
            viewBox={`0 0 256 256`}
          />
          <p>Scan this QR code to complete payment</p>
        </div>
      )}

      {showStatus && status && (
        <div className={`payment-status ${statusClassName}`}>
          <p>{status}</p>
        </div>
      )}

      {isPaymentComplete && (
        <div className="payment-complete-actions">
          <button onClick={resetPayment} className="reset-payment-btn">
            New Payment
          </button>
        </div>
      )}

      {qrCodeTransactionId && !isPaymentComplete && (
        <div className="payment-actions">
          <button onClick={resetPayment} className="cancel-payment-btn">
            Cancel Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default LinkSurakshaQR;
