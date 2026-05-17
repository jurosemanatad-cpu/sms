import { Router } from "express";
import { getClasses, createClass, addSubject } from "../controllers/class.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, getClasses);
router.post("/", authenticateToken, requireAdmin, createClass);
router.post("/:classId/subjects", authenticateToken, requireAdmin, addSubject);

export default router;
