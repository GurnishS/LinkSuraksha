import React, { useState, useEffect, useRef } from "react";
import { avatarUri } from "../constants.js";
import QRCode from "react-qr-code";
// import { Html5QrcodeScanner } from "html5-qrcode";
import Scanner from "../components/Scanner.jsx";
import {
  CreditCard,
  Send,
  Plus,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Bell,
  Settings,
  LogOut,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle,
  QrCode,
  Camera,
  Copy,
  Share,
  X,
  Download,
  Scan,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Navbar from "../components/Navbar.jsx";
import config from "../constants.js";

const Dashboard = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [transferMethod, setTransferMethod] = useState("account");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);

  // Add transaction state
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const user = {
    name: sessionStorage.getItem("Name") || undefined,
    email: sessionStorage.getItem("Email") || undefined,
    token: sessionStorage.getItem("Token") || undefined,
    avatar: avatarUri,
  };

  // Redirect if user not authenticated
  useEffect(() => {
    console.log(user);
    if (!user.name || !user.email || !user.token) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch linked accounts
  const fetchLinkedAccounts = async () => {
    setAccountsLoading(true);
    setAccountsError(null);

    try {
      const response = await fetch(`${config.GATEWAY_BACKEND_URL}/api/accounts`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Transform API data to match component structure
        const transformedAccounts = data.accounts.map((account, index) => ({
          id: account._id,
          accountNumber: `****${account.accountNumber.slice(-4)}`,
          actualAccountNumber: account.accountNumber,
          receiverServiceAccount: account.receiverServiceAccount,
          balance: account.balance || 0,
          status: account.status.toLowerCase(),
          accountHolder: account.accountHolder,
          customerId: account.customerId,
          ifscCode: account.ifscCode,
          accountToken: account.accountToken,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
          qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`,
        }));

        setAccounts(transformedAccounts);
      } else {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);

      if (error.message != "No linked accounts found") {
        Toastify({
          text: error.message || "Failed to load accounts. Please try again.",
          backgroundColor: "#DC2626",
          gravity: "top",
          position: "right",
          duration: 4000,
        }).showToast();

        setAccountsError(error.message);
      }
    } finally {
      setAccountsLoading(false);
    }
  };

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    setTransactionsError(null);

    try {
      const response = await fetch(`${config.GATEWAY_BACKEND_URL}/api/accounts/transactions`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Transform API data to match component structure
        const allTransactions = [];

        // Process sent transactions
        if (data.transactions.sent && data.transactions.sent.length > 0) {
          const sentTransactions = data.transactions.sent.map(
            (transaction) => ({
              id: transaction._id,
              type: "sent",
              amount: transaction.amount,
              recipient: transaction.toReceiverServiceId
                ? "LinkSuraksha User"
                : "Bank Account",
              sender: "Your Account",
              toAccountNumber: transaction.toAccountNumber,
              fromAccountNumber: transaction.fromAccountNumber,
              toReceiverServiceId: transaction.toReceiverServiceId,
              date: transaction.createdAt,
              status: transaction.status.toLowerCase(),
              reference: transaction._id.slice(-8).toUpperCase(),
              note: transaction.note,
              createdAt: transaction.createdAt,
              updatedAt: transaction.updatedAt,
            })
          );
          allTransactions.push(...sentTransactions);
        }

        // Process received transactions
        if (
          data.transactions.received &&
          data.transactions.received.length > 0
        ) {
          const receivedTransactions = data.transactions.received.map(
            (transaction) => ({
              id: transaction._id,
              type: "received",
              amount: transaction.amount,
              recipient: "Your Account",
              sender: transaction.fromReceiverServiceId
                ? "LinkSuraksha User"
                : "Bank Account",
              toAccountNumber: transaction.toAccountNumber,
              fromAccountNumber: transaction.fromAccountNumber,
              toReceiverServiceId: transaction.toReceiverServiceId,
              fromReceiverServiceId: transaction.fromReceiverServiceId,
              date: transaction.createdAt,
              status: transaction.status.toLowerCase(),
              reference: transaction._id.slice(-8).toUpperCase(),
              note: transaction.note,
              createdAt: transaction.createdAt,
              updatedAt: transaction.updatedAt,
            })
          );
          allTransactions.push(...receivedTransactions);
        }

        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(allTransactions);
      } else {
        if (response.status === 401) {
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);

      if (error.message !== "No transactions found.") {
        setTransactionsError(error.message);
      }
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Load accounts and transactions on component mount
  useEffect(() => {
    if (user.token) {
      fetchLinkedAccounts();
      fetchTransactions();
    }
  }, [user.token]);

  // Calculate stats
  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );
  const activeAccountsCount = accounts.filter(
    (acc) => acc.status === "verified"
  ).length;

  // Calculate this month's transactions
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    return (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    );
  });
  const thisMonthAmount = thisMonthTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Calculate pending transactions
  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending"
  );
  const pendingAmount = pendingTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Toastify({
      text: "Copied to clipboard!",
      backgroundColor: "#4BB543",
      gravity: "top",
      position: "right",
      duration: 2000,
    }).showToast();
  };

  const generateQRCode = (account) => {
    const qrData = {
      receiverServiceAccount: account.receiverServiceAccount,
      url: `/transfer/${account.receiverServiceAccount}`,
      gateway: "LinkSuraksha",
    };
    return JSON.stringify(qrData);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "credited":
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "debited":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "verified":
      case "credited":
      case "completed":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "pending":
        return <Clock className="h-3 w-3 mr-1" />;
      case "failed":
      case "debited":
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  const downloadQRCode = (value) => {
    // Get the SVG element
    const svgElement = document.getElementById("qr-code");
    if (!svgElement) return;

    // Create a canvas with fixed dimensions matching the QR code size
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Use fixed size for better quality (matching the size prop in your QRCode component)
    canvas.width = 256;
    canvas.height = 256;

    // Create a new image with the SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBase64 = btoa(svgData);
    const img = new Image();

    img.onload = function () {
      // Fill with white background first
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw image centered
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Create download link
      const imgURI = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-code-${value}.png`;
      downloadLink.href = imgURI;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    };

    img.src = `data:image/svg+xml;base64,${svgBase64}`;
  };

  const QRModal = ({ account, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Share Account QR
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
            {/* <QrCode className="h-24 w-24 text-gray-400" /> */}
            <QRCode
              id="qr-code"
              size={256}
              style={{ height: "auto", maxWidth: "80%", width: "80%" }}
              value={generateQRCode(account)}
              viewBox={`0 0 256 256`}
            />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {account.accountHolder} - {account.ifscCode}
          </p>
          <p className="text-xs text-gray-500 font-mono bg-gray-50 p-2 rounded">
            {account.receiverServiceAccount}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => copyToClipboard(account.receiverServiceAccount)}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Account Id</span>
          </button>

          <button
            onClick={() => downloadQRCode(account.receiverServiceAccount)}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download QR</span>
          </button>
        </div>
      </div>
    </div>
  );

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

  // Handle QR scan result
  const handleQRScan = (scannedData) => {
    console.log("QR scanned data:", scannedData);
    
    // Close scanner immediately
    setShowQRScanner(false);
    
    try {
      // First, try to parse as JSON (LinkSuraksha QR format)
      const qrData = JSON.parse(scannedData);
      if (qrData.receiverServiceAccount) {
        console.log("Found receiver service account:", qrData.receiverServiceAccount);
        
        // Use setTimeout to ensure state update completes before navigation
        setTimeout(() => {
          navigate(`/transfer/${qrData.receiverServiceAccount}`);
        }, 100);
        
        Toastify({
          text: "QR code scanned! Redirecting...",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 2000,
        }).showToast();
        return;
      }
      if (qrData.transactionId) {
        console.log("Found transactionId:", qrData.transactionId);
        
        // Use setTimeout to ensure state update completes before navigation
        setTimeout(() => {
          navigate(`/merchant/${qrData.transactionId}`);
        }, 100);
        
        Toastify({
          text: "QR code scanned! Redirecting...",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 2000,
        }).showToast();
        return;
      }
    } catch {
      console.log("Not JSON format, trying URL extraction...");
    }

    // If we reach here, QR code format was not recognized
    Toastify({
      text: "Invalid QR code format. Please try again.",
      backgroundColor: "#DC2626",
      gravity: "top",
      position: "right",
      duration: 3000,
    }).showToast();
  };

  const QRScanner = ({ onClose}) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Scan QR Code
            </h3>
            <button
              onClick={onClose}
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
              onClick={onClose}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading component for accounts
  const AccountsLoading = () => (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="bg-gray-100 rounded-lg p-3 mb-3">
            <div className="h-3 bg-gray-200 rounded w-40 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="flex space-x-2">
            <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error component for accounts
  const AccountsError = () => (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Failed to load accounts
      </h3>
      <p className="text-gray-500 mb-4">{accountsError}</p>
      <button
        onClick={fetchLinkedAccounts}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Retry</span>
      </button>
    </div>
  );

  // Loading component for transactions
  const TransactionsLoading = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border border-gray-100 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
          <div className="bg-gray-100 rounded p-2">
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Error component for transactions
  const TransactionsError = () => (
    <div className="text-center py-8">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Failed to load transactions
      </h3>
      <p className="text-gray-500 mb-4">{transactionsError}</p>
      <button
        onClick={fetchTransactions}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Retry</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-600">
            Manage your finances securely with LinkSuraksha Gateway
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Wallet className="h-8 w-8 text-blue-200" />
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                {showBalance ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            <p className="text-blue-200 text-sm mb-1">Total Balance</p>
            <p className="text-2xl font-bold">
              {accountsLoading ? (
                <span className="h-8 w-32 bg-blue-500 rounded animate-pulse inline-block"></span>
              ) : showBalance ? (
                `₹${totalBalance.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}`
              ) : (
                "••••••••"
              )}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {accountsLoading ? (
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  accounts.length
                )}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Linked Accounts</p>
            <p className="text-green-600 text-sm font-medium">
              {accountsLoading ? "Loading..." : `${activeAccountsCount} Active`}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-gray-900">
                {transactionsLoading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  `₹${thisMonthAmount.toLocaleString("en-IN")}`
                )}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">This Month</p>
            <p className="text-purple-600 text-sm font-medium">
              {transactionsLoading
                ? "Loading..."
                : `${thisMonthTransactions.length} transactions`}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-gray-900">
                {transactionsLoading ? (
                  <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  pendingTransactions.length
                )}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Pending Transactions</p>
            <p className="text-orange-600 text-sm font-medium">
              {transactionsLoading
                ? "Loading..."
                : `₹${pendingAmount.toLocaleString("en-IN")}`}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <button
              onClick={() => {
                navigate("/transfer");
              }}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
            >
              <Send className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Send Money
              </span>
            </button>

            <button
              onClick={() => setShowQRScanner(true)}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 cursor-pointer"
            >
              <Scan className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Scan QR</span>
            </button>

            <button
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 cursor-pointer"
              onClick={() => navigate("/manage-accounts")}
            >
              <Plus className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Link Account
              </span>
            </button>

            <button
              className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 cursor-pointer"
              onClick={() => navigate("/transactions")}
            >
              <Clock className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                View History
              </span>
            </button>

            <button className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
              <Settings className="h-8 w-8 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Settings
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Linked Accounts */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Linked Accounts
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchLinkedAccounts}
                  disabled={accountsLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      accountsLoading ? "animate-spin" : ""
                    }`}
                  />
                </button>
                <button
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  onClick={() => navigate("/manage-accounts")}
                >
                  Manage
                </button>
              </div>
            </div>

            {accountsLoading ? (
              <AccountsLoading />
            ) : accountsError ? (
              <AccountsError />
            ) : accounts.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No accounts linked
                </h3>
                <p className="text-gray-500 mb-4">
                  Link your first bank account to get started
                </p>
                <button
                  onClick={() => navigate("/manage-accounts")}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Link Account</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {account.accountHolder}
                          </p>
                          <p className="text-sm text-gray-500">
                            {account.accountNumber} • {account.ifscCode}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {showBalance
                            ? `₹${account.balance.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}`
                            : "••••••••"}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            account.status
                          )}`}
                        >
                          {getStatusIcon(account.status)}
                          {account.status}
                        </span>
                      </div>
                    </div>

                    {/* Service Account Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Receiver Service Account
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-mono text-gray-700">
                          {account.receiverServiceAccount}
                        </p>
                        <button
                          onClick={() =>
                            copyToClipboard(account.receiverServiceAccount)
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowQRModal(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <QrCode className="h-4 w-4" />
                        <span>QR Code</span>
                      </button>
                      <button
                        onClick={() =>
                          copyToClipboard(account.receiverServiceAccount)
                        }
                        className="flex-1 flex items-center justify-center space-x-1 py-2 px-3 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                      >
                        <Share className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Transactions
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchTransactions}
                  disabled={transactionsLoading}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      transactionsLoading ? "animate-spin" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={() => navigate("/transactions")}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
            </div>

            {transactionsLoading ? (
              <TransactionsLoading />
            ) : transactionsError ? (
              <TransactionsError />
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No transactions yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Your transaction history will appear here
                </p>
                <button
                  onClick={() => navigate("/transfer")}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Send Money</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id+transaction.type}
                    className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === "sent"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {transaction.type === "sent" ? (
                            <ArrowUpRight className="h-5 w-5" />
                          ) : (
                            <ArrowDownLeft className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.type === "sent"
                              ? transaction.toReceiverServiceId
                                ? `To ${transaction.recipient}`
                                : `To Account ****${transaction.toAccountNumber?.slice(
                                    -4
                                  )}`
                              : transaction.fromReceiverServiceId
                              ? `From ${transaction.sender}`
                              : `From Account ****${transaction.fromAccountNumber?.slice(
                                  -4
                                )}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.reference} •{" "}
                            {new Date(transaction.date).toLocaleDateString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold ${
                            transaction.type === "sent"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.type === "sent" ? "-" : "+"}₹
                          {transaction.amount.toLocaleString("en-IN")}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {getStatusIcon(transaction.status)}
                          {transaction.status}
                        </span>
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="bg-gray-50 rounded p-2 text-xs">
                      <div className="space-y-1">
                        <p>
                          <span className="text-gray-500">From:</span>{" "}
                          <span className="font-mono">
                            {transaction.type === "sent"
                              ? `****${transaction.fromAccountNumber?.slice(
                                  -4
                                )}`
                              : transaction.fromReceiverServiceId
                              ? transaction.fromReceiverServiceId
                              : `****${transaction.fromAccountNumber?.slice(
                                  -4
                                )}`}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">To:</span>{" "}
                          <span className="font-mono">
                            {transaction.type === "sent"
                              ? transaction.toReceiverServiceId
                                ? transaction.toReceiverServiceId
                                : `****${transaction.toAccountNumber?.slice(
                                    -4
                                  )}`
                              : `****${transaction.toAccountNumber?.slice(-4)}`}
                          </span>
                        </p>
                        {transaction.note && (
                          <p>
                            <span className="text-gray-500">Note:</span>{" "}
                            <span>{transaction.note}</span>
                          </p>
                        )}
                        <p>
                          <span className="text-gray-500">Date:</span>{" "}
                          <span>
                            {new Date(transaction.date).toLocaleDateString(
                              "en-IN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Send Money
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Transfer Method Selection */}
            <div className="mb-6">
              <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setTransferMethod("account")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    transferMethod === "account"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Account Number
                </button>
                <button
                  onClick={() => setTransferMethod("qr")}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    transferMethod === "qr"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  QR Code
                </button>
              </div>
            </div>

            <form className="space-y-4">
              {transferMethod === "account" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Service Account
                  </label>
                  <input
                    type="text"
                    placeholder="LSG-RCV-xxxxxxxxxx or Bank Account"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter receiver's service account or bank account number
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQRScanner(true)}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center"
                  >
                    <QrCode className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Tap to scan QR code
                    </span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Account
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountHolder} - {account.accountNumber} (₹
                      {account.balance.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="₹0.00"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Add a note"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Transaction Flow Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-medium mb-1">
                  Transaction Flow:
                </p>
                <p className="text-xs text-blue-600">
                  Your Account → LinkSuraksha Gateway → Recipient's Account
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Send Money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && selectedAccount && (
        <QRModal
          account={selectedAccount}
          onClose={() => {
            setShowQRModal(false);
            setSelectedAccount(null);
          }}
        />
      )}

      {/* QR Scanner */}
      {showQRScanner && (
        <QRScanner
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
