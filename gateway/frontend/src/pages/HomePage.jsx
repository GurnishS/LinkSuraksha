import React, { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  Globe,
  Menu,
  X,
  Home,
} from "lucide-react";
import { HeroScrollDemo } from "./container";
import { Cover } from "../components/ui/cover";
import { ContainerTextFlip } from "../components/ui/container-text-flip";
import { PointerHighlight } from "../components/ui/pointer-highlight";
import { HoverBorderGradient } from "../components/ui/hover-border-gradient";

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description:
        "End-to-end encryption with military-grade security protocols protecting every transaction.",
    },
    {
      icon: EyeOff,
      title: "Complete Privacy",
      description:
        "Your real bank details remain hidden. Create secure virtual identities for all transactions.",
    },
    {
      icon: Zap,
      title: "Instant Transactions",
      description:
        "Lightning-fast processing with real-time transaction confirmations and notifications.",
    },
    {
      icon: Globe,
      title: "Universal Compatibility",
      description:
        "Works seamlessly with all major banks, UPI platforms, and payment gateways.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                LinkSuraksha
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-900 hover:text-blue-600 transition-colors font-medium text-base"
              >
                Features
              </a>
              <a
                href="#security"
                className="text-gray-900 hover:text-blue-600 transition-colors font-medium text-base"
              >
                Security
              </a>
              <a href="/register">
                <button className="bg-gradient-to-r text-white px-6 py-2   ">
                  <HoverBorderGradient>Get Started</HoverBorderGradient>
                </button>
              </a>
            </div>

            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-100">
            <div className="px-4 py-2 space-y-2">
              <a
                href="#features"
                className="block py-2 text-gray-700 hover:text-blue-600"
              >
                Features
              </a>
              <a
                href="#security"
                className="block py-2 text-gray-700 hover:text-blue-600"
              >
                Security
              </a>
              <button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg mt-2">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-blue-500 mb-6  ">
              Shielded Data
              <span className="  text-blue-600  block   bg-clip-text   bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white color-blue-600">
                <Cover>Transactions</Cover>
              </span>
              <span className="block text-4xl md:text-5xl mt-2">
                Without Exposure
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-1 max-w-3xl mx-auto leading-relaxed">
              Protect your real bank and UPI information while enjoying seamless
              digital transactions. LinkSuraksha creates a secure virtual layer
              between you and the digital world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <a href="/register">
                <button className="bg-gradient-to-r text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all  flex items-center gap-2">
                  <ContainerTextFlip
                    words={[
                      "Register your account",
                      "Login securely",
                      "Make payments safely",
                    ]}
                  />
                </button>
              </a>
            </div>

            {/* Trust Indicators */}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-200 rounded-full opacity-20 animate-bounce"></div>
      </section>

      <HeroScrollDemo />
      {/* scroll component */}

      {/* Stats Section */}

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 ">
              <div className="flex justify-center  ">
                <PointerHighlight> Why Choose LinkSuraksha?</PointerHighlight>
              </div>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced security meets seamless user experience. Protect your
              financial privacy without compromising convenience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`
        bg-white rounded-2xl p-8 shadow-lg 
        hover:shadow-2xl hover:shadow-blue-500/20
        transition-all duration-300 transform 
        hover:scale-105 hover:-translate-y-2
        cursor-pointer border border-transparent
        hover:border-blue-500/30
        group
        ${
          hoveredFeature === index
            ? "ring-2 ring-blue-500 shadow-blue-500/30"
            : ""
        }
      `}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-8 h-8 text-white group-hover:rotate-6 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section
        id="security"
        className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Your Privacy is Our
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Top Priority
                </span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Virtual Transaction Layer
                    </h3>
                    <p className="text-gray-600">
                      Creates a secure buffer between your real banking
                      information and online transactions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Temporary, Encrypted Service Accounts
                    </h3>
                    <p className="text-gray-600">
                      Real bank details are never shared
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {" "}
                      User-Controlled Payment Policies
                    </h3>
                    <p className="text-gray-600">
                      Set limits, merchants, usage count, and duration.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                        strokeWidth="2"
                      />
                      <circle cx="12" cy="16" r="1" fill="currentColor" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Security Dashboard
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <span className="text-green-800">Real Bank Details</span>
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-semibold">
                        Hidden
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <span className="text-blue-800">Virtual Layer</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-600 font-semibold">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cyan-50 rounded-lg">
                    <span className="text-cyan-800">Privacy Level </span>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-cyan-600" />
                      <span className="text-cyan-600 font-semibold">
                        High (Level 3){" "}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Secure Your
            <span className="block">Digital Transactions?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            LinkSuraksha is a new way to pay securely without exposing your bank
            details. We're launching soon sign up to be the first to know.
          </p>

          <div className="flex flex-col items-center">
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/30">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/30 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-white">
                    100% Secure
                  </div>
                  <div className="text-blue-100">Bank-grade protection</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white mb-2">0</div>
                  <div className="text-blue-100 text-sm">Data Breaches</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">
                    99.9%
                  </div>
                  <div className="text-blue-100 text-sm">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-blue-100 text-sm">Monitoring</div>
                </div>
              </div>
            </div>

            <button className="bg-white text-blue-600 px-12 py-5 rounded-2xl text-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3 group">
              <a href="/register">
                <span>Experience LinkSuraksha</span>
              </a>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                <ArrowRight className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
