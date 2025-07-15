import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import styles from "../styles/dashboard.module.css";
import config from "../constants.js";

const Dashboard = () => {
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);
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
      day: 'numeric'
    });
  };

  const fetchAccountData = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      const customerData = JSON.parse(sessionStorage.getItem("customerData") || "{}");
      
      if (!accessToken || !customerData._id) {
        showToast("Please login to continue", "error");
        navigate("/login");
        return;
      }

      const response = await fetch(`${config.BANK_BACKEND_URL}/api/accounts`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAccountData(data.account);
      } else {
        if (response.status === 401) {
          showToast("Session expired. Please login again.", "error");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("customerData");
          navigate("/login");
        } else {
          showToast(data.message || "Failed to fetch account data", "error");
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
    fetchAccountData();
  }, []);

  if (loading) {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['loading-spinner']}>
          <svg className={styles['spinner']} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6" stroke="currentColor" strokeWidth="4" fill="none"/>
          </svg>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['dashboard-container']}>
      {/* Header */}
      <header className={styles['dashboard-header']}>
        <div className={styles['header-content']}>
          <div className={styles['logo-section']}>
            <div className={styles['logo']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 4.7V6.3L19 9M3 13V11L9 8L10.5 8.7V10.3L5 13M12 7.5C11.2 7.5 10.5 8.2 10.5 9S11.2 10.5 12 10.5 13.5 9.8 13.5 9 12.8 7.5 12 7.5ZM12 12C9.8 12 8 13.8 8 16V20H16V16C16 13.8 14.2 12 12 12Z"/>
              </svg>
            </div>
            <h1>SurakshaBank</h1>
          </div>
          
          <div className={styles['header-actions']}>
            <div className={styles['user-info']}>
              <span>Welcome, {accountData?.accountHolder}</span>
            </div>
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
      <main className={styles['dashboard-main']}>
        {/* Balance Card */}
        <div className={styles['balance-section']}>
          <div className={styles['balance-card']}>
            <div className={styles['balance-header']}>
              <h2>Account Balance</h2>
              <div className={styles['account-number']}>
                A/C: {accountData?.accountNumber}
              </div>
            </div>
            <div className={styles['balance-amount']}>
              {formatCurrency(accountData?.balance || 0)}
            </div>
            <div className={styles['balance-footer']}>
              <span>Available Balance</span>
              <span>Last updated: {formatDate(accountData?.updatedAt || new Date())}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles['actions-section']}>
          <h3>Quick Actions</h3>
          <div className={styles['action-cards']}>
            <button 
              onClick={() => navigate('/transfer')}
              className={styles['action-card']}
            >
              <div className={styles['action-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V5H14V3H1V21H19V17Z"/>
                </svg>
              </div>
              <div className={styles['action-content']}>
                <h4>Transfer Money</h4>
                <p>Send money to any account instantly</p>
              </div>
              <svg className={styles['action-arrow']} viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
              </svg>
            </button>

            <button 
              onClick={() => navigate('/transactions')}
              className={styles['action-card']}
            >
              <div className={styles['action-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M19,19H5V8H19V19Z"/>
                </svg>
              </div>
              <div className={styles['action-content']}>
                <h4>Transaction History</h4>
                <p>View all your recent transactions</p>
              </div>
              <svg className={styles['action-arrow']} viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Account Details */}
        <div className={styles['details-section']}>
          <h3>Account Information</h3>
          <div className={styles['details-grid']}>
            <div className={styles['detail-card']}>
              <div className={styles['detail-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
              </div>
              <div className={styles['detail-content']}>
                <h4>Account Holder</h4>
                <p>{accountData?.accountHolder}</p>
              </div>
            </div>

            <div className={styles['detail-card']}>
              <div className={styles['detail-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,2H14A2,2 0 0,1 16,4V6H20A2,2 0 0,1 22,8V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V8A2,2 0 0,1 4,6H8V4A2,2 0 0,1 10,2M14,6V4H10V6H14Z"/>
                </svg>
              </div>
              <div className={styles['detail-content']}>
                <h4>Customer Id</h4>
                <p>{accountData?.customerId}</p>
              </div>
            </div>

            <div className={styles['detail-card']}>
              <div className={styles['detail-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"/>
                </svg>
              </div>
              <div className={styles['detail-content']}>
                <h4>Branch</h4>
                <p>{accountData?.branchName}</p>
              </div>
            </div>

            <div className={styles['detail-card']}>
              <div className={styles['detail-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
              </div>
              <div className={styles['detail-content']}>
                <h4>Phone</h4>
                <p>{accountData?.phone}</p>
              </div>
            </div>

            <div className={styles['detail-card']}>
              <div className={styles['detail-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                </svg>
              </div>
              <div className={styles['detail-content']}>
                <h4>Address</h4>
                <p>{accountData?.address}</p>
              </div>
            </div>

            <div className={styles['detail-card']}>
              <div className={styles['detail-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M13.5,9A1.5,1.5 0 0,0 12,7.5A1.5,1.5 0 0,0 10.5,9A1.5,1.5 0 0,0 12,10.5A1.5,1.5 0 0,0 13.5,9M12,17.25C16.5,17.25 16.75,14.75 16.75,13.25C16.75,11.75 15.25,10.25 12,10.25C8.75,10.25 7.25,11.75 7.25,13.25C7.25,14.75 7.5,17.25 12,17.25Z"/>
                </svg>
              </div>
              <div className={styles['detail-content']}>
                <h4>IFSC Code</h4>
                <p>{accountData?.ifscCode}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;