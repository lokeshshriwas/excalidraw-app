import { WebSocket, WebSocketServer } from "ws";
import { JWT_SECRET } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { prismaClient } from "@repo/db";

const wss = new WebSocketServer({ port: 9090 });

interface User {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

interface QueuedMessage {
  roomId: number;
  message: string;
  userId: string;
}

const users: User[] = [];
let messageQueue : QueuedMessage[] = [];

function checkUser(token: string): string | null {
  try {
    if (!token) {
      return null;
    }

    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const verifyedToken = jwt.verify(token, JWT_SECRET);

    if (!verifyedToken) {
      return null;
    }

    if (verifyedToken) {
      return (verifyedToken as any).userId;
    }

    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function saveMessagesToDatabase () {
  if(messageQueue.length === 0) {
    return;
  }
  const messageToSave = [...messageQueue];
  messageQueue = [];

  try {
   await prismaClient.chat.createMany({
      data: messageToSave.map((message) => ({
        roomId: message.roomId,
        message: message.message,
        userId: message.userId,
      })),
    });
    console.log("Messages saved")
  } catch (error) {
    console.log(error);
    messageQueue.push(...messageToSave);
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

  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", function message(data) {
    const parsedData = JSON.parse(data.toString());
    if (parsedData.type === "join_room") {
      const roomId = parsedData.roomId;
      const user = users.find((user) => user.userId === userId);
      if (user && !user.rooms.includes(roomId)) {
        user.rooms.push(roomId);
      }
    }

    if (parsedData.type === "leave_room") {
      const roomId = parsedData.roomId;
      const user = users.find((user) => user.userId === userId);
      if (user && user.rooms.includes(roomId)) {
        user.rooms = user.rooms.filter((room) => room !== roomId);
      }
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;
      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({ type: "chat", roomId, message }));
        }
        messageQueue.push({ roomId, message, userId });
      });
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