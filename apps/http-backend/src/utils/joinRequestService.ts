import { prismaClient } from "@repo/db";

// Function for users to send join requests
export const sendJoinRequest = async (userId: string, roomSlug: string, message: string) => {
  try {
    // First, find the room by slug
    const room = await prismaClient.room.findUnique({
      where: { slug: roomSlug },
      include: { users: true, admin: true }
    });

    if (!room) {
      throw new Error('Room not found');
    }

    // Check if user is already a member
    const isAlreadyMember = room.users.some(user => user.id === userId);
    if (isAlreadyMember) {
      throw new Error('You are already a member of this room');
    }

    // Check if user is the admin
    if (room.adminId === userId) {
      throw new Error('You are the admin of this room');
    }

    // Check if there's already a pending request
    const existingRequest = await prismaClient.joinRequest.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId: userId
        }
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        throw new Error('You already have a pending request for this room');
      } else if (existingRequest.status === 'APPROVED') {
        throw new Error('Your request was already approved');
      } else if (existingRequest.status === 'REJECTED') {
        // Allow resubmission if previously rejected
        const updatedRequest = await prismaClient.joinRequest.update({
          where: { id: existingRequest.id },
          data: {
            status: 'PENDING',
            message: message || null,
            updatedAt: new Date()
          }
        });
        return {
          success: true,
          message: 'Join request resubmitted successfully',
          requestId: updatedRequest.id
        };
      }
    }

    // Create new join request
    const joinRequest = await prismaClient.joinRequest.create({
      data: {
        roomId: room.id,
        userId: userId,
        message: message || null,
        status: 'PENDING'
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        room: { select: { id: true, slug: true } }
      }
    });

    return {
      success: true,
      message: 'Join request sent successfully',
      requestId: joinRequest.id
    };

  } catch (error: any) {
    console.error('Error sending join request:', error);
    throw new Error(error.message || 'Failed to send join request');
  }
};

// Function to get pending join requests for a room (for admin)
export const getPendingJoinRequests = async (adminId : string, roomSlug: string) => {
  try {
    // Verify admin owns the room
    const room = await prismaClient.room.findFirst({
      where: {
        slug: roomSlug,
        adminId: adminId
      }
    });

    if (!room) {
      throw new Error('Room not found or you are not the admin');
    }

    // Get pending join requests
    const joinRequests = await prismaClient.joinRequest.findMany({
      where: {
        roomId: room.id,
        status: 'PENDING'
      },
      include: {
        user: { 
          select: { 
            id: true, 
            name: true, 
            email: true, 
            avatar: true 
          } 
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      requests: joinRequests
    };

  } catch (error: any) {
    console.error('Error fetching join requests:', error);
    throw new Error(error.message || 'Failed to fetch join requests');
  }
};

// Function for admin to approve/reject join requests
export const handleJoinRequest = async (adminId: string, requestId: string, action: any ) => {
  try {
    // Get the join request with room info
    const joinRequest = await prismaClient.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        room: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!joinRequest) {
      throw new Error('Join request not found');
    }

    // Verify admin owns the room
    if (joinRequest.room.adminId !== adminId) {
      throw new Error('You are not authorized to handle this request');
    }

    // Check if request is still pending
    if (joinRequest.status !== 'PENDING') {
      throw new Error('This request has already been processed');
    }

    // Start a transaction to handle approval
    const result = await prismaClient.$transaction(async (tx) => {
      // Update the join request status
      const updatedRequest = await tx.joinRequest.update({
        where: { id: requestId },
        data: { 
          status: action,
          updatedAt: new Date()
        }
      });

      // If approved, add user to room
      if (action === 'APPROVED') {
        await tx.room.update({
          where: { id: joinRequest.room.id },
          data: {
            users: {
              connect: { id: joinRequest.userId }
            }
          }
        });
      }

      return updatedRequest;
    });

    return {
      success: true,
      message: action === 'APPROVED' ? 
        `User ${joinRequest.user.name} has been added to the room` : 
        `Join request from ${joinRequest.user.name} has been rejected`,
      request: result
    };

  } catch (error: any) {
    console.error('Error handling join request:', error);
    throw new Error(error.message || 'Failed to process join request');
  }
};

// Function to get all join requests for a user
export const getUserJoinRequests = async (userId:string) => {
  try {
    const joinRequests = await prismaClient.joinRequest.findMany({
      where: { userId: userId },
      include: {
        room: { 
          select: { 
            id: true, 
            slug: true, 
            createdAt: true,
            admin: { select: { name: true } }
          } 
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      requests: joinRequests
    };

  } catch (error: any) {
    console.error('Error fetching user join requests:', error);
    throw new Error('Failed to fetch your join requests');
  }
};