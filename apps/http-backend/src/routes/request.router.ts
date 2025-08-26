import { Router } from "express";
import { middleware } from "../middlwares/middleware";
import { getJoinReqeuests, handleJoinReq, pendingJoinRequest, requestJoin } from "../controllers/request.controller";
const router : Router = Router();

router.post("/requestJoin", middleware, requestJoin )
router.get("/:slug/requests", middleware, pendingJoinRequest)
router.patch("/requests/:requestId/handle", middleware , handleJoinReq)
router.get("/user/join-requests", middleware, getJoinReqeuests)

export default router