import { Request, Response } from "express";
import { prisma } from "../db-check.js";
import { hashPassword, comparePassword, generateToken, AuthRequest } from "../middleware/auth.js";
import { authenticateMock, registerMock, isMockMode, mockUsers } from "../mock-auth.js";

export const register = async (req: Request, res: Response) => {
  const { email, password, role = "STUDENT", name, gradeLevel, subjectSpecialty } = req.body as any;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  // --- MOCK MODE FALLBACK (no database) ---
  if (isMockMode()) {
    if (!name) {
      res.status(400).json({ message: "Name is required" });
      return;
    }
    if (role === "STUDENT" && !gradeLevel) {
      res.status(400).json({ message: "Grade level is required for students" });
      return;
    }
    const result = registerMock(
      email.trim().toLowerCase(),
      password,
      role,
      name.trim(),
      gradeLevel ? Number(gradeLevel) : undefined,
      subjectSpecialty
    );
    if ("error" in result) {
      res.status(409).json({ message: result.error });
      return;
    }
    if (role === "STUDENT") {
      res.status(201).json({ message: result.message });
    } else {
      res.status(201).json(result);
    }
    return;
  }

  // --- REAL DATABASE ---
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    
    let userData: any = {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role
    };

    if (role === "STUDENT") {
      if (!name || !gradeLevel) {
        res.status(400).json({ message: "Name and gradeLevel are required for students" });
        return;
      }
      userData.isApproved = false;
      userData.student = {
        create: { name: name.trim(), email: email.trim().toLowerCase(), gradeLevel: Number(gradeLevel) }
      };
    } else if (role === "TEACHER") {
      if (!name) {
        res.status(400).json({ message: "Name is required for teachers" });
        return;
      }
      userData.isApproved = true;
      userData.teacher = {
        create: { name: name.trim(), subjectSpecialty: subjectSpecialty?.trim() }
      };
    } else {
      userData.isApproved = true;
    }

    const user = await prisma.user.create({
      data: userData,
      include: { student: true, teacher: true }
    });

    if (role === "STUDENT") {
      res.status(201).json({ message: "Registration submitted. Waiting for admin approval." });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.status(201).json({ user: { id: user.id, email: user.email, role: user.role }, token });
  } catch (error: any) {
    console.error("Register error:", error);
    // Last-resort mock fallback
    if (name) {
      const result = registerMock(
        email.trim().toLowerCase(),
        password,
        role,
        name.trim(),
        gradeLevel ? Number(gradeLevel) : undefined,
        subjectSpecialty
      );
      if ("error" in result) {
        res.status(409).json({ message: result.error });
        return;
      }
      if (role === "STUDENT") {
        res.status(201).json({ message: result.message });
      } else {
        res.status(201).json(result);
      }
      return;
    }
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as any;

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  // --- MOCK MODE FALLBACK ---
  if (isMockMode()) {
    const result = authenticateMock(email.trim().toLowerCase(), password);
    if (!result) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    if ("error" in result) {
      res.status(403).json({ message: result.error });
      return;
    }
    res.json(result);
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { student: true, teacher: true }
    });

    if (!user) {
      const mockResult = authenticateMock(email.trim().toLowerCase(), password);
      if (mockResult && !("error" in mockResult)) { res.json(mockResult); return; }
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.isApproved) {
      res.status(403).json({ message: "Account pending admin approval." });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        studentId: user.student?.id,
        teacherId: user.teacher?.id
      },
      token
    });
  } catch (error: any) {
    console.log("Database error, falling back to mock auth");
    const mockResult = authenticateMock(email.trim().toLowerCase(), password);
    if (mockResult && !("error" in mockResult)) { res.json(mockResult); return; }
    res.status(500).json({ message: "Login failed" });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  // Mock mode: decode from mock users
  if (isMockMode()) {
    const userId = req.user?.userId;
    const mockUser = mockUsers.find(u => u.id === userId);
    if (mockUser) {
      res.json({ id: mockUser.id, email: mockUser.email, role: mockUser.role, studentId: mockUser.studentId });
      return;
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { student: true }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      studentId: user.student?.id
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to get user info" });
  }
};
