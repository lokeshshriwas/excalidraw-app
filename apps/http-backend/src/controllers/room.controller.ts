import { CreateRoomSchema } from "@repo/common";
import { prismaClient } from "@repo/db";

export const createRoomController = async (req: any, res: any) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).send({ message: "Invalid input" });
  }

  const userId = req.userId; // from auth middleware

  try {
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.name,
        adminId: userId,
        users: {
          connect: [{ id: userId }], // add creator to users array
        },
      },
    });

    return res.status(201).send({
      message: "Room created",
      roomId: room.id,
      slug: room.slug,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(409).json({
      message: "Room already exists with this slug",
    });
  }
};

export const getRecentMessages = async (req: any, res: any) => {
  const roomId = req.params.roomId;

  try {
    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: Number(roomId),
      },
      orderBy: {
        timeStamp: "asc",
      },
      take: 1000,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
      },
    });

    return res.status(200).json(messages);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const getRoomIdController = async (req: any, res: any) => {
  const slug = req.params.slug;

  try {
    const room = await prismaClient.room.findUnique({
      where: { slug },
      include: {
        admin: { select: { id: true, name: true, email: true } },
        users: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.status(200).json(room);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch room" });
  }
};

export const checkUserInRoom = async (req: any, res: any) => {
  const slug = req.params.slug;
  const userId = req.userId;

  try {
    const room = await prismaClient.room.findUnique({
      where: { slug },
      include: {
        users: { select: { id: true } },
        admin: { select: { id: true } },
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isUserInRoom =
      room.admin.id === userId ||
      room.users.some((u) => u.id === userId);

    return res.status(200).json({ isInRoom: isUserInRoom });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Failed to check user in room" });
  }
};

export const adminRoomsController = async (req: any, res: any) => {
  const userId = req.userId;

  try {
    // Rooms where user is the admin
    const adminRooms = await prismaClient.room.findMany({
      where: {
        adminId: userId,
      },
    });

    // Rooms where user is a member but NOT the admin
    const userRooms = await prismaClient.room.findMany({
      where: {
        adminId: {
          not: userId,
        },
        users: {
          some: {
            id: userId,
          },
        },
      },
    });

    return res.status(200).json({
      adminRooms,
      userRooms,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch rooms" });
  }
};

