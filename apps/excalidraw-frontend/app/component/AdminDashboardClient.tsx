"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../config";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Room {
  id: number;
  slug: string;
  createdAt: string;
  users: User[];
  _count: {
    users: number;
    joinRequests: number;
  };
}

interface JoinRequest {
  id: string;
  message?: string;
  createdAt: string;
  user: User;
  room: {
    slug: string;
    id: number;
  };
}

const AdminDashboardClient: React.FC = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'requests'>('rooms');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
      fetchAdminData(storedToken);
    }
  }, [router]);

  const fetchAdminData = async (token: string) => {
    setLoading(true);
    try {
      // Fetch admin rooms
      const roomsResponse = await axios.get(`${BASE_URL}/admin/rooms`, {
        headers: { Authorization: `${token}` }
      });
      setRooms(roomsResponse.data.rooms || []);

      // Fetch all pending join requests for admin's rooms
      const requestsResponse = await axios.get(`${BASE_URL}/admin/join-requests`, {
        headers: { Authorization: `${token}` }
      });
      setJoinRequests(requestsResponse.data.requests || []);
    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      setError("Failed to load dashboard data");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    if (!token) return;

    try {
      await axios.patch(`${BASE_URL}/req/requests/${requestId}/handle`, 
        { action }, 
        { headers: { Authorization: `${token}` } }
      );
      
      // Remove the processed request from the list
      setJoinRequests(prev => prev.filter(req => req.id !== requestId));
      
      // Refresh rooms data to update user counts
      if (action === 'APPROVED') {
        fetchAdminData(token);
      }
    } catch (error) {
      console.error("Error handling join request:", error);
      setError("Failed to handle join request");
    }
  };

  const removeUserFromRoom = async (roomId: number, userId: string) => {
    if (!token || !confirm("Are you sure you want to remove this user from the room?")) return;

    try {
      await axios.delete(`${BASE_URL}/admin/${roomId}/users/${userId}`, {
        headers: { Authorization: `${token}` }
      });
      
      // Update the rooms state to reflect the change
      setRooms(prev => prev.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              users: room.users.filter(user => user.id !== userId),
              _count: { ...room._count, users: room._count.users - 1 }
            }
          : room
      ));
      
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(prev => prev ? {
          ...prev,
          users: prev.users.filter(user => user.id !== userId),
          _count: { ...prev._count, users: prev._count.users - 1 }
        } : null);
      }
    } catch (error) {
      console.error("Error removing user:", error);
      setError("Failed to remove user from room");
    }
  };

  const deleteRoom = async (roomId: number) => {
    if (!token || !confirm("Are you sure you want to delete this room? This action cannot be undone.")) return;

    try {
      await axios.delete(`${BASE_URL}/admin/${roomId}`, {
        headers: { Authorization: `${token}` }
      });
      
      setRooms(prev => prev.filter(room => room.id !== roomId));
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      setError("Failed to delete room");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Fixed background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              onClick={() => setActiveTab('rooms')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'rooms'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              My Rooms ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Join Requests ({joinRequests.length})
            </button>
          </nav>
        </div>

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rooms List */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-white">Your Rooms</h2>
              {rooms.length === 0 ? (
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-400">No rooms created yet</p>
                  <button
                    onClick={() => router.push('/joinRoom')}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Create Your First Room
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`bg-[#1a1a1a] border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                        selectedRoom?.id === room.id
                          ? 'border-blue-500 bg-blue-500/5'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-medium truncate">{room.slug}</h3>
                          <p className="text-gray-400 text-sm">
                            Created {new Date(room.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-green-400 text-sm flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a2.5 2.5 0 01-2.5 2.5 2.5 2.5 0 01-2.5-2.5 2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5z" />
                              </svg>
                              {room._count.users} users
                            </span>
                            {room._count.joinRequests > 0 && (
                              <span className="text-yellow-400 text-sm flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                {room._count.joinRequests} pending
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/canvas/${room.slug}`);
                            }}
                            className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                          >
                            Open
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteRoom(room.id);
                            }}
                            className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Details */}
            <div>
              {selectedRoom ? (
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-white">{selectedRoom.slug}</h3>
                      <p className="text-gray-400 text-sm">Room Details</p>
                    </div>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs">
                      {selectedRoom._count.users} members
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-medium">Room Members</h4>
                    {selectedRoom.users.length === 0 ? (
                      <p className="text-gray-400 text-sm">No members yet</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedRoom.users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{user.name}</p>
                                <p className="text-gray-400 text-xs">{user.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeUserFromRoom(selectedRoom.id, user.id)}
                              className="text-red-400 hover:text-red-300 text-sm transition-colors duration-200"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  <p className="text-gray-400">Select a room to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-lg font-medium text-white mb-4">Pending Join Requests</h2>
            {joinRequests.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-400">No pending join requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {joinRequests.map((request) => (
                  <div key={request.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {request.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-white font-medium">{request.user.name}</h4>
                              <span className="text-gray-400 text-sm">wants to join</span>
                              <span className="text-blue-400 font-medium">{request.room.slug}</span>
                            </div>
                            <p className="text-gray-400 text-sm">{request.user.email}</p>
                            {request.message && (
                              <div className="mt-2 p-2 bg-[#0d0d0d] border border-gray-700 rounded-md">
                                <p className="text-gray-300 text-sm">"{request.message}"</p>
                              </div>
                            )}
                            <p className="text-gray-500 text-xs mt-2">
                              Requested {new Date(request.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleJoinRequest(request.id, 'APPROVED')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleJoinRequest(request.id, 'REJECTED')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
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

export default AdminDashboardClient;