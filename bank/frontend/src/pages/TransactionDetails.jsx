import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import styles from "../styles/transaction-details.module.css";
import { backendUri } from "../constants";

const TransactionDetails = () => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  const showToast = (message, type) => {
    Toastify({
      text: message,
      duration: 4000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: type === 'success' 
          ? "linear-gradient(135deg, #0f5132, #198754)" 
          : "linear-gradient(135deg, #842029, #dc3545)",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "600",
        padding: "16px 20px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      },
      onClick: function(){}
    }).showToast();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return '#16a34a';
      case 'INITIATED':
        return '#eab308';
      case 'DEDUCTED':
        return '#f59e0b';
      case 'CREDITED':
        return '#10b981';
      case 'FAILED':
        return '#dc2626';
      case 'REFUNDED':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
          </svg>
        );
      case 'FAILED':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z"/>
          </svg>
        );
      case 'INITIATED':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7"/>
          </svg>
        );
      case 'DEDUCTED':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M17,13H7V11H17"/>
          </svg>
        );
      case 'CREDITED':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,7H11V11H7V13H11V17H13V13H17V11H13V7Z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7"/>
          </svg>
        );
    }
  };

  const getTransactionType = () => {
    if (!transaction) return '';
    const customerData = JSON.parse(sessionStorage.getItem("customerData") || "{}");
    const currentAccountNumber = customerData.accountNumber;
    
    if (transaction.toAccountNumber === currentAccountNumber) {
      return 'received';
    } else if (transaction.fromAccountNumber === currentAccountNumber) {
      return 'sent';
    }
    return 'unknown';
  };

  const getOtherAccountNumber = () => {
    if (!transaction) return '';
    const customerData = JSON.parse(sessionStorage.getItem("customerData") || "{}");
    const currentAccountNumber = customerData.accountNumber;
    
    if (transaction.toAccountNumber === currentAccountNumber) {
      return transaction.fromAccountNumber;
    } else {
      return transaction.toAccountNumber;
    }
  };

  const fetchTransactionDetails = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      
      if (!accessToken) {
        showToast("Please login to continue", "error");
        navigate("/login");
        return;
      }

      const response = await fetch(`${backendUri}accounts/transactions/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTransaction(data.transaction);
      } else {
        if (response.status === 401) {
          showToast("Session expired. Please login again.", "error");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("customerData");
          navigate("/login");
        } else if (response.status === 403) {
          showToast("You are not authorized to view this transaction", "error");
          navigate("/transactions");
        } else if (response.status === 404) {
          showToast("Transaction not found", "error");
          navigate("/transactions");
        } else {
          showToast(data.message || "Failed to fetch transaction details", "error");
        }
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("customerData");
    showToast("Logged out successfully", "success");
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  useEffect(() => {
    if (id) {
      fetchTransactionDetails();
    } else {
      navigate("/transactions");
    }
  }, [id]);

  if (loading) {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['loading-spinner']}>
          <svg className={styles['spinner']} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6" stroke="currentColor" strokeWidth="4" fill="none"/>
          </svg>
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className={styles['error-container']}>
        <div className={styles['error-content']}>
          <h2>Transaction Not Found</h2>
          <p>The transaction you're looking for doesn't exist or you don't have permission to view it.</p>
          <button onClick={() => navigate("/transactions")} className={styles['error-button']}>
            Back to Transactions
          </button>
        </div>
      </div>
    );
  }

  const transactionType = getTransactionType();
  const otherAccount = getOtherAccountNumber();

  return (
    <div className={styles['transaction-details-container']}>
      {/* Header */}
      <header className={styles['transaction-details-header']}>
        <div className={styles['header-content']}>
          <div className={styles['header-left']}>
            <button onClick={() => navigate('/transactions')} className={styles['back-button']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
              </svg>
              Back to Transactions
            </button>
            <div className={styles['page-title']}>
              <h1>Transaction Details</h1>
              <p>Complete information about this transaction</p>
            </div>
          </div>
          
          <div className={styles['header-actions']}>
            <button onClick={handleLogout} className={styles['logout-button']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles['transaction-details-main']}>
        {/* Transaction Summary Card */}
        <div className={styles['summary-card']}>
          <div className={styles['summary-header']}>
            <div className={styles['transaction-icon']} style={{ 
              backgroundColor: transactionType === 'received' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)', 
              color: transactionType === 'received' ? '#16a34a' : '#dc2626' 
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                {transactionType === 'received' ? (
                  <path d="M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L21.66,6.22L12.78,10.61C12.93,10.39 13,10.2 13,10A1,1 0 0,0 12,9A1,1 0 0,0 11,10A1,1 0 0,0 12,11C12.35,11 12.63,10.86 12.82,10.63L3.94,6.22L2.5,4.77L12.21,10.39C13.39,10.9 14,11.88 14,13A3,3 0 0,1 12,16Z"/>
                ) : (
                  <path d="M2,10.96C1.5,10.68 1.35,10.07 1.63,9.59L3.13,7.24C3.41,6.75 4.02,6.61 4.5,6.89L12,11.54L19.5,6.89C19.98,6.61 20.59,6.75 20.87,7.24L22.37,9.59C22.65,10.07 22.5,10.68 22,10.96L12.65,16.3C12.28,16.47 11.72,16.47 11.35,16.3L2,10.96Z"/>
                )}
              </svg>
            </div>
            <div className={styles['summary-info']}>
              <h2>{transactionType === 'received' ? 'Money Received' : 'Money Sent'}</h2>
              <div className={styles['transaction-amount']} style={{ 
                color: transactionType === 'received' ? '#16a34a' : '#dc2626' 
              }}>
                {transactionType === 'received' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </div>
            </div>
            <div className={styles['status-badge']} style={{ 
              backgroundColor: `${getStatusColor(transaction.status)}20`,
              color: getStatusColor(transaction.status) 
            }}>
              <div className={styles['status-icon']}>
                {getStatusIcon(transaction.status)}
              </div>
              <span>{transaction.status}</span>
            </div>
          </div>
        </div>

        {/* Transaction Information */}
        <div className={styles['details-section']}>
          <h3>Transaction Information</h3>
          <div className={styles['details-grid']}>
            <div className={styles['detail-item']}>
              <div className={styles['detail-label']}>Transaction Id</div>
              <div className={styles['detail-value']}>{transaction._id}</div>
            </div>

            <div className={styles['detail-item']}>
              <div className={styles['detail-label']}>Amount</div>
              <div className={styles['detail-value']} style={{ 
                color: transactionType === 'received' ? '#16a34a' : '#dc2626',
                fontWeight: '700'
              }}>
                {formatCurrency(transaction.amount)}
              </div>
            </div>

            <div className={styles['detail-item']}>
              <div className={styles['detail-label']}>Status</div>
              <div className={styles['detail-value']}>
                <span className={styles['status-indicator']} style={{ 
                  backgroundColor: `${getStatusColor(transaction.status)}20`,
                  color: getStatusColor(transaction.status) 
                }}>
                  <div className={styles['status-dot']} style={{ 
                    backgroundColor: getStatusColor(transaction.status) 
                  }}></div>
                  {transaction.status}
                </span>
              </div>
            </div>

            <div className={styles['detail-item']}>
              <div className={styles['detail-label']}>Transaction Type</div>
              <div className={styles['detail-value']}>
                <span className={styles['type-indicator']} style={{ 
                  backgroundColor: transactionType === 'received' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                  color: transactionType === 'received' ? '#16a34a' : '#dc2626'
                }}>
                  {transactionType === 'received' ? 'Credit' : 'Debit'}
                </span>
              </div>
            </div>

            <div className={styles['detail-item']}>
              <div className={styles['detail-label']}>Date & Time</div>
              <div className={styles['detail-value']}>{formatDate(transaction.createdAt)}</div>
            </div>

            <div className={styles['detail-item']}>
              <div className={styles['detail-label']}>Last Updated</div>
              <div className={styles['detail-value']}>{formatDate(transaction.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className={styles['accounts-section']}>
          <h3>Account Information</h3>
          <div className={styles['accounts-grid']}>
            <div className={styles['account-card']}>
              <div className={styles['account-header']}>
                <div className={styles['account-icon']} style={{ 
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: '#d4af37'
                }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V5H14V3H1V21H19V17Z"/>
                  </svg>
                </div>
                <div className={styles['account-info']}>
                  <h4>From Account</h4>
                  <p className={styles['account-number']}>{transaction.fromAccountNumber}</p>
                </div>
              </div>
            </div>

            <div className={styles['transfer-arrow']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4,15V9H12L8,5L9.5,3.5L16,10L9.5,16.5L8,15L12,11H4V15Z"/>
              </svg>
            </div>

            <div className={styles['account-card']}>
              <div className={styles['account-header']}>
                <div className={styles['account-icon']} style={{ 
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: '#d4af37'
                }}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V5H14V3H1V21H19V17Z"/>
                  </svg>
                </div>
                <div className={styles['account-info']}>
                  <h4>To Account</h4>
                  <p className={styles['account-number']}>{transaction.toAccountNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles['actions-section']}>
          <button onClick={() => navigate('/transactions')} className={styles['action-button-secondary']}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M19,19H5V8H19V19Z"/>
            </svg>
            View All Transactions
          </button>
          
          <button onClick={() => navigate('/transfer')} className={styles['action-button-primary']}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V5H14V3H1V21H19V17Z"/>
            </svg>
            Make New Transfer
          </button>
        </div>
      </main>
    </div>
  );
};

export default TransactionDetails;