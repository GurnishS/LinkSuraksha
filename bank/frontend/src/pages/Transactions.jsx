import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import styles from "../styles/transactions.module.css";
import { backendUri } from "../constants";

const Transactions = () => {
  const [transactionData, setTransactionData] = useState({
    received: [],
    sent: [],
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, received, sent
  const [statusFilter, setStatusFilter] = useState("all"); // all, completed, pending, failed
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
        background:
          type === "success"
            ? "linear-gradient(135deg, #0f5132, #198754)"
            : "linear-gradient(135deg, #842029, #dc3545)",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "600",
        padding: "16px 20px",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
      onClick: function () {},
    }).showToast();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "#16a34a";
      case "INITIATED":
        return "#eab308";
      case "DEDUCTED":
        return "#f59e0b";
      case "CREDITED":
        return "#10b981";
      case "FAILED":
        return "#dc2626";
      case "REFUNDED":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
          </svg>
        );
      case "FAILED":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,17A1.5,1.5 0 0,0 13.5,15.5A1.5,1.5 0 0,0 12,14A1.5,1.5 0 0,0 10.5,15.5A1.5,1.5 0 0,0 12,17M12,10.5A1.5,1.5 0 0,0 13.5,9A1.5,1.5 0 0,0 12,7.5A1.5,1.5 0 0,0 10.5,9A1.5,1.5 0 0,0 12,10.5Z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7" />
          </svg>
        );
    }
  };

  const fetchTransactions = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      const customerData = JSON.parse(
        sessionStorage.getItem("customerData") || "{}"
      );

      if (!accessToken || !customerData._id) {
        showToast("Please login to continue", "error");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${backendUri}accounts/transactions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setTransactionData(data.transactions);
      } else {
        if (response.status === 401) {
          showToast("Session expired. Please login again.", "error");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("customerData");
          navigate("/login");
        } else if (response.status === 404) {
          setTransactionData({ received: [], sent: [] });
        } else {
          showToast(data.message || "Failed to fetch transactions", "error");
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

  const getAllTransactions = () => {
    const customerData = JSON.parse(
      sessionStorage.getItem("customerData") || "{}"
    );
    const currentAccountNumber = customerData.accountNumber;

    const received = transactionData.received.map((tx) => ({
      ...tx,
      type: "received",
      otherAccount: tx.fromAccountNumber,
    }));

    const sent = transactionData.sent.map((tx) => ({
      ...tx,
      type: "sent",
      otherAccount: tx.toAccountNumber,
    }));

    return [...received, ...sent].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  };

  const getFilteredTransactions = () => {
    let transactions = getAllTransactions();

    // Filter by type
    if (filter === "received") {
      transactions = transactions.filter((tx) => tx.type === "received");
    } else if (filter === "sent") {
      transactions = transactions.filter((tx) => tx.type === "sent");
    }

    // Filter by status
    if (statusFilter !== "all") {
      transactions = transactions.filter(
        (tx) => tx.status === statusFilter.toUpperCase()
      );
    }

    return transactions;
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className={styles["loading-container"]}>
        <div className={styles["loading-spinner"]}>
          <svg className={styles["spinner"]} viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              opacity="0.25"
            />
            <path
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
          </svg>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  const filteredTransactions = getFilteredTransactions();
  const totalReceived = transactionData.received
    .filter((tx) => tx.status === "COMPLETED")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalSent = transactionData.sent
    .filter((tx) => tx.status === "COMPLETED")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className={styles["transactions-container"]}>
      {/* Header */}
      <header className={styles["transactions-header"]}>
        <div className={styles["header-content"]}>
          <div className={styles["header-left"]}>
            <button
              onClick={() => navigate("/dashboard")}
              className={styles["back-button"]}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
              </svg>
              Back to Dashboard
            </button>
            <div className={styles["page-title"]}>
              <h1>Transaction History</h1>
              <p>View all your account transactions</p>
            </div>
          </div>

          <div className={styles["header-actions"]}>
            <button onClick={handleLogout} className={styles["logout-button"]}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles["transactions-main"]}>
        {/* Stats Cards */}
        <div className={styles["stats-section"]}>
          <div className={styles["stat-card"]}>
            <div className={styles["stat-info"]}>
              <h3>Money Received</h3>
              <p className={styles["stat-amount"]} style={{ color: "#16a34a" }}>
                {formatCurrency(totalReceived)}
              </p>
            </div>
            <div
              className={styles["stat-icon"]}
              style={{
                backgroundColor: "rgba(22, 163, 74, 0.1)",
                color: "#16a34a",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L21.66,6.22L12.78,10.61C12.93,10.39 13,10.2 13,10A1,1 0 0,0 12,9A1,1 0 0,0 11,10A1,1 0 0,0 12,11C12.35,11 12.63,10.86 12.82,10.63L3.94,6.22L2.5,4.77L12.21,10.39C13.39,10.9 14,11.88 14,13A3,3 0 0,1 12,16Z" />
              </svg>
            </div>
          </div>

          <div className={styles["stat-card"]}>
            <div className={styles["stat-info"]}>
              <h3>Money Sent</h3>
              <p className={styles["stat-amount"]} style={{ color: "#dc2626" }}>
                {formatCurrency(totalSent)}
              </p>
            </div>
            <div
              className={styles["stat-icon"]}
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                color: "#dc2626",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M2,10.96C1.5,10.68 1.35,10.07 1.63,9.59L3.13,7.24C3.41,6.75 4.02,6.61 4.5,6.89L12,11.54L19.5,6.89C19.98,6.61 20.59,6.75 20.87,7.24L22.37,9.59C22.65,10.07 22.5,10.68 22,10.96L12.65,16.3C12.28,16.47 11.72,16.47 11.35,16.3L2,10.96Z" />
              </svg>
            </div>
          </div>

          <div className={styles["stat-card"]}>
            <div className={styles["stat-info"]}>
              <h3>Total Transactions</h3>
              <p className={styles["stat-amount"]} style={{ color: "#d4af37" }}>
                {transactionData.received.length + transactionData.sent.length}
              </p>
            </div>
            <div
              className={styles["stat-icon"]}
              style={{
                backgroundColor: "rgba(212, 175, 55, 0.1)",
                color: "#d4af37",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M19,19H5V8H19V19Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles["filters-section"]}>
          <div className={styles["filter-group"]}>
            <label>Transaction Type:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={styles["filter-select"]}
            >
              <option value="all">All Transactions</option>
              <option value="received">Money Received</option>
              <option value="sent">Money Sent</option>
            </select>
          </div>

          <div className={styles["filter-group"]}>
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles["filter-select"]}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="initiated">Initiated</option>
              <option value="deducted">Deducted</option>
              <option value="credited">Credited</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className={styles["transactions-section"]}>
          {filteredTransactions.length === 0 ? (
            <div className={styles["empty-state"]}>
              <div className={styles["empty-icon"]}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,3H5C3.9,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.9 20.1,3 19,3M19,19H5V8H19V19Z" />
                </svg>
              </div>
              <h3>No Transactions Found</h3>
              <p>
                You haven't made any transactions yet or no transactions match
                your filters.
              </p>
              <button
                onClick={() => navigate("/transfer")}
                className={styles["cta-button"]}
              >
                Make Your First Transfer
              </button>
            </div>
          ) : (
            <div className={styles["transactions-list"]}>
              {filteredTransactions.map((transaction, index) => (
                <div
                  key={`${transaction._id}-${index}`}
                  className={styles["transaction-item"]}
                  onClick={() => navigate(`/transaction/${transaction._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles["transaction-left"]}>
                    <div
                      className={styles["transaction-icon"]}
                      style={{
                        backgroundColor:
                          transaction.type === "received"
                            ? "rgba(22, 163, 74, 0.1)"
                            : "rgba(220, 38, 38, 0.1)",
                        color:
                          transaction.type === "received"
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        {transaction.type === "received" ? (
                          <path d="M12,16A3,3 0 0,1 9,13C9,11.88 9.61,10.9 10.5,10.39L20.21,4.77L21.66,6.22L12.78,10.61C12.93,10.39 13,10.2 13,10A1,1 0 0,0 12,9A1,1 0 0,0 11,10A1,1 0 0,0 12,11C12.35,11 12.63,10.86 12.82,10.63L3.94,6.22L2.5,4.77L12.21,10.39C13.39,10.9 14,11.88 14,13A3,3 0 0,1 12,16Z" />
                        ) : (
                          <path d="M2,10.96C1.5,10.68 1.35,10.07 1.63,9.59L3.13,7.24C3.41,6.75 4.02,6.61 4.5,6.89L12,11.54L19.5,6.89C19.98,6.61 20.59,6.75 20.87,7.24L22.37,9.59C22.65,10.07 22.5,10.68 22,10.96L12.65,16.3C12.28,16.47 11.72,16.47 11.35,16.3L2,10.96Z" />
                        )}
                      </svg>
                    </div>
                    <div className={styles["transaction-info"]}>
                      <h4>
                        {transaction.type === "received"
                          ? "Money Received"
                          : "Money Sent"}
                      </h4>
                      <p>A/C: {transaction.otherAccount}</p>
                      <span className={styles["transaction-date"]}>
                        {formatDate(transaction.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className={styles["transaction-right"]}>
                    <div
                      className={styles["transaction-amount"]}
                      style={{
                        color:
                          transaction.type === "received"
                            ? "#16a34a"
                            : "#dc2626",
                      }}
                    >
                      {transaction.type === "received" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <div
                      className={styles["transaction-status"]}
                      style={{ color: getStatusColor(transaction.status) }}
                    >
                      <div className={styles["status-icon"]}>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <span>{transaction.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Transactions;
