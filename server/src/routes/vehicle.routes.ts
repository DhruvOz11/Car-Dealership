import type { Router } from "express";
import { Router as createRouter } from "express";
import { create, getById, list, purchase, remove, restock, search, update } from "../controllers/vehicle.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router: Router = createRouter();

router.get("/", list);
router.get("/search", search);
router.get("/:id", getById);
router.post("/", authMiddleware, requireRole("ADMIN"), create);
router.post("/:id/purchase", authMiddleware, purchase);
router.post("/:id/restock", authMiddleware, requireRole("ADMIN"), restock);
router.put("/:id", authMiddleware, requireRole("ADMIN"), update);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), remove);

export default router;
