import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  CreditCard,
  Shield,
  Bell,
  LogOut,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet,
  ArrowRight,
  User,
  DollarSign,
  MessageSquare,
  RefreshCw,
  Store,
  Receipt,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { avatarUri, backendUri } from "../constants";
import Navbar from "../components/Navbar.jsx";

const MerchantTransferPage = () => {
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const location = useLocation();

  // State management
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Transaction inquiry state
  const [transactionInfo, setTransactionInfo] = useState(null);
  const [transactionLoading, setTransactionLoading] = useState(true);
  const [transactionError, setTransactionError] = useState(null);

  // Merchant verification state
  const [merchantInfo, setMerchantInfo] = useState(null);
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [merchantError, setMerchantError] = useState(null);
  const [merchantVerified, setMerchantVerified] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    note: "",
    gatewayPin: "",
  });

  // User data
  const user = {
    name: sessionStorage.getItem("Name"),
    email: sessionStorage.getItem("Email"),
    token: sessionStorage.getItem("Token"),
    avatar: avatarUri,
  };

  useEffect(() => {
    if (!user?.name || !user?.email || !user?.token) {
      const redirectPath =
        "/login?redirect=" +
        encodeURIComponent(location.pathname + location.search);
      console.log("Redirecting to login with path:", redirectPath);
      navigate(redirectPath);
    }
  }, [user, navigate, location]);

  // Fetch transaction details
  const fetchTransactionDetails = async () => {
    if (!transactionId) return;

    setTransactionLoading(true);
    setTransactionError(null);

    try {
      const response = await fetch(
        `${backendUri}accounts/inquire-transaction/${transactionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTransactionInfo(data.transaction);
        setFormData((prev) => ({
          ...prev,
          toAccount: data.transaction.receiverServiceId,
          amount: data.transaction.amount.toString(),
          note: data.transaction.description || "",
        }));

        // Verify merchant
        if (data.transaction.receiverServiceId) {
          verifyMerchant(data.transaction.receiverServiceId);
        }
      } else {
        if (response.status === 401) {
          const redirectPath =
            "/login?redirect=" +
            encodeURIComponent(location.pathname + location.search);
          navigate(redirectPath);
          return;
        }
        throw new Error(data.message || "Transaction not found");
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      setTransactionError(error.message);
      Toastify({
        text: error.message || "Failed to load transaction details",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setTransactionLoading(false);
    }
  };

  // Verify merchant from API
  const verifyMerchant = async (receiverServiceAccount) => {
    if (!receiverServiceAccount) return;

    setMerchantLoading(true);
    setMerchantError(null);

    try {
      const response = await fetch(
        `${backendUri}accounts/receiver/${receiverServiceAccount}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMerchantInfo(data.account);
        setMerchantVerified(true);
      } else {
        if (response.status === 401) {
          const redirectPath =
            "/login?redirect=" +
            encodeURIComponent(location.pathname + location.search);
          navigate(redirectPath);
          return;
        }
        throw new Error(data.message || "Merchant not found or invalid");
      }
    } catch (error) {
      console.error("Error verifying merchant:", error);
      setMerchantError(error.message);
      setMerchantVerified(false);
    } finally {
      setMerchantLoading(false);
    }
  };

  // Fetch linked accounts
  const fetchLinkedAccounts = async () => {
    setAccountsLoading(true);
    try {
      const response = await fetch(`${backendUri}accounts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const transformedAccounts = data.accounts.map((account) => ({
          id: account._id,
          accountNumber: account.accountNumber,
          maskedAccountNumber: `****${account.accountNumber.slice(-4)}`,
          receiverServiceAccount: account.receiverServiceAccount,
          balance: account.balance || 0,
          status: account.status,
          accountHolder: account.accountHolder,
          customerId: account.customerId,
          ifscCode: account.ifscCode,
        }));

        setAccounts(
          transformedAccounts.filter((acc) => acc.status === "Verified")
        );

        // Set default account if none selected
        if (!formData.fromAccount && transformedAccounts.length > 0) {
          setFormData((prev) => ({
            ...prev,
            fromAccount: transformedAccounts[0].id,
          }));
        }
      } else {
        if (response.status === 401) {
          const redirectPath =
            "/login?redirect=" +
            encodeURIComponent(location.pathname + location.search);
          navigate(redirectPath);
          return;
        }
        throw new Error(data.message || "Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      Toastify({
        text: error.message || "Failed to load accounts",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    if (user.token) {
      fetchLinkedAccounts();
      fetchTransactionDetails();
    }
  }, [user.token, transactionId]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle form submission
  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (
        !formData.fromAccount ||
        !formData.toAccount ||
        !formData.amount ||
        !formData.gatewayPin
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (parseFloat(formData.amount) <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      if (formData.gatewayPin.length < 4 || formData.gatewayPin.length > 6) {
        throw new Error("Gateway Pin must be 4-6 digits");
      }

      // Find selected account
      const selectedAccount = accounts.find(
        (acc) => acc.id === formData.fromAccount
      );
      if (!selectedAccount) {
        throw new Error("Selected account not found");
      }

      if (parseFloat(formData.amount) > selectedAccount.balance) {
        throw new Error("Insufficient balance");
      }

      // Submit transfer request
      const response = await fetch(`${backendUri}accounts/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          fromAccountId: formData.fromAccount,
          receiverServiceAccount: formData.toAccount,
          amount: parseFloat(formData.amount),
          note: formData.note,
          gatewayPin: formData.gatewayPin,
          transferType: "service",
          transactionId: transactionId,
        }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        Toastify({
          text: "Transfer completed successfully!",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Redirect to transactions page or success page
        navigate("/transactions");
      } else {
        if (response.status === 401) {
          const redirectPath =
            "/login?redirect=" +
            encodeURIComponent(location.pathname + location.search);
          navigate(redirectPath);
          return;
        }
        throw new Error(responseData.message || "Transfer failed");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      Toastify({
        text: error.message || "Transfer failed. Please try again.",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  // Get selected account details
  const selectedAccount = accounts.find(
    (acc) => acc.id === formData.fromAccount
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pay Merchant
          </h1>
          <p className="text-gray-600">
            Complete your payment to the merchant securely
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Transaction Loading State */}
              {transactionLoading && (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-blue-600">Loading transaction details...</span>
                  </div>
                </div>
              )}

              {/* Transaction Error State */}
              {transactionError && (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-red-300 bg-red-50">
                  <div className="flex items-center space-x-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Transaction Error</p>
                      <p className="text-sm">{transactionError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Info */}
              {transactionInfo && (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50">
                  <div className="flex items-start space-x-3">
                    <Receipt className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900">Transaction Details</p>
                      <div className="mt-2 space-y-1 text-sm text-blue-700">
                        <p><strong>Transaction Id:</strong> {transactionInfo.id || transactionId}</p>
                        <p><strong>Amount:</strong> ₹{parseFloat(transactionInfo.amount).toLocaleString("en-IN")}</p>
                        {transactionInfo.description && (
                          <p><strong>Description:</strong> {transactionInfo.description}</p>
                        )}
                        <p><strong>Status:</strong> {transactionInfo.status || "Pending"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Merchant Verification */}
              {merchantLoading && (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                    <span className="text-blue-600">Verifying merchant...</span>
                  </div>
                </div>
              )}

              {merchantError && (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-red-300 bg-red-50">
                  <div className="flex items-center space-x-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Merchant Verification Failed</p>
                      <p className="text-sm">{merchantError}</p>
                    </div>
                  </div>
                </div>
              )}

              {merchantVerified && merchantInfo && (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-green-300 bg-green-50">
                  <div className="flex items-center space-x-3 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Merchant Verified</p>
                      <p className="text-sm">
                        {merchantInfo.displayName || "LinkSuraksha Merchant"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Service Account: {merchantInfo._id || formData.toAccount}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer Method - Fixed to Service Account */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Transfer Method
                </h2>
                <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                      <Store className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">
                        Merchant Payment
                        {merchantVerified && (
                          <span className="text-green-600 ml-1">✓</span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Pay to merchant service account
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Form */}
              <form onSubmit={handleTransfer} className="space-y-6">
                {/* From Account */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Account *
                  </label>
                  {accountsLoading ? (
                    <div className="p-4 border border-gray-300 rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  ) : accounts.length === 0 ? (
                    <div className="p-4 border border-red-300 rounded-lg bg-red-50">
                      <p className="text-red-600 text-sm">
                        No verified accounts available.{" "}
                        <button
                          type="button"
                          onClick={() => navigate("/manage-accounts")}
                          className="underline hover:no-underline"
                        >
                          Link an account
                        </button>
                      </p>
                    </div>
                  ) : (
                    <select
                      value={formData.fromAccount}
                      onChange={(e) =>
                        handleInputChange("fromAccount", e.target.value)
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select an account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountHolder} - {account.maskedAccountNumber}
                          (₹{account.balance.toLocaleString("en-IN")})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* To Account - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant Service Account *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.toAccount}
                      placeholder="Merchant service account will be loaded..."
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {merchantLoading ? (
                        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                      ) : merchantVerified ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : merchantError ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : null}
                    </div>
                  </div>
                  {merchantVerified && (
                    <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Merchant verified</span>
                    </p>
                  )}
                </div>

                {/* Amount - Read Only */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      value={formData.amount}
                      placeholder="Amount will be loaded..."
                      disabled
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  {selectedAccount && formData.amount && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available balance: ₹{selectedAccount.balance.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Note
                  </label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) =>
                      handleInputChange("note", e.target.value)
                    }
                    placeholder="Transaction note will be loaded..."
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* Gateway Pin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gateway Pin *
                  </label>
                  <input
                    type="password"
                    value={formData.gatewayPin}
                    onChange={(e) =>
                      handleInputChange("gatewayPin", e.target.value)
                    }
                    placeholder="Enter your 4-6 digit Gateway Pin"
                    minLength="4"
                    maxLength="6"
                    pattern="[0-9]{4,6}"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use the Pin you created when linking your account
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      accounts.length === 0 ||
                      !merchantVerified ||
                      transactionLoading ||
                      merchantLoading ||
                      !transactionInfo
                    }
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      loading ||
                      accounts.length === 0 ||
                      !merchantVerified ||
                      transactionLoading ||
                      merchantLoading ||
                      !transactionInfo
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : transactionLoading || merchantLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Pay Merchant</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Payment Method</span>
                  <span className="text-sm font-medium text-gray-900">
                    Service Account
                  </span>
                </div>

                {selectedAccount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">From</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAccount.maskedAccountNumber}
                    </span>
                  </div>
                )}

                {merchantInfo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Merchant</span>
                    <span className="text-sm font-medium text-gray-900">
                      {merchantInfo.displayName || "LinkSuraksha Merchant"}
                    </span>
                  </div>
                )}

                {formData.amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{parseFloat(formData.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {transactionInfo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Transaction Id</span>
                    <span className="text-xs font-mono text-gray-900">
                      {transactionInfo.id || transactionId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                How merchant payment works
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p className="text-sm text-blue-700">
                    Transaction details are verified from the merchant
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p className="text-sm text-blue-700">
                    Money is debited from your selected account
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p className="text-sm text-blue-700">
                    Payment is credited to merchant's account
                  </p>
                </div>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-green-900 mb-2">
                    Secure Payment
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• End-to-end encryption</li>
                    <li>• Two-factor authentication</li>
                    <li>• Real-time fraud monitoring</li>
                    <li>• Instant payment notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MerchantTransferPage;
