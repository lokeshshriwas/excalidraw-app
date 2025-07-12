import { Router } from "express";
import {createRoomController, getRecentMessages} from "../controllers/room.controller";
import { middleware } from "../middlwares/middleware";
const router : Router = Router();

router.post("/createRoom", middleware, createRoomController )
router.get("/chats/:roomId", middleware, getRecentMessages)

export default router