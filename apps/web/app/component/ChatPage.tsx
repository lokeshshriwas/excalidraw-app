"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

interface Message {
  id?: number;
  message: string;
  roomId?: number;
  userId?: number;
}

const ChatPage = ({ roomId }: { roomId: number }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendMessage, setSendMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { loading: socketLoading, socket } = useSocket();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function getData() {
      try {
        const response = await fetch(`http://localhost:3002/v1/room/chats/${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    }

    getData();
  }, [roomId, router]);

  useEffect(() => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "join_room",
          id: roomId,
        })
      );

      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "chat") {
          setMessages((prev) => [...prev, { message: parsedData.message }]);
        }
      };
    }
  }, [socket , loading, roomId]);

  const handleSendMessage = () => {
    if (socket && sendMessage.trim()) {
      const messageData = {
        type: "chat",
        message: sendMessage,
        roomId: roomId,
      };
      socket.send(JSON.stringify(messageData));
      setMessages((prev) => [...prev, { message: sendMessage }]);
      setSendMessage("");
    }
  };

  if (loading || socketLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {messages &&
          messages.slice().reverse()
            .map((item: Message, index: number) => (
              <div key={item.id || index}>{item.message}</div>
            ))}

        <div>
          <input
            type="text"
            value={sendMessage}
            onChange={(e) => setSendMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
