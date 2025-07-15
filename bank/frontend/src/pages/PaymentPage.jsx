import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import styles from "../styles/payment-page.module.css";
import config from "../constants";

const Transfer = () => {
  const [accountData, setAccountData] = useState(null);
  const [formData, setFormData] = useState({
    toAccountNumber: "",
    ifscCode: "",
    amount: "",
    transactionPin: "",
  });
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation, 3: Success
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { toAccountNumber, ifscCode, amount, transactionPin } = formData;

    if (!toAccountNumber || !ifscCode || !amount || !transactionPin) {
      showToast("All fields are required", "error");
      return false;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return false;
    }

    if (parseFloat(amount) > accountData?.balance) {
      showToast("Insufficient balance", "error");
      return false;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
      showToast("Please enter a valid IFSC code", "error");
      return false;
    }

    if (!/^\d{9,18}$/.test(toAccountNumber)) {
      showToast("Account number must be 9–18 digits", "error");
      return false;
    }

    if (parseInt(toAccountNumber) === accountData?.accountNumber) {
      showToast("Cannot transfer to the same account", "error");
      return false;
    }

    return true;
  };

  const fetchAccountData = async () => {
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

      const response = await fetch(`${config.BANK_BACKEND_URL}/api/accounts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
      setAccountLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setStep(2); // Move to confirmation step
  };

  const confirmTransfer = async () => {
    setLoading(true);

    try {
      const accessToken = sessionStorage.getItem("accessToken");

      const response = await fetch(`${config.BANK_BACKEND_URL}/api/accounts/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toAccountNumber: formData.toAccountNumber,
          ifscCode: formData.ifscCode.toUpperCase(),
          amount: parseFloat(formData.amount),
          transactionPin: formData.transactionPin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Transfer completed successfully!", "success");
        setStep(3); // Move to success step
        // Refresh account data
        fetchAccountData();
      } else {
        if (response.status === 401) {
          showToast("Session expired. Please login again.", "error");
          sessionStorage.removeItem("accessToken");
          sessionStorage.removeItem("customerData");
          navigate("/login");
        } else {
          showToast(data.message || "Transfer failed", "error");
          setStep(1); // Go back to form
        }
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
      setStep(1); // Go back to form
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

  const resetForm = () => {
    setFormData({
      toAccountNumber: "",
      ifscCode: "",
      amount: "",
      transactionPin: "",
    });
    setStep(1);
  };

  useEffect(() => {
    fetchAccountData();
  }, []);

  if (accountLoading) {
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
          <p>Loading account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["transfer-container"]}>
      {/* Header */}
      <header className={styles["transfer-header"]}>
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
              <h1>Transfer Money</h1>
              <p>Send money securely to any account</p>
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
      <main className={styles["transfer-main"]}>
        {/* Balance Card */}
        <div className={styles["balance-section"]}>
          <div className={styles["balance-card"]}>
            <div className={styles["balance-info"]}>
              <h3>Available Balance</h3>
              <div className={styles["balance-amount"]}>
                {formatCurrency(accountData?.balance || 0)}
              </div>
            </div>
            <div className={styles["account-info"]}>
              <span>A/C: {accountData?.accountNumber}</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className={styles["progress-section"]}>
          <div className={styles["progress-steps"]}>
            <div
              className={`${styles["step"]} ${
                step >= 1 ? styles["active"] : ""
              }`}
            >
              <div className={styles["step-number"]}>1</div>
              <span>Enter Details</span>
            </div>
            <div className={styles["step-line"]}></div>
            <div
              className={`${styles["step"]} ${
                step >= 2 ? styles["active"] : ""
              }`}
            >
              <div className={styles["step-number"]}>2</div>
              <span>Confirm</span>
            </div>
            <div className={styles["step-line"]}></div>
            <div
              className={`${styles["step"]} ${
                step >= 3 ? styles["active"] : ""
              }`}
            >
              <div className={styles["step-number"]}>3</div>
              <span>Complete</span>
            </div>
          </div>
        </div>

        {/* Transfer Form */}
        {step === 1 && (
          <div className={styles["form-section"]}>
            <div className={styles["form-container"]}>
              <div className={styles["form-header"]}>
                <h2>Transfer Details</h2>
                <p>Please fill in the recipient details</p>
              </div>

              <form onSubmit={handleSubmit} className={styles["transfer-form"]}>
                <div className={styles["input-group"]}>
                  <label htmlFor="toAccountNumber">
                    Recipient Account Number
                  </label>
                  <div className={styles["input-wrapper"]}>
                    <svg
                      className={styles["input-icon"]}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M13.5,9A1.5,1.5 0 0,0 12,7.5A1.5,1.5 0 0,0 10.5,9A1.5,1.5 0 0,0 12,10.5A1.5,1.5 0 0,0 13.5,9M12,17.25C16.5,17.25 16.75,14.75 16.75,13.25C16.75,11.75 15.25,10.25 12,10.25C8.75,10.25 7.25,11.75 7.25,13.25C7.25,14.75 7.5,17.25 12,17.25Z" />
                    </svg>
                    <input
                      id="toAccountNumber"
                      name="toAccountNumber"
                      type="text"
                      value={formData.toAccountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter recipient account number"
                      className={styles["form-input"]}
                    />
                  </div>
                </div>

                <div className={styles["input-group"]}>
                  <label htmlFor="ifscCode">IFSC Code</label>
                  <div className={styles["input-wrapper"]}>
                    <svg
                      className={styles["input-icon"]}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z" />
                    </svg>
                    <input
                      id="ifscCode"
                      name="ifscCode"
                      type="text"
                      value={formData.ifscCode}
                      onChange={handleInputChange}
                      placeholder="Enter IFSC code (e.g., SBIN0000123)"
                      className={styles["form-input"]}
                      style={{ textTransform: "uppercase" }}
                    />
                  </div>
                </div>

                <div className={styles["input-group"]}>
                  <label htmlFor="amount">Amount</label>
                  <div className={styles["input-wrapper"]}>
                    <svg
                      className={styles["input-icon"]}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
                    </svg>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      max={accountData?.balance}
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Enter amount"
                      className={styles["form-input"]}
                    />
                  </div>
                </div>

                <div className={styles["input-group"]}>
                  <label htmlFor="transactionPin">Transaction Pin</label>
                  <div className={styles["input-wrapper"]}>
                    <svg
                      className={styles["input-icon"]}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                    </svg>
                    <input
                      id="transactionPin"
                      name="transactionPin"
                      type={showPin ? "text" : "password"}
                      value={formData.transactionPin}
                      onChange={handleInputChange}
                      placeholder="Enter your transaction Pin"
                      className={styles["form-input"]}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className={styles["password-toggle"]}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        {showPin ? (
                          <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
                        ) : (
                          <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <button type="submit" className={styles["proceed-button"]}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                  </svg>
                  Proceed to Confirm
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 2 && (
          <div className={styles["confirmation-section"]}>
            <div className={styles["confirmation-container"]}>
              <div className={styles["confirmation-header"]}>
                <div className={styles["confirmation-icon"]}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" />
                  </svg>
                </div>
                <h2>Confirm Transfer</h2>
                <p>Please review the transfer details carefully</p>
              </div>

              <div className={styles["transfer-summary"]}>
                <div className={styles["summary-item"]}>
                  <span className={styles["summary-label"]}>From Account</span>
                  <span className={styles["summary-value"]}>
                    {accountData?.accountNumber}
                  </span>
                </div>
                <div className={styles["summary-item"]}>
                  <span className={styles["summary-label"]}>To Account</span>
                  <span className={styles["summary-value"]}>
                    {formData.toAccountNumber}
                  </span>
                </div>
                <div className={styles["summary-item"]}>
                  <span className={styles["summary-label"]}>IFSC Code</span>
                  <span className={styles["summary-value"]}>
                    {formData.ifscCode}
                  </span>
                </div>
                <div className={styles["summary-item"]}>
                  <span className={styles["summary-label"]}>Amount</span>
                  <span
                    className={styles["summary-value"]}
                    style={{ color: "#dc2626", fontWeight: "700" }}
                  >
                    {formatCurrency(parseFloat(formData.amount))}
                  </span>
                </div>
              </div>

              <div className={styles["confirmation-actions"]}>
                <button
                  onClick={() => setStep(1)}
                  className={styles["back-btn"]}
                  disabled={loading}
                >
                  Edit Details
                </button>
                <button
                  onClick={confirmTransfer}
                  className={styles["confirm-btn"]}
                  disabled={loading}
                >
                  {loading ? (
                    <>
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
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
                      </svg>
                      Confirm Transfer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Step */}
        {step === 3 && (
          <div className={styles["success-section"]}>
            <div className={styles["success-container"]}>
              <div className={styles["success-icon"]}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
                </svg>
              </div>
              <h2>Transfer Successful!</h2>
              <p>Your money has been transferred successfully</p>

              <div className={styles["success-details"]}>
                <div className={styles["detail-item"]}>
                  <span>Amount Transferred</span>
                  <span>{formatCurrency(parseFloat(formData.amount))}</span>
                </div>
                <div className={styles["detail-item"]}>
                  <span>To Account</span>
                  <span>{formData.toAccountNumber}</span>
                </div>
              </div>

              <div className={styles["success-actions"]}>
                <button
                  onClick={resetForm}
                  className={styles["new-transfer-btn"]}
                >
                  Make Another Transfer
                </button>
                <button
                  onClick={() => navigate("/transactions")}
                  className={styles["view-transactions-btn"]}
                >
                  View Transactions
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Transfer;
