import { CreateRoomSchema } from "@repo/common";
import { prismaClient } from "@repo/db";
import { canUserCreateCanvas } from "../services/subscription.service";

export const createRoomController = async (req: any, res: any) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).send({ message: "Invalid input" });
  }

  const userId = req.userId; // from auth middleware

  try {
    // Check subscription-based canvas limits
    const canCreate = await canUserCreateCanvas(userId);
    console.log('Canvas creation check for user:', userId, 'Result:', canCreate);

    if (!canCreate.allowed) {
      return res.status(403).send({
        message: canCreate.reason,
        needsUpgrade: true,
      });
    }

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
        admin: {
          select: {
            id: true,
            subscription: {
              select: {
                planType: true,
                status: true,
                endDate: true,
              }
            }
          }
        },
      },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const isUserInRoom =
      room.admin.id === userId ||
      room.users.some((u: any) => u.id === userId);

    if (!isUserInRoom) {
      return res.status(200).json({ isInRoom: false, isReadOnly: false });
    }

    // Check if room should be read-only based on admin's subscription
    let isReadOnly = false;
    const adminSubscription = room.admin.subscription;

    if (adminSubscription) {
      const now = new Date();
      const isExpired = adminSubscription.planType === 'PREMIUM' &&
        adminSubscription.endDate !== null &&
        adminSubscription.endDate < now;

      const isFreeUser = adminSubscription.planType === 'FREE';

      // If admin's subscription is expired or free, check if this room is in the top 2 most recent
      if (isExpired || isFreeUser) {
        // Get admin's 2 most recent rooms
        const recentRooms = await prismaClient.room.findMany({
          where: { adminId: room.admin.id },
          orderBy: { createdAt: 'desc' },
          take: 2,
          select: { id: true },
        });

        const recentRoomIds = recentRooms.map((r: any) => r.id);

        // If this room is NOT in the top 2, it's read-only
        if (!recentRoomIds.includes(room.id)) {
          isReadOnly = true;
        }
      }
    } else {
      // No subscription = FREE user, check if room is in top 2 most recent
      const recentRooms = await prismaClient.room.findMany({
        where: { adminId: room.admin.id },
        orderBy: { createdAt: 'desc' },
        take: 2,
        select: { id: true },
      });

      const recentRoomIds = recentRooms.map((r: any) => r.id);

      if (!recentRoomIds.includes(room.id)) {
        isReadOnly = true;
      }
    }

    return res.status(200).json({ isInRoom: isUserInRoom, isReadOnly });
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

