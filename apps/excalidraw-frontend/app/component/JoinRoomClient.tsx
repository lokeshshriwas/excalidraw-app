// app/join/JoinRoomClient.tsx (Client Component)
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../config";

const JoinRoomClient: React.FC = () => {
  const router = useRouter();
  const [roomLink, setRoomLink] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  // Function to extract slug from room link
  const extractSlugFromLink = (link: string): string => {
    try {
      // Handle different URL formats:
      // https://yourapp.com/canvas/room-123 -> room-123
      // https://yourapp.com/room/room-123 -> room-123
      // room-123 -> room-123
      
      const trimmedLink = link.trim();
      
      // If it's already just a slug, return it
      if (trimmedLink.startsWith('room-') && !trimmedLink.includes('/')) {
        return trimmedLink;
      }
      
      // If it's a full URL, extract the last part
      const urlParts = trimmedLink.split('/');
      const lastPart = urlParts[urlParts.length - 1];
      
      // Validate that it looks like a room slug
      if (lastPart && lastPart.startsWith('room-')) {
        return lastPart;
      }
      
      throw new Error('Invalid room link format');
    } catch (error) {
      throw new Error('Unable to extract room ID from the provided link');
    }
  };

  const handleJoinRequest = async () => {
    if (!token || !roomLink.trim()) {
      setError("Please enter a room link");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Extract slug from the provided link
      const roomSlug = extractSlugFromLink(roomLink);
      const msg = message;
      
      // Send join request to backend
      const response = await axios.post(
        `${BASE_URL}/req/requestJoin`, // Adjust endpoint as needed
        { roomSlug: roomSlug, message : msg },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      setSuccess(
        response.data.message || 
        "Join request sent successfully! The room admin will review your request."
      );
      setRoomLink(""); // Clear the input
      setMessage(""); // Clear the message input
    } catch (error: any) {
      console.error("Join request failed:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("token");
        router.push("/login");
      } else if (error.response?.status === 404) {
        setError("Room not found. Please check the link and try again.");
      } else if (error.response?.status === 409) {
        setError("You've already requested to join this room or are already a member.");
      } else {
        setError(
          error.response?.data?.message ||
          error.message ||
          "Failed to send join request. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (roomLink.trim() === "") return; 
    if (e.key === "Enter") {
      handleJoinRequest();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRoomLink(text);
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-start justify-center px-4 py-8">
      {/* Background gradient - fixed to cover full screen */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 pointer-events-none" />
      

      {/* Main container - with proper z-index */}
      <div className="w-full max-w-md relative z-10">
        {/* Header section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Join Room
          </h1>
          <p className="text-gray-400 text-sm">
            Enter a room link to request access
          </p>
        </div>

        {/* Join room form */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Room link input */}
            <div>
              <label htmlFor="roomLink" className="block text-sm font-medium text-gray-300 mb-2">
                Room Link
              </label>
              <div className="relative">
                <input
                  id="roomLink"
                  type="text"
                  value={roomLink}
                  onChange={(e) => setRoomLink(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste room link here..."
                  className="w-full px-4 py-3 pr-12 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  title="Paste from clipboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
              </div>

              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2 mt-5">
                Message For Admin (Optional)
              </label>
              <div className="relative">
                <input
                  id="message"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 pr-12 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-200"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: Full URL or room ID (e.g., room-abc123...)
              </p>
            </div>

            {/* Link examples */}
            <div className="bg-[#0d0d0d] border border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-purple-400 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">
                    Link Examples
                  </h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• https://app.com/canvas/room-123...</p>
                    <p>• https://app.com/room/room-456...</p>
                    <p>• room-789...</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Join request button */}
            <button
              onClick={handleJoinRequest}
              disabled={isLoading || !roomLink.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Request...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Join Request
                </div>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1a1a] text-gray-400">Or</span>
              </div>
            </div>
          </div>

          {/* Create room option */}
          <div className="text-center">
            <button 
              onClick={() => router.push('/joinRoom')}
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-200"
            >
              Create your own room
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button 
            onClick={() => setRoomLink("")}
            disabled={!roomLink}
            className="bg-[#1a1a1a] border border-gray-700 hover:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 hover:text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            Clear
          </button>
          <button 
            onClick={() => router.back()}
            className="bg-[#1a1a1a] border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            Go Back
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          Room admins will be notified of your join request and can approve or deny access.
        </div>
      </div>
    </div>
  );
};

export default JoinRoomClient;