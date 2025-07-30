import axios from "axios";
import { BASE_URL } from "../config";
import { getSession } from "../utility/auth";

export async function getExistingShapes(roomId: number | null) {
  try {
    const token = await getSession();
    if (!token || !roomId) return [];

    // Fetch messages
    const res = await axios.get(`${BASE_URL}/room/chats/${roomId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `${token}`,
      },
    });

    const messages = res.data;

    // Parse and collect shapes
    const shapes = messages.flatMap((msg: { message: string }) => {
      try {
        const messageData = JSON.parse(msg.message);

        // If messageData is an array of shapes
        if (Array.isArray(messageData)) {
          return messageData.map((shape) => ({
            type: shape.type,
            x1: shape.x1 ?? null,
            y1: shape.y1 ?? null,
            x2: shape.x2 ?? null,
            y2: shape.y2 ?? null
          }));
        }
        return [messageData];
      } catch (err) {
        console.error("Error parsing message:", msg.message, err);
        return [];
      }
    });

    return shapes;
  } catch (error) {
    console.error("Failed to fetch shapes:", error);
    return [];
  }
}
