import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  CreditCard,
  QrCode,
  Scan,
  Eye,
  EyeOff,
  Copy,
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
  Hash,
  DollarSign,
  MessageSquare,
  Camera,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Scanner from "../components/Scanner.jsx";
import { avatarUri, backendUri } from "../constants";
import Navbar from "../components/Navbar.jsx";

const TransferPage = () => {
  const navigate = useNavigate();
  const { receiverId } = useParams();

  // State management
  const [transferMode, setTransferMode] = useState("account"); // 'account' or 'service'
  const [inputMethod, setInputMethod] = useState("manual"); // 'manual' or 'qr'
  const [showBalance, setShowBalance] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  // Receiver verification state
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [receiverLoading, setReceiverLoading] = useState(false);
  const [receiverError, setReceiverError] = useState(null);
  const [receiverVerified, setReceiverVerified] = useState(false);
  const [manualReceiverVerification, setManualReceiverVerification] =
    useState(false);

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

  const location = useLocation();

  useEffect(() => {
    if (!user?.name || !user?.email || !user?.token) {
      const redirectPath =
        "/login?redirect=" +
        encodeURIComponent(location.pathname + location.search);
      console.log("Redirecting to login with path:", redirectPath);
      navigate(redirectPath);
    }
  }, [user, navigate, location]);

  // Helper function to validate MongoDB ObjectId
  const isValidObjectId = (id) => {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(id);
  };

  // Helper function to extract receiver Id from QR URL
  const extractReceiverIdFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");

      // Check if it's a transfer URL pattern
      if (pathParts.length >= 3 && pathParts[1] === "transfer") {
        const receiverId = pathParts[2];
        if (isValidObjectId(receiverId)) {
          return receiverId;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Verify receiver from API
  const verifyReceiver = async (receiverIdToVerify, isManualInput = false) => {
    if (!receiverIdToVerify || !isValidObjectId(receiverIdToVerify)) {
      if (isManualInput) {
        setReceiverError("Invalid receiver Id format");
        setReceiverVerified(false);
        setManualReceiverVerification(false);
      }
      return;
    }

    if (isManualInput) {
      setManualReceiverVerification(true);
    }
    setReceiverLoading(true);
    setReceiverError(null);

    try {
      const response = await fetch(
        `${backendUri}accounts/receiver/${receiverIdToVerify}`,
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
        setReceiverInfo(data.account);
        setReceiverVerified(true);

        // For manual input, don't override the toAccount field
        if (!isManualInput) {
          setFormData((prev) => ({
            ...prev,
            toAccount: data.account._id || receiverIdToVerify,
          }));
        }

        Toastify({
          text: `Receiver verified: ${
            data.account.displayName || "Unknown User"
          }`,
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();
      } else {
        if (response.status === 401) {
          const redirectPath =
            "/login?redirect=" +
            encodeURIComponent(location.pathname + location.search);
          navigate(redirectPath);
          return;
        }
        throw new Error(data.message || "Receiver not found or invalid");
      }
    } catch (error) {
      console.error("Error verifying receiver:", error);
      setReceiverError(error.message);
      setReceiverVerified(false);

      if (isManualInput) {
        Toastify({
          text: error.message || "Failed to verify receiver",
          backgroundColor: "#DC2626",
          gravity: "top",
          position: "right",
          duration: 4000,
        }).showToast();
      }
    } finally {
      setReceiverLoading(false);
      if (isManualInput) {
        setManualReceiverVerification(false);
      }
    }
  };

  // Handle receiverId from URL params
  useEffect(() => {
    if (receiverId) {
      setTransferMode("service");
      setInputMethod("manual");
      verifyReceiver(receiverId);
    }
  }, [receiverId, user.token]);

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
    }
  }, [user.token]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If changing toAccount and not from URL params, handle receiver verification
    if (field === "toAccount" && !receiverId) {
      // Reset receiver state when input changes
      setReceiverInfo(null);
      setReceiverVerified(false);
      setReceiverError(null);
      setManualReceiverVerification(false);

      // If service mode and input is exactly 24 chars and valid ObjectId, verify automatically
      if (
        transferMode === "service" &&
        value.length === 24 &&
        isValidObjectId(value)
      ) {
        verifyReceiver(value, true);
      }
    }
  };

  // Handle QR scan result
  const handleQRScan = (scannedData) => {
    try {
      // First, try to extract receiver Id from URL
      const extractedReceiverId = extractReceiverIdFromUrl(scannedData);

      if (extractedReceiverId) {
        // Redirect to the transfer page with receiver Id
        navigate(`/transfer/${extractedReceiverId}`);
        return;
      }

      // Try to parse as JSON (for LinkSuraksha QR codes)
      const parsedData = JSON.parse(scannedData);
      if (parsedData.receiverServiceAccount) {
        setFormData((prev) => ({
          ...prev,
          toAccount: parsedData.receiverServiceAccount,
        }));
        setTransferMode("service");

        // If the scanned data is a valid ObjectId, verify it
        if (isValidObjectId(parsedData.receiverServiceAccount)) {
          verifyReceiver(parsedData.receiverServiceAccount, true);
        }
      }
    } catch {
      // If not JSON or URL, treat as plain account number/service account
      setFormData((prev) => ({
        ...prev,
        toAccount: scannedData,
      }));

      // If it's a valid ObjectId and in service mode, verify it
      if (transferMode === "service" && isValidObjectId(scannedData)) {
        verifyReceiver(scannedData, true);
      }
    }

    setShowQRScanner(false);
    setInputMethod("manual");

    Toastify({
      text: "QR code scanned successfully!",
      backgroundColor: "#4BB543",
      gravity: "top",
      position: "right",
      duration: 2000,
    }).showToast();
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
        throw new Error("Please select a valid account");
      }

      if (parseFloat(formData.amount) > selectedAccount.balance) {
        throw new Error("Insufficient balance");
      }

      // Additional validation for service transfers with receiver Id
      if (
        transferMode === "service" &&
        (receiverId || isValidObjectId(formData.toAccount)) &&
        !receiverVerified
      ) {
        throw new Error(
          "Receiver verification required. Please wait for verification to complete."
        );
      }

      // Prepare transfer data
      const transferData = {
        fromAccountId: formData.fromAccount,
        [transferMode === "service"
          ? "receiverServiceAccount"
          : "toAccountNumber"]: formData.toAccount,
        amount: parseFloat(formData.amount),
        note: formData.note,
        gatewayPin: formData.gatewayPin,
        transferType: transferMode,
        ...(receiverId && { receiverId }), // Include receiverId if available
      };

      // Make API call
      const response = await fetch(`${backendUri}accounts/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(transferData),
      });

      const responseData = await response.json();

      if (response.ok) {
        Toastify({
          text: "Transfer initiated successfully!",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Reset form
        setFormData({
          fromAccount: accounts[0]?.id || "",
          toAccount: "",
          amount: "",
          note: "",
          gatewayPin: "",
        });

        // Reset receiver state
        setReceiverInfo(null);
        setReceiverVerified(false);
        setReceiverError(null);
        setManualReceiverVerification(false);

        // Navigate to dashboard or transaction history
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
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
      <Navbar/>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Money</h1>
          <p className="text-gray-600">
            Transfer money securely using account numbers or service accounts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transfer Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Receiver Info Banner (if receiver Id provided or manually verified) */}
              {(receiverId ||
                manualReceiverVerification ||
                receiverVerified) && (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed">
                  {receiverLoading ? (
                    <div className="flex items-center space-x-3">
                      <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                      <span className="text-blue-600">
                        {receiverId
                          ? "Verifying receiver..."
                          : "Verifying receiver Id..."}
                      </span>
                    </div>
                  ) : receiverError ? (
                    <div className="flex items-center space-x-3 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">
                          Receiver Verification Failed
                        </p>
                        <p className="text-sm">{receiverError}</p>
                      </div>
                    </div>
                  ) : receiverVerified && receiverInfo ? (
                    <div className="flex items-center space-x-3 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Receiver Verified</p>
                        <p className="text-sm">
                          {receiverInfo.displayName || "LinkSuraksha User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Service Account:{" "}
                          {receiverInfo._id || receiverId || formData.toAccount}
                        </p>
                        {receiverId && (
                          <p className="text-xs text-blue-600 mt-1">
                            ✓ Verified from URL
                          </p>
                        )}
                        {!receiverId && isValidObjectId(formData.toAccount) && (
                          <p className="text-xs text-blue-600 mt-1">
                            ✓ Auto-verified from input
                          </p>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Transfer Mode Selection */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Transfer Method
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      if (!receiverId) {
                        setTransferMode("account");
                        setFormData((prev) => ({ ...prev, toAccount: "" }));
                        // Reset receiver verification state
                        setReceiverInfo(null);
                        setReceiverVerified(false);
                        setReceiverError(null);
                        setManualReceiverVerification(false);
                      }
                    }}
                    disabled={receiverId}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      transferMode === "account"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${receiverId ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          transferMode === "account"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Hash className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">
                          Bank Account
                        </h3>
                        <p className="text-sm text-gray-500">
                          Transfer to bank account number
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setTransferMode("service");
                      if (!receiverId) {
                        setFormData((prev) => ({ ...prev, toAccount: "" }));
                        // Reset receiver verification state
                        setReceiverInfo(null);
                        setReceiverVerified(false);
                        setReceiverError(null);
                        setManualReceiverVerification(false);
                      }
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      transferMode === "service"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          transferMode === "service"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Shield className="h-6 w-6" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium text-gray-900">
                          Service Account
                          {receiverId && (
                            <span className="text-green-600 ml-1">✓</span>
                          )}
                          {!receiverId && receiverVerified && (
                            <span className="text-green-600 ml-1">✓</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Transfer to LinkSuraksha service account
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Transfer Form */}
              <form onSubmit={handleTransfer} className="space-y-6">
                {/* From Account Selection */}
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
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.accountHolder} -{" "}
                          {account.maskedAccountNumber}
                          (₹{account.balance.toLocaleString("en-IN")})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Recipient Input Method Selection */}
                {transferMode === "service" && !receiverId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Input Method
                    </label>
                    <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setInputMethod("manual")}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          inputMethod === "manual"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Manual Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputMethod("qr");
                          setShowQRScanner(true);
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          inputMethod === "qr"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        QR Code
                      </button>
                    </div>
                  </div>
                )}

                {/* Recipient Account Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {transferMode === "account"
                      ? "Recipient Account Number *"
                      : "Recipient Service Account *"}
                  </label>

                  {inputMethod === "qr" &&
                  transferMode === "service" &&
                  !receiverId ? (
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center"
                    >
                      <QrCode className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {formData.toAccount
                          ? "Tap to scan again"
                          : "Tap to scan QR code"}
                      </span>
                      {formData.toAccount && (
                        <span className="text-xs text-blue-600 mt-1 font-mono">
                          {formData.toAccount}
                        </span>
                      )}
                    </button>
                  ) : (
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.toAccount}
                          onChange={(e) =>
                            handleInputChange("toAccount", e.target.value)
                          }
                          placeholder={
                            transferMode === "account"
                              ? "Enter bank account number"
                              : "Enter 24-character receiver Id or service account"
                          }
                          disabled={receiverId && receiverVerified}
                          className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                            receiverId && receiverVerified
                              ? "bg-gray-50 cursor-not-allowed"
                              : ""
                          }`}
                          required
                        />
                        {/* Auto-verification indicator */}
                        {transferMode === "service" &&
                          !receiverId &&
                          formData.toAccount.length === 24 && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              {receiverLoading ? (
                                <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                              ) : receiverVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : receiverError ? (
                                <AlertCircle className="h-4 w-4 text-red-600" />
                              ) : null}
                            </div>
                          )}
                      </div>

                      {transferMode === "service" && !receiverId && (
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {formData.toAccount.length === 24 &&
                            isValidObjectId(formData.toAccount)
                              ? "Auto-verifying receiver Id..."
                              : "Enter 24-character receiver Id for auto-verification"}
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowQRScanner(true)}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>Scan QR</span>
                          </button>
                        </div>
                      )}

                      {receiverId && receiverVerified && (
                        <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Receiver verified from URL</span>
                        </p>
                      )}

                      {!receiverId &&
                        transferMode === "service" &&
                        receiverVerified && (
                          <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Receiver auto-verified</span>
                          </p>
                        )}

                      {!receiverId &&
                        transferMode === "service" &&
                        receiverError &&
                        formData.toAccount.length === 24 && (
                          <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{receiverError}</span>
                          </p>
                        )}
                    </>
                  )}
                </div>

                {/* Amount Input */}
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
                      onChange={(e) =>
                        handleInputChange("amount", e.target.value)
                      }
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  {selectedAccount && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available balance: ₹
                      {selectedAccount.balance.toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                {/* Note Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => handleInputChange("note", e.target.value)}
                    placeholder="Add a note for this transfer"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      ((receiverId || isValidObjectId(formData.toAccount)) &&
                        transferMode === "service" &&
                        !receiverVerified) ||
                      receiverLoading
                    }
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                      loading ||
                      accounts.length === 0 ||
                      ((receiverId || isValidObjectId(formData.toAccount)) &&
                        transferMode === "service" &&
                        !receiverVerified) ||
                      receiverLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing Transfer...</span>
                      </div>
                    ) : receiverLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying Receiver...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>Send Money</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Transfer Summary & Info */}
          <div className="space-y-6">
            {/* Transfer Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Transfer Summary
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Transfer Method</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {transferMode === "account"
                      ? "Bank Account"
                      : "Service Account"}
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

                {formData.toAccount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">To</span>
                    <span className="text-sm font-medium text-gray-900">
                      {transferMode === "service"
                        ? formData.toAccount.length > 20
                          ? `${formData.toAccount.substring(0, 20)}...`
                          : formData.toAccount
                        : formData.toAccount}
                    </span>
                  </div>
                )}

                {receiverInfo && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Receiver</span>
                    <span className="text-sm font-medium text-gray-900">
                      {receiverInfo.displayName || "LinkSuraksha User"}
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
              </div>
            </div>

            {/* Transaction Flow Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">
                How it works
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p className="text-sm text-blue-700">
                    Money is debited from your selected account
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p className="text-sm text-blue-700">
                    LinkSuraksha Gateway processes the transfer
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p className="text-sm text-blue-700">
                    {transferMode === "account"
                      ? "Money is credited to recipient's bank account"
                      : "Money is credited to recipient's service account"}
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
                    Secure Transfer
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• End-to-end encryption</li>
                    <li>• Two-factor authentication</li>
                    <li>• Real-time fraud monitoring</li>
                    <li>• Instant transaction notifications</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Scan QR Code
              </h3>
              <button
                onClick={() => setShowQRScanner(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center mb-6">
              <Scanner onScan={handleQRScan} />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowQRScanner(false)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferPage;
