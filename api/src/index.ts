import express, { Request, Response } from "express";
import cors from "cors";
import { env } from "./env.js";
import { checkDatabaseConnection } from "./db-check.js";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import studentRoutes from "./routes/student.routes.js";
import classRoutes from "./routes/class.routes.js";
import academicRoutes from "./routes/academic.routes.js";

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

// Use Modular Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/students", studentRoutes);
app.use("/classes", classRoutes);
app.use("/", academicRoutes); // /grades and /attendance

// Check database connection before starting
const startServer = async () => {
  try {
    const dbConnected = await checkDatabaseConnection();
    if (dbConnected) {
      console.log("✅ Database connected successfully");
    } else {
      console.log("⚠️  Database connection failed - running in demo mode");
    }
    
    app.listen(env.PORT, () => {
      console.log(`🚀 API running at http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
