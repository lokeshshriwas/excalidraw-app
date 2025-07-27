import { WebSocket, WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db";

const wss = new WebSocketServer({ port: 9090 });

interface QueuedMessage {
  roomId: number;
  message: string;
  userId: string;
}

const roomConnections = new Map<string, WebSocket[]>();
const userConnections = new Map<WebSocket, string>();
const messageQueue = new Map<string, QueuedMessage>();

function checkUser(token: string): string | null {
  try {
    if (!token) {
      return null;
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const verifiedToken = jwt.verify(token, JWT_SECRET);

    if (!verifiedToken) {
      return null;
    }

    if (verifiedToken) {
      return (verifiedToken as any).userId;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function saveMessagesToDatabase() {
  if (messageQueue.size === 0) {
    return;
  }
  const messages = Array.from(messageQueue.values());
  messageQueue.clear();

  try {
    await prismaClient.chat.createMany({
      data: messages.map((message) => ({
        roomId: message.roomId,
        message: message.message,
        userId: message.userId,
      })),
    });
    console.log("Messages saved");
  } catch (error) {
    console.log(error);
    messages.forEach((message) => {
      messageQueue.set(`${message.roomId}:${message.message}`, message);
    });
  }
}

setInterval(saveMessagesToDatabase, 2000);

wss.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  const userId = checkUser(token);
  if (!userId) {
    ws.close();
    return;
  }

  userConnections.set(ws, userId);

  ws.on("message", function message(data) {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.type === "join_room") {
      const roomId = parsedData.roomId;
      if (!roomConnections.has(roomId)) {
        roomConnections.set(roomId, []);
      }
      roomConnections.get(roomId)?.push(ws);
    }

    if (parsedData.type === "leave_room") {
      const roomId = parsedData.roomId;
      const connections = roomConnections.get(roomId);
      if (connections) {
        roomConnections.set(
          roomId,
          connections.filter((connection) => connection !== ws)
        );
      }
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      const connections = roomConnections.get(roomId);
      if (connections) {
        connections.forEach((connection) => {
          connection.send(JSON.stringify({ type: "chat", roomId, message }));
        });
      }
      messageQueue.set(`${roomId}:${message}`, { roomId, message, userId });
    }
  });

  ws.on("close", () => {
    const userId = userConnections.get(ws);
    if (userId) {
      roomConnections.forEach((connections, roomId) => {
        roomConnections.set(
          roomId,
          connections.filter((connection) => connection !== ws)
        );
      });
      userConnections.delete(ws);
      console.log("User disconnected and removed");
    }
  });
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await saveMessagesToDatabase(); // Save any remaining messages
  await prismaClient.$disconnect();
  wss.close();
  process.exit(0);
});
