import express, { Request, Response } from "express";
import cors from "cors";
import { env } from "./env.js";
import { prisma } from "./db.js";

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

app.get("/students", async (_req: Request, res: Response) => {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(students);
});

app.post("/students", async (req: Request, res: Response) => {
  const { name, email, gradeLevel } = req.body as {
    name?: string;
    email?: string;
    gradeLevel?: number;
  };

  if (!name || !email || typeof gradeLevel !== "number") {
    res.status(400).json({ message: "name, email, gradeLevel are required" });
    return;
  }

  const student = await prisma.student.create({
    data: { name, email, gradeLevel }
  });

  res.status(201).json(student);
});

app.listen(env.PORT, () => {
  console.log(`API running at http://localhost:${env.PORT}`);
});
