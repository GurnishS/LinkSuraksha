import { useState } from "react";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { backendUri } from "../constants";
import { useNavigate } from "react-router-dom";
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
  User,
  MapPin,
  CheckCircle,
  Smartphone,
} from "lucide-react";

export default function Register({ onSwitchView }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.address.trim()) err.address = "Address is required";
    if (!formData.email.trim()) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      err.email = "Enter a valid email";
    if (!formData.password || formData.password.length < 8)
      err.password = "Password must be at least 8 characters";
    if (!formData.terms) err.terms = "You must agree to the Terms";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await fetch(backendUri + "auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        Toastify({
          text: "Registration successful! You can now log in to your account.",
          backgroundColor: "#4BB543",
          gravity: "top",
          position: "right",
          duration: 3000,
        }).showToast();

        // Reset form
        setFormData({
          name: "",
          email: "",
          address: "",
          password: "",
          terms: false,
        });

        navigate("/login");
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (err) {
      Toastify({
        text: err.message || "Registration failed",
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
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden items-start">
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

        <div className="relative z-10 flex flex-col justify-start px-12 py-16 text-white mt-8">
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
            <img
              src="/phone_banking.png"
              alt="Secure Banking"
              className="mb-4 h-80"
            />
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Join the Future of
              <br />
              <span className="text-blue-200">Secure Banking</span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Create your account and experience seamless, secure financial
              transactions with complete privacy.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Bank-Grade Security
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Your data is protected with 256-bit SSL encryption and
                  advanced security protocols
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Instant Setup</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Get started in minutes and link your first bank account
                  securely
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-lg flex items-center justify-center border border-white/20 flex-shrink-0">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Mobile Ready</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Access your account anywhere with our responsive design and
                  mobile app
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-8">
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
              Create Your Account
            </h2>
            <p className="text-gray-600">
              Join thousands of users securing their financial future
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-gray-200">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

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

              {/* Address Field */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    autoComplete="address-line1"
                    placeholder="123 Main St, City, Country"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.address
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300 bg-white hover:border-gray-400"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  />
                </div>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
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
                    autoComplete="new-password"
                    placeholder="Create a strong password"
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
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Terms & Privacy */}
              <div className="flex items-start space-x-3">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  disabled={loading}
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-700 leading-relaxed"
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || formData.terms === false}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                  loading || formData.terms === false
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Secure Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </button>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900">
                      Account Benefits
                    </p>
                    <ul className="text-xs text-green-700 mt-1 space-y-1">
                      <li>• Instant bank account linking</li>
                      <li>• QR code payment sharing</li>
                      <li>• Complete transaction privacy</li>
                      <li>• 24/7 customer support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => {
                  if (onSwitchView) {
                    onSwitchView("login");
                  } else {
                    navigate("/login");
                  }
                }}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Sign in here
              </button>
            </p>
          </div>

          {/* Security Badges */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 mb-4">
              Your data is protected by
            </p>
            <div className="flex justify-center items-center space-x-4 opacity-60">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-semibold text-gray-400">SSL</span>
              </div>
              <div className="text-xs font-semibold text-gray-400">256-bit</div>
              <div className="text-xs font-semibold text-gray-400">
                ENCRYPTION
              </div>
              <div className="text-xs font-semibold text-gray-400">GDPR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
