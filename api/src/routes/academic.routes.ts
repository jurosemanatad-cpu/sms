import { Router } from "express";
import { addGrade, markAttendance } from "../controllers/academic.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/grades", authenticateToken, addGrade);
router.post("/attendance", authenticateToken, markAttendance);

export default router;
