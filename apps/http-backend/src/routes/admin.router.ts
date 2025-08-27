import { Router } from "express";
import { middleware } from "../middlwares/middleware";
import { adminJoinRequestsController, adminRoomsControllerWithNumbers, deleteRoomController, removeUserFromRoomController } from "../controllers/admin.controller";
const router : Router = Router();

router.get("/rooms", middleware, adminRoomsControllerWithNumbers)
router.get("/join-requests", middleware , adminJoinRequestsController)
router.delete("/:roomId/users/:userId", middleware , removeUserFromRoomController)
router.delete("/rooms/:roomId", middleware , deleteRoomController)

export default router