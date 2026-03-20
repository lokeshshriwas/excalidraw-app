import { Router } from "express";
import {
  signupController,
  signinController,
  googleInitiateController,
  googleCallbackController,
  githubInitiateController,
  githubCallbackController,
} from "../controllers/auth.controller";

const router: Router = Router();

// Traditional auth routes
router.post("/signup", signupController);
router.post("/signin", signinController);

// Google OAuth — backend-driven redirect flow
router.get("/google", googleInitiateController);
router.get("/google/callback", googleCallbackController);

// GitHub OAuth — backend-driven redirect flow
router.get("/github", githubInitiateController);
router.get("/github/callback", githubCallbackController);

export default router;