import { Request, Response } from "express";
import { prisma } from "../db-check.js";
import { AuthRequest } from "../middleware/auth.js";
import { isMockMode, mockStudents } from "../mock-auth.js";

export const getStudents = async (_req: Request, res: Response) => {
  if (isMockMode()) {
    res.json(mockStudents);
    return;
  }
  const students = await prisma.student.findMany({
    include: { class: true },
    orderBy: { createdAt: "desc" }
  });
  res.json(students);
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  
  if (req.user?.role === "STUDENT") {
    const me = await prisma.student.findUnique({ where: { userId: req.user.userId } });
    if (me?.id !== id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }
  }

  const student = await prisma.student.findUnique({
    where: { id },
    include: { 
      class: { include: { subjects: true } },
      grades: { include: { subject: true } },
      attendance: true
    }
  });

  if (!student) {
    res.status(404).json({ message: "Student not found" });
    return;
  }

  res.json(student);
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  const { name, email, gradeLevel } = req.body as any;
  if (!name || !email || !gradeLevel) return res.status(400).json({ message: "Missing fields" });

  try {
    const student = await prisma.student.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), gradeLevel }
    });
    res.status(201).json(student);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create student" });
  }
};

export const assignClass = async (req: AuthRequest, res: Response) => {
  const { studentId } = req.params;
  const { classId } = req.body as { classId?: string };

  if (isMockMode()) {
    const student = mockStudents.find(s => s.id === studentId);
    if (student) { student.classId = classId; }
    res.json(student || { id: studentId, classId });
    return;
  }

  try {
    const student = await prisma.student.update({ where: { id: studentId }, data: { classId } });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to assign student" });
  }
};

export const getStudentPerformance = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (isMockMode()) {
    const student = mockStudents.find(s => s.id === id);
    if (!student) { res.status(404).json({ message: "Student not found" }); return; }
    res.json({
      studentId: student.id,
      name: student.name,
      className: student.class?.name || "Unassigned",
      gpa: 0,
      averageScore: 0,
      attendanceRate: 100,
      totalSubjects: 0,
      totalAbsences: 0,
      gradeBreakdown: []
    });
    return;
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: { 
        grades: { include: { subject: true } }, 
        attendance: true,
        class: true
      }
    });

    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    let totalGPA = 0;
    let subjectCount = student.grades.length;

    const gpaMap = (score: number) => {
      if (score >= 90) return 4.0;
      if (score >= 80) return 3.0;
      if (score >= 70) return 2.0;
      if (score >= 60) return 1.0;
      return 0.0;
    };

    let averageScore = 0;
    if (subjectCount > 0) {
      const totalScore = student.grades.reduce((sum, g) => sum + g.score, 0);
      averageScore = totalScore / subjectCount;
      const gpaSum = student.grades.reduce((sum, g) => sum + gpaMap(g.score), 0);
      totalGPA = gpaSum / subjectCount;
    }

    const totalDays = student.attendance.length;
    const presentDays = student.attendance.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100;

    res.json({
      studentId: student.id,
      name: student.name,
      className: student.class?.name || "Unassigned",
      gpa: Number(totalGPA.toFixed(2)),
      averageScore: Number(averageScore.toFixed(2)),
      attendanceRate: Number(attendanceRate.toFixed(2)),
      totalSubjects: subjectCount,
      totalAbsences: totalDays - presentDays,
      gradeBreakdown: student.grades.map(g => ({
        id: g.id,
        subject: g.subject.name,
        score: g.score,
        semester: g.semester
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to calculate performance" });
  }
};
