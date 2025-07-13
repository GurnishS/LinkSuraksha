import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Star, Users, Zap, Globe } from 'lucide-react';
// import RegisterPage from './RegisterPage';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Bank-Level Security",
      description: "Your financial information stays completely private with end-to-end encryption"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Full Transaction Control",
      description: "Monitor, approve, or decline every transaction with real-time notifications"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Zero Data Exposure",
      description: "We never store or see your banking credentials - complete privacy guaranteed"
    }
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: "50K+", label: "Trusted Users" },
    { icon: <Zap className="w-6 h-6" />, value: "99.9%", label: "Uptime" },
    { icon: <Globe className="w-6 h-6" />, value: "24/7", label: "Support" },
    { icon: <Star className="w-6 h-6" />, value: "4.9", label: "Rating" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white overflow-hidden relative">
      {/* Premium background with moving particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-transparent to-indigo-800/30"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-transparent via-purple-800/10 to-slate-900/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-slate-900/80"></div>
        <div className="absolute top-1/4 left-0 w-full h-1/2 bg-gradient-to-r from-transparent via-purple-900/15 to-transparent"></div>
        
        {/* Moving particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${20 + Math.random() * 40}s linear infinite`,
              animationDelay: `${Math.random() * 20}s`
            }}
          />
        ))}
        
        {/* Larger accent particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`large-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${30 + Math.random() * 30}s linear infinite reverse`,
              animationDelay: `${Math.random() * 15}s`
            }}
          />
        ))}
        
        {/* Glowing orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute w-4 h-4 bg-purple-500/10 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `drift ${40 + Math.random() * 20}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(200px); opacity: 0; }
        }
        
        @keyframes drift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          25% { transform: translateX(100px) translateY(-50px); }
          50% { transform: translateX(-50px) translateY(-100px); }
          75% { transform: translateX(-100px) translateY(50px); }
        }
      `}</style>


      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              LinkSuraksha
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300">Features</a>
            <a href="#security" className="text-gray-300 hover:text-white transition-colors duration-300">Security</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors duration-300">Pricing</a>
            <button className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
           <Link to="/register">
              Register
            </Link>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
        <section className="relative z-10 px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm">Trusted by 50,000+ users worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Private, Controlled
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Transactions
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Experience the future of secure payments. LinkSuraksha ensures your bank information stays private while giving you complete control over every transaction.
          </p>
      
      
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/login" className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/30 flex items-center space-x-2">
              <span className="align-middle">Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform align-middle" />
            </Link>
            
            <button className="px-8 py-4 border-2 border-white/20 rounded-full text-lg font-semibold hover:bg-white/10 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm hover:shadow-lg">
              Watch Demo
            </button>
          </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-purple-400">LinkSuraksha</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built with privacy-first principles and enterprise-grade security
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl backdrop-blur-lg border transition-all duration-500 hover:scale-105 group cursor-pointer hover:shadow-2xl ${
                  activeFeature === index
                    ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-500/50 shadow-2xl shadow-purple-500/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-400/30'
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    activeFeature === index
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white'
                  }`}>
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Secure Your Transactions?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust LinkSuraksha for their private, secure financial transactions.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/30 flex items-center space-x-2">
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="text-sm text-gray-400">
                No credit card required • 14-day free trial
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">LinkSuraksha</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2025 LinkSuraksha. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;