import { WebSocket, WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db";

const wss = new WebSocketServer({ port: 9090 });

interface QueuedMessage {
  id: string;
  roomId: number;
  message: string;
  userId: string;
  timeStamp : Date
}

type DrawingAction = {
  id: string;
  message: string;
  timeStamp: Date
};
const roomHistory = new Map<
  string,
  {
    undoStack: DrawingAction[];
    redoStack: DrawingAction[];
  }
>();
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
        id: message.id,
        roomId: message.roomId,
        message: message.message,
        userId: message.userId,
        timeStamp : message.timeStamp
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
      const id = parsedData.id;
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      const timeStamp = parsedData.timeStamp;
      const connections = roomConnections.get(roomId);
      if (!roomHistory.has(roomId)) {
        roomHistory.set(roomId, {
          undoStack: [],
          redoStack: [],
        });
      }
      const action = { id, message, timeStamp };
      roomHistory.get(roomId)?.undoStack.push(action);
      roomHistory.get(roomId)!.redoStack = [];
      if (connections) {
        connections.forEach((connection) => {
          connection.send(
            JSON.stringify({ id, type: "chat", roomId, message, timeStamp})
          );
        });
      }
      messageQueue.set(`${roomId}:${message}`, { id, roomId, message, userId, timeStamp });
    }

    if (parsedData.type === "undo") {
      const roomId = parsedData.roomId;
      const connections = roomConnections.get(roomId);
      if (connections) {
        connections.forEach((connection) => {
          if (connection !== ws) {
            connection.send(
              JSON.stringify({
                type: "undo",
                id: parsedData.id,
                roomId,
              })
            );
          }
        });
      }
    }

    if (parsedData.type === "redo") {
      const roomId = parsedData.roomId;
      const connections = roomConnections.get(roomId);
      if (connections) {
        connections.forEach((connection) => {
          if (connection !== ws) {
            connection.send(
              JSON.stringify({
                type: "redo",
                id: parsedData.id,
                roomId,
              })
            );
          }
        });
      }
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

process.on("SIGTERM", async () => {
  console.log("Shutting down...");
  await saveMessagesToDatabase(); // Save any remaining messages
  await prismaClient.$disconnect();
  wss.close();
  process.exit(0);
});
