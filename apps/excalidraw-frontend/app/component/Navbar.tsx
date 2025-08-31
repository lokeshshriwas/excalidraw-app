"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../config";

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className = "" }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState({
    email : "",
    name : "",
    avatar : ""
  });

  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(!token){
      return;
    }
    const fetchProfile = async () => {
      const data = await axios.get(`${BASE_URL}/user/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      })
      setProfile(data.data)
   }
   fetchProfile();
   
  })

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    setIsMenuOpen(false);
  };

  const navigateTo = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const navigationItems = [
    { label: "Dashboard", path: "/dashboard", icon: "🏠" },
    { label: "My Rooms", path: "/myrooms", icon: "📁" },
    { label: "Create Room", path: "/joinRoom", icon: "➕" },
    { label: "Join Room", path: "/join", icon: "🔗" },
    { label: "Your Requests", path: "/requests", icon: "🙏" },
  ];

  const isCurrentPage = (path: string) => pathname === path;

  return (
    <>
      {/* Hamburger Button - Fixed Position */}
      <div className={`fixed top-4 left-4 z-50 ${className} ${pathname === "/canvas" && "top-10 left-10"}`}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110"
        >
          <div className="w-5 h-5 flex flex-col justify-center space-y-1">
            <div
              className={`w-5 h-0.5 bg-white transform transition-all duration-300 ${
                isMenuOpen ? "rotate-45 translate-y-1.5" : ""
              }`}
            />
            <div
              className={`w-5 h-0.5 bg-white transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : ""
              }`}
            />
            <div
              className={`w-5 h-0.5 bg-white transform transition-all duration-300 ${
                isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-[#1a1a1a] border-r border-gray-800 transform transition-transform duration-300 ease-in-out z-40 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <span className="text-white font-bold text-lg"></span>
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Canvas App</h2>
                <p className="text-gray-400 text-sm">Collaborative Drawing</p>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  isCurrentPage(item.path)
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {isCurrentPage(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-gray-800">
            <div className="mb-4 p-3 bg-[#0d0d0d] rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  {
                    profile.avatar ?
                    <img className="h-full w-full rounded-full" src={profile.avatar} /> : 
                    <img className="h-full w-full rounded-full" src={"./default_avatar.png"} />
                  }
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{profile?.name ? profile.name : "User"}</p>
                  <p className="text-gray-400 text-xs">Online</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;