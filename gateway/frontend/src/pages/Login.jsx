import { useState } from "react";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  Zap,
  Users,
  Globe,
  QrCode,
} from "lucide-react";
import config from "../constants.js";

export default function Login({ onSwitchView }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();

  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formData.email.trim()) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      err.email = "Enter a valid email";
    if (!formData.password) err.password = "Password is required";
    else if (formData.password.length < 8)
      err.password = "Password must be at least 8 characters";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const res = await fetch(`${config.GATEWAY_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const body = await res.json();

      if (res.ok) {
        Toastify({
          text: "Logged in successfully!",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        sessionStorage.setItem("Name", body.user.name);
        sessionStorage.setItem("Token", body.user.token);
        sessionStorage.setItem("Email", body.user.email);
        navigate(redirect);
      } else throw new Error(body.message || "Login failed");

      console.log("Response:", body);
    } catch (err) {
      Toastify({
        text: err.message,
        backgroundColor: "#DC2626",
        gravity: "top",
        position: "right",
        duration: 4000,
      }).showToast();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.05) 0%, transparent 70%)`,
          }}
        ></div>

        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">LinkSuraksha</h1>
              <p className="text-blue-100 text-sm">Payment Gateway</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Secure Financial
              <br />
              <span className="text-blue-200">Gateway Solutions</span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Connect your bank accounts securely and transfer money with
              complete privacy protection.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Service Account Privacy
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Your real account details remain private with our service
                  account system
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Instant Transfers
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Send money instantly through our secure gateway infrastructure
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <QrCode className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">QR Code Support</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Share your receiver service account via secure QR codes
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Multi-Bank Support
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Link multiple bank accounts from different banks in one place
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-2 mb-8">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              LinkSuraksha
            </span>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">
              Sign in to access your payment gateway dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-200">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.password
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 cursor-pointer" />
                    ) : (
                      <Eye className="h-5 w-5 cursor-pointer" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign In Securely</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </button>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Secure Login
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your credentials are encrypted and protected with
                      bank-grade security.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              New to LinkSuraksha?{" "}
              <button
                onClick={() => {
                  if (onSwitchView) {
                    onSwitchView("register");
                  } else {
                    navigate("/register");
                  }
                }}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Create an account
              </button>
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-4">
              Trusted by:
            </p>
            <div className="flex justify-center items-center space-x-6 opacity-60">
              <div className="text-xs font-semibold text-gray-400">Canara Bank</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
