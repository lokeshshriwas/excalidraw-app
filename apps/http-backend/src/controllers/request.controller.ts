import {  getPendingJoinRequests, getUserJoinRequests, handleJoinRequest, sendJoinRequest } from "../utils/joinRequestService";

// POST /requestJoin - Send join request
export const requestJoin = async (req: any, res:any) => {
  try {
    const userId = req.userId; // From your auth middleware
    const { roomSlug, message } = req.body;

    if (!roomSlug) {
      return res.status(400).json({ error: 'Room slug is required' });
    }

    // Send join request
    const result = await sendJoinRequest(userId, roomSlug, message);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Join request error:', error);
    
    if (error.message.includes('already a member') || 
        error.message.includes('already have a pending request') ||
        error.message.includes('already approved')) {
      return res.status(409).json({ error: error.message });
    }
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ 
      error: error.message || 'Failed to send join request' 
    });
  }
}

// GET /:slug/requests - Get pending join requests for a room (admin only)
export const pendingJoinRequest = async (req:any, res:any) => {
  try {
    const adminId = req.userId; // From your auth middleware
    const { slug } = req.params;

    // Get pending join requests
    const result = await getPendingJoinRequests(adminId, slug);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Get join requests error:', error);
    
    if (error.message.includes('not found') || error.message.includes('not the admin')) {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ 
      error: error.message || 'Failed to fetch join requests' 
    });
  }
};

// PATCH /requests/:requestId/handle - Handle join request (approve/reject)
export const handleJoinReq = async (req: any, res:any) => {
  try {
    const adminId = req.userId; // From your auth middleware
    const { requestId } = req.params;
    const { action } = req.body;

    if (!action || !['APPROVED', 'REJECTED'].includes(action)) {
      return res.status(400).json({ 
        error: 'Valid action (APPROVED or REJECTED) is required' 
      });
    }

    // Handle join request
    const result = await handleJoinRequest(adminId, requestId, action);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Handle join request error:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('not authorized')) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ 
      error: error.message || 'Failed to handle join request' 
    });
  }
};

// GET /user/join-requests - Get user's join requests
export const getJoinReqeuests = async (req : any, res:any) => {
  try {
    const userId = req.userId; // From your auth middleware

    // Get user's join requests
    const result = await getUserJoinRequests(userId);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Get user join requests error:', error);

    res.status(500).json({ 
      error: error.message || 'Failed to fetch your join requests' 
    });
  }
}

