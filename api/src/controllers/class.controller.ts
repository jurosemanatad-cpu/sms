import { Request, Response } from "express";
import { prisma } from "../db-check.js";
import { AuthRequest } from "../middleware/auth.js";
import { isMockMode } from "../mock-auth.js";

// In-memory mock classes for demo mode
export const mockClasses: any[] = [];

export const getClasses = async (_req: Request, res: Response) => {
  if (isMockMode()) {
    res.json(mockClasses);
    return;
  }
  const classes = await prisma.class.findMany({
    include: {
      students: { select: { id: true, name: true, email: true } },
      subjects: true
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(classes);
};

export const createClass = async (req: AuthRequest, res: Response) => {
  const { name, gradeLevel, academicYear } = req.body as any;
  if (!name || !gradeLevel || !academicYear) return res.status(400).json({ message: "Missing fields" });

  if (isMockMode()) {
    const newClass = { id: `mock-class-${Date.now()}`, name, gradeLevel, academicYear, students: [], subjects: [], createdAt: new Date().toISOString() };
    mockClasses.push(newClass);
    res.status(201).json(newClass);
    return;
  }

  try {
    const newClass = await prisma.class.create({
      data: { name: name.trim(), gradeLevel, academicYear: academicYear.trim() }
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: "Failed to create class" });
  }
};

export const addSubject = async (req: AuthRequest, res: Response) => {
  const { classId } = req.params;
  const { name } = req.body as { name: string };
  try {
    const subject = await prisma.subject.create({
      data: { name, classId }
    });
    res.status(201).json(subject);
  } catch (error) {
    res.status(500).json({ message: "Failed to add subject" });
  }
};
