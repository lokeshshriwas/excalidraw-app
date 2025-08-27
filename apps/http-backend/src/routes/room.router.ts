import { Router } from "express";
import {adminRoomsController, checkUserInRoom, createRoomController, getRecentMessages, getRoomIdController} from "../controllers/room.controller";
import { middleware } from "../middlwares/middleware";
const router : Router = Router();

router.post("/createRoom", middleware, createRoomController )
router.get("/chats/:roomId", middleware, getRecentMessages)
router.get("/:slug", middleware , getRoomIdController)
router.get("/check/:slug", middleware, checkUserInRoom)

export default router