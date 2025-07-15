import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import styles from "../styles/linkGateway.module.css";
import config from "../constants";

const LinkPaymentGateway = () => {
  const [formData, setFormData] = useState({
    password: "",
    transactionPin: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const { customerId, token } = useParams();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const { password, transactionPin } = formData;
    
    if (!password || !transactionPin) {
      showToast("Both password and transaction Pin are required", "error");
      return false;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return false;
    }

    if (transactionPin.length !== 4 || !/^\d{4}$/.test(transactionPin)) {
      showToast("Transaction Pin must be exactly 4 digits", "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`${config.GATEWAY_BACKEND_URL}/bank/link`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          password: formData.password,
          transactionPin: formData.transactionPin,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Account successfully linked to LinkSuraksha Payment Gateway!", "success");
      } else {
        if (response.status === 401) {
          showToast("Token expired. Please try again.", "error");
        } else {
          showToast(data.message || "Failed to link account", "error");
        }
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
      window.location.href = "/gateway-frontend/manage-accounts";
    }
  };

  useEffect(() => {
    if (!customerId || !token) {
      showToast("Invalid link parameters", "error");
      navigate("/dashboard");
    }
  }, [customerId, token, navigate]);

  return (
    <div className={styles['link-gateway-container']}>
      {/* Header */}
      <header className={styles['link-gateway-header']}>
        <div className={styles['header-content']}>
          <div className={styles['header-left']}>
            <button onClick={() => navigate('/dashboard')} className={styles['back-button']}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
              </svg>
              Back to Dashboard
            </button>
            <div className={styles['page-title']}>
              <h1>Link Payment Gateway</h1>
              <p>Connect your account to LinkSuraksha Payment Gateway</p>
            </div>
          </div>
        
        </div>
      </header>

      {/* Main Content */}
      <main className={styles['link-gateway-main']}>
        <div className={styles['form-section']}>
          <div className={styles['form-container']}>
            {/* Gateway Info Card */}
            <div className={styles['gateway-info']}>
              <div className={styles['gateway-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M11,7H13V9H11V7M11,11H13V17H11V11Z"/>
                </svg>
              </div>
              <div className={styles['gateway-content']}>
                <h3>LinkSuraksha Payment Gateway</h3>
                <p>Secure and reliable payment processing for your transactions</p>
                <div className={styles['gateway-features']}>
                  <div className={styles['feature-item']}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                    </svg>
                    <span>256-bit SSL Encryption</span>
                  </div>
                  <div className={styles['feature-item']}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                    </svg>
                    <span>24/7 Transaction Monitoring</span>
                  </div>
                  <div className={styles['feature-item']}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z"/>
                    </svg>
                    <span>Instant Payment Processing</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication Form */}
            <div className={styles['auth-section']}>
              <div className={styles['form-header']}>
                <h2>Verify Your Identity</h2>
                <p>Please enter your credentials to link your account securely</p>
              </div>

              <form onSubmit={handleSubmit} className={styles['auth-form']}>
                <div className={styles['input-group']}>
                  <label htmlFor="password">Account Password</label>
                  <div className={styles['input-wrapper']}>
                    <svg className={styles['input-icon']} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"/>
                    </svg>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your account password"
                      className={styles['form-input']}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={styles['password-toggle']}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        {showPassword ? (
                          <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/>
                        ) : (
                          <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles['input-group']}>
                  <label htmlFor="transactionPin">Transaction Pin</label>
                  <div className={styles['input-wrapper']}>
                    <svg className={styles['input-icon']} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17,9H7V8A5,5 0 0,1 12,3A5,5 0 0,1 17,8V9M12,17A2,2 0 0,0 14,15A2,2 0 0,0 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,17V9H19A1,1 0 0,1 20,10V20A1,1 0 0,1 19,21H5A1,1 0 0,1 4,20V10A1,1 0 0,1 5,9H6V8A6,6 0 0,1 12,2A6,6 0 0,1 18,8V9Z"/>
                    </svg>
                    <input
                      id="transactionPin"
                      name="transactionPin"
                      type={showPin ? "text" : "password"}
                      value={formData.transactionPin}
                      onChange={handleInputChange}
                      placeholder="Enter your 4-digit transaction Pin"
                      className={styles['form-input']}
                      maxLength="4"
                      pattern="[0-9]{4}"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className={styles['password-toggle']}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        {showPin ? (
                          <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/>
                        ) : (
                          <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles['security-notice']}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                  <div>
                    <p><strong>Security Notice:</strong></p>
                    <p>Your credentials are encrypted and secure. We never store your password or Pin in plain text.</p>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles['link-button']}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className={styles['spinner']} viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6" stroke="currentColor" strokeWidth="4" fill="none"/>
                      </svg>
                      Linking Account...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10.59,13.41C11,13.8 11,14.4 10.59,14.81C10.2,15.2 9.6,15.2 9.19,14.81L7.77,13.39L6.36,14.81C5.95,15.2 5.35,15.2 4.94,14.81C4.53,14.4 4.53,13.8 4.94,13.39L6.36,12L4.94,10.61C4.53,10.2 4.53,9.6 4.94,9.19C5.35,8.8 5.95,8.8 6.36,9.19L7.77,10.61L9.19,9.19C9.6,8.8 10.2,8.8 10.59,9.19C11,9.6 11,10.2 10.59,10.61L9.17,12L10.59,13.41M19.5,12C19.5,16.97 16.97,19.5 12,19.5C7.03,19.5 4.5,16.97 4.5,12C4.5,7.03 7.03,4.5 12,4.5C16.97,4.5 19.5,7.03 19.5,12Z"/>
                      </svg>
                      Link Account to Gateway
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LinkPaymentGateway;