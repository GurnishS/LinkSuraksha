import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Search,
  Download,
  Calendar,
  Eye,
  Shield,
  Bell,
  LogOut,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { avatarUri } from "../constants";
import Chart from "react-apexcharts";
import Navbar from "../components/Navbar";
import config from "../constants.js";

const Transactions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'sent', 'received'
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'completed', 'pending', 'failed'
  const [dateRange, setDateRange] = useState("all"); // 'all', 'today', 'week', 'month'
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedChart, setSelectedChart] = useState('overview'); // 'overview', 'monthly', 'status'

  // API state
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User data
  const user = {
    name: sessionStorage.getItem("Name"),
    email: sessionStorage.getItem("Email"),
    token: sessionStorage.getItem("Token"),
    avatar: avatarUri,
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!user.name || !user.email || !user.token) {
      navigate("/login?redirect=" + encodeURIComponent("/transactions"));
    }
  }, [user, navigate]);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);

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
              recipientAccount:
                transaction.toReceiverServiceId ||
                `****${transaction.toAccountNumber?.slice(-4)}`,
              senderServiceAccount: `LSG-SND-${transaction.userId?.slice(-8)}`,
              toAccountNumber: transaction.toAccountNumber,
              fromAccountNumber: transaction.fromAccountNumber,
              toReceiverServiceId: transaction.toReceiverServiceId,
              date: transaction.createdAt,
              status: transaction.status.toLowerCase(),
              reference: transaction._id.slice(-8).toUpperCase(),
              note: transaction.note,
              createdAt: transaction.createdAt,
              updatedAt: transaction.updatedAt,
              // Additional fields for display
              isActualTransaction: true,
              fromAccount: `Account - ****${transaction.fromAccountNumber?.slice(
                -4
              )}`,
              toAccount: transaction.toAccountNumber
                ? `Account - ****${transaction.toAccountNumber.slice(-4)}`
                : null,
              gatewayAccount: "LSG-GTW-MAIN001",
              receiverServiceAccount: transaction.toReceiverServiceId,
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
              recipientAccount: `LSG-RCV-${transaction.toReceiverServiceId?.slice(
                -8
              )}`,
              senderServiceAccount:
                transaction.fromReceiverServiceId ||
                `LSG-SND-${transaction.userId?.slice(-8)}`,
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
              // Additional fields for display
              isActualTransaction: true,
              fromAccount: transaction.fromAccountNumber
                ? `Account - ****${transaction.fromAccountNumber.slice(-4)}`
                : null,
              toAccount: `Account - ****${transaction.toAccountNumber?.slice(
                -4
              )}`,
              gatewayAccount: "LSG-GTW-MAIN001",
              receiverServiceAccount: transaction.fromReceiverServiceId,
            })
          );
          allTransactions.push(...receivedTransactions);
        }

        // Sort by date (newest first)
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        setTransactions(allTransactions);
      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/transactions"));
          return;
        }
        throw new Error(data.message || "Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      if (error.message !== "No transactions found.") {
        setError(error.message);
        Toastify({
          text: error.message || "Failed to load transactions",
          backgroundColor: "#DC2626",
          gravity: "top",
          position: "right",
          duration: 4000,
        }).showToast();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load transactions on component mount
  useEffect(() => {
    if (user.token) {
      fetchTransactions();
    }
  }, [user.token]);

  // Filter transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.recipient &&
        transaction.recipient
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (transaction.sender &&
        transaction.sender.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.note &&
        transaction.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === "all" || transaction.type === filterType;
    const matchesStatus =
      filterStatus === "all" || transaction.status === filterStatus;

    // Date filtering
    let matchesDate = true;
    if (dateRange !== "all") {
      const transactionDate = new Date(transaction.date);
      const now = new Date();

      switch (dateRange) {
        case "today":
          matchesDate = transactionDate.toDateString() === now.toDateString();
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = transactionDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Chart data preparation
  const getChartData = () => {
    const sentTransactions = filteredTransactions.filter(t => t.type === 'sent');
    const receivedTransactions = filteredTransactions.filter(t => t.type === 'received');
    
    const sentAmount = sentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const receivedAmount = receivedTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Overview Chart (Donut)
    const overviewChart = {
      series: [sentAmount, receivedAmount],
      options: {
        chart: {
          type: 'donut',
          height: 350,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          }
        },
        colors: ['#EF4444', '#10B981'],
        labels: ['Sent', 'Received'],
        legend: {
          position: 'bottom',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
          markers: {
            width: 12,
            height: 12,
            radius: 6
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%',
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: '16px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif'
                },
                value: {
                  show: true,
                  fontSize: '24px',
                  fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  formatter: function (val) {
                    return '₹' + parseInt(val).toLocaleString('en-IN');
                  }
                },
                total: {
                  show: true,
                  showAlways: true,
                  label: 'Total',
                  fontSize: '14px',
                  fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  formatter: function (w) {
                    const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                    return '₹' + total.toLocaleString('en-IN');
                  }
                }
              }
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val.toFixed(1) + '%';
          },
          style: {
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'Inter, sans-serif'
          }
        },
        tooltip: {
          enabled: true,
          style: {
            fontFamily: 'Inter, sans-serif'
          },
          y: {
            formatter: function (val) {
              return '₹' + val.toLocaleString('en-IN');
            }
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: 'bottom'
            }
          }
        }]
      }
    };

    // Monthly Trend Chart (Line)
    const monthlyData = {};
    filteredTransactions.forEach(transaction => {
      const month = new Date(transaction.date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { sent: 0, received: 0 };
      }
      monthlyData[month][transaction.type] += transaction.amount;
    });

    const months = Object.keys(monthlyData).sort().slice(-6); // Last 6 months
    const sentData = months.map(month => monthlyData[month].sent);
    const receivedData = months.map(month => monthlyData[month].received);

    const monthlyChart = {
      series: [{
        name: 'Sent',
        data: sentData,
        color: '#EF4444'
      }, {
        name: 'Received',
        data: receivedData,
        color: '#10B981'
      }],
      options: {
        chart: {
          type: 'line',
          height: 350,
          zoom: {
            enabled: false
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            }
          }
        },
        colors: ['#EF4444', '#10B981'],
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 3
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5
          }
        },
        xaxis: {
          categories: months.map(month => {
            const date = new Date(month + '-01');
            return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
          }),
          labels: {
            style: {
              fontFamily: 'Inter, sans-serif'
            }
          }
        },
        yaxis: {
          labels: {
            formatter: function (val) {
              return '₹' + val.toLocaleString('en-IN');
            },
            style: {
              fontFamily: 'Inter, sans-serif'
            }
          }
        },
        tooltip: {
          style: {
            fontFamily: 'Inter, sans-serif'
          },
          y: {
            formatter: function (val) {
              return '₹' + val.toLocaleString('en-IN');
            }
          }
        },
        legend: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px'
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              height: 280
            }
          }
        }]
      }
    };

    // Status Distribution Chart (Bar)
    const statusData = {};
    filteredTransactions.forEach(transaction => {
      const status = transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1);
      statusData[status] = (statusData[status] || 0) + 1;
    });

    const statusChart = {
      series: [{
        name: 'Transactions',
        data: Object.values(statusData)
      }],
      options: {
        chart: {
          type: 'bar',
          height: 350,
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800
          }
        },
        colors: ['#3B82F6'],
        plotOptions: {
          bar: {
            borderRadius: 8,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function (val) {
            return val;
          },
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ['#304758'],
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600
          }
        },
        xaxis: {
          categories: Object.keys(statusData),
          position: 'bottom',
          labels: {
            offsetY: -18,
            style: {
              fontFamily: 'Inter, sans-serif'
            }
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: {
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          },
          labels: {
            show: false
          }
        },
        grid: {
          show: false
        },
        tooltip: {
          style: {
            fontFamily: 'Inter, sans-serif'
          }
        },
        responsive: [{
          breakpoint: 480,
          options: {
            chart: {
              height: 280
            }
          }
        }]
      }
    };

    return { overviewChart, monthlyChart, statusChart };
  };

  const { overviewChart, monthlyChart, statusChart } = getChartData();

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "credited":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "failed":
      case "debited":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "credited":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "failed":
      case "debited":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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

  // Loading component
  const TransactionsLoading = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-48 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="text-right">
              <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Charts Loading component
  const ChartsLoading = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-80 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  // Error component
  const TransactionsError = () => (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Failed to load transactions
      </h3>
      <p className="text-gray-500 mb-4">{error}</p>
      <button
        onClick={fetchTransactions}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Retry</span>
      </button>
    </div>
  );

  const TransactionDetailModal = ({ transaction, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Transaction Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Transaction Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  transaction.type === "sent"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {transaction.type === "sent" ? (
                  <ArrowUpRight className="h-6 w-6" />
                ) : (
                  <ArrowDownLeft className="h-6 w-6" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {transaction.type === "sent"
                    ? "Money Sent"
                    : "Money Received"}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-2xl font-bold ${
                  transaction.type === "sent"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {transaction.type === "sent" ? "-" : "+"}₹
                {transaction.amount.toLocaleString("en-IN")}
              </p>
              <div className="flex items-center space-x-1">
                {getStatusIcon(transaction.status)}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    transaction.status
                  )}`}
                >
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>

          {/* Transaction Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Reference Id
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-mono text-gray-900">
                    {transaction.reference}
                  </p>
                  <button
                    onClick={() => copyToClipboard(transaction.reference)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  {transaction.type === "sent" ? "Recipient" : "Sender"}
                </label>
                <p className="text-sm text-gray-900">
                  {transaction.type === "sent"
                    ? transaction.recipient
                    : transaction.sender}
                </p>
              </div>
            </div>

            {transaction.note && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Note
                </label>
                <p className="text-sm text-gray-900">{transaction.note}</p>
              </div>
            )}

            {transaction.failureReason && (
              <div>
                <label className="block text-sm font-medium text-red-500 mb-1">
                  Failure Reason
                </label>
                <p className="text-sm text-red-600">
                  {transaction.failureReason}
                </p>
              </div>
            )}
          </div>

          {/* Service Account Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Service Account Details
            </h4>
            <div className="space-y-3 text-xs">
              {transaction.type === "sent" ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">From Account:</span>
                    <span className="font-mono">{transaction.fromAccount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sender Service:</span>
                    <span className="font-mono">
                      {transaction.senderServiceAccount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gateway:</span>
                    <span className="font-mono">
                      {transaction.gatewayAccount}
                    </span>
                  </div>
                  {transaction.toReceiverServiceId ? (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Recipient Service:</span>
                      <span className="font-mono">
                        {transaction.toReceiverServiceId}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span className="text-gray-500">To Account:</span>
                      <span className="font-mono">
                        ****{transaction.toAccountNumber?.slice(-4)}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {transaction.fromReceiverServiceId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">From Service:</span>
                      <span className="font-mono">
                        {transaction.fromReceiverServiceId}
                      </span>
                    </div>
                  )}
                  {transaction.fromAccount && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">From Account:</span>
                      <span className="font-mono">
                        {transaction.fromAccount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gateway:</span>
                    <span className="font-mono">
                      {transaction.gatewayAccount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">To Account:</span>
                    <span className="font-mono">{transaction.toAccount}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              <span>Download Receipt</span>
            </button>
            <button className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ExternalLink className="h-4 w-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Transactions
          </h1>
          <p className="text-gray-600">
            View and manage your transaction history with visual insights
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>

            {/* Refresh and Export */}
            <div className="flex space-x-2">
              <button
                onClick={fetchTransactions}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-5 w-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="credited">Credited</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Summary */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <ArrowUpRight className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Sent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹
                    {filteredTransactions
                      .filter((t) => t.type === "sent")
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ArrowDownLeft className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Received</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹
                    {filteredTransactions
                      .filter((t) => t.type === "received")
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredTransactions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {!loading && !error && filteredTransactions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Transaction Analytics
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedChart('overview')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChart === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <PieChart className="h-4 w-4" />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setSelectedChart('monthly')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChart === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Trend</span>
                </button>
                <button
                  onClick={() => setSelectedChart('status')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChart === 'status'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Status</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedChart === 'overview' && 'Transaction Overview'}
                  {selectedChart === 'monthly' && 'Monthly Trend'}
                  {selectedChart === 'status' && 'Status Distribution'}
                </h3>
                {selectedChart === 'overview' && (
                  <Chart
                    options={overviewChart.options}
                    series={overviewChart.series}
                    type="donut"
                    height={350}
                  />
                )}
                {selectedChart === 'monthly' && (
                  <Chart
                    options={monthlyChart.options}
                    series={monthlyChart.series}
                    type="line"
                    height={350}
                  />
                )}
                {selectedChart === 'status' && (
                  <Chart
                    options={statusChart.options}
                    series={statusChart.series}
                    type="bar"
                    height={350}
                  />
                )}
              </div>

              {/* Secondary Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedChart === 'overview' && 'Monthly Trend'}
                  {selectedChart === 'monthly' && 'Transaction Overview'}
                  {selectedChart === 'status' && 'Transaction Overview'}
                </h3>
                {selectedChart === 'overview' && (
                  <Chart
                    options={monthlyChart.options}
                    series={monthlyChart.series}
                    type="line"
                    height={350}
                  />
                )}
                {(selectedChart === 'monthly' || selectedChart === 'status') && (
                  <Chart
                    options={overviewChart.options}
                    series={overviewChart.series}
                    type="donut"
                    height={350}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Transaction History{" "}
              {!loading && `(${filteredTransactions.length})`}
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <TransactionsLoading />
            ) : error ? (
              <TransactionsError />
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {transactions.length === 0
                    ? "No transactions yet"
                    : "No transactions found"}
                </h3>
                <p className="text-gray-500">
                  {transactions.length === 0
                    ? "Your transaction history will appear here once you start sending or receiving money."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTransaction(transaction)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          transaction.type === "sent"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {transaction.type === "sent" ? (
                          <ArrowUpRight className="h-6 w-6" />
                        ) : (
                          <ArrowDownLeft className="h-6 w-6" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-wrap">
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
                        <div className="flex items-center space-x-2 text-sm text-gray-500 flex-wrap">
                          <span>{transaction.reference}</span>
                          <span>•</span>
                          <span>
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(transaction.date).toLocaleTimeString()}
                          </span>
                        </div>
                        {transaction.note && (
                          <p className="text-sm text-gray-500 mt-1">
                            {transaction.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          transaction.type === "sent"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {transaction.type === "sent" ? "-" : "+"}₹
                        {transaction.amount.toLocaleString("en-IN")}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(transaction.status)}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Load More Button */}
          {filteredTransactions.length > 0 && (
            <div className="p-6 border-t border-gray-200 text-center">
              <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Load More Transactions
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
  );
};

export default Transactions;