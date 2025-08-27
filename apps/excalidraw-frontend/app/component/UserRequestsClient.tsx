"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../config";

interface JoinRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
  createdAt: string;
  updatedAt: string;
  room: {
    id: number;
    slug: string;
    createdAt: string;
    admin: {
      name: string;
    };
  };
}

interface MyRoom {
  id: number;
  slug: string;
  createdAt: string;
}

const UserRequestsClient: React.FC = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [myRooms, setMyRooms] = useState<MyRoom[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'rooms'>('requests');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      fetchUserData(storedToken);
    }
  }, [router]);

  const fetchUserData = async (token: string) => {
    setLoading(true);
    try {
      // Fetch user's join requests
      const requestsResponse = await axios.get(`${BASE_URL}/req/join-requests`, {
        headers: { Authorization: `${token}` }
      });
      setJoinRequests(requestsResponse.data.requests || []);

      // Fetch user's accessible rooms
      const roomsResponse = await axios.get(`${BASE_URL}/user/rooms`, {
        headers: { Authorization: `${token}` }
      });
      console.log("Rooms response:", roomsResponse);
      setMyRooms(roomsResponse.data.rooms || []);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      setError("Failed to load your data");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelJoinRequest = async (requestId: string) => {
    if (!token || !confirm("Are you sure you want to cancel this join request?")) return;

    try {
      await axios.delete(`${BASE_URL}/user/join-requests/${requestId}`, {
        headers: { Authorization: `${token}` }
      });
      
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      console.error("Error canceling join request:", error);
      setError("Failed to cancel join request");
    }
  };

  const resendJoinRequest = async (roomSlug: string) => {
    if (!token) return;

    try {
      await axios.post(`${BASE_URL}/req/requestJoin`, 
        { roomSlug }, 
        { headers: { Authorization: `${token}` } }
      );
      
      // Refresh the data to show updated request
      fetchUserData(token);
    } catch (error) {
      console.error("Error resending join request:", error);
      setError("Failed to resend join request");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20';
      case 'APPROVED': return 'text-green-400 bg-green-500/20';
      case 'REJECTED': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'APPROVED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'REJECTED':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-white">Loading your data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-white">My Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/join')}
                className="text-purple-400 hover:text-purple-300 text-sm transition-colors duration-200"
              >
                Join Room
              </button>
              <button
                onClick={() => router.push('/joinRoom')}
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
              >
                Create Room
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => setError("")}
              className="text-red-300 hover:text-red-200 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'requests'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Join Requests ({joinRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'rooms'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              My Rooms ({myRooms.length})
            </button>
          </nav>
        </div>

        {/* Join Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-white">Your Join Requests</h2>
              <button
                onClick={() => router.push('/join')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Request
              </button>
            </div>

            {joinRequests.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400 mb-4">No join requests found</p>
                <button
                  onClick={() => router.push('/join')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Send Your First Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <div key={request.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </span>
                          <h3 className="text-white font-medium">{request.room.slug}</h3>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-2">
                          Room admin: <span className="text-gray-300">{request.room.admin.name}</span>
                        </p>
                        
                        {request.message && (
                          <div className="mb-3 p-3 bg-[#0d0d0d] border border-gray-700 rounded-lg">
                            <p className="text-gray-300 text-sm">Your message: "{request.message}"</p>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                          {request.updatedAt !== request.createdAt && (
                            <span>Updated: {new Date(request.updatedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {request.status === 'PENDING' && (
                          <button
                            onClick={() => cancelJoinRequest(request.id)}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                          >
                            Cancel
                          </button>
                        )}
                        {request.status === 'REJECTED' && (
                          <button
                            onClick={() => resendJoinRequest(request.room.slug)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                          >
                            Resend
                          </button>
                        )}
                        {request.status === 'APPROVED' && (
                          <button
                            onClick={() => router.push(`/canvas/${request.room.slug}`)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200"
                          >
                            Enter Room
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Rooms Tab */}
        {activeTab === 'rooms' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-white">Rooms You Can Access</h2>
              <button
                onClick={() => router.push('/joinRoom')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Room
              </button>
            </div>

            {myRooms.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-gray-400 mb-4">No accessible rooms</p>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => router.push('/joinRoom')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => router.push('/join')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRooms.map((room) => (
                  <div key={room.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors duration-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium truncate">{room.slug.slice(0, 20) + "..."}</h3>
                        <p className="text-gray-400 text-sm">
                          Created {new Date(room.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => router.push(`/canvas/${room.slug}`)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Enter Room
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRequestsClient;