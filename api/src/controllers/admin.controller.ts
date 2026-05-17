import { Request, Response } from "express";
import { prisma } from "../db-check.js";
import { hashPassword, AuthRequest } from "../middleware/auth.js";
import { isMockMode, mockUsers, mockStudents, getPendingMockStudents, approveMockStudent, registerMock } from "../mock-auth.js";

export const addStaff = async (req: AuthRequest, res: Response) => {
  const { name, email, password, subjectSpecialty } = req.body as any;
  if (!name || !email || !password) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  if (isMockMode()) {
    const result = registerMock(email.trim().toLowerCase(), password, "TEACHER", name.trim(), undefined, subjectSpecialty);
    if ("error" in result) { res.status(409).json({ message: result.error }); return; }
    res.status(201).json(result);
    return;
  }

  try {
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "TEACHER",
        isApproved: true,
        teacher: { create: { name: name.trim(), subjectSpecialty: subjectSpecialty?.trim() } }
      }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to add staff" });
  }
};

export const getStaff = async (_req: Request, res: Response) => {
  if (isMockMode()) {
    const staff = mockUsers
      .filter(u => u.role === "TEACHER")
      .map(u => ({
        id: u.id, email: u.email, createdAt: u.createdAt,
        teacher: { id: `t-${u.id}`, name: u.name, subjectSpecialty: u.subjectSpecialty }
      }));
    res.json(staff);
    return;
  }
  try {
    const staff = await prisma.user.findMany({
      where: { role: "TEACHER" },
      include: { teacher: true }
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

export const getPendingStudents = async (_req: Request, res: Response) => {
  if (isMockMode()) {
    res.json(getPendingMockStudents());
    return;
  }
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT", isApproved: false },
      include: { student: true }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch pending students" });
  }
};

export const approveStudent = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (isMockMode()) {
    const result = approveMockStudent(id);
    if (!result) { res.status(404).json({ message: "Student not found" }); return; }
    res.json(result);
    return;
  }
  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isApproved: true },
      include: { student: true }
    });
    res.json({ message: "Student approved", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve student" });
  }
};
