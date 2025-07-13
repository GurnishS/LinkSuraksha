import { useLocation, useNavigate } from "react-router-dom";
import React, { useEffect } from "react";
import { avatarUri, backendUri } from "../constants.js";
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
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const Navbar = () => {
  const user = {
    name: sessionStorage.getItem("Name"),
    email: sessionStorage.getItem("Email"),
    token: sessionStorage.getItem("Token"),
    avatar: avatarUri,
  };

  const location = useLocation();
  const navigate = useNavigate();

  // const [notifications, setNotifications] = useState([]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications.");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  };

  useEffect(() => {
    requestNotificationPermission();
    const token = sessionStorage.getItem("Token");
    if (!token) return;
    console.log("Connecting to SSE with token:", token);
    const eventSource = new EventSource(
      `${backendUri}sse/notifications?token=${token}`,
      {
        withCredentials: false, // SSE spec doesn’t support custom headers
      }
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // setNotifications((prev) => [data.message, ...prev]);
      Toastify({
        text: data.message.message,
        className: "info",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
      if (Notification.permission === "granted") {
        new Notification("💸 Bank Alert", {
          body: data.message.message,
          icon: "/phone_banking.png", // optional favicon path
        });
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {location.pathname !== "/dashboard" && (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Shield className="hidden sm:block h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  LinkSuraksha
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <div className="hidden sm:flex items-center space-x-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  sessionStorage.clear();
                  navigate("/login");
                }}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
