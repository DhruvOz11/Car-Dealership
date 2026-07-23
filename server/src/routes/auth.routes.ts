import type { Router } from "express";
import { Router as createRouter } from "express";
import { login, register, googleAuth } from "../controllers/auth.controller.js";
const router: Router = createRouter();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);

export default router;
