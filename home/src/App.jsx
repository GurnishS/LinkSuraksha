import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Shield,
  Users,
  Globe,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Linkedin,
} from "lucide-react";
import "./App.css";
import config from "./constants";

const App = () => {
  const [apiStatuses, setApiStatuses] = useState({
    gateway: "checking",
    bank: "checking",
  });
  const [isLoading, setIsLoading] = useState(true);

  // API endpoints to wake up
  const MODE = import.meta.env.VITE_MODE || "development"; // Default to development if not set
  console.log("Current Mode:", MODE);

  const apiEndpoints = useMemo(
    () => ({
      gateway: config.GATEWAY_BACKEND_URL + "/health",
      bank: config.BANK_BACKEND_URL + "/health",
    }),
    []
  );

  // Team members data (simplified for grid)
  const teamMembers = [
    {
      id: 1,
      name: "Gurnish Singh",
      avatar: "gurnish.png",
      linkedin: "https://www.linkedin.com/in/gurnish-singh-sangha-16b19428b",
    },
    {
      id: 2,
      name: "Amandeep Mandal",
      avatar: "amandeep.jpg",
      linkedin: "https://www.linkedin.com/in/amandeep-mandal-66aab3289/",
    },
    {
      id: 3,
      name: "Harsh Raj",
      avatar: "harshraj.jpg",
      linkedin: "https://www.linkedin.com/in/harsh-raj-58921728b/",
    },
    {
      id: 4,
      name: "Vinay Kumar",
      avatar: "vinay.png",
      linkedin: "https://www.linkedin.com/in/vinay-kumar-382679293/",
    },
    {
      id: 5,
      name: "Raj Singhal",
      avatar: "raj.jpg",
      linkedin: "https://www.linkedin.com/in/raj-singhal-60428a26a/",
    },
  ];

  // Projects data
  const projects = [
    {
      id: 1,
      name: "LinkSuraksha Gateway",
      description:
        "Our main secure payment gateway with advanced anonymization features ensuring complete privacy between sender and receiver",
      status: "Live",
      url: config.GATEWAY_URL,
      icon: "🔐",
      tech: ["React", "Node.js", "MongoDB", "JWT", "Encryption", "SSE"],
      features: [
        "Anonymous Transactions",
        "Real-time Processing",
        "Multi-layer Security",
        "SSE notifications",
      ],
      isMain: true,
    },
    {
      id: 2,
      name: "SurakshaBank Portal",
      description:
        "Demo banking system showcasing secure account management and transaction monitoring capabilities of our gateway",
      status: "Live",
      url: config.BANK_URL,
      icon: "🏦",
      tech: ["React", "Express", "MongoDB", "Cryptography", "JWT"],
      features: [
        "Account Management",
        "Transaction History",
        "Security Dashboard",
        "Payment System",
        "Gateway Integration",
      ],
      isMain: false,
    },
    {
      id: 3,
      name: "SurakshaKart E-commerce",
      description:
        "Demo e-commerce platform demonstrating integrated secure payments and anonymous checkout process",
      status: "Live",
      url: config.MERCHANT_URL,
      icon: "🛒",
      tech: ["React", "Node.js", "MongoDB", "SSE"],
      features: [
        "Product Catalog",
        "Secure Checkout",
        "Auto Verification",
        "Anonymous Payments",
        "QR Code Integration",
      ],
      isMain: false,
    },
  ];

  // Wake up APIs
  const wakeUpAPIs = useCallback(async () => {
    setIsLoading(true);
    const promises = Object.entries(apiEndpoints).map(
      async ([service, url]) => {
        try {
          setApiStatuses((prev) => ({ ...prev, [service]: "checking" }));
          const response = await fetch(url, {
            method: "GET",
            timeout: 10000,
          });

          if (response.ok) {
            setApiStatuses((prev) => ({ ...prev, [service]: "online" }));
          } else {
            setApiStatuses((prev) => ({ ...prev, [service]: "offline" }));
          }
        } catch (error) {
          console.error(`Error waking up ${service}:`, error);
          setApiStatuses((prev) => ({ ...prev, [service]: "offline" }));
        }
      }
    );

    await Promise.all(promises);
    setIsLoading(false);
  }, [apiEndpoints]);

  useEffect(() => {
    wakeUpAPIs();
    const interval = setInterval(wakeUpAPIs, 300000);
    return () => clearInterval(interval);
  }, [wakeUpAPIs]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return <CheckCircle className="w-4 h-4" />;
      case "offline":
        return <AlertCircle className="w-4 h-4" />;
      case "checking":
        return <Clock className="w-4 h-4 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "online":
        return "bg-green-100 border-green-300 text-green-700";
      case "offline":
        return "bg-red-100 border-red-300 text-red-700";
      case "checking":
        return "bg-yellow-100 border-yellow-300 text-yellow-700";
      default:
        return "bg-gray-100 border-gray-300 text-gray-700";
    }
  };

  return (
    <div className="App">
      <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
        {/* Background gradients */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-50/95 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center flex-wrap gap-x-2 gap-y-4">
            <div className="flex items-center gap-3 justify-center w-full md:w-auto">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  LinkSuraksha
                </h1>
                <p className="text-xs text-slate-500 -mt-1">
                  Secure Payment Ecosystem
                </p>
              </div>
            </div>

            <div className="flex gap-6 flex-wrap justify-center w-full md:w-auto">
              {Object.entries(apiStatuses).map(([service, status]) => (
                <div
                  key={service}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white border transition-all duration-300 shadow-sm ${getStatusClass(
                    status
                  )}`}
                >
                  {getStatusIcon(status)}
                  <span className="text-sm font-medium capitalize">
                    {service}
                  </span>
                  <span className="text-xs font-semibold capitalize">
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-8 lg:py-12 px-4 md:px-8 text-center">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-200 rounded-full text-sm font-semibold text-blue-600">
                🏆Canara Suraksha Hackathon Project 2025
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-900 via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight tracking-tight">
              LinkSuraksha
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Revolutionary secure payment gateway ensuring complete
              <span className="text-blue-600 font-semibold"> anonymity </span>
              between sender and receiver while maintaining
              <span className="text-purple-600 font-semibold">
                {" "}
                transaction integrity
              </span>
            </p>

            <p className="text-base text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed p-6 bg-blue-50 border border-blue-100 rounded-2xl">
              <strong>LinkSuraksha Gateway</strong> is our main project - a
              cutting-edge payment solution. The other two platforms
              (SurakshaBank & SurakshaKart) are demo applications showcasing the
              gateway's powerful features and integration capabilities.
            </p>

            <button
              className="inline-flex items-center gap-3 px-4 md:px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={wakeUpAPIs}
              disabled={isLoading}
            >
              <span className="text-xl">🚀</span>
              {isLoading ? "Waking Services..." : "Wake Up All Services"}
            </button>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-8 lg:py-12  px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Our Ecosystem
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Main gateway and demo applications showcasing integration
                capabilities
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`bg-white border border-slate-200 rounded-3xl p-8 backdrop-blur-xl transition-all duration-500 overflow-hidden relative md:w-[calc(50%-1rem)] lg:w-[calc(33.33%-2rem)] shadow-sm hover:-translate-y-3 hover:shadow-2xl hover:border-blue-300 ${
                    project.isMain ? "ring-2 ring-blue-500/20" : ""
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 transition-transform duration-500 group-hover:scale-x-100"></div>

                  <div className="flex justify-between items-center mb-6">
                    <div className="text-5xl filter grayscale-20 transition-all duration-300 hover:scale-110 hover:grayscale-0">
                      {project.icon}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {project.status}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {project.name}
                    {project.isMain && (
                      <span className="ml-2 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                        Main Project
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
                      Key Features:
                    </h4>
                    <ul className="space-y-2">
                      {project.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-600"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-100 border border-blue-200 rounded-full text-xs font-semibold text-blue-600 transition-all duration-200 hover:bg-blue-200 hover:-translate-y-1"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/30 relative overflow-hidden"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Live Site
                      <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-8 lg:py-12  px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                The innovators behind LinkSuraksha's secure payment revolution
              </p>
            </div>

            <div className="flex justify-center w-full">
              <div className="flex flex-wrap gap-8 max-w-7xl w-full justify-center">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="relative transition-all duration-300 w-full sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(30%-1rem)]"
                  >
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-300 relative w-full">
                      <div className="relative w-full aspect-square overflow-hidden">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-8 opacity-0 transition-all duration-300 hover:opacity-100">
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white/95 text-blue-600 font-semibold text-sm rounded-xl transition-all duration-300 hover:bg-blue-600 hover:text-white hover:-translate-y-1 backdrop-blur-sm shadow-lg"
                          >
                            <Linkedin className="w-4 h-4" />
                            Connect
                          </a>
                        </div>
                      </div>

                      <div className="p-6 text-center bg-white">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
                          {member.name}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium">
                          Team Member
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Technology Stack */}
        <section className="py-8 lg:py-12 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                Technology Stack
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Cutting-edge technologies powering our secure platform
              </p>
            </div>

            <div className="flex justify-center flex-wrap gap-6">
              {[
                {
                  name: "React",
                  icon: "⚛️",
                  color: "#61DAFB",
                  description: "Frontend Framework",
                },
                {
                  name: "Node.js",
                  icon: "🟢",
                  color: "#339933",
                  description: "Backend Runtime",
                },
                {
                  name: "MongoDB",
                  icon: "🍃",
                  color: "#47A248",
                  description: "Database",
                },
                {
                  name: "Express",
                  icon: "🚂",
                  color: "#000000",
                  description: "Web Framework",
                },
                {
                  name: "JWT",
                  icon: "🔐",
                  color: "#000000",
                  description: "Authentication",
                },
                {
                  name: "Tailwind",
                  icon: "🎨",
                  color: "#06B6D4",
                  description: "CSS Framework",
                },
                {
                  name: "SSE",
                  icon: "📡",
                  color: "#06B6D4",
                  description: "Real-time Updates",
                },
                {
                  name: "Cryptography",
                  icon: "🔒",
                  color: "#06B6D4",
                  description: "Security",
                },
              ].map((tech, index) => (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-2xl p-6 text-center backdrop-blur-xl transition-all duration-300 w-full sm:w-[calc(50%_-_1.5rem)] md:w-[calc(33.333%_-_1.5rem)] lg:w-[calc(25%_-_1.5rem)] shadow-sm hover:-translate-y-2 hover:border-blue-300 hover:shadow-xl"
                >
                  <div
                    className="text-5xl mb-4 transition-all duration-300 hover:scale-110"
                    style={{ color: tech.color }}
                  >
                    {tech.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {tech.name}
                  </h3>
                  <p className="text-sm text-slate-600">{tech.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-br from-slate-800 to-slate-900 border-t border-slate-700 backdrop-blur-xl py-12  px-4 md:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  LinkSuraksha
                </h3>
                <p className="text-sm text-slate-400">
                  Secure. Anonymous. Reliable.
                </p>
              </div>
            </div>

            <p className="text-base text-slate-400 mb-8">
              Built with ❤️ for the Canara Suraksha Hackathon 2025 | Making
              payments secure and anonymous
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap text-sm text-slate-400">
              <span>© 2025 LinkSuraksha Team</span>
              <span className="hidden sm:inline">•</span>
              <span>All Rights Reserved</span>
              <span className="hidden sm:inline">•</span>
              <span>Hackathon Project</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
