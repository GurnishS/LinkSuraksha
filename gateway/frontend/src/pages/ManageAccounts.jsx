import React, { useState, useEffect } from "react";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Shield,
  Bell,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Share,
  QrCode,
  Edit3,
  Trash2,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  ExternalLink,
  Landmark,
  Key,
  X,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { avatarUri, backendUri } from "../constants";
import Navbar from "../components/Navbar";

// Helper function to get bank name from IFSC
const getBankNameFromIFSC = (ifscCode) => {
  if (!ifscCode) return "Unknown Bank";

  const ifscBankMap = {
    SBIN: "State Bank of India",
    HDFC: "HDFC Bank",
    ICIC: "ICICI Bank",
    AXIS: "Axis Bank",
    UBIN: "Union Bank of India",
    PUNB: "Punjab National Bank",
    BKID: "Bank of India",
    CNRB: "Canara Bank",
    IOBA: "Indian Overseas Bank",
    LINK: "LinkSuraksha Bank",
  };

  const bankCode = ifscCode.substring(0, 4);
  return ifscBankMap[bankCode] || `${bankCode} Bank`;
};

// EditDisplayNameModal component moved outside
const EditDisplayNameModal = ({ 
  editingAccount, 
  newDisplayName, 
  setNewDisplayName, 
  loading, 
  onClose, 
  onUpdate 
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Edit Display Name
        </h3>
        <button
          onClick={onClose}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Current account info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Account</p>
          <p className="font-medium text-gray-900">
            {editingAccount && getBankNameFromIFSC(editingAccount.ifscCode)}
          </p>
          <p className="text-sm text-gray-600">
            {editingAccount && editingAccount.maskedAccountNumber}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name * 
            <span className="text-orange-600 font-normal">(Public - Visible to anyone)</span>
          </label>
          <input
            type="text"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            placeholder="Enter a display name for this account"
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            maxLength={50}
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Choose a name that helps you identify this account easily. 
            <span className="text-orange-600 font-medium">This name will be visible to anyone who has your receiver service account Id.</span>
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">
                Public Display Name
              </p>
              <p className="text-xs text-orange-700 mt-1">
                This display name is public and will be visible to anyone who has your receiver service account Id. 
                Avoid using personal information like your full name, phone number, or sensitive details.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onUpdate}
            disabled={loading || !newDisplayName.trim()}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              loading || !newDisplayName.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Updating...</span>
              </div>
            ) : (
              "Update Name"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Merchant Management Modal
const MerchantManagementModal = ({ 
  account, 
  loading, 
  onClose, 
  onToggleMerchant, 
  onManageApiKeys 
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Merchant Management
        </h3>
        <button
          onClick={onClose}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Account info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Account</p>
          <p className="font-medium text-gray-900">
            {getBankNameFromIFSC(account.ifscCode)}
          </p>
          <p className="text-sm text-gray-600">
            {account.displayName}
          </p>
        </div>

        {/* Current status */}
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Merchant Status
              </p>
              <p className="text-xs text-gray-500">
                {account.isMerchant 
                  ? "This account can accept API-based payments" 
                  : "Enable merchant features for API access"
                }
              </p>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              account.isMerchant 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-800"
            }`}>
              {account.isMerchant ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>

        {account.isMerchant && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-900">
                  API Keys
                </p>
                <p className="text-xs text-purple-700">
                  {account.apiKeys?.length || 0} active API keys
                </p>
              </div>
              <button
                onClick={onManageApiKeys}
                disabled={loading}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium disabled:opacity-50"
              >
                Manage →
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onToggleMerchant}
            disabled={loading}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : account.isMerchant
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              account.isMerchant ? "Disable Merchant" : "Enable Merchant"
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// API Key Management Modal
const ApiKeyManagementModal = ({ 
  account, 
  loading, 
  newApiKeyName, 
  setNewApiKeyName, 
  onClose, 
  onGenerateApiKey, 
  onRemoveApiKey,
  onCopy 
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          API Key Management
        </h3>
        <button
          onClick={onClose}
          disabled={loading}
          className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Account info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">Merchant Account</p>
          <p className="font-medium text-gray-900">
            {getBankNameFromIFSC(account.ifscCode)} - {account.displayName}
          </p>
        </div>

        {/* Generate new API key */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Generate New API Key</h4>
          <div className="flex space-x-3">
            <input
              type="text"
              value={newApiKeyName}
              onChange={(e) => setNewApiKeyName(e.target.value)}
              placeholder="Enter API key name (e.g., Production, Development)"
              disabled={loading}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              maxLength={50}
            />
            <button
              onClick={onGenerateApiKey}
              disabled={loading || !newApiKeyName.trim()}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                loading || !newApiKeyName.trim()
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Existing API keys */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Existing API Keys ({account.apiKeys?.length || 0})
          </h4>
          {account.apiKeys && account.apiKeys.length > 0 ? (
            <div className="space-y-3">
              {account.apiKeys.map((apiKey) => (
                <div key={apiKey.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">{apiKey.name}</h5>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.lastUsed && (
                          <> • Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveApiKey(apiKey.key)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        API Key
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 p-2 bg-gray-100 rounded text-xs font-mono">
                          {apiKey.key}
                        </code>
                        <button
                          onClick={() => onCopy(apiKey.key, "API Key")}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No API keys generated yet</p>
              <p className="text-sm">Create your first API key above</p>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
);

// New API Key Result Modal
const NewApiKeyResultModal = ({ apiKeyData, onClose, onCopy }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          API Key Generated Successfully
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">
                API Key Created
              </p>
              <p className="text-xs text-green-700 mt-1">
                Your new API key "{apiKeyData.name}" has been generated successfully.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-3 bg-gray-100 rounded-lg text-sm font-mono break-all">
                {apiKeyData.key}
              </code>
              <button
                onClick={() => onCopy(apiKeyData.key, "API Key")}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Secret
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-3 bg-gray-100 rounded-lg text-sm font-mono break-all">
                {apiKeyData.secret}
              </code>
              <button
                onClick={() => onCopy(apiKeyData.secret, "API Secret")}
                className="text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">
                Important: Save Your API Secret Now
              </p>
              <p className="text-xs text-red-700 mt-1">
                <strong>This is the only time you'll see the API secret.</strong> Store both the API key and secret securely. 
                The secret will not be shown again. If you lose it, you'll need to generate a new API key.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">
                Security Best Practices
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Keep your API key and secret confidential. Never share them publicly or commit them to version control.
                Use environment variables or secure key management systems in production.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={() => onCopy(`Key: ${apiKeyData.key}\nSecret: ${apiKeyData.secret}`, "API Credentials")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Copy Both
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ManageAccounts = () => {
  const navigate = useNavigate();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [deleteAccountId, setDeleteAccountId] = useState(null);
  const [showEditDisplayName, setShowEditDisplayName] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState(null);
  
  // Merchant management state
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [merchantAccount, setMerchantAccount] = useState(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [showNewApiKeyResult, setShowNewApiKeyResult] = useState(false);
  const [newApiKeyData, setNewApiKeyData] = useState(null);
  const [merchantLoading, setMerchantLoading] = useState(false);

  const user = {
    name: sessionStorage.getItem("Name"),
    email: sessionStorage.getItem("Email"),
    token: sessionStorage.getItem("Token"),
    avatar: avatarUri,
  };

  useEffect(() => {
    if (!user.name || !user.email || !user.token) {
      navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
    }
  }, [user, navigate]);

  // Fetch linked accounts from backend
  const fetchLinkedAccounts = async () => {
    setAccountsLoading(true);
    setAccountsError(null);

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
        // Transform API data to match component structure
        const transformedAccounts = data.accounts.map((account) => ({
          id: account._id,
          accountNumber: account.accountNumber,
          maskedAccountNumber: `****${account.accountNumber.slice(-4)}`,
          receiverServiceAccount:
            account?.receiverServiceAccount || "Not Available",
          receiverServiceAccountId: account?.receiverServiceAccountId || account?.receiverServiceAccount || "Not Available",
          displayName: account?.displayName || `${account.accountHolder}'s Account`,
          balance: account?.balance || 0,
          isLinked: true,
          status: account.status, // Keep original status (Pending, Verified, Unlinked)
          accountHolder: account.accountHolder,
          customerId: account.customerId,
          ifscCode: account.ifscCode,
          accountToken: account.accountToken,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
          // Merchant account fields
          isMerchant: account?.isMerchant || false,
          apiKeys: account?.apiKeys || [], // Array of API key objects: [{id, key, name, createdAt, lastUsed}]
          // Default values for missing fields
          linkDate: account.createdAt,
          lastSync: account.updatedAt,
          transactionCount: account.transactionCount || 0,
          monthlyLimit: account.monthlyLimit || 100000,
          usedLimit: account.usedLimit || 0,
          nickname: account.nickname || `${account.accountHolder}'s Account`,
          branch: account.branch || "Main Branch",
        }));

        setAccounts(transformedAccounts);
      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
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

  // Load accounts on component mount
  useEffect(() => {
    if (user.token) {
      fetchLinkedAccounts();
    }
  }, [user.token]);

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

  const handleDeleteAccount = async (accountId) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUri}accounts/link`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ accountId: accountId }),
      });

      const responseData = await response.json();

      if (response.ok) {
        Toastify({
          text: "Account deleted successfully!",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Refresh accounts list
        fetchLinkedAccounts();
      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
          return;
        }
        throw new Error(responseData.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      Toastify({
        text: err.message || "Failed to delete account. Please try again.",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeleteAccountId(null);
    }
  };

  const handleUnlinkAccount = async (accountId) => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUri}accounts/unlink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ accountId: accountId }),
      });

      const responseData = await response.json();

      if (response.ok) {
        Toastify({
          text: "Account unlinked successfully!",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Refresh accounts list
        fetchLinkedAccounts();
      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
          return;
        }
        throw new Error(responseData.message || "Failed to unlink account");
      }
    } catch (err) {
      console.error("Unlink account error:", err);
      Toastify({
        text: err.message || "Failed to unlink account. Please try again.",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.target);

      // Convert FormData to JSON object for better handling
      const data = {
        customerId: formData.get("customerId"),
        accountNumber: formData.get("accountNumber"),
        ifscCode: formData.get("ifscCode"),
        accountHolder: formData.get("accountHolder"),
        gatewayPin: formData.get("gatewayPin"),
      };

      // Validate required fields
      if (
        !data.customerId ||
        !data.accountNumber ||
        !data.ifscCode ||
        !data.accountHolder ||
        !data.gatewayPin
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Validate Pin length
      if (data.gatewayPin.length < 4 || data.gatewayPin.length > 6) {
        throw new Error("Gateway Pin must be 4-6 digits");
      }

      const response = await fetch(backendUri + "accounts/link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (response.ok) {
        Toastify({
          text: "Redirecting to bank website for verification...",
          backgroundColor: "#2563eb",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Close modal
        setShowLinkModal(false);

        // Redirect to bank website if URL is provided
        if (responseData.redirect) {
          // Open in new tab for bank authentication
          window.open(responseData.redirect, "_blank");
        } else {
          // If no redirect URL, show success message
          Toastify({
            text: "Account linking initiated successfully!",
            backgroundColor: "#4BB543",
            gravity: "top",
            position: "right",
            duration: 3000,
          }).showToast();
        }

        // Refresh accounts list
        fetchLinkedAccounts();
      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
          return;
        }
        throw new Error(responseData.message || "Failed to link account");
      }
    } catch (err) {
      console.error("Link account error:", err);
      Toastify({
        text: err.message || "Failed to link account. Please try again.",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  // Update display name
  const handleUpdateDisplayName = async () => {
    if (!editingAccount || !newDisplayName.trim()) {
      Toastify({
        text: "Please enter a valid display name",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 3000,
      }).showToast();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${backendUri}accounts/display-name`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          displayName: newDisplayName.trim(),
          receiverServiceAccountId: editingAccount.receiverServiceAccountId,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        Toastify({
          text: "Display name updated successfully!",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Update the account in the local state
        setAccounts(prevAccounts => 
          prevAccounts.map(account => 
            account.id === editingAccount.id 
              ? { ...account, displayName: newDisplayName.trim() }
              : account
          )
        );

        // Update selectedAccount if it's the same account
        if (selectedAccount && selectedAccount.id === editingAccount.id) {
          setSelectedAccount(prev => ({ ...prev, displayName: newDisplayName.trim() }));
        }

        // Close edit modal
        setShowEditDisplayName(false);
        setEditingAccount(null);
        setNewDisplayName("");
      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
          return;
        }
        throw new Error(responseData.message || "Failed to update display name");
      }
    } catch (err) {
      console.error("Update display name error:", err);
      Toastify({
        text: err.message || "Failed to update display name. Please try again.",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  // Merchant account management functions
  const toggleMerchantStatus = async (account) => {
    setMerchantLoading(true);
    try {
      const response = await fetch(`${backendUri}accounts/merchant/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          accountId: account.id,
          isMerchant: !account.isMerchant,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        const action = !account.isMerchant ? "enabled" : "disabled";
        Toastify({
          text: `Merchant status ${action} successfully!`,
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Update the account in the local state
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => 
            acc.id === account.id 
              ? { ...acc, isMerchant: !acc.isMerchant, apiKeys: !acc.isMerchant ? [] : acc.apiKeys }
              : acc
          )
        );

        // Update selectedAccount if it's the same account
        if (selectedAccount && selectedAccount.id === account.id) {
          setSelectedAccount(prev => ({ 
            ...prev, 
            isMerchant: !prev.isMerchant, 
            apiKeys: !prev.isMerchant ? [] : prev.apiKeys 
          }));
        }

        // Close merchant modal
        setShowMerchantModal(false);
        setMerchantAccount(null);
      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
          return;
        }
        throw new Error(responseData.message || "Failed to toggle merchant status");
      }
    } catch (err) {
      console.error("Toggle merchant status error:", err);
      Toastify({
        text: err.message || "Failed to toggle merchant status. Please try again.",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setMerchantLoading(false);
    }
  };

  const generateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      Toastify({
        text: "Please enter a name for the API key",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 3000,
      }).showToast();
      return;
    }

    setMerchantLoading(true);
    try {
      const response = await fetch(`${backendUri}accounts/merchant/api-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          accountId: merchantAccount.id,
          name: newApiKeyName.trim(),
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setNewApiKeyData(responseData.apiKey);
        setShowNewApiKeyResult(true);
        setShowApiKeyModal(false);
        setNewApiKeyName("");

        // Update the account in the local state
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => 
            acc.id === merchantAccount.id 
              ? { ...acc, apiKeys: [...acc.apiKeys, responseData.apiKey] }
              : acc
          )
        );

        // Update selectedAccount and merchantAccount if it's the same account
        if (selectedAccount && selectedAccount.id === merchantAccount.id) {
          setSelectedAccount(prev => ({ 
            ...prev, 
            apiKeys: [...prev.apiKeys, responseData.apiKey] 
          }));
        }
        
        setMerchantAccount(prev => ({ 
          ...prev, 
          apiKeys: [...prev.apiKeys, responseData.apiKey] 
        }));

        Toastify({
          text: "API key generated successfully!",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();
        // Refresh accounts list
        
        fetchLinkedAccounts();
      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
          return;
        }
        throw new Error(responseData.message || "Failed to generate API key");
      }
    } catch (err) {
      console.error("Generate API key error:", err);
      Toastify({
        text: err.message || "Failed to generate API key. Please try again.",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setMerchantLoading(false);
    }
  };

  const removeApiKey = async (apiKeyId) => {
    setMerchantLoading(true);
    try {
      const response = await fetch(`${backendUri}accounts/merchant/api-key`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          accountId: merchantAccount.id,
          apiKey: apiKeyId,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        Toastify({
          text: "API key removed successfully!",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Update the account in the local state
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => 
            acc.id === merchantAccount.id 
              ? { ...acc, apiKeys: acc.apiKeys.filter(key => (key.id || key.key) !== apiKeyId) }
              : acc
          )
        );

        // Update selectedAccount and merchantAccount if it's the same account
        if (selectedAccount && selectedAccount.id === merchantAccount.id) {
          setSelectedAccount(prev => ({ 
            ...prev, 
            apiKeys: prev.apiKeys.filter(key => (key.id || key.key) !== apiKeyId) 
          }));
        }
        
        setMerchantAccount(prev => ({ 
          ...prev, 
          apiKeys: prev.apiKeys.filter(key => (key.id || key.key) !== apiKeyId) 
        }));

        setShowApiKeyModal(false);
        
        // Refresh accounts list
        fetchLinkedAccounts();

      } else {
        if (response.status === 401) {
          navigate("/login?redirect=" + encodeURIComponent("/manage-accounts"));
          return;
        }
        throw new Error(responseData.message || "Failed to remove API key");
      }
    } catch (err) {
      console.error("Remove API key error:", err);
      Toastify({
        text: err.message || "Failed to remove API key. Please try again.",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setMerchantLoading(false);
    }
  };

  const copyCredentialToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      Toastify({
        text: `${label} copied to clipboard!`,
        backgroundColor: "#4BB543",
        gravity: "top",
        position: "right",
        duration: 2000,
      }).showToast();
    }).catch(() => {
      Toastify({
        text: "Failed to copy to clipboard",
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 2000,
      }).showToast();
    });
  };

  const handleToggleAccount = (accountId) => {
    setAccounts(
      accounts.map((account) =>
        account.id === accountId
          ? {
              ...account,
              status: account.status === "Verified" ? "Unlinked" : "Verified",
            }
          : account
      )
    );
  };

  // Helper function to get status styling
  const getStatusColor = (status) => {
    switch (status) {
      case "Verified":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Unlinked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Verified":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "Pending":
        return <Clock className="h-3 w-3 mr-1" />;
      case "Unlinked":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <AlertTriangle className="h-3 w-3 mr-1" />;
    }
  };

  const LinkAccountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Link New Account
          </h3>
          <button
            onClick={() => !loading && setShowLinkModal(false)}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleLinkAccount}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Id *
            </label>
            <input
              type="text"
              name="customerId"
              placeholder="Enter your customer Id"
              required
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number *
            </label>
            <input
              type="text"
              name="accountNumber"
              placeholder="Enter your account number"
              required
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC Code *
            </label>
            <input
              type="text"
              name="ifscCode"
              placeholder="Enter IFSC code"
              required
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Holder *
            </label>
            <input
              type="text"
              name="accountHolder"
              placeholder="Enter account holder name"
              required
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gateway Pin *
            </label>
            <input
              type="password"
              name="gatewayPin"
              placeholder="Create a 4-6 digit Gateway Pin"
              required
              minLength="4"
              maxLength="6"
              pattern="[0-9]{4,6}"
              disabled={loading}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              This Pin will be used for transaction authorization
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Secure Linking Process
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  You'll be redirected to your bank's secure website for
                  verification. Your credentials are encrypted and never stored.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowLinkModal(false)}
              disabled={loading}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Verify & Link"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Delete Account
          </h3>
          <button
            onClick={() => setShowDeleteModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <div>
              <h4 className="font-medium text-gray-900">Are you sure?</h4>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="font-medium text-red-900 mb-2">This will:</h5>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Permanently remove account from LinkSuraksha</li>
              <li>• Delete all account data and history</li>
              <li>• Revoke all access permissions</li>
              <li>• Cancel all pending transactions</li>
            </ul>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteAccount(deleteAccountId)}
            disabled={loading}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </div>
  );

  const AccountDetailsModal = ({ account }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Account Details
          </h3>
          <button
            onClick={() => setShowAccountDetails(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Account Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Landmark className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  {getBankNameFromIFSC(account.ifscCode)}
                </h4>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">{account.displayName}</p>
                  <button
                    onClick={() => {
                      setEditingAccount(account);
                      setNewDisplayName(account.displayName);
                      setShowEditDisplayName(true);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 mt-1">
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
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900">
                {showBalance
                  ? `₹${account.balance.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}`
                  : "••••••••"}
              </p>
            </div>
          </div>

          {/* Account Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">Bank Details</h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Account Number
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono text-gray-900">
                      {showBalance
                        ? account.accountNumber
                        : account.maskedAccountNumber}
                    </p>
                    <button
                      onClick={() => copyToClipboard(account.accountNumber)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    IFSC Code
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono text-gray-900">
                      {account.ifscCode}
                    </p>
                    <button
                      onClick={() => copyToClipboard(account.ifscCode)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Account Holder
                  </label>
                  <p className="text-sm text-gray-900">
                    {account.accountHolder}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Bank Name
                  </label>
                  <p className="text-sm text-gray-900">
                    {getBankNameFromIFSC(account.ifscCode)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">
                LinkSuraksha Details
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Display Name 
                    <span className="text-orange-600 text-xs ml-1">(Public)</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-900">{account.displayName}</p>
                    <button
                      onClick={() => {
                        setEditingAccount(account);
                        setNewDisplayName(account.displayName);
                        setShowEditDisplayName(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Receiver Service Account
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-mono text-gray-900">
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

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Customer Id
                  </label>
                  <p className="text-sm text-gray-900">{account.customerId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      account.status
                    )}`}
                  >
                    {getStatusIcon(account.status)}
                    {account.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Linked Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(account.linkDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(account.lastSync).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Account Type
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      account.isMerchant 
                        ? "bg-purple-100 text-purple-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {account.isMerchant ? (
                        <>
                          <Key className="h-3 w-3 mr-1" />
                          Merchant Account
                        </>
                      ) : (
                        "Personal Account"
                      )}
                    </span>
                    {account.isMerchant && (
                      <button
                        onClick={() => {
                          setMerchantAccount(account);
                          setShowAccountDetails(false);
                          setShowApiKeyModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                      >
                        Manage APIs
                      </button>
                    )}
                  </div>
                </div>

                {account.isMerchant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      API Keys
                    </label>
                    <p className="text-sm text-gray-900">
                      {account.apiKeys?.length || 0} active API key{(account.apiKeys?.length || 0) !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Merchant API Keys Section */}
          {account.isMerchant && account.apiKeys && account.apiKeys.length > 0 && (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <h5 className="font-medium text-purple-900 mb-3">Active API Keys</h5>
              <div className="space-y-2">
                {account.apiKeys.slice(0, 3).map((apiKey) => (
                  <div key={apiKey.key} className="flex items-center justify-between p-2 bg-white rounded border border-purple-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apiKey.name}</p>
                      <p className="text-xs text-gray-500">
                        Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyCredentialToClipboard(apiKey.key, "API Key")}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy API Key"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {account.apiKeys.length > 3 && (
                  <p className="text-xs text-purple-700 text-center">
                    +{account.apiKeys.length - 3} more API keys
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setMerchantAccount(account);
                  setShowAccountDetails(false);
                  setShowApiKeyModal(true);
                }}
                className="w-full mt-3 py-2 px-4 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Manage All API Keys
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleToggleAccount(account.id)}
              disabled={account.status === "Pending"}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                account.status === "Pending"
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : account.status === "Verified"
                  ? "bg-yellow-600 text-white hover:bg-yellow-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {account.status === "Pending" ? (
                <>
                  <Clock className="h-4 w-4" />
                  <span>Pending</span>
                </>
              ) : account.status === "Verified" ? (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Unlink</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Verify</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleUnlinkAccount(account.id)}
              disabled={loading || account.status === "Unlinked"}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              <span>{loading ? "Unlinking..." : "Unlink"}</span>
            </button>

            <button
              onClick={() => {
                setDeleteAccountId(account.id);
                setShowAccountDetails(false);
                setShowDeleteModal(true);
              }}
              className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Handlers for the EditDisplayNameModal
  const handleCloseEditModal = () => {
    setShowEditDisplayName(false);
    setEditingAccount(null);
    setNewDisplayName("");
  };

  // Loading component for accounts
  const AccountsLoading = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-6 border border-gray-200 rounded-lg animate-pulse"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/3"></div>
            </div>
            <div className="w-24 h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar/>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Linked Accounts
            </h1>
            <p className="text-gray-600">
              View, manage, and add your bank accounts
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchLinkedAccounts}
              disabled={accountsLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${accountsLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowLinkModal(true)}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              <span>Link Account</span>
            </button>
          </div>
        </div>

        {/* Account Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Accounts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Verified Accounts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.filter((acc) => acc.status === "Verified").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Key className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Merchant Accounts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.filter((acc) => acc.isMerchant).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Accounts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {accounts.filter((acc) => acc.status === "Pending").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Linked Accounts
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="flex items-center space-x-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {showBalance ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span>{showBalance ? "Hide" : "Show"} Balances</span>
                </button>
              </div>
            </div>
          </div>

          {accountsLoading ? (
            <div className="p-6">
              <AccountsLoading />
            </div>
          ) : accountsError ? (
            <div className="p-6 text-center">
              <div className="text-red-500 mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Error loading accounts</p>
                <p className="text-sm">{accountsError}</p>
              </div>
              <button
                onClick={fetchLinkedAccounts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No accounts linked
              </h3>
              <p className="text-gray-500 mb-4">
                Link your first bank account to start using LinkSuraksha
              </p>
              <button
                onClick={() => setShowLinkModal(true)}
                disabled={loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                <span>Link Your First Account</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-center gap-4 lg:justify-between flex-wrap">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                          account.status === "Verified"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : account.status === "Pending"
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                            : "bg-gray-400"
                        }`}
                      >
                        <Landmark className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {getBankNameFromIFSC(account.ifscCode)}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              account.status
                            )}`}
                          >
                            {getStatusIcon(account.status)}
                            {account.status}
                          </span>
                          {account.isMerchant && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <Key className="h-3 w-3 mr-1" />
                              Merchant
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {account.displayName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.maskedAccountNumber} • Customer Id:{" "}
                          {account.customerId}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>
                            Linked:{" "}
                            {new Date(account.linkDate).toLocaleDateString()}
                          </span>
                          <span>
                            Updated:{" "}
                            {new Date(account.lastSync).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center m-2">
                      <div className="mb-3">
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className="text-xl font-bold text-gray-900">
                          {showBalance
                            ? `₹${account.balance.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                              })}`
                            : "••••••••"}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 flex-wrap gap-y-2 justify-center">
                        <button
                          onClick={() => {
                            setEditingAccount(account);
                            setNewDisplayName(account.displayName);
                            setShowEditDisplayName(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit Name</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAccount(account);
                            setShowAccountDetails(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => {
                            setMerchantAccount(account);
                            setShowMerchantModal(true);
                          }}
                          className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                            account.isMerchant 
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-200" 
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          <Key className="h-4 w-4" />
                          <span>{account.isMerchant ? "APIs" : "Enable Merchant"}</span>
                        </button>

                        <button
                          onClick={() => handleUnlinkAccount(account.id)}
                          disabled={loading || account.status === "Unlinked"}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Unlink</span>
                        </button>

                        <button
                          onClick={() => {
                            setDeleteAccountId(account.id);
                            setShowDeleteModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Service Account Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Receiver Service Account
                        </p>
                        <p className="text-sm font-mono text-gray-700">
                          {account.receiverServiceAccount}
                        </p>
                        {account.isMerchant && (
                          <p className="text-xs text-purple-600 mt-1">
                            API Keys: {account.apiKeys?.length || 0} active
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            copyToClipboard(account.receiverServiceAccount)
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <QrCode className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Share className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700">Processing your request...</span>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showLinkModal && <LinkAccountModal />}
      {showDeleteModal && <DeleteConfirmModal />}
      {showEditDisplayName && (
        <EditDisplayNameModal 
          editingAccount={editingAccount}
          newDisplayName={newDisplayName}
          setNewDisplayName={setNewDisplayName}
          loading={loading}
          onClose={handleCloseEditModal}
          onUpdate={handleUpdateDisplayName}
        />
      )}
      {showAccountDetails && selectedAccount && (
        <AccountDetailsModal account={selectedAccount} />
      )}
      
      {/* Merchant Management Modals */}
      {showMerchantModal && merchantAccount && (
        <MerchantManagementModal 
          account={merchantAccount}
          loading={merchantLoading}
          onClose={() => {
            setShowMerchantModal(false);
            setMerchantAccount(null);
          }}
          onToggleMerchant={() => toggleMerchantStatus(merchantAccount)}
          onManageApiKeys={() => {
            setShowMerchantModal(false);
            setShowApiKeyModal(true);
          }}
        />
      )}
      
      {showApiKeyModal && merchantAccount && (
        <ApiKeyManagementModal 
          account={merchantAccount}
          loading={merchantLoading}
          newApiKeyName={newApiKeyName}
          setNewApiKeyName={setNewApiKeyName}
          onClose={() => {
            setShowApiKeyModal(false);
            setNewApiKeyName("");
          }}
          onGenerateApiKey={generateApiKey}
          onRemoveApiKey={removeApiKey}
          onCopy={copyCredentialToClipboard}
        />
      )}
      
      {showNewApiKeyResult && newApiKeyData && (
        <NewApiKeyResultModal 
          apiKeyData={newApiKeyData}
          onClose={() => {
            setShowNewApiKeyResult(false);
            setNewApiKeyData(null);
          }}
          onCopy={copyCredentialToClipboard}
        />
      )}
    </div>
  );
};

export default ManageAccounts;
