import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import assetRoutes from "./modules/assets/assets.routes";
import allocationRoutes from "./modules/allocations/allocations.routes";
import transferRoutes from "./modules/transfers/transfers.routes";
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
app.use("/api/assets", assetRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/transfers", transferRoutes);

app.use(errorHandler);

export default app;
