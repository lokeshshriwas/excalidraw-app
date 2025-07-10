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
