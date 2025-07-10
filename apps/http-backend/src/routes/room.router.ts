import { Router } from "express";
import {createRoomController} from "../controllers/room.controller";
import { middleware } from "../middlwares/middleware";
const router : Router = Router();

router.post("/createRoom", middleware, createRoomController )

export default router