import { CreateRoomSchema } from "@repo/common";
import { prismaClient } from "@repo/db";

export const createRoomController = async (req: any, res: any) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).send({ message: "Invalid input" });
  }

  const userId = req.userId;

  try {
    const room = await prismaClient.room.create({
      data: {
        adminId: userId,
        slug: parsedData.data.name,
      },
    });

    res.status(201).send({ message: "Room created", roomId: room.id });
  } catch (error) {
    res.status(409).json({
      message: "Room already exists with this name",
    });
  }
};

export const getRecentMessages  = async (req: any, res: any) => {
    const roomId = req.params.roomId;
    const messages = await prismaClient.chat.findMany({
        where: {
            roomId: Number(roomId)
        },
        orderBy: {
            id: 'desc'
        },
        take: 50
    })
    res.status(200).json(messages);
}

