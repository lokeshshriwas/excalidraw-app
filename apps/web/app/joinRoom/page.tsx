"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../config";

const CreateRoomPage: React.FC = () => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      router.push("/login");
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const onCreateBtn = async () => {
    if (!token) return;

    try {
      await axios.post(
        `${BASE_URL}/room/createRoom`,
        { name: input },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
        }
      );
      router.push(`/room/${input}`);
    } catch (error) {
      console.error("Room creation failed:", error);
    }
  };

  return (
    <div>
      <h1>Create your room</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter room name"
      />
      <button onClick={onCreateBtn}>Create room</button>
    </div>
  );
};

export default CreateRoomPage;
