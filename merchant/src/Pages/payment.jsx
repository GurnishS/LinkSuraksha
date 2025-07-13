import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LinkSurakshaQR from '../components/LinkSurakshaQR';
import '../CSS/payment.css';
import '../CSS/LinkSurakshaQR.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { amount } = location.state || { amount: 1500 };

  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    // You can redirect to success page or show success message
    setTimeout(() => {
      navigate('/', { 
        state: { 
          message: 'Payment completed successfully!',
          transactionId: paymentData.transactionId,
          amount: paymentData.amount
        }
      });
    }, 20000);
  };

  const handlePaymentFailure = (errorData) => {
    console.error('Payment failed:', errorData);
    // Handle payment failure - could show error message or retry options
  };

  const handlePaymentPending = (pendingData) => {
    console.log('Payment pending:', pendingData);
    // Handle pending payment - could show waiting state
  };

  const handleTransactionInitiated = (transactionData) => {
    console.log('Transaction initiated:', transactionData);
    // Handle transaction initiation - could log analytics
  };

  return (
    <div className="payment-page">
      <div className="payment-header">
        <h2>Complete Your Payment</h2>
        <p>Secure payment powered by LinkSuraksha Gateway</p>
      </div>

      <div className="payment-container">
        <div className="qr-payment-section">
          <LinkSurakshaQR
            amount={amount}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailure={handlePaymentFailure}
            onPaymentPending={handlePaymentPending}
            onTransactionInitiated={handleTransactionInitiated}
            autoInitiate={true}
            className="payment-qr"
            qrSize={300}
            showAmount={true}
            showTransactionId={true}
            showStatus={true}
            buttonText="Generate Payment QR"
            statusMessages={{
              initiating: 'Setting up your payment...',
              initiated: 'Scan the QR code with any UPI app to pay',
              pending: '⏳ Waiting for payment confirmation...',
              completed: '✅ Payment completed successfully!',
              failed: '❌ Payment failed. Please try again.',
              error: '❌ Something went wrong. Please retry.'
            }}
          />
        </div>

        <div className="payment-footer">
          <p className="security-note">
            🔒 Your payment is secured with industry-standard encryption
          </p>
          <div className="gateway-info">
            <small>Powered by LinkSuraksha Payment Gateway</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
