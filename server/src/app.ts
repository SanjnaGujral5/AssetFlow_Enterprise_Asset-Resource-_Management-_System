import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);

// Future modules mount here in the same pattern:
// app.use("/api/departments", departmentRoutes);
// app.use("/api/assets", assetRoutes);
// etc.

app.use(errorHandler);

export default app;
