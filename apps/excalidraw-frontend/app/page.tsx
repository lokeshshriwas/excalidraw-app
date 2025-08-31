import React from 'react';
import { FaGithub } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { FaShieldAlt } from "react-icons/fa";
import { BiSolidZap } from "react-icons/bi";
import { FaPalette } from "react-icons/fa";
import { LuUsers } from "react-icons/lu";
import Link from 'next/link';
import LearnMoreButton from './component/LearnMoreButton'; 

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FaPalette className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            DrawTogether
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link href="/login" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-all duration-300 transform hover:scale-105">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8 animate-fade-in">
            <BiSolidZap className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-sm text-gray-300">Free • Real-time • Collaborative</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
              Create Together,
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Draw Forever
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience the joy of collaborative creativity. Build, sketch, and imagine together with friends and family in real-time on our lightning-fast drawing canvas.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/login" className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25">
              <div className="flex items-center justify-center space-x-2">
                <IoIosMail className="w-5 h-5" />
                <span>Sign in with Google</span>
              </div>
            </Link>
            
            <Link href="/login" className="w-full sm:w-auto group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-center space-x-2">
                <FaGithub className="w-5 h-5" />
                <span>Sign in with GitHub</span>
              </div>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <FaShieldAlt className="w-4 h-4 text-green-400" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center space-x-2">
              <LuUsers className="w-4 h-4 text-blue-400" />
              <span>2 Free Rooms</span>
            </div>
            <div className="flex items-center space-x-2">
              <BiSolidZap className="w-4 h-4 text-yellow-400" />
              <span>Instant Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
              <LuUsers className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">Real-time Collaboration</h3>
            <p className="text-gray-400 leading-relaxed">
              Share your room link instantly. Watch as friends and family join your creative space and contribute in real-time with zero lag.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
              <FaPalette className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">Infinite Canvas</h3>
            <p className="text-gray-400 leading-relaxed">
              Unleash your creativity on a boundless drawing canvas. From quick sketches to detailed artwork - the only limit is your imagination.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500 transform hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
              <FaShieldAlt className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-white">Safe & Secure</h3>
            <p className="text-gray-400 leading-relaxed">
              Your creative sessions are protected. Invite-only rooms ensure your collaborative space remains private and secure.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="relative z-10 text-center pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Ready to start creating?
            </span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of creators building amazing things together. Get your 2 free rooms and start collaborating today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
              Start Drawing Now
            </Link>
            <LearnMoreButton />
          </div>
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-2000"></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-pink-400 rounded-full animate-ping delay-3000"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-500"></div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}