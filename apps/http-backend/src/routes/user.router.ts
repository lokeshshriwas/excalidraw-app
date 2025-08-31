import { Router } from "express";
import { middleware } from "../middlwares/middleware";
import { cancelJoinRequestController, userProfileController, userRoomsController } from "../controllers/user.controller";
import { adminRoomsController } from "../controllers/room.controller";
const router : Router = Router();

router.get("/rooms", middleware, userRoomsController)
router.delete("/join-requests/:requestId", middleware , cancelJoinRequestController)
router.get("/myRooms", middleware, adminRoomsController)
router.get("/profile", middleware, userProfileController)

export default router