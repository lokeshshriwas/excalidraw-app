import { prismaClient } from "@repo/db";

// GET /api/user/rooms - Get user's accessible rooms
export const userRoomsController = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const adminRooms = await prismaClient.room.findMany({
      where: { adminId: userId },
      select: {
        id: true,
        slug: true,
        createdAt: true,
      },
    });

    const memberRooms = await prismaClient.room.findMany({
      where: {
        users: {
          some: { id: userId },
        },
      },
      select: {
        id: true,
        slug: true,
        createdAt: true,
      },
    });

    const allRooms = [...adminRooms, ...memberRooms];
    const uniqueRooms = allRooms.filter(
      (room, index, self) => index === self.findIndex((r) => r.id === room.id)
    );

    res.status(200).json({ rooms: uniqueRooms });
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    res.status(500).json({ error: "Failed to fetch your rooms" });
  }
};

// DELETE /api/user/join-requests/:requestId - Cancel join request
export const cancelJoinRequestController = async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const { requestId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const joinRequest = await prismaClient.joinRequest.findFirst({
      where: {
        id: requestId,
        userId,
        status: "PENDING",
      },
    });

    if (!joinRequest) {
      return res.status(404).json({ error: "Join request not found or cannot be cancelled" });
    }

    await prismaClient.joinRequest.delete({
      where: { id: requestId },
    });

    res.status(200).json({ message: "Join request cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling join request:", error);
    res.status(500).json({ error: "Failed to cancel join request" });
  }
};

