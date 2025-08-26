"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../config";
import { v4 as uuidv4 } from "uuid"; // import uuid for unique IDs

const CreateRoomPage: React.FC = () => {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [myrooms, setMyRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState("");

  // generate unique roomId
  const generateRoomId = () => {
    return `room-${uuidv4()}`;
  };

  const findMyRoom = async (token: string) => {
    setLoadingRooms(true);
    setRoomsError("");
    
    try {
      const response = await axios.get(`${BASE_URL}/room/admin/myRooms`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      console.log("My rooms response:", response);
      setMyRooms(response.data.data || response.data || []);
    } catch (error: any) {
      console.error("Error fetching my rooms:", error);
      if (error.response?.status === 404) {
        setRoomsError("No rooms found or endpoint not available");
      } else if (error.response?.status === 401) {
        setRoomsError("Authentication failed");
        // Redirect to login if unauthorized
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setRoomsError("Failed to load your rooms");
      }
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      findMyRoom(storedToken);
    }

    // generate a unique roomId at start
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

  const handleJoinRoom = (roomSlug: string) => {
    router.push(`/canvas/${roomSlug}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-start justify-center px-4 py-8">
      {/* Background gradient - fixed to cover full screen */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 pointer-events-none" />

      {/* Header with logout - fixed positioning */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
        >
          Sign out
        </button>
      </div>

      {/* Main container - with proper z-index */}
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

        {/* My Rooms Section */}
        {(loadingRooms || myrooms.length > 0 || roomsError) && (
          <div className="mb-8">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Your Rooms
              </h2>

              {loadingRooms && (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2 text-gray-400">Loading your rooms...</span>
                </div>
              )}

              {roomsError && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">{roomsError}</p>
                </div>
              )}

              {!loadingRooms && myrooms.length > 0 && (
                <div className="space-y-2">
                  {myrooms.map((room: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#0d0d0d] border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a1 1 0 001 1h8a1 1 0 001-1V8M9 8h6" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white">{room.slug}</h3>
                          <p className="text-xs text-gray-500">
                            Created {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoinRoom(room.slug)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!loadingRooms && myrooms.length === 0 && !roomsError && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-400 text-sm">No rooms found</p>
                  <p className="text-gray-500 text-xs mt-1">Create your first room below</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create room form */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Room name display (not editable) */}
            <div>
              <label
                htmlFor="roomName"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
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

            {/* Room info */}
            <div className="bg-[#0d0d0d] border border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 text-blue-400 mt-0.5">
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
                    Room Details
                  </h3>
                  <p className="text-xs text-gray-500">
                    Your room ID is generated automatically and guaranteed to be
                    unique.
                  </p>
                </div>
              </div>
            </div>

            {/* Create button */}
            <button
              onClick={onCreateBtn}
              disabled={isLoading || !roomId.trim()}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                    3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Room...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Create Room
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

          {/* Join existing room option */}
          <div className="text-center">
            <button
              onClick={() => router.push("/join")}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
            >
              Join Room via Link
            </button>
          </div>
        </div>

        {/* Quick actions */}
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

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          Room IDs are unique and automatically generated for secure
          collaboration.
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;