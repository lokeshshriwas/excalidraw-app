"use client";

import React, { useEffect, useState, useRef } from "react";
import Canvas from "./Canvas";
import { BASE_URL, WS_URL } from "../config";
import { useRouter } from "next/navigation";
import { getSession } from "../utility/auth";
import axios from "axios";

const RoomCanvas = ({
  roomId,
  slug,
}: {
  roomId: number | null;
  slug: string;
}) => {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [legitUser, setLegitUser] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  // Prevent multiple navigation calls
  const hasNavigated = useRef(false);

  // Fetch token and check user authorization
  useEffect(() => {
    const fetchTokenAndCheckUser = async () => {
      try {
        const tok = await getSession();

        if (!tok) {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            router.push("/login");
          }
          return;
        }

        setToken(tok);

        // Check if user is authorized for this room
        const response = await axios.get(`${BASE_URL}/room/check/${slug}`, {
          headers: { Authorization: `${tok}` },
        });

        const checkUser: { isInRoom: boolean; isReadOnly: boolean } =
          response.data;

        if (!checkUser.isInRoom) {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            router.push("/joinRoom");
          }
          setError("You are not authorized to access this room");
          return;
        }

        setLegitUser(true);
        setIsReadOnly(checkUser.isReadOnly);

        // Show a message if room is read-only
        if (checkUser.isReadOnly) {
          console.log("Room is in read-only mode due to subscription limits");
        }
      } catch (error) {
        console.error("Error checking user authorization:", error);
        setError("Failed to verify room access");
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          router.push("/joinRoom");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTokenAndCheckUser();
  }, [slug, router]);

  // Open WebSocket when token and roomId are available and user is legitimate
  useEffect(() => {
    if (token && roomId !== null && legitUser) {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setSocket(ws);
        ws.send(JSON.stringify({ type: "join_room", roomId }));
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection failed");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setSocket(null);
      };

      return () => {
        console.log("Cleaning up WebSocket");
        ws.close();
      };
    }
  }, [token, roomId, legitUser]);

  // Show loading state
  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  // Show error state
  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  // Show loading if socket is not ready or user is not legitimate
  if (!socket || roomId === null || !legitUser) {
    return <div className="text-center p-4">Connecting...</div>;
  }

  return (
    <div className="relative">
      {isReadOnly && (
        <div className="flex items-center justify-center fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2  text-sm font-medium">
          Read-only mode - This room is view-only due to subscription limits
          <br />
          <button onClick={() => router.push("/pricing")} className="">
            &nbsp; &nbsp;
            <span className="underline text-white cursor-pointer">
              Start Editing
            </span>
          </button>
        </div>
      )}
      <Canvas
        roomId={roomId}
        socket={socket}
        legitUser={legitUser}
        readOnly={isReadOnly}
      />
    </div>
  );
};

export default RoomCanvas;
