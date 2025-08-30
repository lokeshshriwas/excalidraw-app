import { Router } from "express";
import { signupController, signinController, googleOAuthController, githubCallbackController } from "../controllers/auth.controller";

const router: Router = Router();

// Traditional auth routes
router.post("/signup", signupController);
router.post("/signin", signinController);

// OAuth routes
router.post("/google", googleOAuthController);

router.post("/github/callback", githubCallbackController);  // Add this route

export default router;