"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../config";
import { v4 as uuidv4 } from "uuid";

const CreateRoomPage: React.FC = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [myrooms, setMyRooms] = useState([]);
  const [memberRooms, setMemberRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [roomsError, setRoomsError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [redirectingTo, setRedirectingTo] = useState<string>("");
  const [error, setError] = useState("");

  const findMyRoom = async (token: string) => {
    setLoadingRooms(true);
    setRoomsError("");
    
    try {
      const response = await axios.get(`${BASE_URL}/user/myRooms`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      setMyRooms(response.data.adminRooms);
      setMemberRooms(response.data.userRooms);
    } catch (error: any) {
      console.error("Error fetching my rooms:", error);
      if (error.response?.status === 404) {
        setRoomsError("No rooms found or endpoint not available");
      } else if (error.response?.status === 401) {
        setRoomsError("Authentication failed");
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
  }, [router]);

  const handleRoomNavigation = async (roomSlug: string) => {
    setRedirecting(true);
    setRedirectingTo(roomSlug);
    
    try {
      // Small delay to ensure the loader is visible
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push(`/canvas/${roomSlug}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setRedirecting(false);
      setRedirectingTo("");
      setError("Failed to navigate to room");
    }
  };

  const handleJoinRoom = (roomSlug: string) => {
    router.push(`/canvas/${roomSlug}`);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-start justify-center px-4 py-8">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 pointer-events-none" />

       {/* Redirection Loader Overlay */}
        {redirecting && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-center max-w-sm w-full mx-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-white font-medium mb-2">Opening Room</h3>
              <p className="text-gray-400 text-sm">Redirecting to {redirectingTo}...</p>
            </div>
          </div>
        )}

      {/* Main container */}
      <div className="w-full max-w-2xl relative z-10">
        {/* Header section */}
        <div className="text-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            {/* Room/door icon */}
            <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 21V5a2 2 0 012-2h10a2 2 0 012 2v16m0 0h4m-4 0H7m5-10h.01"
                />
            </svg>
            </div>
          <h1 className="text-2xl font-semibold text-white mb-2">
            Your Rooms
          </h1>
          <p className="text-gray-400 text-sm">
            Start building
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
                        onClick={(e) =>{
                            e.stopPropagation();
                            handleRoomNavigation(room.slug);
                        }}
                        disabled={redirecting}
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

        {/* Joined Rooms Section */}
        {(loadingRooms || memberRooms.length > 0 || roomsError) && (
          <div className="mb-8">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Joined Rooms
              </h2>

              {!loadingRooms && memberRooms.length > 0 && (
                <div className="space-y-2">
                  {memberRooms.map((room: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-[#0d0d0d] border border-gray-700 rounded-lg hover:border-gray-600 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-white">{room.slug}</h3>
                          <p className="text-xs text-gray-500">
                            Joined {room.createdAt ? new Date(room.createdAt).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                           e.stopPropagation();
                          handleRoomNavigation(room.slug);
                        }}
                        disabled={redirecting}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!loadingRooms && memberRooms.length === 0 && !roomsError && (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-400 text-sm">No joined rooms</p>
                  <p className="text-gray-500 text-xs mt-1">Join a room to see it here</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoomPage;