import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import assetRoutes from "./modules/asset/asset.routes";
import categoryRoutes from "./modules/category/category.routes";
import allocationRoutes from "./modules/allocation/allocation.routes";
import transferRoutes from "./modules/transfer/transfer.routes";
import userRoutes from "./modules/user/user.routes";
import bookingRoutes from "./modules/booking/booking.routes";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes";
import auditRoutes from "./modules/audit/audit.routes";
import reportRoutes from "./modules/report/report.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import departmentRoutes from "./modules/department/department.routes";
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
app.use("/api/categories", categoryRoutes);
app.use("/api/allocations", allocationRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/departments", departmentRoutes);

app.use(errorHandler);

export default app;

