"use client";
import React, { useRef } from "react";
import RoomCanvas from "./RoomCanvas";
import { BASE_URL } from "../config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getSession } from "../utility/auth";

const CanvasClient = ({ slug }: { slug: string }) => {
  const router = useRouter();
  const [roomId, setRoomId] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Prevent multiple navigation calls
  const hasNavigated = useRef(false);

  const getRoomId = async (slug: string) => {
    try {
      const tok = await getSession();
      if (!tok) {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.push("/login");
        }
        return null;
      }

      const response = await axios.get(`${BASE_URL}/room/${slug}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: tok,
        },
      });

      if (response.status === 200) {
        return response.data.id;
      }
      return null;
    } catch (error) {
      console.error("Error fetching room ID:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError("Room not found");
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.push("/login");
        }
        return null;
      } else {
        setError("Failed to load room");
      }
      return null;
    }
  };

  React.useEffect(() => {
    const fetchRoomId = async () => {
      const id = await getRoomId(slug);
      
      if (id === null && !hasNavigated.current) {
        // Only navigate if we haven't already navigated and there's no specific error
        if (!error) {
          hasNavigated.current = true;
          router.push("/joinRoom");
        }
      } else if (id) {
        setRoomId(id);
      }
      
      setLoading(false);
    };
    
    fetchRoomId();
  }, [slug]);

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button 
          onClick={() => router.push("/joinRoom")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Join Room
        </button>
      </div>
    );
  }

  if (!roomId) {
    return <div className="text-center p-4">Redirecting...</div>;
  }

  return (
    <div>
      <RoomCanvas roomId={roomId} slug={slug} />
    </div>
  );
};

export default CanvasClient;