import { prismaClient } from "@repo/db";


// GET /api/admin/rooms - Get admin's rooms with counts
export const adminRoomsControllerWithNumbers = async (req: any, res: any) => {
  try {
    const adminId = req.userId;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rooms = await prismaClient.room.findMany({
      where: { adminId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            users: true,
            joinRequests: {
              where: { status: "PENDING" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ rooms });
  } catch (error) {
    console.error("Error fetching admin rooms:", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

// GET /api/admin/join-requests - Get all pending join requests for admin's rooms
export const adminJoinRequestsController = async (req: any, res: any) => {
  try {
    const adminId = req.userId;
    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const joinRequests = await prismaClient.joinRequest.findMany({
      where: {
        room: { adminId },
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        room: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ requests: joinRequests });
  } catch (error) {
    console.error("Error fetching admin join requests:", error);
    res.status(500).json({ error: "Failed to fetch join requests" });
  }
};

// DELETE /api/room/:roomId/users/:userId - Remove user from room
export const removeUserFromRoomController = async (req: any, res: any) => {
  try {
    const adminId = req.userId;
    const { roomId, userId } = req.params;

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const room = await prismaClient.room.findFirst({
      where: {
        id: parseInt(roomId, 10),
        adminId,
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found or you are not the admin" });
    }

    await prismaClient.room.update({
      where: { id: parseInt(roomId, 10) },
      data: {
        users: {
          disconnect: { id: userId },
        },
      },
    });

    res.status(200).json({ message: "User removed from room successfully" });
  } catch (error) {
    console.error("Error removing user from room:", error);
    res.status(500).json({ error: "Failed to remove user from room" });
  }
};

// DELETE /admin/room/:roomId - Delete room
export const deleteRoomController = async (req: any, res: any) => {
  try {
    const adminId = req.userId;
    const { roomId } = req.params;

    if (!adminId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const room = await prismaClient.room.findFirst({
      where: {
        id: parseInt(roomId, 10),
        adminId,
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found or you are not the admin" });
    }

    // Use transaction to ensure atomicity
    await prismaClient.$transaction([
      prismaClient.chat.deleteMany({
        where: { roomId: parseInt(roomId, 10) },
      }),
      prismaClient.room.delete({
        where: { id: parseInt(roomId, 10) },
      }),
    ]);

    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    console.error("Error deleting room:", error);
    res.status(500).json({ error: "Failed to delete room" });
  }
}

