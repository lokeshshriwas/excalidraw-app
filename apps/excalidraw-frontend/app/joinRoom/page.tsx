"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../config";
import { v4 as uuidv4 } from "uuid";

const CreateRoomPage: React.FC = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const generateRoomId = () => {
    return `room-${uuidv4()}`;
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }
    setRoomId(generateRoomId());
  }, [router]);

  const onCreateBtn = async () => {
    if (!token || !roomId.trim()) {
      setError("Room ID is missing");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Check how many rooms the user already has
      const { data: adminRooms } = await axios.get(`${BASE_URL}/user/myRooms`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });

      if (adminRooms?.length >= 2) {
        setError("You can create only 2 rooms as admin. Join others as a participant.");
        setIsLoading(false);
        return; // ⛔ STOP everything here
      }

      // ✅ Proceed with room creation
      await axios.post(
        `${BASE_URL}/room/createRoom`,
        { name: roomId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );

      // ✅ Only redirect after successful creation
      router.push(`/canvas/${roomId}`);
    } catch (error: any) {
      console.error("Room creation failed:", error);
      if (error.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError(
          error.response?.data?.message ||
            "Failed to create room. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-start justify-center px-4 py-8">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 pointer-events-none" />

      {/* Main container */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Header section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Create Room
          </h1>
          <p className="text-gray-400 text-sm">
            Start a new collaborative session
          </p>
        </div>

        {/* Create room form */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
                Room ID
              </label>
              <input
                id="roomName"
                type="text"
                value={roomId}
                readOnly
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Unique auto-generated</p>
            </div>

            <div className="bg-[#0d0d0d] border border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-blue-400 mt-0.5">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-1">Room Details</h3>
                  <p className="text-xs text-gray-500">
                    Your room ID is generated automatically and guaranteed to be unique.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onCreateBtn}
              disabled={isLoading || !roomId.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Room...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Room
                </div>
              )}
            </button>
          </div>

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

          <div className="text-center">
            <button
              onClick={() => router.push("/join")}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Join Room via Link
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setRoomId(generateRoomId())}
            className="bg-[#1a1a1a] border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            Generate New ID
          </button>
          <button
            onClick={() => router.back()}
            className="bg-[#1a1a1a] border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white py-2 px-4 rounded-lg transition-all duration-200 text-sm"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          Room IDs are unique and automatically generated for secure collaboration.
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
