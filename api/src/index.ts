import express, { Request, Response } from "express";
import cors from "cors";
import { env } from "./env.js";
import { prisma } from "./db.js";
import { hashPassword, comparePassword, generateToken, authenticateToken, requireAdmin, AuthRequest } from "./auth.js";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGINS.split(",").map((value) => value.trim()),
    credentials: true
  })
);
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Auth endpoints
app.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, role = "ADMIN" } = req.body as {
    email?: string;
    password?: string;
    role?: "ADMIN" | "TEACHER";
  };

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    const token = generateToken(user.id, user.role);
    res.status(201).json({ user, token });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create user" });
  }
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error: any) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.get("/auth/me", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to get user info" });
  }
});

app.get("/students", async (_req: Request, res: Response) => {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(students);
});

app.post("/students", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name, email, gradeLevel } = req.body as {
    name?: string;
    email?: string;
    gradeLevel?: number;
  };

  // Validation
  if (!name || name.trim().length === 0) {
    res.status(400).json({ message: "Name is required" });
    return;
  }

  if (!email || !email.includes("@") || !email.includes(".")) {
    res.status(400).json({ message: "Valid email is required" });
    return;
  }

  if (typeof gradeLevel !== "number" || gradeLevel < 1 || gradeLevel > 12) {
    res.status(400).json({ message: "Grade level must be between 1 and 12" });
    return;
  }

  try {
    const student = await prisma.student.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), gradeLevel }
    });
    res.status(201).json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: "A student with this email already exists" });
    } else {
      res.status(500).json({ message: "Failed to create student" });
    }
  }
});

app.put("/students/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, gradeLevel } = req.body as {
    name?: string;
    email?: string;
    gradeLevel?: number;
  };

  // Validation
  if (name !== undefined && (name.trim().length === 0)) {
    res.status(400).json({ message: "Name cannot be empty" });
    return;
  }

  if (email !== undefined && (!email.includes("@") || !email.includes("."))) {
    res.status(400).json({ message: "Valid email is required" });
    return;
  }

  if (gradeLevel !== undefined && (typeof gradeLevel !== "number" || gradeLevel < 1 || gradeLevel > 12)) {
    res.status(400).json({ message: "Grade level must be between 1 and 12" });
    return;
  }

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (gradeLevel !== undefined) updateData.gradeLevel = gradeLevel;

    const student = await prisma.student.update({
      where: { id },
      data: updateData
    });
    res.json(student);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: "Student not found" });
    } else if (error.code === 'P2002') {
      res.status(409).json({ message: "A student with this email already exists" });
    } else {
      res.status(500).json({ message: "Failed to update student" });
    }
  }
});

app.delete("/students/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.student.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: "Student not found" });
    } else {
      res.status(500).json({ message: "Failed to delete student" });
    }
  }
});

// Classes endpoints
app.get("/classes", async (_req: Request, res: Response) => {
  const classes = await prisma.class.findMany({
    include: {
      students: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  res.json(classes);
});

app.post("/classes", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { name, gradeLevel, academicYear } = req.body as {
    name?: string;
    gradeLevel?: number;
    academicYear?: string;
  };

  // Validation
  if (!name || name.trim().length === 0) {
    res.status(400).json({ message: "Class name is required" });
    return;
  }

  if (typeof gradeLevel !== "number" || gradeLevel < 1 || gradeLevel > 12) {
    res.status(400).json({ message: "Grade level must be between 1 and 12" });
    return;
  }

  if (!academicYear || academicYear.trim().length === 0) {
    res.status(400).json({ message: "Academic year is required" });
    return;
  }

  try {
    const newClass = await prisma.class.create({
      data: { 
        name: name.trim(), 
        gradeLevel, 
        academicYear: academicYear.trim() 
      },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.status(201).json(newClass);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create class" });
  }
});

app.put("/classes/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, gradeLevel, academicYear } = req.body as {
    name?: string;
    gradeLevel?: number;
    academicYear?: string;
  };

  // Validation
  if (name !== undefined && name.trim().length === 0) {
    res.status(400).json({ message: "Class name cannot be empty" });
    return;
  }

  if (gradeLevel !== undefined && (typeof gradeLevel !== "number" || gradeLevel < 1 || gradeLevel > 12)) {
    res.status(400).json({ message: "Grade level must be between 1 and 12" });
    return;
  }

  if (academicYear !== undefined && academicYear.trim().length === 0) {
    res.status(400).json({ message: "Academic year cannot be empty" });
    return;
  }

  try {
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (gradeLevel !== undefined) updateData.gradeLevel = gradeLevel;
    if (academicYear !== undefined) updateData.academicYear = academicYear.trim();

    const updatedClass = await prisma.class.update({
      where: { id },
      data: updateData,
      include: {
        students: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(updatedClass);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: "Class not found" });
    } else {
      res.status(500).json({ message: "Failed to update class" });
    }
  }
});

app.delete("/classes/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.class.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: "Class not found" });
    } else {
      res.status(500).json({ message: "Failed to delete class" });
    }
  }
});

// Assign student to class
app.put("/students/:studentId/class", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { studentId } = req.params;
  const { classId } = req.body as { classId?: string };

  if (!classId) {
    res.status(400).json({ message: "Class ID is required" });
    return;
  }

  try {
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { classId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
            academicYear: true
          }
        }
      }
    });
    res.json(student);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: "Student or class not found" });
    } else {
      res.status(500).json({ message: "Failed to assign student to class" });
    }
  }
});

// Remove student from class
app.delete("/students/:studentId/class", authenticateToken, async (req: AuthRequest, res: Response) => {
  const { studentId } = req.params;

  try {
    const student = await prisma.student.update({
      where: { id: studentId },
      data: { classId: null }
    });
    res.json(student);
  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({ message: "Student not found" });
    } else {
      res.status(500).json({ message: "Failed to remove student from class" });
    }
  }
});

app.listen(env.PORT, () => {
  console.log(`API running at http://localhost:${env.PORT}`);
});
