import axios from "axios";
import { BASE_URL } from "../config";
import { getSession } from "../utility/auth";

export async function getExistingShapes(roomId: number | null) {
  const token = await getSession();
  if (!token || !roomId) return;
  const res = await axios.get(`${BASE_URL}/room/chats/${roomId}`, {
    headers: {
      "Content-Type": "application/json",
      authorization: `${token}`,
    },
  });
  const messages = res.data.messages;

  const shapes = messages.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData.shape;
  });

  return shapes;
}
