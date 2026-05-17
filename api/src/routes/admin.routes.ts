import { Router } from "express";
import { addStaff, getStaff, getPendingStudents, approveStudent } from "../controllers/admin.controller.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = Router();

// All routes here require authentication and admin privileges
router.use(authenticateToken, requireAdmin);

router.post("/add-staff", addStaff);
router.get("/staff", getStaff);
router.get("/pending-students", getPendingStudents);
router.put("/approve-student/:id", approveStudent);

export default router;
