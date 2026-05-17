import { Router } from "express";
import { getStudents, getStudentById, createStudent, assignClass, getStudentPerformance } from "../controllers/student.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, getStudents);
router.post("/", authenticateToken, requireAdmin, createStudent);

router.get("/:id", authenticateToken, getStudentById);
router.put("/:studentId/class", authenticateToken, requireAdmin, assignClass);
router.get("/:id/performance", authenticateToken, getStudentPerformance);

export default router;
