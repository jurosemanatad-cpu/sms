import { Response } from "express";
import { prisma } from "../db-check.js";
import { AuthRequest } from "../middleware/auth.js";

export const addGrade = async (req: AuthRequest, res: Response) => {
  if (req.user?.role === "STUDENT") return res.status(403).json({ message: "Access denied" });
  
  const { studentId, subjectId, score, semester } = req.body as any;
  try {
    const grade = await prisma.grade.create({
      data: { studentId, subjectId, score: Number(score), semester: Number(semester) || 1 }
    });
    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ message: "Failed to add grade" });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  if (req.user?.role === "STUDENT") return res.status(403).json({ message: "Access denied" });

  const { studentId, date, status } = req.body as any;
  try {
    const attendance = await prisma.attendance.create({
      data: { studentId, date: new Date(date), status }
    });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Failed to mark attendance" });
  }
};
