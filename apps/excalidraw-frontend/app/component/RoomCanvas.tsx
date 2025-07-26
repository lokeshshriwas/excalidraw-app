"use client";

import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { WS_URL } from "../config";
import { useRouter } from 'next/navigation';
import { getSession } from "../utility/auth";

const RoomCanvas = ({ roomId }: { roomId: number | null }) => {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Fetch token on mount
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getSession();
      if (!token) {
        router.push("/login");
        return;
      }
      setToken(token);
    };
    fetchToken();
  }, []);

  // Open WebSocket when token and roomId are available
  useEffect(() => {
    if (token && roomId !== null) {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      ws.onopen = () => {
        setSocket(ws);
        ws.send(JSON.stringify({ type: "join_room", roomId }));
      };
      return () => {
        ws.close();
      };
    }
  }, [token, roomId]);

  if (!socket) {
    return <div>Loading...</div>;
  }

  return <Canvas roomId={roomId} socket={socket} />;
};

export default RoomCanvas;
