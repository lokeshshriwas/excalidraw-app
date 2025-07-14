"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ChatPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function getData() {
      try {
        const response = await fetch("http://localhost:3002/v1/room/chats/6", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(data);
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
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Chat</h1>
      <div>
        {message && message.slice().reverse().map((item: any) => (
          <div key={item.id}>{item.message}</div>
        ))}
      </div>
    </div>
  );
};

export default ChatPage;
