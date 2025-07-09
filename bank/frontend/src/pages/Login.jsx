import { useState } from "react";
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
import styles from "../styles/login.module.css";
import { backendUri } from "../constants";

const Login = () => {
  const [formData, setFormData] = useState({
    customerId: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.customerId || !formData.password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(backendUri+"accounts/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Login successful! Redirecting...", "success");
        sessionStorage.setItem("accessToken", data.account.accessToken);
        sessionStorage.setItem("customerData", JSON.stringify(data.account));
        
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        showToast(data.message || "Login failed", "error");
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-container']}>
      {/* Left Side - Branding */}
      <div className={styles['branding-section']}>
        <div className={styles['branding-content']}>
          <div className={styles['logo-container']}>
            <div className={styles['logo']}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4L13.5 4.7V6.3L19 9M3 13V11L9 8L10.5 8.7V10.3L5 13M12 7.5C11.2 7.5 10.5 8.2 10.5 9S11.2 10.5 12 10.5 13.5 9.8 13.5 9 12.8 7.5 12 7.5ZM12 12C9.8 12 8 13.8 8 16V20H16V16C16 13.8 14.2 12 12 12Z"/>
              </svg>
            </div>
            <h1 className={styles['bank-name']}>SurakshaBank</h1>
            <p className={styles['tagline']}>Securing Your Future, One Transaction at a Time</p>
          </div>
          
          <div className={styles['features']}>
            <div className={styles['feature-item']}>
              <div className={styles['feature-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,9.5V11H16V19H8V11H9.2V9.5C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V11H13.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z"/>
                </svg>
              </div>
              <div>
                <h3>Bank-Grade Security</h3>
                <p>256-bit SSL encryption protects your data</p>
              </div>
            </div>
            
            <div className={styles['feature-item']}>
              <div className={styles['feature-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
                </svg>
              </div>
              <div>
                <h3>24/7 Access</h3>
                <p>Banking services available anytime, anywhere</p>
              </div>
            </div>
            
            <div className={styles['feature-item']}>
              <div className={styles['feature-icon']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V5H14V3H1V21H19V17Z"/>
                </svg>
              </div>
              <div>
                <h3>Instant Transfers</h3>
                <p>Send money instantly to any account</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={styles['form-section']}>
        <div className={styles['form-container']}>
          <div className={styles['form-header']}>
            <h2>Welcome Back</h2>
            <p>Please sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className={styles['login-form']}>
            <div className={styles['input-group']}>
              <label htmlFor="customerId">Customer Id</label>
              <div className={styles['input-wrapper']}>
                <svg className={styles['input-icon']} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
                </svg>
                <input
                  id="customerId"
                  name="customerId"
                  type="text"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  placeholder="Enter your Customer Id"
                  className={styles['form-input']}
                />
              </div>
            </div>

            <div className={styles['input-group']}>
              <label htmlFor="password">Password</label>
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
                  placeholder="Enter your password"
                  className={styles['form-input']}
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

            <div className={styles['form-options']}>
              <label className={styles['checkbox-label']}>
                <input type="checkbox" />
                <span className={styles['checkmark']}></span>
                Remember me
              </label>
              <a href="#" className={styles['forgot-link']}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={styles['login-button']}
            >
              {loading ? (
                <>
                  <svg className={styles['spinner']} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6" stroke="currentColor" strokeWidth="4" fill="none"/>
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
                  </svg>
                  Secure Sign In
                </>
              )}
            </button>
          </form>

          <div className={styles['form-footer']}>
            <p>New to SurakshaBank? <a href="#">Visit your nearest branch</a></p>
            <div className={styles['security-badges']}>
              <div className={styles['badge']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z"/>
                </svg>
                <span>SSL Secured</span>
              </div>
              <div className={styles['badge']}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,12L11,14L15,10L13.59,8.58L11,11.17L9.41,9.59L9,12M12,2C13.1,2 14,2.9 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4C10,2.9 10.9,2 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20Z"/>
                </svg>
                <span>RBI Approved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;