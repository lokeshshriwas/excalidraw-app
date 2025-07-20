import { Router } from "express";
import {createRoomController, getRecentMessages, getRoomIdController} from "../controllers/room.controller";
import { middleware } from "../middlwares/middleware";
const router : Router = Router();

router.post("/createRoom", middleware, createRoomController )
router.get("/chats/:roomId", middleware, getRecentMessages)
router.get("/:slug", getRoomIdController)

export default router